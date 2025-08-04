function createRenderer() {
	function patch(n1, n2, container) {
		// 如果 n1 存在，则对比 n1 和 n2 的类型
		if (n1 && n1.type !== n2.type) {
			// 如果新旧 vnode 的类型不同，则直接将旧 vnode 卸载
			unmount(n1);
			n1 = null;
		}
		// 代码运行到这里，证明 n1 和 n2 所描述的内容相同
		const { type } = n2;
		// 如果 n2.type 的值是字符串类型，则它描述的是普通标签元素
		if (typeof type === 'string') {
			if (!n1) {
				mountElement(n2, container);
			} else {
				patchElement(n1, n2);
			}
		} else if (typeof type === 'object') {
			// 如果 n2.type 的值的类型是对象，则它描述的是组件
		} else if (type === 'xxx') {
			// 处理其他类型的 vnode
		}

		if (!n1) {
			// 如果 n1 不存在，意味着挂载，则调用 mountElement 函数完成挂载

			mountElement(n2, container);
		} else {
			// 更新
		}
	}

	function render(vnode, container) {
		if (vnode) {
			patch(container._vnode, vnode, container);
		} else {
			if (container._vnode) {
				container.innerHTML = '';
			}
		}
		container._vnode = vnode;
	}
	function shouldSetAsProps(el, key, value) {
		// 特殊处理
		if (key === 'form' && el.tagName === 'INPUT') return false;
		// 兜底
		return key in el;
	}
	function mountElement(vnode, container) {
		// 创建 DOM 元素
		const el = document.createElement(vnode.type);
		// 处理子节点，如果子节点是字符串，代表元素具有文本节点
		if (typeof vnode.children === 'string') {
			// 因此只需要设置元素的 textContent 属性即可
			el.textContent = vnode.children;
		} else if (Array.isArray(vnode.children)) {
			// 如果 children 是数组，则遍历每一个子节点，并调用 patch 函数挂载它们
			vnode.children.forEach(child => {
				patch(null, child, el);
			});
		}

		// 如果 vnode.props 存在才处理它
		if (vnode.props) {
			// HTML Attributes的作用是设置与之对应的 DOM Pr operties  的初始值。
			// 遍历 vnode.props
			for (const key in vnode.props) {
				// 调用 setAttribute 将属性设置到元素上
				// el.setAttribute(key, vnode.props[key]);

				const value = vnode.props[key];
				// 使用 shouldSetAsProps 函数判断是否应该作为 DOM Properties设置;
				if (shouldSetAsProps(el, key, value)) {
					// 获取该 DOM Properties 的类型
					const type = typeof el[key];
					const value = vnode.props[key];
					// 如果是布尔类型，并且 value 是空字符串，则将值矫正为 true
					if (type === 'boolean' && value === '') {
						el[key] = true;
					} else {
						el[key] = value;
					}
				} else {
					// 如果要设置的属性没有对应的 DOM Properties，则使用 setAttribute 函数设置属性
					el.setAttribute(key, vnode.props[key]);
				}
			}
		}
		// 将元素添加到容器中
		container.appendChild(el);
	}

	return {
		render,
	};
}

{
	// 在创建 renderer 时传入配置项
	const renderer = createRenderer({
		// 用于创建元素
		createElement(tag) {
			return document.createElement(tag);
		},
		// 用于设置元素的文本节点
		setElementText(el, text) {
			el.textContent = text;
		},
		// 用于在给定的 parent 下添加指定元素
		insert(el, parent, anchor = null) {
			parent.insertBefore(el, anchor);
		},

		setText(el, text) {
			el.nodeValue = text;
		},

		// 将属性设置相关操作封装到 patchProps 函数中，并作为渲染器选项传递
		patchProps(el, key, prevValue, nextValue) {
			// 匹配以 on 开头的属性，视其为事件
			if (/^on/.test(key)) {
				// 定义 el._vei 为一个对象，存在事件名称到事件处理函数的映射
				const invokers = el._vei || (el._vei = {});
				//根据事件名称获取 invoker
				let invoker = invokers[key];
				const name = key.slice(2).toLowerCase();
				if (nextValue) {
					if (!invoker) {
						invoker = el._vei[key] = e => {
							// e.timeStamp 是事件发生的时间
							// 如果事件发生的时间早于事件处理函数绑定的时间，则不执行事件处理函数
							if (e.timeStamp < invoker.attached) return;
							// 如果 invoker.value 是数组，则遍历它并逐个调用事件处理函数
							if (Array.isArray(invoker.value)) {
								invoker.value.forEach(fn => fn(e));
							} else {
								// 否则直接作为函数调用
								invoker.value(e);
							}
						};
						invoker.value = nextValue;
						// 添加 invoker.attached 属性，存储事件处理函数被绑定的时间
						invoker.attached = performance.now;
						el.addEventListener(name, invoker);
					} else {
						invoker.value = nextValue;
					}
				} else if (invoker) {
					el.removeEventListener(name, invoker);
				}
			} else if (key === 'class') {
				el.className = nextValue || '';
			} else if (shouldSetAsProps(el, key, nextValue)) {
				const type = typeof el[key];
				if (type === 'boolean' && nextValue === '') {
					el[key] = true;
				} else {
					el[key] = nextValue;
				}
			} else {
				el.setAttribute(key, nextValue);
			}
		},
	});

	function createRenderer(options) {
		// 通过 options 得到操作 DOM 的 API
		const { createElement, insert, setElementText } = options;

		// 在这个作用域内定义的函数都可以访问那些 API
		function mountElement(vnode, container) {
			// 调用 createElement 函数创建元素
			// 让 vnode.el 引用真实 DOM 元素
			const el = (vnode.e = createElement(vnode.type));
			if (typeof vnode.children === 'string') {
				// 调用 setElementText 设置元素的文本节点
				setElementText(el, vnode.children);
			} else if (Array.isArray(vnode.children)) {
				// 如果是数组，说明是多个子节点
				vnode.children.forEach(child => {
					patch(null, child, el);
				});
			}

			if (vnode.props) {
				for (const key in vnode.props) {
					// 调用 patchProps 函数即可
					patchProps(el, key, null, vnode.props[key]);
				}
			}
			// 调用 insert 函数将元素插入到容器内
			insert(el, container);
		}

		function patch(n1, n2, container) {
			// ...
		}

		function render(vnode, container) {
			if (vnode) {
				patch(container._vnode, vnode, container);
			} else {
				if (container._vnode) {
					// 调用 unmount 函数卸载 vnode
					unmount(container._vnode);
				}
			}
			container._vnode = vnode;
		}
		return {
			render,
		};
	}
}

