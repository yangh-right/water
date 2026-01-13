<template>
  <div class="point">
    <div class="card">
      <point-box :col="2" title="排砂策略" :list="data1"></point-box>
    </div>
    <div class="card">
      <point-box :col="2" title="排砂建议" :list="data2"></point-box>
    </div>
  </div>
</template>

<script>
import pointBox from '../../models/pointBox';
import { sandDischargeScheme } from '@/api/optimization';
export default {
  components: { pointBox },
  props: {
    waterPlantId: {
      type: String,
      default: ''
    },
    bucketId: {
      type: String | Number,
      default: ''
    }
  },
  data() {
    return {
      data1: [
        { name: '砂桶高度设定值', defaultValue: '', unit: 'm' },
        { name: '沉淀池悬浮物设定值', defaultValue: '', unit: 'mg/L' },
        { name: '增益系数', defaultValue: '', unit: '' }
      ],
      data2: [
        { name: '建议排砂量', defaultValue: '', unit: 't' },
        { name: '建议排砂时间', defaultValue: '', unit: '', class: 'time' }
      ]
    };
  },

  watch: {
    waterPlantId: {
      handler(val) {
        this.getData();
      }
    },
    bucketId: {
      handler(val) {
        this.getData();
      },
      immediate: true
    }
  },
  methods: {
    async getData() {
      if (!(this.waterPlantId && this.bucketId)) return;
      let params = {
        bucketId: this.bucketId,
        endTime: this.$moment().format('YYYY-MM-DD HH:mm:ss'),
        startTime: this.$moment()
          .subtract(1, 'months')
          .format('YYYY-MM-DD HH:mm:ss'),
        waterPlantId: this.waterPlantId
      };
      const { resultData, status } = await sandDischargeScheme(params);
      if (status === 'complete') {
        this.data1[0].defaultValue = resultData?.bucketHeight;
        this.data1[1].defaultValue = resultData?.ss;
        this.data1[2].defaultValue = resultData?.gainFactor;
        this.data2[0].defaultValue = resultData?.adviceSand;
        this.data2[1].defaultValue = resultData?.adviceTime;
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
  .card {
    background-color: var(--supply-color-bg-card-component);
    width: calc(50% - 6px);
    /deep/.point__wrapper {
      .point__item:nth-last-of-type(-n + 2) {
        margin-bottom: 0;
      }
      .point__item {
        .point__pv {
          width: calc(100% - 56px);
        }
        .point__unit {
          width: 40px;
        }
      }
    }
  }
}
</style>
