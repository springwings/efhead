<template>
  <div>
    <el-card>
      <table class="clusterStatus" v-if="result">
        <tbody>
          <tr>
            <td class="key">节点IP</td>
            <td class="number">{{ result.NODE_IP }}</td>
          </tr>
          <tr>
          <td class="key">节点ID</td>
            <td class="number">{{ result.NODE_ID }}</td>
          </tr>
          <tr>
            <td class="key">节点类型</td>
            <td class="string">{{ result.NODE_TYPE }}</td>
          </tr>
          <tr>
            <td class="key">实例数</td>
            <td class="number">{{ result.TASKS }}</td>
          </tr>
          <tr>
            <td class="key">集群状态</td>
            <td class="string">{{ result.STATUS }}</td>
          </tr>
          <tr>
            <td class="key">线程使用率</td>
            <td class="number">
              <el-progress
                v-if="result.THREAD_POOL_SIZE"
                :percentage="Number((result.THREAD_ACTIVE_COUNT / result.THREAD_POOL_SIZE * 100).toFixed(1))"
                :class="progressStatus(Number((result.THREAD_ACTIVE_COUNT / result.THREAD_POOL_SIZE * 100).toFixed(1)))"
              ></el-progress>
            </td>
          </tr>
          <tr>
            <td class="key">开启批量写</td>
            <td class="boolean">{{ result.WRITE_BATCH }}</td>
          </tr>
          <tr>
            <td class="key">系统版本</td>
            <td class="string">{{ result.VERSION }}</td>
          </tr>
          <tr>
            <td class="key">系统线程配置数</td>
            <td class="number">{{ result.SYS_THREAD_POOL_SIZE }}</td>
          </tr>
          <tr>
            <td class="key">分布式模式</td>
            <td class="boolean">{{ result.DISTRIBUTE_RUN }}</td>
          </tr>
          <tr>
            <td class="key">内存使用率</td>
            <td class="number">
              <el-progress
                v-if="result.MEMORY_USAGE"
                :percentage="result.MEMORY_USAGE"
                :class="progressStatus(result.MEMORY_USAGE)"
              ></el-progress>
            </td>
          </tr>
          <tr>
              <td class="key">CPU使用率</td>
                <td class="number">
                <el-progress
                v-if="result.CPU_USAGE"
                :percentage="result.CPU_USAGE"
                :class="progressStatus(result.CPU_USAGE)"
              ></el-progress>
              </td>
          </tr>
          <tr>
            <td class="key">开启服务级别</td>
            <td class="number">
                <p v-if="(result.SERVICE_LEVEL&1)>0">searcher service</p>
                <p v-if="(result.SERVICE_LEVEL&2)>0">writer service</p>
                <p v-if="(result.SERVICE_LEVEL&4)>0">http-reader service</p>
                <p v-if="(result.SERVICE_LEVEL&8)>0">instruction service</p>
            </td>
          </tr>
          <tr>
            <td class="key">集群管理</td>
              <td class="number">
                <a v-on:click="handleNode(result.NODE_ID,'restartNode')" type="button" class="el-button el-button--success">重启节点</a>
                <a v-on:click="handleCluster('restartCluster')" type="button" class="el-button el-button--primary">重启集群</a>
                <a v-on:click="handleCluster('stopCluster')" type="button" class="el-button el-button--info">停止集群</a>
              </td>
          </tr>
          <tr v-if="this.result.SLAVES && Object.keys(this.result.SLAVES).length > 0" style="background:rgb(221 241 240);text-align:center;font-weight:bold"><td colspan="2" ><i class="el-icon-set-up"></i> 集群从节点</td></tr>
          <tr v-for="(obj, ip) in result.SLAVES" :key="ip">
                <td class="key">{{ ip }}</td>
                <td class="slaves">
                  <tr>
                    <td class="key2" style="width:120px">节点ID</td>
                    <td class="number" style="width:90%">{{ obj.NODE_ID }}</td>
                  </tr>
                  <tr>
                    <td class="key2" style="width:120px">实例数</td>
                    <td class="number" style="width:90%">{{ obj.TASKS }}</td>
                  </tr>
                  <tr>
                    <td class="key2">线程使用率</td>
                    <td class="number">
                      <el-progress
                        v-if="obj.THREAD_POOL_SIZE"
                        :percentage="Number((obj.THREAD_ACTIVE_COUNT / obj.THREAD_POOL_SIZE * 100).toFixed(1))"
                        :class="progressStatus(Number((obj.THREAD_ACTIVE_COUNT / obj.THREAD_POOL_SIZE * 100).toFixed(1)))"
                      ></el-progress>
                    </td>
                  </tr>
                  <tr>
                    <td class="key2">内存使用率</td>
                    <td class="number">
                      <el-progress
                        v-if="obj.MEMORY_USAGE"
                        :percentage="obj.MEMORY_USAGE"
                        :class="progressStatus(obj.MEMORY_USAGE)"
                      ></el-progress>
                    </td>
                  </tr>
                  <tr>
                    <td class="key2">CPU使用率</td>
                    <td class="number">
                          <el-progress
                           v-if="obj.CPU_USAGE"
                          :percentage="obj.CPU_USAGE"
                        :class="progressStatus(obj.CPU_USAGE)"
                        ></el-progress>
                     </td>
                  </tr>
                  <tr>
                    <td class="key2">系统线程配置数</td>
                    <td class="number">
                      {{ obj.SYS_THREAD_POOL_SIZE }}
                    </td>
                  </tr>
                  <tr>
                    <td class="key2">系统版本</td>
                    <td class="string">{{ obj.VERSION }}</td>
                  </tr>
                  <tr>
                    <td class="key2">开启批量写</td>
                    <td class="boolean">{{ obj.WRITE_BATCH }}</td>
                  </tr>
                  <tr>
                     <td class="key2">节点管理</td>
                     <td class="boolean">
                      <a type="button" v-on:click="handleNode(obj.NODE_ID,'restartNode')" class="el-button el-button--success is-round">重启</a>
                      <a type="button" v-on:click="handleNode(obj.NODE_ID,'stopNode')" class="el-button el-button--info is-round">停止</a>
                    </td>
                  </tr>
                </td>
            </tr>
        </tbody>
      </table>
    </el-card>
    <!-- <pre v-html="syntaxHighlight(result)"></pre> -->
  </div>
