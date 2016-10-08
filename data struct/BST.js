'use strict'

function Node(data, left, right) {
  this.data = data
  this.right = right
  this.left = left
  this.show = function() {
    return this.data
  }
}

// 二叉搜索树
function BST() {
  this.root = null
  this.insert = insert
  this.inOrder = inOrder
  this.preOrder = preOrder
  this.postOrder = postOrder
  this.max = max
  this.min = min
}

// 插入叶子
function insert(data) {
  var n = new Node(data, null, null)
  if (this.root === null) {
    this.root = n
    return 
  }

  let currNode = this.root
  let parent
  while (true) {
    parent = currNode
    if (data < currNode.data) {
      currNode = currNode.left
      if (currNode === null) {
        parent.left = n
        break
      }
    } else {
      currNode = currNode.right
      if (currNode === null) {
        parent.right = n
        break
      }
    }
  }

}

// 中序遍历
function inOrder(node, cb) {
  if (node !== null) {
    inOrder(node.left, cb)
    cb(node.data)
    inOrder(node.right, cb)
  }
}

// 前序遍历
function preOrder(node, cb) {
  if (node !== null) {
    cb(node.data)
    inOrder(node.left, cb)
    inOrder(node.right, cb)
  }
}

// 后序遍历
function postOrder(node, cb) {
  if (node !== null) {
    inOrder(node.left, cb)
    inOrder(node.right, cb)
    cb(node.data)
  }
}

//最大值
function max() {
  var currNode = this.root
  while (currNode.right !== null) {
    currNode = currNode.right
  }
  return currNode.data
}

//最小值
function min() {
  var currNode = this.root
  while (currNode.left !== null) {
    currNode = currNode.left
  }
  return currNode.data
}

module.exports = BST