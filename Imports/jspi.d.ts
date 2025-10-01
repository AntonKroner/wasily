// export { WebAssembly } from "@cloudflare/workers-types"

declare namespace WebAssembly {
	class Suspending {
		readonly name = "Suspending"
		constructor(asyncFunction: (...args: any[]) => Promise<any>)
	}
	function promising(asdf: (...args: any[]) => any): (...args: any[]) => Promise<any>
}
