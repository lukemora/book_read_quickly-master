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
