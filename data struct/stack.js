function Stack() {
  this.data = [];
  this.top = 0;
}

Stack.prototype.push = function(elem) {
  this.data[this.top++] = elem
}

Stack.prototype.pop = function() {
  return this.top > 0 ? this.data[--this.top] : undefined;
}

Stack.prototype.peek = function() {
  return this.data[this.top - 1]
}

Stack.prototype.size = function() {
  return this.top
}

Stack.prototype.clear = function() {
  this.top = 0;
}

module.exports = Stack