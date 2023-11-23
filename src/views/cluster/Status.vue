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
            <td class="key">CPU</td>
            <td class="number">{{ result.CPU }}</td>
          </tr>
          <tr>
            <td class="key">MEMORY</td>
            <td class="number">
              <el-progress
                v-if="result.MEMORY"
                :percentage="result.MEMORY"
                :class="progressStatus(result.MEMORY)"
              ></el-progress>
            </td>
          </tr>
          <tr>
            <td class="key">SERVICE_LEVEL</td>
            <td class="number">{{ result.SERVICE_LEVEL }}</td>
          </tr>
          <tr v-if="result.SLAVES">
            <td class="key">SLAVES</td>
            <td>
              <tr v-for="(obj, ip) in result.SLAVES" :key="ip">
                <td class="key">{{ ip }}</td>
                <td class="slaves">
                  <tr>
                    <td class="key">TASKS</td>
                    <td class="number">{{ obj.TASKS }}</td>
                  </tr>
                  <tr>
                    <td class="key">THREAD_ACTIVE_COUNT</td>
                    <td class="number">
                      <el-progress
                        v-if="obj.THREAD_POOL_SIZE && obj.THREAD_ACTIVE_COUNT"
                        :percentage="Number((obj.THREAD_ACTIVE_COUNT / obj.THREAD_POOL_SIZE * 100).toFixed(1))"
                        :class="progressStatus(Number((obj.THREAD_ACTIVE_COUNT / obj.THREAD_POOL_SIZE * 100).toFixed(1)))"
                      ></el-progress>
                    </td>
                  </tr>
                  <tr>
                    <td class="key">MEMORY</td>
                    <td class="number">
                      <el-progress
                        v-if="obj.MEMORY"
                        :percentage="obj.MEMORY"
                        :class="progressStatus(obj.MEMORY)"
                      ></el-progress>
                    </td>
                  </tr>
                  <tr>
                    <td class="key">CPU</td>
                    <td class="number">{{ obj.CPU }}</td>
                  </tr>
                  <tr>
                    <td class="key">THREAD_POOL_SIZE</td>
                    <td class="number">
                      {{ obj.THREAD_POOL_SIZE }}
                    </td>
                  </tr>
                  <tr>
                    <td class="key">VERSION</td>
                    <td class="string">{{ obj.VERSION }}</td>
                  </tr>
                  <tr>
                    <td class="key">WRITE_BATCH</td>
                    <td class="boolean">{{ obj.WRITE_BATCH }}</td>
                  </tr>
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
import taskApi from '@/request/api/task'

export default {
  data () {
    return {
      result: null
    }
  },
  methods: {
    progressStatus (data) {
      if (data >= 80) {
        return 'exception'
      } else if (data >= 50) {
        return 'warning'
      } else {
        return 'success'
      }
    },
    getStatus () {
      taskApi.efm_doaction({
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
