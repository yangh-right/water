<!--
 * @Description: 请输入....
 * @Author: huhaiou
 * @Date: 2022-03-23 09:30:37
 * @LastEditTime: 2023-06-01 08:36:20
 * @LastEditors: Do not edit
-->

<template>
  <div class="base-info">
    <w-tabs v-model="tabKey">
      <w-tab-pane key="carbonSourceDosing">
        <span slot="tab">
          <w-icon type="funnel-plot" />
          碳源加药
        </span>
        <carbon-source-dosing></carbon-source-dosing>
      </w-tab-pane>
      <!-- <w-tab-pane key="hiEffSedTankDosing">
        <span slot="tab">
          <w-icon type="safety" />
          高效沉淀池加药
        </span>
        <hi-eff-sed-tank-dosing class="base-info-item"></hi-eff-sed-tank-dosing>
      </w-tab-pane>
      <w-tab-pane key="sodiumHypochloriteDosing">
        <span slot="tab">
          <w-icon type="gateway" />
          次氯酸钠加药
        </span>
        <sodium-hypochlorite-dosing :tabKey="tabKey" class="base-info-item"></sodium-hypochlorite-dosing>
      </w-tab-pane> -->
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

  .base-info-item {
    width: 100%;
    height: 100%;
    padding-top: 12px;
  }
}
</style>
