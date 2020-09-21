import request from '@/utils/request'

// 查询广告信息列表
export function listAdvert(query) {
  return request({
    url: '/system/advert/list',
    method: 'get',
    params: query
  })
}

// 查询广告信息详细
export function getAdvert(advertId) {
  return request({
    url: '/system/advert/' + advertId,
    method: 'get'
  })
}

// 新增广告信息
export function addAdvert(data) {
  return request({
    url: '/system/advert',
    method: 'post',
    data: data
  })
}

// 修改广告信息
export function updateAdvert(data) {
  return request({
    url: '/system/advert',
    method: 'put',
    data: data
  })
}

// 删除广告信息
export function delAdvert(advertId) {
  return request({
    url: '/system/advert/' + advertId,
    method: 'delete'
  })
}
