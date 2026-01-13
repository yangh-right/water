<!--  -->
<template>
  <ModelCard :title="titleName" :loading="loading" :empty="empty">
    <template #content>
      <div class="content-style">
        <w-radio-group class="ground-style" v-model="value" @change="onChange" size="small" buttonStyle="solid">
          <w-radio-button value="all"> 总成本 </w-radio-button>
          <w-radio-button value="sigle"> 吨水成本</w-radio-button>
        </w-radio-group>
        <w-line :data="chartData" :themeName="themeObj.theme" :settings="settings" :extend="extend" :events="{ click: onEchartsClick }" height="100%" width="100%"></w-line>
      </div>
    </template>
  </ModelCard>
</template>

<script>
import ModelCard from './model-card';
import Mixin from './mixin';
import moment from 'moment';

export default {
  name: 'AreaChartCard',
  inject: ['waterPlantIdObj', 'themeObj'],
  mixins: [Mixin],
  data() {
    return {
      loading: false,
      titleName: '',
      title: '成本趋势',
      value: 'all',
      chartData: {
        columns: ['时间'],
        rows: []
      },
      settings: {
        area: true
      },
      extend: {
        color: ['#5390f5', '#66dbdc', '#bdf252'],
        xAxis: {
          axisLabel: { rotate: -40, interval: 1, margin: 10 },
          axisTick: {
            show: false
          },
          boundaryGap: false
        },
        series: {
          smooth: true
        },
        'series.0.areaStyle': {
          color: {
            //线性渐变
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 1,
                color: 'rgba(83, 144, 245,0.05)' // 0% 处的颜色
              },
              {
                offset: 0.4,
                color: 'rgba(83, 144, 245,0.40)' // 100% 处的颜色
              }
            ]
          }
        },
        'series.1.areaStyle': {
          color: {
            //线性渐变
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 1,
                color: 'rgba(102, 219, 220,0.05)' // 0% 处的颜色
              },
              {
                offset: 0.4,
                color: 'rgba(102, 219, 220,0.40)' // 100% 处的颜色
              }
            ]
          }
        },
        'series.2.areaStyle': {
          color: {
            //线性渐变
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 1,
                color: 'rgba(189, 242, 82,0.05)' // 0% 处的颜色
              },
              {
                offset: 0.4,
                color: 'rgba(189, 242, 82,0.40)' // 100% 处的颜色
              }
            ]
          }
        },
        legend: {
          bottom: 5,
          itemWidth: 8,
          itemHeight: 8,
          icon: 'rect'
        },
        grid: { top: 70, bottom: 60, left: 40, right: 10 }
      }
    };
  },
  components: { ModelCard },
  computed: {
    empty() {
      return Boolean(this.chartData.rows.length);
    }
  },
  watch: {
    waterPlantIdObj: {
      deep: true,
      handler() {
        this.onChange();
      }
    }
  },
  methods: {
    onChange() {
      let url = '';
      if (this.value === 'all') {
        url = '/costAnalysis/getCostTrend';
      } else {
        url = '/costAnalysis/tonOfWaterCost';
      }
      this.getList(url);
    },
    async getList(url) {
      this.loading = true;
      this.chartData = {
        columns: ['时间'],
        rows: []
      };
      try {
        let { resultData } = await this.$http.post(url, this.waterPlantIdObj);
        //处理标题
        this.titleName = this.title + `${resultData.unit ? '(' + resultData.unit + ')' : ''}`;
        //处理图例
        let timeColumns = this.changeDate(this.waterPlantIdObj);
        this.chartData.columns = this.chartData.columns.concat(timeColumns);
        //处理数据
        resultData.data.forEach(item => {
          this.chartData.rows.push({
            时间: moment(item.date).format(this.formData),
            [this.chartData.columns[1]]: item.now,
            [this.chartData.columns[2]]: item.lastMonth,
            [this.chartData.columns[3]]: item.lastYear
          });
        });
      } catch {
        this.chartData.rows = [];
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>
<style lang="less" scoped>
.content-style {
  width: 100%;
  height: 100%;
  position: relative;
  .ground-style {
    position: absolute;
    z-index: 99;
    top: 10px;
  }
}
</style>
