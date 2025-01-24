import { FileDescriptor } from "../FileDescriptor"
import { Base } from "./Base"

export class Sync extends Base implements FileDescriptor {
	#buffer?: Uint8Array
	#reader: ReadableStreamDefaultReader
	constructor(reader: ReadableStreamDefaultReader) {
		super()
		this.#reader = reader
	}

	readv(iovs: Array<Uint8Array>): number {
		let read = 0
		for (const iov of iovs) {
			const bytes = Math.min(iov.byteLength, this.#buffer?.byteLength ?? 0)
			if (bytes <= 0)
				break
			iov.set(this.#buffer!.subarray(0, bytes))
			this.#buffer = this.#buffer!.subarray(bytes)
			read += bytes
		}
		return read
	}
	override async preRun(): Promise<void> {
		const pending: Array<Uint8Array> = []
		let length = 0
		let read: ReadableStreamReadResult<Uint8Array>
		while (!(read = await this.#reader.read()).done) {
			const data = read.value
			pending.push(data)
			length += data.length
		}
		const result = new Uint8Array(length)
		let offset = 0
		pending.forEach(item => {
			result.set(item, offset)
			offset += item.length
		})
		this.#buffer = result
	}
}
export namespace Sync {}
