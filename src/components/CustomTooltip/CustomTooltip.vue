<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2022-06-28 15:40:25
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2022-07-11 15:40:14
 * @Description: 
-->
<template>
  <div :id="'doubt-box'+type">
    <w-tooltip :placement="type ? 'bottom' : 'top'" :getPopupContainer="getPopupContainer">
      <template #title>
        <span class="doubt__text">{{ text }}</span>
      </template>
      <slot></slot>
    </w-tooltip>
  </div>
</template>

<script>
export default {
  name: 'CustomTooltip',
  props: {
    text: { default: '' },
    type: { type: Number, default: 1 }, //0:注释 1: title
  },
  data() {
    return {
    };
  },

  components: {},

  computed: {
    
  },
  watch: {
    
  },
  mounted() {},

  methods: {
    getPopupContainer() {
      return document.querySelector('#doubt-box' + this.type);
    }
  }
};
</script>
<style lang="less">
#doubt-box0 .wpg-tooltip {
  .wpg-tooltip-arrow::before {
    display: none;
  }
  .wpg-tooltip-inner {
    box-shadow: none;
    background: rgba(0,0,0,0.55);
    border-radius: 2px;
  }
  .doubt__text {
    font-weight: 400;
    font-size: 12px;
    color: #ffffff;
    line-height: 16px;
  }
}
#doubt-box1 .wpg-tooltip {
  .wpg-tooltip-arrow::before {
    background-color: rgba(0, 0, 0, 0.55);
  }
  .wpg-tooltip-inner {
    background-color: rgba(0, 0, 0, 0.55);
    box-shadow: 0 6px 16px -8px rgba(0,0,0,0.08), 0 9px 28px 0 rgba(0,0,0,0.06), 0 12px 48px 16px rgba(0,0,0,0.04);
    border-radius: 0;
  }
  .doubt__text {
    font-weight: 400;
    font-size: 12px;
    color: #ffffff;
    line-height: 16px;
  }
}
</style>

