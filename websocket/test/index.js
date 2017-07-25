const http = require("http")
const fs = require("fs")
let { resolve } = require("path")
let Ws = require("../")

let server = http.createServer(function (req, res) {
    if (req.url === '/test') {
        res.writeHead(200, { 'content-type': 'text/html' })
        fs.createReadStream(resolve(__dirname, './test.html')).pipe(res)
    } else {
        res.end(Buffer.from('啥也没有'))
    }
})
server.listen(3000, () => console.log('listening on 3000'))

let wsServer = new Ws({
    port: 5000,
    path: '/websocket',
    maxConnections: 2
})

wsServer.on('connection', socket => {
    console.log('connection')

    socket.on('message', data => {
        console.log(data)
    })
})
