// import * as utility from "@tybys/wasm-util"
import { wasily } from "wasily"
import { Environment } from "./Environment"
import main from "./main.wasm"

export default {
	async fetch(request: Request, environment: Environment, execution: ExecutionContext) {
		// console.log(1)
		// await environment.kvStore.put("asdf", "asdf asdf asdf")
		// console.log(2)
		// const options: wasily.WASI.Options = {}
		// console.log(3)
		// const wasi = new wasily.WASI(options)
		// console.log("import: ", wasi.wasiImport)
		// console.log(4)
		// const instance = new WebAssembly.Instance(main, {
		// 	wasi_snapshot_preview1: wasi.wasiImport,
		// 	env: {
		// 		console_log(message: number): number {
		// 			const decoder = new TextDecoder()
		// 			const buffer = new Uint8Array((instance.exports.memory as WebAssembly.Memory).buffer)
		// 			const data = decoder.decode(buffer.subarray(message, buffer.indexOf(0, message)))
		// 			console.log(data)
		// 			return 0
		// 		},
		// 	},
		// })
		// console.log(5)
		// const result = await wasi.start(instance)
		// console.log("result: ", result)

		// 	{
		// 	env: {
		// 		console_log(message: number): number {
		// 			const decoder = new TextDecoder()
		// 			const buffer = new Uint8Array((instance.exports.memory as WebAssembly.Memory).buffer)
		// 			const data = decoder.decode(buffer.subarray(message, buffer.indexOf(0, message)))
		// 			console.log(data)
		// 			return 0
		// 		},
		// 		async kv_get(key: number, value: number): Promise<number> {
		// 			const decoder = new TextDecoder()
		// 			const encoder = new TextEncoder()
		// 			const buffer = new Uint8Array((instance.exports.memory as WebAssembly.Memory).buffer)
		// 			const data =
		// 				(await environment.kvStore.get(decoder.decode(buffer.subarray(key, buffer.indexOf(0, key))))) ?? undefined
		// 			buffer.set(encoder.encode(data), value)
		// 			return 0
		// 		},
		// 	},
		// })
		// if (instance.exports._start && typeof instance.exports._start == "function")
		// 	await instance.exports._start()
		// return new Response("success")

		const argument = [...request.headers.entries()].reduce<string[]>(
			(result, [key, value]) => {
				result.push(`--${key}`)
				result.push(value)
				return result
			},
			[request.url, "--method", request.method]
		)
		const instance = wasily.Instance.open(main, {
			arguments: argument,
			default: { env: true },
			imports: { worker: new wasily.Imports.Worker(environment as any) },
			environment: Environment.toRecord(environment),
			input: request.body ?? undefined,
		})
		const result = await instance.run()
		execution.waitUntil(decode(result.error).then(er => er.length && console.log("error: ", er)))
		// const text = await decode(result.out)
		// console.log("aaaa: ", text)
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
