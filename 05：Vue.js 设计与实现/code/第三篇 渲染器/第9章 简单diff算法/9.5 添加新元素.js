function patchChildren(n1, n2, container) {
	if (typeof n2.children === 'string') {
		// 省略部分代码
	} else if (Array.isArray(n2.children)) {
		const oldChildren = n1.children;
		const newChildren = n2.children;

		let lastIndex = 0;
		for (let i = 0; i < newChildren.length; i++) {
			const newVNode = newChildren[i];
			let j = 0;
			// 在第一层循环中定义变量 find，代表是否在旧的一组子节点中找到可复用的节点，
			// 初始值为 false，代表没找到
			let find = false;
			for (j; j < oldChildren.length; j++) {
				const oldVNode = oldChildren[j];
				if (newVNode.key === oldVNode.key) {
					// 一旦找到可复用的节点，则将变量 find 的值设为 true
					find = true;
					patch(oldVNode, newVNode, container);
					if (j < lastIndex) {
						const prevVNode = newChildren[i - 1];
						if (prevVNode) {
							const anchor = prevVNode.el.nextSibling;
							insert(newVNode.el, container, anchor);
						}
					} else {
						lastIndex = j;
					}
					break;
				}
			}
			// 如果代码运行到这里，find 仍然为 false，
			// 说明当前 newVNode 没有在旧的一组子节点中找到可复用的节点
			// 也就是说，当前 newVNode 是新增节点，需要挂载
			if (!find) {
				// 为了将节点挂载到正确位置，我们需要先获取锚点元素
				// 首先获取当前 newVNode 的前一个 vnode 节点
				const prevVNode = newChildren[i - 1];
				let anchor = null;
				if (prevVNode) {
					// 如果有前一个 vnode 节点，则使用它的下一个兄弟节点作为锚点元素
					anchor = prevVNode.el.nextSibling;
				} else {
					// 如果没有前一个 vnode 节点，说明即将挂载的新节点是第一个子节点
					// 这时我们使用容器元素的 firstChild 作为锚点
					anchor = container.firstChild;
				}
				// 挂载 newVNode
				patch(null, newVNode, container, anchor);
			}
		}
	} else {
		// 省略部分代码
	}
}

// patch 函数需要接收第四个参数，即锚点元素
function patch(n1, n2, container, anchor) {
	// 省略部分代码

	if (typeof type === 'string') {
		if (!n1) {
			// 挂载时将锚点元素作为第三个参数传递给 mountElement 函数
			mountElement(n2, container, anchor);
		} else {
			patchElement(n1, n2);
		}
	} else if (type === Text) {
		// 省略部分代码
	} else if (type === Fragment) {
		// 省略部分代码
	}
}

// mountElement 函数需要增加第三个参数，即锚点元素
function mountElement(vnode, container, anchor) {
	// 省略部分代码

	// 在插入节点时，将锚点元素透传给 insert 函数
	insert(el, container, anchor);
}
