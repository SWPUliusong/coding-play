class EventBus {
  eventMap = {}

  on(eventName, cb) {
    let cbs = this.eventMap[eventName] || []
    cbs.push(cb)
    this.eventMap[eventName] = cbs
    return () => {
      let cbs = this.eventMap[eventName]
      cbs = cbs.filter(item => item !== cb)
      if (cbs.length === 0) {
        delete this.eventMap[eventName]
      } else {
        this.eventMap[eventName] = cbs
      }
    }
  }

  emit(eventName, payLoad) {
    let cbs = this.eventMap[eventName]
    if (!!cbs && !!cbs.length) {
      cbs.forEach(cb => cb(payLoad))
    }
  }
}

// action类型
const Marks = {
  drawRect: "DrawRect",
  dragRect: "DragRect",
  zoomRect: "ZoomRect",
}

class Canvas extends EventBus {
  // 坐标框集合
  rects = []

  event = new EventBus()

  // 状态，处于绘画还是拖动
  state = ""

  // 目标框在rects中的索引
  activeIndex = -1

  // 是否禁用动作
  disabled = false

  // 线框周围缩放点位的宽度
  zoomWidth = 8

  /**
   * 缩放的动作对象
   * @typedef Action
   * @property {string} Action.position
   * @property {string[]} Action.changePointers
   * @property {Function} Action.handler
   * 
   * @type {Action}
   */
  zoomAction = null

  /**
   * 初始化canvas
   * @param {HTMLCanvasElement} elem canvas元素
   */
  constructor(elem) {
    super()
    this.canvasElem = elem
    elem.style.cursor = "crosshair"
    elem.style.color = "#fff"
    this.ctx = elem.getContext("2d")

    let isMouseDown = false
    // 画框的起始点
    let startX, startY
    elem.addEventListener("mousedown", e => {
      isMouseDown = true
      startX = e.offsetX
      startY = e.offsetY
    })

    elem.addEventListener("mouseup", e => {
      isMouseDown = false
      let endX = e.offsetX
      let endY = e.offsetY
      if (this.state === Marks.drawRect) {
        let rect = this.getPoints(startX, startY, endX, endY)
        // 如果面积太小，则忽略
        if (!!rect) {
          this.rects.push(rect)
        }
      } else if (this.state === Marks.dragRect) {
        let rect = this.rects[this.activeIndex]
        let x1 = rect.startX + (endX - startX)
        let y1 = rect.startY + (endY - startY)
        let x2 = rect.endX + (endX - startX)
        let y2 = rect.endY + (endY - startY)
        this.rects[this.activeIndex] = this.getPoints(x1, y1, x2, y2)
      } else if (this.state === Marks.zoomRect) {
        let { startX, startY, endX, endY } = this.rects[this.activeIndex]
        this.rects[this.activeIndex] = this.getPoints(startX, startY, endX, endY)
      }
      this.resetLayer(this.rects)
      this.emit("change", JSON.parse(JSON.stringify(this.rects)))
    })

    elem.addEventListener("mousemove", e => {
      let x = e.offsetX
      let y = e.offsetY
      // 当前鼠标是按下的，则触发对应事件
      if (isMouseDown) {
        return this.event.emit(
          this.state,
          { startX, startY, endX: x, endY: y }
        )
      }
      // 如果鼠标没有按下，则根据鼠标位置，改变状态
      // 监听是否进入画框内,进入触发拖动，没有进入则触发画框
      let rects = this.rects
      let state = ""
      rects.forEach((item, i) => {
        // 缩放
        if (this.isPointInRect(item, x, y) === Marks.zoomRect) {
          state = Marks.zoomRect
          this.activeIndex = i
        }
        // 拖动
        else if (this.isPointInRect(item, x, y) === true) {
          state = Marks.dragRect
          this.activeIndex = i
        }
      })

      if (state === Marks.zoomRect) {
        elem.style.cursor = this.zoomAction.position
        this.state = Marks.zoomRect
      } else if (state === Marks.dragRect) {
        elem.style.cursor = "move"
        this.state = Marks.dragRect
      } else {
        elem.style.cursor = "crosshair"
        this.state = Marks.drawRect
      }
    })


    this.event.on(Marks.zoomRect, ({ endX: x, endY: y }) => {
      // 选中的框
      let rect = this.rects[this.activeIndex]
      let { startX, startY, endX, endY } = this.zoomAction.handler(rect, [x, y])
      this.resetLayer(this.rects)
      this.drawRect(startX, startY, endX, endY)
    })

    this.event.on(Marks.drawRect, ({ startX, startY, endX, endY }) => {
      this.resetLayer(this.rects)
      this.drawRect(startX, startY, endX, endY)
    })

    this.event.on(Marks.dragRect, ({ startX, startY, endX, endY }) => {
      // 选中的框
      let rect = this.rects[this.activeIndex]
      // 获取选中以外的其他框
      let rectsOther = this.rects.filter((item, i) => i !== this.activeIndex)
      let x1 = rect.startX + (endX - startX)
      let y1 = rect.startY + (endY - startY)
      let x2 = rect.endX + (endX - startX)
      let y2 = rect.endY + (endY - startY)
      this.resetLayer(rectsOther)
      this.drawRect(x1, y1, x2, y2)
    })
  }

