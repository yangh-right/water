<template>
  <div class="messageList wbgc-card">
    <w-tabs :activeKey="pageKey" tab-position="left" @tabClick="changeTab">
      <w-tab-pane v-for="tab in tabList" :key="tab.key" :tab="tab.name">
        <div v-if="pageKey === tab.key" class="content-wrapper wbgc-card">
          <keep-alive>
            <component
              :is="currentView"
              :ref="pageKey"
              :currentName="currentName"
              :parentOrigin="parentOrigin"
            ></component>
          </keep-alive>
        </div>
      </w-tab-pane>
    </w-tabs>
  </div>
</template>
<script>
export default {
  name: 'Index',
  data() {
    return {
      parentOrigin: '',
      tabList: [
        // tab配置
        {
          key: 'MapSetting',
          name: '地图中心点设置'
        }
        // {
        //   key: 'ScreenSetting',
        //   name: '大屏配置'
        // }
      ],
      pageKey: 'MapSetting',
      currentView: () => import('./models/MapSetting') // 当前 tab
    };
  },
  computed: {
    currentName() {
      return this.tabList.find(item => item.key === this.pageKey).name;
    }
  },
  watch: {
    pageKey(val) {
      this.currentView = () => import(`./models/${val}`);
    }
  },
  created() {},
  activated() {
    let { type } = this.$route.query;
    if (type) {
      this.pageKey = type;
    }
  },

  mounted() {
    if (this.$route.query.parent) {
      this.parentOrigin = this.$route.query.parent;
    }
  },

  methods: {
    changeTab(val) {
      this.pageKey = val;
    }
  }
};
</script>

<style lang="less" scoped>
.messageList {
  height: 100%;
  width: 100%;
  padding: 10px;
  margin: auto;

  /deep/ .wpg-tabs {
    padding: 12px 12px 12px 0;
    border-radius: 4px;
    background: var(--supply-color-bg-card-DEFAULT);
    height: 100%;

    &-bar {
      border: none;
    }

    &-content {
      height: 100%;
      overflow-y: auto;
    }
  }

  &-title {
    font-size: 16px;
    padding-left: 20px;
    font-family: 'PingFangSC-Semibold', 'PingFang SC Semibold', 'PingFang SC', sans-serif;
    font-weight: 650;
    line-height: 40px;
  }
  /deep/ .wpg-tabs .wpg-tabs-left-bar {
    width: 220px;
    .wpg-tabs-tab {
      text-align: left;
    }
  }
}
</style>
