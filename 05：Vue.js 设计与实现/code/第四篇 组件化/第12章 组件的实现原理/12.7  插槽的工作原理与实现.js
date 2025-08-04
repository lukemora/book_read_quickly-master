function mountComponent(vnode, container, anchor) {
	// 省略部分代码

	// 直接使用编译好的 vnode.children 对象作为 slots 对象即可
	const slots = vnode.children || {};

	// 将 slots 对象添加到 setupContext 中
	const setupContext = { attrs, emit, slots };

	const instance = {
		state,
		props: shallowReactive(props),
		isMounted: false,
		subTree: null,
		// 将插槽添加到组件实例上
		slots,
	};

	// 省略部分代码

	const renderContext = new Proxy(instance, {
		get(t, k, r) {
			const { state, props, slots } = t;
			// 当 k 的值为 $slots 时，直接返回组件实例上的 slots
			if (k === '$slots') return slots;

			// 省略部分代码
		},
		set(t, k, v, r) {
			// 省略部分代码
		},
	});

	// 省略部分代码
}
