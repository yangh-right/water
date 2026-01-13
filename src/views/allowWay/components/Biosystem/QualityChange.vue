<!--
 * @Description:
 * @version:
 * @Author: fengtaotao
 * @Date: 2023-05-23 14:29:38
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2024-10-08 17:06:16
-->
<template>
  <div class="content supply-flex supply-flex-col">
    <div class="content-header">
      <div class="content-title">{{ title }}</div>
    </div>
    <div v-show="pointData.length" id="macy-container" class="point">
      <div
        v-for="(point, index) in pointData"
        :style="{ width: pointData.length ? `calc(${(1 / pointData.length) * 100}% - 6px)` : '0' }"
        :key="index"
        class="point__item"
      >
        <div class="point__name">{{ point.point.pointMemo }}</div>
        <div class="section">
          <div
            class="section__item"
            v-for="(item, index) in point.pointDataList"
            :key="item.pointName"
          >
            <span class="section__name"
              ><span class="section__name-wrap">{{ item.placeName }}</span></span
            >
            <custom-progress
              class="section__progress"
              :color="item.color"
              :percent="item.percent"
            ></custom-progress>
            <span class="section__value" :title="item.pointRealData.pointValue">{{
              item.pointRealData.pointValue
            }}</span>
            <span class="section__unit">{{ item.pointRealData.pointUnit }}</span>
          </div>
        </div>
      </div>
    </div>
    <w-empty class="empty" v-show="!pointData.length"></w-empty>
  </div>
</template>
<script>
import Vue from 'vue';
import Macy from 'macy';
import DateSelect from '../DateSelect.vue';
import CustomProgress from '../Progress.vue';
import { getBiochemicalTrend } from '@/api/analysis';
import { getColor } from '@/utils/util';
import { getPointConfigsByPumpHouseIdAndGroupType, getPointValue } from '@/api/optimization';
import { inWaterOption, pointsData, colorList } from '../data';
export default {
  name: 'QualityChange',
  props: {
    waterPlantId: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    showType: {
      type: String,
      default: 'chart'
    },
    showDate: {
      type: Boolean,
      default: false
    },

    modleType: {
      type: String,
      default: ''
    }
  },
  components: {
    CustomProgress,
    DateSelect,
    LineChart: () => import('@/components/chart/LineChart.vue')
  },
  data() {
    return {
      macyObj: null,
      pointData: [],
      flag: true,
      loading: false,
      currentParams: '',
      tabs: [],
      option: 'day',
      type: '1',
      options: [
        {
          label: '1天',
          value: 'day'
        },
        {
          label: '3天',
          value: 'days'
        },
        {
          label: '1周',
          value: 'week'
        }
      ],
      inWaterOption: inWaterOption,
      endTime: '',
      startTime: '',
      columns: []
    };
  },
  watch: {
    waterPlantId: {
      handler(val) {
        if (val) {
          this.getPointList();
        }
      }
    },
    modleType: {
      immediate: true,
      handler(nVal) {
        if (nVal) {
          this.columns = pointsData[nVal].columns;
          this.tabs = pointsData[nVal].tabs;
          this.currentParams = this.tabs.length > 0 ? this.tabs[0].pointMemo : '';
        }
      }
    }
  },
  created() {},
  mounted() {},
  methods: {
    paramsChange(value) {
      this.currentDevice = value;
      this.currentParams = value.pointMemo;
      this.loading = true;
      setTimeout(() => {
        this.loading = false;
      }, 1000);
      // this.getPointData();
    },
    async getPointList() {
      if (!this.waterPlantId) return;
      let { resultData, status } = await getBiochemicalTrend(this.waterPlantId);
      if (status === 'complete') {
        const pointData = resultData.filter(item => item.pointDataList.length);
        let placeColorMap = {};
        pointData.forEach(item => {
          item.pointDataList.forEach(place => {
            placeColorMap[place.placeId] = null;
          });
        });
        Object.keys(placeColorMap).forEach((item, i) => {
          placeColorMap[item] = getColor(colorList, i);
        });
        pointData.forEach(item => {
          item.pointDataList.forEach((place, i) => {
            place.color = placeColorMap[place.placeId];
            place.percent = place.pointRealData.pointValue / (place.pointRealData.maxValue ?? 500);
          });
        });
        this.pointData = pointData;
      } else {
        this.pointData = [];
      }
    },
    async getPointData() {
      this.loading = true;
      this.flag = false;
      let param = {
        deviceId: this.currentDevice.deviceId,
        endTime: this.endTime,
        pointCode: [this.currentDevice.pointName],
        startTime: this.startTime,
        waterPlantId: this.waterPlantId,
        type: this.type
      };
      let { resultData, status } = await getPointValue(param);
      this.loading = false;
      if (status === 'complete') {
        let dataTime = [],
          historyData = [],
          forecastData = [];
        let data = resultData.biochemicalPoolHistoryDataVOS;
        let data1 = resultData.forecastDataVOS;
        if (data.length) {
          data[0].dataAndTimeList.forEach(item => {
            dataTime.push(item.date.slice(5, 16));
            historyData.push(item.pv);
          });
        }
        if (data1.length) {
          data1.forEach(item => {
            dataTime.push(item.dataTime.slice(5, 16));
            forecastData.push(item.pointValue);
          });
        }
        dataTime = Array.from(new Set(dataTime));
        this.inWaterOption.yAxis[0].name = data[0].unit;
        this.inWaterOption.xAxis[0].data = dataTime;
        this.inWaterOption.series[0].data = historyData;
        this.inWaterOption.series[0].name = this.currentDevice.pointMemo;
        this.inWaterOption.series[1].data = forecastData;
        this.flag = true;
      }
    }
  }
};
</script>

<style lang="less" scoped>
.content {
  width: 100%;
  height: 100%;
  background: var(--supply-color-bg-card-DEFAULT);
  border-radius: 4px;
  &-header {
    width: 100%;
    padding: 15px 12px;
    display: inline-flex;
    justify-content: space-between;
    align-items: center;
    height: 40px;
  }
  &-title {
    font-weight: 600;
    font-size: 16px;
    color: var(--supply-color-main);
    letter-spacing: 0;
  }
  .point {
    height: calc(100% - 40px);
    display: flex;
    margin: 0 12px 12px;
    overflow: auto hidden;
    &__item {
      max-width: calc(50% - 6px);
      min-width: calc(16.3% - 6px);
      height: 100%;
      margin-bottom: 12px;
      margin-right: 12px;
      padding: 12px;
      border-radius: 4px;
      overflow: auto;
      background-color: var(--supply-color-bg-card-dark);
      &:nth-last-child(1) {
        margin-right: 0;
      }
      .point__name {
        margin-bottom: 12px;
        font-weight: 500;
        font-size: 14px;
        color: #6281a3;
      }
      .section {
        &__item {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
          &:nth-last-child(1) {
            margin-bottom: 0;
          }
        }
        &__name {
          line-height: 16px;
          text-align: right;
          font-size: 12px;
          color: var(--supply-text-secondary);
          width: 32%;
          /* white-space: nowrap; */
          flex: 1 0;

          &-wrap {
            display: inline-block;
            text-align: justify;
          }
        }
        &__unit {
          width: 36px;
          margin-left: 4px;
        }
        &__progress {
          flex: 0 0 25%;
          margin: 0 8px 0 8px;
          background-color: var(--supply-color-bg-card-DEFAULT);
        }
        &__value {
          font-size: 12px;
          line-height: 16px;
          color: var(--supply-text-main);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 40px;
        }
      }
    }
  }
  .empty {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
