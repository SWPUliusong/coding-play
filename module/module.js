'use strict';

(function() {
  let module_self = (function(){
    let modules = {}
    function define(name, dep, fn) {
      if (modules[name]) {
        throw new Error('the module is exist')
      }


      let arg = [];
      // 无依赖模块
      (dep instanceof Function) && (fn = dep);
      // 只接受依赖模块数组
      (dep instanceof Array) && dep.forEach((m, i) => {
        modules[m] && (arg[i] = modules[m]);
      })

      modules[name] = fn.apply(null, arg)
    }

    function require(name) {
      return modules[name]
    }

    return {
      define: define,
      require: require
    }
  })()

  if (typeof global === 'object') {
    module.exports = module_self
  }
  else if (typeof window === 'object') {
    window.module = module_self
  }
})()