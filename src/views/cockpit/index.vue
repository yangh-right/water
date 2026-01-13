<template>
  <div class="page">
    <!-- 加载中 -->
    <w-spin v-if="loading" />
    <!-- 驾驶舱 -->
    <template>
      <!-- 左侧栏 -->
      <Leftbar :class="[isFull ? 'full-screen' : '']" :factoryId="factoryId" />
      <!-- 主内容区域 -->
      <div :class="[isFull ? 'full-main' : '', 'page-main']">
        <!-- 地图组件 -->
        <map-cmp :isFull="isFull" @handleChange="handleChange" />
        <!-- 全屏切换按钮 -->
        <w-icon
          :type="isFull ? 'ic_zoom_in_map' : 'ic_zoom_out_map'"
          class="page-edit"
          @click="handleFull"
        ></w-icon>
      </div>
      <!-- 右侧栏 -->
      <Rightbar :class="[isFull ? 'full-screen' : '']" :factoryId="factoryId" />
    </template>
  </div>
</template>

<script>
export default {
  name: 'Cockpit',
  components: {
    // 异步加载左侧栏组件
    Leftbar: () => import('./models/Leftbar.vue'),
    // 异步加载右侧栏组件
    Rightbar: () => import('./models/Rightbar.vue'),
    // 异步加载地图组件
    MapCmp: () => import('./models/MapCmp.vue')
  },
  mixins: [],
  data() {
    return {
      key: null,
      loading: false, // 加载状态
      draggable: false,
      isFull: false, // 是否全屏
      factoryId: '', // 水厂ID
      modules: []
    };
  },
  computed: {},
  activated() {},
  created() {
    // 初始化字典数据
    this.$store.dispatch('dict/GenerateDictory1', 'outwork');
  },
  methods: {
    // 切换全屏
    handleFull() {
      this.isFull = !this.isFull;
    },
    // 处理水厂ID变化
    handleChange(id) {
      this.factoryId = id;
    }
  }
};
</script>

<style lang="less" scoped>
.page {
  display: flex;
  justify-content: space-between;
  height: 100%;

  &-main {
    margin: 0 12px;
    position: relative;
    flex: 1;
  }
  .full-main {
    margin: 0;
  }

  &-edit {
    position: absolute;
    top: 25px;
    right: 25px;
    z-index: 999;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    cursor: pointer;

    &.active {
      color: @theme;
    }
  }
}

.sidebar {
  flex: 0 0 calc(25% - 6px);
  overflow: auto;
  background-color: var(--bgc4);
  border-radius: 4px;
  box-shadow: 4px 0 16px 0 var(--bsc1);
  padding: 12px;
  box-sizing: border-box;
}
.full-screen {
  padding: 0px;
  flex: 0 0 0px;
}

.wpg-spin {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

:deep(.wpg-empty) {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;

  &-image {
    height: auto;
  }

  &-description {
    color: var(--mft-3-cls);

    .wpg-btn {
      margin-top: 10px;
    }
  }
}
/deep/.map-right-detail.show {
  display: none;
}
/deep/.map-wrapper .map-top-left {
  display: none !important;
}
/deep/.map-wrapper .leaflet-right.leaflet-bottom {
  transform: translateX(0) !important;
}
/deep/.map-left-bottom .pump-detail-control {
  display: none;
}
</style>
