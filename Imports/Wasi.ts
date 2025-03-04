export { traceImportsToConsole } from "../helpers"
// import * as utility from "@tybys/wasm-util"
import * as platform from "@cloudflare/workers-types"
import { _FS, MemFS } from "../memfs"
import { ProcessExit } from "../ProcessExit"
import * as wasi from "../snapshot_preview1"
import { FileDescriptor, fromReadableStream, fromWritableStream } from "../streams"
import { Imports } from "./Imports"

export class Wasi extends Imports {
	override set memory(memory: platform.WebAssembly.Memory) {
		this.#memfs.initialize(memory)
		super.memory = memory
	}
	#args: Array<string>
	#env: Array<string>
	#streams: Array<FileDescriptor>
	#memfs: MemFS = new MemFS([], {})
	#asyncify: boolean
	constructor(options?: Wasi.Options) {
		super()
		console.log("WASI 1")
		this.#args = options?.args ?? []
		const env = options?.env ?? {}
		console.log("WASI 2")
		this.#env = Object.keys(env).map(key => {
			return `${key}=${env[key]}`
		})
		console.log("WASI 3")
		this.#asyncify = options?.streamStdio ?? false
		console.log("WASI 4")
		this.#streams = [
			fromReadableStream(options?.stdin, this.#asyncify),
			fromWritableStream(options?.stdout, this.#asyncify),
			fromWritableStream(options?.stderr, this.#asyncify),
		]
		console.log("WASI 5")
	}

	open(): Record<keyof wasi.SnapshotPreview1, (...args: any[]) => number | Promise<number>> {
		const result: Record<keyof wasi.SnapshotPreview1, (...args: any[]) => number | Promise<number>> = {
			args_get: this.#args_get.bind(this),
			args_sizes_get: this.#args_sizes_get.bind(this),
			clock_res_get: this.#clock_res_get.bind(this),
			clock_time_get: this.#clock_time_get.bind(this),
			environ_get: this.#environ_get.bind(this),
			environ_sizes_get: this.#environ_sizes_get.bind(this),
			fd_advise: this.#memfs.exports.fd_advise.bind(this),
			fd_allocate: this.#memfs.exports.fd_allocate.bind(this),
			fd_close: this.#memfs.exports.fd_close.bind(this),
			fd_datasync: this.#memfs.exports.fd_datasync.bind(this),
			fd_fdstat_get: this.#memfs.exports.fd_fdstat_get.bind(this),
			fd_fdstat_set_flags: this.#memfs.exports.fd_fdstat_set_flags.bind(this),
			fd_fdstat_set_rights: this.#memfs.exports.fd_fdstat_set_rights.bind(this),
			fd_filestat_get: this.#memfs.exports.fd_filestat_get.bind(this),
			fd_filestat_set_size: this.#memfs.exports.fd_filestat_set_size.bind(this),
			fd_filestat_set_times: this.#memfs.exports.fd_filestat_set_times.bind(this),
			fd_pread: this.#memfs.exports.fd_pread.bind(this),
			fd_prestat_dir_name: this.#memfs.exports.fd_prestat_dir_name.bind(this),
			fd_prestat_get: this.#memfs.exports.fd_prestat_get.bind(this),
			fd_pwrite: this.#memfs.exports.fd_pwrite.bind(this),
			fd_read: this.#fd_read.bind(this),
			fd_readdir: this.#memfs.exports.fd_readdir.bind(this),
			fd_renumber: this.#memfs.exports.fd_renumber.bind(this),
			fd_seek: this.#memfs.exports.fd_seek.bind(this),
			fd_sync: this.#memfs.exports.fd_sync.bind(this),
			fd_tell: this.#memfs.exports.fd_tell.bind(this),
			fd_write: this.#fd_write.bind(this),
			path_create_directory: this.#memfs.exports.path_create_directory.bind(this),
			path_filestat_get: this.#memfs.exports.path_filestat_get.bind(this),
			path_filestat_set_times: this.#memfs.exports.path_filestat_set_times.bind(this),
			path_link: this.#memfs.exports.path_link.bind(this),
			path_open: this.#memfs.exports.path_open.bind(this),
			path_readlink: this.#memfs.exports.path_readlink.bind(this),
			path_remove_directory: this.#memfs.exports.path_remove_directory.bind(this),
			path_rename: this.#memfs.exports.path_rename.bind(this),
			path_symlink: this.#memfs.exports.path_symlink.bind(this),
			path_unlink_file: this.#memfs.exports.path_unlink_file.bind(this),
			poll_oneoff: this.#poll_oneoff.bind(this),
			proc_exit: this.#proc_exit.bind(this),
			proc_raise: this.#proc_raise.bind(this),
			random_get: this.#random_get.bind(this),
			sched_yield: this.#sched_yield.bind(this),
			sock_recv: this.#sock_recv.bind(this),
			sock_send: this.#sock_send.bind(this),
			sock_shutdown: this.#sock_shutdown.bind(this),
		}
		return result
	}
	#fillValues(values: Array<string>, iter_ptr_ptr: number, buf_ptr: number): number {
		const encoder = new TextEncoder()
		const buffer = new Uint8Array(this.buffer)
		const view = this.view()
		for (const value of values) {
			view.setUint32(iter_ptr_ptr, buf_ptr, true)
			iter_ptr_ptr += 4
			const data = encoder.encode(`${value}\0`)
			buffer.set(data, buf_ptr)
			buf_ptr += data.length
		}
		return wasi.Result.SUCCESS
	}
	#fillSizes(values: Array<string>, count_ptr: number, buffer_size_ptr: number): number {
		const view = this.view()
		const encoder = new TextEncoder()
		const length = values.reduce((result, value) => result + encoder.encode(`${value}\0`).length, 0)
		view.setUint32(count_ptr, values.length, true)
		view.setUint32(buffer_size_ptr, length, true)
		return wasi.Result.SUCCESS
	}
	#args_get(argv_ptr_ptr: number, argv_buf_ptr: number): number {
		return this.#fillValues(this.#args, argv_ptr_ptr, argv_buf_ptr)
	}
	#args_sizes_get(argc_ptr: number, argv_buf_size_ptr: number): number {
		return this.#fillSizes(this.#args, argc_ptr, argv_buf_size_ptr)
	}
	#clock_res_get(id: number, retptr0: number): number {
		switch (id) {
			case wasi.Clock.REALTIME:
			case wasi.Clock.MONOTONIC:
			case wasi.Clock.PROCESS_CPUTIME_ID:
			case wasi.Clock.THREAD_CPUTIME_ID: {
				const view = this.view()
				view.setBigUint64(retptr0, BigInt(1e6), true)
				return wasi.Result.SUCCESS
			}
		}
		return wasi.Result.EINVAL
	}
	#clock_time_get(id: number, precision: bigint, retptr0: number): number {
		switch (id) {
			case wasi.Clock.REALTIME:
			case wasi.Clock.MONOTONIC:
			case wasi.Clock.PROCESS_CPUTIME_ID:
			case wasi.Clock.THREAD_CPUTIME_ID: {
				const view = this.view()
				view.setBigUint64(retptr0, BigInt(Date.now()) * BigInt(1e6), true)
				return wasi.Result.SUCCESS
			}
		}
		return wasi.Result.EINVAL
	}
	#environ_get(env_ptr_ptr: number, env_buf_ptr: number): number {
		return this.#fillValues(this.#env, env_ptr_ptr, env_buf_ptr)
	}
	#environ_sizes_get(env_ptr: number, env_buf_size_ptr: number): number {
		return this.#fillSizes(this.#env, env_ptr, env_buf_size_ptr)
	}
	#fd_read(fd: number, iovs_ptr: number, iovs_len: number, retptr0: number): Promise<number> | number {
		if (fd < 3) {
			const desc = this.#streams[fd]
			const view = this.view()
			const iovs = wasi.iovViews(view, iovs_ptr, iovs_len)
			const result = desc!.readv(iovs)
			if (typeof result === "number") {
				view.setUint32(retptr0, result, true)
				return wasi.Result.SUCCESS
			}
			const promise = result as Promise<number>
			return promise.then((read: number) => {
				view.setUint32(retptr0, read, true)
				return wasi.Result.SUCCESS
			})
		}
		return this.#memfs.exports.fd_read(fd, iovs_ptr, iovs_len, retptr0)
	}
	#fd_write(fd: number, ciovs_ptr: number, ciovs_len: number, retptr0: number): Promise<number> | number {
		if (fd < 3) {
			const desc = this.#streams[fd]
			const view = this.view()
			const iovs = wasi.iovViews(view, ciovs_ptr, ciovs_len)
			const result = desc!.writev(iovs)
			if (typeof result === "number") {
				view.setUint32(retptr0, result, true)
				return wasi.Result.SUCCESS
			}
			const promise = result as Promise<number>
			return promise.then((written: number) => {
				view.setUint32(retptr0, written, true)
				return wasi.Result.SUCCESS
			})
		}
		return this.#memfs.exports.fd_write(fd, ciovs_ptr, ciovs_len, retptr0)
	}
	#poll_oneoff(in_ptr: number, out_ptr: number, nsubscriptions: number, retptr0: number): number {
		return wasi.Result.ENOSYS
	}
	#proc_exit(code: number): number {
		throw new ProcessExit(code)
	}
	#proc_raise(signal: number): number {
		return wasi.Result.ENOSYS
	}
	#random_get(buffer_ptr: number, buffer_len: number): number {
		const buffer = new Uint8Array(this.buffer, buffer_ptr, buffer_len)
		crypto.getRandomValues(buffer)
		return wasi.Result.SUCCESS
	}
	#sched_yield(): number {
		return wasi.Result.SUCCESS
	}
	#sock_recv(
		fd: number,
		ri_data_ptr: number,
		ri_data_len: number,
		ri_flags: number,
		retptr0: number,
		retptr1: number
	): number {
		return wasi.Result.ENOSYS
	}
	#sock_send(fd: number, si_data_ptr: number, si_data_len: number, si_flags: number, retptr0: number): number {
		return wasi.Result.ENOSYS
	}
	#sock_shutdown(fd: number, how: number): number {
		return wasi.Result.ENOSYS
	}
}
export type { _FS }
export namespace Wasi {
	export interface Options {
		/*** Command-line arguments** @defaultValue `[]`**/
		args?: string[]
		/*** Environment variables** @defaultValue `{}`**/
		env?: Record<string, string>
		/*** By default WASI applications that call `proc_exit` will throw a {@link ProcessExit} exception, setting this option to true will cause {@link Wasi.start} to return the the exit code instead.** @defaultValue `false`**/
		returnOnExit?: boolean
		/*** A list of directories that will be accessible in the WebAssembly application's sandbox.** @defaultValue `[]`**/
		preopens?: string[]
		/*** Input stream that the application will be able to read from via stdin*/
		stdin?: ReadableStream
		/*** Output stream that the application will be able to write to via stdin*/
		stdout?: WritableStream
		/*** Output stream that the application will be able to write to via stderr*/
		stderr?: WritableStream
		/*** Enable async IO for stdio streams, requires the application is built with {@link asyncify|https://web.dev/asyncify/}** @experimental* @defaultValue `false`**/
		streamStdio?: boolean
		/*** Initial filesystem contents, currently used for testing with* existing WASI test suites* @internal**/
		fs?: _FS
	}
}
