import { wasily } from "wasily"
import { Environment } from "./Environment"
import main from "./main.wasm"

export default {
	async fetch(request: Request, environment: Environment, execution: ExecutionContext) {
		// const a = (WebAssembly as any).Suspending //(() => 0)
		// console.log({ a })
		// console.log({ "typeof a": typeof a })
		// const suspending = Object.getOwnPropertyDescriptors(a)
		// console.log({ suspending })

		// const b = (WebAssembly as any).promising //(() => 0)
		// console.log({ b })
		// console.log({ "typeof b": typeof b })
		// const promising = Object.getOwnPropertyDescriptors(b)
		// console.log({ promising })

		// const wasm = Object.getOwnPropertyDescriptors(WebAssembly)
		// console.log({ wasm })
		console.log("request.url: ", request.url)
		const argument = [...request.headers.entries()].reduce<string[]>(
			(result, [key, value]) => {
				result.push(`--${key}`, value)
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
		const result = instance.run()
		// execution.waitUntil(decode(result.error).then(e => e.length && console.log("error: ", e)))
		const { readable, writable } = new TransformStream<string, string>({
			transform(chunk, controller) {
				// console.log({ chunk })
				controller.enqueue(chunk)
			},
		})
		// const encoder = new TextEncoder()
		// const items = ["a", "b", "c"]
		// const result = new ReadableStream<Uint8Array>({
		// 	async start(controller) {
		// 		for (const item of items) {
		// 			const encoded = encoder.encode(item)
		// 			console.log({ encoded })
		// 			encoded.byteLength && controller.enqueue(encoded)
		// 			await new Promise(resolve => setTimeout(resolve, 1000))
		// 		}
		// 		controller.close()
		// 	},
		// })
		result.out.pipeThrough(new TextDecoderStream()).pipeTo(writable)
		return new Response(readable.pipeThrough(new TextEncoderStream()), {
			headers: { "content-type": "json+stream" },
			status: 200,
		})
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
export function logify(value: any): void {
	for (const m in value) {
		console.log(m)
	}
}
