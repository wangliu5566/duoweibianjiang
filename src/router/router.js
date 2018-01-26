import Vue from 'vue'
import Router from 'vue-router'
// import Hello from '@/components/Hello'
// import Vuex from '../components/vuex'

Vue.use(Router)

export default new Router({
    routes: [{
            path: '/index',
            component: resolve => require(['@/components/index'], resolve)
        }, {
            path: '/booklist',
            component: resolve => require(['@/components/book/booklist'], resolve),
        }, {
            path: '/bookDetail',
            component: resolve => require(['@/components/book/bookDetail'], resolve),
        }, {
            path: '/bookSearch',
            component: resolve => require(['@/components/book/bookSearch'], resolve),
        }, {
            path: '/imgView',
            component: resolve => require(['@/components/imgView'], resolve),
        }, {
            path: '/maplist',
            component: resolve => require(['@/components/maplist'], resolve),
        }, {
            path: '/eventsList',
            component: resolve => require(['@/components/EventsList'], resolve),
        }, {
            path: '/eventDetail',
            component: resolve => require(['@/components/EventDetail.vue'], resolve),
        }, {
            path: '/sectionlist',
            component: resolve => require(['@/components/sectionlist'], resolve),
        }, 
         {
            path: '/personList',
            component: resolve => require(['@/components/PersonList'], resolve),
        }, {
            path: '/personDetail',
            component: resolve => require(['@/components/personDetail'], resolve),
        }, {
            path: '/footPrint',
            component: resolve => require(['@/components/user/FootPrint.vue'], resolve)
        }, {
            path: '/bookMark',
            component: resolve => require(['@/components/user/BookMark.vue'], resolve)
        }, {
            path: '/downLoad',
            component: resolve => require(['@/components/user/DownLoad.vue'], resolve)
        }, {
            path: '/myCollect',
            component: resolve => require(['@/components/user/MyCollect.vue'], resolve)
        },{
            path: '/noteList',
            component: resolve => require(['@/components/note/NoteList.vue'], resolve)
        },{
            path: '/multimediaView',
            component: resolve => require(['@/components/multimediaView.vue'], resolve)
        },{
            path: '/toCheck',
            component: resolve => require(['@/components/toCheck.vue'], resolve)
        },{
            path: '/userCenter',
            component: resolve => require(['@/components/UserCenter.vue'], resolve)
        }, {
            path: '*',
            redirect: '/index'
        }, {
            path: '/',
            redirect: '/index'
        },

    ]
})
