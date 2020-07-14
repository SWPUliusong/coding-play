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
}

export default class Canvas extends EventBus {
  // 坐标框集合
  rects = []

  event = new EventBus()

  // 状态，处于绘画还是拖动
  state = ""

  // 拖动的目标在rects中的索引
  dragIndex = -1

  // 事件和控制器的映射表
  eventMap = {}

  // 是否禁用动作
  disabled = false

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
        this.rects.push(this.getPoints(startX, startY, endX, endY))
      } else if (this.state === Marks.dragRect) {
        let rect = this.rects[this.dragIndex]
        let x1 = rect.startX + (endX - startX)
        let y1 = rect.startY + (endY - startY)
        let x2 = rect.endX + (endX - startX)
        let y2 = rect.endY + (endY - startY)
        this.rects[this.dragIndex] = this.getPoints(x1, y1, x2, y2)
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
      let rect = null
      rects.forEach((item, i) => {
        if (this.isPointInRect(item, x, y)) {
          rect = item
          this.dragIndex = i
        }
      })
      if (!!rect) {
        elem.style.cursor = "move"
        this.state = Marks.dragRect
      } else {
        elem.style.cursor = "crosshair"
        this.state = Marks.drawRect
      }
    })


    this.event.on(Marks.drawRect, ({ startX, startY, endX, endY }) => {
      this.resetLayer(this.rects)
      this.drawRect(startX, startY, endX, endY)
    })

    this.event.on(Marks.dragRect, ({ startX, startY, endX, endY }) => {
      // 选中的框
      let rect = this.rects[this.dragIndex]
      // 获取选中以外的其他框
      let rectsOther = this.rects.filter((item, i) => i !== this.dragIndex)
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
        // 设置缩放的小框
        ctx.fillStyle = "#fff";
        let width = 6
        // top-left
        ctx.fillRect(startX - width / 2, startY - width / 2, width, width)
        // top-center
        ctx.fillRect((startX + endX) / 2 - width / 2, startY - width / 2, width, width)
        // top-right
        ctx.fillRect(endX - width / 2, startY - width / 2, width, width)
        // right-center
        ctx.fillRect(endX - width / 2, (startY + endY) / 2 - width / 2, width, width)
        // bottom-right
        ctx.fillRect(endX - width / 2, endY - width / 2, width, width)
        // bottom-center
        ctx.fillRect((startX + endX) / 2 - width / 2, endY - width / 2, width, width)
        // bottom-left
        ctx.fillRect(startX - width / 2, endY - width / 2, width, width)
        // bottom-center
        ctx.fillRect(startX - width / 2, (startY + endY) / 2 - width / 2, width, width)
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
  }

  // 对起始点和结束点位置处理，保证四个点中更靠近原点的点作为起点
  getPoints(x1, y1, x2, y2) {
    return {
      startX: Math.min(x1, x2),
      startY: Math.min(y1, y2),
      endX: Math.max(x1, x2),
      endY: Math.max(y1, y2),
    }
  }

  // 线框是否包含点
  isPointInRect(rect, x, y) {
    let { startX, startY, endX, endY } = rect

    return x >= startX && x <= endX && y >= startY && y <= endY
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
