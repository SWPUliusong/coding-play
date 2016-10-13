'use strict'

function Queue(arr) {
  this.data = (arr instanceof Array) ? arr : [];
}

Queue.prototype = {
  enqueue(elem) {
    this.data.push(elem);
  },
  dequeue() {
    return this.data.shift();
  },
  toString() {
    return this.data
  },
  isEmpty() {
    return this.data.length === 0;
  },
  clear() {
    this.data = []
  },
  get length() {
    return this.data.length
  }, 
  get front() {
    return this.data[0]
  },
  get end() {
    var len = this.data.length
    return this.data[len - 1]
  }
}


module.exports = Queue