<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2023-06-19 10:35:09
 * @LastEditors: wangyr
 * @LastEditTime: 2024-11-05 16:54:16
 * @Description:
-->
<template>
  <div id="predictCon" class="page supply-relative">
    <div v-if="loading" class="spin-wrap">
      <w-spin size="large" class="page__load" :spinning="loading"> </w-spin>
    </div>
    <div class="page__left">
      <param-panel
        :showType="showType"
        :solutionType="tab"
        :simulationDuration="simulationDuration"
        :title="title"
        :abortedPredict.sync="abortedPredict"
        :optionName="optionName"
        :schemeId="schemeId"
        :modelList="modelList"
        :pointData="pointData"
        :waterPlantId="waterPlantId"
        :modelId="modelId"
        :runningFlag="runningFlag"
        :runType.sync="runType"
        @changeLoad="changeLoad"
        ref="paramPanel"
        @change="handleChange"
        @changeProcess="changeProcess"
        @handleProcess="handleProcess"
      ></param-panel>
    </div>
    <div class="page__right">
      <div class="run-header">
        <w-form-header :layout="layout" :fields="fields" class="supply-w-full supply-ml-3" style="height:64px">
          <span class="form-item">
            <span class="label">选择水厂：</span>
            <FactorySelect
              style="max-width:160px;"
              @change="factoryChange"
              v-model.trim="waterPlantId"
              autoSelect
            ></FactorySelect>
          </span>
          <span class="form-item supply-ml-4" v-if="showDimension">
            <span class="label">展示维度：</span>
            <w-radio-group v-model="showType" button-style="solid">
              <w-radio-button value="1">
                出水预测
              </w-radio-button>
              <w-radio-button value="0">
                沿程分析
              </w-radio-button>
            </w-radio-group>
          </span>
          <span v-if="showType === '1'" class="form-item duration supply-ml-4">
            <span class="label">模拟时长：</span>
            <w-input-number
              class="supply-mr-1"
              v-model="simulationDuration"
              :max="48"
              :step="1"
              :min="1"
              :precision="0"
            >
            </w-input-number>
            h(小时)</span
          >
          <span v-if="showLine || showType === '0'" class="supply-ml-4 supply-whitespace-nowrap">
            构筑物线路:
            <w-select style="max-width:160px" v-model="line">
              <w-select-option
                v-for="item in lineList"
                :key="item.dictCode"
                :value="item.dictValue"
                >{{ item.dictName }}</w-select-option
              >
            </w-select>
          </span>
          <template #footer>
            <div class="supply-flex supply-justify-end">
              <w-button type="primary" @click="toSchemeLibrary">方案库</w-button>
            </div>
          </template>
        </w-form-header>
      </div>
      <div class="page__con">
        <template v-if="chartList.length">
          <div class="right-item" v-for="(item, index) in chartList" :key="item.title">
            <chart-item
              :key="item.title"
              :initOption="item.initOption"
              :config="item"
              class="chart-wrap"
            ></chart-item>
          </div>
        </template>
        <w-empty class="predict-empty" v-else></w-empty>
      </div>
    </div>
    <progress-bar
      v-if="isShowProcess"
      ref="progressBar"
      :allowInstantCompletion="allowInstantCompletion"
    />
  </div>
</template>

