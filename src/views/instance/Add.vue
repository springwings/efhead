<template>
  <el-card >
  <div style="font-weight:bold;font-size:18px;margin-bottom: 20px;padding-bottom: 15px;border-bottom: solid 1px #dedede;">
    <router-link to="/instances" class="router-link-exact-active router-link-active">实例管理</router-link> > 添加实例
  </div>
  <div>
    <el-form ref="taskForm" label-width="120px" :model="formData" :rules="formRules">
      <el-form-item label="实例名称" prop="instance" class="task_label">
        <el-input v-model="formData.instance" clearable placeholder="请输入实例名称，非中文"></el-input>
      </el-form-item>
      <el-form-item label="实例运行类型" prop="level" class="task_label">
        <el-checkbox-group @change="handleLevel" v-model="formData.level" class="task_type">
          <el-checkbox :label="0">Blank</el-checkbox>
          <el-checkbox :label="1">开启读写</el-checkbox>
          <el-checkbox :disabled="levelDisabled" :label="2">开启计算</el-checkbox>
        </el-checkbox-group>
        <el-button type="primary" :loading="loading" @click="handleSubmit" class="task_add">添加实例</el-button>
      </el-form-item>
      <form label="Content" prop="content">
        <codemirror v-model="formData.content" :options="cmOptions" ></codemirror>
      </form>
  </el-form-item>
  </el-form>
  </div>
  </el-card >
</template>

<script>
import basicApi from '@/request/api/basic'
import { Base64 } from '@/utils/Base64'

export default {
  data () {
    return {
      formData: {
        instance: '',
        level: [],
        content: ''
      },
      formRules: {
        instance: [
          {
            required: true,
            message: '请输入实例名称',
            trigger: 'blur'
          }
        ],
        level: [
          {
            required: true,
            message: '请选择实例运行类型',
            type: 'array',
            trigger: 'change'
          }
        ],
        content: [
          {
            required: true,
            message: '请输入实例信息',
            trigger: 'blur'
          }
        ]
      },
      cmOptions: {
        tabSize: 4,
        mode: 'text/xml',
        theme: 'paraiso-light',
        lineNumbers: true,
        line: true,
        matchBrackets: true,
        lineWrapping: true
      },
      levelDisabled: true,
      loading: false
    }
  },
  created () {
    this.getXML()
  },
  methods: {
    handleLevel () {
      if (this.formData.level.find(item => item === 1)) {
        this.levelDisabled = false
      } else {
        this.levelDisabled = true
        this.formData.level.forEach((item, index) => {
          if (item === 2) {
            this.formData.level.splice(index, 1)
          }
        })
      }
    },
    getXML () {
      fetch('contents/task.xml').then(res => res.text()).then(res => {
        this.formData.content = res
      })
    },
    handleSubmit () {
      this.$refs.taskForm.validate(value => {
        if (!value) return
        this.loading = true
        let base64 = new Base64()
        let data = Object.assign({
          ac: 'addInstance'
        }, this.formData)
        data.level = data.level.reduce((sum, num) => {
          return sum + num
        })
        data.content = base64.encode(data.content)
        basicApi.efm_doaction_post(data).then(res => {
          this.$process_state(this,"添加任务成功！",res)
          setTimeout(() => {
            this.$router.push('/taskList')
          }, 9000)
        }).finally(() => {
          this.loading = false
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .CodeMirror {
  height: 550px;
  border: 1px solid #eee;
  line-height: 28px;
  background: repeating-linear-gradient(
    to bottom,
    transparent,
    transparent 28px,
    rgba(0, 0, 0, 0.1) 28px,
    rgba(0, 0, 0, 0.1) 29px
);
}
.task_label{
  font-weight: bold;
}
.task_add{
  float: right;
  width: 150px;
}
.task_type{
  float: left;
}
</style>
