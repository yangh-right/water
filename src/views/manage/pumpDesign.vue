<!--
 * @Author: wangyr
 * @Date: 2022-12-06 08:55:58
 * @LastEditors: wangyr
 * @LastEditTime: 2024-10-15 09:47:37
 * @Description:
-->
<template>
  <div class="analyse-con">
    <div id="reportTable" class="report-table">
      <table-search>
        <w-row slot="form" :gutter="10" class="report-table-search">
          <w-form-model ref="form" :model="form">
            <w-col class="supply-float-left supply-mr-4" style="width: 330px;padding-left: 0px;">
              <w-form-model-item
                class="select-pumps"
                :label="`选择${$store.state.configure.textReplace}`"
                prop="pumpIds"
              >
                <FactorySelect v-model="form.pumpId" autoSelect></FactorySelect>
              </w-form-model-item>
            </w-col>
            <w-col class="supply-mr-4" :span="4">
              <w-form-model-item label="构筑物">
                <w-select v-model="modleType" placeholder="请选择构筑物">
                  <w-select-option v-for="type in typeList" :key="type.value" :value="type.value">{{
                    type.label
                  }}</w-select-option>
                </w-select>
              </w-form-model-item>
            </w-col>
            <w-col class="supply-float-left" style="width: 276px">
              <w-form-model-item label="选择日期" prop="date">
                <w-date-picker
                  v-model="form.dateTime"
                  :disabled-date="disabledDate"
                  :allowClear="false"
                />
              </w-form-model-item>
            </w-col>
            <w-col style="padding-top: 3px;" class="supply-float-right">
              <w-button type="primary" @click="toPumpType">水泵类型管理</w-button>
            </w-col>
          </w-form-model>
        </w-row>

        <div class="supply-h-full supply-flex supply-flex-col">
          <w-row class="card-box" :gutter="12" style="margin-bottom: 0;">
            <w-col :span="16">
              <p class="card-title supply-text-secondary supply-text-sm">
                <span>运行数据</span>
              </p>
              <div
                :class="[
                  'card chart-main supply-bg-bg-card-DEFAULT wpg-bs supply-bg-card-light card-list-col'
                ]"
              >
                <div class="card-main predict-main">
                  <predict
                    :pumpId="form.pumpId"
                    :modleType="modleType"
                    :dateTime="form.dateTime"
                    :predictDeviceIds="predictDeviceIds"
                  ></predict>
                </div>
                <div
                  v-if="buttonLoading"
                  class="spin supply-flex supply-items-center supply-justify-center"
                >
                  <w-spin></w-spin>
                </div>
              </div>
            </w-col>
            <w-col class="run-box" :span="8">
              <p
                class="card-title supply-text-secondary supply-text-sm supply-flex supply-items-center supply-justify-between"
              >
                <span>运行时长</span>
                <w-button type="primary" @click="handleAlarm">报警记录</w-button>
              </p>
              <runTime :pumpId="form.pumpId" :modleType="modleType"></runTime>
            </w-col>
          </w-row>
          <w-row class="card-box" :gutter="12" style="margin-bottom: 0;">
            <w-col :span="24">
              <p class="card-title supply-text-secondary supply-text-sm">
                <span>建议配泵方案</span>
              </p>
              <div
                :class="[
                  'card supply-bg-bg-card-DEFAULT wpg-bs supply-bg-card-light card-list-col'
                ]"
              >
                <div class="card-main">
                  <pump-match :tableData="predictionSolution"></pump-match>
                </div>
                <div
                  v-if="spinng"
                  class="spin supply-flex supply-items-center supply-justify-center"
                >
                  <w-spin></w-spin>
                </div>
              </div>
            </w-col>
            <w-col :span="24">
              <p class="card-title supply-text-secondary supply-text-sm">
                <span>实际配泵方案</span>
              </p>
              <div
                :class="[
                  'card supply-bg-bg-card-DEFAULT wpg-bs supply-bg-card-light card-list-col'
                ]"
              >
                <div class="card-main">
                  <pump-real :tableData="actualSolution"></pump-real>
                </div>
                <div
                  v-if="spinng"
                  class="spin supply-flex supply-items-center supply-justify-center"
                >
                  <w-spin></w-spin>
                </div>
              </div>
            </w-col>
          </w-row>
        </div>
      </table-search>
      <!-- 报警列表 -->
      <alarmList
        ref="alarmList"
        :waterPlantId="form.pumpId"
        :runTimeDeviceIds="runTimeDeviceIds"
        :dateTime="form.dateTime"
      ></alarmList>
    </div>
  </div>
