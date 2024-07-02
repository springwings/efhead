<template>
  <div>
      <el-form class="taskForm" inline :model="search">
        <el-form-item label="" prop="instance">
          <el-input style="width: 300px" @keyup.native.enter="handleSearch" placeholder="请输入实例名称" @clear="handleSearch" v-model="search.Instance" clearable :maxlength="32"></el-input>
        </el-form-item>
        <el-button type="primary" @click="handleSearch" style="width: 120px">搜索</el-button>
        <router-link style="float:right" to="/addInstance" class="el-button el-button--success">添加实例</router-link>
      </el-form>
      <el-table v-loading="loading" stripe :header-cell-style="{ background: '#ddd', color: '#333' }" :data="tableData.slice((page.index - 1) * page.size, page.size * page.index)" border>
        <el-table-column prop="Instance" label="实例名称" :min-width="150" show-overflow-tooltip></el-table-column>
        <el-table-column prop="Remark" label="说明" show-overflow-tooltip></el-table-column>
        <el-table-column prop="Alias" label="实例别名" show-overflow-tooltip></el-table-column>
        <el-table-column prop="FullCron" label="全量定时" show-overflow-tooltip></el-table-column>
        <el-table-column prop="DeltaCron" label="增量定时" show-overflow-tooltip></el-table-column>
        <el-table-column prop="ReadFrom" label="读取端" show-overflow-tooltip>
          <template slot-scope="{ row }">
             <el-button type="text" @click.native="searchResource(row.ReadFrom)">{{ row.ReadFrom }}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="WriteTo" label="写入端" show-overflow-tooltip>
        <template slot-scope="{ row }">
          <el-button type="text" @click.native="searchResource(row.WriteTo)">{{ row.WriteTo }}</el-button>
        </template>
        </el-table-column>
        <el-table-column prop="SearchFrom" label="搜索端" show-overflow-tooltip>
        <template slot-scope="{ row }">
          <el-button type="text" @click.native="searchResource(row.SearchFrom)">{{ row.SearchFrom }}</el-button>
        </template>
        </el-table-column>
        <el-table-column prop="IsVirtualPipe" label="虚实例">
            <template slot-scope="{ row }">
              <i v-if="row.IsVirtualPipe === true" class="el-isopen el-icon-size el-icon-success"></i>
                <i v-else class="el-isclose el-icon-size el-icon-error"> </i>
            </template>
        </el-table-column>
        <el-table-column prop="OpenTrans" label="读写">
          <template slot-scope="{ row }">
            <i v-if="row.OpenTrans === true" class="el-isopen el-icon-size el-icon-success"></i>
            <i v-else class="el-isclose el-icon-size el-icon-error"> </i>
          </template>
        </el-table-column>
        <el-table-column prop="OpenTrans" label="计算">
          <template slot-scope="{ row }">
            <i v-if="row.OpenCompute === true" class="el-isopen el-icon-size el-icon-success"></i>
            <i v-else class="el-isclose el-icon-size el-icon-error"> </i>
            </template>
        </el-table-column>
        <el-table-column prop="RunState" label="健康状态">
            <template slot-scope="{ row }">
              <i v-if="row.RunState === true" class="el-issuccess el-icon-size el-icon-check"></i>
            <i v-else class="el-isfailed el-icon-size el-icon-close"></i>
            </template>
        </el-table-column>
        <el-table-column prop="Manage" label="实例任务管理" :min-width="180">
          <template slot-scope="{ row }">
            <div class="flex flex-around">
              <el-popover trigger="click">
                <el-button slot="reference" type="success" >信息管理</el-button>
                <ul>
                  <el-dropdown-item @click.native="handleStatus(row)">实例状态</el-dropdown-item>
                  <el-dropdown-item @click.native="handleDetail(row)">统计信息</el-dropdown-item>
                  <el-dropdown-item @click.native="handleConfig(row)">配置实例</el-dropdown-item>
                  <el-dropdown-item @click.native="handleInstanceAnalyze(row)">分析报告</el-dropdown-item>
                  <el-dropdown-item @click.native="handleInstanceSearch(row)">数据查询</el-dropdown-item>
                  <el-dropdown-item @click.native="handleOpen(row)">搜索端状态</el-dropdown-item>
                </ul>
              </el-popover>
              <el-popover  trigger="click">
                <el-button slot="reference" type="primary" >实例控制</el-button>
                <ul>
                  <el-dropdown-item :disabled="buttonDisabled" @click.native="handleStop(row)">停止增量任务</el-dropdown-item>
                  <el-dropdown-item :disabled="buttonDisabled" @click.native="handleResume(row)">恢复增量任务</el-dropdown-item>
                  <el-dropdown-item :disabled="buttonDisabled" @click.native="handleRun(row)">立即运行增量任务</el-dropdown-item>
                  <el-dropdown-item :disabled="buttonDisabled" @click.native="handleStopFull(row)">停止全量任务</el-dropdown-item>
                  <el-dropdown-item :disabled="buttonDisabled" @click.native="handleResumeFull(row)">恢复全量任务</el-dropdown-item>
                  <el-dropdown-item :disabled="buttonDisabled" @click.native="handleRunFull(row)">立即运行全量任务</el-dropdown-item>
                  <el-dropdown-item :disabled="buttonDisabled" @click.native="handleResetTask(row)">重置任务状态</el-dropdown-item>
                  <el-dropdown-item :disabled="buttonDisabled" @click.native="handleDelete(row)">删除实例任务</el-dropdown-item>
                  <el-dropdown-item :disabled="buttonDisabled" @click.native="handleDeleteData(row)">删除实例数据</el-dropdown-item>
                  <el-dropdown-item :disabled="buttonDisabled" @click.native="handleReset(row)">重置断路器</el-dropdown-item>
                  <el-dropdown-item :disabled="buttonDisabled" @click.native="handleReload(row)">实例重载</el-dropdown-item>
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
    <el-dialog :top="dialogTop"  :title="dialogTitle" :visible.sync="visible" :close-on-click-modal="false">
        <pre class="dialog-content" v-html="detail"></pre>
    </el-dialog>
    <el-dialog :top="dialogTop" :title="dialogTitle" :visible.sync="showXML" :close-on-click-modal="false">
      <codemirror v-model="edit_instance.code" :options="cmOptions"></codemirror>
      <div class="flex flex-center" style="margin-top: 5px">
          <el-button @click="handleUpdateTask" type="primary">修改实例信息</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import basicApi from '@/request/api/basic'
