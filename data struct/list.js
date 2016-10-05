function List() {
  this.listSize = 0;  //元素个数
  this.pos = 0;  //列表当前位置
  this.dataStore = [];  //存储列表元素
}

//添加元素
List.prototype.append = function(elem) {
  this.dataStore[this.listSize++] = elem
}

//查找某元素
List.prototype.find = function(elem) {
  var len = this.listSize;
  for (var i = 0; i < len; i++) {
    if (this.dataStore[i] === elem) {
      return i;
    }
  }
  return -1;
}

//删除某元素
List.prototype.remove = function(elem) {
  var index = this.find(elem)
  if (index > -1) {
    this.dataStore.splice(index, 1);
    this.listSize--;
    return true;
  }
  return false;
}

//输出所有元素
List.prototype.toString = function() {
  return this.dataStore.toString();
}

//插入元素
List.prototype.insert = function(elem, after) {
  var insertPos = this.find(after)
  if (insertPos > -1) {
    this.listSize++;
    this.dataStore.splice(insertPos + 1, 0, elem)
    return true
  }
  return false
}

//判断是否在列表中
List.prototype.contains = function(elem) {
  var len = this.listSize;
  for (var i = 0; i < len; i++) {
    if (this.dataStore[i] === elem) {
      return true;
    }
  }
  return false;
}

//清空列表
List.prototype.clear = function() {
  delete this.dataStore;
  this.listSize = this.pos = 0;
  this.dataStore = [];
}

List.prototype.front = function() {
  this.pos = 0;
}
List.prototype.end = function() {
  this.pos = this.listSize - 1;
}
List.prototype.prev = function() {
  if (this.pos > 0) {
    this.pos--;
  }
}
List.prototype.next = function() {
  if (this.pos < this.listSize - 1) {
    this.pos++;
  }
}
List.prototype.position = function(pos) {
  if (pos < this.listSize && pos >= 0) {
    this.pos = pos;
  }
}
List.prototype.currPos = function() {
  return this.pos;
}
List.prototype.getElem = function() {
  return this.dataStore[this.pos]
}

module.exports = List
