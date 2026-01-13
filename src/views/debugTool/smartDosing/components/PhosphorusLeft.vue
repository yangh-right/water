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
      <card-box title="水质现状">
        <div class="card-item">
          <in-water v-bind="$attrs"></in-water>
        </div>
        <div class="card-item">
          <phosphorus-process v-bind="$attrs"></phosphorus-process>
        </div>
        <div class="card-item">
          <out-water v-bind="$attrs"></out-water>
        </div>
      </card-box>
    </div>
  </div>
</template>

<script>
import inWater from './inWater';
import outWater from './outWater';
import PhosphorusProcess from './PhosphorusProcess';
import CardBox from '@/components/CardBox';
export default {
  name: 'PhosphorusLeft',
  data() {
    return {};
  },

  components: { CardBox, inWater, outWater, PhosphorusProcess },

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
    /deep/ .card-box__content {
      padding-top: 8px;
    }
    .card-item {
      height: 33.3%;
      /deep/.title {
        margin-top: 0px;
      }
    }
  }
  &__item {
    height: 33.3%;
  }
}
</style>
