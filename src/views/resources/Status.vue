<template>
  <div>
      <el-form class="taskForm" inline :model="search">
        <el-form-item label="" prop="name">
          <el-input style="width: 300px" @keyup.native.enter="handleSearch" placeholder="请输入资源名称" @clear="handleSearch" v-model="search.name" clearable :maxlength="32"></el-input>
        </el-form-item>
        <el-button type="primary" @click="handleSearch" style="width: 120px">搜索</el-button>
        <router-link to="/resourcesManage" style="float:right" class="el-button el-button--success">修改资源配置文件</router-link>
      </el-form>
      <el-table stripe :header-cell-style="{ background: '#ddd', color: '#333' }" :data="tableData.slice((page.index - 1) * page.size, page.size * page.index)" border>
        <el-table-column prop="name" label="资源名称" :min-width="120"></el-table-column>
        <el-table-column prop="remark" label="资源说明" show-overflow-tooltip></el-table-column>
        <el-table-column prop="type" label="资源类型"></el-table-column>
        <el-table-column prop="hosts" label="资源地址" :min-width="150" show-overflow-tooltip></el-table-column>
        <el-table-column prop="pools" label="资源池状态" :min-width="250" show-overflow-tooltip>
          <template slot-scope="{ row }">
            <div style="white-space: pre-wrap;" v-html=" syntaxHighlight(row.pools)"></div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="健康状态">
            <template slot-scope="{ row }">
              <i v-if="row.status !== Normal" class="el-button--success is-circle padblock">{{ row.status }}</i>
              <i v-else class="el-button--info is-circle padblock">{{ row.status }}</i>
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
    <el-dialog title="资源配置" :visible.sync="showXML" :close-on-click-modal="false">
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
        name: ''
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
    },
    handlePageIndex (num) {
      this.page.index = num
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
    getResourcesList () {
      basicApi.efm_doaction({
        ac: 'getResources'
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
    this.getResourcesList()
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
