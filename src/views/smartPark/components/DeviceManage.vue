<!--
 * @Author: wangyr
 * @Date: 2023-05-30 16:43:53
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-06-19 13:35:52
 * @Description:
-->
<template>
  <bim-card :cardTitle="cardTitle">
    <div class="card-inner">
      <w-row type="flex" :warp="true" align="middle">
        <w-col v-for="(item, i) in deviceArr" :key="item.label" :span="12">
          <div class="divice-tab">
            <div :class="['device-img', 'img' + (i + 1)]"></div>
            <div class="device-info">
              <div class="label">{{ item.label }}</div>
              <div class="value">
                {{ item.value }}
                <span class="unit">{{ item.unit }}</span>
              </div>
            </div>
          </div>
        </w-col>
      </w-row>
    </div>
  </bim-card>
</template>

<script>
import BimCard from './BimCard.vue';
export default {
  name: 'DeviceManage',
  components: {
    BimCard
  },
  data() {
    return {
      cardTitle: '污水厂概况',
      deviceArr: [
        {
          label: '设计处理能力',
          value: '100000',
          unit: 'm³'
        },
        {
          label: '实时流量',
          value: '3500',
          unit: 'm³/h'
        },
        {
          label: '设备总数',
          value: '258',
          unit: '台'
        },
        {
          label: '出水达标率',
          value: '100',
          unit: '%'
        }
      ]
    };
  },
  computed: {},
  watch: {},
  methods: {},
  created() {},
  mounted() {}
};
</script>

<style lang="less" scoped>
.card-inner {
  width: 100%;
  height: 100%;
  position: relative;
  padding: 0 12px;
  box-sizing: border-box;

  .divice-tab {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin: 6px 0;
    margin-left: 21px;
    .device-img {
      width: 64px;
      height: 66px;
      margin-right: 1px;
    }
    .img1 {
      background: url('~@/assets/images/default/smartPark/base1.png') no-repeat;
    }
    .img2 {
      background: url('~@/assets/images/default/smartPark/base4.png') no-repeat;
    }
    .img3 {
      background: url('~@/assets/images/default/smartPark/base3.png') no-repeat;
    }
    .img4 {
      background: url('~@/assets/images/default/smartPark/base2.png') no-repeat;
    }
    .device-info {
      .label {
        width: 100px;
        height: 22px;
        font-family: PingFangSC-Medium, sans-serif;
        font-weight: 500;
        font-size: 12px;
        color: #d3edff;
        letter-spacing: 0;
        text-indent: 10px;
      }
      .value {
        width: 114px;
        height: 24px;
        line-height: 24px;
        font-weight: 700;
        font-size: 22px;
        color: transparent;
        text-shadow: 0 0 5px #4bb4e580;
        background-image: linear-gradient(to bottom, #74b1ec, #ecf9ff, #effcfe);
        -webkit-background-clip: text;
        letter-spacing: 0;
        text-indent: 10px;
        margin-top: 2px;
        .unit {
          font-weight: 600;
          font-size: 12px;
          color: #b1c9d8;
        }
      }
    }
  }
}
</style>
