<template>
  <el-card>
  <div style="float:left;font-weight:bold;font-size:18px">
     <router-link to="/resourcesStatus" class="router-link-exact-active router-link-active">资源监控</router-link> > resource.xml 配置
  </div>
  <div class="flex flex-right">
    <el-button @click="handleEdit" style="width:150px" type="primary">更新资源配置</el-button>
  </div>
  <div >
    <codemirror v-model="code" :options="cmOptions" style="margin-top:10px;border:solid 1px #ccc;"></codemirror>
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
        this.getXML()
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
  line-height: 28px;
  background: repeating-linear-gradient(
    to bottom,
    transparent,
    transparent 28px,
    rgba(0, 0, 0, 0.1) 28px,
    rgba(0, 0, 0, 0.1) 29px
);
}
</style>
