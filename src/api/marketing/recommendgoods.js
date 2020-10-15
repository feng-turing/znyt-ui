import request from '@/utils/request'

// 查询首页推荐商品列表
export function listRecommendgoods(query) {
  return request({
    url: '/marketing/recommendgoods/list',
    method: 'post',
    data: query
  })
}

// 查询首页推荐商品详细
export function getRecommendgoods(recommendId) {
  return request({
    url: '/marketing/recommendgoods/' + recommendId,
    method: 'get'
  })
}

// 新增首页推荐商品
export function addRecommendgoods(data) {
  return request({
    url: '/marketing/recommendgoods',
    method: 'post',
    data: data
  })
}

// 修改首页推荐商品
export function updateRecommendgoods(data) {
  return request({
    url: '/marketing/recommendgoods',
    method: 'put',
    data: data
  })
}

// 删除首页推荐商品
export function delRecommendgoods(recommendId) {
  return request({
    url: '/marketing/recommendgoods/' + recommendId,
    method: 'delete'
  })
}
