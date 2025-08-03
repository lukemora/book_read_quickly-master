{
	// 原始数据
	const data = { foo: true, bar: true };
	// 代理对象
	const obj = new Proxy(data, {
		/* ... */
	});

	// 全局变量
	let temp1, temp2;

	// effectFn1 嵌套了 effectFn2
	effect(function effectFn1() {
		console.log('effectFn1 执行');

		effect(function effectFn2() {
			console.log('effectFn2 执行');
			// 在 effectFn2 中读取 obj.bar 属性
			temp2 = obj.bar;
		});
		// 在 effectFn1 中读取 obj.foo 属性
		temp1 = obj.foo;
	});

	/* 
        data 
          └── foo 
            └── effectFn1 
          └── bar 
            └── effectFn2

            修改foo属性时
            'effectFn1 执行' 
            'effectFn2 执行' 
            'effectFn2 执行'
    */
	{
		// 用一个全局变量存储当前激活的 effect 函数
		let activeEffect;
		function effect(fn) {
			const effectFn = () => {
				cleanup(effectFn);
				// 当调用 effect 注册副作用函数时，将副作用函数赋值给 activeEffect
				activeEffect = effectFn;
				fn();
			};
			// activeEffect.deps 用来存储所有与该副作用函数相关的依赖集合
			effectFn.deps = [];
			// 执行副作用函数
			effectFn();
		}
	}
	// activeEffect为全局变量表示同一个时刻只能有一个，在嵌套的情况下，内层的就会覆盖了原有的外层的副作用函数导致问题
	// 所以需要一个栈结构，在副作用函数执行时，将当前副作用函数压入栈中，副作用函数执行完毕后出栈，始终让 activeEffect 指向栈顶的副作用函数
}

{
	// 用一个全局变量存储当前激活的 effect 函数
	let activeEffect;
	// effect 栈
	const effectStack = []; // 新增

	function effect(fn) {
		const effectFn = () => {
			cleanup(effectFn);
			// 当调用 effect 注册副作用函数时，将副作用函数赋值给 activeEffect
			activeEffect = effectFn;
			// 在调用副作用函数之前将当前副作用函数压入栈中
			effectStack.push(effectFn); // 新增
			fn();
			// 在当前副作用函数执行完毕后，将当前副作用函数弹出栈，并把 activeEffect 还原为之前的值
			effectStack.pop(); // 新增
			activeEffect = effectStack[effectStack.length - 1]; // 新增
		};
		// activeEffect.deps 用来存储所有与该副作用函数相关的依赖集合
		effectFn.deps = [];
		// 执行副作用函数
		effectFn();
	}
}
