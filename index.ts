// import { _FS as wasily_FS, MemFS as wasilyMemFS } from "./memfs"
import { Imports as wasilyImports } from "./Imports"
import { Instance as wasilyInstance } from "./Instance"
import { ProcessExit as wasilyProcessExit } from "./ProcessExit"
import { WASI as wasilyWASI } from "./WASI"

export namespace wasily {
	export import ProcessExit = wasilyProcessExit
	export import WASI = wasilyWASI
	export import Imports = wasilyImports
	export import Instance = wasilyInstance

	// export type _FS = wasily_FS
	// export const MemFS = wasilyMemFS
	// export type MemFS = wasilyMemFS
}
