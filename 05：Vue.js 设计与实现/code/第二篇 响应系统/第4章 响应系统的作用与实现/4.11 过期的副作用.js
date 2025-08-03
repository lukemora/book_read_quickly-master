{
	let finalData;

	watch(obj, async () => {
		// 发送并等待网络请求
		const res = await fetch('/path/to/request');
		// 将请求结果赋值给 data
		finalData = res;
	});
	/* 
    
        第一次修改 obj 对象的某个值，回调函数执行，同时发送了第一次请求 A
        第而次修改 obj 对象的某个值，回调函数执行，同时发送了第二次请求 B
        如果请求B 先于请求 A 返回结果，就会导致最终 finalData 中存储的是 A请求的结果


        请求 A 是副作用函数第一次执行所产生的副作用，
        请求 B 是副作用函数第二次执行所产生的副作用。
        由于请求 B 后发生，所以请求 B 的结果应该被视为“最新”的，
        而请求 A 已经“过期”了，其产生的结果应被视为无效。
        通过这种方式，就可以避免竞态问题导致的错误结果。
    */
}

{
	/* 
    watch 函数的回调函数接收第三个参数onInvalidate，它是一个函数，类似于事件监听器，我们可以使用onInvalidate 函数注册一个回调，这个回调函数会在当前副作用函数过期时执行

    怎么样才算过期  执行完就算过期?
    */
	watch(obj, async (newValue, oldValue, onInvalidate) => {
		// 定义一个标志，代表当前副作用函数是否过期，默认为 false，代表没有过期
		let expired = false;
		// 调用 onInvalidate() 函数注册一个过期回调
		onInvalidate(() => {
			// 当过期时，将 expired 设置为 true
			expired = true;
		});

		// 发送网络请求
		const res = await fetch('/path/to/request');

		// 只有当该副作用函数的执行没有过期时，才会执行后续操作。
		if (!expired) {
			finalData = res;
		}
	});
}

{
	function watch(source, cb, options = {}) {
		let getter;
		if (typeof source === 'function') {
			getter = source;
		} else {
			getter = () => traverse(source);
		}

		let oldValue, newValue;

		// cleanup 用来存储用户注册的过期回调
		let cleanup;
		// 定义 onInvalidate 函数
		function onInvalidate(fn) {
			// 将过期回调存储到 cleanup 中
			cleanup = fn;
		}

		const job = () => {
			newValue = effectFn();
			// 在调用回调函数 cb 之前，先调用过期回调
			if (cleanup) {
				cleanup();
			}
			// 将 onInvalidate 作为回调函数的第三个参数，以便用户使用
			cb(newValue, oldValue, onInvalidate);
			oldValue = newValue;
		};

		const effectFn = effect(
			// 执行 getter
			() => getter(),
			{
				lazy: true,
				scheduler: () => {
					if (options.flush === 'post') {
						const p = Promise.resolve();
						p.then(job);
					} else {
						job();
					}
				},
			}
		);

		if (options.immediate) {
			job();
		} else {
			oldValue = effectFn();
		}
	}
}

{
	/* 
        onWatcherCleanup注册一个清理函数，在当前侦听器即将重新运行时执行。只能在 watchEffect 作用函数或 watch 回调函数的同步执行期间调用 (即不能在异步函数的 await 语句之后调用)。
    */
	watch(obj, async (newValue, oldValue, onInvalidate) => {
		let expired = false;
		onInvalidate(() => {
			expired = true;
		});

		const res = await fetch('/path/to/request');

		if (!expired) {
			finalData = res;
		}
	});

	// 第一次修改
	obj.foo++;
	setTimeout(() => {
		// 200ms 后做第二次修改
		obj.foo++;
	}, 200);
}
