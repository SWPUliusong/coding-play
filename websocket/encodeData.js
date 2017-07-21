module.exports = function(data) {
    let msg = []
    let buf = Buffer.from(data.PayloadData)
    let len = Buffer.byteLength(buf)

    msg.push(data.FIN << 7 + data.Opcode)
    
    // 服务器发送的消息不用掩码
    if (len < 126) {
        msg.push()
    }
}