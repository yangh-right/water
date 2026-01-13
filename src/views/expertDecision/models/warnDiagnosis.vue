<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2024-05-07 15:58:05
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2024-06-27 08:33:19
 * @Description:
-->
<template>
  <div class="warn-diagnosis">
    <w-range-picker
      class="btn"
      @change="getData"
      v-model="date"
      :allowClear="false"
      show-time
      format="YYYY-MM-DD HH:mm:ss"
    />
    <card-box :title="title">
      <line-chart :option="option"></line-chart>
    </card-box>
  </div>
</template>

<script>
import { getInflowHistoryData } from '@/api/diagnosis';
import { warnDiagnosisOption as option } from './config';
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
      option,
      date: [moment().startOf('day'), moment()]
    };
  },

  components: { CardBox, LineChart: () => import('@/components/CardBox/chartBox.vue') },
  computed: {
    title() {
      return '进水' + (this.alarmInfo.pointName || '');
    }
  },
  watch: {
    alarmInfo: {
      handler(val) {
        this.date = [
          moment(this.alarmInfo.startTime).subtract(12, 'hours'),
          moment(this.alarmInfo.startTime).add(12, 'hours')
        ];
        this.getData();
      },
      immediate: true
    }
  },
  methods: {
    themeChange() {
      this.option.color = this.getThemeConfig();
    },
    async getData() {
      if (this.alarmInfo.pumpHouseId && this.alarmInfo.expertDecisionType) {
        let params = {
          waterPlantId: this.alarmInfo.pumpHouseId,
          type: this.alarmInfo.expertDecisionType,
          startTime: this.date?.[0].format('YYYY-MM-DD HH:mm:ss') || '',
          endTime: this.date?.[1].format('YYYY-MM-DD HH:mm:ss') || '',
          timeEnum: 'Hours'
        };
        const { resultData, status } = await getInflowHistoryData(params);
        if (status === 'complete') {
          // let diffHour = moment(params.endTime).diff(moment(params.startTime), "hour")
          // if (diffHour < 25) {
          this.option.xAxis[0].axisLabel.formatter = value => {
            return value?.slice(11, 13) ?? value;
          };
          // } else {
          //   this.option.xAxis[0].axisLabel.formatter = undefined;
          // }
          this.option.xAxis[0].data = resultData?.map(item => item.dateTime) || [];
          this.option.yAxis[0].name = this.alarmInfo.pointName === 'C/N' ? '' : 'mg/L';
          this.option.series[0].data = resultData?.map(item => item.pv) || [];
          this.themeChange();
        }
      }
    }
  }
};
</script>
<style lang="less" scoped>
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
    width: 410px !important;
    z-index: 10;
    position: absolute;
    right: 16px;
    top: 10px;
  }
}
</style>
