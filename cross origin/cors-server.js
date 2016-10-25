'use strict'

const http = require("http")
const fs = require("fs")

let server = http.createServer(function(req, res) {
  res.writeHead(200, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': '*',
  })
  fs.createReadStream(__dirname + '/data.json').pipe(res)
})

server.on('error', function(err) {
  console.log(err)
})

server.listen(3000, function() {
  console.log('listening at port 3000')
})