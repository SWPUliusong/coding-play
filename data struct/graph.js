'use strict'

function Graph(v) {
  this.vertices = v  //顶点数
  this.edges = 0  //边数
  this.adj = []   //存储顶点
  this.mark = []  //标记该点是否被访问
}

Graph.prototype = {
  // 添加边
  addEdge(v, w) {
    // 存储与此顶点相连的顶点
    this.adj[v] = this.adj[v] || []
    this.adj[w] = this.adj[w] || []
    this.adj[v].push(w)
    this.adj[w].push(v)
    this.edges++
    return this
  },
  // 展示图
  showGraph() {
    console.log('Graph: ')
    var len = this.adj.length
    for (let i = 0; i < len; i++) {
      if (!this.adj[i]) continue
      console.log(i + ' -> ' + this.adj[i])
    }
    return this
  },
  // 深度优先搜索
  dfs(v, cb) {
    if (this.adj[v] === undefined) {
      throw new Error('the vertice isn\'t exist') 
    }

    this.mark[v] = true
    cb(v)
    for (let i = 0; i < this.adj[v].length; i++) {
      let w = this.adj[v][i]
      if (!this.mark[w]) {
        this.dfs(w, cb)
      }
    }
  },
  // 广度优先搜索
  // bfs(v, cb) {
    
  // },
  // 重置访问标记
  reset() {
    let len = this.adj.length
    for (let i = 0; i < len; i++) {
      if (this.adj[i] === undefined) continue
      this.mark[i] = false
    }
    return this
  }
}

module.exports = Graph