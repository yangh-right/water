<template>
  <div class="locationSearch" @click.stop>
    <div class="locationSearch-main">
      <w-input
        v-model="keyword"
        placeholder="搜索地点"
        allow-clear
        @keydown.enter="handleSugSelect"
        @input="handleSearch"
        @focus="handleSearch"
      />
      <w-button type="primary" @click="handleSearch"><w-icon type="ic_search"/></w-button>
    </div>
    <w-list :data-source="sugList" v-show="sugVisible">
      <w-list-item slot="renderItem" slot-scope="item" @click="handleSugClick(item)">
        <w-icon type="ic_search" />{{ item.name }}<span>{{ item.address }}</span>
      </w-list-item>
    </w-list>
  </div>
</template>

<script>
import { getMapSearchSuggest as apiGetMapSearchSuggest } from '@/api/index.js';

export default {
  name: 'index',
  inheritAttrs: false,
  props: {
    mapType: String,
    zoom: [String, Number]
  },
  data() {
    return {
      keyword: '', // 搜索关键词
      sugList: [], // 建议列表
      sugVisible: false // 下拉框显示控制
    };
  },
  mounted() {
    this.initEvent();
  },
  methods: {
    /**
     * 初始化事件
     */
    initEvent() {
      const handleClick = () => (this.sugVisible = false);
      document.addEventListener('click', handleClick, false);
      this.$on('hook:beforeDestroy', () => {
        document.removeEventListener('click', handleClick, false);
      });
    },
    /**
     * 地址搜索
     * @returns {Promise<void>}
     */
    async handleSearch() {
      const value = this.keyword;
      if (value) {
        let params = {
          // keyWord: value,
          // code: '156000000', // 行政区划码 中国
          // level: this.zoom
          pageNum: 0,
          pageSize: 20,
          queryKey: value,
          to: this.mapType
        };
        const ret = await apiGetMapSearchSuggest(params);
        this.sugList = ret ? Object.freeze(ret) : [];
        this.sugVisible = true;
      } else {
        this.sugList = [];
        this.sugVisible = false;
      }
    },
    /**
     * 处理建议点击
     * @param record
     */
    async handleSugClick(record) {
      let { location, address, name } = record;
      this.keyword = name;
      this.sugVisible = false;
      let [lng, lat] = location[0]?.coords || [];
      this.$emit('change', { lng, lat }, this.keyword);
    },
    /**
     * 快速选择第一个搜索
     */
    handleSugSelect() {
      if (this.sugList.length) {
        this.handleSugClick(this.sugList[0]);
      }
    },
    /**
     * 重置搜索
     */
    reset() {
      this.keyword = '';
      this.sugVisible = false;
    }
  }
};
</script>

<style scoped lang="less">
.locationSearch {
  z-index: 1000;
  position: absolute;
  top: 20px;
  left: 20px;

  &-main {
    display: flex;
    width: 208px;
    height: 32px;
    box-shadow: 0 6px 8px 0 rgba(0, 0, 0, 0.12);

    /deep/ .wpg-input {
      height: 100%;
      padding: 0 8px;
      font-size: 12px;
      border: 1px solid transparent;
      border-radius: 4px 0 0 4px;

      &:focus {
        box-shadow: none;
        // border-color: #4285F4;
        border-color: var(--supply-color-primary-DEFAULT);
      }
    }

    /deep/ .wpg-btn {
      flex: none;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 100%;
      padding: 0;
      font-size: 18px;
      border-radius: 0 4px 4px 0;

      i {
        margin-left: 0;
      }
    }
  }

  /deep/ .wpg-list {
    margin-top: 1px;
    font-size: 12px;
    border-radius: 4px;
    box-shadow: 0 6px 8px 0 rgba(0, 0, 0, 0.12);
    // background-color: #fff;
    background-color: var(--supply-color-bg-card-DEFAULT);

    &-item {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      padding: 7px 8px;
      // color: #666;
      color: var(--supply-color-secondary);
      cursor: pointer;

      &:hover {
        // background-color: #ebebeb;
        background-color: var(--supply-color-bg-select-active);
      }

      i {
        margin-right: 4px;
        font-size: 14px;
      }

      span {
        margin-left: 10px;
        // color: #c0c0c0;
        color: var(--supply-color-icon);
      }
    }
  }
}
</style>
