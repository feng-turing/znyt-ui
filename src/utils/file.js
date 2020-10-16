import request from '@/utils/request'

// 删除图片
export function delImg(query) {
  return request({
    url: '/system/file/delImg',
    method: 'get',
    params: query
  })
}
export function uploadImg(mkdirName,data) {
  return request({
    url: '/system/file/uploadImg/{mkdirName}',
    method: 'post',
    data: data
  })
}
