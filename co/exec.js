'use strict'

function exec(gen) {
  // 执行生成遍历器
  let origin = gen()
  //递归执行yield
  function next(val) {
    let p = origin.next(val)
    if (!p.done) {
      switch (p.value.constructor) {
        case Promise:
          p.value.then(data => {
            next(data)
          }).catch(err => {
            origin.throw(err)
          })
          break;
        case Array:
          Promise.all(p.value).then(data => {
            next(data)
          }).catch(err => {
            origin.throw(err)
          })
          break;
        default:
          next(p.value)
      }
    }
  }

  next()
}

module.exports = exec