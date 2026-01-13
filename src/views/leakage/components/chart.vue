<template>
  <div class="chart">
    <div class="chart-content">
      <transition name="moveLeft">
        <div class="chart-container">
          <template v-if="chartOptions">
            <custom-chart :option="chartOptions" @series-click="handleClick" />
          </template>
          <w-empty v-else class="flex-column">
            <span slot="description">{{ emptyMess }}</span>
          </w-empty>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import customChart from './LineChart';
import { mergeObject } from '@/utils/js/mergeObject';
import { getBaseOption, getLine, getBar, genCirclePieOptions } from './chartOption';

export default {
  name: 'Chart',
  components: {
    customChart
  },
  props: {
    option: {
      type: Object
    },
    code: {
      type: String
    },
    params: {
      type: Object
    },
    lineSmooth: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      showCard: false,
      records: [],
      recordTitle: '',
      chartOptions: null,
    };
  },
  computed: {
    emptyMess() {
      return this.option?.showCard ? '暂无数据~ 请进行分时自定义！' : '暂无数据';
    },
  },
  watch: {
    option: {
      immediate: true,
      handler(val) {
        if (val && Object.keys(val).length) {
          this.init();
        }
      }
    }
  },
  mounted() {},
  methods: {
    // 初始化数据
    init() {
      let { series, legend, xAxis, yAxis, dataZoom, toolbox = {}, grid = {}, title } = this.option;
      if (series.length) {
        if (series[0]?.type === 'pie') {
          if (!series[0]?.data?.length) {
            this.chartOptions = null;
            return;
          }
          if (!legend?.data?.length) {
            legend.data = series[0].data.map((v) => v.name) || [];
          }
          let _baseOpt = genCirclePieOptions(this.option.layout, '', this.option.chartName);
          this.chartOptions = mergeObject(_baseOpt, { series, legend, toolbox, title });
        } else {
          if (!xAxis[0]?.data?.length) {
            this.chartOptions = null;
            return;
          }
          let doubleyAxis = yAxis.length > 1;
          let _legend = [];
          series = series.map((v) => {
            let opt = {};
            if (v.type === 'bar') {
              opt = getBar();
              _legend.push({
                name: v.name,
                icon: 'rect'
              });
            } else if (v.type === 'line') {
              opt = getLine(this.lineSmooth);
              _legend.push({
                name: v.name
              });
            }
            return { ...opt, ...v };
          });
          if (legend && Object.keys(legend).length === 1) {
            legend.data = _legend;
          }
          if (doubleyAxis) {
            yAxis = yAxis.map((val) => {
              val.max = Math.ceil(val.max);
              // val.max = val.max > 0 && val.max < 1 ? Math.ceil(val.max) : val.max;
              val.min = val.min < 0 ? Math.floor(val.min) : val.min;
              let max = val.max;
              if (val.min < 0) {
                max = max + Math.abs(val.min);
              }
              let _interval = max / 5;
              if (_interval !== 0) val.interval = _interval;
              return val;
            });
          }
          let _baseOpt = getBaseOption('', doubleyAxis, this.option.layout, this.option.chartName);
          this.chartOptions = mergeObject(_baseOpt, {
            series,
            legend,
            xAxis,
            yAxis: yAxis?.length ? yAxis : [{}],
            dataZoom: dataZoom?.length ? dataZoom : [{}],
            toolbox,
            grid
          });
        }
      } else {
        this.chartOptions = null;
      }
      if (this?.option?.showCard) {
        this.showCard = true;
      } else {
        this.showCard = false;
      }
    },
    // 点击图表
    handleClick(data) {
      console.log(data)
    }
  }
};
</script>

<style lang="less" scoped>
.chart {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 4px;
  padding-top: 12px;

  &.showCard {
    margin: 0 12px;
    border: 1px solid;
  }


  .chart-content,.chart-container {
    height: 100%;
  }

  &-content {
    position: relative;
    // flex: 1;
  }

  &-container {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    min-height: 160px;
    &.showCard {
      width: 50%;
    }

    /deep/.chart-box {
      h4 {
        margin: 0 0 10px !important;
      }
    }
  }
}

.moveLeft {
  &-enter-active,
  &-leave-active {
    transition: all 0.5s;
  }

  &-enter,
  &-leave-to {
    opacity: 1;
  }
}

.moveRight {
  &-enter-active,
  &-leave-active {
    transition: all 0.5s;
  }

  &-enter,
  &-leave-to {
    opacity: 0;
  }
}
</style>
