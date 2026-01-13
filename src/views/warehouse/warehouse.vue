<template>
  <div class="container">
    <div class="box">
      <div v-for="item in menuList" :key="item.id" class="set-box" @click="ToPage(item.path)">
        <div :class="['lf', 'iconfont', item.icon]"></div>
        <div class="rt">
          <h1 class="wfc1 wfs16 box-title" :changeColor="{ color: '#008184' }">{{ item.name }}</h1>
          <p class="wfc3 wfs14">{{ item.menuRemarks }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
  name: 'warehouse',
  data() {
    return {
      menuList: []
    };
  },
  computed: {
    ...mapGetters('setting', ['menuTreeList'])
  },
  mounted() {
    this.dealMenuList();
  },
  methods: {
    ToPage(path) {
      this.$router.push(path);
    },
    dealMenuList() {
      this.menuTreeList.forEach(item => {
        if (item.buttonCode === 'warehouse') {
          this.menuList = item.children;
        }
      });
    }
  }
};
</script>

<style scoped lang="less">
.container {
  width: 1278px;
  height: 678px;
  background-color: var(--supply-bg-bg-card-DEFAULT);
  font-family: PingFangSC-Regular, sans-serif;
  margin: 0 auto;
}
.box {
  margin: 0px 1px;
  background-color: var(--supply-bg-bg-card-DEFAULT);
}
.set-box {
  display: inline-block;
  width: 400px;
  height: 140px;
  margin-left: 19px;
  margin-top: 20px;
  border: 1px solid var(--supply-color-border-DEFAULT);
  box-shadow: 0 1px 6px -1px rgba(235, 240, 240, 0.72);
  vertical-align: top;
  cursor: pointer;
}
.set-box:hover {
  box-shadow: 0 12px 48px 0 rgba(235, 240, 240, 0.48), 0 6px 16px 0 rgba(235, 240, 240, 0.48),
    0 9px 28px -1px rgba(228, 241, 241, 0.83);
  .box-title {
    color: var(--color-primary);
  }
}
.lf {
  display: inline-block;
  vertical-align: top;
  margin: 34px 30px;
  height: 32px;
  width: 32px;
  font-size: 30px;
  color: var(--color-primary);
}
.rt {
  display: inline-block;
  vertical-align: top;
  margin-top: 34px;
  margin-left: -19px;
}
.rt h1 {
  width: 293px;
  height: 18px;
  font-family: PingFangSC-Medium, sans-serif;
  /* font-size: 16px; */
  /* color: #323333; */
  text-align: left;
  line-height: 18px;
}
.rt p {
  width: 293px;
  height: 44px;
  text-align: left;
  margin-top: 10px;
}
</style>
