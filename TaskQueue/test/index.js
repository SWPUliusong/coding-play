const TaskQueue = require("../")

let tq = new TaskQueue(2);

tq.push(() => {
    return new Promise(resolve => {
        setTimeout(() => {
            console.log(8)
            resolve()
        }, 800)
    })
})

tq.push(() => {
    return new Promise(resolve => {
        setTimeout(() => {
            console.log(9)
            resolve()
        }, 900)
    })
});


[7, 6, 5, 4, 3, 2, 1].forEach(num => {
    tq.push(() => {
        return new Promise(resolve => {
            setTimeout(() => {
                console.log(num)
                resolve()
            }, num * 100)
        })
    })
})