</template>

<script>
import basicApi from '@/request/api/basic'

export default {
  data () {
    return {
      result: null
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
    handleNode (node_id,acmethod) {
      this.$confirm('节点是否执行操作'+acmethod+'？', '提示', {
        type: 'warning'
      }).then(() => {
        basicApi.efm_doaction({
          ac:acmethod,
          node_id:node_id
        }).then(res => {
          this.$process_state(this,"节点重启成功！",res)
        })
      })
    },
    handleCluster (acmethod) {
      this.$confirm('集群是否执行操作'+acmethod+'？', '提示', {
        type: 'warning'
      }).then(() => {
        basicApi.efm_doaction({
          ac:acmethod
        }).then(res => {
          this.$process_state(this,"集群重启成功！",res)
        })
      })
    },
    getStatus () {
      basicApi.efm_doaction({
        ac: 'getstatus'
      }).then(res => {
        this.result = res.response.datas
      })
    },
    syntaxHighlight (json) {
      if (typeof json !== 'string') {
        json = JSON.stringify(json, undefined, 2)
      }
      json = json.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>')
      return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
        function (match) {
          var cls = 'number'
          if (/^"/.test(match)) {
            if (/:$/.test(match)) {
              cls = 'key'
            } else {
              cls = 'string'
            }
          } else if (/true|false/.test(match)) {
            cls = 'boolean'
          } else if (/null/.test(match)) {
            cls = 'null'
          }
          return '<span class="' + cls + '">' + match + '</span>'
        }
      )
    }
  },
  created () {
    this.getStatus()
  }
}
</script>

<style lang="scss" scoped>
.clusterStatus {
  border-collapse: collapse;
  width: 100%;
  // border: 1px solid #ccc;
  tr {
    &:nth-child(odd) {
      background: #FAFAFA;
      td.slaves tr {
        background: #FAFAFA;
        &:nth-child(odd) {
          background: white;
        }
      }
    }
    &:nth-child(even) {
      background: white;
      td.slaves tr {
        background: white;
        &:nth-child(even) {
          background: #FAFAFA;
        }
      }
    }
    td {
      padding: 10px 12px;
      ::v-deep .el-progress {
        width: 200px;
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
  }
}
</style>
