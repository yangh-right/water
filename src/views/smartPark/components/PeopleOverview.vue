<!--
 * @Author: wangyr
 * @Date: 2023-05-30 16:43:53
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-06-19 13:37:10
 * @Description:
-->
<template>
  <bim-card :cardTitle="cardTitle">
    <div class="card-inner">
      <w-row type="flex" :warp="true" align="middle">
        <w-col v-for="(item, i) in deviceArr" :key="item.label" :span="6">
          <div class="divice-tab">
            <div :class="['device-img', 'img' + (i + 1)]"></div>
          </div>
        </w-col>
      </w-row>
    </div>
  </bim-card>
</template>

<script>
import BimCard from './BimCard.vue';
export default {
  name: 'PeopleOverview',
  components: {
    BimCard
  },
  data() {
    return {
      cardTitle: '人员概况',
      deviceArr: [
        {
          label: '实时人数',
          value: 782
        },
        {
          label: '访客人数',
          value: 34
        },
        {
          label: '入院车辆',
          value: 30
        },
        {
          label: '剩余车位',
          value: 15
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
    margin-left: 21px;
    .device-img {
      width: 71px;
      height: 70.38px;
      margin-right: 1px;
    }
    .img1 {
      background: url('~@/assets/images/default/smartPark/people1.png') no-repeat;
    }
    .img2 {
      background: url('~@/assets/images/default/smartPark/people2.png') no-repeat;
    }
    .img3 {
      background: url('~@/assets/images/default/smartPark/people3.png') no-repeat;
    }
    .img4 {
      background: url('~@/assets/images/default/smartPark/people4.png') no-repeat;
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
        width: 100px;
        height: 24px;
        line-height: 24px;
        font-weight: 700;
        font-size: 22px;
        color: #effcfe;
        letter-spacing: 0;
        text-indent: 10px;
        margin-top: 2px;
      }
    }
  }
}
</style>
