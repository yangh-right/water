<!--
 * @Author: wangyr
 * @Date: 2023-05-30 13:40:08
 * @LastEditors: wangyr
 * @LastEditTime: 2024-05-15 09:49:26
 * @Description:
-->
<template>
  <div class="card-box">
    <div class="card-title">
      <h3>
        {{ cardTitle }}
        <!-- <w-tooltip placement="topLeft" v-if="title.length">
          <template slot="title">
            {{ title }}
          </template>
          <img src="@/assets/cockpit/ic_help.png" alt="" style="width: 20px; cursor: pointer;" />
        </w-tooltip> -->
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
    height: 26px;
    line-height: 26px;
    background: url('~@/assets/images/default/integrated/ck-mtitle.png') no-repeat center center;
    background-size: 100% 100%;
    padding-left: 34px;
    box-sizing: border-box;
    h3 {
      font-family: PangMenZhengDao, sans-serif;
      font-weight: 500;
      font-size: 18px;
      background-image: linear-gradient(to bottom, #ffffff, #ffffff, #3b91ff, #3b91ff);
      -webkit-background-clip: text;
      color: transparent;
      letter-spacing: 0;
      margin: 0;
    }
  }
  .card-content {
    width: 100%;
    height: calc(100% - 26px);
    position: relative;
  }
}
</style>
