/*
 * @Description: 请输入....
 * @Author: huhaiou
 * @Date: 2022-08-08 08:44:05
 * @LastEditTime: 2022-08-08 11:42:05
 * @LastEditors: huhaiou
 */
import { getAllVideoUrl } from '@/api/runMonitor'
export default {
  namespaced: true,
  state: {
    abloutStatus: null,             // 顶部弹窗--消息、报警、工单等
    autoCompleteStatus: null,       // 顶部快捷输入搜索弹窗
    videoBoxStatus: null,
    waitTodoStatus: null,
    alarmStatus: null,
    allVideoUrl: null,
  },
  mutations: {
    setAbloutStatus(state, _abloutStatus) { // 顶部自定义弹窗打开时延迟点执行，避免隐藏视频不成功
      setTimeout(() => {
        state.abloutStatus = _abloutStatus;
      }, _abloutStatus ? 100 : 0)
    },
    setAutoCompleteStatus(state, _autoCompleteStatus) { // 顶部快捷输入搜索弹窗
      setTimeout(() => {
        state.autoCompleteStatus = _autoCompleteStatus;
      }, _autoCompleteStatus ? 100 : 0)
    },
    setVideoBoxStatus(state, _videoBoxStatus) {
      state.videoBoxStatus = _videoBoxStatus;
    },
    setAllVideoUrl(state, _allVideoUrl) {
      state.allVideoUrl = { ..._allVideoUrl }
    },
    setWaitTodoStatus(state, _status) {
      state.waitTodoStatus = _status
    },
    setAlarmStatus(state, _status) {
      state.alarmStatus = _status
    }
  },
  actions: {
    setVideoUrl(context) {
      getAllVideoUrl().then(res => {
        let { status, resultData } = res;
        if (status === 'complete') {
          let obj = {}
          resultData.forEach(item => {
            const { sort, dictName, id, dictValue } = item
            const _it = {
              id: id,
              label: dictName,
              remarks: dictValue,
              sort: sort,
              value: dictValue
            }

            switch (item.sort) {
              case 1: obj['V9800'] = _it; break;
              case 2: obj['V8700'] = _it; break;
              case 3: obj['VISC'] = _it; break;
            }
          })
          context.commit('setAllVideoUrl', obj);
        }
      })
    }
  }
};
