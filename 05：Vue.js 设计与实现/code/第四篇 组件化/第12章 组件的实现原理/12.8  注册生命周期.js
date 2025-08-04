// 全局变量，存储当前正在被初始化的组件实例
let currentInstance = null;
// 该方法接收组件实例作为参数，并将该实例设置为 currentInstance
function setCurrentInstance(instance) {
	currentInstance = instance;
}

function mountComponent(vnode, container, anchor) {
	// 省略部分代码

	const instance = {
		state,
		props: shallowReactive(props),
		isMounted: false,
		subTree: null,
		slots,
		// 在组件实例中添加 mounted 数组，用来存储通过 onMounted 函数注册的生命周期钩子函数
		mounted: [],
	};

	// 省略部分代码

	// setup
	const setupContext = { attrs, emit, slots };

	// 在调用 setup 函数之前，设置当前组件实例
	setCurrentInstance(instance);
	// 执行 setup 函数
	const setupResult = setup(shallowReadonly(instance.props), setupContext);
	// 在 setup 函数执行完毕之后，重置当前组件实例
	setCurrentInstance(null);

	// 省略部分代码
	effect(
		() => {
			const subTree = render.call(renderContext, renderContext);
			if (!instance.isMounted) {
				// 省略部分代码

				// 遍历 instance.mounted 数组并逐个执行即可
				instance.mounted && instance.mounted.forEach(hook => hook.call(renderContext));
			} else {
				// 省略部分代码
			}
			instance.subTree = subTree;
		},
		{
			scheduler: queueJob,
		}
	);
}

function onMounted(fn) {
	if (currentInstance) {
		// 将生命周期函数添加到 instance.mounted 数组中
		currentInstance.mounted.push(fn);
	} else {
		console.error('onMounted 函数只能在 setup 中调用');
	}
}
