<!--
 * @Author: wangyr
 * @Date: 2023-06-15 10:59:17
 * @LastEditors: fengtaotao
 * @LastEditTime: 2025-04-01 09:36:06
 * @Description:
-->
<template>
  <div :class="['page', themeConfig.className]">
    <div class="page-header">
      <div class="weather">
        <div class="address">
          <img src="@/assets/safeCockpit/location.png" alt="" />
          <div class="text">{{ address }}</div>
        </div>
        <div class="time">{{ currentTime }}</div>
      </div>
      <div class="config" @click="handleTabs">
        <img src="@/assets/safeCockpit/config.png" alt="" />
        <div class="text">配置</div>
      </div>
      <div class="page-header-title">安全驾驶舱</div>
      <div></div>
    </div>
    <!-- 加载中 -->
    <w-spin v-if="loading" />
    <!-- 驾驶舱 -->
    <div id="cockpit" class="page-content">
      <div v-for="item in moduleList" :key="item.buttonCode" class="page-content-box">
        <component
          :cardTitle="item.name"
          :waterPlantId="waterPlantId"
          :is="item.buttonCode"
        ></component>
      </div>
    </div>
    <modules-dialog
      :visible="rangeVisible"
      :keys="moduleKeys"
      @rangeOK="rangeOK"
      :moduleType="moduleType"
      @rangeCancel="rangeCancel"
    ></modules-dialog>
  </div>
