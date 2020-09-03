
/**
 * 缩放的动作对象
 * @typedef Action
 * @property {string} Action.position 缩放的方向
 * @property {string[]} Action.changePointers 改变的坐标点
 * @property {Function} Action.handler 处理函数
 * 
 * 
 * 配置内容
 * @typedef ContextOptions
 * @property {number} ContextOptions.lineWidth 线条宽度
 * @property {string} ContextOptions.strokeStyle 线条颜色
 * @property {string} ContextOptions.fillStyle 填充颜色
 * @property {string} ContextOptions.shadowColor 阴影的颜色
 * @property {number} ContextOptions.shadowBlur 阴影的模糊级别
 * @property {number} ContextOptions.shadowOffsetX 阴影距形状的水平距离
 * @property {number} ContextOptions.shadowOffsetY 阴影距形状的垂直距离
 * @property {"butt"|"round"|"square"} ContextOptions.lineCap 线条的结束端点样式(butt：默认,向线条的每个末端添加平直的边缘； round：向线条的每个末端添加圆形线帽；square：向线条的每个末端添加正方形线帽。)
 * @property {"miter"|"round"|"bevel"} ContextOptions.lineJoin 两条线相交时，所创建的拐角类型(miter：默认，创建尖角；round：创建圆角；bevel：创建斜角)
 * @property {number} ContextOptions.miterLimit 最大斜接长度(只有当 lineJoin 属性为 "miter" 时，miterLimit 才有效)
 * @property {string} ContextOptions.font 文本内容的当前字体属性(语法与 CSS font 属性相同)
 * @property {"start"|"end"|"center"|"left"|"right"} ContextOptions.textAlign 文本内容的当前对齐方式
 * @property {"alphabetic"|"top"|"hanging"|"middle"|"ideographic"|"bottom"} ContextOptions.textBaseline 绘制文本时使用的当前文本基线
 *
 * 
 * @typedef CrosshairOptions 十字线配置
 * @property {number} CrosshairOptions.width 十字线宽度
 * @property {string} CrosshairOptions.stroke 十字线颜色
 * 
 * @typedef RectOptions 线框配置
 * @property {number} CrosshairOptions.width 线框宽度
 * @property {string} CrosshairOptions.stroke 线框颜色
 * @property {string} CrosshairOptions.fill 线框填充颜色
 * @property {string} CrosshairOptions.strokeActive 线框在活动时的颜色
 * @property {string} CrosshairOptions.fillActive 线框在活动时的填充颜色
 * 
 * 配置内容
 * @typedef Options
 * @property {CrosshairOptions} CrosshairOptions.crosshair 十字线配置
 * @property {RectOptions} CrosshairOptions.rect 线框配置
 * @property {number} CrosshairOptions.ignoreSize 被忽略的线框大小
 */


/**
 * 事件总线
 */
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

// 事件类型
const EventTypes = {
  drawRect: "DrawRect",
  dragRect: "DragRect",
  zoomRect: "ZoomRect",
}

/**
 * 设置style样式
 * @param {HTMLElement} elem 
 * @param {Object} style 
 */
function setStyle(elem, style) {
  Object.keys(style).forEach(key => {
    let val = style[key]
    elem.style[key] = val
  })
}

/**
 * 默认配置
 * @type {Options}
 */
const defaultOptions = {
  crosshair: {
    width: 2,
    stroke: "red"
  },
  rect: {
    width: 2,
    stroke: "red",
    strokeActive: "#fea26f",
    fill: "transparent",
    fillActive: "rgba(240, 0, 0, 0.1)"
  },
  ignoreSize: 64
}

/**
 * 十字线对象
 * @param {HTMLElement} elem canvas元素
 * @param {Options} options 配置
 */
