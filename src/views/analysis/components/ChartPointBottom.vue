<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2024-05-07 09:53:17
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2024-05-11 15:30:34
 * @Description: 
-->
<template>
  <div class="point">
    <div class="card card0">
      <card-box title="等待填充">
        <div class="supply-w-full supply-h-full">
        </div>
      </card-box>
    </div>
    <div class="card card1">
      <card-box title="等待填充">
        <div class="supply-w-full supply-h-full">
        </div>
      </card-box>
    </div>
  </div>
</template>

<script>
import CardBox from '@/components/CardBox';
export default {
  data() {
    return {};
  },

  components: { CardBox, LineChart: () => import('@/components/CardBox/chartBox.vue') },

  computed: {},

  mounted() {},

  methods: {}
};
</script>

<style lang="less" scoped>
.point {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: space-between;
  .card {
    height: 100%;
    width: calc(50% - 6px);
  }
}
</style>
