# @vue/cli-service 插件原理
---
*2020/11/08*

## 前言

::: tip
  Vue-CLi 3 之前，vue-cli 只是一个功能很单一的脚手架工具，它唯一的功能就是基于模板创建一个 Vue 项目，项目创建完，它的任务也完成了。

  而 Vue-Cli 3 以后，它的功能变得更加丰富了，可以说项目创建、开发、测试、构建、部署等它都可以有用武之地，它不仅帮我们最大化内置了一些常用功能（开箱即用），还提供了插件机制给开发者扩展的机会，下面就看看和开发者息息相关的 @vue/cli-service 实现原理，及我们能怎么更好的利用它给开发提速。 
:::

## 常用的两个插件API

### configureDevServer

::: tip
  可以通过这个方法在开发服务器上实现一些自己的操作，比如打印每次的请求信息，拦截每次请求，并返回自己的mock数据等，它传入一个app参数，即本地开启的express服务。

```js
// mock-server.js
module.exports = (api, options) => {
  api.configureDevServer(app => {
    app.use(/*...*/)
  })
}
```
:::

### registerCommand

::: tip
  通过这个方法可以注册一个自己的命令(myCommand)，当在命令行运行 vue-cli-service myCommand 时，通过node做些自己想做的事情，如删除一些文件，新建一些文件，合并一些文件等。

```js
module.exports = (api, options) => {
  api.registerCommand('myCommand', (args, rawArgs) => {
    // 使用 node 做更多的事，如文件读写
  })
}
```
:::

### 插件注册

::: tip
  在项目 package.json 文件中通过 vuePlugin 字段对它们进行注册

```js
// package.json
"vuePlugins": {
    "service": [
      "第一个插件文件地址",
      "第二个插件文件地址"
    ]
  }
```

  下面源码简单看看他们的实现
:::

## 读源码

::: tip
  随便找个 vue 项目，找到 node_modules/@vue/cli-service/package.json 起点文件，因为我们一般是以命令行的方式（vue-cli-service serve）使用它，所以找到 package.json 文件的 bin 字段：

```js
// node_modules/@vue/cli-service/package.json
"bin": {
    "vue-cli-service": "bin/vue-cli-service.js"
  },
```
:::

### bin/vue-cli-service.js

::: tip

  即，当我们在命令行输入 npm run serve，Node 就找到 node_modules/@vue/cli-service/bin/vue-cli-service.js 文件，开始执行。在这个文件里，它除了做了一些校验外，还做了两件事，一是提取命令行中的参数值，还有一个就是创建了一个 **Service** 对象，并在最后调用 Service 实例的 run() 方法。

```js
//... 校验等省略
const Service = require('../lib/Service')
const service = new Service(process.env.VUE_CLI_CONTEXT || process.cwd())

const rawArgv = process.argv.slice(2)
const args = require('minimist')(rawArgv, {
  boolean: [
    // build
    'modern',
    'report',
    'report-json',
    'inline-vue',
    'watch',
    // serve
    'open',
    'copy',
    'https',
    // inspect
    'verbose'
  ]
})
// 跟在 vue-cli-service 后的命令，如内置的 serve、build等
const command = args._[0]

service.run(command, args, rawArgv).catch(err => {
  error(err)
  process.exit(1)
})
```
:::

### lib/Service.js

::: tip
  先看下它的构造函数：

```js
constructor (context, { plugins, pkg, inlineOptions, useBuiltIn } = {}) {
    process.VUE_CLI_SERVICE = this
    this.initialized = false
    this.context = context
    this.inlineOptions = inlineOptions
    this.webpackChainFns = []
    this.webpackRawConfigFns = []
    this.devServerConfigFns = []
    this.commands = {}
    // Folder containing the target package.json for plugins
    this.pkgContext = context
    // package.json containing the plugins
    this.pkg = this.resolvePkg(pkg)
    // 从项目 package.json 文件的 vuePlugin 字段加载插件
    this.plugins = this.resolvePlugins(plugins, useBuiltIn)
    // pluginsToSkip will be populated during run()
    this.pluginsToSkip = new Set()

    // this.modes = { serve: 'development', build: 'production', inspect: 'development' }
    this.modes = this.plugins.reduce((modes, { apply: { defaultModes }}) => {
      return Object.assign(modes, defaultModes)
    }, {})
  }

resolvePlugins (inlinePlugins, useBuiltIn) {
  // ... 
  // 加载本地插件
  if (this.pkg.vuePlugins && this.pkg.vuePlugins.service) {
    const files = this.pkg.vuePlugins.service
    if (!Array.isArray(files)) {
      throw new Error(`Invalid type for option 'vuePlugins.service', expected 'array' but got ${typeof files}.`)
    }
    plugins = plugins.concat(files.map(file => ({
      id: `local:${file}`,
      apply: loadModule(`./${file}`, this.pkgContext)
    })))
  }

  return plugins
}
```

  删除了一些注释，这里我们需要关注的两个属性 **this.commands**、**this.plugins**，如果我们后面要给 cli-service 增加插件，都会保存到这两个属性里面。也就是说 new Service() 之后，this.plugins[] 已经包含了内置插件和本地插件，但是 this.commands 属性还是空的，继续往下看 run() 方法。

