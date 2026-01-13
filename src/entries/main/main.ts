/*
 * @Description: 请输入....
 * @Author: huhaiou
 * @Date: 2022-03-28 14:28:18
 * @LastEditTime: 2024-06-21 15:50:29
 * @LastEditors: wangyr
 */
import Vue from 'vue';
import serverConfig from '@/config/server.config';
import "babel-polyfill"; // 解决IE、低版本内核 兼容ES6语法问题
import '@/core/lazy_use';
import '@/core/mock';
import i18n from '@/locale';
import store from '@/store';
import router from '@/router';
import App from './App.vue';
import { getConfigFile } from '@/core/bootstrap';
import { APP_PREFIX } from '@/constants';
import Toolbar from '@/views/Toolbar/index.vue';
import Mute from '@/views/Toolbar/Mute.vue';
import { Base64 } from "js-base64";
import Wfv, { App as WfApp } from '@wpg/framework-vue';
import { accessToken } from "@wpg/framework-vue";
import Wdv from '@/wdv.config';
import '@wpg/design-vue/dist/wpgd.css';
import {getLoginInfo, initPageInfo} from '@/api/login';
import {getFileAccessHttpUrl} from '@/utils/util';
import WpgFrame from '@/views/Iframe/index.vue';
import { getSysDict } from "@/api/index";
import {
  menuFilter,
  // getLoginInfo,
  login,
  logout,
  checkToken,
  getWeather,
  changePassword,
  getUserInfo,
  getCaptchaInfo,
  getVersion,
  getRoutesAndBasicInfo,
  getConfig
} from '@/api/common';
import '@wpg/framework-vue/lib/index.css';
import '@/styles/index.less';
import { goto } from '@/core/mixins';
declare global {  //设置全局属性
  interface Window {  //window对象属性
    getConfig: Function;   //加入对象
  }
}
getConfig().then((res) => {
  window.getConfig = function () {
    if (process.env.NODE_ENV === 'development') {
      return { wsUrl: serverConfig.WS_BASE_URL, baseUrl: serverConfig.PUBLIC_API_BASE_URL };
    }else {
      return JSON.parse(JSON.stringify(res.data));
    }
  };
});

Vue.prototype.$bus = new Vue()
Vue.use(Wdv);
Vue.use(Wfv);
Vue.mixin(goto);

function linkToOther(path) {
  // 报警中心地址特殊处理
  path = path.replace('alarm_center', 'alarm');
  const index = path.indexOf('/', 1) + 1
  let targetPath =  path.slice(0, index) + '#/' + path.slice(index);
  const split = targetPath.includes('?')?'&':'?'
  targetPath += `${split}token=${accessToken.get()}`
  window.open(targetPath);
}

async function initApp() {
  const res = await Promise.all([getLoginInfo()]);
  const [pcRes] = res;
  const info = pcRes || {};
  const urls = [] as any[]
  if (info.advertises) {
    const advertise = info.advertises.split(',')
    advertise.forEach(item => {
      if (item) {
        const obj = {
        title: '',
        url: item
      }
      urls.push(obj)
     }
    })
  }
  WfApp.config({
    showCollapsedTitle: true,
    forceChangePassword: function(userInfo) {
      return userInfo.updatePWD
    },
    router,
    cachePrefix: info.code,
    loginType: 1,
    loginStyle:
        getFileAccessHttpUrl(info.backgroundImage) || getFileAccessHttpUrl(info.textImage)
          ? {
              background: getFileAccessHttpUrl(info.backgroundImage),
              textBackground: getFileAccessHttpUrl(info.textImage)
            }
          : null,
    loginBrandLogo: getFileAccessHttpUrl(info.loginLogo) || null,
    appName: info.appName,
    brandTitle: info.loginLogoName,
    title: info.systemName,
    subtitle: '',
    slogan: info.loginSlogan,
    brandLogo: getFileAccessHttpUrl(info.navigationBarIcon) || null,
    bannerTitle: info.navigationBarText,
    copyright: info.companyName,
    tabIcon : getFileAccessHttpUrl(info.tabIcon) || null,
    tabText : info.tabText,
    qrcode: info.advertises ? {
      title: '扫码下载APP',
      urls: urls
    } : null,
    layouts: ["left", "top"],
    menuLayout: "top",
    forgetPasswordLink: false,
    tabCache: false,
    popupActionOrderKeys: ['about', 'changeLanguage', 'changeTheme', 'changeLayout', 'changePassword', 'apply_ios_download_code', 'updateNotes', 'logout'],
    popupActions: function() {
      const actions: any[] = [];
      if (store.state.setting.buttonCodes['ios_download']) {
        actions.push({
          key: 'apply_ios_download_code',
          name: 'IOS下载',
          onClick: () => {
            store.commit('configure/setShowIosPopup', true)
          }
        });
      }

      if (store.getters['setting/menuList'].find(v => v.buttonCode === 'updateNotes')) {
        actions.push({
          key: 'updateNotes',
          name: '更新说明',
          onClick: (router) => {
            router.push('/baseInfo/updateNotes');
          }
        })
      }
      return actions;
    },
    renderActions: h => h(Toolbar),
    renderTabbarActions: h => h(Mute),
    renderExtraContent: h=> h(WpgFrame),
    menuFilter,
    api: {
      login,
      logout,
      getWeather,
      checkToken,
      changePassword,
      getUserInfo,
      getRoutes: getRoutesAndBasicInfo(false),
      getVersion,
      getCaptcha: info.verificationCode === 1 ? getCaptchaInfo : null,
      // getMessageCaptcha: (phoneNumber) => {
      //   console.log('111',phoneNumber)
      //   return true;
      // }
    }
  });
  initPageInfo(info);

  getConfigFile()
    .then(() => {
      new Vue({
        i18n,
        store,
        router,
        render: h =>
          h(App, {
            props: {
              linkToOther
            },
          })
      } as any).$mount('#app');
    });
}

initApp();
