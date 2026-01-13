import { getDictByCode, getAllDict } from '@/api/work';
import { getAllDictBySyscode, getListCurrent } from '@/api/index';
import { getDictList2 } from '@/api';
import { getDictTree2 as apiGetDictTree, getDictList } from '@/api/cockpit';
import { camelCase, curry } from 'lodash-es';
import { getUserOrgs } from '@/api/runPro';
import { treeFormat } from '@/utils/util';
import { getAllAreas } from '@/api/runMonitor';
import { operation_type, plan_status, life_day } from '@/enum/dict';
import { agingStatus } from '@/enum/ticket-list';
import { sysDictListByCode } from '@/api/manage';
import config from '@/config/setting.config';
import Vue from 'vue';

/**
 * @description: 字典
 * @param {*} props
 * @param {*} state
 * @param {*} commit
 * @param {*} code
 * @return {*}
 */
const dictFn = async (props, { state, commit }, code) => {
  if (!state[camelCase(code)]) {
    const list = await getDictList(code);

    // if (code === 'cockpit_business_type' || code === 'cockpit_show_type') {
    //   list.forEach(item => {
    //     item.dictName  = item.name
    //     item.dictCode = item.code
    //   });
    // }
    const options = treeFormat(list, { ...props, remark: true });
    commit('SET_DICT1', { code, options });
  }
};
/**
 * @description: 字典树
 * @param {*} props
 * @param {*} state
 * @param {*} commit
 * @param {*} code
 * @return {*}
 */
const dictTreeFn = async (props, { state, commit }, code) => {
  if (!state[camelCase(code)]) {
    const tree = await apiGetDictTree(code);
    console.log('tree', tree);

    // 移除禁用节点
    const removeDisabledNode = function(nodes) {
      return nodes.map(v => {
        let node = {
          label: v[props.label],
          value: v[props.value],
          remark: v.remark
        };
        if (v.child?.length) {
          node.children = removeDisabledNode(v.child);
        }
        return node;
      });
    };

    commit('SET_DICT1', { code, options: removeDisabledNode(tree) });
  }
};

