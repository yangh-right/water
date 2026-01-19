<!--
 * @Description: 请输入....
 * @Author: huhaiou
 * @Date: 2022-03-23 09:30:37
 * @LastEditTime: 2023-06-01 08:36:20
 * @LastEditors: Do not edit
-->

<template>
  <div class="base-info">
    <w-tabs v-model="tabKey" destroyInactiveTabPane>
      <w-tab-pane key="carbonSourceDosing" tab="碳源加药">
        <carbon-source-dosing class="base-info-item"></carbon-source-dosing>
      </w-tab-pane>
      <w-tab-pane key="hiEffSedTankDosing" tab="高效沉淀池加药">
        <hi-eff-sed-tank-dosing class="base-info-item"></hi-eff-sed-tank-dosing>
      </w-tab-pane>
      <w-tab-pane key="sodiumHypochloriteDosing" tab="次氯酸钠加药">
        <sodium-hypochlorite-dosing :tabKey="tabKey" class="base-info-item"></sodium-hypochlorite-dosing>
      </w-tab-pane>
    </w-tabs>
  </div>
</template>
<script>
import CarbonSourceDosing from './carbonSourceDosing';
import HiEffSedTankDosing from './hiEffSedTankDosing';
import SodiumHypochloriteDosing from './sodiumHypochloriteDosing';
export default {
  name: 'baseInfo',
  components: {
    CarbonSourceDosing,
    HiEffSedTankDosing,
    SodiumHypochloriteDosing
  },
  data() {
    return {
      tabKey: 'carbonSourceDosing'
    };
  },
  methods: {
    callback(key) {
      console.log(key);
    }
  }
};
</script>
<style lang="less" scoped>
.base-info {
  height: 100%;
  position: relative;

  .goback-btn {
    position: absolute;
    top: 5px;
    right: 20px;
  }

  /deep/.wpg-tabs {
    height: 100%;

    .wpg-tabs-nav {
      height: 50px;
    }

    .wpg-tabs-nav-wrap {
      background: var(--supply-color-bg-card-DEFAULT);
      height: 50px;
      border-radius: 4px;
    }

    .wpg-tabs-bar {
      margin: 0;
    }

    .wpg-tabs-tab {
      height: 50px;
      font-size: 17px;
      line-height: 30px;
    }

    .wpg-tabs-content {
      height: calc(100% - 50px);
    }
  }

  /deep/.wpg-table-title {
    display: none;
  }

  .base-info-item {
    width: 100%;
    height: 100%;
    padding-top: 12px;
  }
}
</style>
