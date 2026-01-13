<!--
 * @Description:
 * @version:
 * @Author: fengtaotao
 * @Date: 2023-07-01 14:43:48
 * @LastEditors: wangyr
 * @LastEditTime: 2024-04-10 13:14:11
-->

<template>
  <div class="page">
    <w-form-header
      :layout="layout"
      :fields="fields"
      class="supply-w-full"
      style="margin-bottom:10px"
    >
      <template #waterPlantId>
        <FactorySelect
          style="max-width:179px"
          v-model.trim="waterPlantId"
          autoSelect
        ></FactorySelect>
      </template>
      <template #programme>
        <div class="form-item">
          <w-input
            class="select-item"
            style="width: 202px"
            placeholder="请输入运行方案"
            :disabled="true"
            v-model="programme"
            @change="programmeChange"
          ></w-input>
          <div class="ico-change" @click="handleClick">
            <img src="@/assets/images/default/ic_swap_horiz.png" alt="img" />
          </div>
        </div>
      </template>
      <template #footer>
        <w-button @click="toPredict" type="primary" ghost>加药参数优化</w-button>
      </template>
    </w-form-header>
    <div class="iframe-view">
      <biology-flow :waterPlantId="waterPlantId"></biology-flow>
      <div class="map-top-right" :class="{ 'hide-right-control': hideRightControl }">
        <div
          class="map-right-control hover:supply-text-primary-hover supply-bg-bg-card-DEFAULT supply-cursor-pointer box-effect"
          @click="handleRightControl"
        >
          <w-icon type="menu-fold" />
        </div>
      </div>
    </div>
    <running-status
      title="运行现状"
      :waterPlantId="waterPlantId"
      @waterPlanChange="waterPlanChange"
    ></running-status>
    <!-- <line-chart-part
      title="进水"
      :tabs="inWaterTabs"
      :options="inWaterOption"
      :loading="inWaterLoading"
      @paramsChange="paramsChange"
    ></line-chart-part>
    <line-chart-part
      title="出水"
      :tabs="outWaterTabs"
      :options="outWaterOption"
      :loading="outWaterLoading"
      @paramsChange="paramsChange"
    ></line-chart-part> -->
    <add-drug-strategy
      ref="addDrug"
      :waterPlantId="waterPlantId"
      :modelId="modelId"
      :schemeId="schemeId"
      :modelList="modelList"
      :schemeList="programmeList"
      title="加药策略"
    ></add-drug-strategy>
    <w-drawer
      :width="840"
      :placement="placement"
      :closable="false"
      :visible="hideRightControl"
      :get-container="false"
      :wrap-style="{ position: 'absolute' }"
      @close="onClose"
    >
      <div class="page-item">
        <line-chart-part
          title="脱氮效能"
          :options="effectiveOption"
          :loading="effectiveLoading"
        ></line-chart-part>
        <line-chart-part
          title="碳源投加量"
          :options="carbonCastOption"
          :loading="carbonAddLoading"
        ></line-chart-part>
      </div>
      <div class="page-item">
        <carbon-cast-table
          :waterPlantId="waterPlantId"
          title="碳源投加数据"
          :switchBtns="switchBtns"
        ></carbon-cast-table>
      </div>
      <div class="page-item">
        <bar-chart-part
          title="过程分析"
          :options="analysisOption"
          :loading="processLoading"
          :switchBtns="switchBtns"
          :waterPlantId="waterPlantId"
          height="312px"
          @changeArea="changeArea"
        ></bar-chart-part>
      </div>
    </w-drawer>
    <!--
    <bar-chart-part
      title="碳源用量分析"
      :options="carbonDosageOption"
      :waterPlantId="waterPlantId"
      :loading="carbonSourceLoading"
    ></bar-chart-part>
   -->
    <!-- 放大图 -->
    <w-modal
      title="模型运行方案"
      :visible="isShow"
      width="616px"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <div class="methods-box">
        <div class="title">请选择模型运行方案</div>
        <div class="methods-list">
          <div
            v-for="(item, i) in programmeList"
            :key="item.id"
            @click="handleChange(item)"
            :class="['filed', 'filed' + (i + 1), item.id === templateId ? 'active' : '']"
          >
            <div class="ico-method"></div>
            <div class="method-title">{{ item.solutionName }}</div>
          </div>
        </div>
      </div>
    </w-modal>
  </div>
</template>

