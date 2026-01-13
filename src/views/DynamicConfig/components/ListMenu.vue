<!--
  @author: zhangxiang
  @date: 2021-05-08 09:47:36
  @desc：单层紫菜蛋列表
-->
<template>
  <div v-loading="loading" class="list-menu">
    <h3 v-if="title" class="title">{{ title }}</h3>
    <!-- <loading :loading="loading"> -->
    <w-menu
      class="wbgc-card"
      v-if="list.length"
      :selectedKeys="selectedKeys"
      mode="inline"
      :multiple="multiple"
      :defaultSelectedKeys="defaultSelectedKeys"
      @select="handleSelect"
    >
      <w-menu-item
        v-for="item in list"
        :key="item[replaceFields.key]"
        :value="item[replaceFields.value]"
      >
        <span>{{ item[replaceFields.label] || '---' }}</span>
      </w-menu-item>
    </w-menu>
    <empty v-else />
    <!-- </loading> -->
  </div>
</template>

<script>
import Empty from '@/components/empty.vue';

export default {
  name: 'List',
  components: { Empty },
  props: {
    list: {
      type: Array,
      required: true
    },
    loading: Boolean,
    title: String,
    selectedKeys: Array,
    defaultSelectedKeys: Array,
    multiple: {
      type: Boolean,
      default: false
    },
    replaceFields: {
      type: Object,
      default: () => ({
        key: 'key',
        value: 'value',
        label: 'label'
      })
    }
  },
  methods: {
    handleSelect({ key }) {
      const selectedItem = this.list.find(_i => _i[this.replaceFields.key] === key);
      this.$emit('select', key, selectedItem);
    }
  }
};
</script>

<style lang="less" scoped>
.list-menu {
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  > h3 {
    height: 54px;
    line-height: 54px;
    // border-bottom: 1px solid #eee;
    position: relative;
    padding-left: 24px;

    &::before {
      position: absolute;
      top: 50%;
      left: 11px;
      width: 5px;
      height: 14px;
      // background-color: #87ce40;
      transform: translateY(-50%);
      content: '';
    }
  }

  .wpg-menu {
    // background-color: #fff !important;
    flex: 1;
    // overflow: hidden scroll;
    // &::-webkit-scrollbar {
    //   background: transparent;
    //   // width: 0;
    // }

    /deep/ .wpg-menu-item {
      height: 40px !important;
      font-size: 13px;
      line-height: 40px !important;

      > span {
        padding-left: 12px;
      }

      &-selected {
        // background-color: #dde9fc !important;

        &::after {
          right: 1px;
          border-right-width: 2px;
          // transform: scaleY(0.7);
        }
      }
    }
  }
}
</style>
