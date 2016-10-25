'use strict'

const assert = require("assert")
const kidnap = require("./kidnap")

let deep = assert.deepEqual.bind(assert)

let test = {
  tag: 'test',
  a: function(data) {
    return data
  },
  b: function(data) {
    return data + 1
  }
}

kidnap(test, 'a', function(origin, data) {
  return data * 2
})

let a = test.b.decoration(function(origin, data) {
  return data * 2
})

let b = test.b.decoration(function(origin, data) {
  return this.tag
}, test)

deep(test.a(123), 246, test.a(123) + '!== 246')
deep(a(123), 246, a(123) + '!== 246')
deep(b(123), 'test', b(123) + '!== test')