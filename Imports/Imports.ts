import * as platform from "@cloudflare/workers-types"

export abstract class Imports {
	#memory?: platform.WebAssembly.Memory
	set memory(memory: platform.WebAssembly.Memory) {
		this.#memory = memory
	}
	protected get buffer(): ArrayBuffer {
		return this.#memory
			? this.#memory.buffer
			: (() => {
					throw new Error("Buffer get.")
			  })()
	}
	protected view(): DataView {
		return this.#memory
			? new DataView(this.#memory.buffer)
			: (() => {
					throw new Error("view()")
			  })()
	}
	#decoder?: platform.TextDecoder
	protected get decoder(): platform.TextDecoder {
		return (this.#decoder ??= new platform.TextDecoder())
	}
	#encoder?: platform.TextEncoder
	protected get encoder(): platform.TextEncoder {
		return (this.#encoder ??= new platform.TextEncoder())
	}

	fromCharPointer(pointer: number): string {
		const buffer = new Uint8Array(this.buffer)
		return this.decoder.decode(buffer.subarray(pointer, buffer.indexOf(0, pointer)))
	}
	writeAtCharPointer(pointer: number, data: string) {
		const buffer = new Uint8Array(this.buffer)
		buffer.set(this.encoder.encode(`${data}\0`), pointer)
	}
	abstract open(): Record<string, (...args: any[]) => number | Promise<number>>
}