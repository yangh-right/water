<!--
 * @Date: 2021-08-18 10:25:48
 * @Version: 1.0.0
 * @Author: chenhengling
 * @Description:
 * @LastEditTime: 2021-11-09 14:20:01
 * @LastEditors: limz
-->
<template>
  <div class="clusterIcon">
    <div class="clusterIcon-num">
      <span>{{ counts }}</span>
    </div>
    <div v-if="alarmCounts" class="clusterIcon-icon">
      <span>{{ alarmCounts }}</span>
    </div>
  </div>
</template>
<script>
export default {
  name: 'ClusterIcon',
  props: {
    cluster: Object,
    state: Object
  },
  data() {
    return {
      counts: 0, // 总数
      alarmCounts: 0 // 报警数量
    };
  },
  computed: {
    // 是否报警状态
    isAlarm() {
      return this.alarmCounts > 0;
    }
  },
  created() {
    this.initData();
  },
  methods: {
    /**
     * @description: 初始化数据
     * @param {*}
     * @return {*}
     */
    initData() {
      const markers = this.cluster.getAllChildMarkers();
      this.counts = markers.length;
      // 报警和离线都显示为报警
      this.alarmCounts = markers.reduce(
        (a, b) => (!b.vm.site.isOff && b.vm.site.isAlarm ? a + 1 : a), //  || b.vm.site.isOff
        0
      );
    }
  }
};
</script>
<style scoped lang="less">
.clusterIcon {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #fff;
  &-num {
    min-width: 28px;
    height: 28px;
    font-size: 14px;
    line-height: 24px;
    text-align: center;
    border-radius: 14px;
    padding: 0 6px;
    background-color: var(--supply-color-primary-DEFAULT);
    border: 2px solid #ffffff;
    box-shadow: 0 2px 4px 1px rgba(2, 27, 27, 0.2);
  }

  &-icon {
    width: 16px;
    height: 18px;
    line-height: 18px;
    text-align: center;
    background-image: url('../../../assets/images/default/icons/alarm.png');
    background-size: cover;
    position: absolute;
    top: -12px;
    font-size: 12px;
  }
}
</style>
