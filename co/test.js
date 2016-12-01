'use strict'

const exec = require("./exec")
const assert = require("assert")

let t = assert.strictEqual.bind(assert)

let p1 = new Promise(function(resolve, reject) {
  setTimeout(() => {
    resolve(123)
  }, 1000)
})

let p2 = new Promise(function(resolve, reject) {
  setTimeout(() => {
    reject(456)
  }, 1000)
})

exec(function* (){
  try {
    let a = yield 123
    t(a, 123, 'i !== 123')

    let b = yield p1
    t(b, 123, 'b !== 123')

    let c = yield [p1, p1]
    assert.deepEqual(c, [123, 123], 'c !== [123, 123]')

    yield p2
  } catch (e) {
    console.log(e)
  }
})

console.log('start')