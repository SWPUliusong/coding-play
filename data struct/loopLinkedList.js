'use strict'

function Node(elem) {
  this.element = elem;
  this.next = null;
}

function LoopLList() {
  this.head = new Node('head')
  this.head.next = this.head
  this.find = find
  this.insert = insert
  this.findPrev = findPrev
  this.remove = remove
  this.display = display
}

function find(item) {
  var currNode = this.head
  while (currNode.element != item && currNode.next != this.head) {
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
  while (currNode.next != this.head) {
    console.log(currNode.next.element)
    currNode = currNode.next
  } 
}

function findPrev(item) {
  var currNode = this.head
  while (currNode.next !== this.head && currNode.next.element != item) {
    currNode = currNode.next
  }
  return currNode
}

function remove(item) {
  var prev = this.findPrev(item)
  if (prev.next !== this.head) {
    prev.next = prev.next.next
  }
}

module.exports = LoopLList