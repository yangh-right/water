/*
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2023-02-13 10:26:24
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2023-02-13 10:26:37
 * @Description: 
 */
import { addListener, removeListener } from 'resize-detector';
import { debounce } from 'lodash-es';

export default {
  mounted() {
    (function () {
      if (this.$refs.chart) {
        const resizeCb = debounce(() => this.chart && this.chart.resize(), 100);
        addListener(this.$refs.chart, resizeCb);
        this.$once('hook:beforeDestroy', () => {
          removeListener(this.$refs.chart, resizeCb);
        });
      }
    }.apply(this));
  },
};
