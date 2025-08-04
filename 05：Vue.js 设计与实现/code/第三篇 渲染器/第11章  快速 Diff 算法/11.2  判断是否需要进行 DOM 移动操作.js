function patchKeyedChildren(n1, n2, container) {
	const newChildren = n2;
	const oldChildren = n1;
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
	} else {
		// 增加else分支处理非理想情况

		// 构造 source数组
		// 新的一组节点中剩余未处理节点的数量
		const count = newEnd - j + 1;
		// 用来存储新的一组子节点中的节点在旧的一组子节点中的位置索引，后面将会使用它计算出一个最长递增子序列，并用来辅助完成dom移动的操作
		const source = new Array(count).fill(-1);

		// oldStart 和 newStart 分别为起始索引，即 j
		const oldStart = j;
		const newStart = j;
		//是否需要移动节点;
		let moved = false;
		// 遍历旧的一组子节点的过程中遇到的最大索引值 k
		/* 
            遍历过程中遇到的索引值呈现递增趋势，说明不需要移动节点，泛指则需要
        */
		let pos = 0;

		const keyIndex = {};
		for (let i = newStart; i <= newEnd; i++) {
			keyIndex[newChildren[i].key] = i;
		}
		// 代表更新过的节点数量
		/* 
            已经更新过的节点数量应该小于新的一组子节点中需要更新的节点数量，一旦前者超过后者，则说明有多余的节点，需要将他们卸载
        */
		let patched = 0;

		for (let i = oldStart; i <= oldEnd; i++) {
			oldVNode = oldChildren[i];
			// 如果更新过的节点数量小于等于需要更新的节点数量，则执行更新
			if (patched <= count) {
				// 通过索引表快速找到新的一组子节点中具有相同 key 值的节点位
				const k = keyIndex[oldVNode.key];

				if (k !== undefined) {
					newVNode = newChildren[k];
					patch(oldVNode, newVNode, container);
					// 没更新一个节点，都将patched变量+1
					patched++;

					// 数组 source 的索引是从 0 开始的，而未处理节点的索引未必从 0 开始，所以在填充数组时需要使用表达式k - newStart 的值作为数组的索引值。外层循环的变量 i 就是当前节点在旧的一组子节点中的位置索引
					source[k - newStart] = i;
					// 通过变量k与变量k的值来判断是否需要移动节点
					if (k < pos) {
						moved = true;
					} else {
						pos = k;
					}
				} else {
					// 没找到
					unmount(oldVNode);
				}
			} else {
				unmount(oldVNode);
			}
		}
	}
}

/* 
    判断有节点是否需要移动，以及应该如何移动
    找出那些需要被添加或移除的节点
*/

patchKeyedChildren(
	[{ key: 'p1' }, { key: 'p2' }, { key: 'p3' }, { key: 'p4' }, { key: 'p6' }, { key: 'p5' }],
	[{ key: 'p1' }, { key: 'p3' }, { key: 'p4' }, { key: 'p2' }, { key: 'p7' }, { key: 'p5' }],
	null
);

function patch() {}
function unmount() {}
