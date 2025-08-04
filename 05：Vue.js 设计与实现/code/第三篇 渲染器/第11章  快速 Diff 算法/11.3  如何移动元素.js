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

		// 构造 sources数组
		// 新的一组节点中剩余未处理节点的数量
		const count = newEnd - j + 1;
		// 用来存储新的一组子节点中的节点在旧的一组子节点中的位置索引，后面将会使用它计算出一个最长递增子序列，并用来辅助完成dom移动的操作
		const sources = new Array(count).fill(-1);

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

					// 数组 sources 的索引是从 0 开始的，而未处理节点的索引未必从 0 开始，所以在填充数组时需要使用表达式k - newStart 的值作为数组的索引值。外层循环的变量 i 就是当前节点在旧的一组子节点中的位置索引
					sources[k - newStart] = i;
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

		if (moved) {
			// 如果 moved 为真，则需要进行 DOM 移动操作

			// 计算最长递增子序列

			const seq = lis(sources); // [0,1]
			// s 指向最长递增子序列的最后一个元素
			let s = seq.length - 1;
			// i 指向新的一组子节点的最后一个元素
			let i = count - 1;
			// seq内的值是不需要移动的
			for (i; i >= 0; i--) {
				// 说明是新增元素
				if (sources[i] === -1) {
					// 说明索引为i的节点是全新节点，应该将其挂载
					// 于是我们调用 patch 函数将其挂载到容器中。这里需要注意的是，由于索引 i 是重新编号后的，因此为了得到真实索引值，我们需要计算表达式 i + newStart 的值
					const pos = i + newStart;
					const newVNode = newChildren[pos];
					// 该节点的下一个节点位置的索引
					const nextPos = pos + 1;
					// 锚点
					const anchor = nextPos < newChildren.length ? newChildren[nextPos].el : null;
					// 挂载
					patch(null, newVNode, container, anchor);
				} else if (i !== seq[s]) {
					// 如果节点的所有i不等于seq[s]的值，说明该节点需要移动

					// 该节点在新的一组子节点中的真实位置索引
					const pos = i + newStart;
					const newVNode = newChildren[pos];
					// 该节点的下一个节点的位置索引
					const nextPos = pos + 1;
					// 锚点
					const anchor = nextPos < newChildren.length ? newChildren[nextPos].el : null;
					// 挂载
					insert(newVNode.el, container, anchor);
				} else {
					// 当i===seq[s]时，说明该位置的节点不需要移动
					// 只需要让 s 指向下一个位置
					s--;
				}
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
function insert() {}
function unmount() {}

/* 
    判断是否需要进行 DOM 移动操作。我们创建了变量 moved 作为标识，当它的值为 true 时，说明需要进行 DOM 移动操作。
    构建 sources 数组。该数组的长度等于新的一组子节点去掉相同的前置/后置节点后，剩余未处理节点的数量。sources 数组中存储着新的一组子节点中的节点在旧的一组子节点中的位置，后面我们会根据 sources 数组计算出一个最长递增子序列，用于DOM 移动操作。
*/

/* 
    什么是一个序列的递增子序列。
    简单来说，给定一个数值序列，找到它的一个子序列，并且该子序列中的值是递增的，子序列中的元素在原序列中不一定连续。一个序列可能有很多个递增子序列，其中最长的那一个就称为最长递增子序列。
    举个例子，假设给定数值序列 [ 0, 8, 4, 12 ]，那么它的最长递增子序列就是 [0, 8, 12]。
    当然，对于同一个数值序列来说，它的最长递增子序列可能有多个，例如 [0, 4, 12] 也是本例的答案之一
*/

function lis(arr) {
	// [2,3,1,-1]
	const p = arr.slice();
	const result = [0];

	let index, lastIndex, left, right, mid;
	const len = arr.length;
	for (index = 0; index < len; index++) {
		const arrI = arr[index];
		if (arrI !== -1) {
			lastIndex = result[result.length - 1];
			if (arrI > arr[lastIndex]) {
				p[index] = lastIndex;
				result.push(index);
				continue;
			}
			left = 0;
			right = result.length - 1;
			while (left < right) {
				mid = (left + right) >> 1;
				if (arr[result[mid]] < arrI) {
					left = mid + 1;
				} else {
					right = mid;
				}
			}

			if (arrI < arr[result[left]]) {
				if (left > 0) {
					p[index] = result[left - 1];
				}
				result[left] = index;
			}
		}
	}

	first = result.length;
	end = result[first - 1];
	while (first-- > 0) {
		result[first] = end;
		end = p[end];
	}
	return result;
}
