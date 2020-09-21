import request from '@/utils/request'

// 查询资讯信息列表
export function listNews(query) {
  return request({
    url: '/system/news/list',
    method: 'get',
    params: query
  })
}

// 查询资讯信息详细
export function getNews(newsId) {
  return request({
    url: '/system/news/' + newsId,
    method: 'get'
  })
}

// 新增资讯信息
export function addNews(data) {
  return request({
    url: '/system/news',
    method: 'post',
    data: data
  })
}

// 修改资讯信息
export function updateNews(data) {
  return request({
    url: '/system/news',
    method: 'put',
    data: data
  })
}

// 删除资讯信息
export function delNews(newsId) {
  return request({
    url: '/system/news/' + newsId,
    method: 'delete'
  })
}
