import request from '@/utils/request'

// 查询自营商品信息列表
export function listDealerCommodityInfo(query) {
  return request({
    url: '/commodity/commodityInfo/dealerList',
    method: 'get',
    params: query
  })
}

// 查询自营商品信息详细
export function getDealerCommodityInfo(commodityId) {
  return request({
    url: '/commodity/commodityInfo/getDealerCommodityInfo/' + commodityId,
    method: 'get'
  })
}

// 修改自营商品信息
export function updateCommodityInfo(data) {
  return request({
    url: '/commodity/commodityInfo/updateDealerCommodity',
    method: 'put',
    data: data
  })
}



