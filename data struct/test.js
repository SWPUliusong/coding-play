'use strict'

// /*列表*/
// var List = require('./list')

// var list = new List()

// list.append('liusong1')
// list.append('liusong2')
// list.append('liusong3')
// console.log(list.toString())

// list.remove('liusong2')
// console.log(list.toString())

// console.log(list.getElem())
// list.next()
// console.log(list.getElem())
// list.prev()
// console.log(list.getElem())
// list.position(3)
// console.log(list.getElem())


// /*栈*/
// var Stack = require("./stack")
// var stack = new Stack()

// stack.push(1)
// stack.push(2)
// stack.push(3)
// stack.push(4)
// console.log(stack.pop())
// console.log(stack.pop())
// console.log(stack.pop())
// console.log(stack.pop())
// console.log(stack.pop())
// console.log(stack.size)
// console.log(stack.data)

// function swift(num, base) {
//   var stack = new Stack();
//   var res = '';
//   do {
//     stack.push(num % base)
//     num = Math.floor(num / base)
//   } while (num > 0)

//   while(stack.size()) {
//     res += stack.pop()
//   }

//   return res
// }

// console.log(swift(16, 2))
// console.log(swift(255, 2))


/*队列*/
// const Queue = require("./queue")

// var q = new Queue()
// q.enqueue(1)
// q.enqueue(2)
// q.enqueue(3)
// q.enqueue(4)
// console.log(q.toString())
// console.log(q.front)
// console.log(q.end)
// console.log(q.isEmpty())
// console.log(q.length)

// // 约瑟夫环
// function joseph(queue, num) {
//   while (queue.size > 1) {
//     for (let i = 0; i < num - 1; i++) {         
//       queue.enqueue(queue.dequeue())
//     }
//     queue.dequeue()
//   }
//   return queue.dequeue()
// }

// var qq = new Queue([1,2,3,4,5,6,7,8,9])
// console.log(joseph(qq, 2))


/*链表*/
// const LList = require('./linkedList')

// var l = new LList()
// l.display()
// l.insert(1, 'head')
// l.insert(3, 1)
// l.insert(2, 3)
// l.insert(4, 2)
// l.display()
// l.remove(3)
// l.display()


// 集合
const Coll = require('./collection.js')
var s = new Coll()
s.add(1).add(2).add(3).add(4).add('1')
console.log(s.values)


//统计
// function count (str) {
//   var obj = Object.create(null)
//   str.split(' ').forEach(function(item) {
//     if (item in obj) {
//       obj[item]++
//     } else {
//       obj[item] = 1
//     }
//   })
//   return obj
// }

// console.log(count('the brown fox jumped over the blue fox'))

// const LoopLList = require("./loopLinkedList")

// var loopLL = new LoopLList()
// loopLL.insert(4, 'head')
// loopLL.insert(2, 4)
// loopLL.insert(3, 1)
// loopLL.remove(1)
// loopLL.display()

// function loop(n, m) {
//   if (n === 1) {
//     return 0
//   }

//   return (loop(n-1, m) + m) % n
// }

// console.log(loop(40, 3) + 1)

/*二叉搜索树*/
// const BST = require("./BST")

// var tree = new BST()

// tree.insert(10)
// tree.insert(30)
// tree.insert(22)
// tree.insert(54)
// tree.insert(12)
// tree.insert(24)

// console.log('中序遍历')
// tree.inOrder(tree.root, (val) => {
//   process.stdout.write(val.toString() + '\t')
// })
// console.log('\n前序遍历')
// tree.preOrder(tree.root, (val) => {
//   process.stdout.write(val.toString() + '\t')
// })
// console.log('\n后序遍历')
// tree.postOrder(tree.root, (val) => {
//   process.stdout.write(val.toString() + '\t')
// })
// console.log('\n最大值')
// console.log(tree.max())
// console.log('最小值')
// console.log(tree.min())


// 图
// const Graph = require('./graph')

// var g = new Graph(4)
// g.addEdge(1, 2)
//   .addEdge(1, 3)
//   .addEdge(2, 4)
//   .showGraph()

// console.log('\n')
// g.reset().dfs(2, (v) => {
//   process.stdout.write(v + '\t')
// })