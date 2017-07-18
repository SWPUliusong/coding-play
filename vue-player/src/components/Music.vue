<template>
    <div class="music">
        <div class="music-control">
            <button @click="playOrPause">暂停/播放</button>
            <button @click="changeVolume(true)">音量+</button>
            <button @click="changeVolume(false)">音量-</button>
        </div>
    </div>
</template>

<script>
    import { findMusicUrl, findMusicLyric } from '@/http'
    export default {
        data() {
            return {
                audio: document.createElement('audio')
            }
        },
        created() {
            let id = this.$route.params.id
            findMusicUrl(id)
                .then(res => {
                    this.initAudio(res.data[0].url)
                })
        },
        beforeDestroy() {
            document.body.removeChild(this.audio)
        },
        methods: {
            // 初始化音频元素
            initAudio(url) {
                this.audio.src = url
                this.audio.controls = "controls"
                document.body.appendChild(this.audio)
                this.audio.play()
            },
            // 播放/暂停
            playOrPause() {
                if (this.audio.paused) {
                    this.audio.play()
                } else {
                    this.audio.pause()
                }
            },
            // 改变音量
            changeVolume(flag) {
                console.log(this.audio.volume)
                if (flag) {
                    this.audio.volume += 0.1
                } else {
                    this.audio.volume -= 0.1
                }
            }
        }

    }
</script>

<style scoped>
    .music-control {
        background-color: rgba(40, 40, 40, 0.7);
        position: fixed;
        bottom: 0;
        left: 0;
         width: 100% 
    }
</style>
