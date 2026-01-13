<template>
  <div class="top-five-wrapper" @click="changeType()">
    <img :src="typeBool ? require('@/assets/images/' + imgFolderName + '/cockpit/icon-rank-top.png') : require('@/assets/images/'+ imgFolderName+ '/cockpit/icon-rank-bottom.png') " alt="">
    <div class="info">最{{typeBool  ? '高': '低'}}</div>
  </div>
</template>

<script>
export default {
  name: 'TopFive',
  data() {
    return {
      typeBool: true
    }
  },
  inject: ['state'],
    computed: {
    imgFolderName() {
      return this.state.theme.includes('-') ? 'default' : this.state.theme;
    }
  },
  methods: {
    changeType() {
      this.typeBool = !this.typeBool;
      this.$emit("changeFiveType", this.typeBool ? 'desc' : 'asc');
    }
  }
};
</script>

<style lang="less" scoped>
.top-five-wrapper{
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  // height: 20px;
  img{
    width: 24px;
  }
  .info{
    font-size: 12px;
    // color: #008184;
    color: var(--supply-color-primary-DEFAULT);
  }
}
</style>
