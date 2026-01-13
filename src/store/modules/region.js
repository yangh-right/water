/*
 * @Description: 区域/组织树
 * @Author: huhaiou
 * @LastEditTime: 2021-06-29 14:13:50
 */
import {
  GetAreaTree, // 区域树
  GetOrgTreeByUser, // 组织树
  GetRoleTree,      // 角色树
} from '@/api/home';

const get = ({ children }, name) => {
  // 递归增加树字段title,key
  children = children.map((child, index) => {
    if (child.children && child.children.length) {
      child = {
        // ...child,
        children: get(child, name),
        title: child[name],
        key: child.id,
        value: child.id,
        isLeaf: false,
        scopedSlots: { title: 'title' }
      };
    } else {
      child = {
        // ...child,
        title: child[name],
        key: child.id,
        value: child.id,
        isLeaf: true,
        scopedSlots: { title: 'title' }
      };
    }
    return child;
  });
  return children;
};
function getId(_data, ids) {
  _data.forEach(child => {
    ids.push(child.id);
    if (child.children && child.children.length) {
      getId(child.children, ids);
    }
  });
  return ids;
}

function flatten(_data, arr) {
  _data.forEach(child => {
    arr.push({
      ...child,
      orgId: child.id,
      orgName: child.name
    });
    if (child.children && child.children.length) {
      flatten(child.children, arr);
    }
  });
  return arr;
}

const state = {
  regionTree: [],
  regionList: [],
  regionIds: [],
  orgTree: [],
  orgList: [],
  orgIds: [],
  orgUserTree: [],
  orgUserList: [],
  orgUserIds: [],
  roleList: [],
  roleTree: [],
  roleIds: []
};
const mutations = {
  SET_ORGS: (state, data) => {
    state.orgTree = data;
  },
  SET_ORGLIST: (state, list) => {
    state.orgList = list;
  },
  SET_USER_ORGS: (state, data) => {
    state.orgUserTree = data;
  },
  SET_USERORGLIST: (state, list) => {
    state.orgUserList = list;
  },
  SET_REGIONS: (state, data) => {
    state.regionTree = data;
  },
  SET_ALLORGS: (state, data) => {
    state.orgIds = data;
  },
  SET_ALLUSERORGS: (state, data) => {
    state.orgUserIds = data;
  },
  SET_ALLREGIONS: (state, data) => {
    state.regionIds = data;
  },
  SET_ROLELIST: (state, data) => {
    state.roleList = data;
  },
  SET_ALLROLES: (state, data) => {
    state.roleIds = data;
  },
  SET_ROLES: (state, data) => {
    state.roleTree = data;
  }
};
const actions = {
  // 区域树(赵许提供)
  GenerateRegions({ commit, state }) {
    return new Promise((resolve, reject) => {
      if (state.regionTree.length && state.regionTree.length.length > 0) {
        resolve(state.regionTree);
      } else {
        GetAreaTree({
          keyword: '',
          productCode: '',
          tenantId: ''
        })
          .then(res => {
            let { status, resultData } = res;
            if (status === 'complete') {
              let arr = [];
              resultData.map((region, idx) => {
                let obj = null;
                if (region.children && region.children.length > 0) {
                  obj = {
                    children: get(region, 'name'),
                    title: region.name,
                    key: region.id,
                    value: region.id,
                    isLeaf: false,
                    scopedSlots: { title: 'title' }
                  };
                } else {
                  obj = {
                    title: region.name,
                    key: region.id,
                    value: region.id,
                    isLeaf: true,
                    scopedSlots: { title: 'title' }
                  };
                }
                arr.push(obj);
              });
              commit('SET_REGIONS', arr);
              commit('SET_ALLREGIONS', getId(resultData, []));
              resolve(arr);
            }
          })
          .catch(e => {
            reject(new Error('获取区域失败'));
          });
      }
    });
  },

  GenerateOrgs({ commit, state }) {
    return new Promise((resolve, reject) => {
      if (state.orgTree.length && state.orgTree.length > 0) {
        resolve(state.orgTree);
      } else {
        GetOrgTreeByUser()
          .then(res => {
            let { resultData } = res;
            let arr = [];
            resultData = resultData || [];
            resultData.forEach((org, idx) => {
              let obj = null;
              if (org.children && org.children.length > 0) {
                obj = {
                  children: get(org, 'name'),
                  isLeaf: false,
                  title: org.name,
                  value: org.id,
                  key: org.id,
                  scopedSlots: { title: 'title' }
                };
              } else {
                obj = {
                  title: org.name,
                  key: org.id,
                  value: org.id,
                  isLeaf: true,
                  scopedSlots: { title: 'title' }
                };
              }
              arr.push(obj);
            });
            let orgList = flatten(resultData, []);

            commit('SET_ORGS', arr);
            commit(
              'SET_ALLORGS',
              orgList.map(o => o.id)
            );
            commit('SET_ORGLIST', orgList);
            resolve(arr);
          })
          .catch(e => {
            reject(new Error('获取组织失败'));
          });
      }
    });
  },

  // 根据用户获取组织树
  GenerateOrgsByUser({ commit, state }) {
    return new Promise((resolve, reject) => {
      if (state.orgUserTree.length && state.orgUserTree.length > 0) {
        resolve(state.orgUserTree);
      } else {
        GetOrgTreeByUser()
          .then(res => {
            let resultData = res.resultData || [];
            let arr = [];
            resultData.forEach((org, idx) => {
              let obj = null;
              if (org.children && org.children.length > 0) {
                obj = {
                  children: get(org, 'name'),
                  isLeaf: false,
                  title: org.name,
                  value: org.id,
                  key: org.id,
                  scopedSlots: { title: 'title' }
                };
              } else {
                obj = {
                  title: org.name,
                  key: org.id,
                  value: org.id,
                  isLeaf: true,
                  scopedSlots: { title: 'title' }
                };
              }
              arr.push(obj);
            });
            let orgList = flatten(resultData, []);

            commit('SET_USER_ORGS', arr);
            commit(
              'SET_ALLUSERORGS',
              orgList.map(o => o.id)
            );
            commit('SET_USERORGLIST', orgList);
            resolve(arr);
          })
          .catch(e => {
            reject(new Error('获取组织失败'));
          });
      }
    });
  },
  // 角色树
  GenerateRoles({ commit, state }) {
    return new Promise((resolve, reject) => {
        GetRoleTree().then(res => {
          let resultData = res.resultData || [];
            let arr = [];
            resultData.forEach((role, idx) => {
              let obj = null;
              if (role.children && role.children.length > 0) {
                obj = {
                  children: get(role, 'roleName'),
                  isLeaf: false,
                  title: role.roleName,
                  value: role.roleId,
                  key: role.roleId,
                  scopedSlots: { title: 'title' }
                };
              } else {
                obj = {
                  title: role.roleName,
                  key: role.roleId,
                  value: role.roleId,
                  isLeaf: true,
                  scopedSlots: { title: 'title' }
                };
              }
              arr.push(obj);
            });
            let roleList = flatten(resultData, []);

            commit('SET_ROLES', arr);
            commit(
              'SET_ALLROLES',
              roleList.map(o => o.roleId)
            );
            commit('SET_ROLELIST', roleList);
            resolve(arr);
        })
        .catch(e => {
          reject(new Error('获取角色失败'));
        });
    });
  }
};
export default {
  namespaced: true,
  state,
  mutations,
  actions
};
