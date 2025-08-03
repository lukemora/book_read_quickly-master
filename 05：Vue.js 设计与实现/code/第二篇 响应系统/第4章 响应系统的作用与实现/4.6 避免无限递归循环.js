{
	const data = { foo: 1 };
	const obj = new Proxy(data, {
		/*...*/
	});

	effect(() => obj.foo++);

	// 执行副作用函数的时，触发赋值操作又会触发副作用函数执行，形成递归导致栈溢出

	// 读取和设置操作都是同一个副作用函数内执行的，可以在trigger动作发生时增加守卫条件： 如果trigger触发执行的副作用与当前正在执行的副作用函数相同，则不触发执行
}

{
	function trigger(target, key) {
		const depsMap = bucket.get(target);
		if (!depsMap) return;
		const effects = depsMap.get(key);

		const effectsToRun = new Set();
		effects &&
			effects.forEach(effectFn => {
				// 如果 trigger 触发执行的副作用函数与当前正在执行的副作用函数相同，则不触发执行
				if (effectFn !== activeEffect) {
					// 新增
					effectsToRun.add(effectFn);
				}
			});
		effectsToRun.forEach(effectFn => effectFn());
		// effects && effects.forEach(effectFn => effectFn())
	}
}
