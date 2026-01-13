<!--
 * @Author: wangyr
 * @Date: 2023-05-29 14:11:36
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-06-06 09:28:34
 * @Description:
-->
<template>
  <div :style="{ left: asideShowLeft ? '0' : '-424px' }" class="cockpit-aside cockpit-aside-left">
    <div class="aside-btn-left" @click="asideShowLeft = !asideShowLeft">
      <w-icon :type="asideShowLeft ? 'ic_chevron_left_more' : 'ic_chevron_right_more'"></w-icon>
    </div>
    <div class="aside-list-box aside-left-box">
      <WaterStatistics class="aside-item" />
      <InWaterQuality class="aside-item" />
      <OutWaterQuailty class="aside-item" />
      <DeviceManage class="aside-item" />
    </div>
  </div>
</template>

<script>
import WaterStatistics from '../components/WaterStatistics.vue';
import InWaterQuality from '../components/InWaterQuality.vue';
import OutWaterQuailty from '../components/OutWaterQuailty.vue';
import DeviceManage from '../components/DeviceManage.vue';

export default {
  name: 'LeftCockpitContent',
  components: {
    WaterStatistics,
    InWaterQuality,
    OutWaterQuailty,
    DeviceManage
  },
  props: {
    taskId: {
      type: String,
      default: ''
    },
    currentTab: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      asideShowLeft: true
    };
  },
  computed: {},
  watch: {},
  methods: {},
  created() {},
  mounted() {}
};
</script>

<style lang="less" scoped>
.cockpit-aside {
  width: 424px;
  height: calc(100vh - 110px);
  position: absolute;
  top: 2px;
  left: 2px;
  bottom: 2px;
  z-index: 100;
  background: rgba(8, 56, 90, 0.33);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  transition: 0.5s;

  .aside-btn-left {
    width: 20px;
    height: 52px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 1px;
    filter: blur(6);
    position: absolute;
    top: 52px;
    right: -22px;
    color: #fff;
    cursor: pointer;
    background: rgba(7, 32, 61, 0.75);
  }

  .aside-list-box {
    width: auto;
    height: 100%;
    display: flex;
    flex-direction: column;

    .aside-item {
      width: 100%;
      height: 25%;
    }
  }
}
</style>
