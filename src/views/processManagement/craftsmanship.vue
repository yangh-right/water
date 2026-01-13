<!--
 * @Author: wangyr
 * @Date: 2024-04-08 10:55:26
 * @LastEditors: wangyr
 * @LastEditTime: 2024-10-17 13:29:14
 * @Description:
-->
<template>
  <div class="page">
    <div v-if="tabList.length > 0" class="along-head">
      <w-tabs class="tab-wrap" size="large" v-model="tab">
        <!-- <w-tab-pane v-if="buttonCodes['overviewFlow']" key="1" tab="工艺总览">
          <div class="tab-content">
            <overview-flow
              :waterPlantId="waterPlantId"
              svgType="intelligent_technology"
            ></overview-flow>
          </div>
        </w-tab-pane>
        <w-tab-pane v-if="buttonCodes['biochemicalPool']" key="biochemical_pool_n1" tab="生化池">
          <div class="tab-content">
            <overview-flow :waterPlantId="waterPlantId" svgType="aeration"></overview-flow>
          </div>
        </w-tab-pane>
        <w-tab-pane v-if="buttonCodes['medicationAdd']" key="medication_add" tab="加药间">
          <div class="tab-content">
            <overview-flow :waterPlantId="waterPlantId" svgType="medication_add"></overview-flow>
          </div>
        </w-tab-pane> -->
        <w-tab-pane v-for="item in tabList" :key="item.dictValue" :tab="item.dictName">
          <div class="tab-content">
            <overview-flow :waterPlantId="waterPlantId" :svgType="item.dictValue"></overview-flow>
          </div>
        </w-tab-pane>
      </w-tabs>
      <div class="search">
        选择污水厂：
        <FactorySelect
          style="max-width:260px"
          autoSelect
          @change="factoryChange"
          v-model="waterPlantId"
        ></FactorySelect>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { sysDictListByCode } from '@/api/manage';
import FactorySelect from '@/components/factory-select/index.vue';
import OverviewFlow from './components/OverviewFlow.vue';
import secondaryFlow from './components/secondaryFlow.vue';
import filterFlow from './components/filterFlow.vue';
import BiologyFlow from './components/BiologyFlow.vue';
import KeepCalendar from './components/KeepCalendar.vue';
import DeviceRun from './components/DeviceRun.vue';
import ExceptionAnalysis from './components/ExceptionAnalysis.vue';

export default {
  name: 'craftsmanship',
  components: {
    OverviewFlow,
    secondaryFlow,
    filterFlow,
    BiologyFlow,
    DeviceRun,
    FactorySelect,
    KeepCalendar,
    ExceptionAnalysis
  },
  data() {
    return {
      tab: '',
      hideRightControl: false,
      placement: 'right',
      waterPlantId: '',
      graphTypeList: [],
      graphTypeName: {}
    };
  },
  computed: {
    ...mapState('setting', ['buttonCodes']),
    tabList() {
      let list = this.graphTypeList.filter(item => this.buttonCodes[item.dictValue]);
      this.tab = list[0]?.dictValue || '';
      return list;
    }
  },
  watch: {},
  methods: {
    async sysDictListByCode(code, data) {
      const res = await sysDictListByCode(code);
      this[`${data}List`] = res.resultData.map(item => {
        return {
          ...item,
          label: item.dictName,
          value: item.dictValue
        };
      });
      this[`${data}Name`] = this[`${data}List`].reduce((acc, item) => {
        acc[item.dictValue] = item.dictName;
        return acc;
      }, {});
    },
    handleRightControl() {
      this.hideRightControl = !this.hideRightControl;
    },
    onClose() {
      this.hideRightControl = false;
    },
    factoryChange() {}
  },
  mounted() {
    this.sysDictListByCode('graphType', 'graphType');
  }
};
</script>

<style lang="less" scoped>
.page {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;

  .along-head {
    position: relative;
    height: 100%;
    /deep/ .tab-wrap {
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
    }
    .search {
      position: absolute;
      right: 7px;
      top: 7px;
    }
  }
  /deep/.wpg-tabs-nav .wpg-tabs-tab {
    padding: 15px 10px;
    font-size: 14px;
    margin: 0 4px 0 0 !important;
  }
  /deep/.wpg-tabs-content {
    height: calc(100% - 62px);
    .wpg-tabs-tabpane {
      height: 100%;
    }
  }
  .tab-content {
    display: flex;
    width: 100%;
    height: 100%;
    margin-top: 12px;
    position: relative;

    .map-top-right {
      position: absolute;
      top: 16px;
      right: 16px;
      z-index: 1000;
      width: 36px;
      height: 36px;

      .map-right-control {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        border-radius: 4px;
      }
    }
  }
  .card-box {
    width: 100%;
    position: relative;
  }
  /deep/.wpg-drawer-body {
    padding: 12px !important;
  }
  /deep/.wpg-drawer-wrapper-body {
    overflow: hidden;
  }
}
.page-item {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 12px;
}
/deep/.wpg-drawer-mask {
  background-color: rgba(0, 0, 0, 0);
}
</style>
