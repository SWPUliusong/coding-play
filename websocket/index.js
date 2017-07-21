const net = require("net")
const crypto = require("crypto")

let decodeData = require("./decodeData")

// 加密Sec-WebSocket-Key的固定字符串
let mask = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'

net.createServer(socket => {
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
		} else {
			// 数据处理
			onmessage(data)
		}
	})
}).listen(5000, () => {
	console.log('listening at 127.0.0.1:5000')
})

function onmessage(data) {
	data = decodeData(data)
	console.log(data)
}