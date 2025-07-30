{
	/* 
    当 immediate 选项存在并且为 true 时，回调函数会在该
watch 创建时立刻执行一次。仔细思考就会发现，回调函数的立即执
行与后续执行本质上没有任何差别，所以我们可以把 scheduler 调
度函数封装为一个通用函数，分别在初始化和变更时执行它
    
    */
	function watch(source, cb, options = {}) {
		let getter;
		if (typeof source === 'function') {
			getter = source;
		} else {
			getter = () => traverse(source);
		}

		let oldValue, newValue;

		// 提取 scheduler 调度函数为一个独立的 job 函数
		const job = () => {
			newValue = effectFn();
			cb(newValue, oldValue);
			oldValue = newValue;
		};

		const effectFn = effect(
			// 执行 getter
			() => getter(),
			{
				lazy: true,
				// 使用 job 函数作为调度器函数
				scheduler: job,
			}
		);

		if (options.immediate) {
			// 当 immediate 为 true 时立即执行 job，从而触发回调执行
			job();
		} else {
			oldValue = effectFn();
		}
	}
}

{
	/* 
    flush 本质上是在指定调度函数的执行时机。前文讲解过如何在
微任务队列中执行调度函数 scheduler，这与 flush 的功能相同。
当 flush 的值为 'post' 时，代表调度函数需要将副作用函数放到一
个微任务队列中，并等待 DOM 更新结束后再执行
    */

	function watch(source, cb, options = {}) {
		let getter;
		if (typeof source === 'function') {
			getter = source;
		} else {
			getter = () => traverse(source);
		}

		let oldValue, newValue;

		const job = () => {
			newValue = effectFn();
			cb(newValue, oldValue);
			oldValue = newValue;
		};

		const effectFn = effect(
			// 执行 getter
			() => getter(),
			{
				lazy: true,
				scheduler: () => {
					// 在调度函数中判断 flush 是否为 'post'，如果是，将其放到微任务队列中执行;
					if (options.flush === 'post') {
						const p = Promise.resolve();
						p.then(job);
					} else {
						job();
					}
				},
			}
		);

		if (options.immediate) {
			job();
		} else {
			oldValue = effectFn();
		}
	}
}
