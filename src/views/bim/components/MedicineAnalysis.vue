<!--
 * @Author: wangyr
 * @Date: 2023-05-30 19:52:35
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-06-15 13:17:45
 * @Description: 
-->
<!--
 * @Author: wangyr
 * @Date: 2023-05-30 19:52:35
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-06-01 09:06:38
 * @Description:
-->
<template>
  <bim-card :cardTitle="cardTitle">
    <div class="card-inner">
      <div class="table-box">
        <div class="table-head">
          <div class="name"></div>
          <div class="reality">实际单耗</div>
          <div class="target">单耗目标值</div>
        </div>
        <div class="table-body">
          <div v-for="item in tableData" :key="item.name" class="table-tr">
            <div class="name">{{ item.name }}</div>
            <div class="reality">{{ item.reality }}</div>
            <div class="target">{{ item.target }}</div>
          </div>
        </div>
      </div>
    </div>
  </bim-card>
</template>

<script>
import BimCard from './BimCard.vue';
export default {
  name: 'MedicineAnalysis',
  components: {
    BimCard
  },
  data() {
    return {
      cardTitle: '药耗分析',
      tableData: [
        {
          name: '乙酸钠（kg/m³）',
          reality: '35.0',
          target: '9.07'
        },
        {
          name: '聚丙烯酰胺-水（kg/m³）',
          reality: '0.34',
          target: '0.28'
        },
        {
          name: '聚合氯化铝（kg/m³）',
          reality: '28.7',
          target: '5.36'
        },
        {
          name: '次氯酸钠（kg/m³）',
          reality: '25.7',
          target: '7.67'
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
      height: 32px;
      display: flex;
      align-items: center;
      padding: 0 0 0 12px;
      box-sizing: border-box;

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
      height: calc(100% - 32px);
      overflow: auto;
    }
    .table-tr {
      height: 32px;
      display: flex;
      align-items: center;
      background: url('~@/assets/images/default/tr-bg.png') no-repeat;
      background-size: 100% 100%;
      padding: 0 0 0 12px;
      box-sizing: border-box;
      margin-bottom: 4px;

      .name {
        font-family: PingFangSC-Regular, sans-serif;
        font-weight: 400;
        font-size: 14px;
        color: #b2dfff;
        letter-spacing: 0;
      }
      .reality {
        font-size: 18px;
        color: #ffffff;
        letter-spacing: 0;
      }
      .target {
        font-size: 18px;
        color: #ffffff;
        letter-spacing: 0;
      }
    }
    .name {
      flex-grow: 1;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .reality {
      flex-basis: 100px;
      text-align: center;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .target {
      flex-basis: 120px;
      text-align: center;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
}
</style>
