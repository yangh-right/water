<!--
 * @Author: 王永瑞 1637350822@qq.com
 * @Date: 2022-09-22 08:59:34
 * @LastEditors:  Do not edit
 * @LastEditTime: 2024-07-26 15:53:04
 * @FilePath: \supply-water\src\views\leakage\Prediction.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="leakage-container">
    <div class="rg-content">
      <div class="btn-wrapper">
        <div class="btn-box">
          <div class="fot-item row-7">
            <div class="fot-label">选择污水厂</div>
            <factory-select style="width: 202px" autoSelect v-model="waterPlantId"></factory-select>
          </div>
          <div class="fot-item row-12">
            <div class="fot-label">选择日期</div>
            <w-range-picker :allowClear="false" v-model="useFlowTime.date" format="YYYY-MM-DD" />
          </div>
        </div>
        <div class="fot-item">
          <w-button class="supply-mr-3" @click="handleReset" icon="reload">重置</w-button>
          <w-button class="supply-mr-3" type="primary" @click="handleSearch" icon="search"
            >查询</w-button
          >
        </div>
      </div>
      <w-tabs v-model="tabKey">
        <w-tab-pane key="useWaterKey">
          <span slot="tab">
            进水量预测
          </span>
          <module :tabKey="tabKey" :tableData="uesWaterData" :loading="loading"></module>
        </w-tab-pane>
      </w-tabs>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { queryByPumpHouseId } from '@/api/leakage';
import FactorySelect from '@/components/factory-select';
import module from './components/module.vue';
export default {
  name: 'Prediction',
  components: {
    module,
    FactorySelect
  },
  data() {
    return {
      waterPlantId: undefined,
      useFlowTime: {
        date: [this.$moment(), this.$moment()]
      },
      uesWaterData: [],
      tabKey: 'useWaterKey',
      loading: false
    };
  },
  computed: {
    ...mapState('setting', ['buttonCodes'])
  },
  watch: {
    waterPlantId: {
      deep: true,
      handler() {
        this.getUseWater();
      }
    }
  },
  methods: {
    /* 进水量预测 */
    async getUseWater() {
      this.loading = true;
      console.log('rrr', this.waterPlantId);
      const formData = new FormData();
      formData.append('pumpHouseId', this.waterPlantId);

      if (this.useFlowTime.date[0] && this.useFlowTime.date[1]) {
        formData.append('startTime', this.useFlowTime.date[0].format('YYYY-MM-DD 00:00:00'));
        formData.append('endTime', this.useFlowTime.date[1].format('YYYY-MM-DD 23:59:59'));
      }
      let res = await queryByPumpHouseId(formData);
      if (res.status === 'complete') {
        if (Array.isArray(res.resultData) && res.resultData.length > 0) {
          res.resultData.forEach(item => {
            item['dateTime'] = item['dateTime'] + ':00';
          });
          this.uesWaterData = res.resultData;
        }
      }
      this.loading = false;
    },
    /* 查询 */
    handleSearch() {
      this.getUseWater();
    },
    /* 重置 */
    handleReset() {
      this.useFlowTime = {
        date: [this.$moment(), this.$moment()]
      };
      this.getUseWater();
    }
  },
  created() {},
  mounted() {}
};
</script>

<style lang="less" scoped>
.leakage-container {
  display: flex;
  height: 100%;

  .rg-content {
    flex: 1 1 auto;
    flex-basis: 0;
    border-radius: 4px;
    position: relative;

    .btn-wrapper {
      display: flex;
      justify-content: space-between;
      background-color: var(--supply-color-bg-card-DEFAULT);
      margin-bottom: 12px;
      padding: 5px 20px;
      border-radius: 4px;
      .btn-box {
        width: calc(100% - 200px);
        display: flex;
        align-items: center;
      }

      .row-7 {
        flex: 0 1 28%;

        /deep/ .fot-label {
          flex: 0 0 90px;
        }
      }
      .fot-item {
        display: flex;
        justify-content: flex-start;
        align-items: center;

        .fot-label {
          line-height: 42px;
          color: var(--supply-color-main);

          &::after {
            content: ':';
            position: relative;
            top: -0.5px;
            margin: 0 8px 0 2px;
          }
        }
      }
    }

    /deep/.wpg-tabs {
      height: calc(100% - 64px);
      background-color: var(--supply-color-bg-card-DEFAULT);

      .wpg-tabs-bar {
        padding: 10px 0 0;
        margin-bottom: 0px;
        background-color: var(--supply-color-bg-card-component);
      }

      .wpg-tabs-content {
        height: calc(100% - 45px);
      }
    }

    /deep/.wpg-table-title {
      display: none;
    }
  }
}
</style>
