(function(root){
  'use strict'
  // 兼容不支持bind方法的环境
  Function.prototype.bind = Function.prototype.bind || function(cxt) {
    let fn = this
    let arg1 = [].slice.call(arguments, 1)
    return function () {
      let arg2 = [].slice.call(arguments)
      return fn.apply(cxt, arg1.concat(arg2))
    }
  }


  function P(fn) {
    if (typeof fn !== 'function') {
      throw new Error('the arguments is not a function')
    }
    this.queue = []
    this.isPromise = true
    this.errorHandler = null
    fn.call(this, this.resolve.bind(this), this.reject.bind(this))
  }
  P.author = 'liusong'
  P.version = '0.0.1'
  
  P.prototype.resolve = function(data) {
    //只触发接下来第一个控制器
    var handler = this.queue.shift()
    if (handler && handler.success) {
      let next = handler.success(data)
      if (next && next.isPromise) {
        let self = this
        //任务队列转交
        next.queue = self.queue
        next.errorHandler = self.errorHandler
        self = next
        return 
      }
    }
  }

  P.prototype.reject = function(error) {
    //如果catch监听则放弃执行then方法的第二个参数
    if (this.errorHandler) {
      this.errorHandler(error)
      return
    }

    //只触发接下来第一个控制器
    var handler = this.queue.shift()
    if (handler && handler.error) {
      let next = handler.error(data)
      if (next && next.isPromise) {
        let self = this
        next.queue = self.queue
        self = next
        return 
      }
    }
  }

  P.prototype.then = function(resolve, reject) {
    if (typeof resolve !== 'function') {
      throw new Error('the arguments is not a function')
    }
    var handler = {}

    handler.success = resolve

    if (typeof reject === 'function') {
      handler.error = reject
    }

    this.queue.push(handler)

    return this
  }

  P.prototype.catch = function(reject) {
    if (typeof reject !== 'function') {
      throw new Error('the arguments is not a function')
    }
    this.errorHandler = reject
    return
  }

  if (typeof global === 'object') {
    module.exports = P
  }
  else {
    root.P = P
  }
})(this)