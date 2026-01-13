<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2022-03-09 15:23:44
 * @LastEditors: huhaiou
 * @LastEditTime: 2022-07-07 16:27:48
 * @Description:
-->
<template>
  <div class="tbl">
    <div class="tbl-content">
      <div class="tbl-table">
        <div class="tbl-add">
          <div class="tbl-add-name">
            <div class="text">关联设备</div>
          </div>
          <w-button type="primary" ghost size="small" @click="handleRelated">批量关联</w-button>
        </div>
        <w-table
          class="supply-pl-2.5"
          :loading="isLoading"
          :columns="columns"
          :data-source="result"
          :pagination="false"
          :scroll="{ x: 330, y: 'calc(100vh - 280px)' }"
          :default-expand-all-rows="true"
          :rowKey="record => record.waterPlantId"
          :rowClassName="(record, index) => (index === deletingRow ? 'deleting-row' : '')"
        >
          >
          <template slot="action" slot-scope="item, record, index">
            <a @click="handleDelete(item, index)">删除</a>
          </template>
        </w-table>
      </div>
    </div>
  </div>
</template>

<script>
import { getSvgAlreadyRelationPump, deleteRelationSvg } from '@/api/configuration';

const columns = [
  {
    title: '序号',
    dataIndex: 'id',
    key: 'id',
    width: 70,
    ellipsis: true,
    customRender: (a, b, i) => i + 1
  },
  { title: '泵房名称', dataIndex: 'siteSvgName', key: 'siteSvgName', width: 140, ellipsis: true },

  {
    title: '操作',
    key: 'action',
    scopedSlots: { customRender: 'action' },
    width: 60,
    fixed: 'right'
  }
];
export default {
  name: 'RelatedPump',
  props: {
    formData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      columns,
      isLoading: false,
      result: [],
      dataSource: [],
      relateFormData: {},
      deletingRow: -1
    };
  },

  watch: {
    formData: {
      handler() {
        this.getData();
      }
    }
  },
  mounted() {
    // this.getData();
  },
  methods: {
    async getData() {
      this.isLoading = true;
      if (this.formData?.id) {
        let result = await getSvgAlreadyRelationPump({
          svgId: this.formData.id,
          svgType: this.formData.svgType
        });
        const pumpName = Object.values(result.resultData);
        this.result = Object.keys(result.resultData).map((item, i) => {
          return { waterPlantId: item, siteSvgName: pumpName[i] };
        });
      }
      this.isLoading = false;
    },
    // 关联用户
    handleRelated() {
      this.$emit('openRelated');
    },
    handleDelete(item, index) {
      this.delete(item, index);
    },
    async delete(item, index) {
      this.deletingRow = index;
      this.$confirm({
        title: '提示',
        content: '确定要删除吗？',
        type: 'warning',
        onOk: async () => {
          await deleteRelationSvg({
            svgId: this.formData.id,
            svgType: this.formData.svgType,
            waterPlantId: item.waterPlantId
          });
          this.$message.success('取消成功');
          this.deletingRow = -1;
          this.$emit('update:formData', { ...this.formData });
          this.$emit('relateChange');
          this.getData();
        },
        onCancel: () => {
          this.deletingRow = -1;
        }
      });
    }
  }
};
</script>

<style scoped lang="less">
/deep/ .ant-form {
  padding: 0;
  margin-right: 14px;
  .ant-row {
    margin: 0;
  }

  &-item-control {
    line-height: 1;
  }

  input {
    width: 140px;
    height: 36px;
  }

  .wpg-select {
    width: 240px;
  }
}

.tbl {
  height: 100%;

  &-content {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    .tbl-add-name {
      line-height: 30px;
      height: 30px;
      display: flex;
      justify-content: space-between;
      .text {
        color: var(--supply-color-main);
        font-weight: 500;
        font-size: 16px;
        &::before {
          content: '';
          background-color: #87ce40;
          width: 4px;
          margin-right: 6px;
          height: 14px;
          position: relative;
          display: inline-block;
          left: 0;
          top: 1px;
        }
      }
    }
  }
  &-header {
    display: flex;
    align-items: center;

    button {
      margin-right: 14px;
    }
  }

  &-add {
    // flex: auto;
    display: flex;
    align-items: center;
    margin: 15px 10px 10px 10px;
    justify-content: space-between;
    &-name {
      color: var(--supply-color-primary-DEFAULT);
    }
  }
  /deep/ .ant-table {
    &-thead tr > th,
    &-tbody tr > td {
      max-width: 40px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }
  &-table {
    height: 100%;
    display: flex;
    flex-direction: column;
    .wpg-table-wrapper {
      flex: auto;
    }
  }

  &-footer {
    height: 48px;
    display: flex;
    justify-content: flex-end;
    padding: 15px 20px;
    /deep/ .ant-pagination-item {
      white-space: nowrap;
    }
  }
}
</style>
