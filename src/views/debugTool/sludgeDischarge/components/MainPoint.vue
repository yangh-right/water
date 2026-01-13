<template>
  <div class="point">
    <div class="card card0">
      <point-box title="排泥策略" :list="data">
        <div slot="titleRight" class="type">
          <w-radio-group v-model="line" size="small" button-style="solid">
            <w-radio-button v-for="item in lineList" :key="item.dictCode" :value="item.dictValue">
              {{ item.dictName }}
            </w-radio-button>
          </w-radio-group>
        </div>
      </point-box>
    </div>
    <div class="card card1">
      <point-box :col="1" title="剩余污泥流量建议值" :list="sludgeObj"></point-box>
    </div>
  </div>
</template>

<script>
import pointBox from '../../models/pointBox';

import purificationLineMixin from '@/utils/mixins/purificationLineMixin.js';
import { residualSludge } from '@/api/optimization';
import { getModelList } from '@/api/runTime';

export default {
  components: { pointBox },
  props: {
    waterPlantId: {
      type: String,
      default: ''
    },
    suggestDataInfo: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      line: '0',
      data: [],
      modelList: [],
      sludgeObj: [{ name: '剩余污泥流量', defaultValue: '0', unit: '' }]
    };
  },
  mixins: [purificationLineMixin],
  computed: {},
  watch: {
    waterPlantId: {
      handler(val) {
        if (val) {
          this.getModelList();
        }
      },
      immediate: true
    },
    line: {
      handler(val) {
        this.handleInputParam(val);
      },
      deep: true
    },
    suggestDataInfo: {
      immediate: true,
      deep: true,
      handler(val) {
        if (Object.keys(val).length > 0) {
          let timeDataList = val.timeDataList.filter(v => !!v.historyPointValue);
          this.sludgeObj = [
            {
              name: '剩余污泥流量',
              defaultValue:
                timeDataList.length > 0
                  ? timeDataList[timeDataList.length - 1]?.historyPointValue
                  : '0',
              unit: val?.pointUnit
            }
          ];
        }
      }
    }
  },
  mounted() {
    // this.getResidualSludge();
  },
  methods: {
    async getModelList(isInit = true) {
      let params = {
        waterPlantId: this.waterPlantId,
        modelTypeCode: '4'
      };
      let res = await getModelList(params);
      const { resultData, status } = res;
      if (status === 'complete' && Array.isArray(resultData) && resultData.length > 0) {
        this.modelList = JSON.parse(resultData[0].inputParam);
        setTimeout(() => {
          this.handleInputParam(this.modelList, this.line);
        }, 1000);
      }
    },
    handleInputParam(line) {
      let dictName = '';
      this.lineList.forEach(item => {
        if (item.dictValue == line) {
          dictName = item.dictName;
        }
      });
      let result = this.modelList.find(model => {
        return model.name.indexOf(dictName) > -1;
      });
      if (result) {
        this.data = result.points;
      }
    },
    async getResidualSludge() {
      this.spinng = true;
      let { status, resultData } = await residualSludge('residual_sludge_flow_rate');
      this.spinng = false;
      if (status === 'complete') {
        this.sludgeObj = [
          {
            name: '剩余污泥流量',
            defaultValue: resultData?.pointValue,
            unit: resultData?.pointUnit
          }
        ];
      }
    }
  }
};
</script>
<style lang="less" scoped>
.point {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: space-between;
  .type {
    position: relative;
    right: 12px;
  }
  .card {
    height: 100%;
    width: calc(74% - 6px);
    &.card0 {
      /deep/.point__item {
        &:nth-last-of-type(-n + 3) {
          margin-bottom: 0;
        }
      }
    }
    &.card1 {
      width: calc(26% - 6px);
      /deep/.point__wrapper {
        .point__item:nth-last-of-type(-n + 1) {
          margin-bottom: 0;
        }
        .point__item {
          width: 70% !important;
          .point__pv {
            width: 100%;
          }
          .point__unit {
            width: 0px;
          }
        }
      }
    }
  }
}
</style>
