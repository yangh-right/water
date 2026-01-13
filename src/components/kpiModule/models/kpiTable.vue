<template>
  <div class="kpiTable">
    <page-table v-bind="tableOptions">
      <template v-slot:table-offset="{ text }">
          <span
            class="offset"
            :class="{
              'offset-red': text.includes('滞后'),
              'supply-text-primary': text.includes('提前')
            }"
            >{{ text }}</span
          >
        </template>
        <template v-slot:table-planNum="{ record }">
          <span style="color: var(--supply-color-primary-DEFAULT);">{{ record.finishCount }}</span>
          {{record.finishCount !== '-' ? '/ ' : '' }}<span>{{ record.planCount }}</span>
        </template>
        <template v-slot:table-progressRate="{ text }">
          <w-progress
            :strokeColor="text === '--' ? 'var(--supply-color-third)' : 'var(--supply-color-primary-DEFAULT)'"
            :width="100"
            :percent="text === '--' ? 0 : text"
            :show-info="text !== '--'"
          />
        </template>
    </page-table>
  </div>
</template>

<script>
import { isNil } from 'lodash-es';

export default {
  name: 'KpiTable',
  components: {
    PageTable: () => import('@/components/pageLayout/models/table.vue'),
  },
  inheritAttrs: false,
  props: {
    draggable: Boolean,
    moduleData: Object,
  },
  data() {
    return {
      tableOptions: {
        columns: [],
        dataSource: null,
        firstColumnIndent: false,
        pagination: null
      },
    };
  },
  computed: {
    showType() {
      return this.moduleData?.block?.showType;
    },
  },
  watch: {
    moduleData: {
      immediate: true,
      handler: 'initData',
    },
  },
  methods: {
    /**
     * @description: 初始化数据
     * @return {*}
     */
    initData() {
      const { columns, records } = this.moduleData;

      if (this.showType === '20') {
        // 生产驾驶舱表格
        columns.forEach((v, i) => {
          v.ellipsis = true;

          if (isNil(v.width)) {
            if (i === 0) {
              v.width = 60;
            } else if (i === 1) {
              v.width = 50;
            } else if (i === 2) {
              v.width = 60;
            } else if (i === 3) {
              v.width = 60;
            } else if (i === 4) {
              v.width = 60;
            }
          }
        });
      } else if (this.showType === '42') {
        // 管网驾驶舱表格
        columns.forEach((v, i) => {
          v.ellipsis = true;

          if (isNil(v.width)) {
            if (i === 0) {
              v.width = 70;
            } else if (i === 1) {
              v.width = 50;
            } else if (i === 2) {
              v.width = 50;
            } else if (i === 3) {
              v.width = 70;
            }
          }

          // 最后一列为状态
          if (i === columns.length - 1) {
            v.scopedSlots = { customRender: 'status' };
          }
        });
      }

      this.tableOptions.columns = columns;
      this.tableOptions.dataSource = records;
    },
  },
};
</script>

<style lang="less" scoped>
.kpiTable {
  grid-column: 1 / span 2;
  // height: 180px;

  :deep(.wpg-table) {
    th,
    td {
      padding: 8px;
    }
  }
  .offset {
    &.offset-red {
      color: #f05557;
    }
    &.offset-green {
      color: #008184;
    }
  }
}
</style>
