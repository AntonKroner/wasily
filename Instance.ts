// import * as platform from "@cloudflare/workers-types"
import * as utility from "@tybys/wasm-util"
import { FileDescriptor } from "./FileDescriptor"
import { Imports } from "./Imports"
import { ProcessExit } from "./ProcessExit"

export class Instance {
	readonly exports: Record<string, (...args: any[]) => number | Promise<number>> = {}
	#asyncifiedInstance: WebAssembly.Instance
	#imports: Record<string, Imports> = {}
	#stdout: TransformStream = new TransformStream()
	#stderr: TransformStream = new TransformStream()
	#streams: FileDescriptor[] = [
		FileDescriptor.fromReadableStream(),
		FileDescriptor.fromWritableStream(this.#stdout.writable),
		FileDescriptor.fromWritableStream(this.#stderr.writable),
	]
	set input(stream: ReadableStream) {
		this.#streams[0] = FileDescriptor.fromReadableStream(stream)
	}
	get instance(): WebAssembly.Instance {
		return this.#asyncifiedInstance
	}
	private constructor(module: WebAssembly.Module, options?: Partial<Instance.Options>) {
		console.log("exports: ", WebAssembly.Module.exports(module))
		console.log("imports: ", WebAssembly.Module.imports(module))

		options?.imports && (this.#imports = options?.imports)
		options?.default?.env && (this.#imports["env"] = new Imports.Env())
		options?.input && (this.input = options.input)

		const wasi = new Imports.Wasi({
			args: options?.arguments,
			env: options?.environment,
			streamStdio: true,
			returnOnExit: true,
		})
		const asyncify = new utility.Asyncify()
		const instance = new WebAssembly.Instance(module, {
			...asyncify.wrapImports({
				...options?.emscriptenImports,
				...Object.fromEntries(Object.entries(this.#imports).map(([name, imports]) => [name, imports.open()])),
			}),
			wasi_snapshot_preview1: {
				...wasi.open(),
				clock_time_get: asyncify.wrapImportFunction(this.#clock_time_get.bind(this)),
				fd_read: this.#fd_read.bind(this),
				fd_write: this.#fd_write.bind(this),
			},
		})
		this.#asyncifiedInstance = asyncify.init(instance.exports.memory as WebAssembly.Memory, instance, {
			wrapExports: ["_start"].concat(options?.exports ?? []),
		})
		options?.exports?.forEach(
			e =>
				typeof this.#asyncifiedInstance.exports[e] == "function" &&
				(this.exports[e] = this.#asyncifiedInstance.exports[e] as () => number)
		)
		Object.values(this.#imports).forEach(
			n => (n.memory = this.#asyncifiedInstance.exports.memory as WebAssembly.Memory)
		)
		wasi.memory = this.#asyncifiedInstance.exports.memory as WebAssembly.Memory
	}

	resetStreams(): void {
		this.#stdout = new TransformStream()
		this.#stderr = new TransformStream()
		this.#streams[0] = FileDescriptor.fromReadableStream()
		this.#streams[1] = FileDescriptor.fromWritableStream(this.#stdout.writable)
		this.#streams[2] = FileDescriptor.fromWritableStream(this.#stderr.writable)
	}
	async run(): Promise<{ out: ReadableStream<Uint8Array>; error: ReadableStream<Uint8Array> }> {
		await Promise.all(this.#streams.map(s => s.preRun()))
		let error: number | undefined = undefined
		try {
			// eslint-disable-next-line @typescript-eslint/ban-types
			const entrypoint = this.#asyncifiedInstance.exports._start as Function
			const result = await entrypoint()
			console.log("result: ", result)
			// }
		} catch (e) {
			if ((e as Error).message === "unreachable")
				error = 134
			else if (e instanceof ProcessExit)
				error = e.code
			else
				throw e
		} finally {
			// We must call close to avoid early termination due to hanging promise
			await Promise.all(this.#streams.map(s => s.close()))
			await Promise.all(this.#streams.map(s => s.postRun()))
		}
		// const error = await this.#interface.start(this.#asyncifiedInstance)
		error && console.log("error code: ", error)
		await Promise.all(this.#streams.map(s => s.postRun()))
		return { out: this.#stdout.readable, error: this.#stderr.readable }
	}
	async #clock_time_get(id: number, precision: bigint, retptr0: number): Promise<number> {
		const response = await fetch("http://worldtimeapi.org/api/timezone/Europe/Stockholm")
		const body = (await response.json()) as any
		const date = body && body.unixtime ? (body.unixtime as bigint) : new Date().getTime()
		//console.log("clock get called: ", { ...response, body: body })
		console.log("clock get called: ", { status: response.status, time: body.unixtime })
		switch (id) {
			case 0:
			case 1:
			case 2:
			case 3:
				const view = this.#view()
				view.setBigUint64(retptr0, BigInt(date) * BigInt(1e6), true)
				return 0
		}
		return 28
	}
	#fd_read(fd: number, iovs_ptr: number, iovs_len: number, retptr0: number): number {
		let result = 52
		if (fd < 3) {
			const desc = this.#streams[fd]
			const view = this.#view()
			const iovs = iovViews(view, iovs_ptr, iovs_len)
			result = desc!.readv(iovs)
			view.setUint32(retptr0, result, true)
			result = 0
		}
		// else
		// result = this.#wasiImport.fd_read(fd, iovs_ptr, iovs_len, retptr0)
		return result
	}
	#fd_write(fd: number, ciovs_ptr: number, ciovs_len: number, retptr0: number): number {
		let result = 52
		if (fd < 3) {
			const desc = this.#streams[fd]
			const view = this.#view()
			const iovs = iovViews(view, ciovs_ptr, ciovs_len)
			result = desc!.writev(iovs)
			view.setUint32(retptr0, result, true)
			result = 0
		}
		return result
	}
	#view(): DataView {
		return this.#asyncifiedInstance.exports.memory
			? new DataView((this.#asyncifiedInstance.exports.memory as WebAssembly.Memory).buffer)
			: (() => {
					throw new Error("#view()")
			  })()
	}

	static open(module: WebAssembly.Module, options?: Partial<Instance.Options>): Instance {
		return new Instance(module, options)
	}
}
function iovViews(view: DataView, iovs_ptr: number, iovs_len: number): Array<Uint8Array> {
	const result = Array<Uint8Array>(iovs_len)
	for (let i = 0; i < iovs_len; i++) {
		const bufferPtr = view.getUint32(iovs_ptr, true)
		iovs_ptr += 4
		const bufferLen = view.getUint32(iovs_ptr, true)
		iovs_ptr += 4
		result[i] = new Uint8Array(view.buffer, bufferPtr, bufferLen)
	}
	return result
}
export namespace Instance {
	export interface Options {
		input: ReadableStream
		arguments: string[]
		environment: Record<string, string>
		default: { env: boolean }
		imports: Record<string, Imports>
		emscriptenImports: WebAssembly.Imports
		exports: string[]
	}
}
