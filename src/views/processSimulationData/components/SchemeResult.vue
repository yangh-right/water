<!--
 * @Description:
 * @version:
 * @Author: fengtaotao
 * @Date: 2023-05-23 14:29:38
 * @LastEditors: wangyr
 * @LastEditTime: 2024-08-16 15:03:44
-->
<template>
  <div class="content">
    <div class="content-header">
      <div class="content-title">{{ title }}</div>
    </div>
    <w-spin :spinning="loading" class="spin">
      <div class="chart-wrapper">
        <bar-chart
          v-if="tabs.length > 0"
          :darkTheme="'light'"
          :option="barOption"
          ref="barChart"
        ></bar-chart>
        <w-empty v-else class="empty"></w-empty>
      </div>
    </w-spin>
  </div>
</template>
<script>
import { getSolutionDetail } from '@/api/runTime';
import { expectedOption } from './data';
export default {
  name: 'SchemeResult',
  props: {
    title: {
      type: String,
      default: ''
    },
    activeModule: {
      type: String,
      default: ''
    },
    waterPlantId: {
      type: String,
      default: ''
    }
  },
  components: {
    BarChart: () => import('@/components/chart/BarChart.vue')
  },
  data() {
    return {
      flag: true,
      loading: false,
      tabs: [],
      currentParams: '',
      barOption: expectedOption,
      columns: [],
      data: [],
      runTypeList: {
        '1': '',
        '2': '',
        '3': '现工况'
      }
    };
  },
  watch: {
    activeModule: {
      immediate: true,
      deep: true,
      handler(val) {
        if (val) {
          this.getSolutionDetail(val);
        }
      }
    }
  },
  created() {},
  methods: {
    async getSolutionDetail(solutionId) {
      this.loading = true;
      const params = {
        solutionId: solutionId,
        line: '0',
        showType: '1'
      };
      const res = await getSolutionDetail(params);
      this.loading = false;
      const { resultData, status } = res;
      if (status === 'complete') {
        this.tabs = [];
        let colors = [
          '#71a3f8',
          '#3366ff',
          '#F0884D',
          '#3498fd',
          '#7863FF',
          '#21d3f0',
          '#1f40c0',
          '#29dcb1',
          '#3cfb99',
          '#eae138',
          '#87ce40',
          '#adce00',
          '#1098ad'
        ];
        let series = [];
        let xData = [];
        this.$emit(
          'handleModelData',
          resultData?.applicationSeason,
          resultData?.applicationTemperature,
          resultData?.carbonNitrogenRatio
        );
        let outPutKeys = resultData['outputResult'] && Object.keys(resultData['outputResult']);
        let legendObj = {};
        outPutKeys.forEach(key => {
          if (resultData['outputResult'][key]) {
            let name = this.runTypeList[key] || '';
            let pointsList = resultData['outputResult'][key];
            this.tabs = Object.keys(pointsList);
            this.tabs.forEach((item, i) => {
              let xName = item === 'NH3N' ? 'NH₃-N' : item;
              if (i === 0) {
                xData = pointsList[item].xList;
                legendObj[name + xName] = true;
              } else {
                legendObj[name + xName] = false;
              }
              series.push({
                name: name + xName,
                type: 'line',
                smooth: true,
                itemStyle: {
                  color: colors[i]
                },
                data: pointsList[item].yList
              });
            });
          }
        });

        this.barOption.legend['selected'] = legendObj;
        this.barOption.xAxis[0].data = xData;
        this.barOption.yAxis[0].name = 'mg/L';
        this.barOption.series = series;
      }
    }
  }
};
</script>

<style lang="less" scoped>
.content {
  width: 100%;
  height: 100%;
  // background: var(--supply-color-bg-card-DEFAULT);
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
    font-weight: 500;
    font-size: 14px;
    color: var(--supply-color-main);
    letter-spacing: 0;
  }
  .form-item {
    margin-top: 10px;
    width: 80px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .spin {
    height: calc(100% - 40px);
  }
  .chart-wrapper {
    height: 100%;
    padding: 0 0 6px 0;
  }
  .table-wrapper {
    padding: 0 12px;
    box-sizing: border-box;
    margin: 0;
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
