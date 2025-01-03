// import { _FS as wasily_FS, MemFS as wasilyMemFS } from "./memfs"
import { ProcessExit as wasilyProcessExit, WASI as wasilyWASI } from "./WASI"

export namespace wasily {
	export const ProcessExit = wasilyProcessExit
	export type ProcessExit = wasilyProcessExit
	export import WASI = wasilyWASI
	// export type _FS = wasily_FS
	// export const MemFS = wasilyMemFS
	// export type MemFS = wasilyMemFS
}
