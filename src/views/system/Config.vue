<template>
  <el-card>
    <div style="float:left;font-weight:bold;font-size:18px">
      <router-link to="/systemConfig">配置管理</router-link>  > {{this.fname}}
    </div>
    <div class="flex flex-right">
    <el-select style="width: 300px" @change="handleFile" placeholder="请选择配置文件,默认config.properties" v-model="fname" clearable>
       <el-option v-for="fname in configfiles"  :key="fname.key"  :label="fname.key"  :value="fname.value"></el-option>
    </el-select>
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
      configfiles: [{"key":"系统配置","value":"config.properties"},
        {"key":"日志配置","value":"log4j.properties"},
        {"key":"邮件配置","value":"mail.properties"}],
      fname: "config.properties",
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
    handleFile(){
      if (this.fname === "config.properties"){
        this.getXML()
      }else {
        basicApi.efm_doaction({
          ac: 'getPropertyFile',
          fname: this.fname
        }).then(res => {
          this.code = res.response.datas
        })
      }
    },
    handleEdit () {
      let base64 = new Base64()
      if (this.fname === "config.properties"){
        basicApi.efm_doaction_post({
          ac: 'updateNodeConfigContent',
          content: base64.encode(this.code)
        }).then(res => {
          this.$process_state(this,'保存 '+this.fname+' 配置成功！',res)
          this.getXML()
        })
      }else {
        basicApi.efm_doaction_post({
          ac: 'updatePropertyFile',
          fname: this.fname,
          content: base64.encode(this.code)
        }).then(res => {
          this.$process_state(this,'保存 '+this.fname+' 配置成功！',res)
        })
      }
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
