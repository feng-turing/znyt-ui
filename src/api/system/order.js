import request from '@/utils/request'

// 查询订单信息列表
export function listOrder(query) {
  return request({
    url: '/order/order/list',
    method: 'post',
    data: query
  })
}

// 查询订单信息详细
export function getOrder(orderId) {
  return request({
    url: '/order/order/' + orderId,
    method: 'get'
  })
}

// 新增订单信息
export function addOrder(data) {
  return request({
    url: '/order/order',
    method: 'post',
    data: data
  })
}

// 修改订单信息
export function updateOrder(data) {
  return request({
    url: '/order/order',
    method: 'put',
    data: data
  })
}

// 删除订单信息
export function delOrder(orderId) {
  return request({
    url: '/order/order/' + orderId,
    method: 'delete'
  })
}

export function getOrderDetail(orderId) {
  return request({
    url: '/order/order/detail/' + orderId,
    method: 'get'
  })
}

// 发起订单线上退款
export function orderRefund(orderNo) {
  return request({
    url: '/order/order/orderRefund/' + orderNo,
    method: 'get'
  })
}

// 刷新退款状态
export function updateOrderRefundStatus(orderNo) {
  return request({
    url: '/order/order/updateOrderRefundStatus/' + orderNo,
    method: 'get'
  })
}
