export interface Environment
	extends Record<
		string,
		undefined | string | KVNamespace | DurableObjectNamespace | Fetcher | Ai | D1Database | WorkerVersionMetadata
	> {
	adminSecret?: string
	version?: WorkerVersionMetadata
	kvStore: KVNamespace
}
