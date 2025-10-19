import { Imports as wasilyImports } from "./Imports"
import { Instance as wasilyInstance } from "./Instance"
import { ProcessExit as wasilyProcessExit } from "./ProcessExit"

export namespace wasily {
	export import ProcessExit = wasilyProcessExit
	export import Imports = wasilyImports
	export import Instance = wasilyInstance
}
