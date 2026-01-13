<!--
 * @Description:
 * @version:
 * @Author: fengtaotao
 * @Date: 2023-05-23 14:29:38
 * @LastEditors:  Do not edit
 * @LastEditTime: 2024-05-24 11:08:52
-->
<template>
  <div class="content">
    <div class="content-header">
      <div class="content-title">
        {{ title }}
        <w-tooltip placement="topLeft">
          <template slot="title">
            贡献率占比= 去除量/总去除量* 100%
          </template>
          <img src="@/assets/cockpit/ic_help.png" alt="" style="width: 16px; cursor: pointer;" />
        </w-tooltip>
      </div>
      <w-radio-group class="supply-relative supply-top-2" v-model="showType">
        <a-radio-button value="chart">
          图表
        </a-radio-button>
        <a-radio-button value="table">
          表格
        </a-radio-button>
      </w-radio-group>
    </div>
    <div class="tabs">
      <div
        v-for="item in tabs"
        :key="item.pointName"
        :class="currentParams === item.pointMemo ? 'tab active' : 'tab'"
        @click="paramsChange(item)"
      >
        {{ item.pointMemo }}
      </div>
    </div>
    <w-spin :spinning="loading" class="spin">
      <div v-if="showType === 'chart'" class="chart-wrapper">
        <div v-if="flag" class="card-inner">
          <div class="echart-block">
            <pie-chart ref="alarmChart" :option="pieOption"> </pie-chart>
          </div>
        </div>
        <w-empty v-else class="empty"></w-empty>
      </div>
      <div v-else class="table-wrapper supply-px-3">
        <w-config-provider>
          <w-table
            class="tableDevice"
            ref="wTable"
            :columns="columns"
            :data-source="currentDevice.processSectionHistoryDataList"
            :scroll="{ y: 140 }"
            :pagination="false"
            rowKey="id"
          >
          </w-table>
          <template #renderEmpty>
            <w-empty id="ssmal" style="margin:auto" size="small"></w-empty
          ></template>
        </w-config-provider>
      </div>
    </w-spin>
  </div>
</template>
<script>
import { removalRateRatio } from '@/api/analysis';
import { getPointValue, getStructureByStationId } from '@/api/optimization';
import { pointsData, pieOption, contributeColumns } from '../data';
export default {
  name: 'ContributeRate',
  props: {
    title: {
      type: String,
      default: ''
    },
    waterPlantId: {
      type: String,
      default: ''
    },
    modleType: {
      type: String,
      default: ''
    }
  },
  components: {
    PieChart: () => import('@/components/chart/PieChart.vue')
  },
  data() {
    return {
      currentParams: '',
      columns: contributeColumns,
      data: [],
      showType: 'chart',
      tabs: [],
      flag: true,
      loading: false,
      currentDevice: {},
      timeOption: 'day',
      timeOptions: [
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
      colors: [
        '#2F7FFF',
        '#FF6781',
        '#28D6FE',
        '#FFA66D',
        '#2BDEAB',
        '#FFD739',
        '#A259F5',
        '#F9D54A',
        '#0171CE'
      ],
      pointsArr: [
        {
          label: '预处理工段',
          value: '32%'
        },
        {
          label: '生化处理工段',
          value: '22%'
        },
        {
          label: '深度处理工段',
          value: '46%'
        }
      ],
      pieOption,
      endTime: '',
      startTime: '',
      type: '1'
    };
  },
  inject: ['state'],
  watch: {
    waterPlantId: {
      handler(val) {
        this.getPointData();
      },
      immediate: true
    },
    'state.theme': {
      handler(newValue) {
        if (newValue === 'dark') {
          this.pieOption.series[0].label.rich.name.color = '#fff';
        } else {
          this.pieOption.series[0].label.rich.name.color = '#333';
        }
      },
      immediate: true
    }
  },
  created() {},
  methods: {
    paramsChange(value) {
      this.currentDevice = value;
      this.currentParams = value.pointMemo;
      const dataList = this.currentDevice.processSectionRealDataList;
      this.updateChartData(dataList);

      this.loading = true;
      setTimeout(() => {
        this.loading = false;
      }, 300);
      // this.getPointData();
    },
    async getPointData() {
      this.loading = true;
      this.flag = false;
      let param = {
        deviceType: 'INDUSTRY_DEVICE',
        period: '1',
        timeEnum: 'Hours',
        productCode: 'water_purification',
        waterPlantId: this.waterPlantId
      };
      let { resultData, status } = await removalRateRatio(param);
      this.loading = false;
      if (status === 'complete') {
        this.tabs = resultData || [];
        this.currentParams = this.tabs[0]?.pointMemo;
        this.currentDevice = this.tabs[0] || {};
        const dataList = this.currentDevice.processSectionRealDataList || [];
        this.updateChartData(dataList);
        this.flag = true;
      }
    },
    updateChartData(dataList) {
      const chartData =
        dataList?.map(item => ({
          name: item.processName,
          value: item.ratio
        })) || [];
      this.pieOption.legend.formatter = name => {
        let target = chartData.find(item => item.name === name).value;

        let arr = ['{a|' + name + '}', '{b|' + target + '%}'];
        return arr.join('');
      };
      this.pieOption.series[0].data = chartData;
    }
  }
};
</script>

<style lang="less" scoped>
.content {
  display: flex;
  flex-direction: column;
  height: calc(50% - 5px);
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
  .form {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .form-item {
    margin-top: 10px;
    margin-left: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .spin {
    flex: 1;
  }
  .tabs {
    padding: 0 12px;
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-items: center;
    cursor: pointer;
    .tab {
      white-space: nowrap;
      margin-bottom: 8px;
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
  .card-inner {
    width: 100%;
    height: 100%;
    position: relative;
    padding: 0 12px;
    box-sizing: border-box;
    display: flex;
    align-items: center;

    .echart-block {
      width: 100%;
      height: 100%;
      text-align: center;
    }
    .points-list {
      width: 60%;
      height: 100%;
      display: flex;
      flex-flow: wrap;
      align-items: center;
      justify-content: flex-start;

      .point-tab {
        width: calc(50% - 14px);
        height: 26px;
        margin-bottom: 8px;
        padding: 0 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-right: 28px;
        &:nth-child(2n) {
          margin-right: 0px;
        }

        .label {
          font-family: PingFangSC-Regular, sans-serif;
          font-weight: 400;
          font-size: 14px;
          color: var(--supply-color-secondary);
          letter-spacing: 0;

          .ico-react {
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 1.76px;
            margin-right: 6px;
          }
        }
        .precent {
          font-weight: 400;
          font-size: 14px;
          color: var(--supply-color-main);
          letter-spacing: 0;
          text-align: right;
        }
      }
    }
  }
  .chart-wrapper {
    height: 100%;
    padding: 10px 0;
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
  /deep/ .wpg-select {
    width: 120px !important;
  }
}
</style>
