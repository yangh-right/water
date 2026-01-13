<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2024-05-07 15:58:05
 * @LastEditors: wangyr
 * @LastEditTime: 2024-10-31 10:17:56
 * @Description:
-->
<template>
  <div class="content">
    <div class="content-header">
      <div class="content-title">{{ toolConfig.addTitle }}</div>
    </div>
    <w-spin :spinning="loading" class="spin">
      <div class="supply-w-full supply-h-full" :id="loadId">
        <w-radio-group class="circle-radio" v-model="pointCode">
          <w-radio-button v-for="(item, index) in pointList" :key="item.value" :value="item.value">
            {{ item.label }}
          </w-radio-button>
        </w-radio-group>
        <div class="chart-wrapper">
          <line-chart :option="option"></line-chart>
        </div>
      </div>
    </w-spin>
  </div>
</template>

<script>
import { carbonDosageOption as getOption } from './options';
import CardBox from '@/components/CardBox';
export default {
  props: {
    waterPlantId: {
      type: String,
      default: ''
    },
    toolConfig: {
      type: Object,
      default: () => ({})
    }
  },
  components: { CardBox, LineChart: () => import('@/components/CardBox/chartBox.vue') },
  inject: ['state'],
  data() {
    return {
      loading: false,
      pointCode: 'month',
      pointList: [
        { label: '日', value: 'day', unit: 'L/h' },
        { label: '月', value: 'month', unit: 'L/d' }
      ],
      option: this.initChartOptions()
    };
  },
  computed: {
    loadId() {
      return this.toolConfig.loadId + 'Dosing';
    }
  },
  watch: {
    waterPlantId: {
      handler(val) {
        if (val) {
          this.getData();
        }
      },
      immediate: true
    },
    pointCode: {
      handler(val) {
        this.getData(true);
      }
    }
  },
  methods: {
    initChartOptions() {
      return JSON.parse(JSON.stringify(getOption(this.state.theme)));
    },
    async getData(showLoad = false) {
      if (!this.waterPlantId) return;
      let params = {
        deviceIdList: [],
        ratioFlag: true,
        dateType: this.pointCode === 'day' ? 'hour' : 'day',
        statType: 0,
        waterPlantId: this.waterPlantId
      };
      if (this.pointCode === 'month') {
        params.endDate = this.$moment()
          .endOf('month')
          .format('YYYY-MM-DD');
        params.startDate = this.$moment()
          .startOf('month')
          .format('YYYY-MM-DD');
      } else {
        params.endDate = this.$moment().format('YYYY-MM-DD');
        params.startDate = this.$moment()
          .subtract(1, this.pointCode + 's')
          .format('YYYY-MM-DD');
      }
      this.loading = true;
      const { resultData, status } = (await this.toolConfig?.addListApi(params)) || {};
      this.loading = false;
      if (status === 'complete') {
        const data = resultData || [];
        let xData = data?.map(item => item.date ?? item.dateTime) || [];
        let yData = data?.map(item => item[this.toolConfig.field]) || [];
        let isNoData = !yData?.some(data => data != null);
        if (isNoData) {
          this.option.yAxis[0].min = 0;
          this.option.yAxis[0].max = 5;
        } else {
          delete this.option.yAxis[0].min;
          delete this.option.yAxis[0].max;
        }
        this.option.series[0].data = yData;
        this.option.xAxis[0].data = xData;
        this.option.xAxis[0].axisLabel = {
          formatter: value => {
            return value && value.length > 5
              ? this.pointCode !== 'day'
                ? value?.slice(5, 10)
                : value?.slice(11, 16)
              : value;
          }
        };
        this.option.yAxis[0].name = 'm³/d';
      }
    }
  }
};
</script>
<style lang="less" scoped>
.content {
  width: 100%;
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
  .spin {
    width: 100%;
    height: calc(100% - 40px);
  }
  .chart-wrapper {
    height: calc(100% - 74px);
  }
  .circle-radio {
    display: flex;
    justify-content: flex-end;
  }
  .card-inner {
    width: 100%;
    height: 100%;
    position: relative;
    padding: 0 12px;
    box-sizing: border-box;
  }
  .legends {
    margin-top: -32px;
    list-style-type: none;
    display: flex;
    flex-wrap: wrap;
    height: 64px;
    overflow: auto;
    padding: 0 12px;

    &-item {
      cursor: pointer;
      font-size: 12px;
      margin-bottom: 8px;
      width: 33%;
      display: flex;
      align-items: center;

      &-marker {
        width: 10px;
        height: 10px;
        display: inline-block;
        margin-right: 8px;
        border-radius: 2px;
      }

      &-name {
        width: calc(100% - 20px);
        margin-right: 10px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        font-family: PingFangSC-Regular, sans-serif;
        font-weight: 400;
        color: var(--supply-color-text-secondary);
      }
    }
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