  // 重置图层
  resetLayer(rects) {
    const ctx = this.ctx
    ctx.strokeStyle = "red";
    ctx.lineWidth = 3;
    const elem = this.canvasElem
    ctx.clearRect(0, 0, elem.width, elem.height)
    if (!!rects && !!rects.length) {
      rects.forEach(item => {
        let { startX, startY, endX, endY } = item
        // 大框
        ctx.strokeRect(startX, startY, endX - startX, endY - startY)
        // // 设置缩放的小框
        // ctx.fillStyle = "transparent";
        // let width = this.zoomWidth
        // // top-left
        // ctx.fillRect(startX - width / 2, startY - width / 2, width, width)
        // // top-center
        // ctx.fillRect((startX + endX) / 2 - width / 2, startY - width / 2, width, width)
        // // top-right
        // ctx.fillRect(endX - width / 2, startY - width / 2, width, width)
        // // right-center
        // ctx.fillRect(endX - width / 2, (startY + endY) / 2 - width / 2, width, width)
        // // bottom-right
        // ctx.fillRect(endX - width / 2, endY - width / 2, width, width)
        // // bottom-center
        // ctx.fillRect((startX + endX) / 2 - width / 2, endY - width / 2, width, width)
        // // bottom-left
        // ctx.fillRect(startX - width / 2, endY - width / 2, width, width)
        // // bottom-center
        // ctx.fillRect(startX - width / 2, (startY + endY) / 2 - width / 2, width, width)
      })
    }
  }

  // 画框
  drawRect(startX, startY, endX, endY) {
    const ctx = this.ctx
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.beginPath()
    ctx.moveTo(startX, startY)
    ctx.lineTo(endX, startY)
    ctx.lineTo(endX, endY)
    ctx.lineTo(startX, endY)
    ctx.closePath()
    ctx.stroke()
    ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
    ctx.fill()
  }

  // 对起始点和结束点位置处理，保证四个点中更靠近原点的点作为起点
  // 同时对四个点做处理，不能超过canvas的范围
  getPoints(x1, y1, x2, y2) {
    let startX = Math.min(x1, x2)
    startX = startX < 0 ? 0 : startX
    let startY = Math.min(y1, y2)
    startY = startY < 0 ? 0 : startY
    let endX = Math.max(x1, x2)
    endX = endX > this.canvasElem.width ? this.canvasElem.width : endX
    let endY = Math.max(y1, y2)
    endY = endY > this.canvasElem.height ? this.canvasElem.height : endY
    // 如果面积小于缩放框的面积，则忽略框
    let width = this.zoomWidth
    if ((endX - startX) * (endY - startY) < width * width) {
      return null
    }
    return { startX, startY, endX, endY }
  }

