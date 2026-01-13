<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2023-06-19 10:35:09
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2024-05-17 13:19:59
 * @Description:
-->
<template>
  <div id="predictCon" class="page supply-relative">
    <div v-if="loading" class="spin-wrap">
      <w-spin size="large" class="page__load" :spinning="loading"> </w-spin>
    </div>
    <div class="page__left">
      <block-wrap title="方案库">
        <template #right>
          <w-button @click="isCompare = !isCompare">{{
            isCompare ? '退出对比' : '方案对比'
          }}</w-button>
        </template>
        <scheme-tree
          @checkChange="checkChange"
          ref="schemeTree"
          :checkable="isCompare"
          :waterPlantId="waterPlantId"
          :solutionType="tab"
          :selectable="!isCompare"
          :solutionId="schemeId"
          @schemeNameChange="schemeNameChange"
          @change="schemeChange"
        ></scheme-tree>
      </block-wrap>
    </div>
    <div class="page__right">
      <block-wrap v-if="isCompare" title="对比结论">
        <compare-result ref="compareResult" :schemeMap="schemeMap"></compare-result>
      </block-wrap>
      <block-wrap title="计算结果">
        <res-chart :isCompare="isCompare" :showType="showType" :schemeList="schemeList">
          <div class="search">
            <FactorySelect
              style="max-width:160px;display: none;"
              v-model.trim="waterPlantId"
              autoSelect
            ></FactorySelect>

            <span v-if="showDimension" class="">
              展示维度：
              <w-radio-group v-model="showType" button-style="solid">
                <w-radio-button value="1">
                  出水预测
                </w-radio-button>
                <w-radio-button value="0">
                  沿程分析
                </w-radio-button>
              </w-radio-group>
            </span>
            <span v-if="showType === '1' && !isCompare" class="duration supply-ml-4">
              模拟时长：
              <w-input-number
                class="supply-mr-1"
                disabled
                v-model="curSolution.simulationDuration"
                :max="48"
                :step="1"
                :min="1"
                :precision="0"
              >
              </w-input-number>
              h(小时)</span
            >
            <span v-if="showLine || showType === '0'" class="supply-ml-4 supply-whitespace-nowrap">
              构筑物线路：
              <w-select class="search__select" style="max-width:160px" v-model="line">
                <w-select-option
                  v-for="item in lineList"
                  :key="item.dictCode"
                  :value="item.dictValue"
                  >{{ item.dictName }}</w-select-option
                >
              </w-select>
            </span>
          </div>
        </res-chart>
      </block-wrap>
      <block-wrap v-if="!isCompare" class="run-param" title="运行参数">
        <run-param :tab="tab" :moduleList="curSolution.moduleList"></run-param>
      </block-wrap>
      <scheme-compare :schemeList="schemeList" v-else="isCompare"></scheme-compare>
    </div>
  </div>
</template>
<script>
import { runTypeMap, runFields, sludgeOption, inWaterOption } from '../options';
import chartItem from './chartItem.vue';
import {
  postForecastResult,
  getModelList,
  getSolutionDetail,
  preDisplayCodeList,
  getSludgeStateResult,
  getStratificationMlssResult,
  getModelPlaceCode,
  renameSolutionName
} from '@/api/runTime';
import purificationLineMixin from '@/utils/mixins/purificationLineMixin.js';
import moment from 'moment';
import SchemeTree from './SchemeTree.vue';
import SchemeCompare from './SchemeCompare.vue';
import ResChart from './ResChart.vue';
import CompareResult from './CompareResult.vue';
import RunParam from './RunParam.vue';
import CalculateResult from './CalculateResult.vue';
import BlockWrap from './BlockWrap.vue';
import FactorySelect from '@/components/factory-select/index.vue';
import { sysDictListByCode } from '@/api/manage';
import cloneDeep from 'lodash.clonedeep';

