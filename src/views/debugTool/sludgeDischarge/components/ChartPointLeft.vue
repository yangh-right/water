<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2024-05-07 09:53:17
 * @LastEditors: wangyr
 * @LastEditTime: 2024-08-12 10:50:51
 * @Description:
-->
<template>
  <div class="card">
    <div class="card-module">
      <div class="container">
        <card-box class="card-item" title="MLSS">
          <in-water
            :placePoints="mlssPoints"
            :mlssSludgeDischargeData="mlssSludgeDischargeData"
            @handleMlssPointCode="handleMlssPointCode"
          ></in-water>
        </card-box>
        <card-box class="card-item" title="排泥量">
          <process-water-quality
            :placePoints="sludgePoints"
            :pointCode="pointCode"
            :sludgeConcentrationData="sludgeConcentrationData"
            @handlesludgeConcentration="handlesludgeConcentration"
          ></process-water-quality>
        </card-box>
        <card-box class="card-item" title="污泥外运量">
          <div slot="titleRight" class="type">
            <w-range-picker
              :style="{ width: '240px' }"
              v-model="dateTime"
              size="small"
              :allowClear="false"
              @change="changeTime"
            />
          </div>
          <out-water
            :chemicalSludgeEntryData="chemicalSludgeEntryData"
            @handlePointCode="handlePointCode"
          ></out-water>
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
  getSludgeDischarge,
  getChemicalSludgeRate
} from '@/api/optimization';
import inWater from './inWater';
import outWater from './outWater';
import processWaterQuality from './processWaterQuality';
import CardBox from '@/components/CardBox';
export default {
  components: {
    CardBox,
    inWater,
    outWater,
    processWaterQuality
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
      pointCode: '1', // 1-月 默认为月 （污泥产量用） 2日
      dateTime: [this.$moment().subtract(30, 'days'), this.$moment()],
      type: '1',
      chemicalSludgeEntryData: [],
      singleSludgeDischargeData: [],
      placesByPointConfigCode: [],
      placeId: '',
      effectDateType: '0',
      mlssSludgeDischargeData: {},
      sludgeConcentrationData: {},
      sludgeFlowPoints: [],
      mlssPoints: [],
      sludgePoints: []
    };
  },
  watch: {
    waterPlantId: {
      handler(val) {
        if (val) {
          this.getChemicalSludgeEntryData(val);
          this.getPlacesByPointConfigCode(val, 'activated_sludge_mlss', 'mlssPoints');
          this.getPlacesByPointConfigCode(val, 'residual_sludge_flow_rate', 'sludgePoints');
        }
      },
      immediate: true
    }
  },
  methods: {
    changeTime() {
      this.getChemicalSludgeEntryData(this.waterPlantId);
    },
    handlePointCode(type) {
      this.getChemicalSludgeEntryData(this.waterPlantId, type);
    },
    getChemicalSludgeEntryData(val, type = 0) {
      let params = {
        waterPlantId: val,
        startTime: this.$moment(this.dateTime[0]).format('YYYY-MM-DD'),
        endTime: this.$moment(this.dateTime[1]).format('YYYY-MM-DD')
      };
      getSludgeDischarge(params).then(res => {
        if (res.status === 'complete') {
          this.chemicalSludgeEntryData = res.resultData;
        }
      });
    },
    handleMlssPointCode(placeId) {
      this.getSingleSludgeDischargeData(this.waterPlantId, 'activated_sludge_mlss', placeId);
    },
    handlesludgeConcentration(type) {
      this.pointCode = type;
      this.getSingleSludgeDischargeData(this.waterPlantId, 'residual_sludge_flow_rate', type);
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
          params['endTime'] = this.$moment().format('YYYY-MM-DD HH:mm:ss');
        } else {
          params['startTime'] = this.$moment()
            .subtract(30, 'days')
            .format('YYYY-MM-DD 08:00:00');
          params['endTime'] = this.$moment().format('YYYY-MM-DD HH:mm:ss');
        }
        delete params.placeId;
        getSingleSludgeDischargeDayData(params).then(res => {
          if (res.status === 'complete') {
            this.sludgeConcentrationData = res.resultData;
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
            // 剩余污泥浓度
            this.getSingleSludgeDischargeData(val, 'residual_sludge_flow_rate', this.placeId);
          }
        }
      });
    }
  }
};
</script>
<style lang="less" scoped>
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
/deep/.wpg-calendar-range-picker-separator {
  display: inline-block;
  max-width: 16px;
  margin: 0 6px;
}
/deep/.wpg-calendar-range-picker-input {
  width: calc(50% - 20px);
}
.type {
  position: relative;
  top: 3px;
}
</style>
