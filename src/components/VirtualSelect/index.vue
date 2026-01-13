<template>
  <div class="virtual-select-container">
    <w-select
      v-model="localValue"
      :allowClear="allowClear"
      :disabled="disabled"
      :mode="mode"
      :placeholder="placeholder"
      :size="size"
      :filterOption="false"
      :showSearch="showSearch"
      :dropdownMatchSelectWidth="dropdownMatchSelectWidth"
      :maxTagTextLength="maxTagTextLength"
      :maxTagPlaceholder="maxTagPlaceholder"
      :maxTagCount="maxTagCount"
      @change="handleChange"
      @blur="handleBlur"
      @focus="handleFocus"
      @search="handleSearch"
      @dropdownVisibleChange="handleDropdownVisibleChange"
      @popupScroll="handleScroll"
    >
      <w-select-option
        v-for="item in visibleOptions"
        :key="item.value"
        :value="item.value"
        :disabled="item.disabled"
      >
        {{ item.label }}
      </w-select-option>
    </w-select>
  </div>
</template>

<script>
import { debounce } from 'lodash-es';
export default {
  name: 'VirtualSelect',
  components: {},
  props: {
    value: {
      type: [String, Number, Array],
      default: undefined
    },
    allowClear: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    mode: {
      type: String,
      default: 'default',
      validator: value => ['default', 'multiple', 'tags'].includes(value)
    },
    placeholder: {
      type: String,
      default: '请选择'
    },
    maxTagTextLength: {
      type: Number,
      default: 10
    },
    maxTagPlaceholder: {
      type: String,
      default: '...'
    },
    maxTagCount: {
      type: Number,
      default: 3
    },
    size: {
      type: String,
      default: 'default',
      validator: value => ['large', 'default', 'small'].includes(value)
    },
    options: {
      type: Array,
      default: () => [],
      validator: value => {
        return value.every(item => {
          return item.hasOwnProperty('value') && item.hasOwnProperty('label');
        });
      }
    },
    showSearch: {
      type: Boolean,
      default: true
    },
    filterOption: {
      type: Boolean,
      default: true
    },
    dropdownMatchSelectWidth: {
      type: Boolean,
      default: true
    },
    virtualScroll: {
      type: Boolean,
      default: true
    },
    visibleItemCount: {
      type: Number,
      default: 10
    }
  },
  data() {
    this.handleScroll = debounce(this.handlePopupScroll, 150);
    return {
      localValue: this.value,
      searchVal: '',
      scrollTop: 0,
      startIndex: 0,
      sortOptions: [],
      visibleOptions: [],
      filterDataList: []
    };
  },
  computed: {},
  watch: {
    value(newVal) {
      this.localValue = newVal;
    },
    // localValue(newVal, oldVal) {
    //   this.$emit('input', newVal);
    //   // 当值变化时，确保选中的选项可见
    //   if (newVal !== oldVal && this.virtualScroll) {
    //     this.ensureSelectedVisible();
    //   }
    // },
    options() {
      // 当options变化时，确保选中的选项可见
      if (this.virtualScroll) {
        this.ensureSelectedVisible();
      }
    }
  },
  methods: {
    sortSelectedItem() {
      if (!Array.isArray(this.options)) return this.options;

      // 统一判断选中状态的函数
      const isSelected = Array.isArray(this.localValue)
        ? item => this.localValue.includes(item.value)
        : item => item.value === this.localValue;

      const selected = [];
      const unselected = [];

      // 一次遍历完成分类，减少数组操作
      for (const item of this.options) {
        (isSelected(item) ? selected : unselected).push(item);
      }

      return [...selected, ...unselected];
    },
    ensureSelectedVisible() {
      // 多选模式下，确保选中的选项可见
      this.sortOptions = this.sortSelectedItem();

      // 初始化展示 visibleOptions 个选项
      this.visibleOptions = this.sortOptions.slice(0, this.visibleItemCount);
    },
    // 滚动时触发（防止抖动）
    handlePopupScroll() {
      if (this.searchVal === '') {
        this.loadMoreData(this.sortOptions);
      } else {
        this.loadMoreData(this.filterDataList);
      }
    },
    // 加载更多数据到select框
    loadMoreData(dataList) {
      const renderedLen = this.visibleOptions.length; // 已渲染的下拉列表长度
      const totalLen = dataList.length; // 当前数据源的长度
      let addList = [];
      if (renderedLen < totalLen) {
        if (renderedLen + this.visibleItemCount <= totalLen) {
          addList = dataList.slice(renderedLen, renderedLen + this.visibleItemCount);
        } else {
          addList = dataList.slice(renderedLen, renderedLen + (totalLen % this.visibleItemCount));
        }
        this.visibleOptions = this.visibleOptions.concat(addList);
      }
    },
    handleChange(value) {
      this.$emit('input', value);
      this.$emit('change', value);
    },
    handleBlur(e) {
      this.$emit('blur', e);
    },
    handleFocus(e) {
      this.$emit('focus', e);
    },
    handleSearch(val) {
      this.searchVal = val;
      let filterList = [];

      if (val && val.trim()) {
        // 搜索时，使用原始 options 进行过滤
        filterList = this.options.filter(item => {
          const searchText = (item.value + ' ' + item.label).toLowerCase();
          return searchText.indexOf(val.toLowerCase()) > -1;
        });
      } else {
        // 搜索为空时，使用排序后的选项
        filterList = this.sortSelectedItem();
      }

      this.filterDataList = filterList;

      // 强制更新 visibleOptions
      this.$nextTick(() => {
        this.visibleOptions =
          filterList.length < this.visibleItemCount
            ? [...filterList]
            : [...filterList.slice(0, this.visibleItemCount)];
      });
    },
    handleDropdownVisibleChange(open) {
      this.$emit('dropdownVisibleChange', open);
      // 当下拉框打开时，确保选中的选项可见
      if (open && this.virtualScroll) {
        // 如果有搜索值，使用过滤后的数据
        if (this.searchVal && this.searchVal.trim()) {
          this.visibleOptions =
            this.filterDataList.length < this.visibleItemCount
              ? [...this.filterDataList]
              : [...this.filterDataList.slice(0, this.visibleItemCount)];
        } else {
          this.ensureSelectedVisible();
        }
      }
    }
  },
  mounted() {
    // 组件挂载时，确保选中的选项可见
    this.ensureSelectedVisible();
  }
};
</script>

<style lang="less" scoped>
.virtual-select-container {
  position: relative;
  /deep/ .wpg-select,
  /deep/ .wpg-select-selection {
    width: 100% !important;
  }
}

// 替换 >>> 为 /deep/，适配 Less 解析
.virtual-select-container /deep/ .ant-select-dropdown-menu {
  max-height: 300px;
  overflow-y: auto;
}

.virtual-select-container /deep/ .ant-select-dropdown-menu::-webkit-scrollbar {
  width: 6px;
}

.virtual-select-container /deep/ .ant-select-dropdown-menu::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}
</style>
