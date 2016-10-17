'use strict'

function LList() {
  // 节点对象
  function Node(elem) {
    this.element = elem;
    this.next = null;
  }

  this.head = new Node('head')
  this.find = find
  this.insert = insert
  this.findPrev = findPrev
  this.remove = remove
  this.display = display
}

function find(item) {
  var currNode = this.head
  while (currNode.element != item && currNode.next !== null) {
    currNode = currNode.next
  }
  return currNode
}

function insert(elem, item) {
  var currNode = this.find(item)
  var newNode = new Node(elem)
  newNode.next = currNode.next
  currNode.next = newNode
}

function display() {
  var currNode = this.head
  while (currNode.next != null) {
    console.log(currNode.next.element)
    currNode = currNode.next
  } 
}

function findPrev(item) {
  var currNode = this.head
  while (currNode.next !== null && currNode.next.element != item) {
    currNode = currNode.next
  }
  return currNode
}

function remove(item) {
  var prev = this.findPrev(item)
  if (prev.next !== null) {
    prev.next = prev.next.next
  }
}

module.exports = LList