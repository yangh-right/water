/*
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2023-02-13 10:19:24
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2023-02-13 10:20:30
 * @Description: 
 */
import { addListener, removeListener } from 'resize-detector';
import { debounce } from 'lodash-es';

export default {
  data() {
    return {
      tableScrollY: 0,
    };
  },
  mounted() {
    this._addListenTsym();
  },
  methods: {
    _addListenTsym() {
      const refName = 'table';

      if (this.$refs[refName]?.$el) {
        const _calcTableScrollY = () => {
          const el = this.$refs[refName]?.$el;
          if (el && el.offsetParent) {
            const tableHeight = el.offsetHeight;
            const tableHeadHeight =
              el.querySelector("thead[class*='-table-thead']")?.offsetHeight ?? 0;
            const tableBodyHeight =
              el.querySelector("tbody[class*='-table-tbody']")?.offsetHeight ?? 0;
            const tableFootHeight = this.$refs[refName].pagination ? 52 : 0;
            const scrollHeight = tableHeight - tableHeadHeight - tableFootHeight;

            if (!tableHeight) {
              return;
            }

            if (scrollHeight >= tableBodyHeight) {
              this.tableScrollY = 0;
            } else {
              // this.tableScrollY = `calc(100vh - ${windowHeight - scrollHeight}px)`;
              this.tableScrollY = `${scrollHeight}px`;
            }
          }
        };

        const $table = this.$refs[refName].$el.querySelector("[class*='-table']");
        const resizeCb = debounce(_calcTableScrollY, 200);

        // 表格尺寸变化触发重置
        addListener($table, resizeCb);
        this.$once('hook:beforeDestroy', () => {
          removeListener($table, resizeCb);
        });

        resizeCb();
      }
    },
  },
};
