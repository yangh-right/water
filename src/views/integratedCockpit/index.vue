<!--
 * @Author: wangyr
 * @Date: 2023-06-15 10:59:17
 * @LastEditors:  Do not edit
 * @LastEditTime: 2024-09-14 16:30:39
 * @Description:
-->
<template>
  <div class="page">
    <!-- 加载中 -->
    <w-spin v-if="loading" />
    <!-- 驾驶舱 -->
    <template>
      <div class="sidebar sidebar-left">
        <keep-alive v-for="item in moduleList.slice(0, 4)" :key="item.uuid">
          <component :is="item.buttonCode" :factoryId="factoryId"></component>
        </keep-alive>
      </div>
      <div :class="['page-main']" style="padding: 0 24%;">
        <map-cmp @handleChange="handleChange" />
        <div @click="handleTabs" class="set-box">配置</div>
      </div>
      <div class="sidebar sidebar-right">
        <keep-alive v-for="item in moduleList.slice(4)" :key="item.uuid">
          <component :is="item.buttonCode" :factoryId="factoryId"></component>
        </keep-alive>
      </div>
    </template>
    <modules-dialog
      :visible="rangeVisible"
      :keys="moduleKeys"
      @rangeOK="rangeOK"
      @rangeCancel="rangeCancel"
    ></modules-dialog>
  </div>
</template>

<script>
import { queryCockpitList, editPlate } from '@/api/cockpit.js';
import Sewage from './components/Sewage.vue';
import RunParameter from './components/RunParameter.vue';
import RemovalRate from './components/RemovalRate.vue';
import ReductionAmount from './components/ReductionAmount.vue';
import HealthRemark from './components/HealthRemark.vue';
import AmmoniaNitrogen from './components/AmmoniaNitrogen.vue';
import TotalNitrogen from './components/TotalNitrogen.vue';
import Phosphorus from './components/Phosphorus.vue';
import modulesDialog from './components/modulesDialog.vue';
import PowerAnalysis from './components/PowerAnalysis.vue';
import DrugAnalysis from './components/DrugAnalysis.vue';
import SludgeCount from './components/SludgeCount.vue';
import uuid from '@/utils/uuid';
export default {
  name: 'integratedCockpit',
  components: {
    MapCmp: () => import('./models/MapCmp.vue'),
    Sewage,
    RunParameter,
    RemovalRate,
    ReductionAmount,
    HealthRemark,
    AmmoniaNitrogen,
    TotalNitrogen,
    Phosphorus,
    modulesDialog,
    PowerAnalysis,
    DrugAnalysis,
    SludgeCount
  },
  mixins: [],
  data() {
    return {
      key: null,
      loading: false,
      draggable: false,
      factoryId: '',
      rangeVisible: false,
      moduleKeys: [],
      moduleList: []
    };
  },
  computed: {},
  activated() {},
  created() {
    this.getUserTree();
  },
  methods: {
    async getUserTree() {
      let { resultData, status } = await queryCockpitList();
      if (status === 'complete') {
        // 模块展示
        this.moduleList = resultData.filter(item => item.isShow === '1');
        this.moduleList.forEach(item => {
          item['uuid'] = uuid();
        });
        this.moduleKeys = this.moduleList.map(item => item.buttonCode);
      }
    },
    handleChange(id) {
      this.factoryId = id;
    },
    handleTabs() {
      this.rangeVisible = true;
    },
    rangeOK(keys, modules) {
      this.rangeVisible = false;
      editPlate(modules).then(res => {
        let { resultData, status } = res;
        if (status === 'complete') {
          this.$message.success('配置成功!');
          this.getUserTree();
        }
      });
    },
    rangeCancel() {
      this.rangeVisible = false;
    }
  }
};
</script>

<style lang="less" scoped>
.page {
  height: 100%;
  width: 100%;
  position: relative;

  &-main {
    width: 100%;
    height: 100%;
    position: relative;
    background: url('~@/assets/images/default/integrated/ck-bg.png') no-repeat center center;
    background-size: cover;
    background-color: #000d1f;
  }

  .set-box {
    position: absolute;
    top: 12px;
    right: 25%;
    z-index: 99;
    width: 80px;
    line-height: 27px;
    height: 27px;
    cursor: pointer;
    font-family: AlibabaPuHuiTi_2_85_Bold, sans-serif;
    font-weight: 400;
    font-size: 16px;
    color: #d9ecff;
    background: url('~@/assets/images/default/integrated/ck-set.png') left top no-repeat;
    background-size: 100% 100%;
    padding-left: 40px;
    box-sizing: border-box;
    &.active {
      color: @theme;
    }
  }
}

.sidebar {
  height: 100%;
  width: 24%;
  overflow: auto;
  border-radius: 4px;
  box-shadow: 4px 0 16px 0 var(--bsc1);
  padding: 0 12px 12px 12px;
  box-sizing: border-box;
  z-index: 9;

  .card-box {
    height: 25%;
    box-sizing: border-box;
  }
}
.sidebar-left {
  position: absolute;
  left: 0;
  top: 12px;
}
.sidebar-right {
  position: absolute;
  right: 0;
  top: 12px;
}
.full-screen {
  padding: 0px;
  flex: 0 0 0px;
}

.wpg-spin {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

:deep(.wpg-empty) {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;

  &-image {
    height: auto;
  }

  &-description {
    color: var(--mft-3-cls);

    .wpg-btn {
      margin-top: 10px;
    }
  }
}
</style>
