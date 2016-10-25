;(function() {
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

  // 函数劫持器
  function kidnap(cxt, oldFn, newFn) {
    // 连同执行上下文一起保留原函数
    let origin = cxt[oldFn].bind(cxt);
    cxt[oldFn] = newFn.bind(cxt, origin);
  }

  // 函数装饰器
  Function.prototype.decoration = function(fn, cxt) {
    let self = this
    cxt || (cxt = null)
    return function() {
      let arg = [].slice.call(arguments)
      // 将原函数绑定到指定的执行上下文
      arg.unshift(self.bind(cxt))
      // 新函数的也在指定的执行上下文中执行
      return fn.apply(cxt, arg)
    }
  }

  if (typeof global === 'object') {
    module.exports = kidnap
  }
  else if (typeof window === 'object') {
    window.kidnap = kidnap
  }

})()