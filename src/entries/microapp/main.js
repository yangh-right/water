/*
 * @Description: 请输入....
 * @Author: huhaiou
 * @Date: 2022-03-23 09:30:33
 * @LastEditTime: 2023-04-21 14:31:13
 * @LastEditors: yuan wenyu
 */

import Vue from 'vue';
import "babel-polyfill"; // 解决IE、低版本内核 兼容ES6语法问题
import '@/core/lazy_use';
import i18n from '@/locale';
import store from '@/store';
import router from '@/router';
import App from './App.vue';
import { getConfigFile } from '@/core/bootstrap';

import Wfv, { MicroApp } from '@wpg/framework-vue';
import Wdv from '@/wdv.config';
import {
  getUserInfo,
  getRoutesAndBasicInfo
} from '@/api/common';
import { drillDown } from '@/core/mixins';
import '@/styles/index.less';
Vue.prototype.$bus = new Vue();
Vue.use(Wdv);
Vue.use(Wfv);

// eslint-disable-next-line no-undef
__webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;

let app;
let appState;


// eslint-disable-next-line no-unused-vars
export function bootstrap({ token, goto }) {
  MicroApp.config({
    token,
    router,
    api: {
      getUserInfo,
      getRoutes: getRoutesAndBasicInfo(true),
    },
  });

  Vue.mixin({
    methods: {
      goto,
    },
  });

  Vue.mixin({
    methods: {
      drillDown,
    }
  });
  // 小门户下未调用业务系统getUserInfo 方法，启动时手动调用，解决通过state获取不到用户信息。
  getUserInfo(token);
  return Promise.resolve();
}

// eslint-disable-next-line no-unused-vars
export function mount({ container, state, closeTab, setState, logout, setTheme, setLayout, linkToOther }) {

  Vue.mixin({
    methods: {
      $linkToOther: linkToOther,
    },
  });
  return getConfigFile(window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__ + "config.json").then(() => {
    appState = Vue.observable({ ...state });

    app = new Vue({
      i18n,
      router,
      store,
      render: (h) => h(App, { props: { closeTab, state: appState, setState, logout, setTheme, setLayout, linkToOther } }),
    }).$mount(container.querySelector("#app"));
  });
}

export function unmount() {
  if (app) {
    app.$destory();
  }
  return Promise.resolve();
}

export function update({ token, ...rest }) {
  if (token) MicroApp.setToken(token);
  if (appState && rest) {
    Object.keys(rest).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(appState, key)) {
        appState[key] = rest[key];
      }
    });
  }
  return Promise.resolve();
}
