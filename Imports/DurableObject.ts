import * as platform from "@cloudflare/workers-types"
import { bool } from "./bool"
import { Imports } from "./Imports"

export class DurableObject<
	Environment extends Record<string, undefined | string | platform.KVNamespace | platform.DurableObjectNamespace>
> extends Imports {
	constructor(private readonly state: platform.DurableObjectState, private readonly environment: Environment) {
		super()
	}

	open(): Record<string, (...args: any[]) => number | Promise<number>> {
		const result: Record<string, (...args: any[]) => number | Promise<number>> = {
			State_id: this.#State_id.bind(this),
			State_Storage_put: this.#State_Storage_put.bind(this),
			State_Storage_get: this.#State_Storage_get.bind(this),
			State_Storage_list: this.#State_Storage_list.bind(this),
			State_Storage_delete: this.#State_Storage_delete.bind(this),
		}
		return result
	}
	#State_id(id: number) {
		return this.writeAtCharPointer(id, this.state.id.toString()), 0
	}
	async #State_Storage_put(key: number, value: number, size: number) {
		const buffer = new Uint8Array(this.buffer)
		return await this.state.storage.put(this.fromCharPointer(key), buffer.subarray(value, value + size)), 0
	}
	async #State_Storage_get(key: number, value: number): Promise<bool> {
		const buffer = new Uint8Array(this.buffer)
		const result = await this.state.storage.get<ArrayBuffer>(this.fromCharPointer(key))
		return !result ? 0 : (buffer.set(new Uint8Array(result), value), 1)
	}
	async #State_Storage_list(limit: number, values: number, prefix: number): Promise<number> {
		const buffer = new Uint8Array(this.buffer)
		const result = await this.state.storage.list<ArrayBuffer>({
			prefix: prefix ? this.fromCharPointer(prefix) : undefined,
			limit,
		})
		let offset: number = 0
		for (const value of result.values()) {
			buffer.set(new Uint8Array(value), this.view().getUint32(values + offset, true))
			offset += 4
		}
		return result.size
	}
	async #State_Storage_delete(key: number): Promise<bool> {
		return !(await this.state.storage.delete(this.fromCharPointer(key))) ? 0 : 1
	}
}
