<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2024-05-07 09:53:17
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2024-06-05 16:27:37
 * @Description:
-->
<template>
  <div class="card">
    <div class="card-module">
      <div v-for="(item, index) in moduleList" :key="index" class="card__item">
        <component v-bind="$attrs" :is="item.component" @suggestData="suggestData"></component>
      </div>
    </div>
  </div>
</template>

<script>
import effectEvaluation from './effectEvaluation';
import suggestPredict from './suggestPredict';
import carbonDosage from './carbonDosage';
export default {
  data() {
    return {
      moduleList: [
        { component: carbonDosage },
        { component: suggestPredict },
        { component: effectEvaluation }
      ]
    };
  },
  methods: {
    suggestData(data = []){
      this.$emit('suggestData', data)
    },
  }
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
