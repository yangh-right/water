import Vue from 'vue';

import { getConfigFile } from '@/core/bootstrap';
import '@/core/lazy_use';
import store from '@/store';
import App from './App.vue';
import "@/styles/index.less";
import { MicroApp, accessToken } from "@wpg/framework-vue";
import { getSystemInfo } from '@/init';
import router from '@/router';
import Wdv from '@/wdv.config';

// eslint-disable-next-line no-undef
__webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;

let app, appState;
Vue.prototype.$bus = new Vue()
Vue.use(Wdv)

// eslint-disable-next-line no-unused-vars
export function bootstrap({ token, goto, state, closeTab, setState, logout, setTheme, setLayout }) {
  Vue.mixin({
    methods: {
      goto,
    },
  });

  if (token) {
    MicroApp.config({
      token,
      router,
      api: {
        getRoutes: () => Promise.resolve([]),
      },
    });
    return Promise.resolve();
  } else {
    return Promise.resolve();
  }
}

// eslint-disable-next-line no-unused-vars
export async function mount({ container, state, closeTab, setState, logout, setTheme, setLayout }) {
  appState = Vue.observable({ ...state });
  await getConfigFile(`${__webpack_public_path__ ? `${__webpack_public_path__}config.json` : './config.json'}`)
  await getSystemInfo()
  app = new Vue({
    store,
    render: h =>
      h(App, { props: { closeTab, state: appState, setState, logout, setTheme, setLayout } })
  }).$mount(container.querySelector('#app'));
}

export function unmount() {
  if (app) {
    app.$destory();
  }
  return Promise.resolve();
}

export function update({ token, ...rest }) {
  if (token) {
    MicroApp.setToken(token);
  }
  if (appState && rest) {
    Object.keys(rest).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(appState, key)) {
        appState[key] = rest[key];
      }
    });
  }
  return Promise.resolve()
}
