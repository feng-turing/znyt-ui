import request from '@/utils/request'

// 查询搜索热词列表
export function listHotword(query) {
  return request({
    url: '/system/hotword/list',
    method: 'get',
    params: query
  })
}

// 查询搜索热词详细
export function getHotword(hotWordId) {
  return request({
    url: '/system/hotword/' + hotWordId,
    method: 'get'
  })
}

// 新增搜索热词
export function addHotword(data) {
  return request({
    url: '/system/hotword',
    method: 'post',
    data: data
  })
}

// 修改搜索热词
export function updateHotword(data) {
  return request({
    url: '/system/hotword',
    method: 'put',
    data: data
  })
}

// 删除搜索热词
export function delHotword(hotWordId) {
  return request({
    url: '/system/hotword/' + hotWordId,
    method: 'delete'
  })
}
