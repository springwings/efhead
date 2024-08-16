<template>
  <div>
      <el-form class="taskForm" inline :model="search">
        <el-form-item label="" prop="instance">
          <el-input style="width: 300px" @keyup.native.enter="handleSearch" placeholder="请输入模块名称" @clear="handleSearch" v-model="search.name" clearable :maxlength="32"></el-input>
        </el-form-item>
        <el-button type="primary" @click="handleSearch" style="width: 120px">搜索</el-button>
      </el-form>
      <el-table v-loading="loading" stripe :header-cell-style="{ background: '#ddd', color: '#333' }" :data="tableData.slice((page.index - 1) * page.size, page.size * page.index)" border>
        <el-table-column prop="name" label="模块名称" show-overflow-tooltip></el-table-column>
        <el-table-column prop="desc" label="说明" show-overflow-tooltip></el-table-column>
        <el-table-column prop="readtype" label="读端类型" show-overflow-tooltip></el-table-column>
        <el-table-column prop="computetype" label="计算端类型" show-overflow-tooltip></el-table-column>
        <el-table-column prop="writetype" label="写端类型" show-overflow-tooltip></el-table-column>
        <el-table-column prop="path" label="模块路径" :min-width="150" show-overflow-tooltip></el-table-column>
        <el-table-column prop="opencompute" label="模块类型" show-overflow-tooltip>
            <template slot-scope="{ row }">
              <i v-if="row.opencompute === true" >读/写/计算</i>
              <i v-else>读/写</i>
            </template>
       </el-table-column>
        <el-table-column prop="enable" label="启用" show-overflow-tooltip>
            <template slot-scope="{ row }">
              <i v-if="row.enable === true" class="el-isopen el-icon-size el-icon-success"></i>
              <i v-else class="el-isclose el-icon-size el-icon-error"> </i>
            </template>
        </el-table-column>
        <el-table-column prop="Manage" label="模块管理" :min-width="150">
          <template slot-scope="{ row }">
            <el-button title="启用实例" v-if="row.enable === false" type="primary" @click.native="handleOpen(row)">启用</el-button>
            <el-button title="停止实例" v-if="row.enable === true" type="warning" @click.native="handleClose(row)">停止</el-button>
            <el-button title="修改模块配置" type="primary" @click.native="handleConfig(row)">修改</el-button>
            <el-button title="卸载模块" :disabled="row.enable === true" type="danger" @click.native="unload(row)">卸载</el-button>
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
        <el-form ref="instanceForm" label-width="120px" :model="formData" :rules="formRules">
            <el-form-item label="实例名称" prop="instancename" class="task_label">
                <el-input v-model="formData.instancename" clearable placeholder="请输入实例名称，非中文"></el-input>
            </el-form-item>
            <el-form-item label="读端" prop="readfrom" class="task_label">
              <el-select v-model="formData.readfrom" placeholder="请选择读端">
                <el-option
                  v-for="item in formData.readsource"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select> {{formData.row.readfrom}}
            </el-form-item>
            <el-form-item v-if="formData.row.opencompute === true" label="计算端" prop="compute" class="task_label">
                 <el-input v-model="formData.compute" clearable placeholder="请输入计算端"></el-input>{{formData.row.computeurl}}
          </el-form-item>
            <el-form-item label="写端" prop="writeto" class="task_label">
              <el-select v-model="formData.writeto" placeholder="请选择写端">
                <el-option
                  v-for="item in formData.writesource"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select> {{formData.row.writeto}}
            </el-form-item>
            <pre class="dialog-content" v-html="detail"></pre>
            <el-button type="primary" :loading="loading" @click="handleSubmit" class="task_add">启动实例</el-button>
         </el-form>
    </el-dialog>
  <el-dialog :top="dialogTop" :title="dialogTitle" :visible.sync="showXML" :close-on-click-modal="false">
    <codemirror v-model="edit_instance.code" :options="cmOptions"></codemirror>
      <div class="flex flex-center" style="margin-top: 5px">
        <el-button @click="handleUpdateModule" type="primary">修改模块信息</el-button>
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
        name: ''
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
      formData: {
        row: {},
        readsource: [],
        writesource: [],
        instancename: "",
        readfrom: "",
        writeto: "",
        compute: "",
      },
      formRules: {
        instancename: [
          {
            required: true,
            message: '请输入实例名称',
            trigger: 'blur'
          }
        ],
        compute: [
          {
            required: false,
          }
        ],
        readsource: [
          {
            required: true,
            message: '请选择读端',
            type: 'array',
            trigger: 'change'
          }
        ],
        writesource: [
          {
            required: true,
            message: '请选择写端',
            type: 'array',
            trigger: 'change'
          }
        ]
      },
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
    handleUpdateModule(){
      let base64 = new Base64()
      this.loading = true;
      basicApi.efm_doaction_post({
        ac: 'updateInstanceXml',
        content: base64.encode(this.edit_instance.code),
        instance:this.edit_instance.instance
      }).then(res => {
        this.edit_instance = {}
        this.showXML = false
        this.loading = false;
        this.$process_state(this,'保存 '+ this.edit_instance.instance+' 模块配置成功!',res)
      })
    },
    handleClose (row) {
      this.$confirm('是否关闭 '+ row.name+' 模块实例？', '提示', {
        type: 'warning'
      }).then(() => {
        this.loading = true;
        this.buttonDisabled = true;
        basicApi.efm_doaction({
          ac: 'removeInstance',
          instance: row.name
        }).then(res => {
          this.loading = false;
          this.buttonDisabled = false;
          this.$process_state(this,'关闭 '+ row.name+' 模块实例成功!',res)
          this.getModuleList ()
        })
      })
    },
    handleSubmit () {
      this.$refs.instanceForm.validate(value => {
        if (!value) return
        let base64 = new Base64()
        let data = Object.assign({
          ac: 'startModule'
        }, this.formData)
        data["module"] =  data.row.name
        delete data.row;
        delete data.readsource;
        delete data.writesource;
        basicApi.efm_doaction_post(data).then(res => {
          this.$process_state(this,'添加 '+data.row.name+' 实例任务成功!',res)
          this.getModuleList()
        })
      })
    },handleConfig (row) {
      this.dialogTitle = '修改 ' +row.name+' 模块配置'
      basicApi.efm_doaction({
        ac: 'getInstanceXml',
        instance: row.name
      }).then(res => {
        this.edit_instance.code = res.response.datas
        this.edit_instance.instance = row.name
        this.showXML = true
      })
    },
    unload (row) {
    this.$confirm('是否卸载 '+ row.name+' 模块(将清除该模块)？', '提示', {
      type: 'warning'
    }).then(() => {
      this.loading = true;
      this.buttonDisabled = true;
      basicApi.efm_doaction({
        ac: 'unloadModule',
        module: row.name
      }).then(res => {
        this.$process_state(this,'卸载 '+ row.name+' 模块成功!',res)
        this.getModuleList ()
        this.loading = false;
        this.buttonDisabled = false;
      })
    })
  },
    handleOpen (row) {
      this.formData.row = row
      this.formData.instancename = row.name
      this.dialogTitle = row.name+ '模块启用实例'
      this.detail = ""
      this.formData.readsource = []
      this.formData.writesource = []
      basicApi.efm_doaction({
        ac: 'getResources'
      }).then(res => {
        let datas = res.response.datas
        for (let val in datas) {
          if(row.readtype.length == 0 || row.readtype.includes(datas[val].type.toLowerCase())){
            this.formData.readsource.push({
              "label": val,
              "value": val
            })
          }
          if(row.writetype.length == 0 || row.writetype.includes(datas[val].type.toLowerCase())){
            this.formData.writesource.push({
              "label": val,
              "value": val
            })
          }
        }
        this.formData.readsource = this.formData.readsource.sort((a, b) => {
          return a.label.localeCompare(b.label);
        });

        this.formData.writesource = this.formData.writesource.sort((a, b) => {
          return a.label.localeCompare(b.label);
        });

        this.visible = true
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
    getModuleList () {
      basicApi.efm_doaction({
        ac: 'getModules'
      }).then(res => {
        let data = []
        Object.values(res.response.datas).forEach(item => {
          data = data.concat(item)
        })
        this.page.total = data.length
        const sortedData = data.sort((a, b) => {
          return a.name.localeCompare(b.name);
        });
        this.tableData = Object.assign([], sortedData)
        this.originData = Object.assign([], sortedData)
        this.loading = false
      })
    }
  },
  created () {
    this.getModuleList()
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
pre{
  white-space: pre-wrap;
}
.dialog-content {
  overflow: auto;
  max-height:550px;
  line-height:25px;
}
::v-deep .el-dialog__body {
  padding: 5px 20px 30px;
}
::v-deep .el-dialog__body h1{
  font-size:15px;
  line-height:35px;
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
.el-isopen{
  color:#11a14c;
}
.el-icon-close{
  color:#c73a00;
}
.cell .el-button{
  padding:6px 8px;
}
</style>
