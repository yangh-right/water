<!--
 * @Author: duyibo
 * @Date: 2024-04-24 14:14:03
 * @LastEditors: Do not edit
 * @LastEditTime: 2024-05-11 09:35:08
 * @Description:
-->
<template>
  <div class="energyHeatMap">
    <div class="heatmap-h">
      <w-form-model class="supply-bg-bg-card-DEFAULT" layout="inline" ref="form">
        <w-form-model-item label="选择污水厂">
          <FactorySelect
            :style="{ width: '260px' }"
            autoSelect
            v-model="waterPlantId"
            @change="getUrlMap"
          ></FactorySelect>
        </w-form-model-item>
        <w-form-model-item label="选择日期">
          <w-range-picker v-model="heatmapTime" :style="{ width: '300px' }" :allowClear="false" />
        </w-form-model-item>
        <w-form-model-item prop="keyWord">
          <w-button type="primary" icon="search" @click="searchClick">
            查询
          </w-button>
        </w-form-model-item>
      </w-form-model>
    </div>
    <div class="heatmap-c">
      <w-spin :spinning="loading" class="spin">
        <iframe
          v-if="svgSmallUrl"
          :src="svgSmallUrl"
          title="热力图"
          ref="contentFrame"
          id="contentFrame"
          name="contentFrame"
          class="contentFrame"
          @load="iframeLoaded"
        ></iframe>
        <w-empty v-else class="empty" description="暂未配置"></w-empty>
      </w-spin>
      <div class="thermodynamic">
        <heatmap v-if="heatmapData.length" key="thermodynamic" :heatmapData="heatmapData"></heatmap>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment';
import { accessToken } from '@wpg/framework-vue';
import { getSvgListByCondition } from '@/api/optimization';
import FactorySelect from '@/components/factory-select/index.vue';
import heatmap from './components/heatmap.vue';
import { getEnergyDeviceAnalysis } from '@/api/analysis.js';

export default {
  name: 'EnergyHeatMap',
  components: {
    FactorySelect,
    heatmap
  },
  data() {
    return {
      heatmapTime: [moment().startOf('month'), moment().endOf('month')],
      svgSmallUrl: undefined,
      loading: false,
      heatmapData: [],
      waterPlantId: ''
    };
  },
  mounted() {
    this.getUrlMap();
  },
  methods: {
    searchClick() {
      if (this.svgSmallUrl !== '') {
        this.getHeatmapData();
      }
    },
    async getHeatmapData() {
      const params = {
        endDate: moment(this.heatmapTime[1]).format('YYYY-MM-DD'),
        ratioFlag: true,
        startDate: moment(this.heatmapTime[0]).format('YYYY-MM-DD'),
        dateType: 'day'
      };
      this.heatmapData = [];
      const { resultData, status } = await getEnergyDeviceAnalysis(params);
      if (status === 'complete') {
        const initObj = {
          x: 680,
          y: 520,
          value: 0
        };
        this.heatmapData = resultData.map((item, index) => ({
          x: initObj.x + index * 50,
          y: initObj.y,
          value: item.powerPv
        }));
      }
    },
    async getUrlMap() {
      this.loading = true;
      const { resultData, status } = await getSvgListByCondition({
        stationIds: [this.waterPlantId],
        type: 'aerial_view'
      });
      if (status === 'complete' && resultData?.length > 0) {
        const token = accessToken.get();
        this.svgSmallUrl = `${resultData[0].previewUrl}&token=${token}&parent=${window.origin}`;
        this.loading = false;
      } else {
        this.svgSmallUrl = '';
        this.loading = false;
      }
    },
    iframeLoaded() {
      let vm = this;
      vm.$nextTick(() => {
        setTimeout(() => {
          vm.getHeatmapData();
        }, 3000);
      });
    }
  }
};
</script>

<style lang="less" scoped>
.energyHeatMap {
  width: 100%;
  height: 100%;
  overflow: hidden;
  .heatmap-h {
    height: 52px;
    padding: 6px 12px;
    border-radius: 4px;
    width: 100%;
    background-color: var(--supply-color-bg-card-DEFAULT);
  }
  .heatmap-c {
    height: calc(100% - 64px);
    // padding: 12px;
    overflow: auto;
    margin: 10px 0;
    border-radius: 4px;
    width: 100%;
    background-color: var(--supply-color-bg-card-DEFAULT);
    position: relative;
    .spin {
      height: 100%;
      /deep/.wpg-spin-container {
        height: 100%;
      }
      .contentFrame {
        width: 100%;
        height: calc(100% - 30px);
        padding: 0 12px;
        margin: 10px 0;
        box-sizing: border-box;
      }
      .empty {
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
    .thermodynamic {
      position: absolute;
      top: 0px;
      width: 100%;
      height: 100%;
      z-index: 10;
    }
  }
}
</style>
