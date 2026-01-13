import { addListener, removeListener } from 'resize-detector';
import { debounce, cloneDeep, isNil, isNumber } from 'lodash-es';

export default {
  props: {
    columns: {
      type: Array,
      default: () => []
    },
    columnWidthRatio: { type: Number, default: 6.5 } // 宽度倍率，和字体大小相关
  },
  data() {
    return {
      mxColumns: [],
      mxColumnFixedDisabled: false
    };
  },
  computed: {
    sortedColumns() {
      let _columns = cloneDeep(this.mxColumns);
      this._addWidthTcm(_columns);

      // 宽度足够时，禁用悬浮
      if (this.mxColumnFixedDisabled) {
        _columns.forEach(v => Reflect.deleteProperty(v, 'fixed'));
      }

      return _columns || [];
    },
    hasScrollX() {
      return !this.mxColumnFixedDisabled;
    },
    tableScrollX() {
      const columns = this.sortedColumns;
      // 如果存在没设置或者设置为百分比的列，则返回true自动处理
      // 但是如果有悬浮截断列会造成滚动错位问题，此时应该改为设置定宽
      if (columns.some(v => !isNumber(v.width))) {
        return true;
      }
      return columns.reduce((s, a) => s + a.width, 0);
    },
    slotColumns() {
      return this.sortedColumns.filter(v => v.slots?.title);
    },
    hasLeftFixed() {
      return this.sortedColumns.some(v => v.fixed === true || v.fixed === 'left');
    }
  },
  watch: {
    columns: {
      immediate: true,
      handler(val) {
        this.mxColumns = val;
        this._calcTableFixed();
      }
    }
  },
  mounted() {
    this._addListenTcm();
  },
  methods: {
    /**
     * @description: 添加宽度，以适应横向滚动
     * @param {*} columns
     * @return {*}
     */
    _addWidthTcm(columns) {
      columns?.forEach(v => {
        if (v.children?.length) {
          this._addWidthTcm(v.children);
          // 用于计算总宽
          v.width = v.children.reduce((s, a) => {
            return isNumber(s) && isNumber(a.width) ? s + a.width : null;
          }, 0);
        } else {
          if (isNil(v.width)) {
            // 如果没有设置宽度，则根据字节长度自动计算宽度（宽度保底150）
            const len = v.title.replace(/[^\p{ASCII}]/gu, 'aa').length;
            v.width = Math.max(len * this.columnWidthRatio + 32, 150);
          }
        }
      });
    },

    /**
     * @description: 添加监听
     * @return {*}
     */
    _addListenTcm() {
      if (this.$refs.table?.$el) {
        const $table = this.$refs.table.$el;
        const resizeCb = debounce(this._calcTableFixed, 100);

        // 表格尺寸变化或者表格项变化都触发重置
        addListener($table, resizeCb);
        this.$once('hook:beforeDestroy', () => {
          removeListener($table, resizeCb);
        });

        resizeCb();
      }
    },

    /**
     * @description: 计算表格是否需要悬浮
     * @return {*}
     */
    _calcTableFixed() {
      const el = this.$refs.table?.$el;
      if (el) {
        const tableWidth = el.offsetWidth ?? 0;
        const tableScrollX = isNumber(this.tableScrollX) ? this.tableScrollX : Infinity;
        this.mxColumnFixedDisabled = tableWidth >= tableScrollX;
      }
    }
  }
};
