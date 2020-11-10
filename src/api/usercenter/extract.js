import request from '@/utils/request'

// 查询提现管理列表
export function listExtract(query) {
  return request({
    url: '/usercenter/extract/list',
    method: 'get',
    params: query
  })
}

// 查询提现管理详细
export function getExtract(id) {
  return request({
    url: '/usercenter/extract/' + id,
    method: 'get'
  })
}

// 新增提现管理
export function addExtract(data) {
  return request({
    url: '/usercenter/extract',
    method: 'post',
    data: data
  })
}

// 修改提现管理
export function updateExtract(data) {
  return request({
    url: '/usercenter/extract',
    method: 'put',
    data: data
  })
}

// 删除提现管理
export function delExtract(id) {
  return request({
    url: '/usercenter/extract/' + id,
    method: 'delete'
  })
}
