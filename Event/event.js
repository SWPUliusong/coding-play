;(function(){

  'use strict';

  function Event() {
    this.map = {};  //存放事件和监听器的映射关系
  };

  // 触发监听器
  Event.prototype.emit = function(eName) {
    let arg = [].slice.call(arguments, 1)
    this.map[eName] && this.map[eName].forEach((fn) => {
      fn.apply(null, arg)
    })
  };

  // 绑定监听器
  Event.prototype.on = function(eName, fn) {
    if (typeof fn !== 'function') {
      throw new Error(fn + ' is not a function')
    }
    let listener = this.map[eName];
    if (listener) {
      listener.push(fn);
    } else {
      this.map[eName] = [fn]
    }

  };

  // 解绑监听器
  Event.prototype.off = function(eName, fnName) {
    if (!eName) throw new Error('event name is required')
    
    let list = this.map[eName];

    if (list) {
      if (fnName) {
        this.map[eName] = list.filter((listener) => listener !== fnName)
      }
      else {
        delete this.map[eName]
      }
    }
  };

  if (typeof global === 'object') {
    module.exports = Event
  }
  else if (typeof window === 'object') {
    window.Event = Event
  }
})()

