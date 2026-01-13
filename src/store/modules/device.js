/* 设备管理 */
const state = {
  deviceType: []
};
const getters = {
  deviceType: state => state.deviceType, // 设备分类
  currentDeviceType: state => (code, list) => {
    return findCategoryInfoByCode(code, list || state.deviceType) || {};
  }
};
const mutations = {
  setDeviceType: (state, data) => {
    state.deviceType = setTree(data);
  }
};
function setTree(list = [], parent, selectable) {
  return list.map(_i => {
    return {
      ..._i,
      selfCode: _i.dictCode,
      code: parent?.dictCode ? `${parent.dictCode},${_i.code}` : _i.dictCode,
      fullName: parent?.dictName ? parent.dictName + '-' + _i.dictName : _i.dictName,
      children: _i.children?.length > 0 ? setTree(_i.children, _i, selectable) : undefined,
      pCode: parent?.dictCode ? parent?.dictCode : ''
    };
  });
}
function findCategoryInfoByCode(code, list) {
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    let res;
    if (item.dictCode === code) {
      return item;
    } else if (item?.children?.length) {
      res = findCategoryInfoByCode(code, item.children);
      if (res) return res;
    }
  }
  return undefined;
}
export default {
  namespaced: true,
  state,
  getters,
  mutations
};
