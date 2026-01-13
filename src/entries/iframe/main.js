import Vue from 'vue';
import App from './App.vue';
import router from '@/router';
import store from '@/store';
import Wdv from '@/wdv.config';
import '@/core/lazy_use';
import { getConfigFile } from '@/core/bootstrap';
import '@wpg/design-vue/dist/wpgd.css';
import Wfv, { MicroApp } from '@wpg/framework-vue';
import { accessToken } from '@wpg/framework-vue';
import { getRoutesAndBasicInfo } from '@/api/common';
import VueCompositionAPI from '@vue/composition-api';
import '@/styles/index.less';
import '@wpg/framework-vue/lib/index.css';
// eslint-disable-next-line no-unused-vars
import sigleStore from '@/sigleStore';

Vue.use(VueCompositionAPI);

Vue.config.productionTip = false;
Vue.prototype.$bus = new Vue();
Vue.use(Wdv);
Vue.use(Wfv);

function postMessage(type, data) {
  let parent = '*';
  if (top !== self) {
    top.postMessage(
      {
        sysCode: router.currentRoute?.query?.sysCode ?? 'water_purification',
        /* 智慧运营管理，cmd, params */
        cmd: type,
        params: data,
        /* 小门户 */
        type: type,
        value: data
      },
      parent
    );
  } else {
    router.push(data);
  }
}
//以下方法需要与iframe接入方协商实现
function closeTab(path, toPath) {
  postMessage('closeTab', {
    path: path
  });
  toPath && this.goto(toPath);
}

function setState(key, value) {
  sigleStore.state[key] = value;
}
function logout() {
  postMessage('logout', {});
}
function setTheme(theme) {
  let rTheme = theme === false ? 'light' : theme;
  const root = document.getElementsByTagName('html')[0];
  root.classList.add('wpg-theme-changing');
  root.setAttribute('data-wpg-theme', rTheme);
  setTimeout(() => {
    root.classList.remove('wpg-theme-changing');
  });
  // 设置store里的主题
  sigleStore.setState('theme', theme);
}
function eventHandler(e) {
  let data = e.data;
  switch (data.cmd) {
    case 'themeChange':
      // { cmd: 'themeChange', params: { theme } }
      setTheme(data.params.theme);
      break;

    default:
      break;
  }
}
function setLayout() {}

function goto(route) {
  if (typeof route === 'string') {
    postMessage('goto', {
      path: route
    });
  } else if (typeof route === 'object' && route.path) {
    postMessage('goto', {
      ...route
    });
  }
}

function drillDown(route) {
  if (typeof route === 'string') {
    postMessage('goto', {
      path: route,
      query: {
        drillDownTime: new Date().getTime(),
        drillDown: true,
        backPath: router.history.current.fullPath
      }
    });
  } else {
    postMessage('goto', {
      ...route,
      query: {
        ...(route?.query ?? {}),
        drillDownTime: new Date().getTime(),
        drillDown: true,
        backPath: router.history.current.fullPath
      }
    });
  }
}

function getQuery(href) {
  let queryString = href.split('?')[1];
  queryString = queryString ? queryString.split('#')[0] : '';
  const query = queryString
    ? queryString.split('&').reduce((a, b) => {
        const values = b.split('=');
        a[values[0]] = values[1];
        return a;
      }, {})
    : {};
  return query;
}

//当前用户token
const { token } = accessToken?.get() || getQuery(location.href);

function linkToOther(path) {
  // 报警中心地址特殊处理
  path = path.replace('alarm_center', 'alarm');
  const index = path.indexOf('/', 1) + 1;
  let targetPath = path.slice(0, index) + '#/' + path.slice(index);
  const split = targetPath.includes('?') ? '&' : '?';
  targetPath += `${split}token=${accessToken.get()}`;
  window.open(targetPath);
}

MicroApp.config({
  token,
  router,
  api: {
    getRoutes: getRoutesAndBasicInfo(false)
  }
});

getConfigFile().then(() => {
  const appState = Vue.observable({ ...store.state, theme: 'light' });
  sigleStore.state = appState;
  sigleStore.closeTab = closeTab;
  sigleStore.setState = setState;
  sigleStore.logout = logout;
  sigleStore.setTheme = setTheme;
  sigleStore.setLayout = setLayout;
  sigleStore.init = true;

  new Vue({
    router,
    store,
    created: function() {
      Vue.mixin({
        methods: {
          goto,
          drillDown
        }
      });
      window.addEventListener('message', eventHandler, false);
    },
    render: h =>
      h(App, {
        props: {
          closeTab,
          state: appState,
          setState,
          logout,
          setTheme,
          setLayout,
          linkToOther
        }
      })
  }).$mount('#app');
});
