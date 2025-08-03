const oldVNode = {
	type: 'div',
	children: [
		{ type: 'p', children: '1', key: 1 },
		{ type: 'p', children: '2', key: 2 },
		{ type: 'p', children: 'hello', key: 3 },
	],
};

const newVNode = {
	type: 'div',
	children: [
		{ type: 'p', children: 'world', key: 3 },
		{ type: 'p', children: '1', key: 1 },
		{ type: 'p', children: '2', key: 2 },
	],
};

function patchChildren(n1, n2, container) {
	if (typeof n2.children === 'string') {
		// 省略部分代码
	} else if (Array.isArray(n2.children)) {
		const oldChildren = n1.children;
		const newChildren = n2.children;

		// 用来存储寻找过程中遇到的最大索引值
		let lastIndex = 0;
		for (let i = 0; i < newChildren.length; i++) {
			const newVNode = newChildren[i];
			for (let j = 0; j < oldChildren.length; j++) {
				const oldVNode = oldChildren[j];
				if (newVNode.key === oldVNode.key) {
					patch(oldVNode, newVNode, container);
					if (j < lastIndex) {
						// 如果当前找到的节点在旧 children 中的索引小于最大索引值 lastIndex，
						// 说明该节点对应的真实 DOM 需要移动
					} else {
						// 如果当前找到的节点在旧 children 中的索引不小于最大索引值，
						// 则更新 lastIndex 的值
						lastIndex = j;
					}
					break; // 这里需要 break
				}
			}
		}
	} else {
		// 省略部分代码
	}
}

patchChildren(oldVNode, newVNode);
