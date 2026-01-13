/*
 * @Description: 请输入....
 * @Author: huhaiou
 * @Date: 2022-02-25 15:16:39
 * @LastEditTime: 2023-06-01 10:09:42
 * @LastEditors: yuan wenyu
 */
import Vue from 'vue';

// 表单设计器使用参考 https://www.yuque.com/chonger42/ocyx8f/pf6fyb
import FormDesign from '@wpg/form-design';
import '@wpg/form-design/lib/style/index.css';
import '@wpg/form-design/lib/style/schema-generator.css';

import VcDesign from '@wpg/vc-design';
import '@wpg/vc-design/lib/style/index.css';

import '@wpg/map-vue/dist/index.css';
import 'leaflet/dist/leaflet.css';
import NP from 'number-precision';
import { APP_PREFIX } from '@/constants.js';
// 二供业务组件：设备树，配件树，组织树，污水厂树
import {
  DeviceTree,
  PastsTree,
  OrgSelectTree,
  PumpSelectTree,
  KnowledgeTree,
  TankSelectTree
} from '@form/form-supply';
import '@form/form-supply/dist/index.min.css';
// 外业工单业务组件：指派，设备巡检、设备维修、设备调试
import {
  TicketAssist,
  TicketDispatch,
  TicketStepDeadline,
  TicketProcessDeadline
} from '@form/form-outwork';
import '@form/form-outwork/dist/index.min.css';

import { accessToken } from '@wpg/framework-vue';
import serverConfig from '@/config/server.config';
import { getSysApiConfig } from '@/api/form';

import WaterComponents from '@wpg/waterwork-modules';
import '@wpg/waterwork-modules/dist/index.css';

Vue.use(WaterComponents);

const publicPath = process.env.NODE_ENV === 'production' ? '/water_purification/' : './';
fetch(`${publicPath}config.json`)
  .then(res => {
    return res.json();
  })
  .then(json => {
    window.getConfig = function() {
      return json;
    };
    Vue.prototype.$config = json;
  });

let UIConfig = function() {
  return {
    token: `Bearer ${accessToken.get()}`,
    baseURL: serverConfig.PUBLIC_API_BASE_URL
  };
};

window.NP = NP;

Vue.use(FormDesign, {
  FormConfig: UIConfig,
  DictConfig: {
    method: 'get',
    action: '/purificationApi/sysDict/sysDictListByCode/{dictCode}',
    dataKey: 'resultData',
    dataLabel: 'name',
    dataValue: 'code'
  },
  SysApiConfig: function() {
    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        const token = accessToken?.get();
        if (token) {
          clearInterval(interval);
          getSysApiConfig().then(res => {
            const config = res.resultData || [];
            resolve(config);
          });
        }
      }, 2000);
    });
  }
});

Vue.use(VcDesign, {
  MapConfig() {
    return {
      token: `Bearer ${accessToken.get()}`,
      baseURL: serverConfig.API_BASE_URL
    };
  },
  UploadConfig: {
    // 图片和文件上传配置
    baseURL: serverConfig.PUBLIC_API_BASE_URL + '/userCenterApi/FileManager/upload', // 上传接口地址
    headers: function() {
      // 上传请求头
      return {
        Authorization: `Bearer ${accessToken.get()}`
      };
    },
    params() {
      return {
        bucket: APP_PREFIX.replace(/_/g, '-').toLowerCase()
      };
    },
    fileAccess: function(url) {
      // 上传文件回显地址
      return serverConfig.IMG_HOST_URL + url;
    }
  }
});

Vue.use(DeviceTree);
Vue.use(PastsTree);
Vue.use(OrgSelectTree);
Vue.use(PumpSelectTree);
Vue.use(KnowledgeTree);
Vue.use(TicketAssist);
Vue.use(TankSelectTree);
Vue.use(TicketDispatch);
Vue.use(TicketProcessDeadline);
Vue.use(TicketStepDeadline);
