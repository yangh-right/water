<template>
  <!-- 操作日志 -->
  <div class="operation-log wbgc-card full-view">
    <div class="wfc1">操作日志</div>
    <div class="log-steps wbc2" v-if="logList.length">
      <div class="step-item" v-for="(opt, index) of logList" :icon="opt.icon" :key="opt.id">
        <div class="step-icon">
          <img v-if="index === 0" class="step-img" :src="doneImg" alt="" />
          <span v-else class="step-point"></span>
          <span class="step-line" :class="index === logList.length - 1 ? 'end-line' : ''"></span>
        </div>
        <div class="step-content">
          <div class="step-title">
            <div class="title-left">类型:</div>
            <div class="title-right">
              {{ opt.typeName || '' }}
            </div>
          </div>
          <div class="step-title">
            <div class="title-left">执行人:</div>
            <div class="title-right">
              {{ opt.technician }}
            </div>
          </div>
          <div class="step-title" style="padding-bottom: 18px;">
            <div class="title-left">时间:</div>
            <div class="title-right">
              {{ opt.completionDate ? opt.completionDate.split(' ')[0] : '' }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <w-empty v-else />
  </div>
</template>

<script>
import doneImg from '@/assets/images/default/device/ic_done@2x.png';
export default {
  name: 'OperationLog',
  props: {
    serviceId: {
      type: String,
      default: '' //主键id
    },
    type: {
      type: String,
      default: '' //主键id
    }
  },
  data() {
    return {
      doneImg,
      typeObj: {},
      logList: [],
      stateColor: '#33ac2e'
    };
  },
  computed: {},
  watch: {
    serviceId() {
      this.getDeviceLogList();
    }
  },
  created() {
    this.getSystemDictList();
  },
  activated() {
    this.getDeviceLogList();
  },
  methods: {
    // 获取操作日志列表
    async getDeviceLogList() {
      if (this.serviceId) {
        this.logList = [];
        const { resultData, status } = await this.$http.get(
          `/maintenanceRecords/getByDevice?equipmentId=${this.serviceId}&equipmentType=${this.type}`
        );
        if (status === 'complete') {
          setTimeout(() => {
            this.logList = resultData?.map(item => {
              return {
                id: item.id,
                typeName: item.typeName,
                completionDate: item.completionDate,
                technician: item.technician
              };
            });
          }, 200);
        } else {
          this.logList = [];
        }
      }
    },
    // 数据字典
    async getSystemDictList() {
      const { resultData } = await this.$http.get(
        'sysDict/sysDictListByCode/' + 'deviceManufacturerType'
      );
      resultData.forEach(item => {
        this.typeObj[item.dictValue] = item.dictName;
      });
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
    .step-content {
      display: flex;
      flex-direction: column;
    }
    .step-title {
      font-size: 14px;
      display: flex;
      flex-direction: row;
      .title-left {
        width: auto;
        padding-right: 10px;
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
