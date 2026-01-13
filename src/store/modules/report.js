/*
 * @Description: 报表状态
 * @Author: zhangtianwen
 * @LastEditTime: 2021-02-03 11:37:47
 */

const state = {
    alarmParams:{},
    inspectParams:{},
    hasEdit:false,
    siteId:'',
}

const mutations = {
    SET_SITEID: (state, siteId) => {
        state.siteId = siteId;
    },
    setHasEdit:(state,hasEdit)=>{
     state.hasEdit=hasEdit
    },
    setAlarmParams: (state, alarmParams) => {
        
        state.alarmParams = alarmParams;
    },
    setInspectParams: (state, inspectParams) => {
        
        state.inspectParams = inspectParams;
    },
};
const actions = {
    setTargetSiteId({ commit }, id) {
        commit('SET_SITEID', id);
    }, 
    setAlarmParams: ({ commit }, alarmParams) => {
        
        commit("setAlarmParams", alarmParams)
    },
    setInspectParams: ({ commit }, inspectParams) => {
        
        commit("setInspectParams", inspectParams)
    },
}
export default {
    namespaced: true,
    state,
    mutations,
    actions
};