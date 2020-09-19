import request from '@/utils/request'

// 查询项目一级分类列表
export function listSortOne(query) {
  return request({
    url: '/system/sortOne/list',
    method: 'get',
    params: query
  })
}

// 查询项目一级分类详细
export function getSortOne(oneId) {
  return request({
    url: '/system/sortOne/' + oneId,
    method: 'get'
  })
}

// 新增项目一级分类
export function addSortOne(data) {
  return request({
    url: '/system/sortOne',
    method: 'post',
    data: data
  })
}

// 修改项目一级分类
export function updateSortOne(data) {
  return request({
    url: '/system/sortOne',
    method: 'put',
    data: data
  })
}

// 删除项目一级分类
export function delSortOne(oneId) {
  return request({
    url: '/system/sortOne/' + oneId,
    method: 'delete'
  })
}
