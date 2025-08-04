/**
 * 查找数组的最长递增子序列（LIS），返回其索引数组
 * 思路：
 * 1. 用 res 记录当前 LIS 的索引，初始为第一个元素。
 * 2. 遍历数组，每次用二分查找确定当前元素在 res 中的插入位置。
 *    - 如果比当前 LIS 最后一个元素大，直接加入 res。
 *    - 否则用二分查找找到第一个比它大的位置并替换。
 * 3. 用 p 记录每个元素的前驱索引，便于最后回溯得到完整序列。
 * 4. 最后通过 p 回溯，得到 LIS 的索引数组。
 */
function lis(arr) {
	let len = arr.length; // 获取数组长度，后续遍历用
	let p = arr.slice(); // 用于记录每个元素的前驱索引，方便最后回溯得到完整序列
	let res = [0]; // 存储当前最长递增子序列的索引，初始为第一个元素索引
	let lastIndex; // 用于保存当前最长序列最后一个元素的索引
	let left, right, mid; // 二分查找的辅助变量

	for (let i = 0; i < arr.length; i++) {
		// 遍历数组每个元素
		let arrI = arr[i]; // 当前元素值
		let lastIndex = res[res.length - 1]; // 当前最长递增子序列最后一个元素的索引

		// 如果当前元素比最长递增子序列最后一个元素大，说明可以直接接在后面，序列变长
		if (arrI > arr[lastIndex]) {
			p[i] = lastIndex; // 记录前驱索引，方便回溯
			res.push(i); // 把当前元素索引加入递增序列
		}

		// 如果不能直接接在后面，需要找到合适的位置替换，保持递增序列最优
		left = 0;
		right = res.length - 1;
		// 用二分查找找到第一个比当前元素大的位置，保证效率是O(logn)
		while (left < right) {
			mid = (left + right) >> 1; // 取中间位置
			// 如果中间位置的值小于当前值，说明递增序列还可以往后找
			if (arr[res[mid]] < arrI) {
				left = mid + 1; // 移动左边界
			} else {
				right = mid; // 移动右边界
			}
		}

		// 找到合适位置后，如果当前元素比该位置元素小，说明可以替换，保持递增序列最优
		if (arrI < arr[res[left]]) {
			p[i] = left - 1; // 记录前驱索引，方便回溯
			res[left] = i; // 用当前元素索引替换原位置
		}
	}

	// 回溯得到完整的最长递增子序列的索引
	let first = res.length; // LIS长度
	let end = res[first - 1]; // 最后一个元素的索引
	while (first-- > 0) {
		res[first] = end; // 依次填充结果
		end = p[end]; // 更新end为前驱索引
	}

	return res; // 返回最长递增子序列的索引数组
}

console.log(lis([0, 4, 2, 3, 1])); // 示例输出
