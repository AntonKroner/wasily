import { FileDescriptor } from "./FileDescriptor"

export class DevNull implements FileDescriptor {
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
export namespace DevNull {}
