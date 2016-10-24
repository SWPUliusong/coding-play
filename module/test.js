const assert = require("assert")
const modules = require("./module")

modules.define('a', ['a'], function() {
  return 1
})

modules.define('b', ['a'], function(a) {
  return a + 1
})

assert.strictEqual(modules.require('a'), 1, '1: ' + modules.require('a'))
assert.strictEqual(modules.require('b'), 2, '2: ' + modules.require('b'))