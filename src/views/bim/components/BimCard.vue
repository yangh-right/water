<!--
 * @Author: wangyr
 * @Date: 2023-05-30 13:40:08
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-05-30 15:01:55
 * @Description:
-->
<template>
  <div class="card-box">
    <div class="card-title">
      <h3>{{ cardTitle }}</h3>
    </div>
    <div class="card-content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BimCard',
  props: {
    cardTitle: {
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
  height: 100%;
  position: relative;
  .card-title {
    width: 100%;
    height: 37px;
    background: url('~@/assets/images//default/card-title.png') no-repeat;
    background-size: 100% 100%;
    h3 {
      margin: 0;
      font-weight: 700;
      font-family: Italic;
      font-size: 20px;
      text-shadow: 0 0 5px #4bb4e580;
      text-indent: 44px;
      background-image: linear-gradient(to bottom, #66ddfd, #ecf9ff, #effcfe);
      -webkit-background-clip: text;
      color: transparent;
    }
  }
  .card-content {
    width: 100%;
    height: calc(100% - 37px);
    position: relative;
  }
}
</style>
