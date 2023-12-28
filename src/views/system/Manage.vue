<template>
  <div>
    <codemirror
      v-model="code"
:options="cmOptions"
  ></codemirror>
  <div class="flex flex-center" style="margin-top: 16px">
  <el-button @click="handleEdit" type="primary">更新配置</el-button>
  </div>
  </div>
  </template>

  <script>
import basicApi from '@/request/api/basic'
import { Base64 } from '@/utils/Base64'

export default {
  data () {
    return {
      tableData: [],
      code: '',
      cmOptions: {
        tabSize: 4,
        mode: 'text/xml',
        theme: 'paraiso-light',
        lineNumbers: true,
        line: true,
        matchBrackets: true
      }
    }
  },
  methods: {
    getXML () {
      basicApi.efm_doaction({
        ac: 'getNodeConfigContent'
      }).then(res => {
        let data = res.response.datas
        this.code = typeof data === 'string' ? data : ''
      })
    },
    handleEdit () {
      let base64 = new Base64()
      basicApi.efm_doaction_post({
        ac: 'updateNodeConfigContent',
        content: base64.encode(this.code)
      }).then(res => {
        this.$notify({
          title: '成功',
          message: '保存成功',
          type: 'success',
          duration: 6000
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
