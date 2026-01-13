<!--
 * @Author: wangyr
 * @Date: 2023-05-30 16:43:53
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-06-19 13:34:56
 * @Description:
-->
<template>
  <bim-card :cardTitle="cardTitle">
    <div class="card-inner">
      <w-row type="flex" :warp="true" align="middle">
        <w-col v-for="(item, i) in deviceArr" :key="item.label" :span="12">
          <div class="divice-tab">
            <div :class="['device-info','device-img', 'img' + (i + 1)]">
              <div class="label">{{ item.label }}</div>
              <div class="value">
                {{ item.value }}
                <span class="unit">个</span>
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
  name: 'FireFight',
  components: {
    BimCard,
  },
  data() {
    return {
      cardTitle: '消防概况',
      deviceArr: [
        {
          label: '灭火器',
          value: 30,
        },
        {
          label: '烟雾传感器',
          value: 10,
        },
        {
          label: '消防栓',
          value: 8,
        },
        {
          label: '消费水泵',
          value: 14,
        },
      ],
    };
  },
  computed: {},
  watch: {},
  methods: {},
  created() {},
  mounted() {},
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

    .device-img {
      width: 179.3px;
      height: 58px;
      margin-right: 1px;
    }
    .img1 {
      background: url('~@/assets/images/default/smartPark/fire1.png') no-repeat;
    }
    .img2 {
      background: url('~@/assets/images/default/smartPark/fire2.png') no-repeat;
    }
    .img3 {
      background: url('~@/assets/images/default/smartPark/fire3.png') no-repeat;
    }
    .img4 {
      background: url('~@/assets/images/default/smartPark/fire4.png') no-repeat;
    }

    .device-info {
      padding-left: 65px;
      .label {
        font-weight: 500;
        font-size: 12px;
        color: #ffffff;
        letter-spacing: 0;
        text-shadow: 0 1px 7px #c6f5ff8f;
      }
      .value {
        font-weight: 700;
        font-size: 24px;
        color: transparent;
        text-shadow: 0 0 5px #4bb4e580;
        background-image: linear-gradient(to bottom, #74b1ec, #f4f9fe);
        -webkit-background-clip: text;
        letter-spacing: 1px;
        line-height: 24px;

        .unit {
          margin-left:-6px;
          font-weight: 500;
          font-size: 12px;
          color: #b1c9d8;
          letter-spacing: 0;
          text-shadow: 0 1px 7px #c6f5ff8f;
        }
      }
    }
  }
}
</style>
