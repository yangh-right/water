<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2024-05-07 09:53:17
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2024-05-11 15:30:34
 * @Description: 
-->
<template>
  <div class="card">
    <div class="card-module card-module-left">
      <water-quality v-bind="$attrs"></water-quality>
    </div>
  </div>
</template>

<script>
import waterQuality from './waterQuality';
export default {
  data() {
    return {};
  },

  components: { waterQuality },

  computed: {},

  mounted() {},

  methods: {}
};
</script>
<style lang="less" scoped>
.card {
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;
  display: flex;
  justify-content: space-between;
  .card-module {
    width: 100%;
    &.card-module-left {
      height: 100%;
    }
  }
  &__item {
    height: 33.3%;
  }
}
</style>
