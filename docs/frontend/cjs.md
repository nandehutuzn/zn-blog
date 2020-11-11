# Node 模块加载机制
---
*2020/11/11*

## 前言

::: tip
  这里不会讲 JS 模块发展历程，只是单纯讲讲 Node 模块加载机制 ---- CommonJS。
:::

## CommonJS 规范

::: tip
  CommonJS 对模块的定义十分简单，主要分为模块引用、模块定义和模块标识3部分。
:::

### 模块引用

::: tip
  模块通过 **require()** 方法引用，如下：

```js
const http = require('http')
```
  在CommonJS规范中，存在 require() 方法，这个方法接受模块标识，以此引入一个模块的API到当前上下文中。
:::

### 模块定义

::: tip
  在模块中，上下文提供 require() 方法来引入外部模块。对应引入的功能，上下文提供了 **exports** 对象用于导出当前模块的方法或者变量，并且它是唯一导出的出口。在模块中，还存在一个 **module** 对象，它代表模块自身，而 exports 是模块的一个属性。在 Node 中，一个文件就是一个模块，将方法挂载在 exports 对象上作为属性即可定义导出的方式：

```js
// myModule.js
exports.sayHello = function() {
  console.log('Hello CommonJS')
}

// main.js
const myModule = require('./myModule')
myModule.sayHello()
```
:::

### 模块标识

::: tip
  模块标识其实就是传递给 require() 方法的参数，它必须是符合小驼峰命名的字符串，或者以 . 或 .. 开头的相对路径，或者结绝对路径。它可以没有文件名后缀 .js。

  模块的定义十分简单，接口也十分简单。它的意义在于将类聚的方法和变量等限定在私有的作用域中，同时支持引入和导出功能以顺畅地连接上下游依赖。每个模块具有独立的空间，它们互不干扰，在引用时也显得干净利落。
:::

## Node 模块加载过程

::: tip
  在 Node 中引入一个模块，需要经历如下3个步骤：
* 路径分析
* 文件定位
* 编译执行

  在 Node 中，模块分为两类：一类是 Node 提供的模块，称为核心模块；另一类是用户编写的模块，称为文件模块。

  **核心模块** 部分在 Node 源代码的编译过程中，编译进了二进制执行文件。在 Node 进程启动时，部分核心模块就被直接加载进内存，所以这部分核心模块引入时，文件定位和编译执行这两个步骤可以省略掉，并且在路径分析中优先判断，所以它的加载速度是最快的。

  **文件模块** 则是在运行时动态加载，需要完整的路径分析、文件定位、编译执行过程，速度比核心模块慢。

  与浏览器会缓存静态脚本文件以提高性能一样，Node 对引入过的模块都会进行缓存，以减少二次引入时的开销。不同的地方在于，浏览器仅仅缓存文件，而 Node 缓存的是编译和执行之后的对象。
:::

### 路径分析

::: tip
  路径分析是根据 require() 方法传入的参数进行的，即模块标识符。模块标识符在 Node 中主要有以下几类：

* 核心模块，如 http、fs、path等
* . 或 .. 开始的相对路径文件模块。
* 以 / 开始的绝对路径文件模块。
* 非路径形式的文件模块，如自定义的 connect 模块。
:::

#### 核心模块

::: tip
  核心模块的优先级仅次于缓存加载，它在 Node 源代码编译过程中已经编译为二进制代码，其加载过程最快。

  如果试图加载一个与核心模块标识符相同的自定义模块，那是不会成功的。如果自己编写了一个 http 用户模块，想要加载成功，必须选择一个不同的标识符或者换用路径的方式。
:::

#### 路径形式的文件模块

::: tip
  以 . 、.. 和 / 开始的标识符，这里都被当做文件模块来处理。在分析路径模块时，require() 方法会将路径转为真实路径，并以真实路径作为索引，将编译执行后的结果存放到缓存中，以使二次加载时更快。

  由于文件模块给 Node 指明了确切的文件位置，所以在查找过程中可以节约大量时间，其加载速度慢于核心模块。
