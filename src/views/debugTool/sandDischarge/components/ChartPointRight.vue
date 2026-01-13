<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2024-05-07 09:53:17
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2024-06-05 14:05:12
 * @Description: 
-->
<template>
  <div class="card">
    <div v-for="(item, index) in moduleList" :key="index" class="card__item">
      <component v-bind="$attrs" :is="item.component"></component>
    </div>
  </div>
</template>

<script>
import waterQuality from './waterQuality';
import sandBucketClear from './sandBucketClear';
import sandPredict from './sandPredict';

export default {
  data() {
    return {
      moduleList: [
        { component: waterQuality },
        { component: sandBucketClear },
        { component: sandPredict }
      ]
    };
  },

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
  flex-wrap: wrap;
  justify-content: space-between;
  &__item {
    width: 100%;
    height: 33.3%;
  }
}
</style>
