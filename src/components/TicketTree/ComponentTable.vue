<template>
  <div>
    <list-table
      :columns="columns"
      :list="list"
      :readonly="readonly"
      @change="handleChange"
    ></list-table>
  </div>
</template>

<script>
import Table from './Table';

const columns = [
  {
    title: '配件名称及型号',
    dataIndex: 'componentName',
    key: 'componentName',
    type: 'string',
    rules: [{ required: true, message: '配件名称及型号不能为空' }],
    width: 120
  },
  {
    title: '数量（个）',
    dataIndex: 'componentNumber',
    key: 'componentNumber',
    type: 'number',
    rules: [{ required: true, message: '数量不能为空' }],
    width: 80
  },
  {
    title: '单价（元）',
    dataIndex: 'componentPrice',
    key: 'componentPrice',
    type: 'number',
    rules: [{ required: true, message: '单价不能为空' }],
    width: 80
  },
  {
    title: '合计金额（元）',
    dataIndex: 'componentTotalPrice',
    key: 'componentTotalPrice',
    type: 'number',
    rules: [{ required: true, message: '合计金额不能为空' }],
    width: 120
  }
];

export default {
  name: 'ComponentTable',

  components: {
    ListTable: Table
  },

  props: {
    readonly: {
      type: Boolean,
      default: false
    },
    value: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      columns: Object.freeze(columns),
      list: this.formatVal(this.value)
    };
  },

  watch: {
    value(val) {
      this.list = this.formatVal(val);
    }
  },

  methods: {
    formatVal(val) {
      console.log(val);
      return val ? val : [];
    },

    handleChange(list) {
      this.$emit('input', list);
    }
  }
};
</script>
