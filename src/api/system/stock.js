import request from '@/utils/request'

// 查询自营商品信息列表
export function listStockInfo(query) {
  return request({
    url: '/commodity/commodityInfo/stockList',
    method: 'get',
    params: query
  })
}

// 查询自营商品信息列表
export function addCommodityStock(data) {
  return request({
    url: '/commodity/commodityInfo/addStock',
    method: 'post',
    data: data
  })
}

// 查询自营商品信息列表
export function detailStockInfo(query) {
  return request({
    url: '/commodity/commodityInfo/stockDetail',
    method: 'get',
    params: query
  })
}

// 查询自营商品信息详细
export function getCommodityInfo(commodityId) {
  return request({
    url: '/commodity/commodityInfo/' + commodityId,
    method: 'get'
  })
}

// 新增自营商品信息
export function addCommodityInfo(data) {
  return request({
    url: '/commodity/commodityInfo',
    method: 'post',
    data: data
  })
}

// 修改自营商品信息
export function updateCommodityInfo(data) {
  return request({
    url: '/commodity/commodityInfo',
    method: 'put',
    data: data
  })
}

// 修改自营商品信息
export function update2CommodityInfo(data) {
  return request({
    url: '/commodity/commodityInfo/edit2',
    method: 'post',
    data: data
  })
}

// 删除自营商品信息
export function delCommodityInfo(commodityId) {
  return request({
    url: '/commodity/commodityInfo/' + commodityId,
    method: 'delete'
  })
}

// 上下架自营商品信息
export function releaseCommodityInfo(data) {
  return request({
    url: '/commodity/commodityInfo/release',
    method: 'post',
    params: data,
  })
}

// 查询项目二级分类详细
export function getSortTwoAll() {
  return request({
    url: '/commodity/sortTwo/queryAll',
    method: 'get',
  })
}

// 删除图片
export function delImg(query) {
  return request({
    url: '/commodity/file/delImg',
    method: 'get',
    params: query
  })
}

