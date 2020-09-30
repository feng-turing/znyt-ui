import request from '@/utils/request'

// 查询经销商信息列表
export function listDealer(query) {
  return request({
    url: '/usercenter/dealer/list',
    method: 'get',
    params: query
  })
}

// 查询经销商信息详细
export function getDealer(dealerId) {
  return request({
    url: '/usercenter/dealer/' + dealerId,
    method: 'get'
  })
}

// 新增经销商信息
export function addDealer(data) {
  return request({
    url: '/usercenter/dealer',
    method: 'post',
    data: data
  })
}

// 修改经销商信息
export function updateDealer(data) {
  return request({
    url: '/usercenter/dealer',
    method: 'put',
    data: data
  })
}

// 删除经销商信息
export function delDealer(dealerId) {
  return request({
    url: '/usercenter/dealer/' + dealerId,
    method: 'delete'
  })
}
