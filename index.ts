// import { _FS as wasily_FS, MemFS as wasilyMemFS } from "./memfs"
import { ProcessExit as wasilyProcessExit, WASI as wasilyWASI, WASIOptions as wasilyOptions } from "./WASI"

export namespace wasily {
	export const ProcessExit = wasilyProcessExit
	export type ProcessExit = wasilyProcessExit
	export const WASI = wasilyWASI
	export type WASI = wasilyWASI
	export type Options = wasilyOptions
	// export type _FS = wasily_FS
	// export const MemFS = wasilyMemFS
	// export type MemFS = wasilyMemFS
}
