/*
 * @Description: 请输入....
 * @Author: huhaiou
 * @Date: 2022-02-25 15:16:39
 * @LastEditTime: 2023-04-23 08:39:50
 * @LastEditors: Do not edit
 */
import mapConfig from '@/config/map.config';
import { APP_THEME, APP_PREFIX, APP_CENTER } from '@/constants';
import { accessToken } from '@wpg/framework-vue';
import uuid from '@/utils/uuid';
import storage from '@/utils/storage';

export default {
  namespaced: true,
  state: {
    init: false,
    hasStaggerControl: '0',
    hideTank: true,
    hasNotice: true,
    refreshInterval: 10000, // 泵房数据实时刷新频率
    showIosPopup: false,
    mapLevel: 18, // 地图标签是否显示等级
    typeMap: 'BD', // gis BD=>百度地图，TD=>天地图，GD=>高德地图
    mapBg: true,
    textReplace: '污水厂',
    typeMapProps: {}
  },
  mutations: {
    init(state) {
      state.init = true;
    },
    setHasStaggerControl: (state, payload) => {
      state.hasStaggerControl = payload;
    },
    setHideTank: (state, payload) => {
      state.hideTank = payload;
    },
    setHasNotice: (state, payload) => {
      state.hasNotice = payload;
    },
    setRefreshInterval: (state, payload) => {
      state.refreshInterval = payload;
    },
    setMapLevel: (state, payload) => {
      state.mapLevel = payload;
    },
    setShowIosPopup: (state, flag) => {
      state.showIosPopup = flag;
    },
    setMapStrategy: (state, type) => {
      state.typeMap = type;
    },
    setMapBg: (state, payload) => {
      state.mapBg = payload;
    },
    setMapProps: (state, option) => {
      state.typeMapProps = option;
    }
  },
  actions: {
    setHideTank({ commit }, payload) {
      commit('setHideTank', payload);
    },
    setHasStaggerControl({ commit }, payload) {
      commit('setHasStaggerControl', payload);
    },
    setHasNotice({ commit }, payload) {
      commit('setHasNotice', payload);
    },
    setRefreshInterval({ commit }, payload) {
      commit('setRefreshInterval', payload);
    },
    setMapLevel({ commit }, payload) {
      commit('setMapLevel', payload);
    },
    setMapStrategy({ commit }, payload) {
      let options = null;
      // payload: gis BD=>百度地图，TD=>天地图，GD=>高德地图
      if (!payload || payload.indexOf('gis') > -1) {
        options = {
          baseURL: `${mapConfig.gisOrigin}`,
          token: `Bearer ${accessToken.get()}`,
          theme: APP_THEME
        };
        let tempArr = payload.split('-');
        if (!!tempArr[1]) {
          storage.set('latLngType', tempArr[1]);
        } else {
          storage.set('latLngType', 'BD09');
        }
      } else {
        // 获取 map.config 里对应的地图信息
        let { crs, config } = mapConfig.onlineMap[payload];
        let latLngType = mapConfig.crsMap.f2b[payload];
        storage.set('latLngType', latLngType);
        // 这里要用center [Lng, Lat]，要注意storage存储内容要反转一下，但不要改变原来的数组
        let center = storage.get(`${APP_PREFIX}_${APP_CENTER}`)
          ? storage
              .get(`${APP_PREFIX}_${APP_CENTER}`)
              .slice()
              .reverse()
          : [121.402379, 31.254289];
        options = {
          getMeta: () => {
            return {
              baseLayers: [
                {
                  iconType: 1,
                  id: uuid(),
                  latLngType,
                  layers: []
                }
              ],
              overlays: [],
              mapConstrains: {
                bounds: [112.51438693, 37.407177315, 112.644504536, 37.469536865],
                center: center,
                maxZoom: config.maxZoom,
                minZoom: config.minZoom,
                originX: -20037508.3427892,
                originY: 20037508.3427892,
                projectType: 'mercator',
                resolutionL0: 78271.51696402031,
                zoom: 14
              }
            };
          },
          mapOptions: {
            crs: L.CRS[crs],
            minZoom: config.minZoom,
            maxZoom: config.maxZoom
          }
        };
      }
      if (!!payload) {
        commit('setMapStrategy', payload.split('-')[0]);
      } else {
        commit('setMapStrategy', payload);
      }
      commit('setMapProps', options);
    },
    setMapBg({ commit }, payload) {
      commit('setMapBg', payload);
    },
    init({ commit }) {
      commit('init');
    }
  }
};