</template>
<script>
import moment from 'moment';
import modulesDialog from '@/components/modulesDialog.vue';
import Sortable from 'sortablejs';
import uuid from '@/utils/uuid';
import { themeMixin } from '@/core/mixins.ts';
import { queryCockpitList, editPlate } from '@/api/cockpit.js';
import { getWeather } from '@/api/public';
export default {
  name: 'safeCockpit',
  components: {
    modulesDialog,
    perimeterAlarm: () => import('./models/perimeterAlarm.vue'),
    accessVideo: () => import('./models/accessVideo.vue'),
    safetyBracelets: () => import('./models/safetyBracelets.vue'),
    temperatureInfo: () => import('./models/temperatureInfo.vue'),
    hazardousOrder: () => import('./models/hazardousOrder.vue'),
    executionControl: () => import('./models/executionControl.vue'),
    aiAlarmAnalysis: () => import('./models/aiAlarmAnalysis.vue'),
    envSafe: () => import('./models/envSafe.vue'),
    riskManagement: () => import('./models/riskManagement.vue'),
    dangerousManage: () => import('./models/dangerousManage.vue'),
    specialDevice: () => import('./models/specialDevice.vue'),
    doorManage: () => import('./models/doorManage.vue')
  },
  mixins: [themeMixin],
  data() {
    return {
      themeConfigMap: {
        default: {
          className: 'cockpit-default'
        },
        dark: {
          className: 'cockpit-dark'
        }
      },
      address: '',
      allList: [],
      rangeVisible: false,
      waterPlantId: '',
      currentTime: '',
      moduleList: [],
      weather: {
        type: '',
        temperature: ``,
        now: ''
      },
      loading: false,
      current: '2',
      moduleType: '2',
      moduleKeys: []
    };
  },
  computed: {},
  activated() {
    this.getBaiduWeather();
    setInterval(() => {
      this.currentTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    }, 1000);
  },
  created() {
    this.getWaterPlant();
    this.getUserTree();
  },
  mounted() {
    this.changeSort();
  },
  methods: {
    async getUserTree() {
      let { resultData, status } = await queryCockpitList(this.moduleType);
      if (status === 'complete') {
        // 模块展示
        this.moduleList = resultData.filter(item => item.isShow === '1');
        this.allList = resultData;
        this.moduleList.forEach(item => {
          item['uuid'] = uuid();
        });
        this.moduleKeys = this.moduleList.map(item => item.buttonCode);
      }
    },
    async getWaterPlant() {
      const { resultData } = await this.$http.post('waterPlantClient/getWaterPlants');
      this.waterPlantId = resultData?.[0]?.id || '';
    },
    changeSort() {
      const dom = document.querySelector('#cockpit');
      Sortable.create(dom, {
        animation: 150,
        filter: '.add-plate',
        chosenClass: '', // 被选中项的css 类名
        dragClass: 'sortable-chosen', // 正在被拖拽中的css类名
        onUpdate: evt => {
          // evt.newIndex evt.oldIndex 得到拖动的元素索引
          // 根据索引找到展示的模块名称
          let newIndexValue = this.moduleList[evt.newIndex].name;
          let oldIndexValue = this.moduleList[evt.oldIndex].name;
          // 根据拖动的模块名称找到总模块的拖动索引
          let index1 = this.allList.findIndex(item => item.name === newIndexValue);
          let index2 = this.allList.findIndex(item => item.name === oldIndexValue);
          // 交换两个模块的sort值
          [this.allList[index1].sort, this.allList[index2].sort] = [
            this.allList[index2].sort,
            this.allList[index1].sort
          ];
          let params = {
            charts: this.allList,
            moduleType: this.moduleType
          };
          editPlate(params).then(res => {
            if (res.status === 'complete') {
              this.$message.success(res.resultData);
            } else {
              this.$message.warning(res.errorMessage);
            }
          });
        }
      });
    },
    // 天气接口
    async getBaiduWeather() {
      let { resultData, status } = await getWeather();
      if (status === 'complete') {
        let { result } = resultData;
        this.address = result.location.city;
        this.weather = {
          type: result.now.text,
          temperature: `${result.forecasts[0].low}℃~${result.forecasts[0].high}℃`,
          now: `${result.now.temp}℃`
        };
      }
    },
    handleTabs() {
      this.rangeVisible = true;
    },
    rangeOK(keys, modules) {
      this.rangeVisible = false;
      let params = {
        charts: modules,
        moduleType: this.moduleType
      };
      editPlate(params).then(res => {
        let { status } = res;
        if (status === 'complete') {
          this.$message.success('配置成功!');
          this.getUserTree();
        }
      });
    },
    rangeCancel() {
      this.rangeVisible = false;
    },
    goTeamManage() {
      this.goto({
        path: '/System/OnDutyConfig/ShiftManage'
      });
    }
  }
};
</script>
<style lang="less" scoped>
.page {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 100%;
  background: #f0f4f3;
  border-radius: 4px;
  &.cockpit-dark {
    background: #12161d;
    .page-header {
      background: url('~@/assets/cockpit/title_bg_dark.png') center center no-repeat;
      background-size: 100% 100%;
      .page-header-title {
        color: #fff;
      }
      .weather {
        .address {
          .text {
            color: #fff;
          }
        }
        .time {
          color: #fff;
        }
      }
    }
  }
  .page-header {
    position: relative;
    width: 100%;
    height: 75px;
    background: url('~@/assets/cockpit/title_bg.png') center center no-repeat;
    background-size: 100% 100%;
    .weather {
      position: absolute;
      top: 25px;
      left: 4px;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      .address {
        display: flex;
        align-items: center;
        img {
          width: 20px;
          height: 20px;
        }
        .text {
          margin-left: 4px;
          font-family: PingFangSC-Medium, sans-serif;
          font-weight: 500;
          font-size: 16px;
          color: #235f5e;
          letter-spacing: 0;
        }
      }
      .time {
        margin-left: 45px;
        font-family: PingFangSC-Medium, sans-serif;
        font-weight: 500;
        font-size: 14px;
        color: #235f5e;
        letter-spacing: 0;
      }
    }
    .config {
      position: absolute;
      top: 25px;
      right: 21px;
      width: 72px;
      height: 29.37px;
      background: #008583;
      border-radius: 4px;
      padding: 4px 12px;
      display: flex;
      align-items: center;
      cursor: pointer;
      img {
        width: 16px;
        height: 16px;
      }
      .text {
        margin-left: 4px;
        font-family: PingFangSC-Medium, sans-serif;
        font-weight: 500;
        font-size: 14px;
        color: #ffffff;
        letter-spacing: 0;
      }
    }
  }
  .page-header-title {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: MiSans-Bold, sans-serif;
    font-weight: 700;
    font-size: 37.48px;
    color: #0d4f4e;
    letter-spacing: 5px;
  }
  .page-content {
    width: 100%;
    height: calc(100% - 75px);
    padding: 0 12px 12px 12px;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    align-content: flex-start;
    justify-content: flex-start;
    overflow: auto;
    .page-content-box {
      width: calc((100% - 24px) / 3);
      height: 300px;
      margin-right: 12px;
      margin-bottom: 12px;
      padding: 16px;
      border-radius: 4px;
      background: var(--supply-cockpit-card-bg);
      .exam-rank {
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: PingFangSC-Regular, sans-serif;
        font-weight: 400;
        font-size: 14px;
        color: #999999;
        letter-spacing: 0;
        cursor: pointer;
      }
    }
    .page-content-box:nth-child(3) {
      margin-right: 0px;
    }
    .page-content-box:nth-child(6) {
      margin-right: 0px;
    }
    .page-content-box:nth-child(7) {
      margin-bottom: 0px;
    }
    .page-content-box:nth-child(8) {
      margin-bottom: 0px;
    }
    .page-content-box:nth-child(9) {
      margin-bottom: 0px;
      margin-right: 0px;
    }
  }
}

.wpg-spin {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: calc(100% - 75px);
}
/deep/ .wpg-select-selection--single {
  height: 30px;
  .wpg-select-selection__rendered {
    line-height: 28px;
  }
}
/deep/ .wpg-input {
  height: 30px;
}
</style>
