<!--
 * @Author: wangyr
 * @Date: 2023-06-15 10:59:17
 * @LastEditors: wangyr
 * @LastEditTime: 2024-11-18 14:26:21
 * @Description:
-->
<!-- 浸出液管理页面 -->
<template>
  <div class="page">
    <!-- 加载中 -->
    <w-spin v-if="loading" />
    <!-- 驾驶舱 -->
    <template>
      <div class="sidebar">
        <keep-alive v-for="item in moduleList.slice(0, 4)" :key="item.uuid">
          <component v-if="factoryId" :is="item.buttonCode" :factoryId="factoryId"></component>
        </keep-alive>
      </div>
      <div :class="['page-main']">
        <map-cmp @handleChange="handleChange" />
        <div v-if="buttonCodes['leachingSet']" @click="handleTabs" class="set-box">
          <i class="page-edit"></i>配置
        </div>
      </div>
      <div class="sidebar">
        <keep-alive v-for="item in moduleList.slice(4)" :key="item.uuid">
          <component v-if="factoryId" :is="item.buttonCode" :factoryId="factoryId"></component>
        </keep-alive>
      </div>
    </template>
    <modules-dialog
      :visible="rangeVisible"
      :keys="moduleKeys"
      :moduleType="moduleType"
      @rangeOK="rangeOK"
      @rangeCancel="rangeCancel"
    ></modules-dialog>
  </div>
</template>

<script>
// 导入相关依赖
import { mapState } from 'vuex';
import { queryCockpitList, editPlate, queryCockpitListAll } from '@/api/cockpit.js';
import Sewage from './components/Sewage.vue';
import RunParameter from './components/RunParameter.vue';
import RemovalRate from './components/RemovalRate.vue';
import ReductionAmount from './components/ReductionAmount.vue';
import HealthRemark from './components/HealthRemark.vue';
import AmmoniaNitrogen from './components/AmmoniaNitrogen.vue';
import TotalNitrogen from './components/TotalNitrogen.vue';
import Phosphorus from './components/Phosphorus.vue';
import modulesDialog from './components/modulesDialog.vue';
import CarbonEmission from './components/CarbonEmission.vue';
import uuid from '@/utils/uuid';
export default {
  name: 'LeachingCellar',
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
    CarbonEmission
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
      moduleList: [],
      moduleType: '4'
    };
  },
  computed: {
    ...mapState('setting', ['buttonCodes'])
  },
  activated() {},
  created() {
    this.getUserTree();
  },
  methods: {
    async getUserTree() {
      let { resultData, status } = await queryCockpitList(this.moduleType);
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
      let params = {
        charts: modules,
        moduleType: this.moduleType
      };
      editPlate(params).then(res => {
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
  display: flex;
  justify-content: space-between;
  height: 100%;

  &-main {
    width: calc(60% - 12px);
    margin: 0 12px;
    position: relative;
    flex: 1;
  }

  .set-box {
    position: absolute;
    top: 25px;
    right: 25px;
    z-index: 999;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 18px;
    cursor: pointer;
    font-family: PingFangSC-Regular, sans-serif;
    font-weight: 400;
    font-size: 12px;
    color: #6281a3;
    .page-edit {
      display: inline-block;
      width: 12px;
      height: 12px;
      background: url('~@/assets/images/default/ico-set.png');
      margin-right: 5px;
    }

    &.active {
      color: @theme;
    }
  }
}

.sidebar {
  flex: 0 0 calc(20% - 6px);
  overflow: auto;
  border-radius: 4px;
  box-shadow: 4px 0 16px 0 var(--bsc1);
  padding: 0 12px 12px 12px;
  box-sizing: border-box;
  background: var(--supply-color-bg-card-DEFAULT);
  .card-box {
    height: 25%;
    width: 100%;
    padding: 12px 0 0 0;
    box-sizing: border-box;
    overflow: hidden;
  }
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
