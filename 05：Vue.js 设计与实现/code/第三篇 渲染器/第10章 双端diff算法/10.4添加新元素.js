function patchChildren(n1, n2, container) {
	if (typeof n2.children === 'string') {
		// 省略部分代码
	} else if (Array.isArray(n2.children)) {
		// 封装 patchKeyedChildren 函数处理两组子节点
		patchKeyedChildren(n1, n2, container);
	} else {
		// 省略部分代码
	}
}

function patchKeyedChildren(n1, n2, container) {
	const oldChildren = n1.children;
	const newChildren = n2.children;
	// 四个索引值
	let oldStartIdx = 0;
	let oldEndIdx = oldChildren.length - 1;
	let newStartIdx = 0;
	let newEndIdx = newChildren.length - 1;
	// 四个索引指向的 vnode 节点
	let oldStartVNode = oldChildren[oldStartIdx];
	let oldEndVNode = oldChildren[oldEndIdx];
	let newStartVNode = newChildren[newStartIdx];
	let newEndVNode = newChildren[newEndIdx];
	while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
		// 增加两个判断分支，如果头尾部节点为 undefined，则说明该节点已经被处理过了，直接跳到下一个位置
		if (!oldStartVNode) {
			oldStartVNode = oldChildren[++oldStartIdx];
		} else if (!oldEndVNode) {
			oldEndVNode = oldChildren[--oldEndIdx];
		} else if (oldStartVNode.key === newStartVNode.key) {
			// 第一步：oldStartVNode 和 newStartVNode 比较
			// 调用 patch 函数在 oldStartVNode 与 newStartVNode 之间打补丁
			patch(oldStartVNode, newStartVNode, container);
			// 更新相关索引，指向下一个位置
			oldStartVNode = oldChildren[++oldStartIdx];
			newStartVNode = newChildren[++newStartIdx];
		} else if (oldEndVNode.key === newEndVNode.key) {
			// 第二步：oldEndVNode 和 newEndVNode 比较
			// 节点在新的顺序中仍然处于尾部，不需要移动，但仍需打补丁
			patch(oldEndVNode, newEndVNode, container);
			// 更新索引和头尾部节点变量
			oldEndVNode = oldChildren[--oldEndIdx];
			newEndVNode = newChildren[--newEndIdx];
		} else if (oldStartVNode.key === newEndVNode.key) {
			// 第三步：oldStartVNode 和 newEndVNode 比较
			patch(oldStartVNode, newEndVNode, container);
			// 将旧的一组子节点的头部节点对应的真实 DOM 节点 oldStartVNode.el 移动到
			// 旧的一组子节点的尾部节点对应的真实 DOM 节点后面
			insert(oldStartVNode.el, container, oldEndVNode.el.nextSibling);
			// 更新相关索引到下一个位置
			oldStartVNode = oldChildren[++oldStartIdx];
			newEndVNode = newChildren[--newEndIdx];
		} else if (oldEndVNode.key === newStartVNode.key) {
			// 第四步：oldEndVNode 和 newStartVNode 比较
			// 仍然需要调用 patch 函数进行打补丁
			patch(oldEndVNode, newStartVNode, container);
			// 移动 DOM 操作
			// oldEndVNode.el 移动到 oldStartVNode.el 前面
			insert(oldEndVNode.el, container, oldStartVNode.el);

			// 移动 DOM 完成后，更新索引值，并指向下一个位置
			oldEndVNode = oldChildren[--oldEndIdx];
			newStartVNode = newChildren[++newStartIdx];
		} else {
			// 处理上述都没有找到复用节点的情况
			// 遍历旧的一组子节点，试图寻找与 newStartVNode 拥有相同 key 值的节点
			// idxInOld 就是新的一组子节点的头部节点在旧的一组子节点中的索引
			const idxInOld = oldChildren.findIndex(node => node.key === newStartVNode.key);

			// idxInOld 大于 0，说明找到了可复用的节点，并且需要将其对应的真实 DOM 移动到头部
			if (idxInOld > 0) {
				// idxInOld 位置对应的 vnode 就是需要移动的节点
				const vnodeToMove = oldChildren[idxInOld];
				// 不要忘记除移动操作外还应该打补丁
				patch(vnodeToMove, newStartVNode, container);
				// 将 vnodeToMove.el 移动到头部节点 oldStartVNode.el 之前，因此使用后者作为锚点
				insert(vnodeToMove.el, container, oldStartVNode.el);
				// 由于位置 idxInOld 处的节点所对应的真实 DOM 已经移动到了别处，因此将其设置为 undefined
				oldChildren[idxInOld] = undefined;
				// 最后更新 newStartIdx 到下一个位置
				newStartVNode = newChildren[++newStartIdx];
			} else {
				// 将 newStartVNode 作为新节点挂载到头部，使用当前头部节点 oldStartVNode.el 作为锚点
				patch(null, newStartVNode, container, oldStartVNode.el);
			}
			newStartVNode = newChildren[++newStartIdx];
		}
	}

	/* 
        oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx， 在新旧不等长时会因一遍的尾标大于头标而停止循环，另外一边就会遗漏
    */

	// 循环结束后检查索引值的情况，
	if (oldEndIdx < oldStartIdx && newStartIdx <= newEndIdx) {
		// 如果满足条件，则说明有新的节点遗留，需要挂载它们
		for (let i = newStartIdx; i <= newEndIdx; i++) {
			patch(null, newChildren[i], container, oldStartVNode.el);
		}
	} else if (newEndIdx < newStartIdx && oldStartIdx <= oldEndIdx) {
		// 移除操作
		for (let i = oldStartIdx; i <= oldEndIdx; i++) {
			unmount(oldChildren[i]);
		}
	}
}
/* 

    总结： 在新旧两组子节点的四个端点之间分别进行比较，并试图找到可复用的节点。相比简单 Diff 算法，双端 Diff 算法的优势在于，对于同样的更新场景，执行的 DOM 移动操作次数更少。

*/
