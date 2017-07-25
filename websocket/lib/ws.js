const net = require("net")
const { EventEmitter } = require('events')
let addon = require('./socket')
let decodeData = require("./decodeData")

// 连接总数
let _connections = 0

let server = net.createServer()

class Ws extends EventEmitter {
    constructor(opt) {
        super()
        this.sockets = {}
        this._server = server

        let _maxConnections = opt.maxConnections || 0
        let _path = opt.path || '/'

        this._server.listen(opt.port || 5000)

        this._server.on('connection', socket => {
            let key
            Object.assign(socket, addon, {
                limit: opt.limit
            })
            socket.on('data', data => {
                let path = data.toString().split('\r\n')[0].split(' ')[1]
                if (path !== _path) return

                // 浏览器发起连接请求
                if (!key) {
                    key = data.toString().match(/Sec-WebSocket-Key: (.+)/)[1]

                    // 设置了上限则进行连接限制
                    let flag = !!_maxConnections
                    if (flag && this.getConnections() === _maxConnections) {
                        return socket.end(wrapHttpMsg('连接超过上限'))
                    }

                    // 握手
                    socket.handshake(key)
                    
                    socket.id = key
                    this.sockets[key] = socket
                    _connections++
                    
                    this.emit('connection', socket, this.sockets)
                } else {
                    socket.emit('message', decodeData(data).PayloadData)
                }
            })

            socket.on('close', () => {
                if (socket.id && this.sockets[socket.id]) {
                    _connections--
                    delete this.sockets[socket.id]
                }
            })
        })

        this._server.on('error', err => this.emit('error', err))
    }

    getConnections() {
        return _connections
    }

    broadcast(data) {
        for (let id of Object.keys(this.sockets)) {
            this.sockets[id].send(data)
        }
        return this
    }
}


function wrapHttpMsg(msg) {
    return `HTTP/1.1 403 Forbidden\r\n
            Server: nodejs\r\n
            \r\n
            ${JSON.stringify(msg)}`
}

module.exports = Ws