<template>
  <div v-loading="loading">
  <el-row class="grid-content grid-info">
      <el-col :span="24"><p style="padding:3px 10px;"><i class="el-icon-bell"></i> 当前系统版本：{{summary_data.version}}，系统健康状态：
  <i v-if="summary_data.health !== '正常'" class="el-button--warning is-circle">{{ summary_data.health }}</i>
  <i v-else class="el-button--success is-circle">{{ summary_data.health }}</i> ，
系统启动时间：{{summary_data.system_start_time}}</p></el-col>
  </el-row>
  <el-row :gutter="20">
    <el-col :span="6"><div class="grid-content "><i class="el-icon-office-building dash_icon dash_blue"></i>
      <div class="card-panel-description"><div class="card-panel-text"> 集群节点数 </div><span class="card-panel-num">
    {{summary_data.node_num}}
    </span></div>
    </div></el-col>
    <el-col :span="6"><div class="grid-content ">
      <i class="el-icon-files dash_icon"></i>
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
      <i class="el-icon-share dash_icon"></i>
        <div class="card-panel-description"><div class="card-panel-text"> 集群模式 </div>
        <span class="card-panel-num" style="font-size:18px">
         {{summary_data.cluster_mode}}
      </span></div>
    </div></el-col>
  </el-row>
<el-row>
  <el-col :span="24"><div id="history_statistics" style="min-height:300px" class="grid-content"></div></el-col>
</el-row>
  <el-row :gutter="20">
   <el-col :span="8">
    <div class="grid-content" style="min-height:300px;padding:0 15px"><p style="min-height:25px;font-weight:bold;font-size:18px;padding:10px 0;"><i class="el-icon-message-solid"></i> 集群告警信息监控</p>
      <div class="el-table__header-wrapper">
      <table  class="waring_table">
      <tbody>
        <tr><td class="el-title">L1级错误：系统警告类消息</td><td>
  <label>{{summary_data.error_ignore}}</label>
      </td></tr>
        <tr><td style="color:#01bfb3" class="el-title">L2级错误：需处理类消息</td><td>
        <label>{{summary_data.error_dispose}}</label>
        </td></tr>
        <tr><td style="color:#E6A23C" class="el-title">L3级错误：需及时处理类任务中断消息</td><td>
        <label>{{summary_data.error_breakoff}}</label>
         </td></tr>
        <tr><td style="color:#F56C6C" class="el-title">L4级错误：需立刻处理类任务终结消息</td><td>
        <label>{{summary_data.error_termination}}</label>
         </td></tr>
        </tbody>
      </table>
     </div></div>
    </el-col>

    <el-col :span="8"><div class="grid-content ">
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
    <div class="grid-content" style="min-height:25px;font-size:18px;"><p style="min-height:25px;font-weight:bold;font-size:18px;padding:10px;"><i class="el-icon-s-promotion"></i> 集群使用资源监控</p></div>
    <div class="grid-content usage_progress"  style="min-height:45px;">
      CPU使用率
      <el-progress
    v-if="summary_data.cpu_usage"
      :percentage="summary_data.cpu_usage"
    :class="progressStatus(summary_data.cpu_usage)"
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
import * as echarts from 'echarts'
import basicApi from '@/request/api/basic'


export default {
  data () {
    return {
      summary_data: {},
      loading: true,
      tableData:[]
    }
  },
  mounted () {
    this.chart = echarts.init(document.getElementById('history_statistics'))
  },
  beforeDestroy() {
  //  clearInterval(this.interval_ins1);
  },
  methods: {
    drawHistory(chart,reader,writer,computer,dateinfo){
      var option;
      var dayString = `三端最近 ${dateinfo.length}天数据统计`
      option = {
        title: {
          text: dayString
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['Reader', 'Computer', 'Writer']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: dateinfo
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: 'Reader',
            type: 'line',
            data: reader
          },
          {
            name: 'Computer',
            type: 'line',
            data: computer
          },
          {
            name: 'Writer',
            type: 'line',
            data: writer
          }
        ]
      };
      chart.setOption(option)
    },
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
    getTimestamps(dayNum) {
      const currentDate = new Date();
      currentDate.toLocaleString('en-US', { timeZone: 'Asia/Shanghai' });
      var currentZeroTimestamp = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate(),
        0, 0, 0, 0
      ).getTime();
      currentZeroTimestamp = currentZeroTimestamp/1000
      const timestamps = [currentZeroTimestamp];
      for (let i = 1; i < dayNum; i++) {
        const timestamp = currentZeroTimestamp - i * 24 * 60 * 60;
        timestamps.push(timestamp);
      }
      return timestamps;
    },
    getSumaryData () {
      basicApi.efm_doaction({
        ac: 'globalStatus'
      }).then(res => {
        this.summary_data = Object.assign([], res.response.datas)
        this.tableData = [{conf_name: '是否开启调试',conf_value: this.summary_data.is_debug.toString()},
          {conf_name: '系统语言',conf_value: this.summary_data.lang},
          {conf_name: '是否开启批写模式',conf_value: this.summary_data.write_batch.toString()},
          {conf_name: '管理后台代理',conf_value: this.summary_data.proxy_ip},
          {conf_name: '系统配置路径',conf_value: this.summary_data.sys_config_path},
          {conf_name: '系统数据路径',conf_value: this.summary_data.datas_config_path},
          {conf_name: '插件路径',conf_value: this.summary_data.plugin_path}]
        var reader = []
        var writer = []
        var computer = []
        var timestamps = this.getTimestamps(30);
        var dateinfo = timestamps.map(timestamp => {
          var date = new Date(timestamp*1000+28800000);
          return date.toISOString().slice(0, 10);
        });
        timestamps.forEach(key => {
          if (this.summary_data.reader.hasOwnProperty(key)) {
            reader.push(this.summary_data.reader[key]);
          }else{
            reader.push(0);
          }
          if (this.summary_data.writer.hasOwnProperty(key)) {
            writer.push(this.summary_data.writer[key]);
          }else{
            writer.push(0);
          }
          if (this.summary_data.computer.hasOwnProperty(key)) {
            computer.push(this.summary_data.computer[key]);
          }else{
            computer.push(0);
          }
        });
        reader.reverse()
        writer.reverse()
        computer.reverse()
        dateinfo.reverse()
        this.loading = false
        this.drawHistory(this.chart,reader,writer,computer,dateinfo)
      })
    }
  },

  created () {
    this.getSumaryData()
  }
}
console.log("人的生命是一个常数，而人的作为却是变量。生命就是在超常的作为中得到延展，走向永恒。")
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
  min-height: 98px;
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
  padding:18px 8px 8px 8px;
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
.waring_table{width:100%;margin-top:10px}
.waring_table label{font-size:18px;}
.waring_table tr{height:55px;line-height:55px}
</style>
