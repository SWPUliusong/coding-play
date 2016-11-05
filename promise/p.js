;(function(root){
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

  // 直接转交成功数据
  P.resolve = function(data) {
    return new P(function(resolve, reject) {
      // 延时等待任务队列转交
      setTimeout(function() {
        resolve(data)
      }, 0)
    })
  }

  // 直接转交失败原因
  P.reject = function(data) {
    return new P(function(resolve, reject) {
      setTimeout(function() {
        reject(data)
      }, 0)
    })
  }

  // 批处理
  P.all = function(arr) {
    // 如果全部都不是Promise,则直接当成数据转交给handler
    if (!arr.some(p => p.isPromise)) {
      return P.resolve(arr)
    }

    return new P(function(resolve, reject) {
      setTimeout(function() {
        if (!(arr instanceof Array)) {
          return reject('P.all need a Array')
        }

        let res = [],   // 存储结果
          pending = 0;  // 记录状态

        arr.forEach((p, i) => {
          if (p.isPromise) {
            pending++   // 注册异步任务时 +1
            p.then((data) => {
              pending--   // 完成异步任务时 -1
              res[i] = data
              if (pending === 0) {  // 为0时，全部完成
                resolve(res)
              }
            })
          } else {
            // 不是Promise则直接当成数据
            res[i] = p
          }
        })
      }, 0)
    })   
  }
  
  // 成功态
  P.prototype.resolve = function(data) {
    //只触发接下来第一个控制器
    var handler = this.queue.shift()
    if (handler && handler.success) {
      let next = handler.success(data)
      if (next && next.isPromise) {
        //任务队列转交
        next.queue = this.queue
        next.errorHandler = this.errorHandler
        return 
      }
    }
  }

  // 失败态
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
        next.queue = this.queue
        return 
      }
    }
  }

  P.prototype.then = function(resolve, reject) {
    if (typeof resolve !== 'function') {
      throw new Error('the resolve is not a function')
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
      throw new Error('the reject is not a function')
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
