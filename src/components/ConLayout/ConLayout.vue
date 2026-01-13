<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2023-04-08 10:40:54
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2024-07-04 11:00:39
 * @Description:
-->
<script>
export default {
  name: 'ConLayout',
  render() {
    let configs = JSON.parse(JSON.stringify(this.config));
    this.handleConfig(configs);
    return this.handleRender(configs);
  },
  props: {
    config: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      configs: {}
    };
  },
  mounted() {},
  methods: {
    handleRender(config) {
      return (
        <div class={[...config.class]} style={config.style}>
          {config.slots?.map((item, index) => {
            return this.$scopedSlots[item]({ code: config.code });
          })}
          {config.children.map((item, index) => {
            return this.handleRender(item);
          })}
        </div>
      );
    },
    handleConfig(val, parent = {}, config = null) {
      if (!config) config = val.config || {};
      if (!Object.prototype.toString.call(val) === '[object Object]') {
        val = {};
      }
      if (!(typeof val.style === 'object')) {
        val.style = {};
      }
      if (!Array.isArray(val.class)) {
        val.class = [];
      }
      val.class.unshift('supply-overflow-hidden')
      if (!val.code) {
        val.code = '1';
        val.class.unshift('con-layout');
      }
      val.class.push('layout_' + val.code);
      val.class.unshift('supply-flex');

      if (!Array.isArray(val.children)) {
        val.children = [];
      }
      if (val.children.length > 0) {
        let code = val.code + 1;
        let isCol = val.class.includes('supply-flex-col') || val.style?.flexDirection === 'column';
        val.children.forEach((child, index) => {
          child.code = val.code + '_' + (index + 1);
          if (!Array.isArray(child.class)) {
            child.class = [];
          }
          if (
            !config.noDefault &&
            !child.children?.length &&
            val.children.length > 1 &&
            val.children.length - 1 !== index
          ) {
            if (isCol) {
              child.class.push('margin-bottom');
            } else {
              child.class.push('margin-right');
            }
          }
          this.handleConfig(child, val, config);
        });
      } else {
        val.class.unshift('con-layout__item');
      }
    }
  }
};
</script>
<style lang="less" scoped>
.margin-bottom {
  margin-bottom: 12px;
}
.margin-right {
  margin-right: 12px;
}
.con-layout {
  display: flex;
  padding: 12px;
  height: 100%;
  &__item {
    border-radius: 4px;
    background-color: var(--supply-color-bg-card-component);
  }
}
</style>
