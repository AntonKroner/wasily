import { FileDescriptor } from "../FileDescriptor"
import { Base } from "./Base"

export class Sync extends Base implements FileDescriptor {
	#writer: WritableStreamDefaultWriter
	#buffer: Uint8Array = new Uint8Array(4096)
	#bytesWritten = 0
	constructor(writer: WritableStreamDefaultWriter) {
		super()
		this.#writer = writer
	}

	writev(iovs: Array<Uint8Array>): number {
		let written = 0
		for (const iov of iovs) {
			if (iov.byteLength === 0) {
				continue
			}
			// Check if we're about to overflow the buffer and resize if need be.
			const requiredCapacity = this.#bytesWritten + iov.byteLength
			if (requiredCapacity > this.#buffer.byteLength) {
				let desiredCapacity = this.#buffer.byteLength
				while (desiredCapacity < requiredCapacity)
					desiredCapacity *= 1.5
				const oldBuffer = this.#buffer
				this.#buffer = new Uint8Array(desiredCapacity)
				this.#buffer.set(oldBuffer)
			}
			this.#buffer.set(iov, this.#bytesWritten)
			written += iov.byteLength
			this.#bytesWritten += iov.byteLength
		}
		return written
	}

	override async postRun(): Promise<void> {
		const slice = this.#buffer.subarray(0, this.#bytesWritten)
		this.#writer.write(slice)
		this.#writer.close()
	}
}
export namespace Sync {}
