<!--
 * @Author: wangyr
 * @Date: 2023-05-30 19:52:35
 * @LastEditors: wangyr
 * @LastEditTime: 2024-05-17 16:04:40
 * @Description:
-->
<template>
  <cockpit-card :cardTitle="cardTitle">
    <div class="card-inner">
      <div class="table-box">
        <div class="table-head">
          <div class="name"></div>
          <div class="reality">实际单耗</div>
          <div class="target">单耗目标值</div>
        </div>
        <div class="table-body">
          <div v-for="(item, i) in tableData" :key="i" class="table-tr">
            <div class="name">{{ item.smallTypeName }}</div>
            <div class="reality">
              {{ !!item.waterOfMedicament ? item.waterOfMedicament : '--' }}
            </div>
            <div class="target">
              {{ !!item.adviceWaterOfMedicament ? item.adviceWaterOfMedicament : '--' }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </cockpit-card>
</template>

<script>
import { drugAnalysis } from '@/api/analysis.js';
import CockpitCard from './CockpitCard.vue';
export default {
  name: 'DrugAnalysis',
  components: {
    CockpitCard
  },
  props: {
    factoryId: {
      type: String,
      required: true,
      default: ''
    }
  },
  data() {
    return {
      cardTitle: '药耗分析',
      tableData: []
    };
  },
  computed: {},
  watch: {
    factoryId: {
      handler(val) {
        if (val) {
          this.getDrugAnalysis();
        }
      }
    }
  },
  methods: {
    async getDrugAnalysis() {
      let res = await drugAnalysis(this.factoryId);
      let { status, resultData } = res;
      if (status === 'complete') {
        this.tableData = resultData;
      }
    }
  },
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
      height: 30px;
      display: flex;
      align-items: center;
      padding: 0 0 0 12px;
      box-sizing: border-box;
      // background: url('~@/assets/images/default/alarm-hd.png') no-repeat;
      // background-size: 100% 100%;
      div {
        font-family: AlibabaPuHuiTi_2_55_Regular, sans-serif;
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
      height: 26px;
      display: flex;
      align-items: center;
      background: url('~@/assets/images/default/integrated/ck-row.png') no-repeat;
      background-size: 100% 100%;
      padding: 0 0 0 12px;
      box-sizing: border-box;
      margin-top: 4px;

      .name {
        font-family: AlibabaPuHuiTi_2_55_Regular, sans-serif;
        font-weight: 600;
        font-size: 14px;
        letter-spacing: 0;
        color: #9bc9ef;
      }
      .reality {
        font-family: AlibabaPuHuiTi_2_55_Regular, sans-serif;
        color: #ffffffff;
        font-size: 14px;
        font-weight: 700;
        letter-spacing: 0;
      }

      .target {
        font-family: AlibabaPuHuiTi_2_55_Regular, sans-serif;
        font-weight: 700;
        font-size: 14px;
        color: #ffffff;
        letter-spacing: 0;
      }
    }
    .name {
      flex-grow: 1;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      display: flex;
      align-items: center;
    }
    .reality {
      flex-basis: 100px;
      text-align: center;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .target {
      flex-basis: 100px;
      text-align: center;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
}
</style>
