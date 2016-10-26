'use strict'

const P = require("./p")
const assert = require("assert")

let deep = assert.deepEqual.bind(assert)

function test1() {
  return new P(function(resolve, reject) {
    setTimeout(function() {
      resolve(100)
    }, 1000)
  })
}

P.all([test1(), 236, test1()])
.then(function(data) {
  deep(data, [100, 236, 100], data + '!= [100, 236, 100]')
  return test1()
})
.then(function(data) {
  deep(data, 100, data + '!= 100')
  return P.resolve(200)
})
.then(function(data) {
  deep(data, 200, data + '!= 200')
  return P.reject(500)
})
.catch(function(err) {
  deep(err, 500, err + '!= 500')
})

console.log(P.author)