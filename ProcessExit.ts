export class ProcessExit extends Error {
	constructor(public code: number) {
		super(`proc_exit=${code}`)
		Object.setPrototypeOf(this, ProcessExit.prototype)
	}
}
export namespace ProcessExit {}
