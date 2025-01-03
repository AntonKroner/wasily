// import * as utility from "@tybys/wasm-util"
import { wasily } from "wasily"
import { Environment } from "./Environment"
import main from "./main.wasm"

export default {
	async fetch(request: Request, environment: Environment, execution: ExecutionContext) {
		const argument = [...request.headers.entries()].reduce<string[]>(
			(result, [key, value]) => {
				result.push(`--${key}`)
				result.push(value)
				return result
			},
			[request.url, "--method", request.method]
		)
		const wasi = new wasily.Imports.Wasi({
			args: argument,
			env: Environment.toRecord(environment),
			streamStdio: true,
			returnOnExit: true,
		})
		const instance = wasily.Instance.open(main, {
			arguments: argument,
			default: { env: true },
			imports: { worker: new wasily.Imports.Worker(environment as any), wasi },
			environment: Environment.toRecord(environment),
			input: request.body ?? undefined,
		})
		const result = await instance.run()
		execution.waitUntil(decode(result.error).then(er => er.length && console.log("error: ", er)))
		return new Response(result.out)
	},
}
export async function decode(stream: ReadableStream<Uint8Array>): Promise<string> {
	let result: string = ""
	const decoder = new TextDecoder()
	const reader = stream.getReader()
	let read: ReadableStreamReadResult<Uint8Array>
	while (!(read = await reader.read()).done)
		result += decoder.decode(read.value)
	return result
}