</template>

<script>
import FactorySelect from '@/components/factory-select/index.vue';
import { columns } from './components/data';
import {
  getPumpList,
  waterPredictionCompareApi,
  waterPredictionCompareEconomy,
  waterPredictionSolution,
  waterActualSolution
} from '@/api/manage';
import { getPumpsList } from '@/api';
import { getRealDataByPointConfigCode } from '@/api/optimization';
import { getPointConfigCode } from '@/api/analysis';
import predict from './components/predict.vue';
import runTime from './components/runTime.vue';
import alarmList from './components/alarmList.vue';
import pumpMatch from './components/pumpMatch.vue';
import pumpReal from './components/pumpReal.vue';

export default {
  name: 'pumpDesign',
  components: { predict, runTime, alarmList, pumpMatch, pumpReal, FactorySelect },
  data() {
    return {
      form: {
        pumpId: '',
        dateTime: this.$moment()
      },
      pump: {
        keyword: undefined,
        current: 1,
        size: 20,
        list: [],
        total: 0
      },
      modleType: 'pump_inlet',
      typeList: [
        {
          value: 'pump_inlet',
          label: '进水泵房'
        },
        {
          value: 'pump_storage_tank',
          label: '调蓄池'
        }
      ],
      buttonLoading: true,
      spinng: true,
      columns,
      data: [],
      compareEconomy: {},
      predictionSolution: [],
      actualSolution: [],
      runTimeDeviceIds: [],
      predictDeviceIds: [],
      debounceTimer: null
    };
  },
  watch: {
    'form.pumpId': 'onFormChange',
    'form.dateTime': 'onFormChange',
    modleType: 'onModleTypeChange'
  },
  created() {
    this.initAll();
  },
  methods: {
    async initAll() {
      await this.getPointCodes();
      await this.getPredictPointCodes();
      this.getWaterPredictionSolution();
      this.getWaterActualSolution();
    },
    onFormChange() {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.initData();
        this.getWaterPredictionSolution();
        this.getWaterActualSolution();
      }, 300);
    },
    async onModleTypeChange() {
      await this.getPointCodes();
      await this.getPredictPointCodes();
      this.getWaterPredictionSolution();
      this.getWaterActualSolution();
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.initData();
      }, 300);
    },
    async getPointCodes() {
      const configCode = `${this.modleType}_runtime`;
      const { resultData, status } = await getPointConfigCode(configCode);
      if (status === 'complete') {
        this.runTimeDeviceIds = [
          ...new Set(resultData?.pointConfigRels?.map(item => item.deviceId) ?? [])
        ];
      }
    },
    async getPredictPointCodes() {
      const configCode = `${this.modleType}_predict`;
      const { resultData, status } = await getPointConfigCode(configCode);
      if (status === 'complete') {
        this.predictDeviceIds = [
          ...new Set(resultData?.pointConfigRels?.map(item => item.deviceId) ?? [])
        ];
      }
    },
    handleAlarm() {
      this.$refs.alarmList.visible = true;
    },
    initData() {
      this.getWaterPredictionCompare();
      this.getWaterPredictionCompareEconomy();
    },
    async getPumpList() {
      const params = {
        ids: [],
        type: 'region',
        keyword: this.pump.keyword,
        addressFlag: false,
        page: {
          size: this.pump.size,
          current: this.pump.current
        }
      };
      const res = await getPumpsList(params);
      const list = (res?.records ?? []).map(v => ({
        value: v.id,
        label: v.stationName
      }));
      this.pump.total = res?.total;
      if (this.pump.current === 1) {
        this.pump.list = list;
      } else {
        this.pump.list.push(...list);
      }
      if (!this.form.pumpId && this.pump.list?.length > 0) {
        this.form.pumpId = this.pump.list[0].value;
      }
    },
    async getWaterPredictionCompare() {
      const isToday = this.$moment(this.form.dateTime).isSame(this.$moment(), 'day');
      const endDateTime = isToday
        ? this.$moment().format('YYYY-MM-DD HH:mm:ss')
        : this.$moment(this.form.dateTime)
            .add(1, 'days')
            .format('YYYY-MM-DD 00:00:00');
      const params = {
        endDateTime,
        scale: 1,
        startDateTime: this.form.dateTime.format('YYYY-MM-DD 00:30:00'),
        stationId: this.form.pumpId
      };
      this.buttonLoading = true;
      const { status, resultData } = await waterPredictionCompareApi(params);
      this.buttonLoading = false;
      if (status === 'complete') {
        this.data = [
          {
            name: '预测',
            water: resultData?.predictionWater || '--',
            electricity: resultData?.predictionElectricity || '--',
            energy: resultData?.predictionEnergy || '--'
          },
          {
            name: '实际',
            water: resultData?.actualWater || '--',
            electricity: resultData?.actualElectricity || '--',
            energy: resultData?.actualEnergy || '--'
          },
          {
            name: '比例',
            water: `偏差 ${resultData?.diffWater || 0}%`,
            electricity: `节省 ${
              resultData?.predictionElectricity > resultData?.actualElectricity ? '-' : ''
            }${resultData?.diffElectricity ? Math.abs(resultData?.diffElectricity) : 0}%`,
            energy: `下降 ${resultData?.predictionEnergy > resultData?.actualEnergy ? '-' : ''}${
              resultData?.diffEnergy ? Math.abs(resultData?.diffEnergy) : 0
            }%`
          }
        ];
      }
    },
    toPumpType() {
      this.drillDown({
        path: '/manage/pumpTypeManage'
      });
    },
    async getWaterPredictionCompareEconomy() {
      const date = this.form.dateTime.format('YYYY-MM-DD 00:00:00');
      const params = {
        endDateTime: date,
        scale: 1,
        startDateTime: this.$moment(date)
          .subtract(30, 'days')
          .format('YYYY-MM-DD 00:30:00'),
        stationId: this.form.pumpId
      };
      const { status, resultData } = await waterPredictionCompareEconomy(params);
      if (status === 'complete') {
        this.compareEconomy = resultData;
      }
    },
    async getWaterPredictionSolution() {
      if (!this.form.pumpId) return;
      const deviceId = this.runTimeDeviceIds.join(',');
      const params = {
        endDateTime: this.$moment(this.form.dateTime)
          .add(1, 'days')
          .format('YYYY-MM-DD 00:00:00'),
        scale: 1,
        startDateTime: this.form.dateTime.format('YYYY-MM-DD 00:30:00'),
        stationId: `${this.form.pumpId}_${deviceId}`
      };
      this.spinng = true;
      const { status, resultData } = await waterPredictionSolution(params);
      this.spinng = false;
      if (status === 'complete' && Array.isArray(resultData)) {
        resultData.forEach(item => {
          item['match'] = this.handlerArr(item.pumpRun);
        });
        this.predictionSolution = resultData;
      }
    },
    async getWaterActualSolution() {
      if (!this.form.pumpId) return;
      const deviceId = this.runTimeDeviceIds.join(',');
      const params = {
        endDateTime: this.$moment(this.form.dateTime).format('YYYY-MM-DD 23:59:59'),
        scale: 1,
        startDateTime: this.form.dateTime.format('YYYY-MM-DD 00:00:00'),
        stationId: `${this.form.pumpId}_${deviceId}`
      };
      const { status, resultData } = await waterActualSolution(params);
      if (status === 'complete' && Array.isArray(resultData)) {
        // 生成24小时时间区间，跨度为1小时
        const timeArrays = [];
        new Array(24).fill(['', '']).forEach((_, index) => {
          const tempArr = [
            [
              (index < 10 ? '0' + index : index) + ':00',
              (index < 10 ? '0' + index : index) + ':30',
              2 * index
            ],
            [
              (index < 10 ? '0' + index : index) + ':30',
              (index + 1 < 10 ? '0' + (index + 1) : index + 1) + ':00',
              2 * index + 1
            ]
          ];
          timeArrays.push(...tempArr);
        });
        resultData.forEach(item => {
          const tempArr = this.handlerRealArr(item.pumpRunActual, timeArrays);
          this.twoArr(tempArr);
          item['match'] = tempArr;
        });
        this.actualSolution = resultData;
      }
    },
    handlerArr(data = []) {
      if (!Array.isArray(data) || data.length === 0) return false;
      const tableData = [];
      let tempArr = [];
      // 默认48条数据
      if (data.length !== 48) {
        for (let i = 0; i < 48; i++) {
          let time = '';
          if (i % 2 === 0) {
            time = (i / 2).toFixed(0) + ':30';
          } else {
            time = i === 47 ? '0:00' : (i / 2).toFixed(0) + ':00';
          }
          if (
            data[i] &&
            data[i]['combinationTime'] &&
            data[i]['combinationTime'].indexOf(time) === -1
          ) {
            data.splice(i, 0, {
              combinationTime: this.form.dateTime.format('YYYY-MM-DD') + ' ' + time,
              efficiency: 0,
              frequency: 0,
              isEfficient: 0,
              isOpen: 0,
              powerConsumption: 0,
              pumpId: data[0]['pumpId'],
              stationId: data[0]['stationId'],
              tenantId: data[0]['tenantId'],
              bgClass: 'leave-bar'
            });
          }
        }
      }
      data.forEach((item, j) => {
        if (!item['bgClass']) {
          item['bgClass'] = item['isOpen'] === 1 ? 'noraml-bar' : 'leave-bar';
        }
        tempArr.push(item);
        if (tempArr.length >= 2) {
          tableData.push(tempArr);
          tempArr = [];
        }
      });
      return tableData;
    },
    handlerRealArr(data = [], timeArrays) {
      const fillArr = Array.from({ length: 48 }, () => []);
      data.forEach(item => {
        const time = this.$moment(item.startTime).format('HH:mm');
        const mini = Number(time.split(':')[1]);
        const timeRange = timeArrays.filter(
          arr => this.compare(time, arr[0], true) && this.compare(arr[1], time, false)
        );
        const i = timeRange[0][2];
        this.getItem(item.time, mini, fillArr, i, item);
      });
      return fillArr;
    },
    getItem(time, mini, fillArr, i, item) {
      const params = {
        left: (mini >= 30 ? (mini - 30) / 30 : mini / 30) * 100 + '%',
        percent: 0,
        isOpen: item.isOpen,
        frequency: item.frequency,
        startTime: item.startTime,
        endTime: item.endTime,
        bgClass: item['isOpen'] === 1 ? 'noraml-bar' : 'leave-bar'
      };
      const remainder = mini % 30;
      const outer = 30 - remainder;
      if (time - outer <= 0) {
        params['percent'] = (time / 30) * 100 + '%';
        fillArr[i].push(params);
      } else {
        params['percent'] = (outer / 30) * 100 + '%';
        fillArr[i].push(params);
        this.getItem(time - outer, 0, fillArr, i + 1, item);
      }
    },
    twoArr(data = []) {
      for (let i = 0; i < data.length; i++) {
        const max = Math.max.apply(
          Math,
          data[i].map(o => (o.status === '2' ? o.frequency : 0))
        );
        data[i].forEach(item => {
          item['max'] = max;
        });
      }
    },
    compare(startTime, endTime, equals) {
      const [sh, sm] = startTime.split(':');
      const [eh, em] = endTime.split(':');
      const startTimeVal = sh * 60 + Number(sm);
      const endTimeVal = eh * 60 + Number(em);
      return equals ? startTimeVal >= endTimeVal : startTimeVal > endTimeVal;
    },
    /* 禁选时间 */
    disabledDate(current) {
      return current && current > this.$moment().endOf('day');
    }
  }
};
</script>

