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
      <w-tab-pane key="warehouseKeep">
        <span slot="tab">
          <w-icon type="book" />
          仓库管理
        </span>
        <basic-cmaintain></basic-cmaintain>
      </w-tab-pane>
      <w-tab-pane key="materialCategory">
        <span slot="tab">
          <w-icon type="snippets" />
          物资类型
        </span>
        <basic-category class="base-info-item"></basic-category>
      </w-tab-pane>
      <w-tab-pane key="goodsInfo">
        <span slot="tab">
          <w-icon type="form" />
          物资列表
        </span>
        <basic-information :tabKey="tabKey" class="base-info-item"></basic-information>
      </w-tab-pane>
    </w-tabs>
    <div class="goback-btn">
      <return-control :is-drill-down="true" path="/warehouse"></return-control>
    </div>
    <!-- <a-spin size="large" /> -->
  </div>
</template>
<script>
import basicCmaintain from './components/basicCmaintain';
import basicCategory from './components/basicCategory';
import basicInformation from './components/basicInformation';
export default {
  name: 'baseInfo',
  components: {
    basicCmaintain,
    basicCategory,
    basicInformation
  },
  data() {
    return {
      tabKey: 'warehouseKeep'
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
