<template>
  <div class="page">
    <div class="form-warp">
      <w-form-model
        :labelCol="layout.labelCol"
        :wrapperCol="layout.wrapperCol"
        class="supply-w-full"
      >
        <w-row :gutter="8" justify="space-between" type="flex">
          <w-col v-bind="grid">
            <w-form-model-item name="waterPlantId" label="选择污水厂">
              <FactorySelect
                style="max-width:179px"
                @input="factoryChange"
                v-model.trim="waterPlantId"
                autoSelect
              ></FactorySelect>
            </w-form-model-item>
          </w-col>
          <w-col v-bind="grid">
            <w-form-model-item class="supply-float-right" :wrapperCol="{ flex: 1 }">
              <w-button type="primary" @click="goResult" style="margin-right:24px"
                >预测结果</w-button
              >
              <w-radio-group
                v-model="showType"
                button-style="solid"
                class="supply-whitespace-nowrap"
              >
                <w-radio-button value="chart">图表</w-radio-button>
                <w-radio-button value="data">数据</w-radio-button>
              </w-radio-group>
              <return-control
                :keep="true"
                :is-drill-down="true"
                class="supply-ml-3"
              ></return-control>
            </w-form-model-item>
          </w-col>
        </w-row>
      </w-form-model>
    </div>
    <!-- 预测预警 -->
    <div class="page-item">
      <water-quality
        :title="`${tabName}水质曲线`"
        :waterPlantId="waterPlantId"
        :showType="showType"
        :tabVal="tabVal"
        modleType="inflow"
      ></water-quality>
    </div>
    <div class="page-row">
      <module-evaluate
        :title="`${tabName}预测评价`"
        :waterPlantId="waterPlantId"
        :showType="showType"
        :activeModule="moduleId"
        :tabVal="tabVal"
      ></module-evaluate>
      <module-estimate
        :title="`${tabName}预测精度评估`"
        :waterPlantId="waterPlantId"
        :tabVal="tabVal"
      ></module-estimate>
    </div>
  </div>
</template>

<script>
import { runFields } from './components/data';
import { programmeList } from '@/api/optimization';
import FactorySelect from '@/components/factory-select/index.vue';
import waterQuality from './components/waterQuality.vue';
import InWaterData from './components/InWaterData.vue';
// import PumpDetail from './components/PumpDetail.vue';
// import PumpData from './components/PumpData.vue';
import ModuleEvaluate from './components/ModuleEvaluate.vue';
import ModuleEstimate from './components/ModuleEstimate.vue';
export default {
  name: 'onlineInterWater',
  components: {
    FactorySelect,
    waterQuality,
    InWaterData,
    // PumpDetail,
    // PumpData,
    ModuleEvaluate,
    ModuleEstimate
  },
  data() {
    return {
      layout: {
        span: 6,
        labelCol: { span: 6 },
        wrapperCol: { span: 18 },
        gutter: [0] //栅格间隔[水平间距，垂直间距]
      },
      fields: runFields,
      waterPlantId: '',
      showType: 'chart',
      activeModule: {},
      programme: '',
      moduleId: '',
      programmeList: [],
      tabs: [
        { name: '进水', value: 1 },
        { name: '出水', value: 2 }
      ],
      tabVal: 2
    };
  },
  computed: {
    tabName() {
      return this.tabVal === 1 ? '进水' : '出水';
    }
  },
  watch: {},
  methods: {
    // 切换水厂
    factoryChange() {
      this.getModelList();
    },
    goResult() {
      this.drillDown({
        path: '/predictOutcome',
        query: {
          tab: '2'
        }
      });
    },
    async getModelList() {
      let params = {
        waterPlantId: this.waterPlantId,
        solutionType: '1'
      };
      const { resultData, status } = await programmeList(params);
      if (status === 'complete') {
        this.programmeList = resultData;
        let activeProgrammeArr = this.programmeList.filter(item => item.runningFlag);
        if (activeProgrammeArr.length > 0) {
          this.activeModule = activeProgrammeArr[0];
          this.programme = activeProgrammeArr[0].solutionName;
          this.moduleId = activeProgrammeArr[0].id;
        } else {
          this.activeModule = this.programmeList[0];
          this.programme = this.programmeList[0].solutionName;
          this.moduleId = this.programmeList[0].id;
        }
      }
    }
  },
  created() {},
  mounted() {}
};
</script>

<style lang="less" scoped>
.page {
  height: 100%;
  overflow: auto;
  position: relative;
  .form-warp {
    padding: 12px 20px;
    border-radius: 4px;
    background: var(--supply-color-bg-card-DEFAULT);
  }
  .wpg-form-item {
    margin-bottom: 0 !important;
  }
}
/deep/.wpg-form-header {
  padding: 4px 24px !important;
}
.page-item {
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: 48%;
  margin-top: 12px;
}
.page-row {
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: calc(60% - 148px);
  margin-top: 12px;
}
</style>
/onlineInterWater/outwater
