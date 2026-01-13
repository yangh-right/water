<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2024-05-07 15:58:05
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2024-09-12 17:26:19
 * @Description:
-->
<template>
  <div class="warn-diagnosis">
    <w-range-picker
      class="btn"
      size="small"
      @change="getData"
      v-model="date"
      :allowClear="false"
      show-time
      format="YYYY-MM-DD HH:mm:ss"
    />

    <card-box title="进水曲线">
      <w-radio-group  class="circle-radio" v-model="pointCode">
        <w-radio-button v-for="(item, index) in pointList" :key="item.value" :value="item.value">
          {{ item.label }}
        </w-radio-button>
      </w-radio-group>
      <div class="chart-wrap">
        <line-chart :option="option"></line-chart>
      </div>
    </card-box>
  </div>
</template>

<script>
import { inflowModelHistoryData } from '@/api/diagnosis';
import { genInWaterOption } from './config';
import { themeMixin } from '@/core/mixins';
import moment from 'moment';
import CardBox from './CardBox';
export default {
  mixins: [themeMixin],
  props: {
    alarmInfo: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      pointCode: '',
      option: genInWaterOption(),
      pointList: [],
      date: [moment().startOf('day'), moment().endOf('day')]
    };
  },

  components: { CardBox, LineChart: () => import('@/components/CardBox/chartBox.vue') },
  watch: {
    alarmInfo: {
      handler(val) {
        this.date = [
          moment(this.alarmInfo.startTime).subtract(12, 'hours').startOf('day'),
          moment(this.alarmInfo.startTime).add(12, 'hours').endOf('day')
        ];
        this.getData();
      },
      immediate: true
    },
    pointCode: {
      handler(val) {
        this.option = this.pointList.find(item => item.value === this.pointCode)?.option || {};
      }
    }
  },
  methods: {
    themeChange() {
      this.pointList.forEach(item => {
        item.option.color = this.getThemeConfig();
      });
    },
    async getData() {
      if (this.alarmInfo.pumpHouseId && this.alarmInfo.expertDecisionType) {
        let params = {
          waterPlantId: this.alarmInfo.pumpHouseId,
          startTime: this.date?.[0].format('YYYY-MM-DD HH:mm:ss') || '',
          endTime: this.date?.[1].format('YYYY-MM-DD HH:mm:ss') || ''
        };
        const { resultData, status } = await inflowModelHistoryData(params);
        if (status === 'complete') {
          this.pointList =
            resultData?.map(item => {
              let xData = item.timeDataList?.map(data => data.dateTimeStr);
              let yData = item.timeDataList?.map(data => data.historyPointValue);
              return {
                value: item.pointName,
                label: item.pointMemo,
                option: genInWaterOption({
                  xData,
                  yData,
                  yAxisName: item.pointUnit,
                  seriesName: item.pointMemo
                })
              };
            }) || [];
          this.themeChange();
          let curPointIndex = this.pointList.findIndex(item => item.value === this.pointCode);
          if (this.pointCode && curPointIndex > -1) {
            this.option = this.pointList?.[curPointIndex]?.option || genInWaterOption();
          } else {
            this.option = this.pointList?.[0]?.option || genInWaterOption();
            this.pointCode = this.pointList?.[0]?.value || '';
          }
        }
      }
    }
  }
};
</script>
<style lang="less" scoped>
@import '@/views/debugTool/style/design.less';
.chart-wrap {
  height: calc(100% - 32px);
}
.circle-radio {
  margin-left: 0px;
  margin-top: 6px;
}
/deep/ .card-box__title {
  .text {
    max-width: 150px;
  }
}
.warn-diagnosis {
  width: 100%;
  height: 100%;
  position: relative;
  .btn {
    width: 282px !important;
    z-index: 10;
    position: absolute;
    right: 16px;
    top: 10px;
  }
}
</style>
