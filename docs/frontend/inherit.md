# ES5实现继承的几种方式
---
*2020/12/20*

## 前言

::: tip
  `javascript` 也是一门面向对象语言，里面也有子类、父类、继承这些概念，`ES6` 之后用关键字 `class`、`extends`、`implements`，那么 `ES5` 里面要实现继承该怎么做呢，今天看看这个问题。
:::

## 原型链继承

### 基本构思

::: tip
  `ECMA-262` 中就把**原型链**定义为 `ECMAScript` 的主要继承方式。其基本思想就是通过原型继承多个引用类型的属性和方法。每个构造函数都有一个原型对象，原型有一个属性指回构造函数，而实例有一个内部指针指向原型。如果原型是另一个类型的实例呢？那就意味着这个原型本身有一个内部指针指向另一个原型，相应地另一个原型也有一个指针指向另一个构造函数。这样就在实例和原型之间构成了一条原型链。
:::

### 简单实现

::: tip
``` js
function SuperType() {
  this.property = true
}

SuperType.prototype.getSuperValue = function() {
  return this.property
}
```
``` js
function SubType() {
  this.subproperty = false
}
// 继承
SubType.prototype = new SuperType()

SubType.prototype.getSubValue = function () {
  return this.subproperty
}
```
``` js
let instance = new SubType()
console.log(instance.getSuperValue()) // true
```
:::

### 原型链的问题

::: tip
  原型链虽然是实现继承的强大工具，但它也有问题。

* 原型中包含引用值的时候，会在所有实例间共享，这也是为什么属性通常会在构造函数中定义而不会定义在原型上的原因。
* 子类型在实例化时不能给父类型得构造函数传参。
:::

## 盗用构造函数

### 基本构思

::: tip
  为了解决原型包含引用值导致的继承问题，`盗用构造函数` 的技术在开发社区流行起来。基本思路很简单：在子类构造函数中调用父类构造函数。因为毕竟函数就是在特定上下文中执行代码的简单对象，所以可以使用 `apply()` 或 `call()` 方法以新创建的对象为上下文执行构造函数。
:::

### 简单实现

::: tip
``` js
function SuperType() {
  this.colors = ["red", "blue", "green"];
}
```
``` js
function SubType() {
  // 继承 SuperType
  SuperType.call(this);
}
```
``` js
let instance1 = new SubType();
instance1.colors.push("black");
console.log(instance1.colors); // "red,blue,green,black"
let instance2 = new SubType();
console.log(instance2.colors); // "red,blue,green"
```
:::

### 盗用构造函数的问题

::: tip
  盗用构造函数实现继承解决了原型链继承的两个问题，但它也有自己的问题。

* 必须在构造函数中定义方法，因此函数不能被重用。
* 子类不能访问父类原型上定义的方法。
:::

## 组合继承

### 基本构思

::: tip
  `组合继承` 综合了原型链和盗用构造函数，将两者的优点集中了起来。其基本的思路是使用原型链继承原型上的属性和方法，而通过盗用构造函数继承实例属性。这样既可以把方法定义在原型上以实现重用，又可以让每个实例都有自己的属性。
:::

### 简单实现

::: tip
``` js
function SuperType(name){
  this.name = name;
  this.colors = ["red", "blue", "green"];
}

SuperType.prototype.sayName = function() {
  console.log(this.name);
};
```
``` js
function SubType(name, age){
  // 继承属性
  SuperType.call(this, name);
  this.age = age;
}
// 继承方法
SubType.prototype = new SuperType();
SubType.prototype.sayAge = function() {
  console.log(this.age);
};
```
``` js
let instance1 = new SubType("Nicholas", 29);
instance1.colors.push("black");
console.log(instance1.colors); // "red,blue,green,black"
instance1.sayName(); // "Nicholas";
instance1.sayAge(); // 29
let instance2 = new SubType("Greg", 27);
console.log(instance2.colors); // "red,blue,green"
instance2.sayName(); // "Greg";
instance2.sayAge(); // 27
```
:::

### 总结

::: tip
  组合继承弥补了原型链和盗用构造函数的不足，是 `JavaScript` 中使用最多的继承模式。而且组合继承也保留了 `instanceof` 操作符和 `isPrototypeOf()` 方法识别合成对象的能力。
:::

## 原型式继承

### 基本构思

::: tip
  2006 年， Douglas Crockford 写了一篇文章：《JavaScript 中的原型式继承》（“Prototypal Inheritance in JavaScript”）。这篇文章介绍了一种不涉及严格意义上构造函数的继承方法。他的出发点是即使不自定义类型也可以通过原型实现对象之间的信息共享。
:::

### 简单实现

::: tip
``` js
function object(o) {
  function F() {}
  F.prototype = o;
  return new F();
}
```
  这个 object()函数会创建一个临时构造函数，将传入的对象赋值给这个构造函数的原型，然后返回这个临时类型的一个实例。本质上， object()是对传入的对象执行了一次浅复制。

``` js
let person = {
name: "Nicholas",
friends: ["Shelby", "Court", "Van"]
};
let anotherPerson = object(person);
anotherPerson.name = "Greg";
anotherPerson.friends.push("Rob");
let yetAnotherPerson = object(person);
yetAnotherPerson.name = "Linda";
yetAnotherPerson.friends.push("Barbie");
console.log(person.friends); // "Shelby,Court,Van,Rob,Barbie"
```
:::

### 总结

::: tip
  ECMAScript 5 通过增加 Object.create()方法将原型式继承的概念规范化了。这个方法接收两个参数：作为新对象原型的对象，以及给新对象定义额外属性的对象（第二个可选）。在只有一个参数时，Object.create()与这里的 object()方法效果相同。

  [回首页](/frontend)
:::

（完）
