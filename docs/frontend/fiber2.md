# Fiber 原理（二）
---
*2020/10/24*

## executeTask

::: tip
  还是先从程序刚启动开始，第一次进入 executeTask 方法，参数 fiber 只有两个属性，一个是要渲染的 virtualDOM，放在fiber.props.children属性上，还有一个是dom，为需要挂载的DOM元素，可以理解为container， 接下来执行 **reconcileChildren()** 方法，传入的两个参数，一个是fiber，另一个就是当前fiber对象对应的virtualDOM。
:::

``` js
const arrified = arg => Array.isArray(arg) ? arg : [arg]

const reconcileChildren = (fiber, children) => {
  // children 可能是对象，也可能是数组，将children转换成数组
  const arrifiedChildren = arrified(children)

  let index = 0
  let numberOfElement = arrifiedChildren.length
  let element = null
  let newFiber = null
  let prevFiber = null

  let alternate = null

  // 先取出fiber对象之前的备份
  if(fiber.alternate && fiber.alternate.child) {
    alternate = fiber.alternate.child
  }

  while(index < numberOfElement || alternate) {
    // 子级 virtualDOM 对象
    element = arrifiedChildren[index]

    if(!element && alternate) {
      // 删除
      alternate.effectTag = 'delete'
      fiber.effects.push(alternate)
    } else if(element && alternate) {
      // 更新
      newFiber = {
        type: element.type,
        props: element.props,
        tag: getTag(element),
        effects: [],
        effectTag: 'update',
        parent: fiber,
        alternate
      }

      if(element.type === alternate.type) {
        // 类型相同
        newFiber.stateNode = alternate.stateNode
      } else {
        newFiber.stateNode = createStateNode(newFiber)
      }
    } else if(element && !alternate) {
      // 初始渲染
      newFiber = {
        type: element.type,
        props: element.props,
        tag: getTag(element),
        effects: [],
        effectTag: 'placement',
        parent: fiber
      }
  
      newFiber.stateNode = createStateNode(newFiber)
    }

    if(index === 0) {
      fiber.child = newFiber
    } else if(element) {
      prevFiber.sibling = newFiber
    }

    if(alternate && alternate.sibling) {
      alternate = alternate.sibling
    } else {
      alternate = null
    }

    prevFiber = newFiber
    
    index++
  }
}
```

::: tip
  先看看fiber对象有哪些属性：
:::

```
{
  type         节点类型 (元素, 文本, 组件)(具体的类型)
  props        节点属性
  stateNode    节点 DOM 对象 | 组件实例对象
  tag          节点标记 (对具体类型的分类 hostRoot || hostComponent || classComponent || functionComponent)
  effects      数组, 存储需要更改的 fiber 对象
  effectTag    当前 Fiber 要被执行的操作 (新增, 删除, 修改)
  parent       当前 Fiber 的父级 Fiber
  child        当前 Fiber 的子级 Fiber
  sibling      当前 Fiber 的下一个兄弟 Fiber
  alternate    Fiber 备份 fiber 比对时使用
}
```

::: tip
  如果是第一次进来，alternate为null，进入循环，取出第一个子级 virtualDOM，转变为一个fiber对象，赋值给当前fiber对象的child属性，这里对child补充下，在正常的virtualDOM树中，因为是一个树结构，所以一个virtualDOM结点会有多个子节点，所有会有一个children:[] 属性，这样也就导致了在执行过程中必须一次性递归完所有结构，比较耗时。所以在fiber数据结构中改变了这种结构，改成链表形式的，一个fiber只有一个child，除此之外，这个fiber还有一个sibling属性，这个结点是child结点的兄弟结点，sibling结点也是一个fiber，所以这样就能以一个链表的形式保存整个virtualDOM树结构。

  再看看它在while循环里面的赋值，第一次进来，index为0，newFiber作为fiber的child，同时将newFiber赋值给prevFiber缓存起来，将newFiber结点的sibling属性指向下一个同级子节点。

  如果是第一次进来，还干了一件事，给stateNode属性赋值，这个值有几种情况，可能是一个DOM元素，可能是类组建的实例，也可能是函数组件的函数，这些值都是通过tag属性来标记的。

  这里我们只处理完一层，回到 executeTask 方法，判断当前fiber对象是否有child属性，从前面可知，如果当前virtualDOM对象还有子节点，那么fiber必然有child属性，并将这个child（Fiber对象）返回到 workLoop 函数，并赋值给 subTask，检查是否还有充足时间，如果有，继续处理返回的child结点后面的结点，如果没有时间，则先给出主线程执行权也无妨，因为我们已经下一个任务的上下文作为一个Fiber对象保存起来了。这个过程可以理解为之前是一棵virtualDOM树一次性处理完，而现在配合Fiber数据结构，我们可以把树结构拆分成一级一级处理，而不丢失树原来的结构。

  更新运算和第一次的插入运算逻辑差不多，只不过增加一些比对后更新、删除操作，下面我们看看 第二阶段 **commitAllWork()** 方法。
:::

## commitAllWork

::: tip
  commitAllWork() 方法是一次性将diff后的数据渲染到界面
:::

``` js
const commitAllWork = fiber => {
  fiber.effects.forEach(item => {

    if(item.tag === 'class_component') {
      item.stateNode.__fiber = item
    }

    if(item.effectTag === 'delete') {
      item.parent.stateNode.removeChild(item.stateNode)
    } else if(item.effectTag === 'update') {
      if(item.type === item.alternate.type) {
        // 节点类型相同
        updateNodeElement(item.stateNode, item, item.alternate)
      } else {
        item.parent.stateNode.replaceChild(item.stateNode, item.alternate.stateNode)
      }
    } else if(item.effectTag === 'placement') {
      let fiber = item
      let parentFiber = item.parent
      while(parentFiber.tag === 'class_component' || 
        parentFiber.tag === 'function_component'
      ) {
        parentFiber = parentFiber.parent
      }
      if(fiber.tag === 'host_component') {
        fiber.parent.stateNode.appendChild(fiber.stateNode)
      }  
    }
  })
  // 备份旧的 fiber 对象
  fiber.stateNode.__rootFiberContainer = fiber
}
```

::: tip
  从代码中可以看到，需要处理的 fiber 对象全都存储在 effects 数组中，那么这个属性是什么时候赋值的呢，是在 **executeTask** 方法内。
:::
``` js
const executeTask = fiber => {
  ...
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
  刚才我们是判断当前结点如果还有子节点，则提前返回了，如果已经处理到最后一级结点，没有子节点了，那么需要再进入一个while循环，向上收集所有父节点及父节点的兄弟结点，保存在effects属性中，最后赋值给 **pendingCommit** fiber对象，即这个结点的effects属性就包含了所有需要处理的fiber对象。pendingCommit也作为实参传入到 **commitAllWork()** 方法，effects属性搞清楚了，现在回到 commitAllWork 方法。

  commitAllWork 方法做的事情就比较清晰明了了，根据 effectTag 属性值做不同的DOM操作，配合fiber对象中的parent、stateNode属性基本能完成对DOM元素的新增、删除、替换、更新操作。前面好像没有提到 **effectTag** 这个属性，fiber.tag是节点标记，可能是根结点，类组件结点，函数组件结点等，而fiber.effectTag 表示当前 fiber 要被执行的操作，新增、删除、修改等。对于它的赋值也是在 **reconcileChildren()** 方法中创建 newFiber 时完成的。

  [项目完整代码](https://gitee.com/zn3102090109/fiber.git)
:::

（完）