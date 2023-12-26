<template>
  <div>
    <el-card>
      <table class="clusterStatus" v-if="result">
        <tbody>
          <tr>
            <td class="key">NODE_IP</td>
            <td class="number">{{ result.NODE_IP }}</td>
          </tr>
          <tr>
          <td class="key">NODE_ID</td>
            <td class="number">{{ result.NODE_ID }}</td>
          </tr>
          <tr>
            <td class="key">NODE_TYPE</td>
            <td class="string">{{ result.NODE_TYPE }}</td>
          </tr>
          <tr>
            <td class="key">TASKS</td>
            <td class="number">{{ result.TASKS }}</td>
          </tr>
          <tr>
            <td class="key">STATUS</td>
            <td class="string">{{ result.STATUS }}</td>
          </tr>
          <tr>
            <td class="key">THREAD_ACTIVE_COUNT</td>
            <td class="number">
              <el-progress
                v-if="result.THREAD_POOL_SIZE && result.THREAD_ACTIVE_COUNT"
                :percentage="Number((result.THREAD_ACTIVE_COUNT / result.THREAD_POOL_SIZE * 100).toFixed(1))"
                :class="progressStatus(Number((result.THREAD_ACTIVE_COUNT / result.THREAD_POOL_SIZE * 100).toFixed(1)))"
              ></el-progress>
            </td>
          </tr>
          <tr>
            <td class="key">WRITE_BATCH</td>
            <td class="boolean">{{ result.WRITE_BATCH }}</td>
          </tr>
          <tr>
            <td class="key">VERSION</td>
            <td class="string">{{ result.VERSION }}</td>
          </tr>
          <tr>
            <td class="key">THREAD_POOL_SIZE</td>
            <td class="number">{{ result.THREAD_POOL_SIZE }}</td>
          </tr>
          <tr>
            <td class="key">DISTRIBUTE_RUN</td>
            <td class="boolean">{{ result.DISTRIBUTE_RUN }}</td>
          </tr>
          <tr>
            <td class="key">MEMORY_USAGE</td>
            <td class="number">
              <el-progress
                v-if="result.MEMORY_USAGE"
                :percentage="result.MEMORY_USAGE"
                :class="progressStatus(result.MEMORY_USAGE)"
              ></el-progress>
            </td>
          </tr>
          <tr>
              <td class="key">CPU_USAGE</td>
                <td class="number">
                <el-progress
                v-if="result.CPU_USAGE"
                :percentage="result.CPU_USAGE"
                :class="progressStatus(result.CPU_USAGE)"
              ></el-progress>
              </td>
          </tr>
          <tr>
            <td class="key">SERVICE_LEVEL</td>
            <td class="number">
                <p v-if="(result.SERVICE_LEVEL&1)>0">searcher service</p>
                <p v-if="(result.SERVICE_LEVEL&2)>0">writer service</p>
                <p v-if="(result.SERVICE_LEVEL&4)>0">http-reader service</p>
                <p v-if="(result.SERVICE_LEVEL&8)>0">instruction service</p>
            </td>
          </tr>
          <tr>
            <td class="key">Node Manage</td>
              <td class="number">
                <a v-on:click="handleNode(result.NODE_ID,'restartNode')" type="button" class="el-button el-button--success">重启节点</a>
                <a v-on:click="handleCluster('restartCluster')" type="button" class="el-button el-button--primary">重启集群</a>
                <a v-on:click="handleCluster('stopCluster')" type="button" class="el-button el-button--info">停止集群</a>
              </td>
          </tr>
          <tr v-if="this.result.SLAVES && Object.keys(this.result.SLAVES).length > 0" style="background:#cdcdcd;text-align:center;font-weight:bold"><td colspan="2">SLAVES</td></tr>
          <tr v-for="(obj, ip) in result.SLAVES" :key="ip">
                <td class="key">{{ ip }}</td>
                <td class="slaves">
                  <tr>
                    <td class="key2" style="width:120px">NODE_ID</td>
                    <td class="number" style="width:90%">{{ obj.NODE_ID }}</td>
                  </tr>
                  <tr>
                    <td class="key2" style="width:120px">TASKS</td>
                    <td class="number" style="width:90%">{{ obj.TASKS }}</td>
                  </tr>
                  <tr>
                    <td class="key2">THREAD_ACTIVE_COUNT</td>
                    <td class="number">
                      <el-progress
                        v-if="obj.THREAD_POOL_SIZE && obj.THREAD_ACTIVE_COUNT"
                        :percentage="Number((obj.THREAD_ACTIVE_COUNT / obj.THREAD_POOL_SIZE * 100).toFixed(1))"
                        :class="progressStatus(Number((obj.THREAD_ACTIVE_COUNT / obj.THREAD_POOL_SIZE * 100).toFixed(1)))"
                      ></el-progress>
                    </td>
                  </tr>
                  <tr>
                    <td class="key2">MEMORY_USAGE</td>
                    <td class="number">
                      <el-progress
                        v-if="obj.MEMORY_USAGE"
                        :percentage="obj.MEMORY_USAGE"
                        :class="progressStatus(obj.MEMORY_USAGE)"
                      ></el-progress>
                    </td>
                  </tr>
                  <tr>
                    <td class="key2">CPU_USAGE</td>
                    <td class="number">
                          <el-progress
                           v-if="obj.CPU_USAGE"
                          :percentage="obj.CPU_USAGE"
                        :class="progressStatus(obj.CPU_USAGE)"
                        ></el-progress>
                     </td>
                  </tr>
                  <tr>
                    <td class="key2">THREAD_POOL_SIZE</td>
                    <td class="number">
                      {{ obj.THREAD_POOL_SIZE }}
                    </td>
                  </tr>
                  <tr>
                    <td class="key2">VERSION</td>
                    <td class="string">{{ obj.VERSION }}</td>
                  </tr>
                  <tr>
                    <td class="key2">WRITE_BATCH</td>
                    <td class="boolean">{{ obj.WRITE_BATCH }}</td>
                  </tr>
                  <tr>
                     <td class="key2">Node Manage</td>
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
          this.$notify({
            title: '成功',
            message: '执行成功',
            duration: 15000
          })
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
          this.$notify({
            title: '成功',
            message: '执行成功',
            duration: 15000
          })
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
