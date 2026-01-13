<!--
 * @Author: wangyr
 * @Date: 2023-04-20 09:15:15
 * @LastEditors:  Do not edit
 * @LastEditTime: 2024-05-22 11:19:15
 * @Description:
-->
<!--
 * @Author: wangyr
 * @Date: 2023-02-09 09:28:33
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-04-20 10:58:13
 * @Description:
-->
<template>
  <div class="sidebar">
    <h3 class="title">进出水水质水量</h3>
    <div class="chart-container">
      <in-water :factoryId="factoryId"></in-water>
      <out-water :factoryId="factoryId"></out-water>
      <removal-rate :factoryId="factoryId"></removal-rate>
    </div>
  </div>
</template>

<script>
import InWater from '../components/InWater.vue';
import OutWater from '../components/OutWater.vue';
import RemovalRate from '../components/RemovalRate.vue';

export default {
  name: 'Leftbar',
  components: {
    InWater,
    OutWater,
    RemovalRate
  },
  props: {
    factoryId: {
      type: String,
      required: true,
      default: ''
    }
  },
  data() {
    return {
      currentModules: []
    };
  },
  watch: {},
  methods: {}
};
</script>

<style lang="less" scoped>
.sidebar {
  height: 100%;
  background: var(--supply-color-bg-card-DEFAULT);
  .title {
    font-family: PingFangSC-Medium, sans-serif;
    font-weight: 500;
    font-size: 16px;
    color: var(--supply-color-main);
    letter-spacing: 0;
    margin-bottom: 10px;
  }
  .chart-container {
    height: calc(100% - 48px);
  }
}

/deep/ .chart-box {
  height: 33.3%;
  position: relative;
  background: var(--supply-color-bg-card-DEFAULT);
  .chart-title {
    font-family: PingFangSC-Regular, sans-serif;
    font-weight: 400;
    font-size: 14px;
    color: var(--supply-color-main);
    letter-spacing: 0;
  }
  .point-btn {
    margin-right: 8px;
  }
  .chart-btns {
    margin-top: 8px;
  }
  .chart-wrapper {
    width: 100%;
    height: calc(100% - 60px);
  }
  .wpg-btn {
    border-color: var(--supply-color-bg-card-DEFAULT) !important;
    box-shadow: none;
  }
}
</style>
