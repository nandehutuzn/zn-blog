# Fiber 原理（一）
---
*2020/10/23*

## 前言
::: tip
  学React没多久就看到说Facebook团队使用**Fiber**重写了diff算法，那么为什么要重写呢，这个Fiber是干嘛的呢?

  首先看看React存在的问题，主要是页面更新渲染方面的，**Vue**和**React**有个很大的区别就在更新渲染的级别上，Vue因为使用**Object.defineProperty()** 方法(Vue3.0改为Proxy对象)，实现发布订阅设计模式，能达到组件级别的更新渲染，即哪个组件的数据有更新，我就调用这个组件的render函数重新渲染，而React不行，它的更新更简单粗暴，只要某个组件数据有改变，那么从这个结点开始，它下面的所有子结点都会去检查一遍，看看是否需要更新，并且是通过递归的方式，一次性完成，如果页面比较复杂，运算比较多，diff运算+渲染长时间占用主线程，会导致页面卡顿，影响用户体验。关于**页面卡顿**再补充下，网页页面是由浏览器一帧一帧渲染出来，当1s渲染60帧时，用户感觉比较流畅，那么每一帧的周期大概就是16ms，所以如果一次diff+渲染时长超过16ms，用户就会感觉到卡顿。

  那么怎么解决这个问题呢，解决思路也比较直接，diff+渲染耗时长，那能不能将这些操作分开呢？以前是一条直线走到底，能不能分成一段一段的，给出部分时间给浏览器刷新页面。

  解决方法是通过 **window.requestIdleCallback()** 这个方法，官方给这个方法的解释是：
:::
::: warning
  window.requestIdleCallback()方法将在浏览器的空闲时段内调用的函数排队。这使开发者能够在主事件循环上执行后台和低优先级工作，而不会影响延迟关键事件，如动画和输入响应。函数一般会按先进先调用的顺序执行
:::
::: tip
  也很好理解，就是浏览器有空闲时间了，我就去做diff运算，如果diff运算比较耗时，没事，浏览器可以随时将我打断，将主线程是使用权拿去，工作完再将使用权还回来，最后再一次性渲染到界面。总结起来就是（1），diff过程生成virtualDOM树的阶段可以被中断.（2）一次性将virtualDOM树渲染到界面。
:::

## Fiber 实现

::: tip
  为方便理解，关于fiber再补充一点，我们知道react以前渲染是从当前结点往下开始更新，有了fiber分片任务功能，facebook这次更粗暴，每次都从根节点开始，生成一颗新的virtualDOM树，当然还是会通过diff算法重用没改变的DOM元素。

  fiber协调器维护着一个任务队列，队列中每一个任务就是生成一颗virtualDOM树，任务队列数据结构如下：
:::

```js
const createTaskQueue = () => {
  const taskQueue = []

  return {
    push: item => taskQueue.push(item),
    pop: () => taskQueue.shift(),
    isEmpty: () => taskQueue.length === 0
  }
}
```

::: tip
  知道任务怎么存放的，那我们就可以从这个队列中取出任务并执行，执行必定是从React.render()方法为入口，看看render方法实现
:::

```js
const render = (element, dom) => {
  /*
    1.向任务队列添加任务
      任务就是通过 vdom 对象构建 fiber对象
    2.指定在浏览器空闲时执行任务
  */

  taskQueue.push({
    dom,
    props: { children: element }
  })

  requestIdleCallback(performTask)
}

const performTask = deadLine => {
  workLoop(deadLine)

  if(subTask || !taskQueue.isEmpty()) {
    requestIdleCallback(performTask)
  }
}

const workLoop = deadLine => {
  if(!subTask) {
    subTask = getFirstTask()
  }

  // 第一阶段，diff运算
  while(subTask && deadLine.timeRemaining() > 1) {
    subTask = executeTask(subTask)
  }

  // 第二阶段，渲染DOM
  if(pendingCommit) {
    commitAllWork(pendingCommit)
  }
}
```

::: tip
  先看这三个方法，render很明确，进来就往fiber任务队列新增一个任务，然后告诉浏览器在空闲时时间执行 **performTask()** 方法。

  performTask方法内执行了**workLoop**，这个方法接收传下来的**deadLine**参数，workLoop方法里面有一个循环，如果时间到了或者任务队列被清空了，跳出循环，因为跳出循环有两种原因，所以这里需要判断下是否可以去渲染界面，即如果diff比对还没有完成(pendingCommit不为null)，就不去渲染DOM。

  然后再回到 performTask 方法，判断是否需要在下一个时间片继续执行任务，如此往复。

  fiber主要流程走完了，我们再深入看看里面的细节，比如 **getFirstTask()** 方法和 **executeTask()**
:::

```js
const getFirstTask = () => {
  // 从任务队列中获取任务
  const task = taskQueue.pop()

  if(task.from === 'class_component') {
    // 组件状态更新
    const root = getRoot(task.instance)    
    task.instance.__fiber.partialState = task.partialState
    return {
      props: task.props,
      stateNode: root.stateNode,
      tag: 'host_root',
      effects: [],
      child: null,
      alternate: root
    }
  }

  // 返回最外层节点的fiber对象
  return {
    props: task.props,
    stateNode: task.dom,
    tag: 'host_root',
    effects: [],
    child: null,
    alternate: task.dom.__rootFiberContainer
  }
}

const getRoot = instance => {
  let fiber = instance.__fiber

  while(fiber.parent) {
    fiber = fiber.parent
  }

  return fiber
}

const executeTask = fiber => {
  if(fiber.tag === 'class_component') {
    if(fiber.stateNode.__fiber && fiber.stateNode.__fiber.partialState) {
      fiber.stateNode.state = {
        ...fiber.stateNode.state,
        ...fiber.stateNode.__fiber.partialState
      }
    }

    reconcileChildren(fiber, fiber.stateNode.render())
  } else if (fiber.tag === 'function_component') {
    reconcileChildren(fiber, fiber.stateNode(fiber.props))
  } else {
    reconcileChildren(fiber, fiber.props.children)
  }
  
  if(fiber.child) {
    return fiber.child
  }
  let currentExecutelyFiber = fiber
  while(currentExecutelyFiber.parent) {
    currentExecutelyFiber.parent.effects = currentExecutelyFiber.parent.effects.concat(
      currentExecutelyFiber.effects.concat([currentExecutelyFiber])
    )
    if(currentExecutelyFiber.sibling) {
      return currentExecutelyFiber.sibling
    }
    currentExecutelyFiber = currentExecutelyFiber.parent
  }

  pendingCommit = currentExecutelyFiber
}
```

::: tip
  **getFirstTask()** 方法，先取出队列中第一个任务，但是这个任务的数据不一定就是我们需要的，我们知道，触发fiber任务有两种情况，一是程序刚开始时，需要创建元素，二是程序运行时，去更新某些元素，而这个更新操作是某个内部组件触发的，我们前面也说过，因为fiber是在浏览器空闲时间进行diff算法的，所以每次都会从根节点开始构建virtualDOM树，所以这里区分下，保证 getFirstTask 方法返回的都是根节点对应的数据。

  **executeTask()** 方法，（未完待续）

  [直接跳到（Fiber 原理2）](/frontend/fiber2)
  
  [回首页](/frontend)
:::