# JSONP 方法原理及实现
---
*2020/10/30*

## 前言

::: tip
  说到前端 **跨域** 就会想到 **CORS**、**Nginx**、**JSONP**，前两个比较常用也比较常见，JSONP 实现跨域的原理是什么？我们应该怎么使用它？今天聊聊这个话题。
:::

## JSONP 原理

::: tip
  原理很简单，虽然 **XMLHttpRequest** 对象遵循同源策略，但是 **script**、**img** 这些标签不一样，你可以将它们的 **src** 属性指向任意站外的地址，浏览器也会向这个地址发起一个 GET 请求，来获取相关资源。

  一开始我的理解也就到此为止了，但对它的使用场景、和后台怎么实现交互还是不太明白，后来看的文章多了，也清楚了。这个 **src**，并不是 script 标签常规的类似 **http://www.baidu.com/my_picutre.jpg** 这种格式的 URL，它可以是一个正常的 GET 请求生成的 URI，即可以在 URI中设置参数，比如：**http://www.baidu.com/my_request?username=zhangsan&phone=13422221111&callback=myCallback**，然后在域名对应的服务器能接收到这个 GET 请求，通过 **callback** 的参数将数据返回，而不是将数据放到 HTTP 请求的响应体中，因为这个 HTTP 请求是浏览器自动发起的，浏览器接收到服务端响应后会自动对数据进行解析，我们没有机会去处理这个请求。

  原理讲完，下面看看 **JSONP** 的实现
:::

## JSONP 实现

### 客户端
::: tip
  为方便使用，我们一般会封装一个异步 JSONP 方法，实现如下：

``` js
const jsonp = ({ url, params, callbackName }) => {
  const generateURL = () => {
    let dataStr = ''
    for(let key in params) {
      dataStr += `${key}=${params[key]}&`
    }
    dataStr += `callback=${callbackName}`

    return `${url}?${dataStr}`
  }

  return new Promise((resolve, reject) => {
    // callbackName 参数在调用 jsonp 方法时可以不传，方法逻辑是固定的，也不会被外部调用
    callbackName = callbackName || Math.random().toString().replace(',', '')
    let scriptEle = document.createElement('script')
    scriptEle.src = generateURL()
    document.body.appendChild(scriptEle)
    // 将 callback 绑定在 window 上，为了请求返回后调用
    window[callbackName] = data => {
      resolve(data)
      // 请求完毕，移除多余 script 标签
      document.body.removeChild(scriptEle)
      window[callbackName] = null
    }
  })
}
```

  前端调用 jsonp 方法向后端发起请求后，还需要后端接口配合，才能让 **window[callbackName]** 方法被调用，后端实现如下。
:::

### 服务端

::: tip
  后端以 Node express 为例:

``` js
const express = require('express')
const app = express()

app.get('/xxxx', (req, res) => {
  const { a, b, callback } = req.query
  // 后端逻辑处理 ...
  // 返回给 script 标签，浏览器自动对结果进行解析，即调用 window[callbackName] 方法
  res.end(`${callback}('数据包')`)
})

app.listen(3000)

// 最后客户端调用
jsonp({
  url: 'http://localhost:3000',
  params: {
    a: 1,
    b: 2
  }
}).then(data => {
  console.log(data) // 数据包
})
```
:::

## 总结

::: tip
  与 CORS 相比，JSONP 最大的优势在于兼容性好，IE低版本不能使用 CORS，但是可以使用JSONP，缺点也很明显，请求方法单一，只支持 GET 请求。

  [回首页](/frontend)
:::

（完）