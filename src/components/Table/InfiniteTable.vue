<!--
 * @Author: chenzh
 * @Date: 2021-05-14 10:27:15
 * @LastEditTime: 2021-05-14 10:42:44
 * @LastEditors: chenzh
 * @Description:
 * @FilePath: /wisdomwatervue/src/components/Table/InfiniteTable.vue
-->
<template>
  <w-table
    :rowKey="rowKey"
    :columns="columns"
    :data-source="tableData"
    :pagination="false"
  ></w-table>
</template>

<script>
export default {
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    rowKey: {
      type: [String, Function],
      default: ''
    },
    dataSource: {
      type: Array,
      default: []
    },
    columns: {
      type: Array,
      default: []
    }
  },

  data() {
    return {
      tableData: []
    };
  }
};
</script>
