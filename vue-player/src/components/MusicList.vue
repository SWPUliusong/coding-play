<template>
    <div>
        <ul>
            <li v-for="(song, index) in musicList" :key="index">
                <router-link :to="{path: `/music/${song.id}`}">{{song.name}}</router-link>
            </li>
        </ul>
    </div>
</template>

<script>
    import { findTopMusic } from '@/http'

    export default {
        data() {
            return {
                musicList: ''
            }
        },
        created() {
            findTopMusic()
                .then(res => {
                    this.musicList = res.data.tracks
                })
        }
    }
</script>


<style scoped>
    
</style>