<script>
import {
  inWaterOption,
  outWaterOption,
  carbonCastOption,
  effectiveOption,
  carbonDosageOption,
  analysisOption,
  runFields
} from './options';
import {
  carbonSourceAnalysis,
  processAnalysis,
  nitrogenRemovalEfficiency,
  carbonSourceAdded,
  inflow,
  outflow
} from '@/api/analysis';
import { getModelList } from '@/api/runTime';
import { programmeList, switchRunningSchemes } from '@/api/optimization';
export default {
  name: 'IntelligentDosing',
  components: {
    FactorySelect: () => import('@/components/factory-select/index.vue'),
    RunningStatus: () => import('./components/RunningStatus'),
    LineChartPart: () => import('./components/LineChartPart.vue'),
    BarChartPart: () => import('./components/BarChartPart'),
    AddDrugStrategy: () => import('./components/AddDrugStrategy'),
    CarbonCastTable: () => import('./components/CarbonCastTable'),
    BiologyFlow: () => import('./components/BiologyFlow')
  },
  mixins: [],
  data() {
    return {
      layout: {
        span: 6,
        labelCol: { span: 8 },
        wrapperCol: { span: 16 },
        gutter: [0] //栅格间隔[水平间距，垂直间距]
      },
      isShow: false,
      programme: '', //方案名称
      modelId: '', //模型id
      schemeId: '', //方案id
      programmeList: [], //方案列表
      modelList: [], //模型列表
      templateId: '',
      activeModule: {},
      methodLabel: '',
      fields: runFields,
      analysisOption,
      inWaterOption,
      outWaterOption,
      carbonCastOption,
      effectiveOption,
      carbonDosageOption,
      carbonSourceLoading: false,
      processLoading: false,
      inWaterLoading: false,
      outWaterLoading: false,
      effectiveLoading: false,
      carbonAddLoading: false,
      waterPlantId: '',
      switchBtns: [
        {
          name: 'A区',
          value: 'A'
        },
        {
          name: 'B区',
          value: 'B'
        }
      ],
      currentDrugArea: 'A',
      inWaterTabs: [],
      currentInWaterPoint: '',
      currentOutWaterPoint: '',
      hideRightControl: false,
      placement: 'right',
      outWaterTabs: []
    };
  },
  watch: {
    waterPlantId(val) {
      if (val) {
        this.getCarbonSourceAnalysis();
        this.getProcessAnalysis();
        this.getNitrogenRemovalEfficiency();
        this.getCarbonSourceAdded();
        this.getInflow();
        this.getOutflow();
        this.getModelList();
        this.getSchemeList();
      }
    }
    // modelId(val) {
    //   if (val) {
    //      this.getSchemeList();
    //   }
    // }
  },
  methods: {
    handleRightControl() {
      this.hideRightControl = !this.hideRightControl;
    },
    onClose() {
      this.hideRightControl = false;
    },
    toPredict() {
      this.drillDown({
        path: '/runPredict/optimalDecision',
        query: {
          tabKey: 'dosingParam'
        }
      });
    },
    programmeChange() {},
    /* 全屏切换 */
    handleClick() {
      this.templateId = this.schemeId;
      this.isShow = true;
    },
    handleChange(data) {
      this.methodLabel = data.solutionName;
      this.templateId = data.id;
    },
    async handleOk() {
      this.$confirm({
        title: '是否切换当前运行方案？',
        okText: '确定',
        cancelText: '取消',
        onOk: async () => {
          if (this.programmeList.length > 0) {
            this.programme = this.methodLabel;
            this.activeModule = this.programmeList.filter(item => {
              return item.id === this.templateId;
            })[0];
            this.schemeId = this.templateId;
            let params = {
              solutionId: this.activeModule.id,
              waterPlantId: this.waterPlantId,
              solutionType: '3'
            };
            const { resultData, status } = await switchRunningSchemes(params);
            if (status === 'complete') {
              this.isShow = false;
              this.$message.success('切换成功！');
            }
          }
        },
        onCancel: () => {}
      });
    },
    handleCancel() {
      this.isShow = false;
      this.schemeId = this.activeModule.id;
    },
    waterPlanChange(data) {
      this.waterPlantId = data;
    },
    changeArea(data) {
      this.currentDrugArea = data;
      this.getProcessAnalysis();
    },
    paramsChange(data) {
      if (data.type === '进水') {
        this.currentInWaterPoint = data.value;
        this.getInflow();
      } else {
        this.currentOutWaterPoint = data.value;
        this.getOutflow();
      }
    },
    async getSchemeList() {
      let params = {
        waterPlantId: this.waterPlantId,
        solutionType: 3
      };
      const { resultData, status } = await programmeList(params);
      if (status === 'complete') {
        this.programmeList = resultData;
        let activeProgrammeArr = this.programmeList.filter(item => item.runningFlag);
        if (activeProgrammeArr.length > 0) {
          this.activeModule = activeProgrammeArr[0];
          this.programme = activeProgrammeArr[0].solutionName;
          this.schemeId = activeProgrammeArr[0].id;
        } else {
          this.activeModule = this.programmeList[0];
          this.programme = this.programmeList[0].solutionName;
          this.schemeId = this.programmeList[0].id;
        }
      }
    },
    async getModelList() {
      let params = {
        modelTypeCode: '3',
        waterPlantId: this.waterPlantId
      };
      let res = await getModelList(params);
      let { status, resultData, errorMessage } = res;
      if (status === 'complete') {
        this.modelList = resultData;
        this.modelId = this.modelList?.[0]?.id || '';
      } else {
        this.modelList = [];
        this.modelId = '';
      }
    },
    async getInflow() {
      this.inWaterLoading = true;
      let res = await inflow(this.waterPlantId);
      let { status, resultData, errorMessage } = res;
      this.inWaterTabs = [];
      this.inWaterLoading = false;
      if (status === 'complete') {
        if (!this.currentInWaterPoint) {
          this.currentInWaterPoint = resultData[0] ? resultData[0].pointName : '';
        }

        resultData.forEach(item => {
          this.inWaterTabs.push({
            pointName: item.pointName,
            pointMemo: item.pointName
          });
          if (item.pointName === this.currentInWaterPoint) {
            this.inWaterOption.xAxis[0].data = item.subChartVO.xList;
            this.inWaterOption.series[0].data = item.subChartVO.yList;
            this.inWaterOption.series[1].data = item.subChartVO.preYList;
            if (this.currentInWaterPoint === 'C/N') {
              this.inWaterOption.yAxis[0].name = '';
            } else {
              this.inWaterOption.yAxis[0].name = 'mg/L';
            }
          }
        });
      }
    },
    async getOutflow() {
      this.outWaterLoading = true;
      let res = await outflow(this.waterPlantId);
      let { status, resultData, errorMessage } = res;
      this.outWaterTabs = [];
      this.outWaterLoading = false;
      if (status === 'complete') {
        if (!this.currentOutWaterPoint) {
          this.currentOutWaterPoint = resultData[0] ? resultData[0].pointName : '';
        }
        resultData.forEach(item => {
          this.outWaterTabs.push({
            pointName: item.pointName,
            pointMemo: item.pointName
          });
          if (item.pointName === this.currentOutWaterPoint) {
            this.outWaterOption.xAxis[0].data = item.subChartVO ? item.subChartVO.xList : [];
            this.outWaterOption.series[0].data = item.subChartVO ? item.subChartVO.yList : [];
            this.outWaterOption.series[1].data = item.subChartVO ? item.subChartVO.preYList : [];
            if (this.currentOutWaterPoint === 'C/N') {
              this.outWaterOption.yAxis[0].name = '';
            } else {
              this.outWaterOption.yAxis[0].name = 'mg/L';
            }
          }
        });
      }
    },
    async getNitrogenRemovalEfficiency() {
      this.effectiveLoading = true;
      let res = await nitrogenRemovalEfficiency(this.waterPlantId);
      let { status, resultData, errorMessage } = res;
      this.effectiveLoading = false;
      if (status === 'complete') {
        this.effectiveOption.xAxis[0].data = resultData.subChartVO.xList;
        this.effectiveOption.series[0].data = resultData.subChartVO.yList;
      }
    },
    async getCarbonSourceAdded() {
      this.carbonAddLoading = true;
      let res = await carbonSourceAdded(this.waterPlantId);
      let { status, resultData, errorMessage } = res;
      this.carbonAddLoading = false;
      if (status === 'complete') {
        this.carbonCastOption.xAxis[0].data = resultData.subChartVO
          ? resultData.subChartVO.xList
          : [];
        this.carbonCastOption.series[0].data = resultData.subChartVO
          ? resultData.subChartVO.yList
          : [];
        this.carbonCastOption.series[1].data = resultData.subChartVO
          ? resultData.subChartVO.preYList
          : [];
      }
    },
    async getCarbonSourceAnalysis() {
      this.carbonSourceLoading = true;
      let res = await carbonSourceAnalysis(this.waterPlantId);
      let { status, resultData, errorMessage } = res;
      this.carbonSourceLoading = false;
      if (status === 'complete') {
        this.carbonDosageOption.xAxis[0].data = resultData.subChartVO
          ? resultData.subChartVO.xList
          : [];
        this.carbonDosageOption.series[0].data = resultData.subChartVO
          ? resultData.subChartVO.yList
          : [];
      }
    },
    async getProcessAnalysis() {
      this.processLoading = true;
      let res = await processAnalysis(this.waterPlantId);
      let { status, resultData, errorMessage } = res;
      this.analysisOption.yAxis[0].data = [];
      this.analysisOption.series[0].data = [];
      this.analysisOption.series[1].data = [];
      this.analysisOption.series[2].data = [];
      this.processLoading = false;
      if (status === 'complete') {
        resultData.forEach(item => {
          if (item.line === this.currentDrugArea) {
            item.processAnalysisVOList.forEach(v => {
              this.analysisOption.yAxis[0].data.unshift(v.placeName);
              this.analysisOption.series[0].data.unshift(v.ammoniaNitrogen);
              this.analysisOption.series[1].data.unshift(v.nitrateNitrogen);
              this.analysisOption.series[2].data.unshift(v.other);
            });
          }
        });
      }
    }
  }
};
</script>

