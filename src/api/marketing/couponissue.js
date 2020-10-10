import request from '@/utils/request'

// 查询已发布优惠卷列表
export function listCouponissue(query) {
  return request({
    url: '/marketing/couponissue/list',
    method: 'get',
    params: query
  })
}

// 查询已发布优惠卷详细
export function getCouponissue(id) {
  return request({
    url: '/marketing/couponissue/' + id,
    method: 'get'
  })
}

// 新增已发布优惠卷
export function addCouponissue(data) {
  return request({
    url: '/marketing/couponissue',
    method: 'post',
    data: data
  })
}

// 修改已发布优惠卷
export function updateCouponissue(data) {
  return request({
    url: '/marketing/couponissue',
    method: 'put',
    data: data
  })
}

// 删除已发布优惠卷
export function delCouponissue(id) {
  return request({
    url: '/marketing/couponissue/' + id,
    method: 'delete'
  })
}
