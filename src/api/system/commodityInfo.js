import request from '@/utils/request'

// 查询自营商品信息列表
export function listCommodityInfo(query) {
  return request({
    url: '/system/commodityInfo/list',
    method: 'get',
    params: query
  })
}

// 查询自营商品信息详细
export function getCommodityInfo(commodityId) {
  return request({
    url: '/system/commodityInfo/' + commodityId,
    method: 'get'
  })
}

// 新增自营商品信息
export function addCommodityInfo(data) {
  return request({
    url: '/system/commodityInfo',
    method: 'post',
    data: data
  })
}

// 修改自营商品信息
export function updateCommodityInfo(data) {
  return request({
    url: '/system/commodityInfo',
    method: 'put',
    data: data
  })
}

// 删除自营商品信息
export function delCommodityInfo(commodityId) {
  return request({
    url: '/system/commodityInfo/' + commodityId,
    method: 'delete'
  })
}

// 查询项目二级分类详细
export function getSortTwoAll() {
  return request({
    url: '/system/sortTwo/queryAll',
    method: 'get',
  })
}