export default {
  namespaced: true,
  state: {
    loaded: false,

    ticket_app_code: config.ticketAppCode,
    dictory: {},
    dictory1: {},
    // operation_type: operation_type,
    operation_type: [],
    plan_status,
    life_day,
    user_orgs: [],
    all_areas: [],
    ticket_status: [], // 工单状态
    ticket_template_type: [], // 模板类型;大类
    ticket_template_type_all_child: [], // 小类
    icket_template_tree: [], // 模板类型树
    step_status: [], // 节点状态
    aging_status: [], // 时效状态
    deal_user_type: [], // 办理人类型
    step_type: [], // 节点类型/表单类型
    ticket_priority: [], // 优先级
    ticket_sys_code: [], // 系统来源
    dict: {},
    pump_house_group: [],
    line_list: [], //线路
    standard_name: [], // 标准名称
    factory_standard: '内控', //厂标
    national_standard: '设计' //国标
  },
  getters: {},

  mutations: {
    SET_OPERATION_TYPE: (state, data) => {
      state.operation_type = data;
    },
    SET_PUMP_HOUSE_GROUP: (state, data) => {
      state.pump_house_group = data;
    },
    SET_DICTORY: (state, dictory) => {
      state.dictory = dictory;
      state.loaded = true;
    },
    SET_DICTORY1: (state, dictory) => {
      state.dictory1 = dictory;
      state.loaded = true;
    },
    SET_DICTDATA: (state, data) => {
      state[data.code] = data.result;
    },
    SET_DICT: (state, payload) => {
      state.dict[payload.key] = payload.value;
    },
    SET_DICT1: (state, { code, options }) => {
      Vue.set(state, camelCase(code), options);
    },
    SET_ORGS: (state, data) => {
      state.user_orgs = data;
    },

    SET_STANDARD_NAME: (state, data) => {
      console.log('data', data);
      state.standard_name = data;
      data.forEach(element => {
        if (element.dictCode == 'factory_standard') {
          state.factory_standard = element.dictName;
        }
        if (element.dictCode == 'national_standard') {
          state.national_standard = element.dictName;
        }
      });
    },

    SET_AREAS: (state, data) => {
      state.all_areas = data;
    },
    SET_LINE_TYPE: (state, data) => {
      state.line_list = data;
    }
  },

  actions: {
    /**
     * @description: 获取字典（仅一层）
     * @return {*}
     */
    getDict1: curry(dictFn)({ label: 'name', value: 'code' }),
    getDict2: curry(dictFn)({ label: 'dictName', value: 'dictCode' }),

    /**
     * @description: 获取字典（dictCode）
     * @return {*}
     */
    getDictCode: curry(dictFn)({ label: 'name', value: 'code' }),

    /**
     * @description: 获取字典树
     * @return {*}
     */
    getDictTree: curry(dictTreeFn)({ label: 'name', value: 'value' }),

    /**
     * @description: 获取字典树（dictCode）
     * @return {*}
     */
    getDictCodeTree: curry(dictTreeFn)({ label: 'name', value: 'code' }),
    GenerateALLArea({ commit, state }) {
      return new Promise((resolve, reject) => {
        if (state.all_areas.length) {
          resolve(state.all_areas);
        } else {
          getAllAreas()
            .then(res => {
              let data = res.resultData || [];

              commit('SET_AREAS', data);
              resolve(data);
            })
            .catch(e => {
              reject(new Error('获取区域失败'));
            });
        }
      });
    },
    GenerateUserOrgs({ commit, state }) {
      return new Promise((resolve, reject) => {
        if (state.user_orgs.length) {
          resolve(state.user_orgs);
        } else {
          getUserOrgs()
            .then(res => {
              let data = res.resultData || [];

              commit('SET_ORGS', data);
              resolve(data);
            })
            .catch(e => {
              reject(new Error('获取组织失败'));
            });
        }
      });
    },

    GenerateDictory({ commit, state }) {
      return new Promise((resolve, reject) => {
        if (state.loaded) {
          resolve(state.dictory);
        } else {
          getAllDict(config.systemCode)
            .then(res => {
              let { resultData } = res;
              let {
                all_small_type = [],
                ticket_sys_code = [],
                ticket_status = [],
                all_type_tree = []
              } = resultData;
              resultData = {
                ...resultData,
                ticket_sys_code,
                ticket_status,
                template_type: all_small_type,
                ticket_template_type: all_small_type
              };

              commit('SET_DICTORY', resultData);
              resolve(resultData);
            })
            .catch(e => {
              reject(new Error('获取数据字典失败'));
            });
        }
      });
    },

    GetDictData({ commit, state }, codes) {
      return new Promise((resolve, reject) => {
        let response = [];

        function callback() {
          if (response.length === codes.length) {
            resolve(response);
          }
        }

        for (let i = 0; i < codes.length; i++) {
          if (state[codes[i]].length === 0) {
            getDictByCode(codes[i])
              .then(res => {
                let { status, resultData } = res;
                if (status === 'complete') {
                  commit('SET_DICTDATA', {
                    code: codes[i],
                    result: resultData
                  });

                  response[i] = resultData;

                  callback();
                }
              })
              .catch(error => {
                reject(error);
              });
          } else {
            response[i] = state[codes[i]];
            callback();
          }
        }
        // resolve(response);
      });
    },

    GetOperationType({ commit, state }, codes) {
      return new Promise((resolve, reject) => {
        if (state.operation_type.length > 0) {
          resolve(state.operation_type);
        } else {
          sysDictListByCode('knowledge_type')
            .then(res => {
              let { resultData } = res;
              commit('SET_OPERATION_TYPE', resultData);
              resolve(resultData);
            })
            .catch(e => {
              reject(new Error('获取数据字典失败'));
            });
        }
      });
    },

    GetPumpHouseGroup({ commit, state }, codes) {
      return new Promise((resolve, reject) => {
        if (state.pump_house_group.length > 0) {
          resolve(state.pump_house_group);
        } else {
          sysDictListByCode('pump_house_group')
            .then(res => {
              let { resultData } = res;
              commit('SET_PUMP_HOUSE_GROUP', resultData);
              resolve(resultData);
            })
            .catch(e => {
              reject(new Error('获取数据字典失败'));
            });
        }
      });
    },

    GetStandardName({ commit, state }, codes) {
      return new Promise((resolve, reject) => {
        if (state.standard_name.length > 0) {
          resolve(state.standard_name);
        } else {
          sysDictListByCode('standard_name')
            .then(res => {
              let { resultData } = res;
              commit('SET_STANDARD_NAME', resultData);
              resolve(resultData);
            })
            .catch(e => {
              reject(new Error('获取数据字典失败'));
            });
        }
      });
    },

    GetDict({ commit, state }, payload) {
      return new Promise((resolve, reject) => {
        let type = payload,
          update = false;
        if (typeof payload === 'object') {
          type = payload.type;
          update = payload.update;
        }
        const _type = type.replace(/_([a-z])/g, (_, w) => w.toUpperCase());
        if (!update && state.dict[_type] !== void 0) {
          resolve(state.dict[_type]);
        } else {
          getDictList2(type)
            .then(list => {
              commit('SET_DICT', {
                key: _type,
                value: list
              });
              resolve(list);
            })
            .catch(reject);
        }
      });
    },
    GenerateDictory1({ commit }, sysCode) {
      return new Promise((resolve, reject) => {
        Promise.all([getAllDictBySyscode(sysCode), getListCurrent()])
          .then(([res, sysRes]) => {
            let { resultData } = res;

            resultData.ticket_sys_code = (sysRes.resultData || []).map(item => {
              return {
                code: item.productCode,
                name: item.productName
              };
            });

            resultData.aging_status = agingStatus;

            commit('SET_DICTORY1', resultData);
            resolve(resultData);
          })
          .catch(_ => {
            reject(new Error('获取数据字典失败'));
          });
      });
    }
  }
};
