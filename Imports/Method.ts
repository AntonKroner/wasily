export type Method = typeof Method.methods[number]
export namespace Method {
	export const methods = ["GET", "POST", "DELETE", "HEAD", "PATCH", "PUT", "OPTIONS", "TRACE", "CONNECT"] as const
}
