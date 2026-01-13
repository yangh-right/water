<!--
 * @Author: wangyr
 * @Date: 2023-05-29 16:29:28
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-06-06 09:38:27
 * @Description:
-->
<template>
  <div
    :style="{ right: asideShowRight ? '0' : '-424px' }"
    class="cockpit-aside cockpit-aside-right"
  >
    <div class="aside-btn-right" @click="asideShowRight = !asideShowRight">
      <w-icon :type="asideShowRight ? 'ic_chevron_right_more' : 'ic_chevron_left_more'"></w-icon>
    </div>
    <div class="aside-list-box aside-left-box">
      <PowerAnalysis class="aside-item" />
      <MedicineAnalysis class="aside-item" />
      <SludgeCount class="aside-item" />
      <RealAlarm class="aside-item" />
    </div>
  </div>
</template>

<script>
import PowerAnalysis from '../components/PowerAnalysis.vue';
import MedicineAnalysis from '../components/MedicineAnalysis.vue';
import SludgeCount from '../components/SludgeCount.vue';
import RealAlarm from '../components/RealAlarm.vue';
export default {
  name: 'RightCockpitContent',
  components: {
    PowerAnalysis,
    MedicineAnalysis,
    SludgeCount,
    RealAlarm
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
      asideShowRight: true
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
  right: 2px;
  bottom: 2px;
  z-index: 100;
  transition: 0.5s;
  background: rgba(8, 56, 90, 0.33);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);

  .aside-btn-right {
    width: 20px;
    height: 52px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 1px;
    filter: blur(6);
    position: absolute;
    top: 52px;
    left: -22px;
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
