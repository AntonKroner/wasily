export class Base {
	writev(iovs: Array<Uint8Array>): number {
		throw new Error("Attempting to call write on a readable stream")
	}
	close(): void {}
	async preRun(): Promise<void> {}
	async postRun(): Promise<void> {}
}
