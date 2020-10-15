import request from '@/utils/request'

// 查询活动信息列表
export function listActivityInfo(query) {
  return request({
    url: '/marketing/activityInfo/list',
    method: 'get',
    params: query
  })
}

// 查询活动信息详细
export function getActivityInfo(id) {
  return request({
    url: '/marketing/activityInfo/' + id,
    method: 'get'
  })
}

// 新增活动信息
export function addActivityInfo(data) {
  return request({
    url: '/marketing/activityInfo',
    method: 'post',
    data: data
  })
}

// 修改活动信息
export function updateActivityInfo(data) {
  return request({
    url: '/marketing/activityInfo',
    method: 'put',
    data: data
  })
}

// 删除活动信息
export function delActivityInfo(id) {
  return request({
    url: '/marketing/activityInfo/' + id,
    method: 'delete'
  })
}
