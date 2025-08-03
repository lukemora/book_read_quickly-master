function patchElement(n1, n2) {
	// 新的 vnode 也引用了真实 DOM 元素
	const el = (n2.el = n1.el);
	// 省略部分代码
}

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
			for (j; j < oldChildren.length; j++) {
				const oldVNode = oldChildren[j];
				if (newVNode.key === oldVNode.key) {
					patch(oldVNode, newVNode, container);
					if (j < lastIndex) {
						// 代码运行到这里，说明 newVNode 对应的真实 DOM 需要移动
						// 先获取 newVNode 的前一个 vnode，即 prevVNode
						const prevVNode = newChildren[i - 1];
						// 如果 prevVNode 不存在，则说明当前 newVNode 是第一个节点，它不需要移动
						if (prevVNode) {
							// 由于我们要将 newVNode 对应的真实 DOM 移动到 prevVNode 所对应真实 DOM 后面，
							// 所以我们需要获取 prevVNode 所对应真实 DOM 的下一个兄弟节点，并将其作为锚点
							const anchor = prevVNode.el.nextSibling;
							// 调用 insert 方法将 newVNode 对应的真实 DOM 插入到锚点元素前面，
							// 也就是 prevVNode 对应真实 DOM 的后面
							insert(newVNode.el, container, anchor);
						}
					} else {
						lastIndex = j;
					}
					break;
				}
			}
		}
	} else {
		// 省略部分代码
	}
}
