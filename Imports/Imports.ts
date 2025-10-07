import * as platform from "@cloudflare/workers-types"

export abstract class Imports {
	#memory?: platform.WebAssembly.Memory
	set memory(memory: platform.WebAssembly.Memory) {
		this.#memory = memory
	}
	protected get buffer(): ArrayBuffer {
		if (!this.#memory)
			throw new Error("Buffer get.")
		return this.#memory.buffer
	}
	protected view(): DataView {
		if (!this.#memory)
			throw new Error("view()")
		return new DataView(this.#memory.buffer)
	}
	#decoder?: TextDecoder
	protected get decoder(): TextDecoder {
		return (this.#decoder ??= new TextDecoder())
	}
	#encoder?: TextEncoder
	protected get encoder(): TextEncoder {
		return (this.#encoder ??= new TextEncoder())
	}
	#exports?: WebAssembly.Exports
	set exports(exports: WebAssembly.Exports) {
		this.#exports = exports
	}
	get exports(): WebAssembly.Exports {
		if (!this.#exports)
			throw new Error("exports unset")
		return this.#exports
	}

	fromCharPointer(pointer: number): string {
		const buffer = new Uint8Array(this.buffer)
		return this.decoder.decode(buffer.subarray(pointer, buffer.indexOf(0, pointer)))
	}
	writeAtCharPointer(pointer: number, data: string) {
		const buffer = new Uint8Array(this.buffer)
		buffer.set(this.encoder.encode(`${data}\0`), pointer)
	}
	abstract open(): Record<string, WebAssembly.Suspending | ((...args: any[]) => number)>
}
