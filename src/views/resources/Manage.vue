<template>
  <div>
    <codemirror
      v-model="code"
      :options="cmOptions"
    ></codemirror>
    <div class="flex flex-center" style="margin-top: 16px">
      <el-button @click="handleEdit" type="primary">保存</el-button>
    </div>
  </div>
</template>

<script>
import taskApi from '@/request/api/task'
import { Base64 } from '@/utils/Base64'

export default {
  data () {
    return {
      tableData: [],
      code: '',
      cmOptions: {
        tabSize: 4,
        mode: 'text/xml',
        theme: 'ayu-dark',
        lineNumbers: true,
        line: true,
        matchBrackets: true
      }
    }
  },
  methods: {
    getXML () {
      taskApi.efm_doaction({
        ac: 'getResource'
      }).then(res => {
        let data = res.response.datas
        this.code = typeof data === 'string' ? data : ''
      })
    },
    handleEdit () {
      let base64 = new Base64()
      taskApi.efm_doaction_post({
        ac: 'updateResource',
        content: base64.encode(this.code)
      }).then(res => {
        this.$notify({
          title: '成功',
          message: '保存成功',
          type: 'success',
          duration: 2000
        })
      })
    }
  },
  created () {
    this.getXML()
  }
}
</script>

<style lang="scss" scoped>
::v-deep .CodeMirror {
  height: 800px;
}
</style>
