<template>
  <el-card>
  <div style="float:left;font-weight:bold;font-size:18px">
     <router-link to="/resourcesStatus" class="router-link-exact-active router-link-active">资源配置</router-link> > resource.xml
  </div>
  <div class="flex flex-right">
    <el-button @click="handleEdit" style="width:150px" type="primary">更新资源</el-button>
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
        mode: 'text/xml',
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
        ac: 'getResourcexml'
      }).then(res => {
        let data = res.response.datas
        this.code = typeof data === 'string' ? data : ''
      })
    },
    handleEdit () {
      let base64 = new Base64()
      basicApi.efm_doaction_post({
        ac: 'updateResource',
        content: base64.encode(this.code)
      }).then(res => {
        this.$process_state(this,'保存资源配置成功！',res)
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
