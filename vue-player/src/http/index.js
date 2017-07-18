import axios from 'axios'
import api from './api'

let http = axios.create()

http.interceptors.request.use(config => {
    config.url = '/api' + config.url
    return config
})

http.interceptors.response.use(res => {
    res.data = res.data.result || res.data.data
    return res
})

// 获取热歌榜音乐
export function findTopMusic() {
    return http.get(api.topMusic)
}

// 获取音乐url
export function findMusicUrl(id) {
    return http
        .get(api.musicUrl, {
            params: { id }
        })
}

// 获取音乐歌词
export function findMusicLyric(id) {
    return http
        .get(api.musicUrl, {
            params: { id }
        })
}