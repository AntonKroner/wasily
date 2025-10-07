import { DurableObject as ImportsDurableObject } from "./DurableObject"
import { Env as ImportsEnv } from "./Env"
import { Imports as ImportsImports } from "./Imports"
import { Wasi as ImportsWasi } from "./Wasi"
import { Worker as ImportsWorker } from "./Worker"

export type Imports = ImportsImports
export namespace Imports {
	export import Env = ImportsEnv
	export import Worker = ImportsWorker
	export import DurableObject = ImportsDurableObject
	export import Wasi = ImportsWasi
}
