<template>
  <chart-box :module-data="data" show-title>
    <chart chart-type="bar" :data="data" :optionsHandler="handleOptions" />
  </chart-box>
</template>

<script>
import { isNil, union, merge, concat } from 'lodash-es';
import { chartApi } from '@/components/echarts/libs/typeMap';

export default {
  name: 'KpiMixedChart',
  components: {
    ChartBox: () => import('./chartBox.vue'),
    Chart: () => import('@/components/echarts/index.vue'),
  },
  props: {
    moduleData: Object,
  },
  data() {
    return {
      data: { ...this.moduleData, records: [1] },
      options: null,
    };
  },
  created() {
    this.initData();
  },
  methods: {
    /**
     * @description: 初始化数据
     * @return {*}
     */
    initData() {
      const { manyIndicatorUniversalVOS } = this.moduleData;
      let options = {
        bars: [],
        lines: [],
      };
      this.genOptions(manyIndicatorUniversalVOS, options);

      // 双Y轴
      let yAxis = [];

      if (options.bars.length) {
        yAxis.push(options.bars[0].yAxis[0]);
      }
      if (options.lines.length) {
        let _yAxis = options.lines[0].yAxis[0];
        if (options.bars.length) {
          _yAxis.position = 'right';
        }
        yAxis.push(_yAxis);
      }

      // series分轴
      options.bars.forEach((v) => {
        if(v.series.length > 0){
          v.series[0].yAxisIndex = 0;
        }
      });
      options.lines.forEach((v) => {
        if(v.series.length > 0){
          v.series[0].yAxisIndex = options.bars.length ? 1 : 0;
        }
      });

      // 数据集合并
      const _options = concat(options.bars, options.lines);

      if (_options.length) {
        const dataset = {
          dimensions: union(..._options.map((v) => v.dataset.dimensions)),
          source: merge(..._options.map((v) => v.dataset.source)),
        };

        // 以第一项生成最终配置
        this.options = _options[0];

        this.options.grid.left = 10;
        this.options.grid.right = 10;
        this.options.grid.top = 15;
        this.options.grid.bottom = 25;
        this.options.legend.bottom = 0;
        this.options.legend.pageIconSize = 12;
        this.options.legend.textStyle = { fontSize: 10 };
        this.options.xAxis[0].axisLabel.fontSize = 10;
        this.options.yAxis.forEach((v) => {
          v.axisLabel.fontSize = 10;
        });

        this.options.yAxis = yAxis;
        this.options.dataset = dataset;
        this.options.series = concat(..._options.map((v) => v.series));
      }
    },

    /**
     * @description: 生成配置
     * @param {*} block
     * @param {*} columns
     * @param {*} records
     * @param {*} options
     * @return {*}
     */
    genOptions(manyIndicatorUniversalVOS, options) {
      let dataset = null;
      let dimensions = [];
      let source = [];

      manyIndicatorUniversalVOS.forEach((v,i) => {
        if(i === 0){
          dimensions.push('hour');
          v.monthData.forEach(item => {
            let kvMap = {};
            kvMap['hour'] = item.key;
            source.push(kvMap);
          })
        }
        dimensions.push(v.month + '月');
      })

      let objData = source.map(v => {
        manyIndicatorUniversalVOS.forEach(item => {
          item.monthData.forEach(m => {
            if(m.key === v.hour){
              v[item.month + '月'] = m.value;
            }
          })
        })
        return v;
      })


      dataset = {
        dimensions,
        source: objData,
      };

      // if (block.showType === '31') {
        let bar = chartApi.bar(dataset);
        if(bar.series.length > 0){
          bar.series[0].barMaxWidth = 8;
          bar.series[0].barGap = '40%';
        }
        options.bars.push(bar);
      // }
      // if (block.showType === '41') {
      //   let line = chartApi.line(dataset);
      //   line.series[0].symbolSize = 4;
      //   options.lines.push(line);
      // }
    },

    /**
     * @description: 处理图表配置
     * @param {*} options
     * @return {*}
     */
    handleOptions(options, { theme }) {
      let _options = { ...this.options };
      const darkTheme = theme === 'dark';

      if (darkTheme) {
        _options.color = ['#2AB8ED', '#0DECA6'];
      }

      return _options;
    },
  },
};
</script>

<style lang="less" scoped>
//...
</style>
