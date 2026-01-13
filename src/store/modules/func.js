// 功能配置
import { camelCase, isBoolean, isNumber } from 'lodash-es';
import { getDictList2 as apiGetDict } from '@/api';

export default {
  namespaced: true,
  state: {
    drillPreview: false, // 下钻分析维度预览
    moduleLimit: 10, // 驾驶舱配置模块上限
    refreshFrequency: 60, // 地图站点刷新频率
    mapZone3D: false, // 地图分区3d模式
    analyseAllSmall: false, // 综合分析全小图排列
  },
  mutations: {
    SET_DICT(state, { code, value }) {
      state[camelCase(code)] = value;
    },
  },
  actions: {
    /**
     * @description: 获取功能列表
     * @return {*}
     */
    async getFuncList({ state, commit }) {
      const list = await apiGetDict('function');
      Object.entries(state).forEach(([k, v]) => {
        for (let item of list) {
          const code = camelCase(item.dictCode);
          if (code === k) {
            if (isBoolean(v)) {
              commit('SET_DICT', { code, value: true });
            } else if (isNumber(v)) {
              commit('SET_DICT', { code, value: Number(item.dictValue) || state[code] });
            } else {
              commit('SET_DICT', { code, value: item.dictValue });
            }
            break;
          }
        }
      });
    },
  },
};
