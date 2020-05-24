// action类型
const Marks = {
  drawRect: "DrawRect",
  dragRect: "DragRect",
}

class Canvas {
  // 坐标框集合
  axis = []

  // 鼠标现在的位置
  x = 0
  y = 0
  /**
   * 初始化canvas
   * @param {HTMLCanvasElement} elem canvas元素
   */
  constructor(elem) {
    this.canvasElem = elem
    elem.style.cursor = "crosshair"
    this.ctx = elem.getContext("2d")

    elem.addEventListener("mousemove", e => {
      let x = this.x = e.offsetX
      let y = this.y = e.offsetY

      // 监听是否进入画框内,进入触发拖动，没有进入则画框
      let axis = this.axis
      let rect = axis.find(item => {
        return this.isPointInRect(item, x, y)
      })
      if (!!rect) {
        elem.style.cursor = "move"
      } else {
        elem.style.cursor = "crosshair"
      }

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

  /**
  * 绑定划框的action
  * @param {Funtion} handler 控制器
  */
  addDrawRectEvent(handler = () => { }) {
    const elem = this.canvasElem
    // action类型标记
    let mark = "DrawRect"
    let isMouseDown = false
    // 画框的起始点
    let startX, startY

    let self = this

    function mousedownHandler(e) {
      // 对比标记，防止其他mousedown事件触发控制器
      if (mark === Marks.drawRect) {
        isMouseDown = true
        startX = e.offsetX
        startY = e.offsetY
      }
    }

    function mousemoveHandler(e) {
      // 对比标记，防止其他mousemove事件触发控制器
      if (mark === Marks.drawRect && isMouseDown) {
        let endX = e.offsetX
        let endY = e.offsetY

        self.resetLayer()
        self.drawRect(startX, startY, endX, endY)

      }
    }

    function mouseupHandler(e) {
      // 对比标记，防止其他mouseup事件触发控制器
      if (mark === Marks.drawRect && isMouseDown) {
        isMouseDown = false
        let endX = e.offsetX
        let endY = e.offsetY
        self.axis.push(self.getPoints(startX, startY, endX, endY))
        handler(self.getPoints(startX, startY, endX, endY))
      }
    }

    elem.addEventListener("mousedown", mousedownHandler)

    elem.addEventListener("mousemove", mousemoveHandler)

    elem.addEventListener("mouseup", mouseupHandler)

    // 返回能取消事件绑定的函数
    return () => {
      elem.removeEventListener("mousedown", mousedownHandler)
      elem.removeEventListener("mousemove", mousemoveHandler)
      elem.removeEventListener("mouseup", mouseupHandler)
    }
  }

  /**
  * 绑定拖动线框的action
  * @param {Funtion} handler 控制器
  */
  addDragRectEvent(handler = () => { }) {
    const elem = this.canvasElem
    // action类型标记
    let mark = "DragRect"
    let isMouseDown = false

    // 画框拖动的起始点
    let startX, startY

    // 被拖动的线框
    let dragRect = null

    let self = this


    function mousemoveHandler(e) {
      let x = e.offsetX
      let y = e.offsetY
      // 对比标记，防止其他mousemove事件触发控制器
      if (mark === Marks.dragRect) {
        // 已经按下鼠标则拖动画框
        if (isMouseDown) {
          self.axis = self.axis.filter(item => item !== dragRect)


        } else {
          // 没有按下鼠标，则监听是否进入画框内
          let axis = self.axis
          dragRect = axis.find(item => {
            return self.isPointInRect(item, x, y)
          })
          if (!!dragRect) {
            elem.style.cursor = "move"
          } else {
            elem.style.cursor = "crosshair"
          }
        }

      }
    }

    function mousedownHandler(e) {
      // 对比标记，防止其他mousedown事件触发控制器
      if (mark === Marks.dragRect) {
        isMouseDown = true
        startX = e.offsetX
        startY = e.offsetY
      }
    }

    function mouseupHandler(e) {
      // 对比标记，防止其他mouseup事件触发控制器
      if (mark === Marks.dragRect && isMouseDown) {
        isMouseDown = false
        let endX = e.offsetX
        let endY = e.offsetY
        self.axis.push(self.getPoints(startX, startY, endX, endY))
        handler(self.getPoints(startX, startY, endX, endY))
      }
    }

    elem.addEventListener("mousemove", mousemoveHandler)

    elem.addEventListener("mousedown", mousedownHandler)

    // elem.addEventListener("mouseup", mouseupHandler)

    // 返回能取消事件绑定的函数
    return () => {
      elem.removeEventListener("mousedown", mousedownHandler)
      elem.removeEventListener("mousemove", mousemoveHandler)
      // elem.removeEventListener("mouseup", mouseupHandler)
    }
  }



}