const TestRoutes = [
  {
    path: '/taskList',
    name: 'taskList',
    component: () => import('views/task/List.vue'),
    meta: {
      title: '任务列表',
      icon: 'el-icon-s-grid'
    }
  },
  {
    path: '/relation',
    name: 'relation',
    component: () => import('views/relation/Index.vue'),
    meta: {
      title: '任务关系图',
      icon: 'el-icon-pie-chart'
    }
  },
  {
    path: '/clusterStatus',
    name: '',
    component: () => import('views/cluster/Status.vue'),
    meta: {
      title: '集群状态',
      icon: 'el-icon-c-scale-to-original'
    }
  },
  {
    path: '/resourcesManage',
    name: '',
    component: () => import('views/resources/Manage.vue'),
    meta: {
      title: '资源管理',
      icon: 'el-icon-setting'
    }
  },
  {
    path: '/addTask',
    name: '',
    component: () => import('views/task/Add.vue'),
    meta: {
      title: '添加任务',
      icon: 'el-icon-document-add'
    }
  }
]
export default TestRoutes
