<template>
  <div>
      <el-form class="taskForm" inline :model="search">
        <el-form-item label="" prop="instance">
          <el-input style="width: 300px" @keyup.native.enter="handleSearch" placeholder="请输入实例名称" @clear="handleSearch" v-model="search.Instance" clearable :maxlength="32"></el-input>
        </el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </el-form>
      <el-table stripe :header-cell-style="{ background: '#ddd', color: '#333' }" :data="tableData.slice((page.index - 1) * page.size, page.size * page.index)" border>
        <el-table-column prop="Instance" label="Instance"></el-table-column>
        <el-table-column prop="Alias" label="Alias"></el-table-column>
        <el-table-column prop="FullCron" label="FullCron"></el-table-column>
        <el-table-column prop="DeltaCron" label="DeltaCron"></el-table-column>
        <el-table-column prop="ReadFrom" label="ReadFrom"></el-table-column>
        <el-table-column prop="WriteTo" label="WriteTo"></el-table-column>
        <el-table-column prop="SearchFrom" label="SearchFrom"></el-table-column>
        <el-table-column prop="InstanceType" width="160px" label="InstanceType"></el-table-column>
        <el-table-column prop="IsVirtualPipe" label="IsVirtualPipe">
            <template slot-scope="{ row }">
              <div>{{ row.IsVirtualPipe }}</div>
            </template>
        </el-table-column>
        <el-table-column prop="OpenTrans" label="OpenTrans">
          <template slot-scope="{ row }">
            <div>{{ row.OpenTrans }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="" label="">
          <template slot-scope="{ row }">
            <div class="flex flex-around">
              <el-popover trigger="click">
                <el-button type="text" slot="reference">信息</el-button>
                <ul>
                  <el-dropdown-item @click.native="handleStatus(row)">任务状态</el-dropdown-item>
                  <el-dropdown-item @click.native="handleDetail(row)">任务信息</el-dropdown-item>
                  <el-dropdown-item @click.native="handleConfig(row)">任务配置</el-dropdown-item>
                </ul>
              </el-popover>
              <el-popover trigger="click">
                <el-button type="text" slot="reference">管理</el-button>
                <ul>
                  <el-dropdown-item @click.native="handleStop(row)">停止增量任务</el-dropdown-item>
                  <el-dropdown-item @click.native="handleResume(row)">恢复增量任务</el-dropdown-item>
                  <el-dropdown-item @click.native="handleRun(row)">立即运行增量任务</el-dropdown-item>
                  <el-dropdown-item @click.native="handleStopFull(row)">停止全量任务</el-dropdown-item>
                  <el-dropdown-item @click.native="handleResumeFull(row)">恢复全量任务</el-dropdown-item>
                  <el-dropdown-item @click.native="handleRunFull(row)">立即运行全量任务</el-dropdown-item>
                  <el-dropdown-item @click.native="handleDelete(row)">删除任务</el-dropdown-item>
                  <el-dropdown-item @click.native="handleDeleteData(row)">删除任务数据</el-dropdown-item>
                  <el-dropdown-item @click.native="handleResetTask(row)">重置任务状态</el-dropdown-item>
                  <el-dropdown-item @click.native="handleReset(row)">重置断路器</el-dropdown-item>
                </ul>
              </el-popover>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="page">
        <el-pagination
          @size-change="handlePageSize"
          @current-change="handlePageIndex"
          :current-page="page.index"
          :page-size="page.size"
          layout="total, sizes, prev, pager, next, jumper"
          :total="page.total"
          background>
        </el-pagination>
      </div>
    <el-dialog :title="dialogTitle" :visible.sync="visible" :close-on-click-modal="false">
      <code>
        <pre v-html="detail"></pre>
      </code>
    </el-dialog>
    <el-dialog title="任务配置" :visible.sync="showXML" :close-on-click-modal="false">
      <codemirror
        v-model="code"
        :options="cmOptions"
      ></codemirror>
    </el-dialog>
  </div>
</template>

<script>
import taskApi from '@/request/api/task'

export default {
  data () {
    return {
      code: '',
      showXML: false,
      tableData: [],
      cmOptions: {
        tabSize: 4,
        mode: 'text/xml',
        theme: 'ayu-dark',
        lineNumbers: true,
        line: true,
        readOnly: true,
        matchBrackets: true
      },
      originData: [],
      search: {
        Instance: ''
      },
      visible: false,
      page: {
        index: 1,
        size: 10,
        total: 0
      },
      detail: '',
      dialogTitle: ''
    }
  },
  methods: {
    handlePageSize (num) {
      this.page.index = 1
      this.page.size = num
    },
    handlePageIndex (num) {
      this.page.index = num
    },
    handleResetTask (row) {
      this.$confirm('是否重置该任务状态？', '提示', {
        type: 'warning'
      }).then(() => {
        taskApi.efm_doaction({
          ac: 'resetInstanceState',
          instance: row.Instance
        }).then(res => {
          this.$notify({
            title: '成功',
            message: '重置成功',
            duration: 2000
          })
        })
      })
    },
    handleReset (row) {
          this.$confirm('是否重置该任务断路器？', '提示', {
            type: 'warning'
          }).then(() => {
            taskApi.efm_doaction({
              ac: 'resetBreaker',
              instance: row.Instance
            }).then(res => {
              this.$notify({
                title: '成功',
                message: '重置成功',
                duration: 2000
              })
            })
          })
        },
    handleStatus (row) {
      this.dialogTitle = '任务状态'
      taskApi.efm_doaction({
        ac: 'getInstanceInfo',
        instance: row.Instance
      }).then(res => {
        let data = res.response.datas
        let result = {
          task: data.task
        }
        this.detail = this.syntaxHighlight(result)
        this.visible = true
      })
    },
    handleDetail (row) {
      this.dialogTitle = '任务信息'
      taskApi.efm_doaction({
        ac: 'getInstanceInfo',
        instance: row.Instance
      }).then(res => {
        let data = res.response.datas
        let result = {
          computer: data.computer,
          reader: data.reader,
          writer: data.writer
        }
        this.detail = this.syntaxHighlight(result)
        this.visible = true
      })
    },
    handleDeleteData (row) {
      this.$confirm('是否删除该任务数据？', '提示', {
        type: 'warning'
      }).then(() => {
        taskApi.efm_doaction({
          ac: 'deleteInstanceData',
          instance: row.Instance
        }).then(res => {
          this.$notify({
            title: '成功',
            message: '删除成功',
            duration: 2000
          })
        })
      })
    },
    handleDelete (row) {
        this.$confirm('是否删除该任务？', '提示', {
            type: 'warning'
          }).then(() => {
            taskApi.efm_doaction({
              ac: 'removeInstance',
              instance: row.Instance
            }).then(res => {
              this.$notify({
                title: '成功',
                message: '删除成功',
                duration: 2000
              })
            })
          })
        },
    handleRun (row) {
      taskApi.efm_doaction({
        ac: 'runNow',
        instance: row.Instance,
        jobtype: 'increment'
      }).then(res => {
        this.$notify({
          title: '成功',
          message: '运行增量任务成功',
          type: 'success',
          duration: 2000
        })
      })
    },
    handleRunFull (row) {
      taskApi.efm_doaction({
        ac: 'runNow',
        instance: row.Instance,
        jobtype: 'full'
      }).then(res => {
        this.$notify({
          title: '成功',
          message: '运行全量任务成功',
          type: 'success',
          duration: 2000
        })
      })
    },
    handleResume (row) {
      taskApi.efm_doaction({
        ac: 'resumeInstance',
        instance: row.Instance,
        type: 'increment'
      }).then(res => {
        this.$notify({
          title: '成功',
          message: '恢复增量任务成功',
          type: 'success',
          duration: 2000
        })
      })
    },
    handleResumeFull (row) {
      taskApi.efm_doaction({
        ac: 'resumeInstance',
        instance: row.Instance,
        type: 'full'
      }).then(res => {
        this.$notify({
          title: '成功',
          message: '恢复全量任务成功',
          type: 'success',
          duration: 2000
        })
      })
    },
    handleStop (row) {
      taskApi.efm_doaction({
        ac: 'stopInstance',
        instance: row.Instance,
        type: 'increment'
      }).then(res => {
        this.$notify({
          title: '成功',
          message: '停止增量任务成功',
          type: 'success',
          duration: 2000
        })
      })
    },
    handleStopFull (row) {
      taskApi.efm_doaction({
        ac: 'stopInstance',
        instance: row.Instance,
        type: 'full'
      }).then(res => {
        this.$notify({
          title: '成功',
          message: '停止全量任务成功',
          type: 'success',
          duration: 2000
        })
      })
    },
    handleSearch () {
      let data = []
      this.originData.filter(item => {
        // console.log(item)
        for (let key in this.search) {
          if (item[key].indexOf(this.search[key]) !== -1) {
            data.push(item)
          }
        }
      })
      this.tableData = data
      this.page.total = data.length
    },
    handleConfig (row) {
      taskApi.efm_doaction({
        ac: 'getInstanceXml',
        instance: row.Instance
      }).then(res => {
        let data = res.response.datas
        this.code = typeof data === 'string' ? data : ''
        this.showXML = true
      })
    },
    getTaskList () {
      taskApi.efm_doaction({
        ac: 'getinstances'
      }).then(res => {
        let data = []
        Object.values(res.response.datas).forEach(item => {
          data = data.concat(item)
        })
        this.page.total = data.length
        this.tableData = Object.assign([], data)
        this.originData = Object.assign([], data)
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
    this.getTaskList()
  }
}
</script>

<style lang="scss" scoped>
::v-deep .CodeMirror {
  height: 800px;
}
::v-deep .el-table .cell {
  white-space: nowrap;
}
.taskForm {
  background: white;
  padding: 22px 50px 0 50px;
  margin-bottom: 15px;
}
</style>
