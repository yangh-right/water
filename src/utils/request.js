/*
 * @Description:
 * @Author: liuct
 * @Date: 2021-06-30 20:44:06
 * @LastEditTime: 2024-11-04 11:03:56
 * @LastEditors: wangyr
 */
import axios from 'axios';
import store from '@/store';
import storage from '@/utils/storage';
import { message } from '@wpg/design-vue';
import { accessToken } from '@wpg/framework-vue';
import { VueAxios } from './axios';
import { detectIE, isInIframe } from './util';
import { JWT_TOKEN_EXPIRED } from '@/store/mutation-types';
import { APP_PREFIX, VUE_APP_PUBLIC_API_BASE_URL } from '@/constants';
import serverConfig from '@/config/server.config';
const logout = () => {
  store.dispatch('account/Logout').then(() => {
    if (isInIframe()) {
      window.parent.postMessage(
        {
          sysCode: APP_PREFIX,
          type: 'logout'
        },
        '*'
      );
    } else {
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  });
};

// 创建 axios 实例
const request = axios.create({
  // API 请求的默认前缀
  baseURL: serverConfig.API_BASE_URL,
  timeout: 30000 // 请求超时时间
});

// 异常拦截处理器
const errorHandler = error => {
  message.destroy();
  if (error.response) {
    const data = error.response.data;

    if (error.response.status === 403) {
      message.error(data.message);
    }
    if (error.response.status === 401) {
      message.error('授权失败，请重新登录');
      // logout();
    }
  }
  return Promise.reject(error);
};

// request interceptor
request.interceptors.request.use(config => {
  let token = accessToken?.get();
  config.baseURL = config.replaceBaseURL || config.baseURL;
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  if (config.data?.recordLog) {
    // 后台是否记录操作日志
    config.headers['recordLog'] = config.data?.recordLog;
  }

  // 修复 IE 浏览器 get 缓存
  // 添加时间戳
  if (detectIE() && /get/i.test(config.method)) {
    // 判断get请求
    config.params = config.params || {};
    config.params.t = Date.parse(new Date()) / 1000; // 添加时间戳
  }

  return config;
}, errorHandler);
import router from '@/router/index';

// response interceptor
request.interceptors.response.use(response => {
  let config = { errorTip: true, dealData: true, ...response.config };
  let dataAxios = response.data;
  const { errorCode, status } = dataAxios;
  if (errorCode === JWT_TOKEN_EXPIRED) {
    message.destroy();
    logout();
  } else if (status !== 'complete' && config.errorTip) {
    if (dataAxios.errorMessage) {
      message.error(dataAxios.errorMessage);
    }
  }
  // console.log('config.url',config.url);
  // console.log('router.currentRoute',router.currentRoute);

  if (
    config.url.includes('sysDict/sysDictListByCode') &&
    router.currentRoute.path.includes('warehouse/')
  ) {
    dataAxios?.resultData.forEach(item => {
      item.value = item.dictValue;
      item.name = item.dictName;
      item.code = item.dictCode;
    });
  }
  if (!config.dealData) {
    return response;
  } else {
    return dataAxios;
  }
}, errorHandler);

const installer = {
  vm: {},
  install(Vue) {
    Vue.use(VueAxios, request);
  }
};
export default request;

export { installer as VueAxios, request as axios };

// 创建 axios 实例
export const requestPublic = axios.create({
  // API 请求的默认前缀
  baseURL: serverConfig.PUBLIC_API_BASE_URL,
  timeout: 10000 // 请求超时时间
});

// request interceptor
requestPublic.interceptors.request.use(config => {
  let token = accessToken?.get();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// response interceptor
requestPublic.interceptors.response.use(
  response => {
    let config = { errorTip: true, dealData: true, ...response.config };
    let dataAxios = response.data;
    const { errorCode, status } = dataAxios;
    if (errorCode === JWT_TOKEN_EXPIRED) {
      // todo
    } else if (status !== 'complete' && response.statusText !== 'OK') {
      message.error(dataAxios.errorMessage);
    }
    if (!config.dealData) {
      return response;
    } else {
      return dataAxios;
    }
  },
  error => {
    if (error.response) {
      const data = error.response.data;

      if (error.response.status === 403) {
        message.error(data.message);
      }
      if (error.response.status === 401) {
        message.error('授权失败，请重新登录');
      }
    }
    return Promise.reject(error);
  }
);
