export interface Environment
	extends Record<
		string,
		undefined | string | KVNamespace | DurableObjectNamespace | Fetcher | Ai | D1Database | WorkerVersionMetadata
	> {
	adminSecret?: string
	version?: WorkerVersionMetadata
	kvStore?: KVNamespace
}
export namespace Environment {
	export function toRecord(environment: Environment): Record<string, string> {
		return Object.fromEntries(Object.entries(environment).map(([key, value]) => [key, value?.toString() ?? ""]))
	}
}
