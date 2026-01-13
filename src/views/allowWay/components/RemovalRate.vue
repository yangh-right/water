<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2023-07-05 13:14:45
 * @LastEditors: wangyr
 * @LastEditTime: 2024-05-10 16:58:59
 * @Description:
-->
<template>
  <div class="page">
    <!-- 预测预警 -->
    <div class="page-item">
      <block-wrap
        :showDate="true"
        :lineList="lineList"
        title="各级处理水质变化趋势"
        v-slot="{ date, line }"
      >
        <history-chart
          :line="line"
          :seriesConfig="codConfig"
          configCode="complete_flow"
          :options="inWaterOption"
          :waterPlantId="waterPlantId"
          :date="date"
        ></history-chart>
      </block-wrap>
      <block-wrap :lineList="lineList" title="COD沿程变化" v-slot="{ line }">
        <real-chart
          :line="line"
          :isReverse="true"
          :hideEmpty="true"
          :seriesConfig="codConfig"
          configCode="COD"
          :options="codOptions"
          :waterPlantId="waterPlantId"
        ></real-chart>
      </block-wrap>
    </div>
    <div class="page-item">
      <block-wrap :lineList="lineList" title="三氮沿程变化" v-slot="{ line }">
        <real-chart
          :line="line"
          :seriesConfig="codConfig"
          :hideEmpty="true"
          configCode="three_nitrogen"
          :options="nitrogenOption"
          :waterPlantId="waterPlantId"
        ></real-chart>
      </block-wrap>
      <block-wrap :lineList="lineList" title="TP和PO4-P沿程变化趋势" v-slot="{ line }">
        <real-chart
          :line="line"
          :seriesConfig="codConfig"
          :hideEmpty="true"
          configCode="phosphate"
          :options="moduleOption"
          :waterPlantId="waterPlantId"
        ></real-chart>
      </block-wrap>
    </div>
    <div v-if="false" class="page-item">
      <!-- <microbe-analyse
        title="关键微生物类群分析"
        :waterPlantId="waterPlantId"
        :showType="showType"
      ></microbe-analyse> -->
      <block-wrap
        class="item-row"
        :lineList="lineList"
        :showDate="true"
        title="活性污泥能力"
        v-slot="{ date, line }"
      >
        <div class="activesludge-wrap">
          <history-chart1
            :seriesConfig="hxConfig"
            paramConfigurationType="1"
            :line="line"
            class="chart-item"
            configCode="nitrification_rate"
            :options="hxOption1"
            :waterPlantId="waterPlantId"
            :date="date"
          ></history-chart1>
          <w-divider class="divider" type="vertical"></w-divider>
          <history-chart1
            :seriesConfig="hxConfig"
            paramConfigurationType="2"
            :line="line"
            class="chart-item"
            configCode="phosphorus_release_rate"
            :options="hxOption2"
            :waterPlantId="waterPlantId"
            :date="date"
          ></history-chart1>
        </div>
      </block-wrap>
    </div>
  </div>
</template>

<script>
import purificationLineMixin from '@/utils/mixins/purificationLineMixin.js';

import MicrobeAnalyse from './MicrobeAnalyse.vue';
import HistoryChart from './HistoryChart';
import HistoryChart1 from './HistoryChart1';
import RealChart from './RealChart.vue';
import PumpData from './PumpData.vue';
import BlockWrap from './BlockWrap';
import {
  runFields,
  codOptions,
  inWaterOption,
  nitrogenOption,
  moduleOption,
  microbeOption,
  nitrogenConfig,
  codConfig,
  hxConfig,
  hxOption1,
  hxOption2
} from './data';
export default {
  name: 'RemovalRate',
  components: {
    RealChart,
    BlockWrap,
    HistoryChart,
    HistoryChart1,
    PumpData,
    MicrobeAnalyse
  },
  props: {
    waterPlantId: {
      type: String,
      default: ''
    }
  },
  mixins: [purificationLineMixin],
  data() {
    return {
      hxConfig,
      hxOption1,
      hxOption2,
      codConfig,
      microbeOption,
      moduleOption,
      nitrogenOption,
      inWaterOption,
      codOptions,
      layout: {
        span: 6,
        wrapperCol: { span: 18 },
        gutter: [0] //栅格间隔[水平间距，垂直间距]
      },
      nitrogenConfig,
      fields: runFields,
      showType: 'chart'
    };
  },
  computed: {},
  watch: {},
  methods: {
    factoryChange() {}
  },
  created() {},
  mounted() {}
};
</script>

<style lang="less" scoped>
.page {
  height: calc(100% - 10px);
  overflow: visible;
  position: relative;
}
.page-item {
  display: flex;
  justify-content: space-between;
  width: 100%;
  // height: 240px;
  height: calc(50% - 6px);
  margin-top: 10px;
  // &:nth-child(1) {
  //   height: 290px;
  // }
  // &:nth-last-child(1) {
  //   height: fit-content;
  //   min-height: 290px;
  // }
  .activesludge-wrap {
    align-items: center;
    height: calc(100% - 40px);
    display: flex;
    justify-content: space-between;
    /deep/ .chart-wrap {
      width: calc(50% - 12px);
    }
    .spin {
      width: calc(50% - 10px);
      .search {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 35px;
      }
    }
    /deep/ .chart-item {
      .spin {
        min-height: 222px;
      }
    }
    .divider {
      height: 100%;
    }
  }
  .item-row {
    width: 100% !important;
  }
}
</style>
