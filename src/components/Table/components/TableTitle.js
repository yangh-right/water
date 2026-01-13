import { isFunction } from '../util';

export default {
  name: 'TableTitle',

  props: {
    helpMessage: {
      type: [String, Array]
    },
    title: {
      type: [Function, String]
    },
    selectedRows: {
      type: Array
    }
  },

  render() {
    const prefixCls = 'supply-pro-table-title';
    let tableTitle = this.$slots.default || null;
    let toolbar = this.$slots.toolbar || null;

    const { title, selectedRows } = this;
    let tit = tableTitle;
    if (!tit) {
      tit = title;
      if (isFunction(title)) {
        tit = title({
          selectedRows: selectedRows
        });
      }
    }

    return (
      <div class={prefixCls}>
        {tit && <div class={`${prefixCls}__title`}>{tit}</div>}
        {!tit && <div>&nbsp;</div>}
        {toolbar ? <div class={`${prefixCls}__toolbar`}>{toolbar}</div> : null}
      </div>
    );
  }
};
