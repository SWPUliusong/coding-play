class TaskQueue {
    constructor(max = 1) {
        // 最大并发个数
        this.max = max
        // 任务队列[fn...]; fn(): promise
        this.queue = []
        // 当前并发数
        this.count = 0
    }
    
    // fn: 一个返回promise的函数
    push(fn) {
        this.queue.push(fn)
        exec.call(this)
    }
}

function exec() {
    let num = this.max - this.count
    // num===0则已达到最大并发数
    while (num--) {
        let fn = this.queue.shift()
        // 队列已空
        if (!fn) break
        this.count++
        fn().then(() => {
            this.count--
            exec.call(this)
        }).catch(err => {
            this.count--
            console.error(err)
        })
    }
}

module.exports = TaskQueue