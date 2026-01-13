/*
 * @Description: 通用，专用规则共享状态
 * @Author: zhangtianwen
 * @LastEditTime: 2021-03-17 10:41:33
 */
import {
  getAllRules,
  queryAlarmTagList,
  getAlarmLevel,
  getDictData,
  selectOperationByOrgId,
  getAllpoints,
  queryOrgAllRoles,
  getOrgTreeByUser
} from '@/api/index';
const specialHours = new Array(24).fill(0).map((time,i) => {
    let partStart = i;
    let endStart = i + 1;
    let start = partStart < 10 ? `0${partStart}:00` : `${partStart}:00`;
    let end = endStart < 10 ? `0${endStart}:00` : `${endStart}:00`;
    return {
        label: `${start}-${end}`,
        value: i
    }
})
const state = {
    tags:[],
    alarmLevles:[],
    pushTypes:[], //推送机制
    alarmStrategys:[], //触发策略
    judgments:[], //判断方式
    operationKnowledgeList:[], //运维知识库,
    knowledgeChangeKey:'', //运维知识库变更随机数,
    allPoints:[],
    specialHours,
    updateNormalRuleTime:'',
    updateSpecialRuleTime:'',
    engineRules:[],
    judgmentModeOther:[],
    roles:[], //所有角色
    orgTree:[] //组织树
}
const mutations = {
    SET_TAGS: (state, tags) => {
        state.tags = tags;
    },
    SET_ENGINERULES: (state, engineRules) => {
        state.engineRules = engineRules;
    },
    SET_LEVELS: (state, levels) => {
        state.alarmLevles = levels;
    },
    SET_PUSH_TYPE: (state, pushTypes) => {
        state.pushTypes = pushTypes;
    },
    SET_ALARM_STRATEGY: (state, alarmStrategys) => {
        state.alarmStrategys = alarmStrategys;
    },
    SET_JUDGMENT: (state, judgments) => {
        state.judgments = judgments;
    },
    SET_OPERATION_KNOWLEDGE: (state, operationKnowledgeList) => {
        state.operationKnowledgeList = operationKnowledgeList;
    },
    change_OPERATION_KNOWLEDGE: (state, knowledgeChangeKey) => {
        state.knowledgeChangeKey = knowledgeChangeKey;
    },
    SET_POINTS: (state, points) => {
        state.allPoints = points;
    },
    SET_OTHER_JUDGEMENT: (state, judgment) => {
        state.judgmentModeOther = judgment;
    },
    SET_HOURS: (state, hours) => {
        state.specialHours = state.specialHours.map(({label, value}) => {
            return {
                label,
                value,
                disabled: hours.includes(value)
            }
        })
    },
    SET_ROLES: (state, roles) => {
        state.roles = roles
    },
    UPDATE_NORMAL_RULE: (state, time) => {
        state.updateNormalRuleTime = time
    },
    UPDATE_SPECIAL_RULE: (state, time) => {
        state.updateSpecialRuleTime = time
    },
    UPDATE_ORG_TREE: (state, orgTree) => {
        state.orgTree = orgTree
    },
};
const actions = {
    setTags({ commit }) {
        return new Promise((resolve, reject) => {
            queryAlarmTagList().then(resultData => {
                commit('SET_TAGS', resultData)
                resolve();
            }).catch(error => {
                reject(error);
            });
        });
    },
    setOrgTree({ commit }) {
        return new Promise((resolve, reject) => {
            getOrgTreeByUser().then(resultData => {
                commit('UPDATE_ORG_TREE', resultData)
                resolve();
            }).catch(error => {
                reject(error);
            });
        });
    },
    setEngineRules({ commit }) {
        return new Promise((resolve, reject) => {
            getAllRules().then(resultData => {
                commit('SET_ENGINERULES', resultData)
                resolve();
            }).catch(error => {
                reject(error);
            });
        });
    },
    setAlarmLevel({ commit }) {
        return new Promise((resolve, reject) => {
            getAlarmLevel().then(({ alarmList }) => {
                commit('SET_LEVELS', alarmList)
                resolve();
            }).catch(error => {
                reject(error);
            });
        });
    },
    setPushType({ commit }) {
        return new Promise((resolve, reject) => {
            getDictData('pushMechanism').then(pushTypes => {
                commit('SET_PUSH_TYPE', pushTypes)
                resolve();
            }).catch(error => {
                reject(error);
            });
        });
    },
    setAlarmStrategy({ commit }) {
        return new Promise((resolve, reject) => {
            getDictData('triggerStrategy').then(alarmStrategys => {
                commit('SET_ALARM_STRATEGY', alarmStrategys)
                resolve();
            }).catch(error => {
                reject(error);
            });
        });
    },
    setJudgment({ commit }) {
        return new Promise((resolve, reject) => {
            getDictData("judgmentMode").then(judgments => {
                commit('SET_JUDGMENT', judgments)
                resolve();
            }).catch(error => {
                reject(error);
            });
        });
    },
    setOtherJudgment({ commit }) {
        return new Promise((resolve, reject) => {
            getDictData("judgmentModeOther").then(judgments => {
                commit('SET_OTHER_JUDGEMENT', judgments)
                resolve();
            }).catch(error => {
                reject(error);
            });
        });
    },
    setOperationKnowledge({ commit }, params = {}) {
        return new Promise((resolve, reject) => {
            selectOperationByOrgId(params).then(list => {
                commit('SET_OPERATION_KNOWLEDGE', list)
                resolve();
            }).catch(error => {
                reject(error);
            });
        });
    },
    changeOperationKnowledge({ commit }, key='') {
        commit('change_OPERATION_KNOWLEDGE', key)
    },
    setPoints({ commit }, params={ keyword: ''}) {
        return new Promise((resolve, reject) => {
            getAllpoints(params).then(list => {
                commit('SET_POINTS', list)
                resolve();
            }).catch(error => {
                reject(error);
            });
        });
    },
    setHours({ commit }, hours) {
        commit('SET_HOURS', hours)
    },
    setRoles({ commit }, data={}) {
        return new Promise((resolve, reject) => {
            queryOrgAllRoles(data).then(roles => {
                commit('SET_ROLES', roles)
                resolve();
            }).catch(error => {
                reject(error);
            });
        });
    },
    updateNormalRule({ commit }, time) {
        commit('UPDATE_NORMAL_RULE', time)
    },
    updateSpecialRule({ commit }, time) {
        commit('UPDATE_SPECIAL_RULE', time)
    },
}
export default {
    namespaced: true,
    state,
    mutations,
    actions
};
