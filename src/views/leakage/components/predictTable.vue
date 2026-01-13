<template>
  <div class="tbl">
    <p class="header">
      {{ tabKey === 'minFlowKey' ? '最小流量预测分析报表' : '进水量预测分析报表' }}
    </p>
    <w-table
      :columns="columns"
      :row-selection="rowSelection"
      :row-key="record => record.dateTime"
      :data-source="records"
      :scroll="{ y: 'calc(100% - 50px)' }"
      :pagination="false"
      :loading="loading"
    >
      <template slot="text" slot-scope="record">
        <span :title="record">{{ record }}</span>
      </template>
    </w-table>
  </div>
</template>

<script>
export default {
  name: 'PredictTable',
  props: {
    tabKey: {
      type: String,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    result: {
      type: Object,
      default: null
    },
    columns: {
      type: Array,
      default: function() {
        return [];
      }
    }
  },
  data() {
    return {
      records: [],
      selectedRowKeys: []
    };
  },
  computed: {
    // 行选择
    rowSelection() {
      return {
        columnWidth: 10,
        type: 'radio',
        selectedRowKeys: this.selectedRowKeys
      };
    }
  },
  watch: {
    result: {
      immediate: true,
      // deep: true,
      handler(val) {
        if (val && Object.keys(val).length) {
          this.main();
        }
      }
    }
  },
  methods: {
    main() {
      let { records } = this.result;
      if (!Object.keys(records).length) {
        this.records = [];
        return;
      }
      this.records = this.result.records;
    },
    // 分页、跳页
    onChangePage(current, size) {
      const opts = { current, size };
      this.$emit('update', opts);
    }
  }
};
</script>

<style lang="less" scoped>
.tbl {
  padding: 12px 0;
  box-sizing: border-box;
  overflow: hidden;
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 22px;
    margin-bottom: 10px;
    padding: 0 12px;
  }

  /deep/.wpg-table-wrapper {
    height: calc(100% - 24px);

    .wpg-spin-nested-loading,
    .wpg-spin-container,
    .wpg-table,
    .wpg-table-content,
    .wpg-table-scroll {
      height: 100%;
    }

    .wpg-table {
      &-thead tr > th,
      &-tbody tr > td {
        padding-left: 20px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }

    .wpg-table-tbody {
      tr {
        cursor: pointer;

        & > td.wpg-table-selection-column span {
          display: none;
        }

        &.wpg-table-row-selected {
          background: #eaf1fb;
        }
      }
    }
  }

  &-footer {
    padding: 8px 20px;
    text-align: right;
  }
}
</style>
