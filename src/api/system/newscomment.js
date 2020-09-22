import request from '@/utils/request'

// 查询评论管理列表
export function listNewscomment(query) {
  return request({
    url: '/system/newscomment/list',
    method: 'get',
    params: query
  })
}

// 查询评论管理详细
export function getNewscomment(commentId) {
  return request({
    url: '/system/newscomment/' + commentId,
    method: 'get'
  })
}

// 新增评论管理
export function addNewscomment(data) {
  return request({
    url: '/system/newscomment',
    method: 'post',
    data: data
  })
}

// 修改评论管理
export function updateNewscomment(data) {
  return request({
    url: '/system/newscomment',
    method: 'put',
    data: data
  })
}

// 删除评论管理
export function delNewscomment(commentId) {
  return request({
    url: '/system/newscomment/' + commentId,
    method: 'delete'
  })
}
