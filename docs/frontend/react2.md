# React原理（二）
---
*2020/10/22*

::: tip
  上一篇讲完了通过React.render静态函数将 virtualDOM 转成真实 DOM 渲染到界面，今天讲讲 virtualDOM 更新的过程。
  React中，组件更新是由this.setState实例方法触发的(不考虑父组件引起的更新)，该方法在父组件 React.Component 组件中定义，该方法定义如下：
:::
```js
setState(state) {
  this.state = Object.assign({}, this.state, state)
  // 获取最新的要渲染的 virtualDOM 对象
  let virtualDOM = this.render()
  // 获取旧的 virtualDOM 对象进行比对
  let oldDOM = this.getDOM()
  let container = oldDOM.parentNode
  // 实现对比
  diff(virtualDOM, container, oldDOM)
}

setDOM(dom) {
  this._dom = dom
}

getDOM() {
  return this._dom
}
```
## 获取oldDOM
::: tip
  上面 **this.getDOM()** 实例方法解释下，即用来获取该组件对应的真实 DOM 对象，再从这个真实DOM对象中获取到其对应的virtualDOM来和上面 **this.render()** 返回最新的virtualDOM 做对比，那什么时候会将该DOM对象赋值给该组件呢，也就是 **setDOM()** 方法是什么时候执行的呢？这个方法在前面已经出现过，**mountNativeElement** 将原生标签挂载到页面时会调用，完整代码如下：
:::
``` js
function mountNativeElement(virtualDOM, container, oldDOM) {
  let newElement = createDOMElement(virtualDOM, container)
  // 将转换之后的DOM对象挂载到页面
  if(oldDOM) {
    container.insertBefore(newElement, oldDOM)
  } else {
    container.appendChild(newElement)
  }
  
  // 判断旧的DOM的对象是否存在，如果存在，删除
  if(oldDOM) {
    unmountNode(oldDOM)
  }
  
  let component =  virtualDOM.component

  if(component) {
    // 将真实DOM(newElement) 保存到React组件实例(component)中
    component.setDOM(newElement)
  }
}
```
::: tip
  那virtualDOM中的component又是哪来的呢？是在 **mountComponent()** 方法中，这个方法是在上一篇的 **mountElement** 方法中被调用的，即该 virtualDOM 参数的type属性为一个方法时，会执行 **mountComponent()** 方法，mountComponent方法实现如下：
:::
``` js
function mountComponent(virtualDOM, container, oldDOM) {
  let nextVirtualDOM = null
  let component = null
  // 判断是类组件还是函数组件，根据原型链中是否有render方法
  if(isFunctionComponent(virtualDOM)) {
    // 函数组件
    nextVirtualDOM = buildFunctionComponent(virtualDOM)
  } else {
    // 类组件
    nextVirtualDOM = buildClassComponent(virtualDOM)
    component = nextVirtualDOM.component
  }

  if(isFunction(nextVirtualDOM)) {
    mountComponent(nextVirtualDOM, container, oldDOM)
  } else {
    mountNativeElement(nextVirtualDOM, container, oldDOM)
  }

  if(component) {
    component.componentDidMount()
    if(component.props && component.props.ref) {
      component.props.ref(component)
    }
  }
}

function buildFunctionComponent(virtualDOM) {
  return virtualDOM.type(virtualDOM.props || {})
}

function buildClassComponent(virtualDOM) {
  const component = new virtualDOM.type(virtualDOM.props || {})
  const nextVirtualDOM = component.render()
  nextVirtualDOM.component = component

  return nextVirtualDOM
}

function isFunctionComponent(virtualDOM) {
  const type = virtualDOM.type
  return (
    type && isFunction(virtualDOM) && !(type.prototype && type.prototype.render)
  )
}
```
::: tip
  从上面的代码中可以看到，虽然第一个参数传入了一个virtualDOM对象，但是后面真正去挂载的时候并没有使用它，而是使用了virtualDOM.type() 新创建的一个virtualDOM对象，在代码中是**nextVirtualDOM** 对象，如果传入的virtualDOM.type 是一个构造函数，那么会调用该构造函数生成一个component实例，保存在**nextVirtualDOM.component**属性中
:::

## 执行diff

::: tip
  diff 方法的三个参数 virtualDOM, container, oldDOM 都拿到了，看看diff 方法的完整逻辑：
