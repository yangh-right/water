<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2024-05-07 15:58:05
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2024-06-07 09:36:43
 * @Description: 
-->
<template>
  <card-box title="优化建议">
    <div class="box-wrapper">
      <div :class="{ box: true, dark: state.theme === 'dark' }">
        <div class="box__item" v-for="(item, index) in dataList" :key="index">
          <div class="item__name">{{ item.name }}</div>
          <div class="item__value">
            <span class="val">{{ item.val }}</span>
            <span class="unit">{{ item.unit }}</span>
          </div>
        </div>
      </div>
    </div>
  </card-box>
</template>

<script>
import CardBox from '@/components/CardBox';
import { optimizationSuggestion } from '@/api/optimization';
import moment from 'moment';
export default {
  inject: ['state'],
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
      dataList: [
        { name: '上一次清运周期', val: '--', unit: '' },
        { name: '建议下一次清运周期', val: '--', unit: '' }
      ]
    };
  },

  components: { CardBox },
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
        endTime: moment().format('YYYY-MM-DD HH:mm:ss'),
        startTime: moment()
          .subtract(1, 'months')
          .format('YYYY-MM-DD HH:mm:ss'),
        waterPlantId: this.waterPlantId
      };
      const { resultData, status } = await optimizationSuggestion(params);
      if (status === 'complete') {
        this.dataList[0].val = resultData?.lastCleanTime ?? '--';
        this.dataList[1].val = resultData?.nextCleanTime ?? '--';
      }
    }
  }
};
</script>
<style lang="less" scoped>
.box-wrapper {
  position: absolute;
  transform: translateY(-50%);
  top: 50%;
  width: 100%;
  padding: 15px 8px 15px 15px;
  height: 100%;
  max-height: 250px;
}
.box {
  background: url('~@/assets/images/modules/discharge/clear_bg.png') no-repeat;
  background-size: 100% 100%;
  padding: 12% 6px 10.5% 37%;
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: space-between;

  &__item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .item__name {
      font-weight: 500;
      font-size: 14px;
      color: var(--supply-color-secondary);
      letter-spacing: 0;
    }
    .item__value {
      .val {
        font-family: MiSans-SNaNpxibold, sans-serif;
        font-weight: 600;
        font-size: 14px;
        color: var(--supply-color-main);
        letter-spacing: 0;
      }
      .unit {
        font-weight: 400;
        font-size: 14px;
        color: var(--supply-color-secondary);
        letter-spacing: 0;
        margin-left: 4px;
      }
    }
  }
}
.box {
  &.dark {
    background: url('~@/assets/images/modules/discharge/clear_bg_dark.png') no-repeat;
    background-size: 100% 100%;
  }
}
</style>
