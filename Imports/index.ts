import * as platform from "@cloudflare/workers-types"
import { DurableObject as ImportsDurableObject } from "./DurableObject"
import { Env as ImportsEnv } from "./Env"
import { Imports as ImportsImports } from "./Imports"
import { Wasi as ImportsWasi } from "./Wasi"
import { Worker as ImportsWorker } from "./Worker"

export type Imports = ImportsImports

export namespace Imports {
	export type Env = ImportsEnv
	export const Env = ImportsEnv
	export type Worker<
		E extends Record<string, undefined | string | platform.KVNamespace | platform.DurableObjectNamespace>
	> = ImportsWorker<E>
	export const Worker = ImportsWorker
	export type DurableObject<
		E extends Record<string, undefined | string | platform.KVNamespace | platform.DurableObjectNamespace>
	> = ImportsDurableObject<E>
	export const DurableObject = ImportsDurableObject
	export import Wasi = ImportsWasi
}
