<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2024-05-07 15:58:05
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2024-06-07 09:28:07
 * @Description: 
-->
<template>
  <card-box title="砂桶基本信息">
    <div class="box-wrapper">
      <div :class="{ box: true, dark: state.theme === 'dark' }">
        <!-- <div class="bucket-base"></div> -->
        <div class="bucket" :style="{ height: bucketHeight + 'px' }">
          <div class="bucket__lid"></div>
          <div class="bucket-wrapper" :style="{ height: bucketHeight - 34 + 'px' }">
            <div
              class="bucket__top"
              v-if="sandHeight"
              :style="{ bottom: sandHeight - 33 + 'px' }"
            ></div>
            <div class="bucket__content" :style="{ height: sandHeight + 'px' }"></div>
            <div class="bucket__bottom"></div>
          </div>
        </div>
        <div class="box__item-wrapper" v-for="(item, index) in dataList" :key="index">
          <div class="box__item">
            <div class="item__name">
              <span class="name__icon"></span>
              <span class="name">{{ item.name }}</span>
            </div>
            <div class="item__value">
              <span class="val">{{ item.val }}</span>
              <span class="unit">{{ item.unit }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </card-box>
</template>

<script>
import { sandBucketSituation } from '@/api/optimization';
import moment from 'moment';
import CardBox from '@/components/CardBox';
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
      bucketHeight: 124,
      sandHeight: 0,
      dataList: [
        { name: '整体高度', val: '--', unit: 'm', style: {} },
        { name: '桶名称', val: '--', unit: '' },
        { name: '底面积', val: '--', unit: 'm²' }
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
      const { resultData, status } = await sandBucketSituation(params);
      if (status === 'complete') {
        this.dataList[0].val = resultData?.overallHeight ?? '--';
        this.dataList[1].val = resultData?.bucketName ?? '--';
        this.dataList[2].val = resultData?.basalArea ?? '--';
        this.sandHeight = (resultData?.usedHeight / resultData?.overallHeight) * this.bucketHeight;
        if (isNaN(this.sandHeight)) {
          this.sandHeight = 0;
        } else if (this.sandHeight < 10 && this.sandHeight > 0) {
          this.sandHeight = 10;
        }
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
  padding: 27px 22px 18px;
  height: 100%;
  max-height: 250px;
  min-height: 230px;
}
.box {
  position: relative;
  padding: 9px 0px 0px;
  display: flex;
  height: 100%;
  background: url('~@/assets/images/modules/discharge/bucket_bg.png') no-repeat 45.5% 79px;
  background-size: 60% 55%;
  justify-content: space-between;
  flex-wrap: wrap;
  .bucket {
    position: absolute;
    left: 50%;
    top: 0px;
    transform: translateX(-60%);
    background: url('~@/assets/images/modules/discharge/bucket.png') no-repeat left bottom;
    background-size: 100% 113px;
    width: 64px;
    .bucket-wrapper {
      position: relative;
      top: 25px;
      overflow: hidden;
      border-radius: 0 0 40% 40%;
    }
    &__lid {
      position: absolute;
      z-index: 26;
      background: url('~@/assets/images/modules/discharge/bucket_lid.png') no-repeat;
      background-size: 100% 100%;
      width: calc(100% - 8px);
      left: 4.6px;
      top: 5px;
      height: 22px;
    }
    &__bottom {
      position: absolute;
      z-index: 21;
      background: url('~@/assets/images/modules/discharge/bucket_bottom.png') no-repeat;
      background-size: 100% 100%;
      width: calc(100% - 11px);
      left: 6.5px;
      bottom: 0px;
      height: 22px;
    }
    &__top {
      position: absolute;
      z-index: 23;
      background: url('~@/assets/images/modules/discharge/bucket_top.png') no-repeat;
      background-size: 100% 100%;
      width: calc(100% - 11px);
      left: 6.5px;
      height: 46px;
    }
    &__content {
      position: absolute;
      background: url('~@/assets/images/modules/discharge/bucket_content.png') no-repeat;
      background-size: 100% 100%;
      width: calc(100% - 11px);
      left: 6.5px;
      bottom: 0px;
    }
  }
  &__item-wrapper {
    width: 50%;
    display: flex;
    &:nth-child(odd) {
      justify-content: flex-end;
    }
  }
  &__item {
    margin-bottom: 33px;
    .item__name {
      display: flex;
      align-items: center;
      .name__icon {
        display: inline-block;
        border-radius: 50%;
        width: 8px;
        height: 8px;
        background-image: radial-gradient(circle at 71% 36%, #3dfffb 0%, #2869fd 49%, #1c7bff 64%);
        box-shadow: inset 0 1px 3px 0 #91eefffc;
        margin-right: 6px;
      }
      .name {
        font-size: 14px;
        letter-spacing: 0;
        font-weight: 400;
        font-family: MiSans-SNaNpxibold, sans-serif;
        color: var(--supply-color-secondary);
      }
    }
    .item__value {
      margin-left: 20px;
      .val {
        font-weight: 600;
        margin-right: 4px;
        font-size: 24px;
        color: var(--supply-color-main);
        letter-spacing: 0;
      }
      .unit {
        font-weight: 400;
        font-size: 14px;
        color: var(--supply-color-secondary);
        letter-spacing: 0;
      }
    }
  }
}
.box {
  &.dark {
    background: url('~@/assets/images/modules/discharge/bucket_bg_dark.png') no-repeat 45.5% 79px;
    background-size: 60% 55%;
    .bucket {
      background: url('~@/assets/images/modules/discharge/bucket_dark.png') no-repeat left bottom;
      background-size: 100% 113px;

      &__lid {
        background: url('~@/assets/images/modules/discharge/bucket_lid_dark.png') no-repeat;
        background-size: 100% 100%;
      }
      &__bottom {
        background: url('~@/assets/images/modules/discharge/bucket_bottom_dark.png') no-repeat;
        background-size: 100% 100%;
      }
      &__top {
        background: url('~@/assets/images/modules/discharge/bucket_top_dark.png') no-repeat;
        background-size: 100% 100%;
      }
      &__content {
        background: url('~@/assets/images/modules/discharge/bucket_content_dark.png') no-repeat;
        background-size: 100% 100%;
      }
    }
  }
}
</style>
