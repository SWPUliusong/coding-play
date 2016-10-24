const Event = require("./event")

var e = new Event()

var listener1 = function(data) {
  console.log(data)
}

var listener2 = function(data) {
  console.log(data + 123)
}

e.on('a', listener1)
e.on('a', listener2)

e.emit('a', 123)
e.off('a', listener1)
e.emit('a', 123)