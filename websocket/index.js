const net = require("net")
const crypto = require("crypto")

let decodeData = require("./decodeData")
let encodeData = require("./encodeData")

// 加密Sec-WebSocket-Key的固定字符串
let mask = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'

let server = net.createServer(socket => {
	let key
	socket.on('data', data => {
		if (!key) {
			key = data.toString().match(/Sec-WebSocket-Key: (.+)/)[1]
			key = crypto.createHash('sha1').update(key + mask).digest('base64')

			socket.write("HTTP/1.1 101 Switching Protocals\r\n")
			socket.write("Upgrade: WebSocket\r\n")
			socket.write("Connection: Upgrade\r\n")
			socket.write(`Sec-WebSocket-Accept: ${key}\r\n`)
			socket.write("\r\n")

			// 握手成功发送数据
			socket.write(encodeData({
				FIN: 1,
				Opcode: 1,
				PayloadData: 'hello, 世界'
			}))

			// 分片传输数据
			socket.write(encodeData({
				FIN: 0, Opcode: 1, PayloadData: "ABC"
			}));
			socket.write(encodeData({
				FIN: 0, Opcode: 0, PayloadData: "-DEF-"
			}));
			setTimeout(() => {
				socket.write(encodeData({
					FIN: 1, Opcode: 0, PayloadData: "GHI"
				}));
			}, 500)
		} else {
			// 数据处理
			onmessage(socket, data)
		}
	})
}).listen(5000, () => {
	console.log('listening at 127.0.0.1:5000')
})

function onmessage(socket, data) {
	data = decodeData(data)
	console.log(`${socket.remoteAddress} 发来消息：`)
	console.log(data)
}