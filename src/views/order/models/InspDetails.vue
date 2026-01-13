<!--
 * @Description: 巡检步骤新增 / 删除
 * @Author: limz
 * @Date: 2021-09-03 09:47:52
 * @LastEditTime: 2024-12-13 15:02:43
 * @LastEditors: 胡海鸥 huhaiou@shwpg.com
-->
<template>
  <w-modal
    v-if="visible"
    title="巡检项配置"
    :visible="visible"
    okText="保存"
    centered
    class="add-group secondary-modal"
    width="660px"
    :footer="false"
    @cancel="visible = false"
    :maskClosable="false"
  >
    <div class="btn-wrapper">
      <w-button type="primary" size="small" :disabled="!addStatus" @click="handleAdd">
        新增
      </w-button>
    </div>
    <w-table
      rowKey="id"
      :columns="columns"
      :data-source="data"
      :pagination="false"
      :loading="loading"
      :scroll="{ y: '360px' }"
    >
      <template v-for="col in ['content', 'sort']" :slot="col" slot-scope="text, record">
        <div :key="col">
          <template v-if="record && record.editable">
            <w-input
              v-if="col === 'content'"
              v-model="record[col]"
              placeholder="请输入内容"
              size="small"
              style="margin: -5px 0"
            />
            <w-input-number
              v-else
              v-model="record[col]"
              placeholder="请输入排序"
              size="small"
              style="margin: -5px 0"
            />
          </template>
          <template v-else>
            <span v-if="col === 'content'" :title="text">{{ text }}</span>
            <span v-else class="cut">{{ text }}</span>
          </template>
        </div>
      </template>
      <template slot="action" slot-scope="text, record">
        <div class="editable-row-operations" v-if="record">
          <span v-if="record.editable">
            <a style="margin-right:4px" @click="() => save(record.id)">保存</a>
            <a @click="cancel(record.id)">取消</a>
          </span>
          <span v-else>
            <a :disabled="editingKey !== ''" @click="() => edit(record)">编辑 </a>
            <a :disabled="editingKey !== ''" @click="() => deleteItem(record.id)"> 删除</a>
          </span>
        </div>
      </template>
    </w-table>
  </w-modal>
</template>

<script>
const columns = [
  {
    title: '序号',
    dataIndex: 'index',
    width: 70,
    customRender: (text, row, index) => {
      return index + 1;
    }
  },
  {
    title: '巡检内容',
    dataIndex: 'content',
    ellipsis: false,
    scopedSlots: { customRender: 'content' }
  },
  {
    title: '排序',
    dataIndex: 'sort',
    width: 70,
    ellipsis: true,
    scopedSlots: { customRender: 'sort' }
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: 100,
    ellipsis: true,
    scopedSlots: { customRender: 'action' }
  }
];
import {
  getInspectionPointDetailPage,
  addOrUpdatePointDetail,
  deleteInspectionPointDetail
} from '@/api/plan';
export default {
  name: 'InspDetails',
  props: {
    devList: {
      type: Array,
      default: () => []
    },
    editInfo: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      visible: false,
      form: this.$form.createForm(this),
      delFlag: true,
      formData: {},
      data: [],
      columns,
      editingKey: '',
      loading: false,
      addStatus: true,
      type: ''
    };
  },
  watch: {
    visible(val) {
      if (val) {
        this.editingKey = '';
        this.getList();
      } else {
        this.addStatus = true;
      }
    }
  },
  methods: {
    async getList() {
      try {
        const res = await getInspectionPointDetailPage(this.editInfo.id);
        if (res.status === 'complete') {
          this.data = res.resultData.map(r => ({
            ...r
          }));
        }
      } catch (err) {
        console.error('获取列表失败:', err);
      }
    },

    save(id) {
      const target = this.data.filter(item => id === item.id)[0];
      if (!target) {
        return;
      }

      // 验证巡检内容是否填写
      const content = (target.content || '').trim();
      if (!content) {
        this.$message.warning('请填写巡检内容');
        return;
      }

      let params = {
        ...target,
        content: content,
        pointId: this.editInfo.id,
        id: target.id === -1 ? undefined : target.id
      };

      addOrUpdatePointDetail(params)
        .then(res => {
          if (res.status === 'complete') {
            this.$message.success('保存成功');
            delete target.editable;
            this.editingKey = '';
            this.addStatus = true;
            this.getList();
          }
        })
        .catch(err => {
          console.error('保存失败:', err);
        });
    },

    /* 新增 */
    handleAdd() {
      let newData = {
        content: '',
        sort: 1,
        id: -1
      };
      this.data.push(newData);
      this.addStatus = false;
      this.edit(newData);
    },

    edit({ id, content }) {
      this.addStatus = false;
      const newData = [...this.data];
      const target = newData.filter(item => id === item.id)[0];
      this.editingKey = id;
      if (target) {
        target.editable = true;
        this.data = newData;
      }
    },

    async deleteItem(id) {
      this.$confirm({
        title: '提示',
        content: '确定要删除吗？',
        type: 'warning',
        onOk: async () => {
          try {
            const ret = await deleteInspectionPointDetail(id);
            if (ret.status === 'complete') {
              this.$message.success('删除成功');
              this.getList();
            }
          } catch (err) {
            console.error('删除失败:', err);
          }
        }
      });
    },

    cancel(id) {
      // 如果是新增的记录（id === -1），从列表中移除
      if (id === -1) {
        this.data = this.data.filter(item => item.id !== -1);
      }
      this.editingKey = '';
      this.getList();
      this.addStatus = true;
    }
  }
};
</script>

<style scoped lang="less">
.add-group {
  /deep/ .wpg-modal-header {
    background-color: var(--supply-color-bg-card-dark);
    padding: 12px 4px;
    &::after {
      display: none;
    }
  }
}
.btn-wrapper {
  text-align: right;
  padding-bottom: 8px;
}
.add-group /deep/ .ant-modal-body {
  height: 450px;
}
.cut {
  width: 100%;
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
