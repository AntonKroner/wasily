export class ProcessExit extends Error {
	code: number
	constructor(code: number) {
		super(`proc_exit=${code}`)
		this.code = code
		Object.setPrototypeOf(this, ProcessExit.prototype)
	}
}
export namespace ProcessExit {}
