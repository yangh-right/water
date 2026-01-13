<!--
 * @Description:
 * @version:
 * @Author: fengtaotao
 * @Date: 2023-05-23 14:29:38
 * @LastEditors:  Do not edit
 * @LastEditTime: 2024-05-28 18:23:41
-->
<template>
  <div class="content">
    <div class="content-header">
      <div class="content-title">{{ title }}</div>
      <div class="ct-left">
        <div v-show="selectType === '1'" class="time-box">
          时间：
          <w-date-picker
            format="YYYY-MM-DD HH:00"
            :disabled-date="disabledDate"
            :disabled-time="disabledDateTime"
            style="width: 150px"
            :show-time="{ format: 'HH:00' }"
            class="select-item"
            :allowClear="false"
            placeholder="请选择时间"
            v-model="date"
            @change="getPointList(false)"
          >
          </w-date-picker>
        </div>
        <div class="tool-icons">
          <w-icon
            v-for="item in toolIcon"
            :key="item.icon"
            :title="item.title"
            :type="item.icon"
            :class="`tool-icon ${item.type === selectType ? 'active' : ''}`"
            @click="handlerType(item.type)"
          ></w-icon>
        </div>
      </div>
    </div>
    <div class="tabs-box" v-show="selectType === '0'">
      <div class="tabs">
        <div
          v-for="item in displayedPoints"
          :key="item.pointName"
          :class="currentParams === item.pointName ? 'tab active' : 'tab'"
          @click="paramsChange(item)"
        >
          {{ item.pointMemo }}
        </div>
      </div>
      <w-dropdown v-if="pointsArr.length > pageSize" style="line-height: normal;">
        <a class="ant-dropdown-link" @click="e => e.preventDefault()">
          更多<w-icon type="right" />
        </a>
        <w-menu slot="overlay" @click="handleMenuClick">
          <w-menu-item key="1" v-for="i in menuPoints" :key="i.pointName">
            {{ i.pointMemo }}
          </w-menu-item>
        </w-menu>
      </w-dropdown>
    </div>
    <w-spin :spinning="loading" class="spin">
      <div v-show="selectType === '0'" class="chart-wrapper">
        <line-chart
          v-if="flag"
          :darkTheme="'light'"
          :option="inWaterOption"
          ref="inChart1"
        ></line-chart>
        <w-empty v-else class="empty"></w-empty>
      </div>
      <div v-show="selectType === '1'" class="table-wrapper">
        <w-table
          v-if="data.length > 0"
          :columns="columns"
          :data-source="data"
          :scroll="scroll"
          :pagination="false"
          rowKey="pointName"
        >
        </w-table>
        <w-empty v-else class="empty"></w-empty>
      </div>
    </w-spin>
  </div>
