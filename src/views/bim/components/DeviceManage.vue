<!--
 * @Author: wangyr
 * @Date: 2023-05-30 16:43:53
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-05-31 19:18:21
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
              <div class="label">{{ item.label }}</div>
              <div class="value">{{ item.value }} <span class="unit">台</span></div>
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
      cardTitle: '设备管理',
      deviceArr: [
        {
          label: '在线个数',
          value: 32
        },
        {
          label: '离线个数',
          value: 8
        },
        {
          label: '正常个数',
          value: 32
        },
        {
          label: '故障个数',
          value: 7
        },
        {
          label: '停机个数',
          value: 8
        },
        {
          label: '维修个数',
          value: 6
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
    margin: 16px 0;

    .device-img {
      width: 43px;
      height: 48px;
      margin-right: 1px;
    }
    .img1 {
      background: url('~@/assets/images/default/device1.png') no-repeat;
    }
    .img2 {
      background: url('~@/assets/images/default/device2.png') no-repeat;
    }
    .img3 {
      background: url('~@/assets/images/default/device3.png') no-repeat;
    }
    .img4 {
      background: url('~@/assets/images/default/device4.png') no-repeat;
    }
    .img5 {
      background: url('~@/assets/images/default/device5.png') no-repeat;
    }
    .img6 {
      background: url('~@/assets/images/default/device6.png') no-repeat;
    }

    .device-info {
      .label {
        width: 83px;
        height: 22px;
        font-family: PingFangSC-Medium, sans-serif;
        font-weight: 500;
        font-size: 14px;
        color: #d3edff;
        letter-spacing: 0;
        text-indent: 10px;
        background: url('~@/assets/images/default/device-label.png') no-repeat left bottom;
      }
      .value {
        width: 83px;
        height: 24px;
        line-height: 24px;
        font-weight: 700;
        font-size: 22px;
        color: #effcfe;
        letter-spacing: 0;
        text-indent: 10px;
        background: url('~@/assets/images/default/device-val.png') no-repeat left center;
        margin-top: 2px;

        .unit {
          font-weight: 600;
          font-size: 14px;
          color: #bed6ff;
          letter-spacing: 0;
        }
      }
    }
  }
}
</style>
