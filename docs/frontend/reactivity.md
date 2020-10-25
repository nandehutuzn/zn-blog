# Vue3.0 中的响应式系统简单实现
---
*2020/10/25*

## 前言

::: tip
  今年 **Vue3.0** 如约而至了，改动比较大（大版本号都从2上升到3了），两个改动点也和今天的主题有关：

* 用 **Proxy对象** 取代 **Object.defineProperty()** 方法实现响应式系统，原来的方法存在一定的缺陷比如，新增、删除属性监测不到，数组通过索引访问也监测不到，一句话概括就是以前defineProperty方法实现的响应式系统是对象属性级别的，而Proxy实现的响应式系统是对象级别的，级别更高更全。
* Vue3.0 中增加了 Componsition API，与此对应，Vue2.X 中使用的是 Option API，Vue3.0 写组件更家灵活了。与 **React Hooks** 设计思想一致，趋势都是函数式编程，远离该死的 **this**。

当然 Vue3.0 还有其他方面的更新，如编译生成**AST树**时对静态结点的处理、事件缓存等，与今天主题不太相关，不多说了。

:::

## reactive 方法

::: tip
  reactive 方法是 Vue3.0 响应式系统的起点，它的作用很简单，就是将你传入的对象用 **Proxy对象** 包裹一下，为什么要包裹呢，一开始我有这个疑问，虽然方法里面get操作注释了会 **收集依赖**，但是执行 reactive 方法的时候，收集不到任务依赖。其实这里只是给你传入的对象做好收集依赖、触发更新的条件，让你后面有这个条件能实现这两个功能，这两个功能你用不用随你。

``` js
const isObject = val => val !== null && typeof val === 'object'
const convert = target => isObject(target) ? reactive(target) : target
const hasOwnProperty = Object.prototype.hasOwnProperty
const hasOwn = (target, key) => hasOwnProperty.call(target, key)

export function reactive(target) {
  if(!isObject(target)) return target

  const handler = {
    get(target, key, receiver) {
      // 收集依赖
      track(target, key)
      const result = Reflect.get(target, key, receiver)
      // 如果属性值是对象，递归处理，让属性值也是响应式的
      return convert(result)
    },
    set(target, key, value, receiver) {
      const oldValue = Reflect.get(target, key, receiver)
      let result = true
      if(oldValue !== value) {
         result = Reflect.set(target, key, value, receiver)
        // 触发更新
        trigger(target, key)
      }

      return result
    },
    deleteProperty(target, key) {
      const hadKey = hasOwn(target, key)
      const result = Reflect.deleteProperty(target, key)
      if(hadKey, result) {
        // 触发更新
        trigger(target, key)
      }

      return result
    }
  }

  return new Proxy(target, handler)
}
```

  这也说明要达到响应式，还需要其他方法的配合，下面看看触发依赖收集的方法 **effect方法**

:::

## effect 方法

::: tip
  effect 方法是一个比较底层的方法，在实际应用中我们一般不会直接去用它，但还是看下它的实现，它接收一个回调函数callback，在它的函数体内部会去执行这个回调，并收集依赖，比如上面我通过 reactive 方法返回一个对象，对象包含 obj.price 和 obj.count 两个属性，我想监听这两个属性，当这两个属性有变化时，我的总价 total 也需要同时自动更改。这时我们会通过 effect 方法传入一个回调函数来实现，effect(() => (total = obj.price * obj.count))，上面说了，effect内部会先执行一遍回调函数callback，所以系统会去访问obj对象的price和count的get操作，在get操作里，去执行 reactive 方法里设置好的get操作依赖收集，然后在设置obj对象的某个属性时，进入set操作，触发更新，即再调用一次 callback 方法，total自动会得到新值。相关实现如下：

```js
let activeEffect = null
export function effect(callback) {
  activeEffect = callback
  callback() // 访问响应式对象属性，去收集依赖
  activeEffect = null
}
```

  这里 activeEffect 有两个作用：
* 一是保存数据有更新时，需要自动执行的操作
* 二是在访问reactive返回对象的属性时，增加一个标识，标识我是带着任务(收集依赖)来访问的，并不是单纯的取数据。
:::

## track 和 trigger 方法

::: tip
  这两个方法在 reacive 方法里面出现过，功能分别是**收集依赖**和**触发更新**，好像是响应式系统的关键？内部维护了一个嵌套几层的对象，一起看看。

  最外层是 targetMap = new WeakMap()，一个弱引用字典，它的key是目标对象，即reactive方法返回的对象，value 又是一个字典 depsMap = new Map()，这个map的key是目标对象的属性名称，*（这里为什么最外层的是WeakMap，而第二层是Map？最外层WeakMap是从提高垃圾回收效率角度考虑，而外层用了WeakMap，内部就没必要再使用弱引用对象了，外部target对象都已经被回收了，内层对象肯定会被回收）*，最后 depsMap 对象的value是一个Set集合，它保存着target对象某个属性的所有依赖操作，大概关系如下：

```
targetMap = new WeakMap()
key: 保存目标对象target  value:
                        depsMap = new Map()
                        key: 目标对象target的属性名称   value: 属性对应的所有依赖
                                                      dep = new Set()
                                                      value: effect() 接收的回调函数
```

