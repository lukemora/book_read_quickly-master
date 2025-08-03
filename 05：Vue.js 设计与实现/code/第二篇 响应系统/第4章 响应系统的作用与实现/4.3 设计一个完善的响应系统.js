{
	// 用一个全局变量存储被注册的副作用函数
	let activeEffect;
	// effect 函数用于注册副作用函数
	function effect(fn) {
		// 当调用 effect 注册副作用函数时，将副作用函数 fn 赋值给
		activeEffect = fn;
		// 执行副作用函数
		fn();
	}

	effect(
		// 一个匿名的副作用函数
		() => {
			document.body.innerText = obj.text;
		}
	);
	const obj = new Proxy(data, {
		get(target, key) {
			// 将 activeEffect 中存储的副作用函数收集到“桶”中
			if (activeEffect) {
				// 新增
				bucket.add(activeEffect); // 新增
			} // 新增
			return target[key];
		},
		set(target, key, newVal) {
			target[key] = newVal;
			bucket.forEach(fn => fn());
			return true;
		},
	});

	effect(
		// 匿名副作用函数
		() => {
			console.log('effect run'); // 会打印 2 次
			document.body.innerText = obj.text;
		}
	);

	setTimeout(() => {
		// 副作用函数中并没有读取 notExist 属性的值
		obj.notExist = 'hello vue3';
	}, 1000);
	// 没有在副作用函数与被操作的目标字段之间建立明确的联系;
}

/* 
    被操作（读取）的代理对象 obj；
    被操作（读取）的字段名 text；
    使用 effect 函数注册的副作用函数 effectFn


    effect(function effectFn1() {
        obj1.text1;
    });
    effect(function effectFn2() {
        obj2.text2;
    });

    target1 
        └── text1 
            └── effectFn1 
    target2 
        └── text2 
            └── effectFn2
*/

{
	const obj = new Proxy(data, {
		// 拦截读取操作
		get(target, key) {
			// 没有 activeEffect，直接 return
			if (!activeEffect) return target[key];
			// 根据 target 从“桶”中取得 depsMap，它也是一个 Map 类型：key -->
			effects;
			let depsMap = bucket.get(target);
			// 如果不存在 depsMap，那么新建一个 Map 并与 target 关联
			if (!depsMap) {
				bucket.set(target, (depsMap = new Map()));
			}
			// 再根据 key 从 depsMap 中取得 deps，它是一个 Set 类型，
			// 里面存储着所有与当前 key 相关联的副作用函数：effects
			let deps = depsMap.get(key);
			// 如果 deps 不存在，同样新建一个 Set 并与 key 关联
			if (!deps) {
				depsMap.set(key, (deps = new Set()));
			}
			// 最后将当前激活的副作用函数添加到“桶”里
			deps.add(activeEffect);

			// 返回属性值
			return target[key];
		},
		// 拦截设置操作
		set(target, key, newVal) {
			// 设置属性值
			target[key] = newVal;
			// 根据 target 从桶中取得 depsMap，它是 key --> effects
			const depsMap = bucket.get(target);
			if (!depsMap) return;
			// 根据 key 取得所有副作用函数 effects
			const effects = depsMap.get(key);
			// 执行副作用函数
			effects && effects.forEach(fn => fn());
		},
	});
}
/* 
    weakMap
    └── target1
        └── Map
            ├── key1
            │   └── Set
            │       └── effectFn1
            ├── key2
            │   └── Set
            │       └── effectFn2
    └── target2
        └── Map
            ├── key3
            │   └── Set
            │       └── effectFn3
            ├── key4
            │   └── Set
            │       └── effectFn4

*/

// 这样就可以在副作用函数与被操作的目标字段之间建立明确的联系了

{
	const map = new Map();
	const weakmap = new WeakMap();

	(function () {
		const foo = { foo: 1 };
		const bar = { bar: 2 };

		map.set(foo, 1);
		weakmap.set(bar, 2);
	})();

	/* 
    
        简单地说，WeakMap 对 key 是弱引用，不影响垃圾回收器的工作。据这个特性可知，一旦 key 被垃圾回收器回收，那么对应的键和值就访问不到了。所以 WeakMap 经常用于存储那些只有当 key 所引用的对象存在时（没有被回收）才有价值的信息，例如上面的场景中，如果 target 对象没有任何引用了，说明用户侧不再需要它了，这时垃圾回收器会完成回收任务。但如果使用 Map 来代替 WeakMap，那么即使用户侧的代码对 target 没有任何引用，这个 target 也不会被回收，最终可能导致内存溢出。
    
    */
}

{
	const obj = new Proxy(data, {
		// 拦截读取操作
		get(target, key) {
			// 将副作用函数 activeEffect 添加到存储副作用函数的桶中
			track(target, key);
			// 返回属性值
			return target[key];
		},
		// 拦截设置操作
		set(target, key, newVal) {
			// 设置属性值
			target[key] = newVal;
			// 把副作用函数从桶里取出并执行
			trigger(target, key);
		},
	});

	// 在 get 拦截函数内调用 track 函数追踪变化
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
		deps.add(activeEffect);
	}
	// 在 set 拦截函数内调用 trigger 函数触发变化
	function trigger(target, key) {
		const depsMap = bucket.get(target);
		if (!depsMap) return;
		const effects = depsMap.get(key);
		effects && effects.forEach(fn => fn());
	}
}
