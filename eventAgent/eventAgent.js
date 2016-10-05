(function() {
  'use strict'
  HTMLElement.prototype.on = function(eName, target, handler) {
    if (typeof target === 'function') {
      handler = target
      target = this.nodeName.toLowerCase()
    }

    if (this.addEventListener) {
      this.addEventListener(eName, function(e) {
        let aim = match(this, target, e.target)
        aim && handler.call(aim, e)
      }, false)
    } else {
      eName = 'on' + eName
      this.attachEvent(eName, function(e) {
        let aim = match(this, target, e.srcElement)
        aim && handler.call(aim, e)
      })
    }
  }

  //元素节点匹配
  function match(root, tar, emiter) {
    if (emiter.querySelector(tar)) {
      return
    }

    while (emiter.nodeName.toLowerCase() !== tar && emiter !== root) {
      emiter = emiter.parentNode
    }

    return emiter
  }
})()