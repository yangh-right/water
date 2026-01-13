/*
 * @Description: 请输入....
 * @Author: huhaiou
 * @Date: 2022-02-25 15:16:39
 * @LastEditTime: 2022-03-18 15:23:59
 * @LastEditors: huhaiou
 */

export default {
  namespaced: true,
  state: {
    hideVideo: false,
  },
  mutations: {
    setHideVideo: (state, payload) => {
      state.hideVideo = payload;
    }
  }
};
