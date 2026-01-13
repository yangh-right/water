<template>
  <div class="container">
    <div class="box">
      <div
        v-for="item in menuList"
        :key="item.description"
        class="set-box"
        @click="ToPage(item.path)"
      >
        <div :class="['lf', 'iconfont', item.icon]"></div>
        <div class="rt">
          <h1
            class="supply-text-main supply-text-base box-title"
            :changeColor="{ color: '#008184' }"
          >
            {{ item.name }}
          </h1>
          <p class="supply-text-third supply-text-sm">{{ item.menuRemarks }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
export default {
  name: 'exampleCenter',
  data() {
    return {
      menuList: []
    };
  },
  computed: {
    ...mapGetters('setting', ['menuTreeList']),
    ...mapState('configure', ['hideTank'])
  },
  mounted() {
    this.dealMenuList();
  },
  methods: {
    ToPage(path) {
      this.drillDown(path);
    },
    dealMenuList() {
      this.menuTreeList.forEach(item => {
        if (item.buttonCode === 'devOps') {
          if (this.hideTank) {
            this.menuList = item.children.filter(x => x.path !== '/example/deviceArchive');
          } else {
            this.menuList = item.children;
          }
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
  background-color: #ffffff;
  margin: 0 auto;
}
.box {
  margin: 0px 1px;
  background-color: #ffffff;
}
.set-box {
  display: inline-block;
  width: 400px;
  height: 140px;
  margin-left: 19px;
  margin-top: 20px;
  border: 1px solid #f2f5f5;
  box-shadow: 0 1px 6px -1px rgba(235, 240, 240, 0.72);
  vertical-align: top;
  cursor: pointer;
}
.set-box:hover {
  box-shadow: 0 12px 48px 0 rgba(235, 240, 240, 0.48), 0 6px 16px 0 rgba(235, 240, 240, 0.48),
    0 9px 28px -1px rgba(228, 241, 241, 0.83);
  .box-title {
    color: #008184;
  }
}
.lf {
  display: inline-block;
  vertical-align: top;
  margin: 34px 30px;
  height: 32px;
  width: 32px;
  font-size: 30px;
  color: #008184;
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
  text-align: left;
  line-height: 18px;
}
.rt p {
  width: 293px;
  height: 44px;
  font-family: PingFangSC-Regular, sans-serif;
  text-align: left;
  margin-top: 10px;
}
</style>
