import { Imports } from "./Imports"
import { ProcessExit } from "./ProcessExit"

export class Instance {
	readonly exports: Record<string, (...args: any[]) => number | Promise<number>> = {}
	#imports: Record<string, Imports> = {}
	#stdout: TransformStream = new TransformStream()
	#stderr: TransformStream = new TransformStream()
	private readonly wasi: Imports.Wasi
	readonly instance: WebAssembly.Instance
	private constructor(module: WebAssembly.Module, options?: Partial<Instance.Options>) {
		console.log("exports: ", WebAssembly.Module.exports(module))
		console.log("imports: ", WebAssembly.Module.imports(module))
		options?.imports && (this.#imports = options.imports)
		options?.default?.env && (this.#imports["env"] = new Imports.Env())
		this.wasi = new Imports.Wasi({
			args: options?.arguments,
			env: options?.environment,
			streamStdio: true,
			stdin: options?.input,
			stderr: this.#stderr.writable,
			stdout: this.#stdout.writable,
		})
		this.instance = new WebAssembly.Instance(module, {
			...Object.fromEntries(Object.entries(this.#imports).map(([name, imports]) => [name, imports.open()])),
			wasi_snapshot_preview1: {
				...this.wasi.open(),
				clock_time_get: new WebAssembly.Suspending(this.#clock_time_get.bind(this)),
			},
		})
		console.log("instance: ", this.instance)
		console.log("instance.exports: ", this.instance.exports)
		options?.exports?.forEach(
			e =>
				typeof this.instance.exports[e] == "function" &&
				(this.exports[e] = WebAssembly.promising(this.instance.exports[e] as () => number))
		)
		Object.values(this.#imports).forEach(n => (n.memory = this.instance.exports.memory as WebAssembly.Memory))
		this.wasi.memory = this.instance.exports.memory as WebAssembly.Memory
	}

	async run(): Promise<{ out: ReadableStream<Uint8Array>; error: ReadableStream<Uint8Array> }> {
		await Promise.all(this.wasi.streams.map(s => s.preRun()))
		let error: number | undefined = undefined
		try {
			const entrypoint = WebAssembly.promising(this.instance.exports._start as any)
			const result = await entrypoint()
			console.log("result: ", result)
		} catch (e) {
			if ((e as Error).message === "unreachable")
				error = 134
			else if (e instanceof ProcessExit)
				error = e.code
			else
				throw e
		} finally {
			// We must call close to avoid early termination due to hanging promise
			await Promise.all(this.wasi.streams.map(s => s.close()))
			await Promise.all(this.wasi.streams.map(s => s.postRun()))
		}
		error && console.log("error code: ", error)
		// await Promise.all(this.wasi.streams.map(s => s.postRun()))
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
	#view(): DataView {
		if (!this.instance.exports.memory)
			throw new Error("#view()")
		return new DataView((this.instance.exports.memory as WebAssembly.Memory).buffer)
	}

	static open(module: WebAssembly.Module, options?: Partial<Instance.Options>): Instance {
		return new Instance(module, options)
	}
}
export namespace Instance {
	export interface Options {
		input: ReadableStream
		arguments: string[]
		environment: Record<string, string>
		default: { env: boolean }
		imports: Record<string, Imports>
		exports: string[]
	}
}
