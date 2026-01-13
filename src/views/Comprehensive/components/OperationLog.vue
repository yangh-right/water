<template>
  <!-- 操作日志 -->
  <div class="operation-log wbgc-card full-view">
    <div class="wfc1">操作日志</div>
    <div v-show="deviceStatus" class="log-use">
      <span class="label wfc3">使用状态：</span>
      <span class="value" :style="{ color: stateColor }">{{ handleDeviceStatus(deviceStatus) }}</span>
    </div>
    <div v-show="responsibleUser" class="log-person">
      <span class="label wfc3">责任人：</span>
      <span class="value">{{ handleResponsibleUser(responsibleUser) }}</span>
    </div>
    <div class="log-steps wbc2" v-if="logList.length">
      <div class="step-item" v-for="(opt, index) of logList" :icon="opt.icon" :key="opt.id">
        <div class="step-icon">
          <img v-if="index === 0" class="step-img" :src="doneImg" alt="" />
          <span v-else class="step-point"></span>
          <span class="step-line" :class="index === logList.length - 1 ? 'end-line' : ''"></span>
        </div>
        <div class="step-title">
          <div class="title-left">{{ opt.logInfo }}</div>
          <div class="title-right">
            <!-- <a @click="handleUserName(opt)">{{ opt.roleName }}{{ opt.userName }}</a> -->
            <span>{{ opt.roleName }}{{ opt.userName }}</span>
            <span class="title-time wfc3">{{ opt.createTime | formatTime }}</span>
          </div>
        </div>
      </div>
    </div>
    <w-empty v-else />
    <PersonInfo ref="personInfo" :userID="userID"></PersonInfo>
  </div>
</template>

<script>
import PersonInfo from './person-info.vue';
import doneImg from '@/assets/images/default/device/ic_done@2x.png';
import moment from 'moment';
import { mapState } from 'vuex';
import {
getOrgUserTreeOnlyUserId
} from '@/api/public';
export default {
  name: 'OperationLog',
  components: { PersonInfo },
  props: {
    waterPlantId: {
      type: String,
      default: ''
    },
    serviceId: {
      type: String,
      default: '' //主键id
    },
    type: {
      type: Number,
      default: 0 //0 设备日志 1 设备型号日志
    },
    deviceStatus: [String, Number],
    responsibleUser: {
      type: String,
      default: '' //负责人
    }
  },
  filters: {
    formatTime(val) {
      return moment(val).format('YYYY-MM-DD HH:mm');
    }
  },
  data() {
    return {
      doneImg,
      logList: [],
      userInfo: {},
      userID: '',
      deviceStatusList: [],
      responsibleUserList: [],
      stateColor: '#33ac2e'
    };
  },
  computed: {
    ...mapState('account', ['user'])
  },
  watch: {
    waterPlantId() {
      if (this.type === 0) {
        this.getDeviceLogList();
      }
    },
    serviceId() {
      this.getDeviceLogList();
    }
  },
  activated() {
    this.getSystemDictList();
    this.getOrgUserTreeOnlyUserId();
    this.getDeviceLogList();
  },
  methods: {
    // 获取操作日志列表
    async getDeviceLogList() {
      if ((this.type === 0 && this.waterPlantId && this.serviceId) || (this.type === 1 && this.serviceId)) {
        this.logList = [];
        const { resultData } = await this.$http.post('/DeviceLog/getDeviceLogList', {
          waterPlantId: this.type === 0 ? this.waterPlantId : undefined,
          serviceId: this.serviceId,
            tenantId: this.user.tenantId,
          type: this.type
        });
        this.logList = resultData?.map(item => {
          return {
            id: item.id,
            createTime: item.createTime,
            logInfo: item.logInfo,
            roleName: item.userVO?.userRoleList[0]?.roleName === '默认租户角色' ? null : item.userVO.userRoleList[0].roleName + '-',
            userID: item.userVO.id,
            userName: item.userVO.userName
          };
        });
      }
    },
    handleUserName(opt) {
      this.userID = opt.userID;
      this.$refs.personInfo.show();
    },
    // 获取负责人列表
    async getOrgUserTreeOnlyUserId() {
      let params={
        keyword: '',
        userRoleIds: []
      }
      const { resultData } = await getOrgUserTreeOnlyUserId(params);
      let userList = [];
      this.getUseList(resultData, userList);
      this.responsibleUserList = userList?.map(i => {
        return {
          label: i.name,
          value: i.id
        };
      });
    },
    getUseList(tree, list) {
      tree.forEach(item => {
        if (item.children?.length) {
          this.getUseList(item.children, list);
        } else {
          list.push(item);
        }
      });
    },
    // 数据字典
    async getSystemDictList() {
      const { resultData } = await this.$http.get('sysDict/sysDictListByCode/' + 'purification_use_state');
      this.deviceStatusList = resultData?.map(i => {
        return {
          label: i.dictName,
          value: i.dictCode,
          ...i
        };
      });
    },
    handleDeviceStatus(val) {
      this.stateColor = this.deviceStatusList?.find(item => item.value === String(val))?.remark;
      return this.deviceStatusList?.find(item => item.value === String(val))?.label || val;
    },
    handleResponsibleUser(val) {
      return this.responsibleUserList?.find(item => item.value === String(val))?.label || val;
    }
  }
};
</script>

<style lang="less" scoped>
.operation-log {
  padding: 16px;
  display: flex;
  flex-direction: column;
  min-width: 234px;
  height: 100%;
  .log-name {
    flex: none;
  }
  .log-use {
    margin-top: 10px;
    .label {
      color: #999;
    }
    .value {
      color: #33ac2e;
    }
  }
  .log-person {
    margin-top: 10px;
    .label {
      color: #999;
    }
  }
  .log-steps {
    margin-top: 10px;
    max-height: calc(100% - 50px);
    // flex: 1;
    overflow-y: auto;
    .step-item {
      display: flex;
      flex-direction: row;
    }
    .step-icon {
      position: relative;
      width: 20px;
      margin-right: 10px;
      text-align: center;
      .step-img {
        position: absolute;
        top: 5px;
        left: calc(50% - 8px);
        width: 18px;
        height: 18px;
        z-index: 10;
      }
      .step-point {
        display: inline-block;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #33ac2e;
      }
      .step-line {
        position: absolute;
        top: 5px;
        left: 50%;
        display: inline-block;
        width: 1px;
        height: 100%;
        background: #33ac2e;
        z-index: 1;
      }
      .end-line {
        height: calc(100% - 25px);
      }
    }
    .step-title {
      padding-bottom: 18px;
      font-size: 14px;
      display: flex;
      flex-direction: row;
      .title-left {
        width: 42px;
        padding-right: 10px;
        // color: #333;
      }
      .title-right {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        .title-time {
          font-size: 12px;
        }
      }
    }
  }
}
</style>
