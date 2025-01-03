/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-empty-function */

export interface FileDescriptor {
	writev(iovs: Array<Uint8Array>): number
	readv(iovs: Array<Uint8Array>): number
	close(): void
	preRun(): Promise<void>
	postRun(): Promise<void>
}
class DevNull implements FileDescriptor {
	writev(iovs: Array<Uint8Array>): number {
		return iovs.map(iov => iov.byteLength).reduce((prev, curr) => prev + curr)
	}
	readv(iovs: Array<Uint8Array>): number {
		return 0
	}
	close(): void {}
	async preRun(): Promise<void> {}
	async postRun(): Promise<void> {}
}
class ReadableStreamBase {
	writev(iovs: Array<Uint8Array>): number {
		throw new Error("Attempting to call write on a readable stream")
	}
	close(): void {}
	async preRun(): Promise<void> {}
	async postRun(): Promise<void> {}
}
class WritableStreamBase {
	readv(iovs: Array<Uint8Array>): number {
		throw new Error("Attempting to call read on a writable stream")
	}
	close(): void {}
	async preRun(): Promise<void> {}
	async postRun(): Promise<void> {}
}

class SyncWritableStreamAdapter extends WritableStreamBase implements FileDescriptor {
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

class SyncReadableStreamAdapter extends ReadableStreamBase implements FileDescriptor {
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
export namespace FileDescriptor {
	export function fromReadableStream(stream?: ReadableStream): FileDescriptor {
		return stream ? new SyncReadableStreamAdapter(stream.getReader()) : new DevNull()
	}
	export function fromWritableStream(stream?: WritableStream): FileDescriptor {
		return stream ? new SyncWritableStreamAdapter(stream.getWriter()) : new DevNull()
	}
}
