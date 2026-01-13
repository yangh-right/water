
import * as echarts from 'echarts';

export const chartsMixins = {
  inject: ["state"],
  props: {
    chartId: {
      // 图表id
      type: String,
      require: true,
      default: () => {
        return `chart${(Math.random() * 10000000).toString(16).substr(0, 4) + '-' + (new Date()).getTime() + '-' + Math.random().toString().substr(2, 5)}`;
      }
    },
    option: {
      // 图表配置项
      type: Object,
      require: true,
      default: () => {
        return {};
      }
    },
    index:{
      type: Number,
      require: true,
      default: 0
    }
  },
  data() {
    return {
      myChart: null
    }
  },
  computed: {
    theme() {
      return (this.state.theme.includes('-') ? 'light' : this.state.theme) || 'light';
    }
  },
  watch: {
    "state.theme": {
      handler() {
        this.initChart();
      },
    },

    option: {
      handler: function () {
        this.drawLine();
      },
      deep: true,
    },
  },
  mounted() {
    this.init();
  },
  beforeDestory() {
    this.dispose();
  },
  activated() {
    this.init();
  },
  deactivated() {
    this.dispose();
  },
  methods: {
    initChart() {
      this.dispose();
      this.$nextTick(() => {
        this.init();
      });
    },
    init() {
      if (!this.myChart) {
        // document.getElementById(this.chartId) 会出现获取不到dom
        // if (document.getElementById(this.chartId)) {
        //   this.myChart = echarts.init(document.getElementById(this.chartId), this.theme);
        //   this.drawLine();
        // }
        if (this.$refs.chart) {
          this.myChart = echarts.init(this.$refs.chart, this.theme);
          this.drawLine();
        }
      }
    },
    dispose() {
      if (this.myChart) {
        this.myChart.dispose();
        this.myChart = null
        clearInterval(this.$el.__vueSetInterval__);
      }
    }
  }
}