</template>
<script>
import moment from 'moment';
import { getPointConfigsByPumpHouseIdAndGroupType, getOutFlow } from '@/api/optimization';
import { inWaterOption, toolIcon } from './data';
export default {
  name: 'WaterQuality',
  props: {
    title: {
      type: String,
      default: ''
    },
    waterPlantId: {
      type: String,
      default: ''
    },
    activeModule: {
      type: Object,
      default: () => null
    }
  },
  components: {
    LineChart: () => import('@/components/chart/LineChart.vue')
  },
  data() {
    return {
      flag: true,
      loading: false,
      date: moment().subtract(1, 'hour'),
      currentParams: '',
      toolIcon,
      selectType: '1',
      pointsArr: [],
      pageSize: 5, //显示多少tab
      displayedPoints: [], //显示部分
      menuPoints: [], //更多下拉
      columns: [
        {
          title: '监测量名称',
          align: 'center',
          ellipsis: true,
          dataIndex: 'pointName',
          customRender: (text, row) => {
            return !!text ? text : '--';
          }
        },
        {
          title: `实际值`,
          align: 'center',
          ellipsis: true,
          dataIndex: `real_val`,
          customRender: (text, row) => {
            return !!text && text !== 'null' ? text : '--';
          }
        },
        {
          title: `预测值`,
          align: 'center',
          ellipsis: true,
          dataIndex: `pre_val`,
          customRender: (text, row) => {
            return !!text && text !== 'null' ? text : '--';
          }
        },
        {
          title: `小时偏差率(%)`,
          align: 'center',
          width: 120,
          ellipsis: true,
          dataIndex: `hour_deviation_rate`,
          customRender: (text, row) => {
            return !!text && text !== 'null' ? text : '--';
          }
        }
      ],
      baseTableData: [],
      data: [],
      scroll: {
        y: 136
      },
      inWaterOption: inWaterOption
    };
  },
  watch: {
    activeModule: {
      deep: true,
      handler(val) {
        if (val) {
          this.getTabsList();
        }
      }
    }
  },
  created() {},
  methods: {
    handleMenuClick(e) {
      let indexId = 0;
      let data = {};
      this.pointsArr.map((item, index) => {
        if (item.pointName === e.key) {
          indexId = index;
          data = { ...item };
        }
      });
      [this.pointsArr[2], this.pointsArr[indexId]] = [this.pointsArr[indexId], this.pointsArr[2]];
      this.displayedPoints = this.pointsArr.slice(0, this.pageSize);
      this.menuPoints = this.pointsArr.slice(this.pageSize);
      this.paramsChange(data);
    },
    async getTabsList() {
      let params = {
        pumpHouseId: this.waterPlantId, //传水厂id
        groupType: 'outflow' //进水
      };
      let { resultData, status } = await getPointConfigsByPumpHouseIdAndGroupType(params);
      if (status === 'complete') {
        if (resultData.length) {
          this.pointsArr = resultData[0].pointConfigRels;
          this.displayedPoints = this.pointsArr.slice(0, this.pageSize);
          this.menuPoints = this.pointsArr.slice(this.pageSize);
          this.currentParams = this.pointsArr[0].pointName;
          this.currentDevice = this.pointsArr[0];
          this.getPointList();
        } else {
          this.pointsArr = [];
          this.currentParams = '';
          this.currentDevice = {};
          this.flag = false;
        }
      }
    },
    handlerType(type) {
      this.selectType = type;
      this.getPointList();
    },
    paramsChange(value) {
      this.currentDevice = value;
      this.currentParams = value.pointName;
      this.getPointList();
    },
    async getPointList() {
      this.loading = true;
      let params = {
        selectType: this.selectType,
        selectDate: this.selectType === '1' ? moment(this.date).format('YYYY-MM-DD HH:00:00') : '',
        optionId: this.activeModule.id,
        pointName: this.selectType === '1' ? '' : this.currentDevice.pointName,
        waterPlantId: this.waterPlantId
      };
      let { resultData, status } = await getOutFlow(params);
      this.loading = false;
      if (status === 'complete') {
        let { pointMap, waterQualityVO } = resultData;
        if (this.selectType === '0') {
          this.inWaterOption.xAxis[0].data = waterQualityVO.xList;
          this.inWaterOption.series[0].data = waterQualityVO.yList;
          this.inWaterOption.series[1].data = waterQualityVO.preList;
          if (waterQualityVO.yList.length > 0 || waterQualityVO.preList.length > 0) {
            this.flag = true;
          } else {
            this.flag = false;
          }
        }
        if (this.selectType === '1') {
          let records = [];
          if (!!pointMap && Object.keys(pointMap).length > 0) {
            Object.keys(pointMap).forEach(key => {
              let obj = {};
              obj['pointName'] = key;
              obj['real_val'] = pointMap[key]['实际值'];
              obj['pre_val'] = pointMap[key]['预测值'];
              obj['hour_deviation_rate'] = pointMap[key]['小时偏差率'];
              records.push(obj);
            });
            this.data = records;
          }
        }
      }
    },
    getPointData() {
      if (Object.keys(this.currentDevice).length > 0) {
        let dataTime = [],
          pvData = [],
          simulateData = [];
        let { dataAndTimeList, pointMemo, unit } = this.currentDevice;
        if (dataAndTimeList.length) {
          dataAndTimeList.forEach(item => {
            dataTime.push(item.date.slice(11, 16));
            pvData.push(item.pv);
            simulateData.push(item.simulatePv);
          });
        }
        dataTime = Array.from(new Set(dataTime));
        this.inWaterOption.yAxis[0].name = unit;
        this.inWaterOption.xAxis[0].data = dataTime;
        this.inWaterOption.series[0].data = pvData;
        this.inWaterOption.series[1].data = simulateData;
      }
    },
    disabledDate(current) {
      if (current) {
        let hour = moment(current).format('HH');
        if (hour < 12) {
          return (
            current > moment().endOf('day') ||
            current <
              moment()
                .subtract(1, 'days')
                .startOf('day')
          );
        } else {
          return (
            current < moment().startOf('day') ||
            current >
              moment()
                .add(1, 'days')
                .endOf('day')
          );
        }
      } else {
        return false;
      }
    },
    rangeHours(start, end, value, chooseday, day) {
      const result = [];
      if (value < 12) {
        if (chooseday === day) {
          for (let i = start; i < end; i++) {
            if (i > value + 12) {
              result.push(i);
            }
          }
        } else {
          for (let i = start; i < end; i++) {
            if (i < value + 12) {
              result.push(i);
            }
          }
        }
      } else {
        if (chooseday === day) {
          for (let i = start; i < end; i++) {
            if (i < value - 12) {
              result.push(i);
            }
          }
        } else {
          for (let i = start; i < end; i++) {
            if (i > value - 12) {
              result.push(i);
            }
          }
        }
      }
      return result;
    },
    rangeMinutes(start, end, value, chooseday, day, chooseh, h) {
      const result = [];
      if (chooseday === day && chooseh === h) {
        for (let i = start; i < end; i++) {
          if (i > value) {
            result.push(i);
          }
        }
      } else if (chooseday !== day && chooseh === h) {
        for (let i = start; i < end; i++) {
          if (i < value) {
            result.push(i);
          }
        }
      }
      return result;
    },
    rangeSeconds(start, end, value, chooseday, day, chooseh, h, choosem, m) {
      const result = [];
      if (chooseday === day && chooseh === h && choosem === m) {
        for (let i = start; i < end; i++) {
          if (i > value) {
            result.push(i);
          }
        }
      } else if (chooseday !== day && chooseh === h && choosem === m) {
        for (let i = start; i < end; i++) {
          if (i < value) {
            result.push(i);
          }
        }
      }
      return result;
    },
    disabledDateTime(date) {
      // 选中的时间
      const choosetime = moment(date).format('HH-mm-ss');
      const chooseday = parseInt(
        moment(date)
          .format('YYYY-MM-DD')
          .split('-')[2]
      );
      const chooseh = parseInt(choosetime.split('-')[0]);
      const choosem = parseInt(choosetime.split('-')[1]);
      // 当前时间
      const nowtime = moment().format('HH-mm-ss');
      const day = parseInt(
        moment()
          .format('YYYY-MM-DD')
          .split('-')[2]
      );
      const h = parseInt(nowtime.split('-')[0]);
      const m = parseInt(nowtime.split('-')[1]);
      const s = parseInt(nowtime.split('-')[2]);
      return {
        disabledHours: () => this.rangeHours(0, 24, h, chooseday, day)
        // disabledMinutes: () => this.rangeMinutes(0, 60, m, chooseday, day, chooseh, h),
        // disabledSeconds: () => this.rangeSeconds(0, 60, s, chooseday, day, chooseh, h, choosem, m)
      };
    }
  }
};
</script>

