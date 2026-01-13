<template>
  <div class="table-search-layout">
    <div class="supply-bg-bg-card-component table-page-search-wrapper">
      <w-form layout="inline">
        <slot name="form"></slot>
      </w-form>
    </div>
    <div class="table-page-list-wrapper">
        <slot name="tabs"></slot>
      <div class="table-page-list-head">
        <slot name="head"></slot>
      </div>
      <div class="table-page-list-container">
        <slot></slot>
      </div>
      <slot name="foot"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TableSearch',

  data() {
    return {
      el: document.querySelector('.table-page-list-wrapper'),
      // 高级搜索 展开/关闭
      collapsed: false
    };
  },

  beforeCreate() {},

  methods: {}
};
</script>

<style lang="less">
@item-height: 32px;
.table-search-layout {
  display: flex;
  flex-direction: column;
  height: 100%;

  .table-page-list-wrapper {
    display: flex;
    flex: 1;
    flex-direction: column;
    margin-top: 12px;
    overflow: hidden;
    border-radius: 4px;
  }


  .table-page-list-container {
    flex: 1;
    overflow: hidden;
  }

  .table-page-list-head {
    display: flex;
    align-items: center;
    padding-right: 12px;
    padding-left: 20px;

    .table-page-list-actions {
      display: flex;
      flex: 1;
      justify-content: flex-end;
    }
  }
}

.table-page-search-wrapper {
  padding: 5px 20px;
  border-radius: 4px;

  .table-page-search-submitButtons {
    float: right;
    margin-top: 5px;
    margin-bottom: 5px;
    white-space: nowrap;
    text-align: right;
  }
}
</style>
