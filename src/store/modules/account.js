/*
 * @Description: 请输入....
 * @Author: huhaiou
 * @Date: 2022-02-25 15:16:39
 * @LastEditTime: 2022-06-16 14:55:28
 * @LastEditors: huhaiou
 */
import { Base64 } from "js-base64";
import storage from '@/utils/storage';
import {
  ACCESS_TOKEN,
  USER_INFO,
  USER_ORGINFO,
  ORG_USERTREE,
} from '@/store/mutation-types';
import store from '..';
const SET_TOKEN = 'set_token';
const SET_USER = 'set_user';
const SET_PERMISSIONS = 'set_permissions';
const SET_ROLES = 'set_roles';
const SET_USER_ORGINFO = 'set_user_orginfo';
const SET_ORG_USERTREE = 'set_org_usertree';

const state = {
  userorgInfo: storage.get(USER_ORGINFO),
  orgusertree: storage.get(ORG_USERTREE),
  roles: [],
  permissions: [],
  token: storage.get(ACCESS_TOKEN, ''),
  user: storage.get(USER_INFO)
};

const getters = {
  token: state => state.token,
  roles: state => state.roles,
  permissions: state => state.permissions,
  user: state => state.user
};

const mutations = {
  [SET_TOKEN]: (state, token) => {
    state.token = token;
  },
  [SET_USER]: (state, info) => {
    state.user = info;
    let { loginName, token, userId, userName, tenantId, tenantType, updatePWD, logo, adminUser, tenantCode } = info;
    storage.set(USER_INFO, Base64.encode(JSON.stringify({ loginName, token, userId, userName, tenantId, tenantType, updatePWD, logo, adminUser, tenantCode })));
  },
  [SET_PERMISSIONS]: (state, permissions) => {
    state.permissions = [...permissions];
  },
  [SET_ROLES]: (state, roles) => {
    state.roles = [...roles];
  },
  [SET_USER_ORGINFO]: (state, userorgInfo) => {
    state.userorgInfo = userorgInfo;
  },
  [SET_ORG_USERTREE]: (state, orgusertree) => {
    state.orgusertree = orgusertree;
  },
};


const actions = {
};
export default {
  namespaced: true,
  getters,
  state,
  mutations,
  actions
};
