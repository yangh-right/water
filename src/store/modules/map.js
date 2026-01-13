/*
 * @Description: 地图
 */
import { APP_PREFIX, APP_CENTER } from '@/constants';
import storage from '@/utils/storage';
const state = {
  updateZoneTime: 0,
  center: storage.get(`${APP_PREFIX}_${APP_CENTER}`),
  mapIconSize: 22
};
const mutations = {
  UPDATE_ZONE: (state, time) => {
    state.updateZoneTime = time;
  },
  UPDATE_CENTER: (state, center) => {
    state.center = center;
  },
  SET_MAP_ICON_SIZE: (state, size) => {
    state.mapIconSize = size;
  }
};
const actions = {
  update_zone({ commit }, time) {
    commit('UPDATE_ZONE', time);
  },
  update_center({ commit }, center) {
    storage.set(`${APP_PREFIX}_${APP_CENTER}`, center);
    commit('UPDATE_CENTER', center);
  },
  set_map_icon_size({ commit }, size) {
    commit('SET_MAP_ICON_SIZE', size);
  }
};
export default {
  namespaced: true,
  state,
  mutations,
  actions
};
