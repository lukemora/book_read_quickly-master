function createRenderer() {
	function patch(n1, n2, container) {
		// 如果 n1 不存在，意味着挂载，则调用 mountElement 函数完成挂载
		if (!n1) {
			mountElement(n2, container);
		} else {
			// n1 存在，意味着打补丁，暂时省略
		}
	}

	function render(vnode, container) {
		if (vnode) {
			patch(container._vnode, vnode, container);
		} else {
			if (container._vnode) {
				container.innerHTML = '';
			}
		}
		container._vnode = vnode;
	}

	function mountElement(vnode, container) {
		// 创建 DOM 元素
		const el = document.createElement(vnode.type);
		// 处理子节点，如果子节点是字符串，代表元素具有文本节点
		if (typeof vnode.children === 'string') {
			// 因此只需要设置元素的 textContent 属性即可
			el.textContent = vnode.children;
		}
		// 将元素添加到容器中
		container.appendChild(el);
	}

	return {
		render,
	};
}

{
	// 在创建 renderer 时传入配置项
	const renderer = createRenderer({
		// 用于创建元素
		createElement(tag) {
			return document.createElement(tag);
		},
		// 用于设置元素的文本节点
		setElementText(el, text) {
			el.textContent = text;
		},
		// 用于在给定的 parent 下添加指定元素
		insert(el, parent, anchor = null) {
			parent.insertBefore(el, anchor);
		},
	});

	function createRenderer(options) {
		// 通过 options 得到操作 DOM 的 API
		const { createElement, insert, setElementText } = options;

		// 在这个作用域内定义的函数都可以访问那些 API
		function mountElement(vnode, container) {
			// 调用 createElement 函数创建元素
			const el = createElement(vnode.type);
			if (typeof vnode.children === 'string') {
				// 调用 setElementText 设置元素的文本节点
				setElementText(el, vnode.children);
			}
			// 调用 insert 函数将元素插入到容器内
			insert(el, container);
		}

		function patch(n1, n2, container) {
			// ...
		}

		function render(vnode, container) {
			// ...
		}

		return {
			render,
		};
	}
}
