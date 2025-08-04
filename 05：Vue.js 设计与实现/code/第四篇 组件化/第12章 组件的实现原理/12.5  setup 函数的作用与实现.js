function mountComponent(vnode, container, anchor) {
	const componentOptions = vnode.type;
	// 从组件选项中取出 setup 函数
	let { render, data, setup /* 省略其他选项 */ } = componentOptions;

	beforeCreate && beforeCreate();

	const state = data ? reactive(data()) : null;
	const [props, attrs] = resolveProps(propsOption, vnode.props);

	const instance = {
		state,
		props: shallowReactive(props),
		isMounted: false,
		subTree: null,
	};

	// setupContext，由于我们还没有讲解 emit 和 slots，所以暂时只需要 attrs
	const setupContext = { attrs };
	// 调用 setup 函数，将只读版本的 props 作为第一个参数传递，避免用户意外地修改 props 的值，
	// 将 setupContext 作为第二个参数传递
	const setupResult = setup(shallowReadonly(instance.props), setupContext);
	// setupState 用来存储由 setup 返回的数据
	let setupState = null;
	// 如果 setup 函数的返回值是函数，则将其作为渲染函数
	if (typeof setupResult === 'function') {
		// 报告冲突
		if (render) console.error('setup 函数返回渲染函数，render 选项将被忽略');
		// 将 setupResult 作为渲染函数
		render = setupResult;
	} else {
		// 如果 setup 的返回值不是函数，则作为数据状态赋值给 setupState
		setupState = setupResult;
	}

	vnode.component = instance;

	const renderContext = new Proxy(instance, {
		get(t, k, r) {
			const { state, props } = t;
			if (state && k in state) {
				return state[k];
			} else if (k in props) {
				return props[k];
			} else if (setupState && k in setupState) {
				// 渲染上下文需要增加对 setupState 的支持
				return setupState[k];
			} else {
				console.error('不存在');
			}
		},
		set(t, k, v, r) {
			const { state, props } = t;
			if (state && k in state) {
				state[k] = v;
			} else if (k in props) {
				console.warn(`Attempting to mutate prop "${k}". Props are readonly.`);
			} else if (setupState && k in setupState) {
				// 渲染上下文需要增加对 setupState 的支持
				setupState[k] = v;
			} else {
				console.error('不存在');
			}
		},
	});

	// 省略部分代码
}
