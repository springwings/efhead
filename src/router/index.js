import Vue from 'vue'
import Router from 'vue-router'
import index from './module/index'
// import Store from '@/store/index'

Vue.use(Router)

const routes = [
  { path: '/404', component: () => import('components/routerError/404') },
  { path: '/401', component: () => import('components/routerError/401') },
  { path: '*', redirect: '/404' },
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('components/layout/main.vue'),
    children: [
      ...index
    ]
  }
]

/** 分模块的路由，合并传入Router */
let router = new Router({
  // mode: 'history',
  base: '/',
  routes: routes
})

// 导航守卫，获取登录信息
// router.beforeEach((to, from, next) => {
//   console.log(to)

//   next()
// })
export default router
