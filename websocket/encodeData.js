module.exports = function (data) {
    let msg = []
    let buf = Buffer.from(data.PayloadData)
    let len = Buffer.byteLength(buf)

    msg.push((data.FIN << 7) + data.Opcode)

    // 服务器发送的消息不用掩码
    if (len < 126) {
        msg.push(len)
    } else if (len < 0x10000) {
        // 0xffff表示两个字节，即此时PayloadLen==126
        msg.push(126, len >> 8, len & 0xFF)
    } else {
        // 此时PayloadLen==127，8个字节表示真实PayloadLen
        // 前四个字节为长整形预留，一般是留空，不用
        // msg.push(127, 0, 0, 0, 0, ...)
        msg.push(
            127,
            len >> 56,
            len >> 48 & 0xFF,
            len >> 36 & 0xFF,
            len >> 24 & 0xFF,
            len >> 16 & 0xFF,
            len >> 8 & 0xFF,
        )
    }

    msg = Buffer.from(msg)

    return Buffer.concat([msg, buf])
}