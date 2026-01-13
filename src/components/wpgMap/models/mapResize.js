import {addListener, removeListener} from 'resize-detector';
import {debounce} from 'throttle-debounce';

export default {
  mounted() {
    (function () {
      if (this.$refs.map) {
        const resizeCb = debounce(100, false, () => this.map && this.map.invalidateSize(true));
        addListener(this.$refs.map, resizeCb);
        this.$once('hook:beforeDestroy', () => {
          removeListener(this.$refs.map, resizeCb);
        });
      }
    }).apply(this);
  },
};
