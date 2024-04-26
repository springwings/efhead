<template>
  <div class="main">
    <el-container>
      <el-header class="header flex flex-middle">
        <img class="logo" src="@/assets/logo.png" alt="">
        <div class="header-title">ELASTICFLOW</div>
        <!-- <div v-if="user" class="header-right">{{user.name}}<span class="outlogin">退出</span></div>
        <div v-else class="header-right">登录</div> -->
      </el-header>
      <el-container>
        <el-aside width="200px" class="aside">
          <el-menu
            :default-active="active"
            @open="handleOpen"
            @close="handleClose"
            @select="handleSelect"
            style="min-height:100%"
          >
            <li v-for="(item,index) in navList" :key="index">
              <el-submenu v-if="item.children" :index="index">
                <template slot="title">
                  <i :class="item.icon"></i>
                  <span slot="title">{{item.meta.title}}</span>
                </template>
                <el-menu-item
                  v-for="(chItem,chIndex) in item.children"
                  :key="chIndex"
                  :index="chItem.path"
                >{{chItem.title}}</el-menu-item>
              </el-submenu>
              <el-menu-item v-else-if="!item.meta.hidden" :index="item.path">
                <i :class="item.meta.icon"></i>
                <span slot="title">{{item.meta.title}}</span>
              </el-menu-item>
            </li>
          </el-menu>
        </el-aside>
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>
<script>
import router from '@/router/module'

export default {
  name: 'Layout',
  data () {
    return {
      user: {
        name: '管理员'
      },
      navList: router,
      active: ''
    }
  },
  methods: {
    /** action */
    handleOpen (key, keyPath) {
      this.menuHidden = !this.menuHidden;
    },
    handleClose (key, keyPath) {
      this.$router.push(path);
    },
    handleSelect (key, keyPath) {
      this.$router.push({ path: key })
    }
  },
  created () {
    this.active = this.$route.path
  }
}
</script>
<style lang="scss" scoped>
.main {
  .el-main {
    background: #f1f1f1;
  }
  .header {
    background: rgb(1,191,179);
    padding: 0 30px;
    width: 100%;
    box-sizing: border-box;
    color: rgb(255, 255, 255);
    line-height: 60px;
    .logo {
      height: 80%;
      margin-right: 15px;
    }
    .outlogin{
      margin-left: 10px;
      cursor: pointer;
    }
    &-title {
      float: left;
      font-size: 30px;
    }
    &-right {
      float: right;
      font-size: 14px;
    }
  }
  .aside {
    height: calc(100vh - 60px);
    overflow: auto;
  }
}
</style>
