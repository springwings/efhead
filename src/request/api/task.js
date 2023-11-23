import http from '@/request/http'

export default {
  efm_doaction (params = {}) {
    return http({
      url: '/efm.doaction',
      method: 'get',
      params
    })
  },
  efm_doaction_post (params = {}) {
    return http({
      url: '/efm.doaction',
      method: 'post',
      params
    })
  }
}
