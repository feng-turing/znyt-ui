import request from '@/utils/request'

// 查询用户会员列表
export function listUsermember(query) {
  return request({
    url: '/usercenter/usermember/list',
    method: 'get',
    params: query
  })
}

// 查询用户会员详细
export function getUsermember(userId) {
  return request({
    url: '/usercenter/usermember/' + userId,
    method: 'get'
  })
}

// 新增用户会员
export function addUsermember(data) {
  return request({
    url: '/usercenter/usermember',
    method: 'post',
    data: data
  })
}

// 修改用户会员
export function updateUsermember(data) {
  return request({
    url: '/usercenter/usermember',
    method: 'put',
    data: data
  })
}

// 用户注册成会员
export function userLoginMember(data) {
  return request({
    url: '/usercenter/usermember/loginMember/'+data,
    method: 'get',
  })
}

// 删除用户会员
export function delUsermember(userId) {
  return request({
    url: '/usercenter/usermember/' + userId,
    method: 'delete'
  })
}
