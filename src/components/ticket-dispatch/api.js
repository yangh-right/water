import { request } from '@wpg/form-design/es/utils/util';

/* 获取所有群组 */
export function getGroup(params) {
  let $axios = request();

  return $axios({
    url: '/outworkapi/sysGroup/groupTree',
    // url: '/secondaryWaterSupplyApi/ticket/selectSysGroupPage',
    method: 'get',
    // data: params
  });
}

/* 获取组织(群组)用户树 */
export function searchUserTree(params) {
  let $axios = request();
  return $axios({
    url: '/outworkapi/ticketMap/groupAndUser/search',
    // url: '/secondaryWaterSupplyApi/ticket/groupAndUser',
    method: 'post',
    data: params,
    timeout: 25000
  });
}
