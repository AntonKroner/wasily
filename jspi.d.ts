declare namespace WebAssembly {
	class Suspending extends Function {
		readonly name = "Suspending"
		constructor(asyncFunction: (...args: any[]) => any)
	}
	function promising(exportFunction: (...args: any[]) => any): (...args: any[]) => Promise<any>
}
