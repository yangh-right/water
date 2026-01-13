<!--
 * @Author: duyibo
 * @Date: 2024-04-24 13:13:26
 * @LastEditors: Do not edit
 * @LastEditTime: 2024-04-24 17:28:08
 * @Description:
-->
<template>
  <div id="heatmap" class="heatmap"></div>
</template>
<script>
import Heatmap from 'heatmap.js';
export default {
  name: 'Heatmap',
  props: {
    userDefined: {
      type: Boolean,
      default: false
    },
    heatmapData: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      maxPowerPv: 100
    };
  },
  watch: {
    heatmapData: {
      handler(newVal, oldVal) {
        this.maxPowerPv = Math.max(...newVal.map(item => Math.ceil(item.value)));
        this.$nextTick(() => {
          this.init();
        });
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    init() {
      var heatmapInstance = Heatmap.create({
        container: document.getElementById('heatmap'),
        gradient: this.userDefined
          ? {
              0: '#FA1201',
              0.25: '#F96E12',
              0.5: '#FBAA28',
              0.75: '#ABFE41',
              1.0: '#00D097'
            }
          : null
      });

      var data = {
        max: this.maxPowerPv,
        data: this.heatmapData
      };
      // 因为data是一组数据,web切图报价所以直接setData
      heatmapInstance.setData(data);
    }
  }
};
</script>
<style lang="less" scoped>
.heatmap {
  width: 100%;
  height: 100%;
}
</style>
