import request from '@/utils/request'

// 查询自营商品信息列表
export function listCommodityInfo(query) {
  return request({
    url: '/commodity/commodityInfo/list',
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
    url: '/system/sortTwo/queryAll',
    method: 'get',
  })
}


// 查询合伙人列表
export function selectDealerList() {
  return request({
    url: '/usercenter/dealer/getDealerList',
    method: 'get',
    params: {
      isPartner: 'Y'
    }
  })
}

