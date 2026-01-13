<!--
 * @Author: wangyr
 * @Date: 2023-05-30 13:40:08
 * @LastEditors:  Do not edit
 * @LastEditTime: 2024-05-09 11:55:28
 * @Description:
-->
<template>
  <div class="card-box">
    <div class="card-title">
      <h3>
        {{ cardTitle }}
        <w-tooltip placement="topLeft" v-if="title.length">
          <template slot="title">
            {{ title }}
          </template>
          <img src="@/assets/cockpit/ic_help.png" alt="" style="width: 20px; cursor: pointer;" />
        </w-tooltip>
      </h3>
    </div>
    <div class="card-content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CockpitCard',
  props: {
    cardTitle: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    }
  },
  components: {},
  data() {
    return {};
  },
  computed: {},
  watch: {},
  methods: {},
  created() {},
  mounted() {}
};
</script>

<style lang="less" scoped>
.card-box {
  width: 100%;
  position: relative;
  .card-title {
    width: 100%;
    height: 20px;
    h3 {
      font-family: PingFangSC-Medium, sans-serif;
      font-weight: 500;
      font-size: 14px;
      color: var(--supply-color-main);
      letter-spacing: 0;
      margin: 0;
    }
  }
  .card-content {
    width: 100%;
    height: calc(100% - 20px);
    position: relative;
    // overflow: auto;
  }
}
</style>
