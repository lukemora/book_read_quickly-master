{
	// const data = { ok: true, text: 'hello world' };
	// const obj = new Proxy(data, {
	// 	/* ... */
	// });
	// effect(function effectFn() {
	// 	document.body.innerText = obj.ok ? obj.text : 'not';
	// });
	/* 
        当ok为false时，document.body.innerText会被设置为'not'
        再当text变化时，effectFn不应该重新执行  结果却执行了
    */
	// 遗留的副作用函数导致了不必要的更新
	// 解决思路 每次副作用函数执行时，我们可以先把它从所有与之关联的依赖集合中删除;
	/* 
        执行ok的effectFn时，将ok的依赖集合删除
        执行text的effectFn时，将text的依赖集合删除
    */
}

{
	const data = { ok: true, text: 'hello world' };
	const bucket = new WeakMap();

	// 用一个全局变量存储被注册的副作用函数
	let activeEffect;
	function effect(fn) {
		const effectFn = () => {
			// 当 effectFn 执行时，将其设置为当前激活的副作用函数
			activeEffect = effectFn;
			console.log(effectFn, 'effectFn');
			fn();
		};
		// activeEffect.deps 用来存储所有与该副作用函数相关联的依赖集合
		effectFn.deps = [];
		// 执行副作用函数
		effectFn();
	}
	effect(() => {
		// console.log('effect1');
	});

	function track(target, key) {
		// 没有 activeEffect，直接 return
		if (!activeEffect) return;
		let depsMap = bucket.get(target);
		if (!depsMap) {
			bucket.set(target, (depsMap = new Map()));
		}
		let deps = depsMap.get(key);
		if (!deps) {
			depsMap.set(key, (deps = new Set()));
		}
		// 把当前激活的副作用函数添加到依赖集合 deps 中
		deps.add(activeEffect); /* activeEffect相当于修改innerText为xx的回调 */
		// deps 就是一个与当前副作用函数存在联系的依赖集合
		// 将其添加到 activeEffect.deps 数组中
		activeEffect.deps.push(deps); // 新增
		console.log(activeEffect.deps, key);
	}

	// track(data, 'ok');
	track(data, 'text');
}

{
	// 用一个全局变量存储被注册的副作用函数
	let activeEffect;
	function effect(fn) {
		const effectFn = () => {
			// 调用 cleanup 函数完成清除工作
			cleanup(effectFn); // 新增
			activeEffect = effectFn;
			fn();
		};
		effectFn.deps = [];
		effectFn();
	}

	function cleanup(effectFn) {
		// 遍历 effectFn.deps 数组
		for (let i = 0; i < effectFn.deps.length; i++) {
			// deps 是依赖集合
			const deps = effectFn.deps[i];
			// 将 effectFn 从依赖集合中移除
			deps.delete(effectFn);
		}
		// 最后需要重置 effectFn.deps 数组
		effectFn.deps.length = 0;
	}

	// 我们的响应系统已经可以避免副作用函数产生遗留了。但如果你尝试运行代码，会发现目前的实现会导致无限循环执行

	function trigger(target, key) {
		const depsMap = bucket.get(target);
		if (!depsMap) return;
		const effects = depsMap.get(key);
		effects && effects.forEach(fn => fn()); // 问题出在这句代码
	}

	/* 
        类似
        const set = new Set([1]) 
    
        set.forEach(item => { 
          set.delete(1) 
          set.add(1) 
          console.log('遍历中') 
        })

        // 在调用 forEach 遍历 Set 集合时，如果一个值已经被访问过了，但该值被删除并重新添加到集合，如果此时 forEach 遍历没有结束，那么该值会重新被访问。因此，上面的代码会无限执行
    */
}

{
	function trigger(target, key) {
		const depsMap = bucket.get(target);
		if (!depsMap) return;
		const effects = depsMap.get(key);

		const effectsToRun = new Set(effects); // 新增
		effectsToRun.forEach(effectFn => effectFn()); // 新增
		// effects && effects.forEach(effectFn => effectFn()) // 删除
	}
}