:::

#### 自定义模块

::: tip
  自定义模块指的是非核心模块，也不是路径形式的标识符。它是一种特殊的文件模块，可能是一个文件或者包的形式。这类模块的查找是所有方式中最慢的一种。

  在了解自定义模块的查找方式之前，先介绍下 **模块路径** 这个概念。模块路径是 Node 在定位文件模块的具体文件时制定的查找策略，具体表现为一个路径组成的数组。关于这个路径的生成规则，可通过 **module.paths** 查看。

```js
console.log(module.paths)
/*
[
  'D:\\VSCode\\test\\node-server\\node_modules',
  'D:\\VSCode\\test\\node_modules',
  'D:\\VSCode\\node_modules',
  'D:\\node_modules'
]
*/
```
  可以看出，模块路径的生成规则如下：
* 当前文件目录下的 node_modules 目录
* 父目录下的 node_modules 目录
* 父目录的父目录下的 node_modules 目录
* 沿路径向上逐级递归，直到根目录下的 node_modules 目录

它的生成方式与 JavaScript 的**原型链**或**作用域链**的查找方式十分类似。在加载过程中，Node会逐个尝试模块路径中的路径，直到找到目标文件为止。可以看出，当前文件的路径越深，模块查找耗时会越多，这是自定义模块加载速度最慢的原因。
:::

### 文件定位

::: tip
  在文件定位过程中，还有一些细节需要注意，这主要包括文件扩展名的分析、目录和包的处理。
:::

#### 文件扩展名

::: tip
  require() 在分析模块标识符的过程中，会出现标识符中不包含文件扩展名的情况。CommonJS 模块规范也允许在标识符中不包含文件扩展名，这种情况下，Node 会按 .js、.json、.node 的次序不足扩展名，依次尝试。

  在尝试的过程中，需要调用fs模块同步阻塞式地判断文件是否存在，因为 Node 是单线程的，所以这里是一个会引起性能问题的地方。
:::

#### 目录分析和包

::: tip
  在分析标识符的过程中，require() 通过分析文件扩展名之后，可能没有查到对应文件，但是得到一个目录，这在引入地第三方模块和逐个模块路径查找时经常会出现，此时 Node 会将目录当做一个包来处理。

  在这个过程中，Node 对 CommonJS 包规范进行了一定程度的支持。首先，Node 在当前目录下查找 package.json，通过 JSON.parse() 解析出包描述对象，从中取出 **main** 属性指定的文件名进行定位，或者压根没有 package.json 文件，Node 会将 index 当作默认文件名，然后依次查找 index.js、index.json、index.node。

  如果在目录分析的过程中没有定位成功任何文件，则自定义模块进入下一个模块路径进行查找。如果模块路径数组都被遍历完毕，依然没有查找到目标文件，则会抛出查找失败的异常。
:::

### 模块编译

::: tip
  在 Node 中，每个文件模块都是一个对象，它的定义如下：
```js
function Module(id, parent) {
  this.id = id
  this.exports = {}
  this.parent = parent
  if(parent && parent.children) {
    parent.children.push(this)
  }
  this.filename = null
  this.loaded = false
  this.children = []
}
```

  编译和执行是引入文件模块的最后一个阶段。定位到具体的文件后，Node 会新建一个模块对象，然后根据路径载入并编译，对于不同的文件扩展名，其载入方法也有所不同，具体如下：

  * **.js 文件** ---- 通过模块同步读取文件后编译执行
  * **.node 文件** ---- 这是用 C/C++ 编写的扩展文件，通过 dlopen() 方法加载后编译生成文件
  * **.json 文件** ---- 通过fs模块同步读取文件后，用 JSON.parse() 解析返回结果
  * **其余扩展名文件** ---- 它们都被当作 .js 文件载入

  每个编译成功的模块都会将其文件路径作为所以缓存在 **Module._cache** 对象上，以提高二次引入的性能。

  根据不同的文件扩展名，Node 会调用不同的读取方式，如 .json 文件的调用如下：

