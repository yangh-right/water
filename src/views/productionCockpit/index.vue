<!--
 * @Author: wangyr
 * @Date: 2023-06-15 10:59:17
 * @LastEditors: fengtaotao
 * @LastEditTime: 2025-04-01 09:36:06
 * @Description:
-->
<template>
  <!-- 页面容器，根据主题设置样式 -->
  <div :class="['page', themeConfig.className]">
    <!-- 页面头部 -->
    <div class="page-header">
      <!-- 天气信息 -->
      <div class="weather">
        <div class="address">
          <img src="@/assets/safeCockpit/location.png" alt="" />
          <div class="text">{{ address }}</div>
        </div>
        <div class="time">{{ currentTime }}</div>
      </div>
      <!-- 配置按钮 -->
      <div class="config" @click="handleTabs">
        <img src="@/assets/safeCockpit/config.png" alt="" />
        <div class="text">配置</div>
      </div>
      <!-- 页面标题 -->
      <div class="page-header-title">生产驾驶舱</div>
      <div></div>
    </div>
    <!-- 加载中 -->
    <w-spin v-if="loading" />
    <!-- 驾驶舱内容 -->
    <div id="cockpit" class="page-content">
      <!-- 遍历模块列表，动态加载组件 -->
      <div v-for="item in moduleList" :key="item.buttonCode" class="page-content-box">
        <component
          :cardTitle="item.name"
          :waterPlantId="waterPlantId"
          :is="item.buttonCode"
        ></component>
      </div>
    </div>
    <!-- 模块配置对话框 -->
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
    // 异步加载各个模块组件
    hydraulicLoad: () => import('./models/hydraulicLoad.vue'),
    actualTreatment: () => import('./models/actualTreatment.vue'),
    completionRate: () => import('./models/completionRate.vue'),
    inflowAnalysis: () => import('./models/inflowAnalysis.vue'),
    waterBalance: () => import('./models/waterBalance.vue'),
    treatmentAnalysis: () => import('./models/treatmentAnalysis.vue'),
    interWaterQuality: () => import('./models/interWaterQuality.vue'),
    outerWaterQuality: () => import('./models/outerWaterQuality.vue'),
    complianceRate: () => import('./models/complianceRate.vue'),
    sludgeSituation: () => import('./models/sludgeSituation.vue'),
    deviceOverview: () => import('./models/deviceOverview.vue'),
    equipmentRate: () => import('./models/equipmentRate.vue'),
    stockStatistics: () => import('./models/stockStatistics.vue'),
    maintenancePlan: () => import('./models/maintenancePlan.vue'),
    alarmList: () => import('./models/alarmList.vue'),
    deviceRepaire: () => import('./models/deviceRepaire.vue'),
    orderRate: () => import('./models/orderRate.vue'),
    inspectRate: () => import('./models/inspectRate.vue'),
    medicineCount: () => import('./models/medicineCount.vue'),
    waterMedicine: () => import('./models/waterMedicine.vue'),
    powerAnalysis: () => import('./models/powerAnalysis.vue')
  },
  mixins: [themeMixin], // 使用主题混入
  data() {
    return {
      // 主题配置
      themeConfigMap: {
        default: {
          className: 'cockpit-default'
        },
        dark: {
          className: 'cockpit-dark'
        }
      },
      address: '', // 地址信息
      allList: [], // 所有模块列表
      rangeVisible: false, // 配置对话框显示状态
      waterPlantId: '', // 水厂ID
      currentTime: '', // 当前时间
      moduleList: [], // 模块列表
      weather: {
        type: '', // 天气类型
        temperature: ``, // 温度
        now: '' // 当前温度
      },
      loading: false, // 加载状态
      current: '2',
      moduleType: '3', // 模块类型
      moduleKeys: [] // 模块键值列表
    };
  },
  computed: {},
  activated() {
    this.getBaiduWeather(); // 获取天气信息
    setInterval(() => {
      this.currentTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    }, 1000);
  },
  created() {
    this.getWaterPlant(); // 获取水厂信息
    this.getUserTree(); // 获取用户模块树
  },
  mounted() {
    this.changeSort(); // 初始化排序功能
  },
  methods: {
    // 获取用户模块树
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
    // 获取水厂信息
    async getWaterPlant() {
      const { resultData } = await this.$http.post('waterPlantClient/getWaterPlants');
      this.waterPlantId = resultData?.[0]?.id || '';
    },
    // 初始化排序功能
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
    // 获取天气信息
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
    // 处理配置按钮点击
    handleTabs() {
      this.rangeVisible = true;
    },
    // 处理配置确认
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
    // 处理配置取消
    rangeCancel() {
      this.rangeVisible = false;
    },
    // 跳转到班组管理
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
    .page-content-box:nth-child(9) {
      margin-right: 0px;
    }
    .page-content-box:nth-child(12) {
      margin-right: 0px;
    }
    .page-content-box:nth-child(15) {
      margin-right: 0px;
    }
    .page-content-box:nth-child(18) {
      margin-right: 0px;
    }
    .page-content-box:nth-child(19) {
      margin-bottom: 0px;
    }
    .page-content-box:nth-child(20) {
      margin-bottom: 0px;
    }
    .page-content-box:nth-child(21) {
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
