<template>
  <div class="list-table">
    <w-table
      :columns="localColumns"
      :dataSource="dataSource"
      rowKey="key"
      :pagination="dataSource.length > 10 ? true : false"
    >
      <template slot="action" slot-scope="text, record, index">
        <a @click="handleEdit(record, index)">编辑</a>
        <w-divider type="vertical"></w-divider>
        <a @click="handleDelete(record, index)">删除</a>
      </template>
    </w-table>

    <div v-if="!readonly" class="stp-box">
      <w-button type="dashed" class="stp-button" @click="handleAdd">
        <w-icon type="plus" /> 添加
      </w-button>
    </div>

    <w-modal
      class="secondary-modal"
      v-model="visible"
      :title="title"
      closable
      width="700px"
      @cancel="visible = false"
      @ok="handleSubmit"
    >
      <w-form-model :model="form">
        <w-form-model-item
          v-for="item in columns"
          :key="item.key"
          :label="item.title"
          :prop="item.key"
        >
          <w-input
            v-if="item.type === 'string'"
            v-model="form[item.key]"
            :placeholder="item.title"
          ></w-input>
          <w-input-number
            v-if="item.type === 'number'"
            v-model="form[item.key]"
            :placeholder="item.title"
          ></w-input-number>
        </w-form-model-item>
      </w-form-model>
    </w-modal>
  </div>
</template>

<script>
import uuid from '@/utils/uuid';

export default {
  props: {
    columns: {
      type: Array,
      default: () => []
    },

    readonly: {
      type: Boolean,
      default: false
    },

    list: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      localColumns: [
        {
          title: '序号',
          dataIndex: 'num',
          key: 'num',
          width: 80,
          customRender: (text, row, index) => {
            return index + 1;
          }
        },
        ...this.columns,
        this.readonly
          ? null
          : {
              title: '操作',
              dataIndex: 'action',
              width: 120,
              scopedSlots: { customRender: 'action' }
            }
      ].filter(o => o),
      dataSource: [...this.list],
      visible: false,
      form: {},
      title: ''
    };
  },

  watch: {
    list() {
      this.dataSource = [...this.list];
    }
  },

  methods: {
    handleAdd() {
      this.editIndex = -1;

      this.form = {
        key: uuid()
      };

      this.title = '新增';

      this.visible = true;
    },

    handleDelete(record, index) {
      this.dataSource.splice(index, 1);

      this.$emit('change', [...this.dataSource]);
    },

    handleEdit(record, index) {
      this.editIndex = index;

      this.form = { ...record };

      this.title = '编辑';

      this.visible = true;
    },

    handleSubmit() {
      if (this.editIndex === -1) {
        this.dataSource.push(this.form);
      } else {
        this.dataSource.splice(this.editIndex, 1, this.form);
      }

      this.visible = false;

      this.$emit('change', [...this.dataSource]);
    }
  }
};
</script>

<style lang="less" scoped>
.stp-box {
  margin-top: 10px;
  text-align: right;
}
</style>
