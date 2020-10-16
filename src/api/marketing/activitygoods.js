import request from '@/utils/request'

// 查询活动商品列表
export function listActivitygoods(query) {
  return request({
    url: '/marketing/activitygoods/list',
    method: 'post',
    data: query
  })
}

// 查询活动商品详细
export function getActivitygoods(activityId) {
  return request({
    url: '/marketing/activitygoods/' + activityId,
    method: 'get'
  })
}

// 新增活动商品
export function addActivitygoods(data) {
  return request({
    url: '/marketing/activitygoods',
    method: 'post',
    data: data
  })
}

// 修改活动商品
export function updateActivitygoods(data) {
  return request({
    url: '/marketing/activitygoods',
    method: 'put',
    data: data
  })
}

// 删除活动商品
export function delActivitygoods(activityId) {
  return request({
    url: '/marketing/activitygoods/' + activityId,
    method: 'delete'
  })
}
