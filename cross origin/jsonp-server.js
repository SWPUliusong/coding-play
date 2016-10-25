'use strict'

const http = require("http")
const url = require("url")
const fs = require("fs")

let server = http.createServer(function(req, res) {
  let cb = url.parse(req.url, true).query.callback
  let data = fs.readFileSync(__dirname + '/data.json')
  if (cb) {
    res.writeHead(200, {'Content-Type': 'text/javascript'})
    res.end(cb + '(' + data + ')')
  }
})

server.on('error', function(err) {
  console.log(err)
})

server.listen(3000, function() {
  console.log('listening at port 3000')
})