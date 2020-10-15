import request from '@/utils/request'

// 查询商品信息列表
export function listDealerCommodityInfo(query) {
  return request({
    url: '/commodity/commodityInfo/dealerList',
    method: 'get',
    params: query
  })
}

// 查询商品信息详细
export function getDealerCommodityInfo(commodityId) {
  return request({
    url: '/commodity/commodityInfo/getDealerCommodityInfo/' + commodityId,
    method: 'get'
  })
}

// 修改商品信息
export function updateCommodityInfo(data) {
  return request({
    url: '/commodity/commodityInfo/updateDealerCommodity',
    method: 'put',
    data: data
  })
}

// 查询商品信息列表(1元抢购，5折特惠)
export function listCommodityInfoByActivity(query) {
  return request({
    url: '/commodity/commodityInfo/activityList',
    method: 'get',
    params: query
  })
}

// 查询商品信息列表(首页推荐)
export function listCommodityInfoByRecommend(query) {
  return request({
    url: '/commodity/commodityInfo/recommendList',
    method: 'get',
    params: query
  })
}



