import { isNil } from 'lodash-es';

export default {
  inject: ['state'],
  data() {
    return {
      routePath: this.$route.path,
    };
  },
  watch: {
    'state.tabs': 'handleTabsChange',
  },
  methods: {
    /**
     * 处理tab变化 - tab关闭时清除缓存
     * @param tabs
     */
    handleTabsChange(tabs) {
      if (tabs.every((v) => v.key !== this.routePath)) {
        // 查找并清除缓存
        const { parent, componentOptions, key } = this.$vnode;
        if (parent?.componentInstance?.cache && componentOptions) {
          const _key = isNil(key)
            ? componentOptions.Ctor.cid + (componentOptions.tag ? `::${componentOptions.tag}` : '')
            : key;
          const { cache, keys } = parent.componentInstance;

          if (cache[_key]) {
            if (keys.length) {
              let index = keys.indexOf(_key);
              if (index > -1) {
                keys.splice(index, 1);
              }
            }

            Reflect.deleteProperty(cache, _key);
          }
        }

        // 销毁组件
        this.$destroy();
      }
    },
  },
};