  /**
   * 线框是否包含点，如果在线框内，返回true/false
   * 如果点在缩放点内，则返回缩放点位置和处理函数
   * @typedef Rect
   * @property {number} Rect.startX
   * @property {number} Rect.startY
   * @property {number} Rect.endX
   * @property {number} Rect.endY
   * 
   * @param {Rect} rect 线框
   * @param {number} x 点的横坐标
   * @param {number} y 点的纵坐标
   * @returns {boolean|string}
   */
  isPointInRect(rect, x, y) {
    let { startX, startY, endX, endY } = rect
    let width = this.zoomWidth
    // "nw-resize"
    if (x >= (startX - width / 2) && x <= (startX - width / 2 + width) && y >= (startY - width / 2) && y <= (startY - width / 2 + width)) {
      return this.createZoomAction("nw-resize")
    }
    // n-resize
    // else if (x >= ((startX + endX) / 2 - width / 2) && x <= ((startX + endX) / 2 - width / 2 + width) && y >= (startY - width / 2) && y <= (startY - width / 2 + width)) {
    //   return this.createZoomAction("n-resize")
    // }
    else if (x >= (startX + width / 2) && x <= (endX - width / 2) && y >= (startY - width / 2) && y <= (startY + width / 2)) {
      return this.createZoomAction("n-resize")
    }
    // ne-resize
    else if (x >= (endX - width / 2) && x <= (endX - width / 2 + width) && y >= (startY - width / 2) && y <= (startY - width / 2 + width)) {
      return this.createZoomAction("ne-resize")
    }
    // e-resize
    // else if (x >= (endX - width / 2) && x <= (endX - width / 2 + width) && y >= ((startY + endY) / 2 - width / 2) && y <= ((startY + endY) / 2 - width / 2 + width)) {
    //   return this.createZoomAction("e-resize")
    // }
    else if (x >= (endX - width / 2) && x <= (endX + width / 2) && y >= (startY - width / 2) && y <= (endY - width / 2)) {
      return this.createZoomAction("e-resize")
    }
    // se-resize
    else if (x >= (endX - width / 2) && x <= (endX - width / 2 + width) && y >= (endY - width / 2) && y <= (endY - width / 2 + width)) {
      return this.createZoomAction("se-resize")
    }
    // s-resize
    // else if (x >= ((startX + endX) / 2 - width / 2) && x <= ((startX + endX) / 2 - width / 2 + width) && y >= (endY - width / 2) && y <= (endY - width / 2 + width)) {
    //   return this.createZoomAction("s-resize")
    // }
    else if (x >= (startX + width / 2) && x <= (endX - width / 2) && y >= (endY - width / 2) && y <= (endY + width / 2)) {
      return this.createZoomAction("s-resize")
    }
    // sw-resize
    else if (x >= (startX - width / 2) && x <= (startX - width / 2 + width) && y >= (endY - width / 2) && y <= (endY - width / 2 + width)) {
      return this.createZoomAction("sw-resize")
    }
    // w-resize
    // else if (x >= (startX - width / 2) && x <= (startX - width / 2 + width) && y >= ((startY + endY) / 2 - width / 2) && y <= ((startY + endY) / 2 - width / 2 + width)) {
    //   return this.createZoomAction("w-resize")
    // }
    else if (x >= (startX - width / 2) && x <= (startX + width / 2) && y >= (startY + width / 2) && y <= (endY - width / 2)) {
      return this.createZoomAction("w-resize")
    }
    // drag
    else {
      return x >= startX && x <= endX && y >= startY && y <= endY
    }

  }

  /**
   * @param {string} position
   * @returns {string}
   */
  createZoomAction(position) {
    /**
     * 缩放处理器
     * @param {Object} oldRect 原来的线框
     * @param {number[]} pointers 鼠标的横纵坐标
     * @param {string[]} changePointers 
     */
    function handler(oldRect, pointers, changePointers) {
      // pointers按照x,y的顺序传递
      // changePointers根据pointers的顺序，也按照x,y排列，如果没有用null占位
      changePointers.forEach((pointer, i) => {
        if (pointer === null) return
        oldRect[pointer] = pointers[i]
      })
      return oldRect
    }
    let map = {
      "nw-resize": (rect, pointers) => handler(rect, pointers, ["startX", "startY"]),
      "n-resize": (rect, pointers) => handler(rect, pointers, [null, "startY"]),
      "ne-resize": (rect, pointers) => handler(rect, pointers, ["endX", "startY"]),
      "e-resize": (rect, pointers) => handler(rect, pointers, ["endX", null]),
      "se-resize": (rect, pointers) => handler(rect, pointers, ["endX", "endY"]),
      "s-resize": (rect, pointers) => handler(rect, pointers, [null, "endY"]),
      "sw-resize": (rect, pointers) => handler(rect, pointers, ["startX", "endY"]),
      "w-resize": (rect, pointers) => handler(rect, pointers, ["startX", null]),
    }
    this.zoomAction = { position, handler: map[position] }
    return Marks.zoomRect
  }

  // 获取绘好的线框
  getRects() {
    return JSON.parse(JSON.stringify(this.rects))
  }

  // 设置线框
  setRects(rects = []) {
    this.rects = JSON.parse(JSON.stringify(rects))
    this.resetLayer(rects)
  }

}