function createCrosshair(elem, options) {
  // 创建两条线，构成十字线
  let rowLine = document.createElement("span")
  let colLine = document.createElement("span")
  // 读取配置
  let { width, stroke } = options.crosshair
  let commonCss = {
    display: "none",
    background: stroke,
    position: "absolute",
    top: 0,
    left: 0,
    "z-index": 1
  }
  setStyle(rowLine, {
    ...commonCss,
    height: width + "px",
    width: elem.width + "px",
  })
  setStyle(colLine, {
    ...commonCss,
    height: elem.height + "px",
    width: width + "px",
  })
  // 父元素是静态定位则修改为relative定位
  if (window.getComputedStyle(elem.parentNode).position === "static") {
    setStyle(elem.parentNode, {
      position: "relative"
    })
  }
  elem.parentNode.appendChild(rowLine)
  elem.parentNode.appendChild(colLine)

  return {
    move(x, y) {
      x = x - width / 2
      y = y - width / 2
      setStyle(rowLine, {
        display: "inline-block",
        transform: `translateY(${y}px)`
      })
      setStyle(colLine, {
        display: "inline-block",
        transform: `translateX(${x}px)`
      })
    },
    hide() {
      setStyle(rowLine, { display: "none" })
      setStyle(colLine, { display: "none" })
    }
  }
}

export default class Canvas extends EventBus {
  // 标记鼠标初始状态为未按下
  isMouseDown = false
  // 坐标框集合
  rects = []

  event = new EventBus()

  // 状态，处于绘画还是拖动
  state = ""

  // 目标框在rects中的索引
  activeIndex = -1

  // 线框周围缩放点位的宽度
  zoomWidth = 8

  /**
   * 配置项
   * @type {Options}
   */
  options

  /**
   * 缩放动作
   * @type {Action}
   */
  zoomAction

  /**
   * 十字线坐标
   * @type {number[]}
   */
  crosshairPoints = []

