<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2024-05-07 09:53:17
 * @LastEditors: wangyr
 * @LastEditTime: 2024-08-12 11:01:41
 * @Description:
-->
<template>
  <div class="card">
    <div class="card-module">
      <div class="container">
        <card-box class="card-item" title="MLSS预测值">
          <carbon-dosage
            :placePoints="mlssPoints"
            :mlssSludgeDischargeData="mlssSludgeDischargeData"
            @handleMlssPointCode="handleMlssPointCode"
          ></carbon-dosage>
        </card-box>
        <card-box class="card-item" title="二沉池排泥量预测">
          <div slot="titleRight" class="type">
            <w-radio-group class="circle-radio" v-model="pointCode" @change="handlesludgeFlow">
              <w-radio-button v-for="item in pointList" :key="item.value" :value="item.value">
                {{ item.label }}
              </w-radio-button>
            </w-radio-group>
          </div>
          <suggest-predict
            :timeCode="pointCode"
            :placePoints="sludgePoints"
            :sludgeFlowData="sludgeFlowData"
          ></suggest-predict>
        </card-box>
        <card-box class="card-item" title="效果评价">
          <effect-evaluation
            :chemicalSludgeRate="chemicalSludgeRate"
            @handlePointRateCode="handleEffectDateType"
          ></effect-evaluation>
        </card-box>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getPlacesByPointConfigCode,
  getSingleSludgeDischargeData,
  getSingleSludgeDischargeDayData,
  getChemicalSludgeEntryData,
  getEffectEvaluation
} from '@/api/optimization';
import CardBox from '@/components/CardBox';
import effectEvaluation from './effectEvaluation';
import suggestPredict from './suggestPredict';
import carbonDosage from './carbonDosage';
export default {
  components: {
    CardBox,
    carbonDosage,
    suggestPredict,
    effectEvaluation
  },
  props: {
    waterPlantId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      TypeList: [
        { label: '经济评价', value: '1' },
        { label: '污泥产率评价', value: '2' }
      ],
      pointList: [
        { label: '月', value: '1' },
        { label: '日', value: '2' }
      ],
      pointCode: '1', // 1-月 默认为月 （污泥产量用） 2日
      type: '1',
      chemicalSludgeEntryData: {},
      singleSludgeDischargeData: [],
      placesByPointConfigCode: [],
      placeId: '',
      effectDateType: '1',
      placePoints: [],
      mlssSludgeDischargeData: {},
      sludgeFlowData: {},
      sludgeFlowPoints: [],
      chemicalSludgeRate: [],
      mlssPoints: [],
      sludgePoints: []
    };
  },
  watch: {
    waterPlantId: {
      handler(val) {
        if (val) {
          this.getChemicalSludgeEntryRate(val, this.effectDateType);
          this.getPlacesByPointConfigCode(val, 'activated_sludge_mlss', 'mlssPoints');
          this.getPlacesByPointConfigCode(val, 'residual_sludge_flow_rate', 'sludgePoints');
        }
      },
      immediate: true
    }
  },
  methods: {
    handleEffectDateType(type) {
      this.effectDateType = type;
      this.getChemicalSludgeEntryRate(this.waterPlantId, this.effectDateType);
    },
    getChemicalSludgeEntryRate(val, type = '1') {
      let params = {
        waterPlantId: val,
        // yoyFlag: true,
        configCode: 'residual_sludge_flow_rate',
        type
      };
      if (this.effectDateType == '2') {
        params['startTime'] = this.$moment()
          .subtract(1, 'days')
          .format('YYYY-MM-DD 08:00:00');
        params['endTime'] = this.$moment().format('YYYY-MM-DD HH:mm:ss');
      } else {
        params['startTime'] = this.$moment()
          .subtract(30, 'days')
          .format('YYYY-MM-DD 08:00:00');
        params['endTime'] = this.$moment().format('YYYY-MM-DD HH:mm:ss');
      }
      getEffectEvaluation(params).then(res => {
        if (res.status === 'complete') {
          this.chemicalSludgeRate = res.resultData;
        }
      });
    },
    handleMlssPointCode(placeId) {
      this.getSingleSludgeDischargeData(this.waterPlantId, 'activated_sludge_mlss', placeId);
    },
    handlesludgeFlow(e) {
      this.pointCode = e.target.value;
      this.getSingleSludgeDischargeData(
        this.waterPlantId,
        'residual_sludge_flow_rate',
        this.pointCode
      );
    },
    getSingleSludgeDischargeData(val, configCode, placeId) {
      let params = {
        waterPlantId: val,
        placeId,
        configCode
      };
      if (configCode === 'activated_sludge_mlss') {
        params['startTime'] = this.$moment()
          .subtract(1, 'days')
          .format('YYYY-MM-DD 08:00:00');
        params['endTime'] = this.$moment().format('YYYY-MM-DD HH:mm:ss');
        getSingleSludgeDischargeData(params).then(res => {
          if (res.status === 'complete') {
            this.mlssSludgeDischargeData = res.resultData;
          }
        });
      }
      if (configCode === 'residual_sludge_flow_rate') {
        params['type'] = this.pointCode;
        if (this.pointCode === '2') {
          params['startTime'] = this.$moment()
            .subtract(1, 'days')
            .format('YYYY-MM-DD 08:00:00');
        } else {
          params['startTime'] = this.$moment()
            .subtract(30, 'days')
            .format('YYYY-MM-DD 08:00:00');
        }
        params['endTime'] = this.$moment()
          .add(1, 'day')
          .format('YYYY-MM-DD HH:mm:ss');

        delete params.placeId;
        // 获取当前时间
        // const now = this.$moment();
        // const currentHour = now.hour();
        // if (currentHour >= 12) {
        //   // 如果超过12点，结束时间设为后天8点
        //   params['endTime'] = now.add(2, 'days').format('YYYY-MM-DD 08:00:00');
        // } else {
        //   // 如果未超过12点，结束时间设为明天8点
        //   params['endTime'] = now.add(1, 'day').format('YYYY-MM-DD 08:00:00');
        // }
        getSingleSludgeDischargeDayData(params).then(res => {
          if (res.status === 'complete') {
            this.sludgeFlowData = res.resultData;
            this.$emit('suggestData', res.resultData);
          }
        });
      }
    },
    getPlacesByPointConfigCode(val, configCode, pointsName) {
      let params = {
        configCode,
        pumpHouseId: val
      };
      getPlacesByPointConfigCode(params).then(res => {
        if (res.status === 'complete') {
          if (configCode === 'activated_sludge_mlss' && res.resultData.length > 0) {
            this[pointsName] = res.resultData.reverse();
            this.placeId = this[pointsName][0].id;
            // MLSS
            this.getSingleSludgeDischargeData(val, 'activated_sludge_mlss', this.placeId);
          }
          if (configCode === 'residual_sludge_flow_rate' && res.resultData.length > 0) {
            this[pointsName] = res.resultData;
            this.placeId = this[pointsName][0].id;
            // 剩余污泥流量
            this.getSingleSludgeDischargeData(val, 'residual_sludge_flow_rate', this.placeId);
          }
        }
      });
    }
  }
};
</script>
<style lang="less" scoped>
@import '@/views/debugTool/style/design.less';

.card {
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;
  display: flex;
  justify-content: space-between;
  .card-module {
    width: 100%;
  }
  .container {
    height: 100%;
    position: relative;

    .card-item {
      height: calc(100% / 3);
    }
  }
}
.type {
  position: relative;
  top: -1px;
}
</style>
