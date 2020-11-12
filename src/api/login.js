import request from '@/utils/request'

const client_id = 'web'
const client_secret = '123456'
const scope = 'server'

// 登录方法
export function login(username, password, code, uuid) {
  return request({
    url: '/auth/login',
    method: 'post',
    data: { username, password, code, uuid }
  })
}

// 刷新方法
export function refreshToken() {
  return request({
    url: '/auth/refresh',
    method: 'post'
  })
}

// 获取用户详细信息
export function getInfo() {
  return request({
    url: '/system/user/getInfo',
    method: 'get'
  })
}

// 退出方法
export function logout() {
  return request({
    url: '/auth/logout',
    method: 'delete'
  })
}

// 获取验证码
export function getCodeImg() {
  return request({
    url: '/code',
    method: 'get'
  })
}

//查询有效订单数据(首页)
export function findMainOrderSalesInfo() {
  return request({
    url: '/order/order/findMainOrderSalesInfo',
    method: 'get'
  })
}

//查询经销商首页地图数据
export function findDealerChinaChartData() {
  return request({
    url: '/usercenter/dealer/findDealerChinaChartData',
    method: 'get'
  })
}