<style lang="less" scoped>
.content {
  width: calc(25% - 6px);
  background: var(--supply-color-bg-card-DEFAULT);
  border-radius: 4px;
  &-header {
    width: 100%;
    padding: 15px 12px;
    display: inline-flex;
    justify-content: space-between;
    align-items: center;
    height: 40px;

    .tool-icon {
      cursor: pointer;
      margin-right: 8px;

      &.active {
        color: var(--supply-color-primary-DEFAULT);
      }
    }
    .wpg-btn {
      border-color: var(--supply-color-bg-card-DEFAULT) !important;
      box-shadow: none;
    }
  }
  &-title {
    font-weight: 600;
    font-size: 16px;
    color: var(--supply-color-main);
    letter-spacing: 0;
  }
  .ct-left {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .time-box {
      margin-right: 12px;
    }
  }
  .form-item {
    margin-top: 10px;
    width: 80px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .tabs-box {
    display: flex;
    margin-top: 8px;
    justify-content: flex-start;
    align-items: center;
    .tabs {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      cursor: pointer;
      .tab {
        height: 24px;
        line-height: 24px;
        margin-right: 8px;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0 15px;
        background: var(--supply-color-bg-card-dark);
        border: 1px solid var(--supply-rgb-color-bg-DEFAULT);
        color: var(--supply-color-secondary);
        border-radius: 12px;
        font-size: 14px;
      }
      .active {
        color: var(--supply-color-online);
      }
    }
  }
  .ant-dropdown-link:hover {
    color: var(--supply-color-primary-DEFAULT);
    opacity: 0.7;
  }
  .spin {
    height: calc(100% - 64px);
  }
  .chart-wrapper {
    height: 100%;
    padding: 10px 0;
  }
  .table-wrapper {
    padding: 0 12px;
    box-sizing: border-box;
    margin: 0;
    width: 100%;
    height: 100%;
  }
  .empty {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  /deep/ .wpg-select-selection--single {
    height: 32px;
  }
  /deep/ .wpg-spin-container {
    height: 100%;
  }
}
</style>
