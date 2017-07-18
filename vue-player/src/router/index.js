import Vue from 'vue'
import Router from 'vue-router'

import Hello from '@/components/Hello'
import MusicList from '@/components/MusicList'
import Music from '@/components/Music'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    // {
    //   path: '/',
    //   name: 'Hello',
    //   component: Hello
    // },
    {
      path: '/',
      name: 'top',
      component: MusicList
    },
    {
      path: '/music/:id',
      name: 'music',
      component: Music
    }
  ]
})
