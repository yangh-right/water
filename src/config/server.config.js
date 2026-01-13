/*
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2023-01-09 10:09:45
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2023-04-28 14:27:11
 * @Description: 
 */
import { VUE_APP_API_BASE_URL, VUE_APP_WS_URL, VUE_APP_HOST } from "@/constants";

export const api = {
  hostUrl: VUE_APP_HOST?.replace(/([\w\W]+)\/$/,"$1"),
  baseUrl: VUE_APP_API_BASE_URL,
  wsBaseUrl: VUE_APP_WS_URL,
};

let serverConfig = {
  get API_BASE_URL() {
    return `${api.baseUrl}/purificationApi`
  },
  get PUBLIC_API_BASE_URL() {
    return `${api.baseUrl}`
  },
  get WS_BASE_URL() {
    return `${api.wsBaseUrl}`
  },
  get IMG_BASE_URL() {
    return `${api.baseUrl}/userCenterApi/FileManager?url=`
  },
  get IMG_HOST_URL() {
    if (process.env.NODE_ENV === 'development') {
      return `${api.hostUrl}/main/userCenterApi/FileManager?url=`
    } else {
      return `${api.baseUrl?.replace(/([\w\W]+)\/$/,"$1")}/userCenterApi/FileManager?url=`
    }
  },
  get GIS_ORIGIN_URL() {
    return api.baseUrl
  },
};


export default serverConfig;
