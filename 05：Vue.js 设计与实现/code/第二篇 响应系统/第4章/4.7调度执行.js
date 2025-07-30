{
	const data = { foo: 1 };
	const obj = new Proxy(data, {
		/* ... */
	});

	effect(() => {
		console.log(obj.foo);
	});

	obj.foo++;

	console.log('end');

	// 不改变外面代码  让输入的 1  2   end  变成 1 end 2
}

{
	function effect(fn, options = {}) {
		const effectFn = () => {
			cleanup(effectFn);
			// 当调用 effect 注册副作用函数时，将副作用函数赋值给 activeEffect
			activeEffect = effectFn;
			// 在调用副作用函数之前将当前副作用函数压栈
			effectStack.push(effectFn);
			fn();
			// 在当前副作用函数执行完毕后，将当前副作用函数弹出栈，并把 activeEffect 还原为之前的值
			effectStack.pop();
			activeEffect = effectStack[effectStack.length - 1];
		};
		// 将 options 挂载到 effectFn 上
		effectFn.options = options; // 新增
		// activeEffect.deps 用来存储所有与该副作用函数相关的依赖集合
		effectFn.deps = [];
		// 执行副作用函数
		effectFn();
	}
	//了调度函数，我们在 trigger 函数中触发副作用函数重新执行时，就可以直接调用用户传递的调度器函数，从而把控制权交给用户：
	function trigger(target, key) {
		const depsMap = bucket.get(target);
		if (!depsMap) return;
		const effects = depsMap.get(key);

		const effectsToRun = new Set();
		effects &&
			effects.forEach(effectFn => {
				if (effectFn !== activeEffect) {
					effectsToRun.add(effectFn);
				}
			});
		effectsToRun.forEach(effectFn => {
			// 如果一个副作用函数存在调度器，则调用该调度器，并将副作用函数作为参数传递;
			if (effectFn.options.scheduler) {
				// 新增
				effectFn.options.scheduler(effectFn); // 新增
			} else {
				// 否则直接执行副作用函数（之前的默认行为）
				effectFn(); // 新增
			}
		});
	}
}

{
	const data = { foo: 1 };
	const obj = new Proxy(data, {
		/* ... */
	});

	effect(
		() => {
			console.log(obj.foo);
		},
		// options
		{
			// 调度器 scheduler 是一个函数
			scheduler(fn) {
				// 将副作用函数放到宏任务队列中执行
				setTimeout(fn);
			},
		}
	);

	obj.foo++;

	console.log('结束了');
}

{
	const data = { foo: 1 };
	const obj = new Proxy(data, {
		/* ... */
	});

	effect(() => {
		console.log(obj.foo);
	});

	obj.foo++;
	obj.foo++;
	// 1 2 3  -> 1  3
}
{
	// 定义一个任务队列
	const jobQueue = new Set();
	// 使用 Promise.resolve() 创建一个 promise 实例，我们用它将一个任务添加到微任务队列
	const p = Promise.resolve();

	// 一个标志代表是否正在刷新队列
	let isFlushing = false;
	function flushJob() {
		// 如果队列正在刷新，则什么都不做
		if (isFlushing) return;
		// 设置为 true，代表正在刷新
		isFlushing = true;
		// 在微任务队列中刷新 jobQueue 队列
		p.then(() => {
			jobQueue.forEach(job => job());
		}).finally(() => {
			// 结束后重置 isFlushing
			isFlushing = false;
		});
	}

	effect(
		() => {
			console.log(obj.foo);
		},
		{
			scheduler(fn) {
				// 每次调度时，将副作用函数添加到 jobQueue 队列中
				jobQueue.add(fn);
				// 调用 flushJob 刷新队列
				flushJob();
			},
		}
	);

	obj.foo++;
	obj.foo++;
}

//  Vue.js 中连续多次修改响应式数据但只会触发一次更新，实际上 Vue.js 内部实现了一个更加完善的调度器，思路与此的相同
