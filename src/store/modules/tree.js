/*
 * @Description: 请输入....
 * @Author: huhaiou
 * @Date: 2022-02-25 15:16:39
 * @LastEditTime: 2022-03-18 15:07:39
 * @LastEditors: huhaiou
 */
export default {
  namespaced: true,
  state: {
    currentKeys: {
      pump: '',
      device: '',
      video: ''
    },
    treeDataObjCurrent: {},
    treeDataListObj: {},
    allVideoListObj: {},
    extColumn: '2',
    wndNum: '1'
  },
  getters: {
    getAllVideoCode(state) {
      let allVideoList = [];
      let arr = [];
      let num = 1;
      for (let key in state.treeDataObjCurrent) {
        if (state.extColumn && state.treeDataObjCurrent[key].extColumn == state.extColumn) {
          if (state.wndNum == 1) {
            allVideoList.push(key);
          } else {
            num++;
            if (arr.length < Number(state.wndNum) - 1) {
              arr.push(key);
            } else {
              arr.push(key);
              allVideoList.push(arr);
              arr = [];
            }
          }
        }
      }
      if (num % state.wndNum > 0) allVideoList.push(arr);
      return allVideoList;
    },
    getAllFlowVideoCode(state) {
      let allVideoList = [];
      let arr = [];
      let num = 1;
      // @todo
      for (let key in state.treeDataObjCurrent) {
        if (
          state.treeDataObjCurrent[key].data &&
          state.treeDataObjCurrent[key].data.deviceModel &&
          state.treeDataObjCurrent[key].data.deviceModel !== '1'
        ) {
          if (state.wndNum === 1) {
            allVideoList.push({
              videoNo: key,
              type: state.treeDataObjCurrent[key].data.deviceModel
            });
          } else {
            num++;
            if (arr.length < Number(state.wndNum) - 1) {
              arr.push({
                videoNo: key,
                type: state.treeDataObjCurrent[key].data.deviceModel
              });
            } else {
              arr.push({
                videoNo: key,
                type: state.treeDataObjCurrent[key].data.deviceModel
              });
              allVideoList.push(arr);
              arr = [];
            }
          }
        }
      }
      if (num % state.wndNum > 0) allVideoList.push(arr);
      return allVideoList;
    }
  },
  mutations: {
    setTreeDataObjCurrent(state, _treeDataObj) {
      state.treeDataObjCurrent = _treeDataObj;
    },
    setTreeDataListObj(state, _treeDataObj) {
      state.treeDataListObj[_treeDataObj.target] = _treeDataObj.treeData;
    },
    setExtColumn(state, _extColumn) {
      state.extColumn = _extColumn;
    },
    setWndNum(state, _wndNum) {
      state.wndNum = _wndNum;
    },
    setCurrentKey(state, _currentKey) {
      state.currentKeys = _currentKey;
    }
  }
};
