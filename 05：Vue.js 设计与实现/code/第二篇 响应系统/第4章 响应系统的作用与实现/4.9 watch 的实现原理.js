{
	watch(obj, () => {
		console.log('数据变了');
	});

	// 修改响应数据的值，会导致回调函数执行
	obj.foo++;
}

{
	effect(
		() => {
			console.log(obj.foo);
		},
		{
			scheduler() {
				// 当 obj.foo 的值变化时，会执行 scheduler 调度函数
			},
		}
	);
}

{
	function watch(source, cb) {
		let getter;
		// 如果 source 是函数，说明用户传递的是 getter，所以直接把 source 赋值给 getter
		if (typeof source === 'function') {
			getter = source;
		} else {
			// 否则按照原来的实现调用 traverse 递归地读取
			getter = () => traverse(source); /* source.foo */
		}
		effect(() => getter(), {
			scheduler() {
				cb();
			},
		});
	}

	const data = { foo: 1 };
	const obj = new Proxy(data, {
		/* ... */
	});

	watch(
		/* obj */ () => obj.foo,
		() => {
			console.log('数据变化了');
		}
	);

	obj.foo++;

	function traverse(value, seen = new Set()) {
		// 如果要读取的数据是原始值，或者已经被读取过了，那么什么都不做
		if (typeof value !== 'object' || value === null || seen.has(value)) return;
		// 将数据添加到 seen 中，代表遍历地读取过了，避免循环引用引起的死循环
		seen.add(value);
		// 暂时不考虑数组等其他结构
		// 假设 value 就是一个对象，使用 for...in 读取对象的每一个值，并递归地调用 traverse 进行处理
		for (const k in value) {
			traverse(value[k], seen);
		}

		return value;
	}

	{
		function watch(source, cb) {
			let getter;
			if (typeof source === 'function') {
				getter = source;
			} else {
				getter = () => traverse(source);
			}
			// 定义旧值与新值
			let oldValue, newValue;
			// 使用 effect 注册副作用函数时，开启 lazy 选项，并把返回值存储到 effectFn 中以便后续手动调用
			const effectFn = effect(() => getter(), {
				lazy: true,
				scheduler() {
					// 在 scheduler 中重新执行副作用函数，得到的是新值
					newValue = effectFn();
					// 将旧值和新值作为回调函数的参数
					cb(newValue, oldValue);
					// 更新旧值，不然下一次会得到错误的旧值
					oldValue = newValue;
				},
			});
			// 手动调用副作用函数，拿到的值就是旧值
			oldValue = effectFn();
		}
	}
}

{
	watch(
		obj,
		() => {
			console.log('变化了');
		},
		{
			// 回调函数会在 watch 创建时立即执行一次
			immediate: true,
		}
	);
}