  /**
   * 初始化canvas
   * @param {HTMLCanvasElement} elem canvas元素
   * @param {Options} options 配置内容
   */
  constructor(elem, options = defaultOptions) {
    super()
    this.canvasElem = elem
    // 保存配置内容
    this.options = { ...options }
    // 设置CSS样式
    setStyle(elem, {
      cursor: "crosshair",
      color: "#fff",
      userSelect: "none",
      "z-index": 2
    })

    const Crosshair = createCrosshair(elem, options)

    this.ctx = elem.getContext("2d")

    // 标记鼠标初始状态为未按下
    this.isMouseDown = false
    // 画框的起始点
    let startX, startY
    /**
     * @param {MouseEvent} e 鼠标事件
     * @this Canvas
     */
    const mousedownHandler = e => {
      this.isMouseDown = true
      startX = e.offsetX
      startY = e.offsetY
      // 按下鼠标时，如果在线框上，则标记线框
      this.activeRect()
    }
    /**
     * @param {MouseEvent} e 鼠标事件
     * @this Canvas
     */
    const mouseupHandler = e => {
      // 如果鼠标不是在画布上按下，则不作处理
      if (!this.isMouseDown) return
      this.isMouseDown = false
      let endX = e.offsetX
      let endY = e.offsetY
      if (this.state === EventTypes.drawRect) {
        let rect = this.getPoints(startX, startY, endX, endY)
        // 如果面积太小，则忽略
        if (!!rect) {
          this.rects.push(rect)
        }
      } else if (this.state === EventTypes.dragRect) {
        let rect = this.rects[this.activeIndex]
        let x1 = rect.startX + (endX - startX)
        let y1 = rect.startY + (endY - startY)
        let x2 = rect.endX + (endX - startX)
        let y2 = rect.endY + (endY - startY)
        this.rects[this.activeIndex] = this.getPoints(x1, y1, x2, y2)
      } else if (this.state === EventTypes.zoomRect) {
        let { startX, startY, endX, endY } = this.rects[this.activeIndex]
        let rect = this.getPoints(startX, startY, endX, endY)
        // 如果面积太小，则忽略
        if (!!rect) {
          this.rects[this.activeIndex] = rect
        } else {
          this.rects.splice(this.activeIndex, 1)
        }
      }
      this.resetLayer(this.rects)
      this.emit("change", JSON.parse(JSON.stringify(this.rects)))
    }
    /**
     * @param {MouseEvent} e 鼠标事件
     * @this Canvas
     */
    const mousemoveHandler = e => {
      let x = e.offsetX
      let y = e.offsetY
      // 十字线刻度
      Crosshair.move(x, y)
      // 当前鼠标是按下的，则触发对应事件
      if (this.isMouseDown) {
        return this.event.emit(
          this.state,
          { startX, startY, endX: x, endY: y }
        )
      }
      // 如果鼠标没有按下，则根据鼠标位置，改变状态
      // 监听是否进入画框内,进入触发拖动，没有进入则触发画框
      let rects = this.rects
      let state = ""
      let index = -1
      rects.forEach((item, i) => {
        // 缩放
        if (this.isPointInRect(item, x, y) === EventTypes.zoomRect) {
          state = EventTypes.zoomRect
          index = i
        }
        // 拖动
        else if (this.isPointInRect(item, x, y) === true) {
          state = EventTypes.dragRect
          index = i
        }
      })
      this.activeIndex = index

      if (state === EventTypes.zoomRect) {
        elem.style.cursor = this.zoomAction.position
        this.state = EventTypes.zoomRect
      } else if (state === EventTypes.dragRect) {
        elem.style.cursor = "move"
        this.state = EventTypes.dragRect
      } else {
        elem.style.cursor = "crosshair"
        this.state = EventTypes.drawRect
      }
    }


    elem.addEventListener("mousedown", mousedownHandler.bind(this))

    elem.addEventListener("mouseup", mouseupHandler.bind(this))

    elem.addEventListener("mousemove", mousemoveHandler.bind(this))

    elem.addEventListener("mouseleave", e => {
      mouseupHandler.call(this, e)
      // 离开时隐藏十字线
      Crosshair.hide()
    })


    this.event.on(EventTypes.zoomRect, ({ endX: x, endY: y }) => {
      // 选中的框
      let rect = this.rects[this.activeIndex]
      // 获取选中以外的其他框
      let rectsOther = this.rects.filter((item, i) => i !== this.activeIndex)
      let { startX, startY, endX, endY } = this.zoomAction.handler(rect, [x, y])
      this.resetLayer(rectsOther)
      this.drawRect(startX, startY, endX, endY)
    })

    this.event.on(EventTypes.drawRect, ({ startX, startY, endX, endY }) => {
      this.resetLayer(this.rects)
      this.drawRect(startX, startY, endX, endY)
    })

    this.event.on(EventTypes.dragRect, ({ startX, startY, endX, endY }) => {
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

  /**
   * 设置配置
   * @param {Options} options 
   */
  setOptions(options) {
    /**
     * 设置值
     * @param {any} target 目标对象
     * @param {any} source 可用值
     */
    function set(target, source) {
      Object.keys(source).forEach(key => {
        let item = source[key]
        if (item === void 0 || item === null || item === "") return
        if (typeof item === "object") {
          set(target[key], item)
        } else {
          target[key] = item
        }
      })
    }

    set(this.options, options)
  }

  /**
   * 获取配置
   */
  getOptions() {
    return JSON.parse(JSON.stringify(this.options))
  }

  /**
   * 激活选中线框
   */
  activeRect() {
    // 获取线框
    let index = this.activeIndex
    if (index === -1) return
    let { startX, startY, endX, endY } = this.rects[index]
    // 读取配置
    const ctx = this.ctx
    let { width, strokeActive, fillActive } = this.options.rect
    ctx.strokeStyle = strokeActive;
    ctx.lineWidth = width;
    ctx.fillStyle = fillActive;
    // 重绘线框
    ctx.strokeRect(startX, startY, endX - startX, endY - startY)
    ctx.fillRect(startX, startY, endX - startX, endY - startY)
  }

  // /**
  //  * 绘制刻度线
  //  * @param {number} x 鼠标横坐标
  //  * @param {number} y 鼠标纵坐标
  //  */
  // drawTick(x, y) {
  //   let ctx = this.ctx
  //   let elem = this.canvasElem
  //   // 读取配置
  //   let { width, stroke } = this.options.crosshair
  //   ctx.strokeStyle = stroke;
  //   ctx.lineWidth = width;

  //   ctx.beginPath()
  //   ctx.moveTo(x, 0)
  //   ctx.lineTo(x, elem.height)
  //   ctx.moveTo(0, y)
  //   ctx.lineTo(elem.width, y)
  //   ctx.stroke()
  // }

  // 重置图层
  resetLayer(rects) {
    const ctx = this.ctx
    let { width, stroke, fill } = this.options.rect
    ctx.strokeStyle = stroke;
    ctx.fillStyle = fill;
    ctx.lineWidth = width;
    const elem = this.canvasElem
    ctx.clearRect(0, 0, elem.width, elem.height)
    // 重置线框
    if (!!rects && !!rects.length) {
      rects.forEach(item => {
        let { startX, startY, endX, endY } = item
        // 大框
        ctx.strokeRect(startX, startY, endX - startX, endY - startY)
        ctx.fillRect(startX, startY, endX - startX, endY - startY)
      })
    }
  }

  // 画框
  drawRect(startX, startY, endX, endY) {
    const ctx = this.ctx
    let { width, strokeActive, fillActive } = this.options.rect
    ctx.strokeStyle = strokeActive;
    ctx.lineWidth = width;
    // 绘制线框
    ctx.beginPath()
    ctx.moveTo(startX, startY)
    ctx.lineTo(endX, startY)
    ctx.lineTo(endX, endY)
    ctx.lineTo(startX, endY)
    ctx.closePath()
    ctx.stroke()
    // 填充一个透明背景，凸显线框
    ctx.fillStyle = fillActive;
    ctx.fill()
    // 在画框时，绘制对角线
    if (this.state === EventTypes.drawRect) {
      // 对角线
      ctx.strokeStyle = strokeActive;
      ctx.moveTo(startX, startY)
      ctx.lineTo(endX, endY)
      ctx.stroke()
    }
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
    // 如果面积小于设定值，则忽略框
    let { ignoreSize } = this.options
    if ((endX - startX) * (endY - startY) < ignoreSize) {
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
    let { width: lineWidth } = this.options.rect
    // 设置缩放像素大小
    let width = (lineWidth > this.zoomWidth ? lineWidth : this.zoomWidth) / 2
    // "nw-resize"
    if (x >= (startX - width) && x <= (startX + width) && y >= (startY - width) && y <= (startY + width)) {
      return this.createZoomAction("nw-resize")
    }
    // n-resize
    else if (x >= (startX + width) && x <= (endX - width) && y >= (startY - width) && y <= (startY + width)) {
      return this.createZoomAction("n-resize")
    }
    // ne-resize
    else if (x >= (endX - width) && x <= (endX + width) && y >= (startY - width) && y <= (startY + width)) {
      return this.createZoomAction("ne-resize")
    }
    // e-resize
    else if (x >= (endX - width) && x <= (endX + width) && y >= (startY + width) && y <= (endY - width)) {
      return this.createZoomAction("e-resize")
    }
    // se-resize
    else if (x >= (endX - width) && x <= (endX + width) && y >= (endY - width) && y <= (endY + width)) {
      return this.createZoomAction("se-resize")
    }
    // s-resize
    else if (x >= (startX + width) && x <= (endX - width) && y >= (endY - width) && y <= (endY + width)) {
      return this.createZoomAction("s-resize")
    }
    // sw-resize
    else if (x >= (startX - width) && x <= (startX + width) && y >= (endY - width) && y <= (endY + width)) {
      return this.createZoomAction("sw-resize")
    }
    // w-resize
    else if (x >= (startX - width) && x <= (startX + width) && y >= (startY + width) && y <= (endY - width)) {
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
    return EventTypes.zoomRect
  }

  // 获取绘好的线框
  getRects() {
    return JSON.parse(JSON.stringify(this.rects))
  }

  // 设置线框
  setRects(rects = []) {
    this.rects = JSON.parse(JSON.stringify(rects))
    this.emit("change", rects)
    this.resetLayer(rects)
  }

}
