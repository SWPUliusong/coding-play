interface MediaRecorderOptions {
  mimeType?: string;
}

interface MediaRecorder {
  /**
   * 开始录制
   * @param recorderDuration 录制间隔(单位：毫秒)
   */
  start(recorderDuration: number): void;
}

/**
 * 视频录制对象
 */
declare var MediaRecorder: {
  prototype: MediaRecorder;
  new(mediaStream: MediaStream, options: MediaRecorderOptions): MediaRecorder;
}