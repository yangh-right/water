<!--
 * @Author: wangyr
 * @Date: 2023-04-19 10:03:48
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-05-20 13:25:57
 * @Description:
-->
<template>
  <w-table
    :columns="columns"
    :scroll="{ y: 300 }"
    :data-source="list"
    bordered
    :pagination="false"
  />
</template>

<script>
const columns = [
  {
    title: '序号',
    dataIndex: 'index',
    customRender: (text, row, index) => {
      return index + 1;
    }
  },
  {
    title: '污水厂名称',
    dataIndex: 'pumpHouseName'
  },
  // {
  //   title: '污水厂等级',
  //   dataIndex: 'pumpLevel',
  //   customRender: (text) => {
  //     return level[text-1]
  //   }
  // },
  {
    title: '污水厂地址',
    dataIndex: 'addr'
  }
];

const level = ['一级污水厂', '二级污水厂', '三级污水厂'];

export default {
  name: 'PumpDetail',
  data() {
    return {
      columns
    };
  },
  props: {
    list: {
      type: Array,
      default: []
    }
  }
};
</script>

<style lang="less" scoped>
.ant-table-wrapper {
  height: 340px;
}
</style>
