<template>
  <el-card>
  <div style="font-weight:bold;font-size:18px">
  常见问题
  </div>
  <div>
    <codemirror v-model="datas" :options="cmOptions" style="margin-top:10px;border:solid 1px #ccc"></codemirror>
  </div>
  </el-card >
  </template>

  <script>
import basicApi from '@/request/api/basic'
import { Base64 } from '@/utils/Base64'

export default {
  data () {
    return {
      datas: '',
      cmOptions: {
        tabSize: 10,
        mode: 'text/html',
        theme: 'paraiso-light',
        lineNumbers: true,
        line: true,
        readOnly: true,
        matchBrackets: true,
        lineWrapping: true
      }
    }
  },
  methods: {
    getXML () {
      fetch('contents/help.txt').then(res => res.text()).then(res => {
        this.datas = res
      })
    },
  },
  created () {
    this.getXML()
  }
}
</script>

<style lang="scss" scoped>
::v-deep .CodeMirror {
  height:600px;
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
