import { Imports } from "./Imports"

export class Env extends Imports {
	open(): Record<string, WebAssembly.Suspending | ((...args: any[]) => number)> {
		const result: ReturnType<Imports["open"]> = {
			fiprintf: this.#fiprintf.bind(this),
			pthread_mutex_lock: this.#pthread_mutex_lock.bind(this),
			pthread_mutex_unlock: this.#pthread_mutex_unlock.bind(this),
			pthread_create: this.#pthread_create.bind(this),
			pthread_detach: this.#pthread_detach.bind(this),
			pthread_join: this.#pthread_join.bind(this),
			pthread_mutex_destroy: this.#pthread_mutex_destroy.bind(this),
			pthread_mutex_init: this.#pthread_mutex_init.bind(this),
			pthread_rwlock_init: this.#pthread_rwlock_init.bind(this),
			pthread_rwlock_rdlock: this.#pthread_rwlock_rdlock.bind(this),
			pthread_rwlock_wrlock: this.#pthread_rwlock_wrlock.bind(this),
			pthread_rwlock_unlock: this.#pthread_rwlock_unlock.bind(this),
			pthread_rwlock_destroy: this.#pthread_rwlock_destroy.bind(this),
			pthread_once: this.#pthread_once.bind(this),
			pthread_key_create: this.#pthread_key_create.bind(this),
			pthread_getspecific: this.#pthread_getspecific.bind(this),
			pthread_setspecific: this.#pthread_setspecific.bind(this),
			pthread_key_delete: this.#pthread_key_delete.bind(this),
			pthread_self: this.#pthread_self.bind(this),
			getaddrinfo: this.#getaddrinfo.bind(this),
			freeaddrinfo: this.#freeaddrinfo.bind(this),
			__errno_location: this.#__errno_location.bind(this),
			getpeername: this.#getpeername.bind(this),
			getsockname: this.#getsockname.bind(this),
			setsockopt: this.#setsockopt.bind(this),
			bind: this.#bind.bind(this),
			connect: this.#connect.bind(this),
			sigaction: this.#sigaction.bind(this),
			socket: this.#socket.bind(this),
			socketpair: this.#socketpair.bind(this),
			fchmod: this.#fchmod.bind(this),
			__small_sprintf: this.#__small_sprintf.bind(this),
			siprintf: this.#siprintf.bind(this),
			gethostname: this.#gethostname.bind(this),
			listen: this.#listen.bind(this),
			recvfrom: this.#recvfrom.bind(this),
			sendto: this.#sendto.bind(this),
			geteuid: this.#geteuid.bind(this),
			getuid: this.#getuid.bind(this),
			getgid: this.#getgid.bind(this),
			getegid: this.#getegid.bind(this),
			getpwuid_r: this.#getpwuid_r.bind(this),
			if_nametoindex: this.#if_nametoindex.bind(this),
			tcgetattr: this.#tcgetattr.bind(this),
			tcsetattr: this.#tcsetattr.bind(this),
			getpid: this.#getpid.bind(this),
			munmap: this.#munmap.bind(this),
			signal: this.#signal.bind(this),
		}
		return result
	}
	#fiprintf(a: number, b: number, c: number): number {
		console.log(`"fiprintf called with a: ${a}, b: ${b}, c: ${c}."`)
		return 0
	}
	#pthread_mutex_lock() {
		console.log("mutex_lock.")
		return 0
	}
	#pthread_mutex_unlock() {
		console.log("mutex_unlock.")
		return 0
	}
	#pthread_create() {
		console.log("pthread_create")
		return 0
	}
	#pthread_detach() {
		console.log("pthread_detach")
		return 0
	}
	#pthread_join() {
		console.log("pthread_join")
		return 0
	}
	#pthread_mutex_destroy() {
		console.log("mutex_destroy")
		return 0
	}
	#pthread_mutex_init() {
		console.log("mutex_init")
		return 0
	}
	#pthread_rwlock_init() {
		console.log("rwlock_init")
		return 0
	}
	#pthread_rwlock_rdlock() {
		console.log("rwlock_rdlock")
		return 0
	}
	#pthread_rwlock_wrlock() {
		console.log("rwlock_wrlock")
		return 0
	}
	#pthread_rwlock_unlock() {
		console.log("rwlock_unlock")
		return 0
	}
	#pthread_rwlock_destroy() {
		console.log("rwlock_destroy")
		return 0
	}
	#pthread_once(__once_control: number, __init_routine: number): number {
		console.log(`pthread_once: arg1: ${__once_control} arg2: ${__init_routine}`)
		return 0
	}
	#pthread_key_create() {
		console.log("pthread_key_create")
		return 0
	}
	#pthread_getspecific() {
		console.log("pthread_getspecific")
		return 0
	}
	#pthread_setspecific() {
		console.log("pthread_setspecific")
		return 0
	}
	#pthread_key_delete() {
		console.log("pthread_key_delete")
		return 0
	}
	#pthread_self() {
		console.log("pthread_self")
		return 0
	}
	#getaddrinfo() {
		console.log("getaddrinfo")
		return 0
	}
	#freeaddrinfo() {
		console.log("freeaddrinfo")
		return 0
	}
	#__errno_location() {
		console.log("__errno_location")
		return 0
	}
	#getpeername() {
		console.log("getpeername")
		return 0
	}
	#getsockname() {
		console.log("getsockname")
		return 0
	}
	#setsockopt() {
		console.log("setsockopt")
		return 0
	}
	#bind() {
		console.log("bind")
		return 0
	}
	#connect() {
		console.log("connect")
		return 0
	}
	#sigaction() {
		console.log("sigaction")
		return 0
	}
	#socket() {
		console.log("socket")
		return 0
	}
	#socketpair() {
		console.log("socketpair")
		return 0
	}
	#fchmod() {
		console.log("fchmod")
		return 0
	}
	#__small_sprintf() {
		console.log("__small_sprintf")
		return 0
	}
	#siprintf() {
		console.log("siprintf")
		return 0
	}
	#gethostname() {
		console.log("gethostname")
		return 0
	}
	#listen() {
		console.log("listen")
		return 0
	}
	#recvfrom() {
		console.log("recvfrom")
		return 0
	}
	#sendto() {
		console.log("sendto")
		return 0
	}
	#geteuid() {
		console.log("geteuid")
		return 0
	}
	#getuid() {
		console.log("getuid")
		return 0
	}
	#getgid() {
		console.log("getgid")
		return 0
	}
	#getegid() {
		console.log("getegid")
		return 0
	}
	#getpwuid_r() {
		console.log("getpwuid_r")
		return 0
	}
	#if_nametoindex() {
		console.log("if_nametoindex")
		return 0
	}
	#tcgetattr() {
		console.log("tcgetattr")
		return 0
	}
	#tcsetattr() {
		console.log("tcsetattr")
		return 0
	}
	#getpid() {
		console.log("getpid")
		return 0
	}
	#munmap() {
		console.log("munmap")
		return 0
	}
	#signal() {
		console.log("signal")
		return 0
	}
}
