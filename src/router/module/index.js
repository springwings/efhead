const SysRoutes = [
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('views/dashboard/Index.vue'),
    meta: {
      title: '控制面板',
      icon: 'el-icon-data-analysis',
      hidden: false
    }
  },
  {
    path: '/taskList',
    name: 'taskList',
    component: () => import('views/task/List.vue'),
    meta: {
      title: '实例管理',
      icon: 'el-icon-files',
      hidden: false
    }
  },
  {
    path: '/relation',
    name: 'relation',
    component: () => import('views/relation/Index.vue'),
    meta: {
      title: '实例监控',
      icon: 'el-icon-data-line',
      hidden: false
    }
  },
  {
    path: '/addTask',
    name: '',
    component: () => import('views/task/Add.vue'),
    meta: {
      title: '添加实例',
      icon: 'el-icon-folder-add',
      hidden: true
    }
  },
  {
    path: '/clusterManage',
    name: '',
    component: () => import('views/cluster/Status.vue'),
    meta: {
      title: '集群管理',
      icon: 'el-icon-odometer',
      hidden: false
    }
  },
  {
    path: '/resourcesStatus',
    name: '',
    component: () => import('views/resources/Status.vue'),
    meta: {
      title: '资源监控',
      icon: 'el-icon-s-management',
      hidden: false
    }
  },
  {
    path: '/resourcesManage',
    name: '',
    component: () => import('views/resources/Manage.vue'),
    meta: {
      title: '资源配置',
      icon: 'el-icon-s-grid',
      hidden: true
    }
  },
  {
    path: '/systemConfig',
    name: '',
    component: () => import('views/system/Config.vue'),
    meta: {
      title: '系统配置',
      icon: 'el-icon-setting',
      hidden: false
    }
  },
  {
    path: '/systemHelp',
    name: '',
    component: () => import('views/system/Help.vue'),
    meta: {
      title: '常见问题',
      icon: 'el-icon-question',
      hidden: false
    }
  }
]
export default SysRoutes
