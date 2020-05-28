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

class Canvas {
  // 坐标框集合
  axis = []

  event = new EventBus()

  // 鼠标现在的位置
  x = 0
  y = 0

  // 状态，处于绘画还是拖动
  state = ""

  // 拖动的目标在axis中的索引
  dragIndex = -1

  /**
   * 初始化canvas
   * @param {HTMLCanvasElement} elem canvas元素
   */
  constructor(elem) {
    this.canvasElem = elem
    elem.style.cursor = "crosshair"
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
      if (this.state === Marks.drawRect) {
        let endX = e.offsetX
        let endY = e.offsetY
        this.axis.push(this.getPoints(startX, startY, endX, endY))
      }
    })

    elem.addEventListener("mousemove", e => {
      let x = this.x = e.offsetX
      let y = this.y = e.offsetY
      // 当前鼠标是按下的，则触发对应事件
      if (isMouseDown) {
        return this.event.emit(
          this.state,
          this.getPoints(startX, startY, x, y)
        )
      }
      // 如果鼠标没有按下，则根据鼠标位置，改变状态
      // 监听是否进入画框内,进入触发拖动，没有进入则触发画框
      let axis = this.axis
      let rect = axis.find(item => {
        return this.isPointInRect(item, x, y)
      })
      if (!!rect) {
        this.dragIndex = axis.indexOf(rect)
        elem.style.cursor = "move"
        this.state = Marks.dragRect
      } else {
        elem.style.cursor = "crosshair"
        this.state = Marks.drawRect
      }
    })


    this.event.on(Marks.drawRect, ({ startX, startY, endX, endY }) => {
      this.resetLayer()
      this.drawRect(startX, startY, endX, endY)
    })

    this.event.on(Marks.dragRect, ({ startX, startY, endX, endY }) => {
      let rect = this.axis[this.dragIndex]
      console.log(rect)
      rect.startX = rect.startX + (endX - startX)
      rect.startY = rect.startY + (endY - startY)
      rect.endX = rect.endX + (endX - startX)
      rect.endY = rect.endY + (endY - startY)
      console.log(rect)
      this.resetLayer()
    })
  }

  // 重置图层
  resetLayer() {
    const ctx = this.ctx
    const elem = this.canvasElem
    const axis = this.axis
    ctx.clearRect(0, 0, elem.width, elem.height)
    if (!!axis.length) {
      axis.forEach(item => {
        let { startX, startY, endX, endY } = item
        ctx.strokeRect(startX, startY, endX - startX, endY - startY)
      })
    }
  }

  // 画框
  drawRect(startX, startY, endX, endY) {
    const ctx = this.ctx
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

}