<style lang="less" scoped>
.page {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  /deep/.form-header {
    height: 50px !important;
  }
  /deep/.wpg-form-header {
    padding: 4px 24px !important;
  }
  .form-item {
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }
  .ico-change {
    margin-left: 20px;
    width: 36px;
    height: 36px;
    background-color: var(--supply-color-primary-DEFAULT);
    border-color: var(--supply-color-primary-DEFAULT);
    text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.12);
    box-shadow: 0 2px 0 rgba(0, 0, 0, 0.045);
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 4px;
  }
  .ico-change:hover {
    background-color: var(--supply-color-primary-hover);
    border-color: var(--supply-color-primary-hover);
  }
}
.iframe-view {
  margin-bottom: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: calc(100% - 324px);
  background: #fff;
  position: relative;

  .map-top-right {
    position: absolute;
    top: 16px;
    right: 16px;
    z-index: 1000;
    width: 36px;
    height: 36px;

    &.hide-right-control {
      // display: none;
    }
    .map-right-control {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      border-radius: 4px;
    }
  }
}
.page-item {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 10px;
}
.methods-box {
  .title {
    font-family: PingFangSC-Regular, sans-serif;
    font-weight: 400;
    font-size: 14px;
    color: var(--supply-color-main);
  }
  .methods-list {
    max-height: 290px;
    overflow: auto;
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    margin-top: 15px;
    .filed {
      width: calc(25% - 8px);
      height: 90px;
      margin-right: 8px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: #f7f8fa;
      border: 1px solid #ebedf0;
      border-radius: 4px;
      cursor: pointer;
      margin-bottom: 8px;
    }
    .active {
      background: #4285f414;
      border: 1px solid #4285f4;
    }
    .ico-method {
      width: 40px;
      height: 40px;
      margin-bottom: 8px;
    }
    .method-title {
      width: 100%;
      padding: 0 4px;
      font-family: PingFangSC-Regular, sans-serif;
      font-weight: 400;
      font-size: 12px;
      text-align: center;
      color: var(--supply-color-secondary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .filed:nth-child(4n + 1) .ico-method {
      background: url('~@/assets/images/default/ico-leaf.png') no-repeat;
      background-size: 100% 100%;
    }
    .filed:nth-child(4n + 2) .ico-method {
      background: url('~@/assets/images/default/ico-sun.png') no-repeat;
      background-size: 100% 100%;
    }
    .filed:nth-child(4n + 3) .ico-method {
      background: url('~@/assets/images/default/ico-maple.png') no-repeat;
      background-size: 100% 100%;
    }
    .filed:nth-child(4n) .ico-method {
      background: url('~@/assets/images/default/ico-snow.png') no-repeat;
      background-size: 100% 100%;
    }
    .filed1.active .ico-method {
      background: url('~@/assets/images/default/ico-leaf1.png') no-repeat;
      background-size: 100% 100%;
    }
    .filed2.active .ico-method {
      background: url('~@/assets/images/default/ico-sun1.png') no-repeat;
      background-size: 100% 100%;
    }
    .filed3.active .ico-method {
      background: url('~@/assets/images/default/ico-maple1.png') no-repeat;
      background-size: 100% 100%;
    }
    .filed4.active .ico-method {
      background: url('~@/assets/images/default/ico-snow1.png') no-repeat;
      background-size: 100% 100%;
    }
  }
}
</style>