function unmount(vnode) {
	// 根据 vnode 获取要卸载的真实 DOM 元素
	const parent = vnode.el.parentNode; // 获取 el 的父元素
	if (parent) {
		// 调用 removeChild 移除元素
		parent.removeChild(vnode.el);
	}
}

function normalizeClass(value) {
	let res = '';

	if (typeof value === 'string') {
		// 直接返回字符串
		res = value;
	} else if (Array.isArray(value)) {
		// 遍历数组并递归规范化
		for (let i = 0; i < value.length; i++) {
			const normalized = normalizeClass(value[i]);
			if (normalized) {
				res += normalized + ' ';
			}
		}
	} else if (typeof value === 'object') {
		// 遍历对象，值为真时添加 key
		for (const name in value) {
			if (value[name]) {
				res += name + ' ';
			}
		}
	}

	return res.trim(); // 移除末尾空格
}

function patchElement(n1, n2) {
	const el = (n2.el = n1.el);
	const oldProps = n1.props;
	const newProps = n2.props;
	// 第一步：更新 props
	for (const key in newProps) {
		if (newProps[key] !== oldProps[key]) {
			patchProps(el, key, oldProps[key], newProps[key]);
		}
	}
	for (const key in oldProps) {
		if (!(key in newProps)) {
			patchProps(el, key, oldProps[key], null);
		}
	}

	// 第二步：更新 children
	patchChildren(n1, n2, el);
}

function patchChildren(n1, n2, container) {
	if (typeof n2.children === 'string') {
		// 省略部分代码
	} else if (Array.isArray(n2.children)) {
		// 说明新子节点是一组子节点

		// 判断旧子节点是否也是一组子节点
		if (Array.isArray(n1.children)) {
			// 代码运行到这里，则说明新旧子节点都是一组子节点，这里涉及核心的 Diff 算法
		} else {
			// 此时：
			// 旧子节点要么是文本子节点，要么不存在
			// 但无论哪种情况，我们都只需要将容器清空，然后将新的一组子节点逐个挂
			载;
			setElementText(container, '');
			n2.children.forEach(c => patch(null, c, container));
		}
	} else {
		// 代码运行到这里，说明新子节点不存在
		// 旧子节点是一组子节点，只需逐个卸载即可
		if (Array.isArray(n1.children)) {
			n1.children.forEach(c => unmount(c));
		} else if (typeof n1.children === 'string') {
			// 旧子节点是文本子节点，清空内容即可
			setElementText(container, '');
		}
		// 如果也没有旧子节点，那么什么都不需要做
	}
}

function patch(n1, n2, container) {
	if (n1 && n1.type !== n2.type) {
		unmount(n1);
		n1 = null;
	}

	const { type } = n2;

	if (typeof type === 'string') {
		if (!n1) {
			mountElement(n2, container);
		} else {
			patchElement(n1, n2);
		}
	} else if (type === Text) {
		if (!n1) {
			// 调用 createText 函数创建文本节点
			const el = (n2.el = createText(n2.children));
			insert(el, container);
		} else {
			const el = (n2.el = n1.el);
			if (n2.children !== n1.children) {
				// 调用 setText 函数更新文本节点的内容
				setText(el, n2.children);
			}
		}
	}
}
