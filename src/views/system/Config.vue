<template>
  <el-card>
    <div style="float:left;font-weight:bold;font-size:18px">
       系统配置 > config.properties
    </div>
    <div class="flex flex-right">
        <el-button  @click="handleEdit" style="width:150px" type="primary">更新配置</el-button>
    </div>
  </div>
  <div style="border:solid 1px #ccc;margin-top:20px;">
    <codemirror v-model="code" :options="cmOptions" style="margin-top:10px;"></codemirror>
  </div>
  </el-card >
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
        mode: 'text/javascript',
        theme: 'paraiso-light',
        lineNumbers: true,
        line: true,
        matchBrackets: true,
        lineWrapping: true
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
  height: 600px;
}
</style>