import { Base64 } from '@/utils/Base64'

export default {
  data () {
    return {
      dialogTop: '5vh',
      edit_instance:{},
      showXML: false,
      tableData: [],
      cmOptions: {
        tabSize: 4,
        mode: 'text/xml',
        theme: 'paraiso-light',
        lineNumbers: true,
        line: true,
        matchBrackets: true,
        lineWrapping: true
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
      loading: true,
      buttonDisabled: false,
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
      this.$confirm('是否重置 '+row.Instance+' 该任务状态？', '提示', {
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
          this.$confirm('是否重置 '+row.Instance+' 该任务断路器？', '提示', {
            type: 'warning'
          }).then(() => {
            basicApi.efm_doaction({
              ac: 'resetBreaker',
              instance: row.Instance
            }).then(res => {
              this.$notify({
                title: '成功',
                message: '重置成功',
                type: 'success',
                duration: 15000
              })
            })
          })
        },
    handleUpdateTask(){
      let base64 = new Base64()
      basicApi.efm_doaction_post({
        ac: 'updateInstanceXml',
        content: base64.encode(this.edit_instance.code),
        instance:this.edit_instance.instance
      }).then(res => {
        this.edit_instance = {}
        this.showXML = false
        this.$notify({
          title: '成功',
          message: '保存成功',
          type: 'success',
          duration: 6000
        })
      })
    },
    handleStatus (row) {
      this.dialogTitle = row.Instance+' 实例状态'
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
      this.dialogTitle = row.Instance+ ' 实例信息'
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
    searchResource (resource) {
      this.dialogTitle = resource+ ' 资源信息'
      basicApi.efm_doaction({
        ac: 'getResource',
        name: resource
      }).then(res => {
        let data = res.response.datas
        this.detail = this.syntaxHighlight(data)
        this.visible = true
      })
    },
    handleDeleteData (row) {
      this.$confirm('是否删除 '+ row.Instance+' 该实例数据？', '提示', {
        type: 'warning'
      }).then(() => {
        this.loading = true;
        this.buttonDisabled = true;
        basicApi.efm_doaction({
          ac: 'deleteInstanceData',
          instance: row.Instance
        }).then(res => {
          this.loading = false;
          this.buttonDisabled = false;
          this.$notify({
            title: '成功',
            message: '删除 '+ row.Instance+' 实例数据成功!',
            duration: 15000
          })
        })
      })
    },
    handleDelete (row) {
        this.$confirm('是否删除 '+ row.Instance+' 该实例任务？', '提示', {
            type: 'warning'
          }).then(() => {
          this.loading = true;
          this.buttonDisabled = true;
          basicApi.efm_doaction({
              ac: 'removeInstance',
              instance: row.Instance
            }).then(res => {
            this.loading = false;
            this.buttonDisabled = false;
            this.$notify({
                title: '成功',
                message: '删除 '+ row.Instance+' 实例任务成功!',
                duration: 15000
              })
            })
          })
        },
    handleRun (row) {
      this.loading = true;
      this.buttonDisabled = true;
      basicApi.efm_doaction({
        ac: 'runNow',
        instance: row.Instance,
        jobtype: 'increment'
      }).then(res => {
        this.loading = false;
        this.buttonDisabled = false;
        this.$notify({
          title: '成功',
          message: '运行 '+ row.Instance+' 实例增量任务成功!',
          type: 'success',
          duration: 15000
        })
      })
    },
    handleReload (row) {
      this.$confirm('是否重载 '+ row.Instance+' 该实例？', '提示', {
        type: 'warning'
      }).then(() => {
      this.loading = true;
      this.buttonDisabled = true;
      basicApi.efm_doaction({
         ac: 'reloadinstance',
         instance: row.Instance,
         reset:'false',
         runtype: '-1'
       }).then(res => {
        this.loading = false;
        this.buttonDisabled = false;
         this.$notify({
           title: '成功',
           message: '实例 '+ row.Instance+' 重载成功!',
           type: 'success',
           duration: 30000
         })
       })
      })
    },
    handleRunFull (row) {
      this.loading = true;
      this.buttonDisabled = true;
      basicApi.efm_doaction({
        ac: 'runNow',
        instance: row.Instance,
        jobtype: 'full'
      }).then(res => {
        this.loading = false;
        this.buttonDisabled = false;
        this.$notify({
          title: '成功',
          message: '运行 '+ row.Instance+' 实例全量任务成功!',
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
          message: '恢复 '+ row.Instance+' 实例增量任务成功!',
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
          message: '恢复 '+ row.Instance+' 实例全量任务成功!',
          type: 'success',
          duration: 15000
        })
      })
    },
    handleStop (row) {
      this.loading = true;
      this.buttonDisabled = true;
      basicApi.efm_doaction({
        ac: 'stopInstance',
        instance: row.Instance,
        type: 'increment'
      }).then(res => {
        this.loading = false;
        this.buttonDisabled = false;
        this.$notify({
          title: '成功',
          message: '停止 '+ row.Instance+' 实例增量任务成功!',
          type: 'success',
          duration: 15000
        })
      })
    },
    handleStopFull (row) {
      this.loading = true;
      this.buttonDisabled = true;
      basicApi.efm_doaction({
        ac: 'stopInstance',
        instance: row.Instance,
        type: 'full'
      }).then(res => {
        this.loading = false;
        this.buttonDisabled = false;
        this.$notify({
          title: '成功',
          message: '停止 '+ row.Instance+' 实例全量任务成功!',
          type: 'success',
          duration: 30000
        })
      })
    },
    handleSearch () {
      let data = []
      this.originData.filter(item => {
        for (let key in this.search) {
          if (item[key].indexOf(this.search[key]) !== -1) {
            data.push(item)
          }
        }
      })
      this.tableData = data
      this.page.total = data.length
    },
    handleInstanceAnalyze(row){
      this.dialogTitle = row.Instance+' 实例分析报告'
      basicApi.efm_doaction({
        ac: 'analyzeInstance',
        instance: row.Instance
      }).then(res => {
        let data = res.response.datas
        this.detail = data
        this.visible = true
      })
    },
    handleOpen(row){
      window.open(row.QueryApi+"?count=1&__stats=true", '_blank');
    },
    handleInstanceSearch(row){
      this.dialogTitle = row.Instance+' 实例数据查询'
      basicApi.efm_doaction({
        ac: 'searchInstanceData',
        instance: row.Instance
      }).then(res => {
        let data = res.response.datas
        this.detail = this.syntaxHighlight(data)
        this.visible = true
      })
    },
    handleConfig (row) {
      this.dialogTitle = '修改 ' +row.Instance+' 实例配置'
      basicApi.efm_doaction({
        ac: 'getInstanceXml',
        instance: row.Instance
      }).then(res => {
        let data = res.response.datas
        this.edit_instance.code = typeof data === 'string' ? data : ''
        this.edit_instance.instance = row.Instance
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
  height: 550px;
}
::v-deep .el-table .cell {
  white-space: nowrap;
}
::v-deep pre{
  white-space: pre-wrap;
  word-wrap: break-word;
}
::v-deep b{
  color: #4aaba8;
}
::v-deep i{
  color: #f12e2e;
}
.dialog-content {
  overflow: auto;
  max-height:550px;
  line-height:25px;
}
::v-deep .track_error{
  background-color:#fff9f9;
  padding:2px 8px;
  font-size:12px;
}
::v-deep .el-dialog__body {
  padding: 5px 20px 30px;
}
::v-deep .el-dialog__body h1{
  font-size:15px;
  line-height:55px;
}
::v-deep .el-dialog__body li{
  list-style: square;
  line-height: 25px;
  padding-left: 14px;
}
.taskForm {
  background: white;
  padding: 22px 50px 0 50px;
  margin-bottom: 15px;
}
.padblock{
  padding:2px 5px;
}
.el-table .el-table__cell{
  padding:12px 5px;
}
.el-icon-size{
  font-size:20px;
}
.el-issuccess{
  color:#11a14c;
}
.el-isfailed{
  color:#c73a00;
}
.el-isopen{
  color:#5eb59e;
}
.el-isclose{
  color:#909399;
}
.cell .el-button{
  padding:6px 8px;
}

</style>
