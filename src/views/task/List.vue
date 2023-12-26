<template>
  <div>
      <el-form class="taskForm" inline :model="search">
        <el-form-item label="" prop="instance">
          <el-input style="width: 300px" @keyup.native.enter="handleSearch" placeholder="请输入实例名称" @clear="handleSearch" v-model="search.Instance" clearable :maxlength="32"></el-input>
        </el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </el-form>
      <el-table v-loading="loading" stripe :header-cell-style="{ background: '#ddd', color: '#333' }" :data="tableData.slice((page.index - 1) * page.size, page.size * page.index)" border>
        <el-table-column prop="Instance" label="实例名称" :min-width="150"></el-table-column>
        <el-table-column prop="Alias" label="实例别名"></el-table-column>
        <el-table-column prop="FullCron" label="全量定时"></el-table-column>
        <el-table-column prop="DeltaCron" label="增量定时"></el-table-column>
        <el-table-column prop="ReadFrom" label="读取端"></el-table-column>
        <el-table-column prop="WriteTo" label="写入端"></el-table-column>
        <el-table-column prop="SearchFrom" label="搜索端"></el-table-column>
        <el-table-column prop="IsVirtualPipe" label="虚任务">
            <template slot-scope="{ row }">
              <i v-if="row.IsVirtualPipe === true" class="el-button--success is-circle">{{ row.IsVirtualPipe }}</i>
              <i v-else class="el-button--info is-circle padblock">{{ row.IsVirtualPipe }}</i>
            </template>
        </el-table-column>
        <el-table-column prop="OpenTrans" label="读写开启">
          <template slot-scope="{ row }">
            <i v-if="row.OpenTrans === true" class="el-button--success is-circle padblock"> {{row.OpenTrans}} </i>
            <i v-else class="el-button--info is-circle padblock"> {{row.OpenTrans}} </i>
          </template>
        </el-table-column>
        <el-table-column prop="RunState" label="健康状态">
            <template slot-scope="{ row }">
              <i v-if="row.RunState === true" class="el-button--success is-circle padblock">{{ row.RunState }}</i>
            <i v-else class="el-button--info is-circle padblock">{{ row.RunState }}</i>
            </template>
        </el-table-column>
        <el-table-column prop="Manage" label="实例管理">
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
                  <el-dropdown-item @click.native="handleReload(row)">任务重载</el-dropdown-item>
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
import basicApi from '@/request/api/basic'

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
      dialogTitle: '',
      loading: true
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
        basicApi.efm_doaction({
          ac: 'resetInstanceState',
          instance: row.Instance
        }).then(res => {
          this.$notify({
            title: '成功',
            message: '重置成功',
            duration: 15000
          })
        })
      })
    },
    handleReset (row) {
          this.$confirm('是否重置该任务断路器？', '提示', {
            type: 'warning'
          }).then(() => {
            basicApi.efm_doaction({
              ac: 'resetBreaker',
              instance: row.Instance
            }).then(res => {
              this.$notify({
                title: '成功',
                message: '重置成功',
                duration: 15000
              })
            })
          })
        },
    handleStatus (row) {
      this.dialogTitle = '任务状态'
      basicApi.efm_doaction({
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
      basicApi.efm_doaction({
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
        basicApi.efm_doaction({
          ac: 'deleteInstanceData',
          instance: row.Instance
        }).then(res => {
          this.$notify({
            title: '成功',
            message: '删除成功',
            duration: 15000
          })
        })
      })
    },
    handleDelete (row) {
        this.$confirm('是否删除该任务？', '提示', {
            type: 'warning'
          }).then(() => {
          basicApi.efm_doaction({
              ac: 'removeInstance',
              instance: row.Instance
            }).then(res => {
              this.$notify({
                title: '成功',
                message: '删除成功',
                duration: 15000
              })
            })
          })
        },
    handleRun (row) {
      basicApi.efm_doaction({
        ac: 'runNow',
        instance: row.Instance,
        jobtype: 'increment'
      }).then(res => {
        this.$notify({
          title: '成功',
          message: '运行增量任务成功',
          type: 'success',
          duration: 15000
        })
      })
    },
    handleReload (row) {
      basicApi.efm_doaction({
         ac: 'reloadinstance',
         instance: row.Instance,
         reset:'false',
         runtype: '-1'
       }).then(res => {
         this.$notify({
           title: '成功',
           message: '任务重载成功',
           type: 'success',
           duration: 15000
         })
       })
     },
    handleRunFull (row) {
      basicApi.efm_doaction({
        ac: 'runNow',
        instance: row.Instance,
        jobtype: 'full'
      }).then(res => {
        this.$notify({
          title: '成功',
          message: '运行全量任务成功',
          type: 'success',
          duration: 15000
        })
      })
    },
    handleResume (row) {
      basicApi.efm_doaction({
        ac: 'resumeInstance',
        instance: row.Instance,
        type: 'increment'
      }).then(res => {
        this.$notify({
          title: '成功',
          message: '恢复增量任务成功',
          type: 'success',
          duration: 15000
        })
      })
    },
    handleResumeFull (row) {
      basicApi.efm_doaction({
        ac: 'resumeInstance',
        instance: row.Instance,
        type: 'full'
      }).then(res => {
        this.$notify({
          title: '成功',
          message: '恢复全量任务成功',
          type: 'success',
          duration: 15000
        })
      })
    },
    handleStop (row) {
      basicApi.efm_doaction({
        ac: 'stopInstance',
        instance: row.Instance,
        type: 'increment'
      }).then(res => {
        this.$notify({
          title: '成功',
          message: '停止增量任务成功',
          type: 'success',
          duration: 15000
        })
      })
    },
    handleStopFull (row) {
      basicApi.efm_doaction({
        ac: 'stopInstance',
        instance: row.Instance,
        type: 'full'
      }).then(res => {
        this.$notify({
          title: '成功',
          message: '停止全量任务成功',
          type: 'success',
          duration: 15000
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
      basicApi.efm_doaction({
        ac: 'getInstanceXml',
        instance: row.Instance
      }).then(res => {
        let data = res.response.datas
        this.code = typeof data === 'string' ? data : ''
        this.showXML = true
      })
    },
    getTaskList () {
      basicApi.efm_doaction({
        ac: 'getinstances'
      }).then(res => {
        let data = []
        Object.values(res.response.datas).forEach(item => {
          data = data.concat(item)
        })
        this.page.total = data.length
        this.tableData = Object.assign([], data)
        this.originData = Object.assign([], data)
        this.loading = false
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
.padblock{
  padding:2px 5px;
}
</style>
