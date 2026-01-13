<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2023-07-05 11:30:03
 * @LastEditors: wangyr
 * @LastEditTime: 2024-05-10 16:41:15
 * @Description:
-->
<template>
  <div class="along">
    <div class="along-head supply-flex supply-items-center">
      <w-tabs class="tab-wrap supply-w-full" size="large" v-model="tab">
        <w-tab-pane key="1" tab="去除率分析">
          <biosystem :waterPlantId="waterPlantId"></biosystem>
        </w-tab-pane>
        <w-tab-pane key="2" tab="生化系统分析">
          <removal-rate :waterPlantId="waterPlantId"></removal-rate>
        </w-tab-pane>
      </w-tabs>
    </div>
    <div v-show="false" class="debugTool-head">
      选择污水厂：
      <FactorySelect style="width: 220px" autoSelect v-model="waterPlantId"></FactorySelect>
    </div>
    <div v-if="false" class="note-wrap">
      <process-monitor title="过程监控" :waterPlantId="waterPlantId"></process-monitor>
    </div>
  </div>
</template>

<script>
import FactorySelect from '@/components/factory-select/index.vue';
import RemovalRate from './components/RemovalRate.vue';
import ProcessMonitor from './components/ProcessMonitor.vue';
import Biosystem from './components/Biosystem/index.vue';

export default {
  name: 'allowWay',
  components: {
    FactorySelect,
    RemovalRate,
    ProcessMonitor,
    Biosystem
  },
  data() {
    return {
      waterPlantId: '',
      tab: '1'
    };
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {},
  methods: {}
};
</script>

<style lang="less" scoped>
.along {
  height: 100%;
  overflow: auto;
  position: relative;

  .page-row {
    display: flex;
    justify-content: space-between;
    width: 100%;
    height: 240px;
    margin-bottom: 10px;
  }
  &-head {
    height: 100%;
    position: relative;
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
      .wpg-tabs-content {
        height: calc(100% - 50px);
      }
    }
  }
  .debugTool-head {
    display: flex;
    align-items: center;
    padding: 0 12px;
    position: absolute;
    right: 700px;
    top: 7px;
  }
  .note-wrap {
    position: absolute;
    top: 7px;
    right: 17px;
    width: 670px;
    height: 36px;
    background: #f0f5ff;
    color: var(--supply-color-primary-DEFAULT);
    border-radius: 4px;
    overflow: hidden;
  }
}
.page-item {
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: 240px;
}
</style>
