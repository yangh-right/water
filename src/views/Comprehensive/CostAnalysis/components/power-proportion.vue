<!--
 * @Description:
 * @version:
 * @Author: fengtaotao
 * @Date: 2023-05-23 14:29:38
 * @LastEditors: wangyr
 * @LastEditTime: 2024-04-17 10:55:25
-->
<template>
  <div class="content">
    <div class="content-header">
      <div class="content-title">{{ title }}</div>
    </div>
    <w-spin :spinning="loading" class="spin">
      <div class="chart-wrapper">
        <div v-if="dataList.length > 0" class="card-inner">
          <pie-chart
            style="width: 100%;height: 172px;"
            :option="totalNumOption"
            :defaultHighlight="true"
          ></pie-chart>
          <ul v-if="dataList.length > 0" class="legends">
            <li v-for="d in dataList" :key="d.name" class="legends-item">
              <span class="legends-item-marker" :style="{ background: d.color }"></span>
              <span class="legends-item-name" :title="d.name">{{ d.name }}</span>
            </li>
          </ul>
        </div>
        <w-empty v-else class="empty"></w-empty>
      </div>
    </w-spin>
  </div>
</template>
<script>
import { totalNumOption, LevelColorMap } from './options';
import { getEnergyDeviceAnalysis } from '@/api/analysis.js';
export default {
  name: 'PowerProportion',
  props: {
    title: {
      type: String,
      default: ''
    },
    waterPlantId: {
      type: String,
      default: ''
    }
  },
  components: {
    PieChart: () => import('@/components/chart/PieChart.vue')
  },
  data() {
    return {
      totalNumOption,
      loading: false,
      dataList: []
    };
  },
  inject: ['state'],
  computed: {
    color: {
      get() {
        return LevelColorMap[this.state.theme] || LevelColorMap['default'];
      },
      set() {}
    }
  },
  watch: {
    waterPlantId: {
      handler(val) {
        if (val) {
          this.getRegionEngineerChart(val);
        }
      },
      immediate: true
    }
  },
  created() {},
  methods: {
    async getRegionEngineerChart() {
      console.log('22222');
      let param = {
        dateType: 'month',
        deviceIdList: [],
        endDate: this.$moment().format('YYYY-MM-DD'),
        ratioFlag: true,
        startDate: this.$moment()
          .startOf('month')
          .format('YYYY-MM-DD'),
        statType: 0,
        waterPlantIdList: [this.waterPlantId]
      };
      // let res = await getEnergyDeviceAnalysis(param);
      let res = {
        args: [],
        count: 0,
        errorCode: null,
        errorMessage: null,
        resultData: [
          {
            areaName: '净月区',
            num: 9,
            radio: '31.00%'
          },
          {
            areaName: '高新北',
            num: 2,
            radio: '7.00%'
          },
          {
            areaName: '高新南',
            num: 4,
            radio: '14.00%'
          },
          {
            areaName: '测试区',
            num: 10,
            radio: '34.00%'
          },
          {
            areaName: '汽开区',
            num: 4,
            radio: '14.00%'
          }
        ],
        status: 'complete',
        success: true
      };
      let { status, resultData } = res;
      if (status === 'complete') {
        this.dataList = resultData.map((item, index) => {
          item.value = item.num;
          item.name = item.areaName || '--';
          item.color = this.color[index];
          return item;
        });
        this.totalNumOption.series[0].data = this.dataList;
        this.totalNumOption.series[0].color = this.color;
      }
    }
  }
};
</script>

<style lang="less" scoped>
.dark-color {
  [data-wpg-theme='dark'] & {
    color: #fff;
  }
}
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
    height: 100%;
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
    &-item {
      cursor: pointer;
      font-size: 12px;
      margin-bottom: 8px;
      width: 33%;
      display: flex;
      align-items: center;
      .dark-color;
      &-marker {
        width: 10px;
        height: 10px;
        display: inline-block;
        margin-right: 8px;
      }
      &-name {
        width: calc(100% - 20px);
        margin-right: 10px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        font-family: PingFangSC-Regular, sans-serif;
        font-weight: 400;
        color: #666666;
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
