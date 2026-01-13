/*
 * @Description: 资料配置
 * @Author: huhaiou
 * @LastEditTime: 2021-02-07 14:02:23
 */
import { queryProfileColumns } from '@/api/baseInfo';

const state = {
    columns: [],
    pumpId: '',
    change: false
};
const mutations = {
  SET_COLUMNS: (state, data) => {
    state.columns = data;
  },
  SET_PUMPID: (state, siteId) => {
    state.pumpId = siteId;
  },
  SET_CHANGE: (state, data) => {
    state.change = data;
  }
};
const actions = {
  GenerateColumnList({ commit, state }) {
    return new Promise((resolve, reject) => {
      queryProfileColumns()
        .then(res => {
          let { status, resultData } = res;
          if (status === 'complete') {
            let keys = [];
            let columns = resultData
              .filter((item, index) => {
                if (item.isVisible === '1' && keys.indexOf(item.componentCode) < 0) {
                  keys.push(item.componentCode);
                  item.title = item.componentName;
                  item.dataIndex = item.componentCode;
                  item.checked = true;
                  item.ellipsis = true;
                  item.width = 120;
                  item.scopedSlots = { customRender: item.componentType };
                  return item;
                }
              })
              .concat([
                {
                  title: '操作',
                  dataIndex: 'action',
                  fixed: 'right',
                  width: 100,
                  scopedSlots: { customRender: 'action' },
                  defaultChecked: true
                }
              ]);
            columns[0].fixed = 'left';
            columns[0].checked = true;
            columns[0].defaultChecked = true;
            columns[0].width = 150;
            commit('SET_COLUMNS', columns);
            resolve(columns);
          } else {
            reject(errorMessage);
          }
        }).catch(error => {
          reject(error);
        });
    });
  },
  SetPumpId({ commit }, id) {
    commit('SET_PUMPID', id);
  },
  SetTemplateChange({ commit, state}, classType) {
    commit('SET_CHANGE', !state.change);
  }
}
export default {
    namespaced: true,
    state,
    mutations,
    actions
};
