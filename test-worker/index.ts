// import * as utility from "@tybys/wasm-util"
import { Environment } from "./Environment"
import main from "./main.wasm"

export default {
	async fetch(request: Request, environment: Environment, execution: ExecutionContext) {
		await environment.kvStore.put("asdf", "asdf asdf asdf")
		const instance = new WebAssembly.Instance(main, {
			env: {
				console_log(message: number): number {
					const decoder = new TextDecoder()
					const buffer = new Uint8Array((instance.exports.memory as WebAssembly.Memory).buffer)
					const data = decoder.decode(buffer.subarray(message, buffer.indexOf(0, message)))
					console.log(data)
					return 0
				},
				async kv_get(key: number, value: number): Promise<number> {
					const decoder = new TextDecoder()
					const encoder = new TextEncoder()
					const buffer = new Uint8Array((instance.exports.memory as WebAssembly.Memory).buffer)
					const data =
						(await environment.kvStore.get(decoder.decode(buffer.subarray(key, buffer.indexOf(0, key))))) ?? undefined
					buffer.set(encoder.encode(data), value)
					return 0
				},
			},
		})
		if (instance.exports._start && typeof instance.exports._start == "function")
			await instance.exports._start()
		return new Response("success")
	},
}
