import request from '@/utils/request'

// 查询推送消息列表
export function listPushmsg(query) {
  return request({
    url: '/system/pushmsg/list',
    method: 'get',
    params: query
  })
}

// 查询推送消息详细
export function getPushmsg(pushId) {
  return request({
    url: '/system/pushmsg/' + pushId,
    method: 'get'
  })
}

// 新增推送消息
export function addPushmsg(data) {
  return request({
    url: '/system/pushmsg',
    method: 'post',
    data: data
  })
}

// 修改推送消息
export function updatePushmsg(data) {
  return request({
    url: '/system/pushmsg',
    method: 'put',
    data: data
  })
}

// 删除推送消息
export function delPushmsg(pushId) {
  return request({
    url: '/system/pushmsg/' + pushId,
    method: 'delete'
  })
}