根据目标对象target和属性key可以找到对应Set依赖集合对象，保存，或执行都可以正常执行，代码如下：

```js
let targetMap = new WeakMap()
export function track(target, key) {
  // 如果不是依赖收集的过程，则直接返回
  if(!activeEffect) return

  let depsMap = targetMap.get(target)
  if(!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }

  let dep = depsMap.get(key)
  if(!dep) {
    depsMap.set(key, (dep = new Set()))
  }

  dep.add(activeEffect) // activeEffect 即 callback
}

export function trigger (target, key) {
  const depsMap = targetMap.get(target)
  if(!depsMap) return

  // 取出所有依赖，执行
  const dep = depsMap.get(key)
  if(dep) {
    dep.forEach(effect => {
      effect()
    })
  }
}
```
:::

## 辅助方法

::: tip
  响应式系统的核心依赖收集和更新执行已经完成，下面再看看几个常用辅助方法的实现：
:::

### ref方法

::: tip
  ref 方法的作用是对值类型数据添加响应式，reactive方法只能对对象类型做响应式处理，它的实现方式也是通过对象类型的，因为Proxy只能监听对象类型，ref方法会返回一个响应式对象，这个对象包含一个 **value** 属性，如果ref方法传入值，会成为value的初始值，实现如下：

``` js
export function ref (raw) {
  // 判断raw是否是ref创建的对象 ，如果是，直接返回
  if(isObject(raw) && raw.__v_isRef) {
    return
  }

  // raw 如果不是对象，value就是raw，raw如果是对象，先将raw对象变成响应式的返回给value
  // 将value作为新对象r的value属性值
  let value = convert(raw)
  const r = {
    __v_isRef: true,
    get value() {
      // 给返回对象的value属性收集依赖
      track(r, 'value')
      return value
    },
    set value (newValue) {
      if(newValue !== value) {
        raw = newValue
        value = convert(raw)
        trigger(r, 'value')
      }
    }
  }

  return r
}
```
:::

### toRefs方法

::: tip
  reactive 方法返回一个通过 Proxy对象包裹的新对象，文章最开始也提到过，Proxy对象实现的响应式是对象级别的，那么这里也会有一个缺点，即不能对reactive方法返回的对象进行解构操作，解构出来的值就失去了响应式功能，toRefs 方法就是弥补这个缺点的，原理也不难，增加一个属性取值/赋值转接

``` js
export function toRefs (proxy) {
  const ret = proxy instanceof Array ? new Array(proxy.length) : {}
  /* 
    传入的proxy对象每个属性已经做过响应式处理，
    这里需要解决的问题是当proxy对象属性被解构出来，
    操作某个属性是，它的响应式依然有效，
    解决办法是改变一下proxy对象最外层属性取值/赋值路径，
    当proxy某个属性被解构出来，我们把对这个值的操作转接到proxy的这个属性下即可
  */
  for(const key in proxy) {
    ret[key] = toProxyRef(proxy, key)
  }

  return ret
}

function toProxyRef(proxy, key) {
  const r = {
    __v_isRef: true,
    get value() {
      return proxy[key]
    },
    set value(newValue) {
      proxy[key] = newValue
    }
  }

  return r
}
```
:::

### computed方法

::: tip
  computed方法和watchEffect方法都是暴露给开发者使用的，它们内部也是调用前面实现的effect方法，computed方法增加了一个返回值，仅此而已。

``` js
export function computed(getter) {
  const result = ref()

  effect(() => (result.value = getter()))

  return result
}
```
:::

## 总结

::: tip
  Vue3.0 响应式系统原理其实不难，难的是依赖收集，当然依赖收集尤大在编译阶段都帮我们做好了，我们可以做个简单的猜测，我们上面是通过effect方法实现依赖收集的，那么在编译或渲染阶段，也必然调用了这个方法，什么时候呢，可能是当模板(template)编译为AST树时，或者AST树转成render函数时，或者更后，执行render函数时（这个应该不是，组件有更新也会执行render函数，多次依赖收集浪费性能）。

  说完 Vue 不能不想到 React，两大框架在新版本都开始拥抱 **函数式编程**，这是一个大趋势，也是一个共识，函数功能更加细粒度化，每个函数功能更加单一、函数之间依赖性更小、函数复用性更高。

  虽然两大框架都实现了页面、数据分离，数据驱动页面，但它们的实现方式有很大不同，Vue 是通过监测是否有数据变化，然后去更新页面，属于被动刷新，并且组件更新精确度更高一点，哪个组件的数据有更新，就调用这个组件的render函数。而 React 如果有数据变化，需要调用 **setState()** 方法发出刷新页面通知，属于主动刷新，更新方式也不太一样，虽然都用了 **virtualDOM**，但是 React 会去将从当前结点开始，往下所有结点形成的 virtualDOM树 和之前的 virtualDOM 树进行 diff，如果有差异，就更新，导致React运行时的运算量会比较大，所以出现了diff 的优化版 [Fiber算法](/frontend/fiber1)

  *刚学React没多久，如果对React的理解有不到位的地方，请多包涵*

  [项目地址](https://github.com/nandehutuzn/my_reactivity.git)
:::

（完）