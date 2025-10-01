// adapted from emscripten_set_main_loop_arg
export class Loop {
	private constructor(
		private readonly func: (data: number) => void,
		private readonly argument: number,
		private readonly period: number
	) {
		this.period = period || 1000 / 60
	}

	private requestAnimationFrame(func: () => void) {
		setTimeout(func, this.period)
	}
	private scheduler() {
		this.requestAnimationFrame(this.runner.bind(this))
	}
	private runner() {
		try {
			this.func(this.argument)
		} catch (e) {
			throw new Error(`loop function threw exception: ${e}`)
		}
		this.scheduler()
	}

	static set(func: () => void, fps: number, infinite: number, argument: number) {
		const loop = new Loop(func, argument, fps > 0 ? 1000.0 / fps : 1000.0 / 60)
		loop.scheduler()
		if (infinite)
			throw "unwind"
	}
}
