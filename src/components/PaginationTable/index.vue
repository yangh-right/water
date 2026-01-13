<script>
import { computed, defineComponent, reactive, toRefs } from '@vue/composition-api';
import AutoSizeTable from '@/components/AutoSizeTable';

/**
 * 假如有fixed的列，并且有自适应的宽度，一般的列也需要有自适应的列， 否则，所有列都必须有width, scroll.x 也一定要写
 * scroll.x 必须写
 */
export default defineComponent({
  components: {
    AutoSizeTable
  },
  props: {
    current: {
      type: Number,
      default: 1
    },
    pageSize: {
      type: Number,
      default: 20
    },
    total: {
      type: Number,
      default: 0
    },
    sorter: {
      type: Object,
      required: false
    }
  },
  setup(props, ctx) {
    // eslint-disable-next-line no-unused-vars
    const { change, ...restListeners } = ctx.listeners;
    const pagination = reactive({
      _current: computed({
        get() {
          return props.current;
        },
        set(v) {
          ctx.emit('update:current', v);
        }
      }),

      _pageSize: computed({
        get() {
          return props.pageSize;
        },
        set(v) {
          ctx.emit('update:pageSize', v);
        }
      })
    });

    // const totalWidth = columns.reduce((total, row) => {
    //     return total + row.width
    // }, 0)

    // const scroll = { x: totalWidth }

    const isSelectTable = computed(() => {
      return !!ctx.attrs.rowSelection;
    });

    const onPageChange = (page, pageSize) => {
      ctx.emit('change', page, pageSize);
    };

    const onTableChange = (paginationArg, filtersArg, sorterArg) => {
      ctx.emit('update:sorter', {
        field: sorterArg && sorterArg.field,
        order: sorterArg && sorterArg.order
      });

      ctx.emit('change', paginationArg, filtersArg, sorterArg);
    };

    return {
      ...toRefs(pagination),
      restListeners,
      isSelectTable,
      onPageChange,
      onTableChange
    };
  },
  render(h) {
    return this.$attrs.columns?.length ? (
      <div ref="table" class="pagination-table tw-bg-component">
        <div class="table-wrapper">
          <AutoSizeTable
            attrs={this.$attrs}
            on={this.restListeners}
            onChange={this.onTableChange}
            scopedSlots={this.$scopedSlots}
          ></AutoSizeTable>
        </div>
        <div class="pagination-wrapper">
          <w-pagination
            vModel={this._current}
            pageSize={this._pageSize}
            on={{
              'update:pageSize': v => (this._pageSize = v)
            }}
            total={this.total}
            showTotal={total => `共${total}条`}
            pageSizeOptions={['10', '20', '30', '50']}
            show-size-changer
            onChange={this.onPageChange}
            onShowSizeChange={this.onPageChange}
          />
        </div>
      </div>
    ) : null;
  }
});
</script>
<style lang="less" scoped>
.pagination-table {
  display: flex;
  flex-flow: column;
  overflow: hidden;
  .table-wrapper {
    flex: 1;
    overflow: hidden;
  }
  .pagination-wrapper {
    flex: none;
    display: flex;
    margin: 8px 12px 8px;
    justify-content: flex-end;
  }
}
</style>
