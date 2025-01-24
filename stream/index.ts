import { DevNull as streamDevNull } from "./DevNull"
import { FileDescriptor as streamFileDescriptor } from "./FileDescriptor"
import { readable as streamReadable } from "./readable"
import { writable as streamWritable } from "./writable"

export namespace stream {
	export import DevNull = streamDevNull
	export import FileDescriptor = streamFileDescriptor
	export import readable = streamReadable
	export import writable = streamWritable
	export function fromReadable(stream?: ReadableStream): FileDescriptor {
		return stream ? new readable.Sync(stream.getReader()) : new DevNull()
	}
	export function fromWritable(stream?: WritableStream): FileDescriptor {
		return stream ? new writable.Sync(stream.getWriter()) : new DevNull()
	}
}
