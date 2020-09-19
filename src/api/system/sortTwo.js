import request from '@/utils/request'

// 查询项目二级分类列表
export function listSortTwo(query) {
  return request({
    url: '/system/sortTwo/list',
    method: 'get',
    params: query
  })
}

// 查询项目二级分类详细
export function getSortTwo(twoId) {
  return request({
    url: '/system/sortTwo/' + twoId,
    method: 'get'
  })
}

// 新增项目二级分类
export function addSortTwo(data) {
  return request({
    url: '/system/sortTwo',
    method: 'post',
    data: data
  })
}

// 修改项目二级分类
export function updateSortTwo(data) {
  return request({
    url: '/system/sortTwo',
    method: 'put',
    data: data
  })
}

// 删除项目二级分类
export function delSortTwo(twoId) {
  return request({
    url: '/system/sortTwo/' + twoId,
    method: 'delete'
  })
}
