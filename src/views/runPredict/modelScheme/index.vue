<!--
 * @Author: wangyr
 * @Date: 2023-08-03 09:01:03
 * @LastEditors:  Do not edit
 * @LastEditTime: 2024-04-12 17:04:14
 * @Description:
-->
<template>
  <div class="base-info">
    <w-tabs v-model="tabKey">
      <w-tab-pane v-for="(item, index) in tabList" :key="item.tabKey">
        <span slot="tab">
          {{ item.name }}
        </span>
        <model-scheme v-bind="item.props" :tab="item.key" class="base-info-item"></model-scheme>
      </w-tab-pane>
    </w-tabs>
    <div class="goback-btn">
      <return-control :is-drill-down="true" path="/warehouse"></return-control>
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import ModelScheme from './models/ModelScheme';
export default {
  name: 'Scheme',
  components: {
    ModelScheme
  },
  computed: {
    ...mapState('setting', ['buttonCodes'])
  },
  data() {
    return {
      tabList: [
        { key: '1', tabKey: 'runPredict', name: '仿真参数调整', props: {} }
        // {
        //   key: '3',
        //   tabKey: 'dosingParam',
        //   name: '加药参数调整',
        //   props: { showDimension: false, resultType: '0', initShowType: '1' }
        // },
        // {
        //   key: '4',
        //   tabKey: 'sludgeParam',
        //   name: '排泥参数调整',
        //   props: { showDimension: false, resultType: '0', initShowType: '1', showLine: true }
        // }
      ],
      tabKey: 'runPredict'
    };
  },
  activated() {
    if (this.$route.query.drillDownTime && this.drillDownTime !== this.$route.query.drillDownTime) {
      this.initQuery();
    }
    this.initTabList();
  },
  methods: {
    initTabList() {
      this.tabList = this.tabList.filter(item =>
        Object.keys(this.buttonCodes).includes(item.tabKey)
      );
    },
    initQuery() {
      let { tabKey, drillDownTime } = this.$route.query;
      this.drillDownTime = drillDownTime;
      if (tabKey) {
        this.tabKey = tabKey;
      }
    },
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
