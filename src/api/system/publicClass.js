import request from '@/utils/request'

// 查询公开课信息列表
export function listPublicClass(query) {
  return request({
    url: '/system/publicClass/list',
    method: 'get',
    params: query
  })
}

// 查询公开课信息详细
export function getPublicClass(publicClassId) {
  return request({
    url: '/system/publicClass/' + publicClassId,
    method: 'get'
  })
}

// 新增公开课信息
export function addPublicClass(data) {
  return request({
    url: '/system/publicClass',
    method: 'post',
    data: data
  })
}

// 修改公开课信息
export function updatePublicClass(data) {
  return request({
    url: '/system/publicClass',
    method: 'put',
    data: data
  })
}

// 删除公开课信息
export function delPublicClass(publicClassId) {
  return request({
    url: '/system/publicClass/' + publicClassId,
    method: 'delete'
  })
}

