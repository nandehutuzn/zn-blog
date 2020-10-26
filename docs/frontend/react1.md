# React原理（一）
---
*2020/10/21*

## 前言
::: tip
  初学React，记录下自己对它核心原理的理解
  说到React，就不得不提JSX，它是JavaScript的一个语法扩展，如果了解Vue的话，JSX就对应Vue中的template，都是方便开发者编写更灵活的页面样式，并且最终它们都由专门工具转换成 **VirtualDOM**，我们就从已生成的VirtualDOM开始吧。
:::

## React静态render方法
::: tip
  VirtualDOM 对象向真实DOM转换的过程是由 **React.render** 方法实现的，该方法原型如下：
:::
``` js
function render(virtualDOM, container, oldDOM = container.firstChild) {
  diff(virtualDOM, container, oldDOM)
}
```
::: tip
  这个方法的参数很好理解，第一个是需要真正渲染的virtualDOM对象，第二个参数渲染后DOM需要挂载的容器DOM对象，最后一个参数是重新渲染之前的DOM对象，这里可能会有点奇怪，React和Vue中都用了virtualDOM，并且都有diff算法，既然有对比最起码应该是同类型数据对比吧，为什么第一个参数是virtualDOM对象，而第三个参数是DOM对象，原因很简单，oldDOM对象中有专门的属性保存着它对应的virtualDOM对象。
  render里面调用了核心diff方法，接下来看看它做了什么。
:::
## diff 方法
::: tip
  diff 方法里面先考虑最简单的一种情况，就是程序刚运行起来，oldDOM为空。
:::
``` js
function diff(virtualDOM, container, oldDOM){
  if(!oldDOM) {
    mountElement(virtualDOM, container)
  } 
  ...
}

function mountElement(virtualDOM, container, oldDOM) {
  if (isFunction(virtualDOM)) {
    // Component 
    mountComponent(virtualDOM, container, oldDOM)
  } else {
    // NativeElement
    mountNativeElement(virtualDOM, container, oldDOM)
  } 
}

function isFunction(virtualDOM) {
  return virtualDOM && typeof virtualDOM.type === 'function'
}
```

#### 没有oldDOM
::: tip
  这个时候就直接渲染第一个参数 virtualDOM 对象，渲染 virtualDOM 对象也有两种情况，一种是渲染浏览器原生标签，如,button,p,div等，另一种是渲染自定义的组件，这两种类型可以通过virtualDOM对象的type属性来区分，如果是自定义组件，那么 virtualDOM.type 为一个函数(类构造函数或者返回一个virtualDOM对象的JSX函数)，先看渲染浏览器原生标签的过程。
:::
``` js
function mountNativeElement(virtualDOM, container, oldDOM) {
  let newElement = createDOMElement(virtualDOM, container)
  container.appendChild(newElement)
}

function createDOMElement(virtualDOM, container) {
  let newElement = null
  if(virtualDOM.type === 'text') {
    // 文本节点
    newElement = document.createTextNode(virtualDOM.props.textContent)
  } else {
    // 元素节点
    newElement = document.createElement(virtualDOM.type)
    // 给元素结点设置属性，事件
    updateNodeElement(newElement, virtualDOM)
  }
  // 在真实DOM中保存其对应的 virtualDOM 对象
  newElement._virtualDOM = virtualDOM

  // 递归创建子节点
  virtualDOM.children.forEach(child => {
    mountElement(child, newElement)
  });

  // 如果有ref属性的话，给其赋值
  if(virtualDOM.props && virtualDOM.props.ref) {
    virtualDOM.props.ref(newElement)
  }

  return newElement
}

function updateNodeElement(newElement, virtualDOM, oldVirtualDOM = {}) {
  // 获取节点对应的属性对象
  const newProps = virtualDOM.props || {}
  const oldProps = oldVirtualDOM.props || {}
  Object.keys(newProps).forEach(propName => {
    const newPropsValue = newProps[propName]
    const oldPropsValue = oldProps[propName]
    if(newPropsValue !== oldPropsValue) {
      // 判断属性是否是事件属性 onClick -> click
      if(propName.slice(0, 2) === 'on') {
        // 事件名称
        const eventName = propName.toLowerCase().slice(2)
        newElement.addEventListener(eventName, newPropsValue)
        // 移除原有的事件处理函数
        if(oldPropsValue) {
          newElement.removeEventListener(eventName, oldPropsValue)
        }
      } else if (propName === 'value' || propName === 'checked') {
        newElement[propName] = newPropsValue
      } else if (propName !== 'children') {
        if(propName === 'className') {
          newElement.setAttribute('class', newPropsValue)
        } else {
          newElement.setAttribute(propName, newPropsValue)
        }
      }
    }
  })
  ...
}
```
::: tip
  在 **createDOMElement** 方法中，先是通过virtualDOM.type属性判断其是不是一个文本标签，如果是，直接创建一个文本标签。
  如果是不是文本标签，则调用 **updateNodeElement** 方法给生成的元素设置各种属性和事件。真实DOM生成完毕后，给其增加一个 **_virtualDOM** 属性，保存对应的virtualDOM，用于后面需要更新时和新值做对比。
  接下来还得处理其内部的子元素，递归调用 **mountElement** 即可，mountElement是处理浏览器原生标签方法和自定义组件的统一入口
:::
``` HTML
<div>
  123
  <h1>345</h1>
  <Component></Component>
</div>
```
::: tip
  到这里组件第一次渲染过程就结束了，后面看看组件更新过程。

  [直接跳到（React 原理2）](/frontend/react2)
  
  [回首页](/frontend)
:::
