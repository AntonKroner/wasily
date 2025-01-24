export interface FileDescriptor {
	writev(iovs: Array<Uint8Array>): number
	readv(iovs: Array<Uint8Array>): number
	close(): void
	preRun(): Promise<void>
	postRun(): Promise<void>
}
export namespace FileDescriptor {}
