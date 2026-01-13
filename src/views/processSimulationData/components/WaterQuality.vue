<template>
  <div class="content">
    <div class="content-header">
      <div class="content-title">{{ title }}</div>
    </div>
    <w-spin :spinning="loading" class="content-body">
      <div v-if="pointsList.length > 0" class="point-list">
        <div
          v-for="item in pointsList"
          :key="item.pointMemoAlias"
          @click="paramsChange(item)"
          class="carbon-list"
        >
          <span class="point-name"><i class="ico-circle"></i>{{ item.pointMemoAlias }}</span>
          <div class="point-box">
            <span v-if="moduleType !== 'startParameter'" class="value">{{ item.realPv }}</span>
            <w-input-number v-else class="list__input" v-model="item.realPv"></w-input-number>
            <span class="unit" :title="item.pointUnit">{{ item.pointUnit }}</span>
          </div>
        </div>
      </div>
      <w-empty v-else class="empty"></w-empty>
    </w-spin>

    <w-modal
      :title="pointName + '出水水质曲线'"
      :visible="isShow"
      class="flow-dialog"
      width="860px"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <w-spin :spinning="spinning" class="chart-box">
        <line-chart
          v-if="flag"
          :darkTheme="'light'"
          :option="inWaterOption"
          ref="inChart2"
        ></line-chart>
        <w-empty v-else class="empty"></w-empty>
      </w-spin>
    </w-modal>
  </div>
</template>
<script>
import moment from 'moment';
import { inWaterOption } from './data';
import { effluenceQuality, getOutFlow } from '@/api/optimization';
export default {
  name: 'WaterQuality',
  props: {
    title: {
      type: String,
      default: ''
    },
    waterPlantId: {
      type: String,
      default: ''
    },
    moduleType: {
      type: String,
      default: ''
    },
    activeModule: {
      type: Object,
      default: () => {}
    }
  },
  components: {
    LineChart: () => import('@/components/chart/LineChart.vue')
  },
  data() {
    return {
      flag: false,
      loading: false,
      spinning: false,
      isShow: false,
      pointName: '',
      dataList: [],
      pointsList: [],
      startParameter: [],
      inWaterOption: inWaterOption
    };
  },
  watch: {
    waterPlantId(val) {
      this.getPointList();
    }
  },
  created() {},
  methods: {
    async getPointList() {
      this.loading = true;
      let { resultData, status } = await effluenceQuality(this.waterPlantId);
      this.loading = false;
      if (status === 'complete') {
        if (resultData.length) {
          this.flag = true;
          this.pointsList = resultData;
        } else {
          this.pointsList = [];
          this.flag = false;
        }
      }
    },
    paramsChange(value) {
      this.pointName = value.pointMemoAlias;
      this.isShow = true;
      this.getPointChart();
    },
    async getPointChart() {
      let params = {
        selectType: '0',
        optionId: this.activeModule.id,
        pointName: this.pointName === 'NH₃-N' ? 'NH3N' : this.pointName,
        waterPlantId: this.waterPlantId
      };
      this.spinning = true;
      let { resultData, status } = await getOutFlow(params);
      if (status === 'complete') {
        this.spinning = false;
        let { pointMap, waterQualityVO } = resultData;
        this.inWaterOption.xAxis[0].data = waterQualityVO.xList;
        this.inWaterOption.series[0].data = waterQualityVO.yList;
        this.inWaterOption.series[1].data = waterQualityVO.preList;
        if (waterQualityVO.yList.length > 0 || waterQualityVO.preList.length > 0) {
          this.flag = true;
        } else {
          this.flag = false;
        }
      }
    },
    async handleOk() {
      this.isShow = false;
      this.flag = false;
    },
    handleCancel() {
      this.isShow = false;
      this.flag = false;
    }
  }
};
</script>

<style lang="less" scoped>
.content {
  width: calc(33.3% - 6px);
  height: 100%;
  margin-bottom: 12px;
  background-color: var(--supply-color-bg-card-component);
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
  &-body {
    width: 100%;
    height: calc(100% - 40px);

    .point-list {
      width: 100%;
      height: 100%;
      padding: 0 12px;
      box-sizing: border-box;
      overflow: auto;
      clear: both;
      display: flex;
      flex-flow: wrap;
    }
    .carbon-list {
      float: left;
      width: calc(50% - 6px);
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 30px;
      font-weight: 400;
      font-size: 14px;
      color: var(--supply-color-main);
      margin-bottom: 8px;
      cursor: pointer;
      .point-name {
        width: 240px;
        display: flex;
        align-items: center;

        .ico-circle {
          display: inline-block;
          width: 4px;
          height: 4px;
          background: var(--supply-color-online);
          border-radius: 50%;
          margin-right: 8px;
        }
      }
      .point-box {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .unit {
        margin-left: 10px;
        width: 62px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .value {
        display: flex;
        margin-left: 24px;
        padding: 0 15px;
        text-align: left;
        box-sizing: border-box;
        width: 88px;
        height: 28px;
        line-height: 28px;
        background: var(--supply-color-bg-card-dark);
        border: 1px solid var(--supply-color-border-DEFAULT);
        color: var(--supply-color-secondary);
        border-radius: 4px;
      }
      /deep/ .list__input {
        display: flex;
        justify-content: center;
        align-items: flex-start;
        width: 88px;
        height: 28px;
        line-height: 28px;
        padding: 0 4px;
        box-sizing: border-box;
        background: #f3f6f8;
        border: 1px solid #e9e8e8;
        color: var(--supply-color-secondary);
        .wpg-input-number-handler-up,
        .wpg-input-number-handler-down {
          visibility: hidden;
        }
        .wpg-input-number-input-wrap input {
          height: 28px;
        }
      }
    }
    .split {
      height: calc(100% - 10px);
    }

    .empty {
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
}
/deep/.wpg-spin-container {
  height: 100%;
}
.flow-dialog {
  /deep/ .wpg-modal-body {
    height: 360px;
    padding: 20px 40px;
    overflow: auto;
  }
  .chart-box {
    width: 100%;
    height: 100%;
  }
}
</style>
