import axios from 'axios'
import { stringify } from 'qs'
import { Message } from 'element-ui'

// 弹出框报错
const messageErr = function (srt) {
  Message({
    message: srt || '未知错误',
    type: 'error',
    showClose: true,
    duration: 15000
  })
}

const service = axios.create({
  withCredentials: true,
  baseURL: process.env.NODE_ENV === 'development' ? '/' : `${window.location.protocol}//${window.location.hostname}:8617`,
  timeout: 10 * 1000 // 超时时间
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    config.headers['X-Content-Type-Options'] = 'nosniff'
    config.headers['X-XSS-Protection'] = 1
    config.headers['Content-Security-Policy'] = 'self'
    return config
  },
  error => {
    return Promise.error(error)
  })

// 添加响应拦截器
service.interceptors.response.use(
  response => {
    let data = response.data
    if (data.status !== 0) {
      messageErr(data.info)
      return Promise.reject(data)
    } else {
      return Promise.resolve(data)
    }
  },
  error => {
    let response = error.response
    if (response) {
      let data = response.data
      messageErr(data.msg)
    } else {
      messageErr()
    }
    return Promise.reject(error)
  }
)

function request (options) {
  let [query, body] = [{}, {}]
  if (options.method === 'get') {
    query = options.params
  } else if (options.method === 'post') {
    body = stringify(options.params)
    // body = options.params
  } else if (options.method === 'put' || options.method === 'delete') {
    if (options.data) {
      body = options.data
    } else if (options.params) {
      query = options.params
    }
  }
  let data = {
    url: options.url,
    method: options.method,
    data: body,
    params: query
  }
  if (options.responseType) {
    data.responseType = options.responseType
  }
  return service.request(data)
}

export default request
