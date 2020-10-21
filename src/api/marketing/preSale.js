import request from '@/utils/request'

// 查询营销预售列表
export function listSale(query) {
  return request({
    url: '/marketing/preSale/list',
    method: 'get',
    params: query
  })
}

// 查询营销预售详细
export function getSale(id) {
  return request({
    url: '/marketing/preSale/' + id,
    method: 'get'
  })
}

// 新增营销预售
export function addSale(data) {
  return request({
    url: '/marketing/preSale',
    method: 'post',
    data: data
  })
}

// 修改营销预售
export function updateSale(data) {
  return request({
    url: '/marketing/preSale',
    method: 'put',
    data: data
  })
}

// 删除营销预售
export function delSale(id) {
  return request({
    url: '/marketing/preSale/' + id,
    method: 'delete'
  })
}
