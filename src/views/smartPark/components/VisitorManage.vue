<!--
 * @Author: wangyr
 * @Date: 2023-05-30 19:52:35
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-05-31 16:41:34
 * @Description:
-->
<template>
  <bim-card :cardTitle="cardTitle">
    <div class="card-inner">
      <div class="table-box">
        <div class="table-head">
          <div class="name">姓名</div>
          <div class="time">入园时间</div>
          <div class="reason">事由</div>
          <div class="carId">车牌</div>
        </div>
        <div class="table-body">
          <div v-for="(item, i) in tableData" :key="i" class="table-tr">
            <div class="name">{{ item.name }}</div>
            <div class="time">{{ item.time }}</div>
            <div class="reason">{{ item.reason }}</div>
            <div class="carId">{{ item.carId }}</div>
          </div>
        </div>
      </div>
    </div>
  </bim-card>
</template>

<script>
import BimCard from './BimCard.vue';
export default {
  name: 'VisitorManage',
  components: {
    BimCard
  },
  data() {
    return {
      cardTitle: '访客管理',
      tableData: [
        {
          name: '张丽',
          time: '05/31  12:34',
          reason: '考察',
          carId: '沪ADX3858'
        },
        {
          name: '张娜娜',
          time: '05/31  10:37',
          reason: '开会',
          carId: '沪CDX8178'
        },
        {
          name: '王丽',
          time: '05/30  14:04',
          reason: '参观',
          carId: '沪BDX3868'
        },
        {
          name: '孙海平',
          time: '05/30  08:44',
          reason: '其他',
          carId: '沪ADX2818'
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

  .table-box {
    width: 100%;
    height: 100%;

    .table-head {
      height: 34px;
      display: flex;
      align-items: center;
      padding: 0 0 0 12px;
      box-sizing: border-box;
      background: url('~@/assets/images/default/smartPark/table_head.png') no-repeat;
      background-size: 100% 100%;

      div {
        font-family: PingFangSC-Regular, sans-serif;
        font-weight: 400;
        font-size: 14px;
        color: #b2dfff;
        letter-spacing: 0;
      }
    }
    .table-body {
      width: 100%;
      height: calc(100% - 34px);
      overflow: auto;
    }
    .table-tr {
      height: 34px;
      display: flex;
      align-items: center;
      background: url('~@/assets/images/default/smartPark/table_dark.png') no-repeat;
      background-size: 100% 100%;
      padding: 0 0 0 12px;
      box-sizing: border-box;
      margin-top: 4px;

      .name {
        font-weight: 500;
        font-size: 14px;
        color: #d8f0ffcc;
        letter-spacing: 0;
        text-align: center;
      }
      .time {
        font-weight: 500;
        font-size: 14px;
        color: #d8f0ffcc;
        letter-spacing: 0;
        text-align: center;
        line-height: 16px;
      }

      .reason {
        font-weight: 500;
        font-size: 14px;
        color: #d8f0ffcc;
        letter-spacing: 0;
        text-align: center;
        line-height: 16px;
      }
      .carId {
        font-weight: 500;
        font-size: 14px;
        color: #d8f0ffcc;
        letter-spacing: 0;
        text-align: center;
        line-height: 16px;
      }
    }
    .table-tr:nth-child(even) {
      background: url('~@/assets/images/default/smartPark/table_light.png') no-repeat;
    }
    .name {
      flex-grow: 1;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      display: flex;
      align-items: center;
    }
    .time {
      flex-basis: 120px;
      text-align: center;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .reason {
      flex-basis: 80px;
      text-align: center;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .carId {
      flex-basis: 120px;
      text-align: center;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
}
</style>