:::
``` js
function diff(virtualDOM, container, oldDOM){
  const oldVirtualDOM = oldDOM && oldDOM._virtualDOM
  const oldComponent = oldVirtualDOM && oldVirtualDOM.component
  if(!oldDOM) {
    mountElement(virtualDOM, container)
  } else if (virtualDOM.type !== oldVirtualDOM.type && typeof virtualDOM.type !== 'function') {
    // 节点类型不同，且节点不是组件
    // 直接创建原生标签，然后替换原结点
    const newElement = createDOMElement(virtualDOM)
    oldDOM.parentNode.replaceChild(newElement, oldDOM)
  } else if(typeof virtualDOM.type === 'function') {
    // 组件
    diffComponent(virtualDOM, oldComponent, oldDOM, container)
  } else if(oldVirtualDOM && virtualDOM.type === oldVirtualDOM.type) {
    if(virtualDOM.type === 'text') {
      // 更新内容
      updateTextNode(virtualDOM, oldVirtualDOM, oldDOM)
    } else {
      // 更新元素属性
      updateNodeElement(oldDOM, virtualDOM, oldVirtualDOM)
    }

    let hasNoKey = Object.key(keyedElements).length === 0

    if(hasNoKey) {
      // 对比子节点
      virtualDOM.children.forEach((child, i) => {
        diff(child, oldDOM, oldDOM.childNodes[i])
      })
    } else {
      // 1. 将拥有key属性的子元素放置在一个单独的对象中
      let keyedElements = {}
      for(let i = 0, len = oldDOM.childNodes.length; i < len; i++) {
        let domElement = oldDOM.childNodes[i]
        if(domElement.nodeType === 1) {
          let key = domElement.getAttribute('key')
          if(key) {
            keyedElements[key] = domElement
          }
        }
      }
      // 2. 循环 virtualDOM 的子元素，获取子元素的 key 属性
      virtualDOM.children.forEach((child, i) => {
        let key = chlid.props.key
        if(key) {
          let domElement = keyedElements[key]
          if(domElement) {
            // 3. 看看当前位置的元素是不是我们期望的元素
            if(ldDOM.childNodes[i] && oldDOM.childNodes[i] !== domElement) {
              oldDOM.insertBefore(domElement, oldDOM.childNodes[i])
            }
          } else {
            // 新增元素
            mountElement(child, oldDOM, oldDOM.childNodes[i])
          }
        }
      })
    }

    // 删除节点
    // 获取旧节点
    let oldChildNodes = oldDOM.childNodes
    // 判断旧节点的数量
    if(oldChildNodes.length > virtualDOM.children.length) {
      if(hasNoKey) {
        for(let i = oldChildNodes.length - 1; i > virtualDOM.children.length - 1; i--) {
          unmountNode(oldChildNodes[i])
        }
      } else {
        // 通过key属性删除节点
        for (let i = 0; i < oldChildNodes.length; i++) {
          let oldChild = oldChildNodes[i]
          let oldChildKey = oldChild._virtualDOM.props.key
          let found = false
          for(let n = 0; n < virtualDOM.children.length; n++) {
            if(oldChildKey === virtualDOM.children[n].props.key) {
              found = true
              break;
            }
          }

          if(!found) {
            unmountNode(oldChild)
          }
        }
      }
    }
  } 
}

function diffComponent(virtualDOM, oldComponent, oldDOM, container) {
  if(isSameComponent(virtualDOM, oldComponent)) {
    // 同一个组件，做组件更新操作
    updateComponent(virtualDOM, oldComponent, oldDOM, container)
  } else {
    // 不是同一个组件
    mountElement(virtualDOM, container, oldDOM)
  }
}

// 判断是否是同一个组件
function isSameComponent(virtualDOM, oldComponent) {
  return oldComponent && virtualDOM.type === oldComponent.constructor
}

updateComponent(virtualDOM, oldComponent, oldDOM, container) {
  oldComponent.componentWillReceiveProps(virtualDOM.props)

  if(oldComponent.shouldComponentUpdate(virtualDOM.props)) {
    let preProps = oldComponent.props
    oldComponent.componentWillUpdate(virtualDOM.props)
    // 组件更新
    oldComponent.updateProps(virtualDOM.props)
    // 调用组件的render方法生成新的 virtualDOM
    let nextVirtualDOM = oldComponent.render()
    nextVirtualDOM.component = oldComponent
    diff(nextVirtualDOM, container, oldDOM)
    oldComponent.componentDidUpdate(preProps)
  }
}

function updateTextNode(virtualDOM, oldVirtualDOM, oldDOM) {
  if(virtualDOM.props.textContent !== oldVirtualDOM.props.textContent) {
    oldDOM.textContent = virtualDOM.props.textContent
    oldDOM._virtualDOM = virtualDOM
  }
}
```
::: tip
  1. 首先是取出oldDOM对应的virtualDOM和其对应的component，再判断前后两个virtualDOM.type是否一致，如果不一致且，新的virtualDOM.type为原生标签，则直接创建原生标签，替换原结点。

  2. 如果virtualDOM.type是自定义组件，则继续调用**diffComponent**方法。diffComponent方法里面判断它们的构造函数是否相同，如果不同，就代表不是同一个组件，则调用**mountElement**直接将virtualDOM挂载上去，当然，还需要移除旧的DOM对象，如果有得话。如果是同一个组件，则调用 **updateComponent** 方法更新，updateComponent方法里面会调用一些声明周期函数，并调用组件的**updateProps**实例方法更新props， 再取出组件的render函数，执行生成新的virtualDOM **nextVirtualDOM**，这样就新旧两个virtualDOM都能拿到了，继续调用 diff 函数执行。

  3. 新旧组件类型相同：
  * 先判断是否是文本类型，如果是，更新文本内容及DOM原生对应的virtualDOM对象，如果不是，调用**updateNodeElement**方法更新结点
  * 再更新子节点，根据子节点是否设置**key**属性做不同处理，如果没有，则对每个child分别调用diff方法处理。如果child组件设置了**key**属性，则先将每个key和对应的DOM缓存起来，再遍历新的virtualDOM.children属性，检查每个child的key是否已缓存，如果缓存了，则直接取出并复用，如果没有，则调用**mountElement**方法挂载一个新的元素，最后删除没用到的结点。

  4. [项目完整地址](https://gitee.com/zn3102090109/tiny-react)
:::