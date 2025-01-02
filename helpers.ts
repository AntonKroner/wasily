// eslint-disable-next-line @typescript-eslint/ban-types
const wrapFunc = (name: string, f: Function, log: (data: string) => void) => {
	return function (...args: any[]) {
		try {
			// eslint-disable-next-line prefer-spread
			const result = f.apply(undefined, args)
			log(`${name}(${args.join(", ")}) = ${result}`)
			return result
		} catch (e) {
			log(`${name}(${args.join(", ")}) = Error(${e})`)
			throw e
		}
	}
}

/**
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export const traceImportsToConsole = (imports: Record<string, Function>): Record<string, Function> => {
	for (const key in imports) {
		imports[key] = wrapFunc(key, imports[key]!, console.log)
	}
	return imports
}
