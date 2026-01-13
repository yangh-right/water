<template>
  <div ref="chart" class="card-chart" />
</template>

<script>
import echarts from 'echarts';
import echartResize from './utils/echartResize';
import { mergeObject } from './utils/tools';
import genEchartOption from './utils/echartOptions';

export default {
  name: 'Charts',
  mixins: [echartResize],
  props: {
    columns: {
      type: Array,
      default: () => []
    },
    records: {
      type: Array,
      default: () => []
    },
    echart: {
      type: Object,
      default: () => ({})
    },
    zoom: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      showType: '1',
      chart: null,
      tableRender: false,
      tableColumns: [],
      echartOptions: null
    };
  },
  created() {
    this.initData();
  },
  mounted() {
    this.initChart();
  },
  methods: {
    // 数据初始化
    initData() {
      if (!this.records || !this.records.length) {
        return;
      }
      this.tableColumns = this.columns.map(v => ({ ...v, scopedSlots: { customRender: v.key } }));

      const { cType: _cType } = this.echart.series[0];
      const EchartOption = genEchartOption(this.zoom);

      // eslint-disable-next-line no-implicit-coercion
      if (~['line', 'areaLine', 'smoothAreaLine', 'bar', 'stackBar'].indexOf(_cType)) {
        // 基本类型组合，包括折线、面积折线、平滑面积折线、柱状图、堆叠柱状图
        let _baseOptions = EchartOption.compose(
          this.echart.series.map(v => ({
            type: v.type,
            cType: v.cType
          }))
        );
        _baseOptions = mergeObject(_baseOptions, this.echart);
        _baseOptions.xAxis[0].data = this.records.map(v => v[this.columns[0].dataIndex]);
        _baseOptions.yAxis[0].data = this.records.map(v => v[this.columns[0].dataIndex]);
        _baseOptions.series.forEach((v, i) => {
          v.name = this.columns[1 + i].title;
          v.data = this.records.map(v => v[this.columns[1 + i].dataIndex]);
        });
        this.echartOptions = _baseOptions;
      } else if (_cType === 'reverseBar') {
        // 反转进度柱状图
        let _baseOptions = EchartOption.reverseBar(this.columns.length - 1);
        _baseOptions = mergeObject(_baseOptions, this.echart);
        // eslint-disable-next-line max-len
        // _baseOptions.xAxis[0].max = this.records.reduce((a, b) => a + b[this.columns[1].dataIndex], 0);
        _baseOptions.yAxis[0].data = this.records.map(v => v[this.columns[0].dataIndex]);
        _baseOptions.series[0].name = this.columns[1].title;
        _baseOptions.series[0].data = this.records.map(v => v[this.columns[1].dataIndex]);
        this.echartOptions = _baseOptions;
      } else if (_cType === 'reverseStackBar') {
        // 反转堆叠柱状图
        let _baseOptions = EchartOption.reverseStackBar(this.columns.length - 1);
        _baseOptions = mergeObject(_baseOptions, this.echart);
        _baseOptions.yAxis[0].data = this.records.map(v => v[this.columns[0].dataIndex]);
        _baseOptions.series.forEach((v, i) => {
          v.name = this.columns[1 + i].title;
          v.data = this.records.map(v => v[this.columns[1 + i].dataIndex]);
        });
        this.echartOptions = _baseOptions;
      } else if (_cType === 'circlePie') {
        // 环形饼图
        const _data = this.records.map(v => ({
          name: v[this.columns[0].dataIndex],
          value: v[this.columns[1].dataIndex]
        }));
        let _baseOptions = EchartOption.circlePie(_data);
        _baseOptions = mergeObject(_baseOptions, this.echart);
        _baseOptions.series[0].name = this.columns[0].title;
        this.echartOptions = _baseOptions;
      } else if (_cType === 'radar') {
        // 雷达图
        let _baseOptions = EchartOption.radar(this.columns.length - 1);
        _baseOptions = mergeObject(_baseOptions, this.echart);
        _baseOptions.radar[0].indicator = this.records.map(v => ({
          name: v[this.columns[0].dataIndex],
          max: v.max
        }));
        _baseOptions.series[0].name = this.columns[0].title;
        _baseOptions.series[0].data.forEach((v, i) => {
          v.name = this.columns[1 + i].title;
          v.value = this.records.map(v => v[this.columns[1 + i].dataIndex]);
        });
        this.echartOptions = _baseOptions;
      } else if (_cType === 'scatter') {
        // 散点图
        let _baseOptions = EchartOption.scatter();
        _baseOptions = mergeObject(_baseOptions, this.echart);
        this.echartOptions = _baseOptions;
      } else if (_cType === 'sunburst') {
        // 旭日图
        let _baseOptions = EchartOption.sunburst();
        _baseOptions = mergeObject(_baseOptions, this.echart);
        _baseOptions.series[0].data = this.records;
        this.echartOptions = _baseOptions;
      }
    },
    // 图表初始化
    initChart() {
      if (!this.echartOptions) {
        return;
      }
      console.log(this.$refs.chart,8888)
      this.chart = echarts.init(this.$refs.chart);
      this.drawChart();
    },
    // 绘制图表
    drawChart() {
      if (!this.chart) {
        return;
      }
      this.chart.clear();
      this.chart.setOption(this.echartOptions, true);
    },
    // 展示类型切换
    handleShowTypeChange(e) {
      this.showType = e.target.value;
      // 第一次table渲染状态记录（加快首屏渲染速度的同时缓存渲染结果）
      if (this.showType === '2' && !this.tableRender) {
        this.tableRender = true;
      }
    }
  }
};
</script>

<style scoped lang="less">
.card-chart {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  padding-left: 20px;
  // background: #fff;
}
</style>
