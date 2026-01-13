<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2024-05-07 15:58:05
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2024-06-05 17:00:08
 * @Description:
-->
<template>
  <card-box title="效果评价">
    <div slot="titleRight" v-if="toolConfig.showTitleRadio" class="type">
      <w-radio-group style="margin-right: 12px;" size="small" v-model="type">
        <w-radio-button v-for="(item, index) in TypeList" :key="item.value" :value="item.value">
          {{ item.label }}
        </w-radio-button>
      </w-radio-group>
    </div>
    <w-radio-group class="supply-mt-1.5 circle-radio" v-model="pointCode">
      <w-radio-button v-for="(item, index) in pointList" :key="item.value" :value="item.value">
        {{ item.label }}
      </w-radio-button>
    </w-radio-group>
    <div class="chart-wrapper">
      <line-chart :option="option"></line-chart>
    </div>
    <!-- <div class="suggest" :title="'如按照建议投加量，当月可节省' + totalSaving + 'm³'">
      如按照建议投加量，当月可节省{{ totalSaving }}m³
    </div> -->
  </card-box>
</template>

<script>
import { genEffectEvaluationOption } from './data';
import CardBox from '@/components/CardBox';
export default {
  inject: ['toolConfig'],
  props: {
    waterPlantId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      totalSaving: '--',
      pointCode: 'day',
      pointList: [
        { label: '日', value: 'day', unit: 'L/h' },
        { label: '月', value: 'month', unit: 'L/h' }
      ],
      type: '1',
      TypeList: [
        { label: '经济评价', value: '1' },
        { label: '吨水药耗评价', value: '2' }
      ],
      option: genEffectEvaluationOption()
    };
  },

  components: { CardBox, LineChart: () => import('@/components/CardBox/chartBox.vue') },
  watch: {
    waterPlantId: {
      handler(val) {
        this.getData();
      },
      immediate: true
    },
    pointCode: {
      handler(val) {
        this.getData();
      }
    },
    type: {
      handler(val) {
        this.getData();
      }
    }
  },
  methods: {
    async getData() {
      if (!this.waterPlantId) return;
      let params = {
        end: this.$moment()
          .add(24, 'hours')
          .format('YYYY-MM-DD HH:00:00'),
        // start: this.$moment()
        //   .subtract(1, this.pointCode + 's')
        //   .format('YYYY-MM-DD 08:00:00'),
        queryType: this.pointCode,
        waterPlantId: this.waterPlantId
      };
      if (this.pointCode == 'day') {
        params['start'] = this.$moment()
          .subtract(24, 'hours')
          .format('YYYY-MM-DD HH:00:00');
      } else {
        params['start'] = this.$moment()
          .subtract(1, this.pointCode + 's')
          .format('YYYY-MM-DD HH:00:00');
      }
      let { resultData, status } = (await this.toolConfig?.addListApi(params)) || {};
      if (status === 'complete') {
        const curDateType = this.pointList.find(item => item.value === this.pointCode);
        const data = resultData?.[0]?.medicateEntryTimeDataList || [];
        this.totalSaving = resultData?.[0]?.totalSaving ?? '--';
        let xData = data?.map(data => data.dateTime) || [];
        console.log('333', xData);
        let yData = [];
        if (this.type === '1') {
          yData.push(data?.map(item => item.savingRatioSeries) || []);
          yData.push(data?.map(item => item.realPv) || []);
          yData.push(data?.map(item => item.simulatePv) || []);
        } else {
          yData.push(data?.map(item => item.waterOfMedicament) || []);
          yData.push(data?.map(item => item.adviceWaterOfMedicament) || []);
        }
        this.option = genEffectEvaluationOption({
          xData,
          yData,
          type: this.type,
          xAxisRotate: 40,
          xAxisLabelFormat: value => {
            return value && value.length > 12 ? value?.slice(11, 16) : value?.slice(5, 10);
          },
          yAxisName: this.type === '1' ? curDateType.unit : 'g/ton'
        });
      }
    }
  }
};
</script>
<style lang="less" scoped>
@import '@/views/debugTool/style/design.less';

.chart-wrapper {
  height: calc(100% - 30px);
}
.suggest {
  height: 24px;
  line-height: 24px;
  margin: 0 12px;
  background-color: var(--supply-color-bg-card-dark);
  padding: 0 6px;
  font-weight: 400;
  font-size: 14px;
  color: var(--supply-color-secondary);
  letter-spacing: 0;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.type {
  position: relative;
  top: -1px;
}
</style>
