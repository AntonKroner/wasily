export class Base {
	readv(iovs: Array<Uint8Array>): number {
		throw new Error("Attempting to call read on a writable stream")
	}
	close(): void {}
	async preRun(): Promise<void> {}
	async postRun(): Promise<void> {}
}
