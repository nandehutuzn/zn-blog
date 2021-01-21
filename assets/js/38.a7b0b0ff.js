(window.webpackJsonp=window.webpackJsonp||[]).push([[38],{458:function(t,v,_){"use strict";_.r(v);var a=_(41),e=Object(a.a)({},(function(){var t=this,v=t.$createElement,_=t._self._c||v;return _("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[_("h1",{attrs:{id:"http-网络协议"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#http-网络协议"}},[t._v("#")]),t._v(" HTTP 网络协议")]),t._v(" "),_("hr"),t._v(" "),_("p",[_("em",[t._v("2020/10/26")])]),t._v(" "),_("h2",{attrs:{id:"http-协议"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#http-协议"}},[t._v("#")]),t._v(" HTTP 协议")]),t._v(" "),_("div",{staticClass:"custom-block tip"},[_("p",[t._v("HTTP 是网络应用层的一个协议，重要性不言而喻，无论是 webservice 还是 rest 做大型架构，都离不开HTTP协议的认识，甚至可以简化的说：")]),t._v(" "),_("ul",[_("li",[t._v("webservice = HTTP协议 + XML")]),t._v(" "),_("li",[t._v("Rest = HTTP协议 + json")]),t._v(" "),_("li",[t._v("各种 "),_("strong",[t._v("API")]),t._v(" 也一般是用 HTTP + XML/json来实现的")])])]),t._v(" "),_("h2",{attrs:{id:"原理"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#原理"}},[t._v("#")]),t._v(" 原理")]),t._v(" "),_("div",{staticClass:"custom-block tip"},[_("p",[t._v("什么是协议，一式双份/多份，双方都遵从的一个规范，这个规范就可以成为协议，计算机之所以能全世界互通，协议功不可没。如FTP协议、SMTP协议、HTTP协议等")])]),t._v(" "),_("h3",{attrs:{id:"http-协议工作流程"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#http-协议工作流程"}},[t._v("#")]),t._v(" HTTP 协议工作流程")]),t._v(" "),_("div",{staticClass:"custom-block tip"},[_("p",[t._v("首先客户端(如浏览器)和服务端是相互独立的，客户端要向服务端发请求时，必须先建立连接，连接可理解为网络上的虚拟电路，连接建立之后客户端发送请求，然后服务端沿着连接，返回响应信息。客户端接收响应，解释出图片或文字，然后断开连接，一次 HTTP 请求结束。")]),t._v(" "),_("p",[t._v("下面看看一次请求中的详细过程")])]),t._v(" "),_("h3",{attrs:{id:"http-请求信息和响应信息"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#http-请求信息和响应信息"}},[t._v("#")]),t._v(" HTTP 请求信息和响应信息")]),t._v(" "),_("h4",{attrs:{id:"请求信息"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#请求信息"}},[t._v("#")]),t._v(" 请求信息")]),t._v(" "),_("div",{staticClass:"custom-block tip"},[_("ul",[_("li",[t._v("请求行 （GET /api/home.html HTTP/1.1）\n"),_("ul",[_("li",[t._v("请求方法（GET、POST、PUT、DELETE、HEAD等）\n"),_("ul",[_("li",[t._v("这些请求方法虽是HTTP协议里规定的，但服务器未必允许或支持这些方法")]),t._v(" "),_("li",[t._v("HEAD 和 GET 区别：HEAD 不返回主体信息，而 GET 请求会返回主体信息，当不需要服务器返回的主体信息时，可用 HEAD 方法")])])]),t._v(" "),_("li",[t._v("请求路径")]),t._v(" "),_("li",[t._v("所用协议")])])]),t._v(" "),_("li",[t._v("请求头信息（头信息结束后有一个空行，由这个空行来做区分，即使没有主体信息，空行也不能省略）\n"),_("ul",[_("li",[t._v("Host: 请求主机地址")]),t._v(" "),_("li",[t._v("Content-length: 接下来主体信息长度")]),t._v(" "),_("li",[t._v("Content-type: 主体数据格式")]),t._v(" "),_("li",[t._v("key: value")])])]),t._v(" "),_("li",[t._v("请求主体信息（可选）")])])]),t._v(" "),_("h4",{attrs:{id:"响应信息"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#响应信息"}},[t._v("#")]),t._v(" 响应信息")]),t._v(" "),_("div",{staticClass:"custom-block tip"},[_("ul",[_("li",[t._v("响应行\n"),_("ul",[_("li",[t._v("协议版本")]),t._v(" "),_("li",[t._v("状态码\n"),_("ul",[_("li",[t._v("1XX：接收到请求，继续处理")]),t._v(" "),_("li",[t._v("2XX：操作成功收到、理解和接收")]),t._v(" "),_("li",[t._v("3XX：为了完成请求，必须采取进一步措施\n"),_("ul",[_("li",[t._v("301 ---- 永久重定向")]),t._v(" "),_("li",[t._v("302 ---- 临时重定向 FOUND，响应头信息中会指定 "),_("strong",[t._v("Location: 重定向地址")]),t._v(" 信息")]),t._v(" "),_("li",[t._v("304 ---- Not Modified 取浏览器缓存")]),t._v(" "),_("li",[t._v("307 ---- 重定向中 "),_("strong",[t._v("保持原有的请求数据")]),t._v("，针对 POST 等携带数据的请求方法")])])]),t._v(" "),_("li",[t._v("4XX：客户端错误")]),t._v(" "),_("li",[t._v("5XX：服务端错误")])])]),t._v(" "),_("li",[t._v("状态文字（描述状态码文字，便于观察）")])])]),t._v(" "),_("li",[t._v("响应头信息\n"),_("ul",[_("li",[t._v("key: value")]),t._v(" "),_("li",[t._v("content-length: 接下来主体信息的长度")])])]),t._v(" "),_("li",[t._v("响应主体信息")])])]),t._v(" "),_("h2",{attrs:{id:"http-进阶"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#http-进阶"}},[t._v("#")]),t._v(" HTTP 进阶")]),t._v(" "),_("h3",{attrs:{id:"防盗链"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#防盗链"}},[t._v("#")]),t._v(" 防盗链")]),t._v(" "),_("div",{staticClass:"custom-block tip"},[_("p",[t._v("如果在自己的网页里引用站外图片时，经常会出现图片无法访问的错误，那它们是怎么识别到图片是站外被引用的呢，或者一些网站是怎么实现统计用户是从哪个网站跳转过来的呢。原理是一样的，根据请求头信息中的 "),_("strong",[t._v("Referer: 网页来源")]),t._v("，即上一页的地址，如果是直接在浏览器上输入地址访问的，则没有 Referer 头信息。")]),t._v(" "),_("p",[t._v("那么怎么实现图片防盗链呢，在 web 服务器层面，根据 http 协议的 referer 头信息来判断如果来自站外，则返回相应措施。")])]),t._v(" "),_("h3",{attrs:{id:"缓存详解"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#缓存详解"}},[t._v("#")]),t._v(" 缓存详解")]),t._v(" "),_("h4",{attrs:{id:"协商缓存"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#协商缓存"}},[t._v("#")]),t._v(" 协商缓存")]),t._v(" "),_("div",{staticClass:"custom-block tip"},[_("p",[t._v("我们观察图片的下载，往往第一次请求时，返回 200 OK，第二次请求时，返回 304 Not Modified。")]),t._v(" "),_("p",[_("strong",[t._v("原因：")]),t._v(' 在网络上，有一些缓存服务器，另外，浏览器自身也有缓存功能，当我们第一次访问某图片时，正常下载，返回值 200，基于一个前提--图片不会经常改动，服务器在返回 200 的同时，还返回该图片的 "签名" -- ETag，Last-Modified，当浏览器再次访问该图片时，携带该"签名" -- If-None-Match，If-Modified-Since 去服务器校验该"签名"，如果图片没有变化，返回304  通知浏览器直接使用缓存中的图片，这样减轻了服务器的负担。')])]),t._v(" "),_("h4",{attrs:{id:"强制缓存"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#强制缓存"}},[t._v("#")]),t._v(" 强制缓存")]),t._v(" "),_("div",{staticClass:"custom-block tip"},[_("p",[t._v("在一些大型网站，有N太缓存服务器，那么这些服务器如何处理主服务器上的文件，要不要让浏览器缓存这些文件，缓存多久，HTTP 协议有几个字段来实现这个功能的。")]),t._v(" "),_("p",[_("strong",[t._v("cache-control：")]),t._v(" 告诉浏览器、缓存服务器以怎样的方式缓存资源")]),t._v(" "),_("ul",[_("li",[t._v("no-store -- 不缓存，每次都向源服务器发请求，一般是网站首页")]),t._v(" "),_("li",[t._v("must-revalidate -- 告诉浏览器、缓存服务器，在本地资源副本过期前，可以使用本地副本，本地副本一旦过期，必须去源服务器进行有效性校验")]),t._v(" "),_("li",[t._v("no-cache -- 告诉浏览器或缓存服务器不管本地缓存是否过期，在使用资源副本前，都应先去资源源服务器校验资源有效性")]),t._v(" "),_("li",[t._v("max-age等")])]),t._v(" "),_("p",[_("strong",[t._v("expires：")]),t._v(" 资源过期时间，如果浏览器发现资源还在缓存有效期内，则不发起请求，减轻服务器压力")])]),t._v(" "),_("h3",{attrs:{id:"http-内容压缩"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#http-内容压缩"}},[t._v("#")]),t._v(" HTTP 内容压缩")]),t._v(" "),_("div",{staticClass:"custom-block tip"},[_("p",[t._v("在访问大型网站时，在它的请求响应头信息中，除了有 Content-length: value 信息，还会有一个 "),_("strong",[t._v("Content-Encoding: gzip")]),t._v(" 信息，此时 Content-length 的值和返回的主体长度不一致，原因在于为了提高网页在网络上的传输速度，服务器对主体信息进行了压缩，如常见的 gzip压缩、deflate压缩、compress压缩等，Content-length 为压缩后的长度。")])]),t._v(" "),_("h3",{attrs:{id:"http-cookie"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#http-cookie"}},[t._v("#")]),t._v(" HTTP Cookie")]),t._v(" "),_("div",{staticClass:"custom-block tip"},[_("p",[t._v("HTTP 请求是无状态的，即每次HTTP请求是独立的，服务器无法识别HTTP请求是哪个客户发起的，所以在对客户请求认证之后在响应头信息中通过 "),_("strong",[t._v("Set-cookie")]),t._v(" 字段标识客户，以后浏览器每次发起 HTTP 请求都必须在请求头信息中通过 "),_("strong",[t._v("Cookie")]),t._v(" 字段携带该信息给服务器识别。Cookie 也可能被盗，为安全起见现在都通过 "),_("strong",[t._v("图片验证码")]),t._v("、"),_("strong",[t._v("手机验证码")]),t._v(" 来进行验证。")]),t._v(" "),_("p",[t._v("Cookie 里一般会包含一下信息：")]),t._v(" "),_("table",[_("thead",[_("tr",[_("th",{staticStyle:{"text-align":"left"}},[t._v("属性项")]),t._v(" "),_("th",{staticStyle:{"text-align":"left"}},[t._v("属性项介绍")])])]),t._v(" "),_("tbody",[_("tr",[_("td",{staticStyle:{"text-align":"left"}},[t._v("NAME=VALUE")]),t._v(" "),_("td",{staticStyle:{"text-align":"left"}},[t._v("键值对，可以设置要保存的 Key/Value，注意这里的 NAME 不能和其他属性项的名字一样")])]),t._v(" "),_("tr",[_("td",{staticStyle:{"text-align":"left"}},[t._v("Expires")]),t._v(" "),_("td",{staticStyle:{"text-align":"left"}},[t._v("过期时间，在设置的某个时间点后该 Cookie 会失效")])]),t._v(" "),_("tr",[_("td",{staticStyle:{"text-align":"left"}},[t._v("maxAge")]),t._v(" "),_("td",{staticStyle:{"text-align":"left"}},[t._v("设置 Cookie 有效时长，有3种值，正数：该 Cookie 会在 maxAge 秒后自动失效，浏览器会将maxAge为正数的 Cookie 持久化，无论是关闭浏览器还是电脑，只要在 maxAge 秒之前，登录网站时该 Cookie 仍然有效。负数：表示该 Cookie 只是一个临时 Cookie，不会被持久化，仅在本浏览器窗口或者本窗口打开的子窗口中有效，关闭浏览器后该 Cookie 立即失效。当 maxAge为 0 时，表示立即删除 Cookie")])]),t._v(" "),_("tr",[_("td",{staticStyle:{"text-align":"left"}},[t._v("Domain")]),t._v(" "),_("td",{staticStyle:{"text-align":"left"}},[t._v("生成该 Cookie 的域名，如 domain='www.baidu.com'，正常情况下 Cookie 是只能在一个域名下使用，如果想在多个二级域名中使用同一个 Cookie，可以设置该值为 .baidu.com")])]),t._v(" "),_("tr",[_("td",{staticStyle:{"text-align":"left"}},[t._v("Path")]),t._v(" "),_("td",{staticStyle:{"text-align":"left"}},[t._v("该 Cookie 是在当前的哪个路径下生成的，如 path=/wp-admin/")])]),t._v(" "),_("tr",[_("td",{staticStyle:{"text-align":"left"}},[t._v("Secure")]),t._v(" "),_("td",{staticStyle:{"text-align":"left"}},[t._v("如果设置了这个属性，那么只会在 SSL 连接时才会回传该 Cookie")])]),t._v(" "),_("tr",[_("td",{staticStyle:{"text-align":"left"}},[t._v("HttpOnly")]),t._v(" "),_("td",{staticStyle:{"text-align":"left"}},[t._v("Cookie 信息只读")])])])])]),t._v(" "),_("h2",{attrs:{id:"http-各版本特性"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#http-各版本特性"}},[t._v("#")]),t._v(" HTTP 各版本特性")]),t._v(" "),_("h3",{attrs:{id:"http-0-9"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#http-0-9"}},[t._v("#")]),t._v(" HTTP/0.9")]),t._v(" "),_("div",{staticClass:"custom-block tip"},[_("p",[t._v("0.9不支持请求头，只支持GET方法")])]),t._v(" "),_("h3",{attrs:{id:"http-1-0"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#http-1-0"}},[t._v("#")]),t._v(" HTTP/1.0")]),t._v(" "),_("div",{staticClass:"custom-block tip"},[_("ul",[_("li",[t._v("在请求中加入HTTP版本号")]),t._v(" "),_("li",[t._v("HTTP开始有header")]),t._v(" "),_("li",[t._v("增加了HTTP Status Code标识相关的状态码")]),t._v(" "),_("li",[t._v("增加Content-type 可以传输其他文件")]),t._v(" "),_("li",[t._v("缺陷：\n"),_("ul",[_("li",[t._v("每请求一个资源都要新建一个TCP链接，而且是串行请求")])])])])]),t._v(" "),_("h3",{attrs:{id:"http-1-1"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#http-1-1"}},[t._v("#")]),t._v(" HTTP/1.1")]),t._v(" "),_("div",{staticClass:"custom-block tip"},[_("ul",[_("li",[t._v("支持设置keepalive让HTTP重用TCP链接")]),t._v(" "),_("li",[t._v("支持pipeline网络传输，第一个请求发出去，不必等其回来，就可以发第二个请求出去")]),t._v(" "),_("li",[t._v('支持 Chunked Responses，也就是说，在 Response 的时候，不必说明 Content-Length ，这样，客户端就不能断连接，直到收到服务端的EOF标识。这种技术又叫 "服务端push模型"')]),t._v(" "),_("li",[t._v("增加 cache control 机制")]),t._v(" "),_("li",[t._v("协议头注增加 Language, Encoding, Type 等头，让客户端可以跟服务器端进行更多协商")]),t._v(" "),_("li",[t._v("header中增加 HOST 头，让服务器知道请求的是哪个网站。因为可以有多个域名解析到同一个IP上")]),t._v(" "),_("li",[t._v("加入 OPTIONS 方法，其主要用于 CORS - Cross Origin Resource Sharing 应用")]),t._v(" "),_("li",[t._v("缺陷：\n"),_("ul",[_("li",[t._v("请求并行数量限制")]),t._v(" "),_("li",[t._v("传输数据时，是以文本的方式，借助耗 CPU的zip压缩的方式减少网络带宽，但是耗了前端和后端的 CPU，传输数据的成本比较大")])])])])]),t._v(" "),_("h3",{attrs:{id:"http-2-0"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#http-2-0"}},[t._v("#")]),t._v(" HTTP/2.0")]),t._v(" "),_("div",{staticClass:"custom-block tip"},[_("ul",[_("li",[t._v("HTTP/2 是一个二进制协议，增加了数据传输的效率")]),t._v(" "),_("li",[t._v("没有请求并发数量限制")]),t._v(" "),_("li",[t._v("多路复用，HTTP2.0中，有两个概念非常重要：帧（frame）和流（stream），帧是最小的数据单位，每个帧会标识出该帧属于哪个流，流是多个帧组成的数据流。\n所谓多路复用，即在一个TCP连接中存在多个流，即可以同时发送多个请求，对端可以通过帧中的表示知道该帧属于哪个请求。在客户端，这些帧乱序发送，到对端后再根据每个帧首部的流标识符重新组装。通过该技术，可以避免HTTP旧版本的队头阻塞问题，极大提高传输性能。")]),t._v(" "),_("li",[t._v("压缩header，如果同时发出多个请求，他们的头是一样的或是相似的，那么，协议会帮你消除重复的部分")]),t._v(" "),_("li",[t._v("允许服务端在客户端放cache，又叫服务端push，也就是说，没有请求的东西，服务端可以先发送到浏览器本地缓存")]),t._v(" "),_("li",[t._v("缺陷：\n"),_("ul",[_("li",[t._v('协议复杂度提升，比如内部维护一个"优先级树"来做一些资源和请求的调度和控制，降低协议的可维护性和可扩展性的权衡')]),t._v(" "),_("li",[t._v("若干个HTTP的请求在复用一个TCP的连接，底层的TCP协议是不知道上层有多少个HTTP请求的，所以一旦发生丢包，造成的问题就是所有的HTTP请求都必需等待这个丢了的包被重新传回来，哪怕丢的那个包不是我这个HTTP请求的 ---- Head-of-Line Blocking")])])])])]),t._v(" "),_("h3",{attrs:{id:"http-3-0"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#http-3-0"}},[t._v("#")]),t._v(" HTTP/3.0")]),t._v(" "),_("div",{staticClass:"custom-block tip"},[_("p",[t._v("把HTTP底层的TCP协议改成UDP")]),t._v(" "),_("p",[_("a",{attrs:{href:"/frontend"}},[t._v("回首页")])])]),t._v(" "),_("p",[t._v("（完）")])])}),[],!1,null,null,null);v.default=e.exports}}]);