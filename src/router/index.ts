/*
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2022-03-03 15:01:03
 * @LastEditors: huhaiou
 * @LastEditTime: 2022-07-06 11:05:31
 * @Description:
 */
import Vue from "vue";
import VueRouter from "vue-router";
import { dateFormat } from "@/utils/js/tool/tools";
import { batchCreateMenuLog } from "@/api/index";
import { accessToken } from "@wpg/framework-vue";
import { Base64 } from "js-base64";
import storage from '@/utils/storage';
import { APP_PREFIX } from '@/constants';
import { USER_INFO } from '@/store/mutation-types';
import Wfv, { App as WfApp } from '@wpg/framework-vue';

Vue.use(VueRouter);
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  const originalPushCall:any= originalPush.call(this, location)

  return originalPushCall.catch(err => err)
}

const routes = [] as any[];

const router = new VueRouter({
  routes,
});

// 退出登录时会在框架内刷新页面，使得startTime丢失无法记录最后一条记录，在退出登录时手动调用这方法存数据
export function loginOutLog() {
  const userInfo = localStorage.getItem(`${APP_PREFIX}__user_info`) || '';
  const { userId, tenantId } = JSON.parse(Base64.decode(JSON.parse(userInfo).value));
  const endTime = new Date().getTime();
  const durationTime = endTime - startTime;
  const route = router.app.$route;
  const logInfo = {
    userId,
    tenantId,
    //在meta中拼接的格式/日志中心/用户日志，转为后端需要的['日志中心','用户日志']
    menuNameList: route?.meta?.menuModule&&route?.meta?.menuModule.split("/").slice(1),
    menuIdList:  route?.meta?.menuModuleId&&route?.meta?.menuModuleId.split("/").slice(1),
    durationTime,
    createTime: dateFormat(startTime),
    //应用在公共平台的应用编号
    appId: APP_PREFIX,
    //子系统没有方案菜单，写和实际菜单一致
    virtualMenuPath:  route?.meta?.menuModule&&route?.meta?.menuModule.split("/").slice(1).join('/'),
  };
  reSaveLog(logInfo);
}

// 重新存到本地
function reSaveLog(logInfo) {
  if (logInfo.menuNameList && logInfo.menuIdList && logInfo.virtualMenuPath && logInfo.durationTime) {
    const log = localStorage.getItem("secondaryWaterSupplyLog");
    let logInfoList = log && JSON.parse(log);
    if (!logInfoList) {
      logInfoList = [logInfo];
    } else {
      logInfoList.push(logInfo);
    }
    localStorage.setItem("secondaryWaterSupplyLog", JSON.stringify(logInfoList));
  }
}

let startTime;
// 如果在小门户和iframe中，子系统不发送埋点信息
if (!(window as any).__POWERED_BY_QIANKUN__ && window.location.href.indexOf("iframe.html") < 0) {
  router.beforeEach((to, from, next) => {
    const endTime = new Date().getTime();
    // 如果字典管理的菜单统计功能没开启，不发送埋点信息
    if (startTime && (window as any)?.basicConfig?.menuStatistics === "true") {
      const durationTime = endTime - startTime;
      if (from.name && from.name !== "Login") {
        const userInfo = localStorage.getItem(`${APP_PREFIX}__user_info`) || '';
        const { userId, tenantId } = JSON.parse(Base64.decode(JSON.parse(userInfo).value));
        const logInfo = {
          userId,
          tenantId,
          menuNameList: from?.meta?.menuModule&&from?.meta?.menuModule.split("/").slice(1),
          menuIdList:  from?.meta?.menuModuleId&&from?.meta?.menuModuleId.split("/").slice(1),
          durationTime,
          createTime: dateFormat(startTime),
          appId: APP_PREFIX,
          virtualMenuPath: from?.meta?.menuModule&&from?.meta?.menuModule.split("/").slice(1).join('/'),
        };
        reSaveLog(logInfo);
      }
    }
    startTime = endTime;
    if (to.path === "/login") {
      if (to.query.tenantCode || to.query.tenantCode === "") {
        next();
      } else {
        let tenantCode = '';
        if (storage.get(USER_INFO)) {
          const userInfo = JSON.parse(Base64.decode(storage.get(USER_INFO)));
          tenantCode = userInfo.tenantCode || '';
        }
        next({
          path: "/login",
          query: {
            tenantCode: tenantCode,
          },
        });
      }
    }else {
      next();
    }
  });
  setInterval(() => {
    if (accessToken && accessToken.get() &&  (window as any)?.basicConfig?.menuStatistics === "true") {
      const log = localStorage.getItem("secondaryWaterSupplyLog");
      const logInfoList = log && JSON.parse(log);
      if (logInfoList) {
        try {
          // 发送埋点信息
          batchCreateMenuLog(logInfoList)
            .then((res) => {
              if (res.status === "complete") {
                window.localStorage.removeItem("secondaryWaterSupplyLog");
              }
            })
            .catch(() => {
              //
            });
        } catch (err) {
          //  console.log(err)
        }
      }
    }
  }, 60000);
}

export default router;
