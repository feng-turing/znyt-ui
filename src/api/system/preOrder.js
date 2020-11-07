import request from '@/utils/request'

// 查询预售订单列表
export function listPreOrder(query) {
  return request({
    url: '/order/preOrder/list',
    method: 'get',
    params: query
  })
}

// 查询预售订单详细
export function getPreOrder(orderId) {
  return request({
    url: '/order/preOrder/' + orderId,
    method: 'get'
  })
}

// 新增预售订单
export function addPreOrder(data) {
  return request({
    url: '/order/preOrder',
    method: 'post',
    data: data
  })
}

// 修改预售订单
export function updatePreOrder(data) {
  return request({
    url: '/order/preOrder',
    method: 'put',
    data: data
  })
}

// 删除预售订单
export function delPreOrder(orderId) {
  return request({
    url: '/order/preOrder/' + orderId,
    method: 'delete'
  })
}
