<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2022-06-22 17:23:40
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2022-06-30 13:33:28
 * @Description:
-->
<template>
  <w-dropdown placement="bottomLeft" :trigger="['click']">
    <a class="condition-a ant-dropdown-link">
      <span class="sort__selected"
        >{{ sortList[curSortIndex].title
        }}<w-icon v-if="sortList[curSortIndex].icon" :type="sortList[curSortIndex].icon"
      /></span>
      <w-icon type="ic_keyboard_arrow_down" class="supply-text-xl supply-h-full supply-ml-3" />
    </a>
    <w-menu slot="overlay" @click="changeSort">
      <w-menu-item v-for="(item, index) in sortList" :key="item.key"
        >{{ item.title }}<w-icon v-if="item.icon" :type="item.icon"
      /></w-menu-item>
    </w-menu>
  </w-dropdown>
</template>
<script>
export default {
  props: {
    defaultValue: {
      type: String,
      default: 'timeReverse'
    }
  },
  data() {
    return {
      initSort: true,
      curSortIndex: 0,
      sortList: [
        { key: 'timeReverse', title: '污水厂创建时间', icon: 'arrow-down' },
        { key: 'time', title: '污水厂创建时间', icon: 'arrow-up' },
        { key: 'pumpHouseFirstLetter', title: '污水厂首字母A-Z' },
        { key: 'pumpHouseFirstLetterReverse', title: '污水厂首字母Z-A' }
      ]
    };
  },
  watch: {
    defaultValue: {
      handler(n) {
        this.sortList.forEach((item, index) => {
          if (item.key === n) {
            this.curSortIndex = index;
          }
        });
      },
      immediate: true
    }
  },
  methods: {
    changeSort(e) {
      this.sortList.forEach((item, index) => {
        if (item.key === e.key) this.curSortIndex = index;
      });
      this.$emit('changeSort', e);
    }
  }
};
</script>
<style lang="less" scoped>
.condition-a {
  padding-left: 10px;
  border: 1px solid var(--supply-color-border-DEFAULT);
  height: 28px;
  color: var(--supply-color-title);
  display: flex;
  justify-content: space-between;
  align-items: center;
  .sort__selected {
    display: flex;
    align-items: center;
    vertical-align: middle;
    line-height: 20px;
  }
}
</style>
