
/**
 * 检测是否支持音视频媒体
 * @param {"audio"|"video"} type 媒体类型
 */
async function isMediaSupported(type) {
  try {
    const mediaDevices = navigator.mediaDevices
    if (!mediaDevices) return false
    let devices = await mediaDevices.enumerateDevices()
    return devices.some(device => {
      return device.kind.includes(type)
    })
  } catch (err) {
    return false
  }
}

; (async () => {

  let isSupported = await isMediaSupported("video")
  if (!isSupported) {
    alert("不支持视频录制")
  }

  /**
   * 实时播放器
   * @type {HTMLVideoElement}
   */
  const player = document.getElementById("player")
  /**
   * 录制播放器
   * @type {HTMLVideoElement}
   */
  const recordPlayer = document.getElementById("record-player")
  // 录制按钮
  const recordBtn = document.getElementById("record")
  // 播放按钮
  const playRecordBtn = document.getElementById("play-record")
  // 下载按钮
  const downloadBtn = document.getElementById("download")

  const mediaDevices = navigator.mediaDevices

  let mediaStream = await mediaDevices.getUserMedia({
    audio: false,
    video: {
      width: 720,
      height: 405,
      frameRate: 30
    }
  })
  // 播放摄像头实时获取的视频流
  player.srcObject = mediaStream

  // 媒体流缓冲区
  const buffer = []

  // 视频配置
  const options = { mimeType: "video/webm;codecs=vp8" }

  // 是否录制中
  let recording = false
  // 录制
  recordBtn.addEventListener("click", () => {
    if (recording) return
    recording = true
    const mediaRecorder = new MediaRecorder(mediaStream, options)

    mediaRecorder.ondataavailable = e => {
      if (!!e && !!e.data && e.data.size > 0) {
        buffer.push(e.data)
      }
    }
    mediaRecorder.start(10)
  })

  // 播放录制
  playRecordBtn.addEventListener("click", () => {
    if (buffer.length === 0) return
    let blobSrc = URL.createObjectURL(new Blob(buffer, options))
    recordPlayer.src = blobSrc
    recordPlayer.play()
    // URL.revokeObjectURL(blobSrc)
  })

})()