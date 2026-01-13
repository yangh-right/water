<!-- 采用统计组件 -->
<template>
  <div class="warn-diagnosis">
    <!-- 时间选择器 -->
    <w-range-picker
      class="btn"
      v-model="date"
      :allowClear="false"
      show-time
      format="YYYY-MM-DD HH:mm:ss"
    />
    <!-- 卡片盒子 -->
    <card-box :title="title">
      <!-- 折线图 -->
      <line-chart :option="option"></line-chart>
    </card-box>
  </div>
</template>

<script>
// 导入相关依赖
import { getOutflowModelData } from '@/api/diagnosis';
import { adoptionStatisticsOption as option } from './config';
import { themeMixin } from '@/core/mixins';
import moment from 'moment';
import CardBox from './CardBox';

export default {
  mixins: [themeMixin], // 使用主题mixin
  props: {
    // 报警信息
    alarmInfo: {
      type: Object,
      default: () => ({})
    },
    // 控制ID
    controlId: {
      type: Number | undefined,
      default: undefined
    },
    // 预测ID
    predictionId: {
      type: String,
      default: ''
    },
    // 默认预测ID
    defaultPredictionId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      option, // 图表配置
      date: [moment().startOf('day'), moment()] // 时间范围
    };
  },
  components: { CardBox, LineChart: () => import('@/components/CardBox/chartBox.vue') },
  computed: {
    // 请求参数
    params() {
      return {
        predictionId: this.predictionId,
        controlId: this.controlId,
        type: this.alarmInfo.expertDecisionType,
        startTime: this.date?.[0].format('YYYY-MM-DD HH:mm:ss') || '',
        endTime: this.date?.[1].format('YYYY-MM-DD HH:mm:ss') || ''
      };
    },
    // 标题
    title() {
      return '出水' + (this.alarmInfo.pointName || '') + '预计效果';
    }
  },
  watch: {
    // 监听报警信息变化
    alarmInfo: {
      handler(val) {
        if (val?.alarmExpertVO?.predictionId) {
          this.$emit('update:predictionId', val.alarmExpertVO.predictionId);
        } else {
          this.$emit('update:predictionId', this.defaultPredictionId);
        }
        this.date = [
          moment(this.alarmInfo.startTime),
          moment(this.alarmInfo.startTime).add(24, 'hours')
        ];
      },
      immediate: true
    },
    // 监听参数变化
    params: {
      handler(val) {
        this.getData();
      }
    }
  },
  methods: {
    // 主题变化处理
    themeChange() {
      this.option.color = this.getThemeConfig();
    },
    // 获取数据
    async getData() {
      if (this.predictionId && this.controlId) {
        let { resultData, status } = await getOutflowModelData(this.params);
        if (status === 'complete') {
          let data = Object.values(resultData)?.[0]?.[this.alarmInfo.pointName] || {};
          this.option.xAxis[0].data = data?.xList || [];
          this.option.yAxis[0].name = this.alarmInfo.pointName === 'C/N' ? '' : 'mg/L';
          this.option.series[0].data = data?.yList || [];
          this.themeChange();
        }
      } else {
        this.option.xAxis[0].data = [];
        this.option.series[0].data = [];
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
