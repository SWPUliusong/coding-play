module.exports = function(buffer) {
	let i = 0
	let res = {
		FIN: buffer[i] >> 7,
		Opcode: buffer[i++] & 15,
		Mask: buffer[i] >> 7,
		PayloadLen: buffer[i++] & 0x7F
	}

	// 当PayloadLen等于126/127
	if (res.PayloadLen === 126) {
		// 此时接下来的两个字节才是PayloadLen
		res.PayloadLen = buffer[i++] << 8 + buffer[i++]
	} else if (res.PayloadLen === 127) {
		// 否则接下来的8个字节
		res.PayloadLen = buffer[i++] << 56 + buffer[i++] << 48 +
						buffer[i++] << 40 + buffer[i++] << 32 +
						buffer[i++] << 24 + buffer[i++] << 16 +
						buffer[i++] << 8 + buffer[i++]
	}

	// 是否使用掩码
	let msg = []
	if (res.Mask) {
		res.MaskKey = [buffer[i++], buffer[i++], buffer[i++], buffer[i++]]
		// MaskKey轮流与PayloadData异或
		for (let j = 0; j < res.PayloadLen; j++) {
			msg.push(buffer[i++] ^ res.MaskKey[j%4])
		}
	} else {
		msg = buffer.slice(i, i + res.PayloadLen)
	}

	msg = Buffer.from(msg)
	// Opcode表示数据类型
	// 0x0 表示这是一个继续帧（continuation frame）
	// 0x1 表示这是一个文本帧 （text frame）
	// 0x2 表示这是一个二进制帧 （binary frame）
	// 0x3-7 为将来的非控制帧（non-control frame）而保留的
	// 0x8 表示这是一个连接关闭帧 （connection close）
	// 0x9 表示这是一个 ping 帧
	// 0xA 表示这是一个 pong 帧
	// 0xB-F 为将来的控制帧（control frame）而保留的
	if (res.Opcode === 1) {
		msg = msg.toString()
	}

	res.PayloadData = msg

	return res
}