<script>
import { sysDictListByCode } from '@/api/manage';
import {
  postForecastResult,
  getModelList,
  preDisplayCodeList,
  getSludgeStateResult,
  getStratificationMlssResult,
  getModelPlaceCode
} from '@/api/runTime';
import purificationLineMixin from '@/utils/mixins/purificationLineMixin.js';
import {
  runFields,
  runSearchForm,
  runTypeList,
  sludgeOption,
  inWaterOption
} from './models/options';
import FactorySelect from '@/components/factory-select/index.vue';
import ProgressBar from '@/components/ProgressBar.vue';
import chartItem from './models/chartItem.vue';
import paramPanel from './models/paramPanel.vue';
import moment from 'moment';
import { isEqual } from 'lodash-es';
import { isDef } from '@/utils/util';
const typeMap = {};
runTypeList.forEach(item => {
  typeMap[item.value] = item.name;
});
export default {
  name: 'runPredict',
  props: {
    tab: {
      type: String,
      default: ''
    },
    tabKey: {
      type: String,
      default: ''
    },
    title: {
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
      line: '1',
      allowInstantCompletion: false,
      isShowProcess: false,
      simulationDuration: 24,
      abortedPredict: false,
      showType: this.initShowType,
      schemeId: '',
      optionName: '',
      fields: runFields,
      modelList: [],
      waterPlantId: '',
      modelId: '',
      pointData: '',
      runningFlag: undefined,
      loading: false,
      date: moment().add(1, 'day'),
      predictionId: '',
      runType: ['2'],
      layout: {
        span: 5,
        wrapperCol: { span: 18 },
        gutter: [0] //栅格间隔[水平间距，垂直间距]
      },
      placeList: [],
      chartList: [],
      placeList1: [],
      placeList2: [],
      outputList: []
    };
  },

  components: { chartItem, paramPanel, FactorySelect, ProgressBar },
  mixins: [purificationLineMixin],
  computed: {
    // outputList() {
    //   return this.modelId ? this.handleOutputParam(this.modelId, this.modelList) : [];
    // },
    outputObj() {
      let defaultData = {};
      let pointData = {};
      this.outputList.forEach(item => {
        pointData[item] = {
          title: item,
          xList:
            this.showType === '0'
              ? [...this.placeList.map(item => item.placeName)]
              : this.getNextHours(),
          yList: []
        };
      });
      this.runType?.map(item => {
        defaultData[item] = { ...pointData };
      });
      return defaultData;
    }
  },
  watch: {
    line() {
      this.placeList = this['placeList' + (this.line == '0' ? '1' : '2')]; //
      this.getChartData(false);
    },
    waterPlantId: {
      handler(val) {
        if (val) {
          this.getModelList();
        }
      },
      immediate: true
    },
    modelId: {
      handler(val) {
        if (val) {
          this.getPreDisplayCodeList(true);
        }
      },
      immediate: true
    },
    showType(val) {
      this.getPreDisplayCodeList();
    },
    '$route.query': {
      deep: true,
      handler(newQuery, oldQuery) {
        if (isEqual(newQuery, oldQuery)) {
          return;
        }
        this.initQuery();
      }
    }
  },
  created() {
    this.sysDictListByCode('0', 'placeList1', () => {
      if (this.line === '0') {
        this.placeList = this.placeList1;
        this.getChartData(true);
      }
    });
    this.sysDictListByCode('1', 'placeList2', () => {
      if (this.line === '1') {
        this.placeList = this.placeList2;
        this.getChartData(true);
      }
    });
  },
  mounted() {},
  activated() {
    if (this.$route.query.drillDownTime && this.drillDownTime !== this.$route.query.drillDownTime) {
      this.abortedPredict = true;
      this.initQuery();
    } else if (this.waterPlantId) {
      this.getModelList(false);
    }
  },
  methods: {
    initQuery() {
      let {
        modelId,
        predictionId,
        waterPlantId,
        optionName,
        runningFlag,
        schemeId,
        pointData,
        drillDownTime
      } = this.$route.query;
      this.drillDownTime = drillDownTime;
      if (waterPlantId) {
        this.waterPlantId = waterPlantId;
      }
      if (pointData || pointData == '0') {
        this.pointData = pointData;
      }
      if (modelId) {
        setTimeout(() => {
          this.modelId = modelId;
          if (schemeId) {
            this.schemeId = schemeId;
          }
          if (optionName) {
            this.optionName = optionName;
          }
          if (predictionId) {
            this.$refs.paramPanel?.getScheme(predictionId);
          }
          if (runningFlag) {
            this.runningFlag = JSON.parse(runningFlag);
          }
        }, 600);
      } else {
        this.optionName = '';
        this.schemeId = '';
      }
    },
    handleOutputParam(modelId, modelList) {
      let outputParamStr = modelList.find(item => item.id === modelId)?.outputParam || '';
      return outputParamStr ? JSON.parse(outputParamStr) : [];
    },
    async getPreDisplayCodeList(isDefalut = false) {
      const params = {
        modelId: this.modelId,
        type: this.resultType || this.showType,
        modelTypeCode: this.tab
      };
      let res = await preDisplayCodeList(params);
      const { resultData, status } = res;
      if (status === 'complete' && resultData) {
        this.outputList = resultData;
        this.getChartData(isDefalut);
      } else {
        this.getChartData(false);
      }
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
    modelChange() {
      this.schemeId = '';
      this.predictionId = '';
    },
    factoryChange() {
      this.schemeId = '';
    },
    disabledDate(current) {
      return (
        current &&
        (current < moment().startOf('day') ||
          current >
            moment()
              .add(1, 'days')
              .endOf('day'))
      );
    },
    disabledDateTime(current) {
      return {
        disabledHours: () => {
          if (!current) {
            return false;
          } else if (current < moment().endOf('day')) {
            return this.range(0, 24).splice(0, moment().hour());
          } else {
            return this.range(0, 24).splice(moment().hour() + 1);
          }
        }
      };
    },
    async getModelList(isInit = true) {
      let params = {
        waterPlantId: this.waterPlantId,
        modelTypeCode: this.tab
      };
      let res = await getModelList(params);
      const { resultData, status } = res;
      if (status === 'complete') {
        this.modelList = resultData;
        if (isInit || (!isInit && !this.modelList.find(item => item.id === this.modelId))) {
          this.modelId = this.modelList?.[0]?.id || '';
        } else if (this.modelId) {
          this.$refs.paramPanel?.handleInputParam(this.modelList, false);
        }
      }
    },
    range(start, end) {
      const result = [];
      for (let i = start; i < end; i++) {
        result.push(i);
      }
      return result;
    },
    async getChartData(isDefalut = false) {
      const promises = [];
      promises.push(this.getDefaultChartData(isDefalut));
      if (this.tab === '4') {
        promises.push(this.getSludgeStateResult());
        promises.push(this.getStratificationMlssResult());
      }
      let res = await Promise.allSettled(promises);
      this.setChartList(res[0].value);
      if (this.tab === '4') {
        this.setOtherChartList(res[1].value);
        this.setOtherChartList(res[2].value);
      }
    },
    async getDefaultChartData(isDefault = false) {
      // 如果不需要请求API或没有predictionId，直接返回默认数据
      if (!this.predictionId || isDefault) {
        return this.outputObj;
      }
      this.loading = true;

      try {
        const params = this.buildRequestParams();
        const res = await postForecastResult(params);
        return this.handleResponse(res);
      } catch (error) {
        console.error('Failed to fetch chart data:', error);
        return this.outputObj;
      } finally {
        this.loading = false;
      }
    },

    // 构建请求参数
    buildRequestParams() {
      const params = {
        showCode: this.outputList,
        line: this.line,
        showType: this.showType,
        predictionId: this.predictionId
      };

      if (this.showType === '0') {
        params.dateTime = moment(this.date).format('YYYY-MM-DD HH');
      }

      return params;
    },

    // 处理API响应
    handleResponse(res) {
      const { resultData, status } = res;

      if (status === 'complete' && resultData && Object.keys(resultData).length) {
        return resultData;
      }

      return this.outputObj;
    },
    toSchemeLibrary() {
      this.drillDown({
        path: '/runPredict/modelScheme',
        query: {
          tabKey: this.tabKey
        }
      });
    },
    async getSludgeStateResult() {
      let defaultData = {
        initOption: sludgeOption,
        title: '二沉池状态点分析',
        legend: [],
        data: [{ xList: [], yList: [] }]
      };
      if (!this.predictionId) {
        return defaultData;
      }
      const params = {
        line: this.line,
        predictionId: this.predictionId
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
          legend,
          data
        };
      } else {
        return defaultData;
      }
    },
    async getStratificationMlssResult() {
      let defaultData = {
        isReverse: true,
        seriesConfig: [
          {
            type: 'bar'
          }
        ],
        title: '二沉池固体分布',
        legend: ['分层中总悬浮固体(mg/L)'],
        data: [{ xList: [], yList: [] }]
      };
      if (!this.predictionId) {
        return defaultData;
      }
      const params = {
        line: this.line,
        predictionId: this.predictionId
      };
      const { resultData, status } = await getStratificationMlssResult(params);
      if (status === 'complete') {
        return {
          title: '二沉池固体分布',
          legend: ['分层中总悬浮固体(mg/L)'],
          data: [resultData],
          isReverse: true,
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
    setChartList(data) {
      this.loading = true;
      const runType = Object.keys(data);
      const runTypeName = runType.map(item => typeMap[item]);
      if (!isEqual(runType, this.runType) && runType?.length) {
        this.runType = runType;
      }
      const chartData = Object.values(data);
      setTimeout(() => {
        let tempArr = Object.keys(chartData[0]).map(item => {
          let axisLabel =
            this.showType === '0'
              ? {
                  rotate: -40,
                  margin: 8
                }
              : { rotate: 0, margin: 8 };
          return {
            initOption: inWaterOption,
            axisLabel,
            legend: runTypeName,
            title: item,
            data: chartData.map(type => type[item])
          };
        });
        this.chartList = tempArr;
        this.loading = false;
      }, 0);
    },
    setOtherChartList(data) {
      this.loading = true;

      setTimeout(() => {
        let chartData = {
          axisLabel: { rotate: 0, margin: 8 },
          initOption: inWaterOption,
          ...data
        };
        this.chartList.push(chartData);
        this.loading = false;
      }, 0);
    },

    async sysDictListByCode(code, data, callback) {
      const res = await getModelPlaceCode(code);
      this[data] = res.resultData;
      callback && callback();
    },
    changeLoad(isShow) {
      if (isShow) {
        this.loading = true;
      } else {
        this.loading = false;
      }
    },
    changeProcess(isShow) {
      if (isShow) {
        this.isShowProcess = true;
        this.allowInstantCompletion = false;
      } else {
        this.allowInstantCompletion = true;
        this.isShowProcess = false;
      }
    },
    handleProcess() {
      console.log('1111111111');
      this.$refs.progressBar.resetProgress();
      this.allowInstantCompletion = false;
      this.isShowProcess = false;
    },
    handleChange(data) {
      this.predictionId = data?.predictionId || '';
      this.getChartData();
    }
  }
};
</script>
<style lang="less" scoped>
.page {
  width: 100%;
  height: 100%;
  display: flex;
  position: relative;
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
  &__left {
    border-radius: 4px;
    background-color: var(--supply-color-bg-card-component);
  }
  &__right {
    flex: 1;
    flex-direction: column;
    display: flex;
    margin-right: 12px;
    flex-wrap: wrap;
    .run-header {
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      min-width: 0;
      .form-item {
        align-items: center;
        margin-right: 10px;
        .label {
          white-space: nowrap;
        }
      }
      /deep/ .wpg-info-form-footer {
        margin-left: auto;
        float: right;
        width: 25%;
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
      padding: 0 0 12px 12px;
      width: calc(100% / 3);
      height: 302px;
      .chart-wrap {
        border-radius: 4px;
      }
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