```js
  async run (name, args = {}, rawArgv = []) {
    // name 就是 command，即 serve、build ...
    // resolve mode
    // prioritize inline --mode
    // fallback to resolved default modes from plugins or development if --watch is defined
    const mode = args.mode || (name === 'build' && args.watch ? 'development' : this.modes[name])

    // --skip-plugins arg may have plugins that should be skipped during init()
    this.setPluginsToSkip(args)

    // load env variables, load user config, apply plugins
    // 这个方法里对 this.commands、this.plugins 做了些处理
    this.init(mode)

    args._ = args._ || []
    let command = this.commands[name]
    if (!command && name) {
      error(`command "${name}" does not exist.`)
      process.exit(1)
    }
    if (!command || args.help || args.h) {
      command = this.commands.help
    } else {
      args._.shift() // remove command itself
      rawArgv.shift()
    }
    const { fn } = command
    // 从 command 中取出定义好的方法，执行它
    return fn(args, rawArgv)
  }
```

  这个方法里面的逻辑也不复杂，根据 name 从 this.commands 中取出方法去执行，而 this.commands 数据是在 this.init() 方法里进行的，看看 this.init() 方法.

```js
  init (mode = process.env.VUE_CLI_MODE) {
    // ...

    // apply plugins.
    // 遍历 this.plugins，
    this.plugins.forEach(({ id, apply }) => {
      if (this.pluginsToSkip.has(id)) return
      // 执行 this.plugins 每个元素的 apply方法
      apply(new PluginAPI(id, this), this.projectOptions)
    })

    // apply webpack configs from project config file
    if (this.projectOptions.chainWebpack) {
      this.webpackChainFns.push(this.projectOptions.chainWebpack)
    }
    if (this.projectOptions.configureWebpack) {
      this.webpackRawConfigFns.push(this.projectOptions.configureWebpack)
    }
  }
```
  我们关注的 this.plugins，这里对它进行了一次遍历，并执行它的 apply 方法，apply 方法有两个参数，第一个是 **PluginAPI** 实例，第二个参数是 webpack 配置，通过 PluginAPI 构造函数第二个参数把自己(Service) 传递进行，看看 PluginAPI 做了啥。 
:::

### lib/PluginAPI.js

::: tip
  这个对象的构造函数很简单，只是把当前的 service 对象缓存起来了，即 service 对象中的 commands 和 plugins 这两个一直在注视的属性也能拿到。

```js
constructor (id, service) {
    this.id = id
    this.service = service
  }
```

  看到这里 cli-service 的原理差不多也清楚了， PluginAPI 实例就是我们创建 vuePlugin 本地插件导出方法的第一个参数，它暴露的方法在这里都能找到，比如下文会用到的 **configureDevServer**、 **registerCommand** 等。

``` js
// ...
registerCommand (name, opts, fn) {
  if (typeof opts === 'function') {
    fn = opts
    opts = null
  }
  // 往 service.commands 对象注入自己的命令
  this.service.commands[name] = { fn, opts: opts || {}}
}
configureDevServer (fn) {
  this.service.devServerConfigFns.push(fn)
}
chainWebpack (fn) {
  this.service.webpackChainFns.push(fn)
}
```
  可以发现在插件中实现的回调，背后都被添加开局阶段新建的 service 实例上，这样我们写的插件就能都被 vue-cli-service 用起来了。
:::
