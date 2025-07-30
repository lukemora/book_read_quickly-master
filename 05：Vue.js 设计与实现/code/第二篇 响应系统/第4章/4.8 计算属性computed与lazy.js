const { lazy } = require('react');

effect(
	() => {
		console.log('副作用函数执行了');
	},
	{
		lazy: true,
	}
);

{
	// 这里的 lazy 属性设置为 true，表示副作用函数不会立即执行而是等到需要的时候才会执行

	function effect(fn, options = {}) {
		const effectFn = () => {
			cleanup(effectFn);
			activeEffect = effectFn;
			effectStack.push(effectFn);
			fn();
			effectStack.pop();
			activeEffect = effectStack[effectStack.length - 1];
		};
		effectFn.options = options;
		effectFn.deps = [];
		// 只有非 lazy 的时候，才执行
		if (!options.lazy) {
			// 新增
			// 执行副作用函数
			effectFn();
		}
		// 将副作用函数作为返回值返回
		return effectFn; // 新增
	}
}
{
	const effectFn = effect(
		() => {
			console.log('副作用函数执行了');
		},
		{
			lazy: true,
		}
	);
	effectFn();
}
{
	const obj = {
		foo: 1,
		bar: 2,
	};
	const effectFn = effect(() => obj.bar + obj.foo, {
		lazy: true,
	});
	const value = effectFn();
}
{
	function effect(fn, options = {}) {
		const effectFn = () => {
			cleanup(effectFn);
			activeEffect = effectFn;
			effectStack.push(effectFn);
			//  将 fn 的执行结果存储到 res 中
			const res = fn();
			effectStack.pop();
			activeEffect = effectStack[effectStack.length - 1];
			// 将 res 作为 effectFn 的返回值
			return res; // 新增
		};
		effectFn.options = options;
		effectFn.deps = [];
		if (!options.lazy) {
			effectFn();
		}
	}
	return effectFn;
}

{
	function computed(getter) {
		// 把 getter 作为副作用函数，创建一个 lazy 的 effect
		const effectFn = effect(getter, {
			lazy: true,
		});

		const obj = {
			// 当读取 value 时才执行 effectFn
			get value() {
				return effectFn();
			},
		};

		return obj;
	}
}
{
	const data = { foo: 1, bar: 2 };
	const obj = new Proxy(data, {
		/* ... */
	});

	const sumRes = computed(() => obj.foo + obj.bar);

	console.log(sumRes.value); //
}

{
	function computed(getter) {
		// value 用来缓存上一次计算的值
		let value;
		// dirty 标志，用来标识是否需要重新计算值，为 true 则意味着“脏”，需要计算;
		let dirty = true;
		const effectFn = effect(getter, {
			lazy: true,
			// 在getter函数中所依赖的响应式数据发生变化时执行，
			scheduler() {
				dirty = true;
			},
		});
		const obj = {
			get value() {
				if (dirty) {
					// 只有“脏”时才计算值，并将得到的值缓存到 value 中
					value = effectFn();
					// 将 dirty 设置为 false，下一次访问直接使用缓存到 value 中的值
					dirty = false;
				}
				return value;
			},
		};
		return obj;
	}
}

{
	const sumRes = computed(() => obj.foo + obj.bar);

	effect(() => {
		// 在该副作用函数中读取 sumRes.value
		console.log(sumRes.value);
	});

	// 修改 obj.foo 的值
	obj.foo++;

	// 外层的effect不会被内层的响应式数据收集
}

{
	function computed(getter) {
		let value;
		let dirty = true;

		const effectFn = effect(getter, {
			lazy: true,
			scheduler() {
				if (!dirty) {
					dirty = true;
					// 当计算属性依赖的响应式数据变化时，手动调用 trigger 函数触发响应;
					trigger(obj, 'value');
				}
			},
		});

		const obj = {
			get value() {
				if (dirty) {
					value = effectFn();
					dirty = false;
				}
				// 当读取 value 时，手动调用 track 函数进行追踪
				track(obj, 'value'); // 读取computed数据时重新追踪一下
				return value;

				/* 
                    computed(obj) 
                         └── value 
                             └── effect
                */
			},
		};

		return obj;
	}
}
