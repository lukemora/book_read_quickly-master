function mountComponent(vnode, container, anchor) {
	const componentOptions = vnode.type;
	// 从组件选项对象中取出 props 定义，即 propsOption
	const { render, data, props: propsOption /* 其他省略 */ } = componentOptions;

	beforeCreate && beforeCreate();

	const state = reactive(data());
	// 调用 resolveProps 函数解析出最终的 props 数据与 attrs 数据
	const [props, attrs] = resolveProps(propsOption, vnode.props);

	const instance = {
		state,
		// 将解析出的 props 数据包装为 shallowReactive 并定义到组件实例上
		props: shallowReactive(props),
		isMounted: false,
		subTree: null,
	};
	vnode.component = instance;

	// 省略部分代码

	// 创建渲染上下文对象，本质上是组件实例的代理
	const renderContext = new Proxy(instance, {
		get(t, k, r) {
			// 取得组件自身状态与 props 数据
			const { state, props } = t;
			// 先尝试读取自身状态数据
			if (state && k in state) {
				return state[k];
			} else if (k in props) {
				// 如果组件自身没有该数据，则尝试从 props 中读取
				return props[k];
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
			} else {
				console.error('不存在');
			}
		},
	});

	// 生命周期函数调用时要绑定渲染上下文对象
	created && created.call(renderContext);

	// 省略部分代码
}

// resolveProps 函数用于解析组件 props 和 attrs 数据
function resolveProps(options, propsData) {
	const props = {};
	const attrs = {};
	// 遍历为组件传递的 props 数据
	for (const key in propsData) {
		if (key in options) {
			// 如果为组件传递的 props 数据在组件自身的 props 选项中有定义，则将其视为合法的 props
			props[key] = propsData[key];
		} else {
			// 否则将其作为 attrs
			attrs[key] = propsData[key];
		}
	}

	// 最后返回 props 与 attrs 数据
	return [props, attrs];
}

function patchComponent(n1, n2, anchor) {
	// 获取组件实例，即 n1.component，同时让新的组件虚拟节点 n2.component 也指向组件实例
	const instance = (n2.component = n1.component);
	// 获取当前的 props 数据
	const { props } = instance;
	// 调用 hasPropsChanged 检测为子组件传递的 props 是否发生变化，如果没有变化，则不需要更新
	if (hasPropsChanged(n1.props, n2.props)) {
		// 调用 resolveProps 函数重新获取 props 数据
		const [nextProps] = resolveProps(n2.type.props, n2.props);
		// 更新 props
		for (const k in nextProps) {
			props[k] = nextProps[k];
		}
		// 删除不存在的 props
		for (const k in props) {
			if (!(k in nextProps)) delete props[k];
		}
	}
}

function hasPropsChanged(prevProps, nextProps) {
	const nextKeys = Object.keys(nextProps);
	// 如果新旧 props 的数量变了，则说明有变化
	if (nextKeys.length !== Object.keys(prevProps).length) {
		return true;
	}
	// 只有
	for (let i = 0; i < nextKeys.length; i++) {
		const key = nextKeys[i];
		// 有不相等的 props，则说明有变化
		if (nextProps[key] !== prevProps[key]) return true;
	}
	return false;
}