export default {
  name: 'ModelScheme',
  props: {
    tab: {
      type: String,
      default: ''
    },
    showDimension: {
      type: Boolean,
      default: true
    },
    showLine: {
      type: Boolean,
      default: false
    },
    resultType: {
      type: String,
      default: ''
    },
    initShowType: {
      type: String,
      default: '1'
    }
  },
  data() {
    return {
      compareList: [],
      schemeList: [],
      isCompare: false,
      schemeMap: {},
      runTypeLength: 3,
      placeList1: [],
      placeList2: [],
      placeList: [],
      curSolution: {},
      line: '0',
      schemeNameMap: {},
      showType: this.initShowType,
      schemeId: '',
      loading: false,
      waterPlantId: '',
      checkedKeys: [],
      fields: runFields,
      layout: {
        span: 5,
        wrapperCol: { span: 18 },
        gutter: [0] //栅格间隔[水平间距，垂直间距]
      }
    };
  },
  mixins: [purificationLineMixin],
  components: {
    ResChart,
    SchemeTree,
    chartItem,
    FactorySelect,
    SchemeCompare,
    BlockWrap,
    CompareResult,
    CalculateResult,
    RunParam
  },

  computed: {
    solutionList() {
      return this.isCompare ? this.checkedKeys : [this.schemeId];
    }
  },
  watch: {
    isCompare(val) {
      this.schemeMap = {};
      if (val) {
        this.$refs.schemeTree?.setDefaultCheckedKeys();
      } else {
        this.getManyDetail();
      }
    },
    line() {
      this.placeList = this['placeList' + this.line];
      this.getManyDetail();
    },
    schemeId(val) {
      if (val) {
        this.schemeMap = {};
        this.getManyDetail();
      }
    },
    showType(val) {
      this.changeShowType();
    }
  },
  created() {
    this.sysDictListByCode('0', 'placeList1', () => {
      if (this.line === '0') {
        this.placeList = this.placeList1;
      }
    });
    this.sysDictListByCode('1', 'placeList2', () => {
      if (this.line === '1') {
        this.placeList = this.placeList2;
      }
    });
  },
  mounted() {},

  methods: {
    async changeShowType() {
      this.loading = true;
      const promises = [];
      this.solutionList?.forEach(item => {
        if (!this.schemeMap[item]) {
          this.$set(this.schemeMap, item, this.getDefaultSolution(item));
        }
        promises.push(this.getSolutionDetail(item));
        promises.push(this.getHistorySolutionDetail(item));
      });
      await Promise.allSettled(promises);
      this.schemeList = Object.values(this.schemeMap);
      this.setCurSolution();
      this.loading = false;
      this.updateCompareData();
    },
    updateCompareData() {
      if (this.$refs.compareResult) this.$refs.compareResult.setOption();
    },
    setCurSolution() {
      if (!this.isCompare) {
        this.curSolution = this.schemeMap[this.schemeId] || this.getDefaultSolution(this.schemeId);
      }
    },
    async getPreDisplayCodeList(solutionId) {
      const params = {
        modelId: this.schemeMap[solutionId].modelId,
        type: this.resultType || this.showType,
        modelTypeCode: this.tab
      };
      let res = await preDisplayCodeList(params);
      const { resultData, status } = res;
      if (status === 'complete' && resultData) {
        this.schemeMap[solutionId].outputList = resultData;
        this.schemeMap[solutionId].outputObj = this.getOutPutObj(resultData);
      }
      return resultData;
    },
    getOutPutObj(outputList) {
      let defaultData = {};
      let pointData = {};
      outputList.forEach(item => {
        pointData[item] = {
          title: item,
          xList:
            this.showType === '0'
              ? [...this.placeList.map(item => item.placeName)]
              : this.getNextHours(),
          yList: []
        };
      });
      return pointData;
    },
    checkChange(val) {
      this.checkedKeys = val;
      this.schemeMap = {};
      this.getManyDetail();
    },
    async getManyDetail() {
      if (!this.solutionList.length) {
        this.schemeList = [];
        return;
      }
      this.loading = true;
      const promises = [];
      this.solutionList?.forEach(item => {
        if (!this.schemeMap[item]) {
          this.$set(this.schemeMap, item, this.getDefaultSolution(item));
        }
        promises.push(this.getSolutionDetail(item));
        promises.push(this.getHistorySolutionDetail(item));
      });
      await Promise.allSettled(promises);
      this.schemeList = Object.values(this.schemeMap);
      this.setCurSolution();
      this.loading = false;
      this.updateCompareData();
    },
    async getSolutionDetail(solutionId) {
      if (!solutionId) return;
      const params = {
        solutionId: solutionId,
        line: this.line,
        showType: this.showType
      };
      const res = await getSolutionDetail(params);
      const { resultData, status } = res;
      if (status === 'complete') {
        if (!this.schemeMap[solutionId]) {
          return;
        }
        this.schemeMap[solutionId].createTime = moment(resultData.createTime);
        if (
          !moment(this.schemeMap[solutionId].startTime).isSame(
            moment(resultData.createTime)
              .add(1, 'hours')
              .startOf('hour')
          )
        ) {
          this.schemeMap[solutionId].date = moment(resultData.createTime)
            .add(1, 'hours')
            .startOf('hour');
        }
        this.schemeMap[solutionId].startTime = moment(resultData.createTime)
          .add(1, 'hours')
          .startOf('hour');
        this.schemeMap[solutionId].runType = resultData.smallType;
        this.schemeMap[solutionId].simulationDuration = resultData.simulationDuration;
        this.schemeMap[solutionId].predictionId = resultData.paramId || '';
        this.setInputData(resultData, solutionId);
        return this.setOutputData(resultData, solutionId);
      }
    },
    async getHistorySolutionDetail(solutionId) {
      if (!solutionId) return;
      const params = {
        solutionId: solutionId,
        line: this.line,
        showType: '1',
        historyFlag: true,
        validTimeFlag: true
      };
      const res = await getSolutionDetail(params);
      const { resultData, status } = res;
      if (status === 'complete') {
        this.schemeMap[solutionId].compareData =
          resultData?.outputResult?.[this.schemeMap[solutionId]?.runType] || {};
      }
    },
    setInputData(data, solutionId) {
      const modelId = data.modelId;
      this.getModelList(modelList => {
        let inputParamStr = modelList.find(item => item.id === modelId)?.inputParam || '';
        if (inputParamStr) {
          let valueIndex = data.smallType ? Number(data.smallType) - 1 : 0;
          let inputParam = JSON.parse(inputParamStr);
          inputParam.forEach((item, i) => {
            let hideNames = ['进水组分', '化学计量系数', '动力学参数'];
            item.openState = hideNames.includes(item.name) ? 0 : 1;
            item.points.forEach((point, j) => {
              let initValue = new Array(this.runTypeLength).fill(point.defaultValue ?? null);
              point.value = initValue[valueIndex];
              if (item.openState === 1) {
                point.pointUnit = point?.pointUnit || point?.pointObj.pointUnit;
              }
            });
          });
          this.schemeMap[solutionId].moduleList = inputParam;
        } else {
          this.schemeMap[solutionId].moduleList = [];
        }
        this.getScheme(data, solutionId);
      });
    },
    getScheme(data, solutionId) {
      let inputValue = data.inputParam ? JSON.parse(data.inputParam) : [];
      this.schemeMap[solutionId].moduleList.forEach((item, index) => {
        if (inputValue?.[index]?.[item.name]) {
          let inputPointList = inputValue[index][item.name];
          item.points.forEach((point, i) => {
            if (inputPointList?.[i]?.[point.code]?.length === this.runTypeLength) {
              let valueIndex = data.smallType ? Number(data.smallType) - 1 : 0;
              point.value = inputPointList?.[i]?.[point.code]?.[valueIndex];
            }
          });
        }
      });
      this.schemeMap[solutionId].inputLoad = true;
    },
    schemeNameChange(val) {
      this.schemeNameMap = val;
    },

    range(start, end) {
      const result = [];
      for (let i = start; i < end; i++) {
        result.push(i);
      }
      return result;
    },

    async getModelList(callback) {
      let params = {
        modelTypeCode: this.tab,
        waterPlantId: this.waterPlantId
      };
      let res = await getModelList(params);
      const { resultData, status } = res;
      if (status === 'complete') {
        callback && callback(resultData);
      }
    },
    disabledDate(current) {
      return (
        current &&
        (current < moment(this.startTime).startOf('day') ||
          current >
            moment(this.startTime)
              .add(1, 'days')
              .endOf('day'))
      );
    },
    getDefaultSolution(id) {
      return {
        solutionId: id,
        solutionName: this.schemeNameMap[id],
        modelId: '',
        runType: '',
        chartList: [],
        simulationDuration: null,
        startTime: moment(),
        createTime: moment(),
        date: moment(),
        moduleList: [],
        outputList: [],
        outputObj: {},
        predictionId: ''
      };
    },
    async sysDictListByCode(code, data, callback) {
      const res = await getModelPlaceCode(code);
      this[data] = res.resultData;
      callback && callback();
    },
    async setOutputData(data, solutionId) {
      let modelId = data.modelId;
      this.schemeMap[solutionId].modelId = modelId;
      let outputList = await this.getPreDisplayCodeList(solutionId);
      if (Object.keys(data?.outputResult || {})?.length) {
        let outputObj = data.outputResult[this.schemeMap[solutionId].runType];
        let newObj = {};
        outputList.forEach(item => {
          if (outputObj[item]) {
            newObj[item] = outputObj[item];
          }
        });
        this.setChartList(newObj, solutionId);
      } else {
        this.setChartList(this.schemeMap[solutionId].outputObj, solutionId);
      }
      const promises = [];
      if (this.tab === '4') {
        promises.push(this.getSludgeStateResult(solutionId));
        promises.push(this.getStratificationMlssResult(solutionId));
        let res = await Promise.allSettled(promises);
        this.setOtherChartList(res[0].value, solutionId);
        this.setOtherChartList(res[1].value, solutionId);
      }
      return true;
    },
    async getSludgeStateResult(solutionId) {
      let defaultData = {
        initOption: sludgeOption,
        title: '二沉池状态点分析',
        len: 0,
        legend: [],
        data: [{ xList: [], yList: [] }]
      };
      if (!this.schemeMap[solutionId].predictionId) {
        return defaultData;
      }
      const params = {
        line: this.line,
        predictionId: this.schemeMap[solutionId].predictionId
        // predictionId: 'e5318d6f6ddfafb2c89968589a795555'
      };
      const { resultData, status } = await getSludgeStateResult(params);
      if (status === 'complete') {
        let verticalData = null;
        let seriesConfig = [];
        let legend = [];
        let data = [];
        let xList = resultData.xList || [];
        resultData.dataList.forEach((item, i) => {
          if (item.type !== 1) {
            seriesConfig.push({
              smooth: item.type === 2
            });
            legend.push(item.name);
            data.push({
              xList: [],
              yList: xList.map((x, i) => [x, item.yList[i]])
            });
          } else {
            verticalData = { ...item };
            legend.push(verticalData.name);
            data.push({
              xList: [],
              yList: []
            });
            seriesConfig.push({
              lineStyle: {
                color: '#5f9ea0'
              },
              markLine: {
                symbol: 'none',
                data: [
                  {
                    label: {
                      show: false
                    },
                    lineStyle: {
                      color: '#5f9ea0',
                      width: 2,
                      type: 'solid'
                    },
                    xAxis: verticalData.xValue
                  }
                ],
                silent: true
              }
            });
          }
        });
        if (verticalData) {
          data.push({
            xList: [],
            yList: [[verticalData.xValue, verticalData.yValue]]
          });
          seriesConfig.push({
            symbol: 'circle',
            symbolSize: 8,
            label: {
              show: false,
              position: 'right',
              formatter: () => `(${verticalData.xValue}, ${verticalData.yValue})`
            }
          });
          legend.push('');
        }
        return {
          title: '二沉池状态点分析',
          initOption: sludgeOption,
          seriesConfig,
          legendSuffix: [...legend],
          legend,
          len: xList.length,
          data
        };
      } else {
        return defaultData;
      }
    },
    async getStratificationMlssResult(solutionId) {
      let defaultData = {
        isReverse: true,
        len: 0,
        seriesConfig: [
          {
            type: 'bar'
          }
        ],
        title: '二沉池固体分布',
        legend: ['分层中总悬浮固体(mg/L)'],
        data: [{ xList: [], yList: [] }]
      };
      if (!this.schemeMap[solutionId].predictionId) {
        return defaultData;
      }
      const params = {
        line: this.line,
        predictionId: this.schemeMap[solutionId].predictionId
      };
      const { resultData, status } = await getStratificationMlssResult(params);
      if (status === 'complete') {
        return {
          title: '二沉池固体分布',
          legend: ['分层中总悬浮固体(mg/L)'],
          data: [resultData],
          isReverse: true,
          len: resultData?.xList?.length || 0,
          seriesConfig: [
            {
              type: 'bar'
            }
          ]
        };
      } else {
        return defaultData;
      }
    },
    setOtherChartList(data, solutionId) {
      let chartData = {
        type: '0',
        solutionName: this.schemeMap[solutionId].solutionName,
        time: this.schemeMap[solutionId].createTime,
        axisLabel: { rotate: 0, margin: 8 },
        initOption: inWaterOption,
        ...data
      };
      this.schemeMap[solutionId].chartList.push(chartData);
    },

    setChartList(data, solutionId) {
      let tempArr = [];
      tempArr = Object.keys(data).map(item => {
        let axisLabel =
          this.showType === '0'
            ? {
                rotate: -40,
                margin: 8
              }
            : { rotate: 0, margin: 8 };
        return {
          initOption: inWaterOption,
          type: this.showType,
          solutionName: this.schemeMap[solutionId].solutionName,
          time: this.schemeMap[solutionId].createTime,
          axisLabel,
          len: data[item].yList.length,
          data: [data[item]],
          legend: [runTypeMap[this.schemeMap[solutionId].runType]],
          title: item
        };
      });
      this.schemeMap[solutionId].chartList = tempArr;
      this.schemeMap[solutionId].outputLoad = true;
    },
    getNextHours(num = 24) {
      let dateList = [];
      for (let index = 1; index <= num; index++) {
        dateList.push(
          moment()
            .add(index, 'H')
            .format('HH:00')
        );
      }
      return dateList;
    },
    // disabledDateTime(current) {
    //   return {
    //     disabledHours: () => {
    //       if (!current) {
    //         return false;
    //       } else if (current < moment(this.startTime).endOf('day')) {
    //         return this.range(0, 24).splice(0, moment(this.startTime).hour());
    //       } else {
    //         return this.range(0, 24).splice(moment(this.startTime).hour() + 1);
    //       }
    //     }
    //   };
    // },
    schemeChange(key) {
      this.schemeId = key;
    },
    getColor(colorList, i) {
      if (i < colorList.length) {
        return colorList[i];
      }
      return 'rgb(' + ((i * 80) % 255) + ',' + ((i * 100) % 255) + ',' + ((i * 60) % 255) + ')';
    }
  }
};
</script>
<style lang="less" scoped>
.page {
  width: 100%;
  height: 100%;
  display: flex;
  &__load {
    position: absolute;
    left: 50%;
    top: 48%;
    transform: translate(-50%, -50%);
    width: 100%;
    /deep/ .wpg-spin-container {
      width: 100%;
      height: 100%;
      display: flex;
    }
  }
  .quality {
    padding: 15px 12px 0px;
  }
  &__left {
    border-radius: 4px;
    background-color: var(--supply-color-bg-card-component);
    /deep/ .content {
      height: 100%;
    }
  }
  &__right {
    flex: 1;
    overflow-x: hidden;
    flex-direction: column;
    display: flex;
    overflow-y: auto;
    margin-left: 12px;
    .run-header {
      /deep/ .wpg-info-form-footer {
        margin-left: auto;
        width: unset;
      }
    }
    .chart-content {
      .search {
        padding: 0 0 8px 12px;
        &__select {
          min-width: 100px;
          /deep/ .wpg-select-selection--single {
            height: 36px;
          }
        }
      }
      .chart-wrap {
        height: 302px;
        display: flex;
        flex-wrap: wrap;
        overflow: auto;
      }
    }
    .predict-empty {
      flex-direction: column;
      align-items: center;
      justify-content: center;
      top: -30px;
      display: flex;
      position: relative;
      width: 100%;
      height: 100%;
    }
    .right-item {
      padding: 0 0 0 12px;
      width: calc(100% / 3);
      height: 302px;
      .chart-wrapper {
        padding: 0;
        border-radius: 4px;
      }
    }
    .run-param {
      margin-bottom: 0px;
      flex: 1;
    }
  }
  &__con {
    margin-top: 12px;
    flex: 1;
    align-content: flex-start;
    display: flex;
    flex-wrap: wrap;
    overflow-y: auto;
  }

  .spin-wrap {
    width: 100%;
    height: 100%;
    position: absolute;
    text-align: center;
    background-color: rgba(255, 255, 255, 0.4);
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
  }
}
</style>