<style lang="less" scoped>
.analyse-con {
  height: 100%;
  overflow: auto;
}
.card-list-col {
  height: 100%;
  position: relative;
  .spin {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }
}
.run-box {
  height: 330px;
}
.card-box {
  background: var(--supply-color-bg-card-DEFAULT);
  padding: 12px;
  margin-bottom: 12px !important;
  border-radius: 4px;
  .card-title {
    display: flex;
    justify-content: space-between;
    i,
    span {
      vertical-align: middle;
      line-height: 24px;
      font-size: 16px;
      font-weight: 500;
      color: var(--supply-color-main);
    }
  }
  .card {
    margin-bottom: 12px;
    height: auto;
    border-radius: 4px;
    &-main {
      width: 100%;
      height: 100%;
      position: relative;
      align-items: center;
      padding: 12px 12px;
    }
    .card-mg {
      padding-top: 12px;
    }
    /deep/.wpg-table-tbody > tr > td {
      border-bottom: 1px solid var(--supply-color-border-DEFAULT);
    }
    .predict-result {
      line-height: 1.5;
      padding: 8px;
      margin: 20px 0 0 0;
      text-align: left;
      background: var(--supply-color-bg-card-rank-default);
      font-weight: 500;
      font-size: 14px;
      color: var(--supply-color-invalid);
      border: 1px solid var(--supply-color-border-DEFAULT);
      border-radius: 4px;
      span {
        color: var(--supply-color-primary-DEFAULT);
      }
    }
  }
  .chart-main {
    height: 286px;
  }
}
.des-cl {
  color: var(--supply-color-primary-DEFAULT);
}
</style>
