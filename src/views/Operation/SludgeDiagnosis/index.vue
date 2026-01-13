<!--
 * @Author: wangyr
 * @Date: 2023-04-18 15:56:49
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-08-01 10:30:10
 * @Description:
-->
<template>
  <div class="main-page">
    <div class="page-content">
      <left-info class="left" @handleDevice="handleDevice"></left-info>
      <right-info class="right" :deviceId="deviceId" @showPic="handleShowPic"></right-info>
    </div>
    <!-- 大图弹框 -->
    <w-modal
      :title="null"
      :visible="showPic"
      :footer="null"
      @cancel="showPic = false"
      width="80%"
      centered
    >
      <img class="pic" :src="imgUrl" alt="" srcset="" />
    </w-modal>
  </div>
</template>
<script>
import LeftInfo from './components/LeftInfo.vue';
import RightInfo from './components/RightInfo.vue';
export default {
  name: 'SludgeDiagnosis',
  components: { LeftInfo, RightInfo },
  data() {
    return {
      imgUrl: '',
      showPic: false,
      deviceId: ''
    };
  },
  methods: {
    handleShowPic(url) {
      this.imgUrl = url;
      this.showPic = true;
    },
    handleDevice(val) {
      this.deviceId = val;
    }
  }
};
</script>
<style lang="less" scoped>
.main-page {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  .page-content {
    flex: 1;
    display: flex;
    overflow-y: auto;
    .left {
      width: calc(100% - 575px);
    }
    .right {
      flex: 0 0 575px;
    }
  }
}
.pic {
  width: 100%;
  height: auto;
}
</style>
