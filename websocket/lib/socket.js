const { createHash } = require("crypto")
const { Readable } = require("stream")
const decodeData = require("./decodeData")
const encodeData = require("./encodeData")
// 加密Sec-WebSocket-Key的固定字符串
let mask = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'

function handshake(key) {
    // 生成加密串
    key = createHash('sha1').update(key + mask).digest('base64')

    // 握手
    this.write("HTTP/1.1 101 Switching Protocals\r\n")
    this.write("Upgrade: WebSocket\r\n")
    this.write("Connection: Upgrade\r\n")
    this.write(`Sec-WebSocket-Accept: ${key}\r\n`)
    this.write("\r\n")

    return this
}

function send(data) {
    // 当data是一个流
    if (data instanceof Readable) {
        let first = true
        let flag = true
        data.on('data', chunk => {
            if (first) {
                first = false
                flag = this.write(encodeData({
                    FIN: 0, Opcode: 2, PayloadData: chunk
                }));
            } else {
                flag = this.write(encodeData({
                    FIN: 0, Opcode: 0, PayloadData: chunk
                }));
            }

            if (!flag) data.pause()
        })

        data.on('drain', () => {
            data.resume()
        })

        data.on('end', () => {
            this.write(encodeData({
                FIN: 1, Opcode: 0, PayloadData: Buffer.from('')
            }));
        })
    } else {
        let buf = Buffer.from(JSON.stringify(data))
        let len = Bufffer.byteLength(buf)
        if (this.limit >= len) {
            this.write(encodeData({
                FIN: 1, Opcode: 1, PayloadData: buf
            }));
        } else {
            let i = this.limit
            this.write(encodeData({
                FIN: 0, Opcode: 1, PayloadData: buf.slice(0, i)
            }));
            while (i + this.limit < len) {
                this.write(encodeData({
                    FIN: 0, Opcode: 0, PayloadData: buf.slice(i, i + this.limit)
                }));
                i += this.limit
            }
            this.write(encodeData({
                FIN: 1, Opcode: 0, PayloadData: buf.slice(i, len)
            }));
        }
    }
}

function ping(data = '') {
    let buf = Buffer.from(JSON.stringify(data))
    this.write(encodeData({
        FIN: 1, Opcode: 9, PayloadData: buf
    }));
}

function close(code, reason = '') {
    if (code instanceof String) {
        reason = code
        code = 1000
    }

    let buf = Buffer.from('\0\0' + reason)
    buf.writeUInt16BE(code, 0)
    this.write(encodeData({
        FIN: 1, Opcode: 8, PayloadData: buf
    }));
}

module.exports = {
    handshake,
    send,
    ping,
    close
}