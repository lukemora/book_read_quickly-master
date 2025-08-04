function patchKeyedChildren(n1, n2, container) {
	const newChildren = n2.children;
	const oldChildren = n1.children;
	// 处理相同的前置节点
	// 索引 j 指向新旧两组子节点的开头
	let j = 0;
	let oldVNode = oldChildren[j];
	let newVNode = newChildren[j];
	// while 循环向后遍历，直到遇到拥有不同 key 值的节点为止
	while (oldVNode.key === newVNode.key) {
		// 调用 patch 函数进行更新
		patch(oldVNode, newVNode, container);
		// 更新索引 j，让其递增
		j++;
		oldVNode = oldChildren[j];
		newVNode = newChildren[j];
	}

	// 更新相同的后置节点
	// 索引 oldEnd 指向旧的一组子节点的最后一个节点
	let oldEnd = oldChildren.length - 1;
	// 索引 newEnd 指向新的一组子节点的最后一个节点
	let newEnd = newChildren.length - 1;

	oldVNode = oldChildren[oldEnd];
	newVNode = newChildren[newEnd];

	// while 循环从后向前遍历，直到遇到拥有不同 key 值的节点为止
	while (oldVNode.key === newVNode.key) {
		// 调用 patch 函数进行更新
		patch(oldVNode, newVNode, container);
		// 递减 oldEnd 和 nextEnd
		oldEnd--;
		newEnd--;
		oldVNode = oldChildren[oldEnd];
		newVNode = newChildren[newEnd];
	}

	// 预处理完毕后，如果满足如下条件，则说明从 j --> newEnd 之间的节点应作为新节点插入
	// j > oldEnd 说明旧节点已经处理完了
	// j<= newEnd 说明新节点还有节点没有处理
	if (j > oldEnd && j <= newEnd) {
		// 锚点的索引
		const anchorIndex = newEnd + 1;
		// 锚点元素
		const anchor = anchorIndex < newChildren.length ? newChildren[anchorIndex].el : null;
		// 采用 while 循环，调用 patch 函数逐个挂载新增节点
		while (j <= newEnd) {
			patch(null, newChildren[j++], container, anchor);
		}
	} else if (j > newEnd && j <= oldEnd) {
		// j -> oldEnd 之间的节点应该被卸载
		while (j <= oldEnd) {
			unmount(oldChildren[j++]);
		}
	}
}
