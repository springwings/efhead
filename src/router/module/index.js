const TestRoutes = [
  {
    path: '/taskList',
    name: 'taskList',
    component: () => import('views/task/List.vue'),
    meta: {
      title: '任务管理',
      icon: 'el-icon-files'
    }
  },
  {
    path: '/relation',
    name: 'relation',
    component: () => import('views/relation/Index.vue'),
    meta: {
      title: '任务关系图',
      icon: 'el-icon-data-line'
    }
  },
  {
    path: '/addTask',
    name: '',
    component: () => import('views/task/Add.vue'),
    meta: {
      title: '添加任务',
      icon: 'el-icon-folder-add'
    }
  },
  {
    path: '/clusterManage',
    name: '',
    component: () => import('views/cluster/Status.vue'),
    meta: {
      title: '集群管理',
      icon: 'el-icon-odometer'
    }
  },
  {
    path: '/resourcesManage',
    name: '',
    component: () => import('views/resources/Manage.vue'),
    meta: {
      title: '资源管理',
      icon: 'el-icon-s-grid'
    }
  },
  {
    path: '/systemManage',
    name: '',
    component: () => import('views/system/Manage.vue'),
    meta: {
      title: '系统管理',
      icon: 'el-icon-setting'
    }
  }
]
export default TestRoutes
