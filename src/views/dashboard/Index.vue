<template>
  <div v-loading="loading">
  <el-row class="grid-content grid-info">
      <el-col :span="24"><p style="padding:3px 10px;"><i class="el-icon-bell"></i> 当前系统版本：{{summary_data.version}}，系统健康状态：
  <i v-if="summary_data.health !== '正常'" class="el-button--warning is-circle">{{ summary_data.health }}</i>
  <i v-else class="el-button--success is-circle">{{ summary_data.health }}</i> ，
系统启动时间：{{summary_data.system_start_time}}</p></el-col>
  </el-row>
  <el-row :gutter="20">
    <el-col :span="6"><div class="grid-content "><i class="el-icon-s-home dash_icon dash_blue"></i>
      <div class="card-panel-description"><div class="card-panel-text"> 集群节点数 </div><span class="card-panel-num">
    {{summary_data.node_num}}
    </span></div>
    </div></el-col>
    <el-col :span="6"><div class="grid-content ">
      <i class="el-icon-s-order dash_icon"></i>
        <div class="card-panel-description"><div class="card-panel-text"> 实例数 </div><span class="card-panel-num">
       {{summary_data.task_num}}
      </span></div>
    </div></el-col>
    <el-col :span="6"><div class="grid-content ">
        <i class="el-icon-s-help dash_icon"></i>
          <div class="card-panel-description"><div class="card-panel-text"> 资源数 </div><span class="card-panel-num">
         {{summary_data.resource_num}}
        </span></div>
    </div></el-col>
    <el-col :span="6"><div class="grid-content ">
      <i class="el-icon-files dash_icon"></i>
        <div class="card-panel-description"><div class="card-panel-text"> 集群模式 </div>
        <span class="card-panel-num" style="font-size:18px">
         {{summary_data.cluster_mode}}
      </span></div>
    </div></el-col>
  </el-row>
  <el-row :gutter="20">
    <el-col :span="16"><div class="grid-content ">
      <template>
      <el-table
        :data="tableData"
        style="width: 100%"
        height="300">
        <el-table-column
          fixed
          prop="conf_name"
          label="配置域" >
        </el-table-column>
        <el-table-column
          prop="conf_value"
          label="配置值" >
        </el-table-column>
      </el-table>
    </template>
     </div></el-col>
    <el-col :span="8">
    <div class="grid-content" style="min-height:25px;color:rgb(16 167 162);text-align:right;font-size:16px;"><p style="padding:20px;">集群使用资源监控</p></div>
    <div class="grid-content usage_progress"  style="min-height:45px;">
      CPU使用率
      <el-progress
    v-if="summary_data.memory_usage"
      :percentage="summary_data.memory_usage"
    :class="progressStatus(summary_data.memory_usage)"
      ></el-progress>
      </div>
      <div class="grid-content usage_progress" style="min-height:45px;">
      内存使用率
        <el-progress
      v-if="summary_data.memory_usage"
        :percentage="summary_data.memory_usage"
      :class="progressStatus(summary_data.memory_usage)"
        ></el-progress>
     </div>
      <div class="grid-content usage_progress">
        总体内存：{{summary_data.total_memory}}G
         </el-progress>
      </div>
    </el-col>
  </el-row>
  </div>
</template>
<script>
import basicApi from '@/request/api/basic'

export default {
  data () {
    return {
      summary_data: {},
      loading: true,
      tableData:[]
    }
  },
  methods: {
    progressStatus (data) {
      if (data >= 90) {
        return 'exception'
      } else if (data >= 75) {
        return 'warning'
      } else {
        return 'success'
      }
    },
    getHealthStatus(healthStatus) {
      switch (healthStatus) {
        case '正常':
          return '<i class="el-button--success is-circle">正常</i>';
        default:
          return '<i class="el-button--info is-circle">异常</i>';
      }
    },
    getSumaryData () {
      basicApi.efm_doaction({
        ac: 'globalStatus'
      }).then(res => {
        this.summary_data = Object.assign([], res.response.datas)
        this.loading = false
        this.tableData = [{conf_name: '是否开启调试',conf_value: this.summary_data.is_debug.toString()},
          {conf_name: '系统语言',conf_value: this.summary_data.lang},
          {conf_name: '是否开启批写模式',conf_value: this.summary_data.write_batch.toString()},
          {conf_name: '管理后台代理',conf_value: this.summary_data.proxy_ip},
          {conf_name: '系统配置路径',conf_value: this.summary_data.sys_config_path},
          {conf_name: '系统数据路径',conf_value: this.summary_data.datas_config_path},
          {conf_name: '插件路径',conf_value: this.summary_data.plugin_path}]
      })
    }
  },
  created () {
    this.getSumaryData()
  }
}
</script>

<style lang="scss" scoped>
.el-row {
  margin-bottom: 20px;
&:last-child {
    margin-bottom: 0;
  }
}
.el-col {
  border-radius: 4px;
}
.grid-content {
  border-radius: 4px;
  min-height: 85px;
  background:#fff;
}
.grid-info{
  line-height:35px;
  font-size:14px;
  font-color: #666;
  min-height: 35px;
}
.row-bg {
  padding: 10px 0;
  background-color: #f9fafc;
}
.dash_icon{
  font-size:65px;
  padding:8px;
  color:#36a3f7;
}
.card-panel-description{
  float: right;
  margin: 20px;
  margin-left: 0;
}
.card-panel-text{
  line-height: 18px;
  color: rgba(0,0,0,.45);
  font-size: 16px;
  margin-bottom:9px;
}
.card-panel-num{
  font-size: 26px;
}
.dash_blue{
  color:#01bfb3;
}
.usage_progress {
  padding: 10px 12px;
  ::v-deep .el-progress {
    width:100%;
  &.exception .el-progress-bar__inner {
      background: #F56C6C !important;
    }
  &.success .el-progress-bar__inner {
      background: #67C23A !important;
    }
  &.warning .el-progress-bar__inner {
      background: #E6A23C !important;
    }
  }
}
</style>
