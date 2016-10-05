'use strict'

function Queue() {
  this.data = [];
  this.enqueue = enqueue;
  this.dequeue = dequeue;
  this.toString = toString;
  this.isEmpty = isEmpty;
  this.front = front;
  this.end = end;
}

function enqueue(elem) {
  this.data.push(elem);
}

function dequeue() {
  return this.data.shift();
}

function toString() {
  let res = '';
  for (let i = 0; i < this.data.length; i++) {
    res += this.data[i] + '\n';
  }
  return res
}

function isEmpty() {
  return this.data.length > 0 ? true : false;
}

function front() {
  return this.data[0]
}

function end() {
  var len = this.data.length
  return this.data[len - 1]
}

module.exports = Queue