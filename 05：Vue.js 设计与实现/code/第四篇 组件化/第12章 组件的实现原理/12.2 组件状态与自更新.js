// 任务缓存队列，用一个 Set 数据结构来表示，这样就可以自动对任务进行去重
const queue = new Set();
// 一个标志，代表是否正在刷新任务队列
let isFlushing = false;
// 创建一个立即 resolve 的 Promise 实例
const p = Promise.resolve();

// 调度器的主要函数，用来将一个任务添加到缓冲队列中，并开始刷新队列
function queueJob(job) {
	// 将 job 添加到任务队列 queue 中
	queue.add(job);
	// 如果还没有开始刷新队列，则刷新之
	if (!isFlushing) {
		// 将该标志设置为 true 以避免重复刷新
		isFlushing = true;
		// 在微任务中刷新缓冲队列
		p.then(() => {
			try {
				// 执行任务队列中的任务
				queue.forEach(job => job());
			} finally {
				// 重置状态
				isFlushing = false;
				queue.clear = 0;
			}
		});
	}
}

function mountComponent(vnode, container, anchor) {
	const componentOptions = vnode.type;
	const { render, data } = componentOptions;

	const state = reactive(data());

	effect(
		() => {
			const subTree = render.call(state, state);
			patch(null, subTree, container, anchor);
		},
		{
			// 指定该副作用函数的调度器为 queueJob 即可
			scheduler: queueJob,
		}
	);
}

/* 
上面这段代码存在缺陷。可以看到，我们在 effect 函数
内调用 patch 函数完成渲染时，第一个参数总是 null。这意味着，
每次更新发生时都会进行全新的挂载，而不会打补丁，这是不正确
的。正确的做法是：每次更新时，都拿新的 subTree 与上一次组件所
渲染的 subTree 进行打补丁。为此，我们需要实现组件实例，用它来
维护组件整个生命周期的状态，这样渲染器才能够在正确的时机执行
合适的操作
*/
