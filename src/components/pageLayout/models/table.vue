<template>
  <div class="page-table">
    <w-table
      ref="table"
      :class="{ leftFixed: hasLeftFixed, indent: firstColumnIndent }"
      :columns="sortedColumns"
      :data-source="dataSource"
      :pagination="false"
      :row-key="rowKey"
      :scroll="{ x: hasScrollX ? tableScrollX : null, y: tableScrollY }"
      :bordered="bordered"
      v-bind="{ ...extraAttrs, ...$attrs }"
      @change="handleSort"
    >
      <!-- column自定义插槽 -->
      <template v-for="column in slotColumns" #[column.slots.title]>
        <component
          :is="column.slots.component"
          v-if="column.slots.component"
          :key="column.key"
          v-bind="column.customData"
        />
        <component :is="column.slots.customTitle()" v-else :key="column.key" :column="column" />
      </template>
      <!-- 单元格插槽 -->
      <template
        v-for="(scopedSlot, name) in scopedSlots"
        v-slot:[name]="(text, record, index, column)"
      >
        <parser :key="name" :scoped-slot="scopedSlot" :data="{ text, record, index, column }" />
      </template>
    </w-table>
    <div v-if="pagination" class="page-table__footer">
      <w-pagination
        v-bind="paginationFullAttrs"
        :current="pagination.current"
        :page-size="pagination.pageSize"
        :total="pagination.total"
        @change="onChangePage"
        @showSizeChange="onChangePage"
      />
    </div>
  </div>
</template>

<script>
import tableScrollYMixin from '@/utils/mixins/tableScrollYMixin';
import tableColumnsMixin from '@/utils/mixins/tableColumnsMixin';

export default {
  name: 'PageTable',
  components: {
    Parser: () => import('./parser')
  },
  mixins: [tableScrollYMixin, tableColumnsMixin], // 注意此处mixin的内部逻辑
  inheritAttrs: false,
  props: {
    rowKey: {
      type: [String, Function],
      default: () => (_, i) => i
    },
    dataSource: {
      type: Array
    },
    pagination: {
      type: Object,
      default: () => ({
        current: 1,
        pageSize: 10,
        total: 0
      })
    },
    extraAttrs: Object,
    paginationAttrs: Object,
    firstColumnIndent: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    scopedSlots() {
      const prefix = 'table-';
      return Object.entries(this.$scopedSlots).reduce((slots, [key, scopedSlot]) => {
        if (key.startsWith(prefix)) {
          const name = key.replace(prefix, '');
          slots[name] = scopedSlot;
        }
        return slots;
      }, {});
    },
    bordered() {
      return this.extraAttrs?.bordered && this.dataSource?.length > 0;
    },
    paginationFullAttrs() {
      return {
        pageSizeOptions: ['10', '20', '50'],
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: total => `共${total}条`,
        ...this.paginationAttrs
      };
    }
  },
  watch: {
    pagination: {
      handler(val) {
        if (val) {
          if (val.current === undefined) {
            val.current = 1;
          }
          if (val.pageSize === undefined) {
            val.pageSize = 10;
          }
          if (val.total === undefined) {
            val.total = 0;
          }
        }
      },
      immediate: true
    }
  },
  methods: {
    onChangePage(page, size) {
      this.$emit('page-change', page, size);
    },
    handleSort(a, b, { columnKey, order }) {
      this.$emit('sort', columnKey, order);
    }
  }
};
</script>

<style lang="less" scoped>
.page-table {
  display: flex;
  flex-direction: column;
  height: 100%;

  :deep(.wpg-table) {
    &-wrapper {
      flex: 1;
      overflow: hidden;

      &.indent {
        &:not(.leftFixed) .wpg-table-scroll,
        &:not(.leftFixed) .wpg-table-body,
        &.leftFixed .wpg-table-fixed-left {
          tr:first-child th:first-child,
          tr td:first-child {
            padding-left: 46px;
          }
        }
      }
    }
  }

  &__footer {
    display: flex;
    flex: none;
    align-items: center;
    justify-content: flex-end;
    height: 50px;
    padding-right: 30px;
  }
}

:deep(.wpg-table-scroll) table {
  width: min-content !important;
}
</style>