```js
// Native extension for .json
Module._extensions['.json'] = function(module, filename) {
  var content = NativeModule.requier('fs').readFileSync(filename, 'utf8')
  try {
    module.exports = JSON.parse(stripBOM(content))
  } catch(err) {
    err.message = filename + ': ' + err.message
    throw err
  }
}
```

  其中，Module._extensions 会被赋值给 require() 的 extensions 属性，所以通过在代码中访问 require.extensions 可以知道系统中已有的扩展加载方式，如下：

```js
console.log(require.extensions)
/*
{
  '.js': [Function (anonymous)],
  '.json': [Function (anonymous)],
  '.node': [Function (anonymous)]
}
*/
```
  如果想对自定义的扩展名进行特殊的加载，可以通过类似 require.extensions['.txt'] 的方式实现。但是目前官方不鼓励通过这种方式来自定义扩展名的加载，而是期望先将其他语言或文件编译成 JavaScript 文件后再加载，这样做的好处在于不将繁琐的编译加载等过程引入 Node 的执行过程。

  在确定文件的扩展名后，Node 将调用具体的编译方式来将文件执行后返回给调用者。下面看看这三种扩展名的编译方式。
:::

#### JavaScript 模块的编译

::: tip
  在 CommonJS 中，我们知道每个模块文件中存在着 require、exports、module 这3个变量，但是它们在模块文件中并没有定义，那么它们从何而来呢？甚至在 Node 的 API 文档中，我们知道每个模块中还有 __filename、__dirname 两个变量的存在，它们又是从何而来的呢？

  事实上，在编译的过程中，Node 对获取的 JavaScript 文件内容进行了头尾包装。在头部添加了 (function(exports, require, module, __filename, __dirname){\n, 在尾部添加了\n});。一个正常的 JavaScript 文件会被包装成如下的样子：

```js
(function(exports, require, module, __filename, __dirname) {
  var math = require('math')
  exports.area = function(radius) {
    return math.PI * radius * radius
  }
})
```

  这样每个每个模块文件之间都进行了作用域隔离。包装之后的代码会通过 vm 元素模块的 runInThisContext() 方法执行（类似 eval，只是具有明确上下文，不污染全局），返回一个具体的 function 对象。最后，将当前模块对象的 exports 属性、require() 方法、module(模块对象自身)，以及在文件定位中得到的完整文件路径和文件目录作为参数传递给这个 function() 执行。

  这就是这些变量并没有定义在每个模块文件中却存在的原因。在执行之后，模块的 exports 属性被返回给了调用方。exports 属性上的任何方法和属性都可以被外部调用到，但是模块中的其余变量或属性则不可被直接调用。

  这也解释了为什么 require() 是同步的，且每次 require() 得到的对象都是一个新的对象，以及在模块内直接给 exports 对象赋值是无效的，而必须通过 module.exports = newVal 这种方式赋值等这些问题。
:::

#### C/C++ 模块的编译

::: tip
  Node 调用 process.dlopen() 方法进行加载和执行。在 Node 的架构下，dlopen() 方法在 Windows 和 *nix 平台下分别有不同的实现，通过 libuv 兼容层进行了封装。

  实际上， .node 的模块文件并不需要编译，因为它是编写 C/C++ 模块之后编译生成的，所以这里只有加载和执行的过程。在执行的过程中，模块的 exports 属性与 .node 模块产生联系，然后返回给调用者。

  C/C++ 模块给 Node 使用者带来的优势主要是执行效率方面的，劣势则是 C/C++ 模块的编写门槛比 JavaScript 高。
:::

#### JSON 文件的编译

::: tip
  .json 文件的编译时3中编译方式中最简单的。Node 利用fs模块同步读取 JSON 文件的内容之后，调用 JSON.parse() 方法得到对象，然后将它赋给模块对象的 exports，以供外部调用。

  本文参考 《深入浅出Node.js》

  [回首页](/frontend)
:::

（完）
