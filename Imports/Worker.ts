import * as platform from "@cloudflare/workers-types"
import { bool } from "./bool"
import { Imports } from "./Imports"
import { Loop } from "./Loop"
import { Method } from "./Method"

export class Worker<
	Environment extends Record<string, undefined | string | platform.KVNamespace | platform.DurableObjectNamespace>
> extends Imports {
	constructor(private readonly environment: Environment) {
		super()
	}

	open(): Record<string, WebAssembly.Suspending | ((...args: any[]) => number)> {
		const result: ReturnType<Imports["open"]> = {
			log: this.#log.bind(this),
			logNumber: this.#logNumber.bind(this),
			random: this.#random.bind(this),
			sleep: new WebAssembly.Suspending(this.#sleep.bind(this)),
			loop: this.#loop.bind(this),
			KVNamespace_getText: new WebAssembly.Suspending(this.#KVNamespace_getText.bind(this)),
			KVNamespace_getArrayBuffer: new WebAssembly.Suspending(this.#KVNamespace_getArrayBuffer.bind(this)),
			KVNamespace_putText: new WebAssembly.Suspending(this.#KVNamespace_putText.bind(this)),
			KVNamespace_putArrayBuffer: new WebAssembly.Suspending(this.#KVNamespace_putArrayBuffer.bind(this)),
			KVNamespace_list: new WebAssembly.Suspending(this.#KVNamespace_list.bind(this)),
			KVNamespace_delete: new WebAssembly.Suspending(this.#KVNamespace_delete.bind(this)),
			DurableObject_Namespace_idFromName: this.#DurableObject_Namespace_idFromName.bind(this),
			DurableObject_Namespace_newUniqueId: this.#DurableObject_Namespace_newUniqueId.bind(this),
			DurableObject_Stub_fetch: new WebAssembly.Suspending(this.#DurableObject_Stub_fetch.bind(this)),
		}
		return result
	}
	#log(message: number): number {
		return console.log("worker.log: ", this.fromCharPointer(message)), 0
	}
	#logNumber(number: number): number {
		return console.log("worker.logNumber: ", number), 0
	}
	#random(): number {
		return Math.random()
	}
	async #sleep(delay: number): Promise<number> {
		return await new Promise(resolve => setTimeout(resolve, delay))
	}
	private openKVNamespace(namespace: number): platform.KVNamespace | undefined {
		const result = this.environment[this.fromCharPointer(namespace)]
		return !(typeof result == "object" && "getWithMetadata" in result) ? undefined : result
	}
	async #KVNamespace_getText(namespace: number, key: number, value: number): Promise<bool> {
		let result: bool = 0
		let data: string | undefined | null
		if ((data = await this.openKVNamespace(namespace)?.get(this.fromCharPointer(key), "text"))) {
			this.writeAtCharPointer(value, data)
			result = 1
		}
		return result
	}
	async #KVNamespace_getArrayBuffer(namespace: number, key: number, value: number): Promise<bool> {
		let result: bool = 0
		let data: ArrayBuffer | undefined | null
		if ((data = await this.openKVNamespace(namespace)?.get(this.fromCharPointer(key), "arrayBuffer"))) {
			const buffer = new Uint8Array(this.buffer)
			buffer.set(new Uint8Array(data), value)
			result = 1
		}
		return result
	}
	async #KVNamespace_putText(namespace: number, key: number, value: number): Promise<bool> {
		const kvNamespace = this.openKVNamespace(namespace)
		return !kvNamespace ? 0 : (await kvNamespace.put(this.fromCharPointer(key), this.fromCharPointer(value)), 1)
	}
	async #KVNamespace_putArrayBuffer(namespace: number, key: number, value: number, size: number): Promise<bool> {
		let result: bool = 0
		const kvNamespace = this.openKVNamespace(namespace)
		if (kvNamespace) {
			const buffer = new Uint8Array(this.buffer)
			await kvNamespace.put(this.fromCharPointer(key), buffer.subarray(value, value + size))
			result = 1
		}
		return result
	}
	async #KVNamespace_list(
		namespace: number,
		limit: number,
		keys: number,
		prefix: number,
		cursor: number
	): Promise<number> {
		let result: number = 0
		const kvNamespace = this.openKVNamespace(namespace)
		if (kvNamespace) {
			const list = await kvNamespace.list({
				limit,
				prefix: prefix ? this.fromCharPointer(prefix) : undefined,
				cursor: cursor ? this.fromCharPointer(cursor) : undefined,
			})
			let offset: number = 0
			for (const key of list.keys) {
				this.writeAtCharPointer(this.view().getUint32(keys + offset, true), key.name)
				offset += 4
			}
			result = list.keys.length
		}
		return result
	}
	async #KVNamespace_delete(namespace: number, key: number): Promise<bool> {
		const kvNamespace = this.openKVNamespace(namespace)
		return !kvNamespace ? 0 : (await kvNamespace.delete(this.fromCharPointer(key)), 1)
	}
	private openDurableObjectNamespace(namespace: number): platform.DurableObjectNamespace | undefined {
		const result = this.environment[this.fromCharPointer(namespace)]
		return !(typeof result == "object" && "idFromName" in result) ? undefined : result
	}
	#DurableObject_Namespace_idFromName(namespace: number, name: number, id: number): bool {
		const newId = this.openDurableObjectNamespace(namespace)?.idFromName(this.fromCharPointer(name)).toString()
		return !newId ? 0 : (this.writeAtCharPointer(id, newId), 1)
	}
	#DurableObject_Namespace_newUniqueId(namespace: number, id: number): bool {
		const newId = this.openDurableObjectNamespace(namespace)?.newUniqueId().toString()
		return !newId ? 0 : (this.writeAtCharPointer(id, newId), 1)
	}
	async #DurableObject_Stub_fetch(
		namespace: number,
		id: number,
		url: number,
		method: number,
		body: number,
		size: number,
		response: number
	): Promise<bool> {
		let result: bool
		const durableObjectNamespace = this.openDurableObjectNamespace(namespace)
		if (!durableObjectNamespace)
			result = 0
		else {
			const stub = durableObjectNamespace.get(durableObjectNamespace.idFromString(this.fromCharPointer(id)))
			const buffer = new Uint8Array(this.buffer)
			const response2 = await stub.fetch(this.fromCharPointer(url), {
				method: Method.methods[method],
				body: buffer.subarray(body, body + size),
			})
			// console.log("DurableObject_Stub_fetch response: ", response)
			// if (response.headers.get("content-type")?.includes("text/plain")) {
			const body2 = await response2.text()
			console.log("DurableObject_Stub_fetch response.body2: ", body2)
			// }
			result = 1
		}
		return result
	}
	#loop(func: number, arg: number, fps: number, infinite: number): 0 {
		let iterator: () => void
		if (!(this.exports["__indirect_function_table"] instanceof WebAssembly.Table))
			throw new Error("__indirect_function_table not fond in exports")
		else if (typeof (iterator = this.exports["__indirect_function_table"].get(func)) != "function")
			throw new Error(`function index ${func} was not found in the table`)
		else
			Loop.set(iterator, fps, infinite, arg)
		return 0
	}
}
export namespace Worker {}
