<template>
  <el-card>
  <div style="float:left;font-weight:bold;font-size:18px">
    <router-link to="/systemLogs">日志跟踪</router-link> > <label>{{track_type}}</label>
  </div>
  <div class="flex flex-right">
    <el-input style="width: 100px" placeholder="返回日志行数" v-model="log_lines" clearable :maxlength="12"></el-input>
     <el-select style="width: 300px" placeholder="请选择节点IP,默认主节点" v-model="ip" clearable>
        <el-option v-for="ip in hosts"  :key="ip"  :label="ip"  :value="ip"></el-option>
     </el-select>
   <el-button  @click="startLogPolling" style="width:150px" type="primary">节点实时日志</el-button>
    <el-button  @click="handleError" style="width:150px" type="warning">节点错误日志</el-button>
    <el-link  @click="clearlog" style="width:150px" type="el-link--danger">清理节点日志</el-link>
  </div>
  </div>
  <div style="border:solid 1px #ccc;margin-top:20px;padding-bottom:10px;position: relative;background: #f3f3f3;">
    <codemirror v-model="code" :options="cmOptions" style="margin-top:10px;" ref="codeMirror" @scroll="handleScroll"></codemirror>
  </div>
  </el-card >
  </template>

<script>
import CodeMirror from 'codemirror';
import basicApi from '@/request/api/basic'
import { Base64 } from '@/utils/Base64'
import 'codemirror/theme/eclipse.css'

CodeMirror.defineMode('custom', function() {
  return {
    token: function(stream, state) {
      if (stream.match(/(?:\b|\W)(INFO|alias)(?:\b|\W)/i)) {
        return 'info';
      }
      if (stream.match(/(?:\b|\W)(SUCCESS|true)(?:\b|\W)/i)) {
        return 'success';
      }
      if (stream.match(/(?:\b|\W)(WARN|warning|false)(?:\b|\W)/i)) {
        return 'warn';
      }
      if (stream.match(/(?:\b|\W)(ERROR|efexception|exception|failed)(?:\b|\W)/i)) {
        return 'error';
      }
      if (stream.match(/(?:\b|\W)(None)(?:\b|\W)/i)) {
        return 'unexpect';
      }
      stream.next();
      return null;
    }
  };
});

CodeMirror.defineMIME('text/x-custom', 'custom');

export default {
  data () {
    return {
      log_lines: 300,
      code: '',
      errorlogfile: false,
      track_type: "节点实时日志",
      hosts:[],
      ip: '',
      autofresh: true,
      cmOptions: {
        tabSize: 4,
        mode: 'text/x-custom',
        theme: 'eclipse',
        lineNumbers: true,
        line: true,
        matchBrackets: true,
        lineWrapping: true,
      }
    }
  },
  methods: {
    gethosts() {
      basicApi.efm_doaction({
        ac: 'getHosts'
      }).then(res => {
        let data = res.response.datas
        this.hosts = data
      })
    },
    clearlog () {
      this.$confirm('是否清理 '+ this.ip+' '+ this.track_type, '提示', {
        type: 'warning'
      }).then(() => {
        this.loading = true;
        this.code = "";
        basicApi.efm_doaction({
            ac: 'clearLog',
              errorlogfile: this.errorlogfile,
              ip: this.ip,
          }).then(res => {
          this.loading = false;
          this.$process_state(this,'清理 '+ this.ip+' 节点日志成功!',res)
          })
        })
        },
    handleError () {
      this.code = "";
      this.errorlogfile = true;
      this.autofresh = false;
      this.track_type = "节点错误日志"
      this.stopLogPolling();
      basicApi.efm_doaction({
        ac: 'getErrorLog'
      }).then(res => {
        this.code = res.response.datas
        if(this.code == ""){
          this.code = "没有错误日志！"
        }
      })
    },
    handleLogs () {
      basicApi.efm_doaction({
        ac: 'getSystemLog',
        lines:this.log_lines,
        ip:this.ip,
      }).then(res => {
        this.code = res.response.datas
        if(this.code == ""){
          this.code = "没有节点实时日志！"
        }
        this.$nextTick(() => {
          const cmInstance = this.$refs.codeMirror.codemirror;
          if (cmInstance) {
            const scrollInfo = cmInstance.getScrollInfo();
            cmInstance.scrollTo(null, scrollInfo.height);
          }
        });
      })
    },
    startLogPolling() {
      this.errorlogfile = false;
      this.track_type = "节点实时日志"
      this.autofresh = true;
      this.stopLogPolling();
      this.intervalId = setInterval(() => {
        this.handleLogs();
      }, 800);
    },
   stopLogPolling() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  },
    handleScroll() {
      const cmInstance = this.$refs.codeMirror.codemirror;
      const scrollInfo = cmInstance.getScrollInfo();
      const scrollTop = scrollInfo.top;
      const scrollHeight = scrollInfo.height;
      const clientHeight = scrollInfo.clientHeight;

      if (this.autofresh && (scrollTop + clientHeight >= scrollHeight - 5)) { // Near bottom
        this.startLogPolling();
      } else {
        this.stopLogPolling();
      }
    }
  },
  beforeDestroy() {
    this.stopLogPolling();
  },
  created () {
    this.gethosts(),
    this.startLogPolling()
  }
}
</script>

<style lang="scss" scoped>
::v-deep .CodeMirror {
  height: 600px;background: #ddffe5;
}
::v-deep .CodeMirror .cm-success {
  color: #18ed93;
}
::v-deep .CodeMirror .cm-info {
  color: #54d5ed;
}
::v-deep .CodeMirror .cm-warn {
  color: #dedc12;
}
::v-deep .CodeMirror .cm-error {
  color: #ff6060;
}
::v-deep .CodeMirror .cm-unexpect {
  color: #ff4dff;
}
</style>
