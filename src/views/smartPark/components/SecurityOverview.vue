<!--
 * @Author: wangyr
 * @Date: 2023-05-30 16:43:53
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-06-19 13:36:38
 * @Description:
-->
<template>
  <bim-card :cardTitle="cardTitle">
    <div class="card-inner">
      <w-row type="flex" :warp="true" align="middle">
        <w-col v-for="(item, i) in deviceArr" :key="item.label" :span="8">
          <div class="divice-tab">
            <div :class="['device-img', 'img' + (i + 1)]"></div>
            <div class="device-info">
              <div>
                <span class="label">{{ item.label1 }}</span
                ><span :class="'value' + (i + 1)">{{ item.value1 }}</span>
              </div>
              <div>
                <span class="label">{{ item.label2 }}</span
                ><span class="value">{{ item.value2 }}</span>
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
  name: 'SecurityOverview',
  components: {
    BimCard
  },
  data() {
    return {
      cardTitle: '安防总览',
      deviceArr: [
        {
          label1: '在线数量：',
          value1: 26,
          label2: '视频总数：',
          value2: 32
        },
        {
          label1: '在线数量：',
          value1: 17,
          label2: '门禁总数：',
          value2: 32
        },
        {
          label1: '在线数量：',
          value1: 12,
          label2: '电子围栏：',
          value2: 32
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
    flex-direction: column;
    margin: 6px 0;
    margin-left: 21px;
    .device-img {
      margin-top: -20px;
      width: 108px;
      height: 130px;
    }
    .img1 {
      background: url('~@/assets/images/default/smartPark/security1.png') no-repeat;
    }
    .img2 {
      background: url('~@/assets/images/default/smartPark/security2.png') no-repeat;
    }
    .img3 {
      background: url('~@/assets/images/default/smartPark/security3.png') no-repeat;
    }
    .device-info {
      margin-top: -10px;
      .label {
        width: 100px;
        height: 22px;
        font-family: PingFangSC-Medium, sans-serif;
        font-weight: 500;
        font-size: 12px;
        color: #ffffff;
        letter-spacing: 0;
        text-shadow: 0 2px 10px #c6f5ff8f;
      }
      .value {
        width: 100px;
        height: 24px;
        line-height: 24px;
        font-weight: 500;
        font-size: 16px;
        color: #ffffff;
        text-shadow: 0 2px 10px #c6f5ff8f;
        -webkit-background-clip: text;
        letter-spacing: 0;
        text-indent: 10px;
        margin-top: 2px;
      }
      .value1 {
        width: 100px;
        height: 24px;
        line-height: 24px;
        font-weight: 500;
        font-size: 20px;
        color: transparent;
        text-shadow: 0 0 5px #4bb4e580;
        background-image: linear-gradient(to bottom, #ffed00, #fff);
        -webkit-background-clip: text;

        letter-spacing: 0;
        text-indent: 10px;
        margin-top: 2px;
      }
      .value2 {
        width: 100px;
        height: 24px;
        line-height: 24px;
        font-weight: 500;
        font-size: 20px;
        color: transparent;
        text-shadow: 0 0 5px #4bb4e580;
        background-image: linear-gradient(to bottom, #00d0ff, #fff);
        -webkit-background-clip: text;

        letter-spacing: 0;
        text-indent: 10px;
        margin-top: 2px;
      }
      .value3 {
        width: 100px;
        height: 24px;
        line-height: 24px;
        font-weight: 500;
        font-size: 20px;
        color: transparent;
        text-shadow: 0 0 5px #4bb4e580;
        background-image: linear-gradient(to bottom, #49f294, #fff);
        -webkit-background-clip: text;

        letter-spacing: 0;
        text-indent: 10px;
        margin-top: 2px;
      }
    }
  }
}
</style>
