import Vue from 'vue';
import Vuex from 'vuex';
import getters from './getters';
import modules from './modules';
Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    factoryList: [],
    factoryMap: {},
    setting: {},
    unitList: [] // 单位
  },
  mutations: {
    setFactory: (state, list) => {
      state.factoryList = list;
      const map = {};
      list.forEach(item => {
        map[item.id] = item;
      });
      state.factoryMap = map;
    },
    setUnit: (state, list) => {
      state.unitList = list;
    }
  },
  modules,
  getters
});
