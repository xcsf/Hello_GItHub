## Vue响应式原理  Reactivity System

### 1.介绍

​    根据尤雨溪在FrontEnd Master上面的一个WorkShop，通过讲解一些基础来更好的理解Vue。自己对着[这个仓库里的练习](https://github.com/heruifeng1/Vue-WorkShop-Basic)和搜索引擎大法完成。

### 2.Reactivity System

​    响应式指的就是当我们改变了某个状态时候，会自动的更新系统中的相关连的变化。这里我们通常指改变状态后怎么变更DOM。Vue是怎么跟踪变化，做到响应式的。

### 3.页面开发中的同步问题

```javascript
//页面可以自动同步state
//一个state的追踪函数 onStateChanged()
//当state改变时更新页面
onStateChanged(() => {
  view = render(state)
})
//它内部大概是实现
let update, state
const onStateChanged = _update => {
  update = _update
}
//接受一个newState,更新oldState，然后调用update()
//React中每次去setState就好
const setState = newState => {
  state = newState
  update()
}
setState({ a: 5 })

//Vue or Angular 直接访问state.a
state.a = 5
//Ang使用的是脏检查，而Vue中每一个state变得reactive（使用object.defineProperty）

```

​	我们也要实现一个类似onStateChanged()这样的函数。我们下面把这个函数改名为autorun()，我们传入一个update()函数给这个autorun()，它则自动去更新视图。在Vue中则是直接改变state.a，就会自动触发更新DOM。

### 4.Vue-WorkShop-Basic 

#### 	1-1  [Getters and Setters](<https://github.com/heruifeng1/Vue-WorkShop-Basic/blob/master/1-reactivity/1.1.md>)

 	> expected usage:
 	>
 	>```javascript
 	>function observe (obj) {
 	>  // Implement this!
 	>}
 	>
 	>const obj = { foo: 123 }
 	>observe(obj)
 	>
 	>obj.foo // should log: 'getting key "foo": 123'
 	>obj.foo = 234 // should log: 'setting key "foo" to 234'
 	>obj.foo // should log: 'getting key "foo": 234'
 	>```

​	答案：

​		这个函数目的就是，使传入的state对象的读写都会被监测到。

```javascript
function observe(obj){
  Object.keys(obj).forEach((key)=>{
    let temp = obj[key]
    Object.defineProperty(obj,key,{
      get:function(){
        console.log('get count is :', temp)
        return temp;
      },
      set:function(newvalue){
        temp = newvalue;
        console.log('set count is: ',temp)
      }
    })
  })
}
```

#### 	1-2 [Dependency Tracking](<https://github.com/heruifeng1/Vue-WorkShop-Basic/blob/master/1-reactivity/1.2.md>)

​	实现一个Dep类，里面有`depend` 与`notify`两个方法。

​	实现autorun()。接受update()函数。

​	update()函数中可以调用dep.depend()，来显式的添加依赖到dep对象

​	然后，可以调用dep.notify()来再次运行

	> The full usage should look like this:
	>
	> ```javascript
	> const dep = new Dep()
	> 
	> autorun(() => {
	>   dep.depend()
	>   console.log('updated')
	> })
	> // should log: "updated"
	> 
	> dep.notify()
	> // should log: "updated"
	> ```

​	分析下：

​	这个dep类里实现发布订阅模式。

​	update()需要被注册到dep对象中，这样dep.notify()就可以调用里面的注册了的函数

​	dep.depend()目的是将需要执行的update()函数注册到dep对象中。

​	autorun()，负责调用这个update()函数，比如更新视图

​	答案：

```javascript
window.Dep = class Dep {
  constructor(){
    this.subscribers = new Set()
  }
  depend(){
    if(activeUpdate){
      this.subscribers.add(activeUpdate)
    }
    console.log('is depended')
  }
  notify(){
    this.subscribers.forEach((subscriber)=>{subscriber()})
  }
}
let activeUpdate;
function autorun (update) {
  //这里使用一个WrappedUpdate包裹住update，运行时update中调用的depend可以
  //拿到activeUpdate，而且这样做我们可以知道当前正在执行的是哪一个update()
  function WrappedUpdate() {
    activeUpdate = WrappedUpdate
    update()
    activeUpdate = null
  }
  WrappedUpdate()
}
```

#### 	1-3 [Mini Observer](<https://github.com/heruifeng1/Vue-WorkShop-Basic/blob/master/1-reactivity/1.3.md>)

​	observe()接收对象中的属性并使其具有响应式。对于每个转换后的属性，它都被分配一个Dep实例，Dep实例跟踪订阅更新函数的列表，并在调用其setter时触发它们重新运行。

​	autorun()接受一个更新函数，并在更新函数订阅的属性发生变化时重新运行它。如果更新函数在计算期间依赖于某个属性，则该函数被称为“订阅”该属性。

> They should support the following usage:
>
> ```javascript
> const state = {
>   count: 0
> }
> 
> observe(state)
> 
> autorun(() => {
>   console.log(state.count)
> })
> // should immediately log "count is: 0"
> 
> state.count++
> // should log "count is: 1"
> ```

答案：

​	也就是吧之前的结合起来，具体看codepen↓

​	[在线(codepen)](<https://codepen.io/xcsf/pen/gJdRoK?editors=0011>)

