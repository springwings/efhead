<template>
  <div>
    <el-form ref="taskForm" label-width="90px" :model="formData" :rules="formRules">
      <el-form-item label="Instance" prop="instance">
        <el-input v-model="formData.instance" clearable placeholder="请输入"></el-input>
      </el-form-item>
      <el-form-item label="Level" prop="level">
        <el-checkbox-group @change="handleLevel" v-model="formData.level">
          <el-checkbox :label="0">Blank</el-checkbox>
          <el-checkbox :label="1">Trans</el-checkbox>
          <el-checkbox :disabled="levelDisabled" :label="2">WithCompute</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <form label="Content" prop="content">
        <codemirror
          v-model="formData.content"
          :options="cmOptions"
        ></codemirror>
      </el-form-item>
      <el-form-item label="">
        <el-button type="primary" :loading="loading" @click="handleSubmit">添加任务</el-button>
      </el-form-item>
    </form>
  </div>
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
            message: '请输入Instance',
            trigger: 'blur'
          }
        ],
        level: [
          {
            required: true,
            message: '请选择Level',
            type: 'array',
            trigger: 'change'
          }
        ],
        content: [
          {
            required: true,
            message: '请输入Content',
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
        matchBrackets: true
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
      fetch('xml/task.xml').then(res => res.text()).then(res => {
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
          this.$notify({
            title: '成功',
            message: '添加任务成功',
            type: 'success',
            duration: 6000
          })
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
  height: 600px;
}
</style>
