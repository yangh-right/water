<!--
 * @Author: wangyr
 * @Date: 2023-05-30 16:43:53
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-05-31 16:01:36
 * @Description:
-->
<template>
  <div class="model">
    <div class="close" @click="close"></div>
    <div class="content">
      <div class="img"></div>
      <div class="text">
        作为杭州市政府响应浙江省推进"五水共治"、建设美丽浙江的重点工程，城北污水厂在完成区域污水处理任务的同时，响应杭州市整体发展策略，打造成一座环境和谐、绿色低碳、智能高效的污水厂，增强对环境友好和生态共融的贡献。污水厂采用全地下结构设计，使厂区与周边环境完美融合，在保障运行管理和安全的基础上，合理利用污水处理设施的上部空间，达到节约土地资源的目的。
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Introduce',
  data() {
    return {};
  },
  computed: {},
  watch: {},
  methods: {
    close() {
      this.$emit('close');
    }
  },
  created() {},
  mounted() {}
};
</script>

<style lang="less" scoped>
.model {
  width: 856px;
  height: 393px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 100;
  transition: 0.5s;
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  background: url('~@/assets/images/default/smartPark/model_bg.png') no-repeat;
  .close {
    position: absolute;
    right: 20px;
    top: 6px;
    width: 32px;
    height: 32px;
    background: url('~@/assets/images/default/smartPark/close.png') no-repeat;
  }
  .content {
    margin: 87px 34.5px;
    display: flex;
    align-items: center;
    justify-content: space-around;
    .img {
      width: 310px;
      height: 256px;
      background: url('~@/assets/images/default/smartPark/pic.png') no-repeat;
    }
    .text {
      font-family: PingFangSC-Regular, sans-serif;
      font-weight: 400;
      font-size: 20px;
      color: #d8f0ff;
      letter-spacing: 0;
      line-height: 32px;
      width: 447px;
      height: 256px;
    }
  }
}
</style>
