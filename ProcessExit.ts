/*** ProcessExit is thrown when `proc_exit` is called* @public*/
export class ProcessExit extends Error {
	/*** The exit code passed to `proc_exit` */
	code: number
	constructor(code: number) {
		super(`proc_exit=${code}`)
		this.code = code
		// https://github.com/Microsoft/TypeScript-wiki/blob/main/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
		Object.setPrototypeOf(this, ProcessExit.prototype)
	}
}
export namespace ProcessExit {}
