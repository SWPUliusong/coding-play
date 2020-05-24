const Marks = {
  drawRect: "DrawRect",
  dragRect: "DragRect",
}

/**
 * 绑定划框的action
 * @param {HTMLElement} elem canvas元素
 * @param {Funtion} handler 控制器
 */
function addDrawRectEvent(elem, handler) {
  let mark = "DrawRect"
  let isMouseDown = false
  let startX, startY

  function mousedownHandler(e) {
    // 对比标记，防止其他mousedown事件触发控制器
    if (mark === Marks.drawRect) {
      isMouseDown = true
      startX = e.offsetX
      startY = e.offsetY
    }
  }

  function mousemoveHandler(e) {
    // 对比标记，防止其他mousedown事件触发控制器
    if (mark === Marks.drawRect && isMouseDown) {
      let endX = e.offsetX
      let endY = e.offsetY
      handler(startX, startY, endX, endY)
    }
  }

  elem.addEventListener("mousedown", mousedownHandler)

  elem.addEventListener("mousemove", mousemoveHandler)

  // 返回能取消事件绑定的函数
  return () => {
    elem.removeEventListener("mousedown", mousedownHandler)
    elem.removeEventListener("mousemove", mousemoveHandler)
  }
}

/**
 * 绑定拖动线框的action
 * @param {HTMLElement} elem canvas元素
 * @param {Funtion} handler 控制器
 */
function addDragRectEvent(elem, handler) {
  let mark = "DragRect"
  let isMouseDown = false
  let startX, startY

  function mousedownHandler(e) {
    // 对比标记，防止其他mousedown事件触发控制器
    if (mark === Marks.dragRect) {
      isMouseDown = true
      startX = e.offsetX
      startY = e.offsetY
    }
  }

  function mousemoveHandler(e) {
    // 对比标记，防止其他mousedown事件触发控制器
    if (mark === Marks.dragRect && isMouseDown) {
      let endX = e.offsetX
      let endY = e.offsetY
      handler(startX, startY, endX, endY)
    }
  }

  elem.addEventListener("mousedown", mousedownHandler)

  elem.addEventListener("mousemove", mousemoveHandler)

  // 返回能取消事件绑定的函数
  return () => {
    elem.removeEventListener("mousedown", mousedownHandler)
    elem.removeEventListener("mousemove", mousemoveHandler)
  }
}