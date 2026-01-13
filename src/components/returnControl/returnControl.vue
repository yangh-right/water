<!--
 * @Description: 返回中控台
 * @version:
 * @Author: liuct
 * @Date: 2021-09-01 14:18:13
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2023-04-23 09:38:30
-->
<template>
  <w-button v-if="visible" :icon="icon" :size="size" :class="className" @click="toPage">
    <slot>{{ title }}</slot>
  </w-button>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import { parsePath, parseQuery } from '@/utils/uri.js';
export default {
  name: 'ReturnControl',
  props: {
    path: {
      // 返回路径
      type: String,
      default: '/mapNav'
    },
    icon: {
      // 返回路径
      type: String,
      default: ''
    },
    title: {
      // 按钮文字
      type: String,
      default: '返回'
    },
    size: {
      // 按钮文字
      type: String,
      default: 'default'
    },
    keep: {
      type: Boolean, // 是否保持按钮存在:非iframe下有效, true:不管下钻地址是否存在,按钮都会显示
      default: false
    },
    iframeShow: {
      // iframe 嵌入的情况下是否展示
      type: Boolean,
      default: false
    },
    isDrillDown: {
      // 开启下钻
      type: Boolean,
      default: false
    },
    className: {
      type: String,
      default: 'return-button'
    }
  },
  inject: {
    closeTab: {
      default: () => {}
    },
    isMicroApp: {
      default: false
    }
  },
  data() {
    return {
      visible: true,
      backPath: '' // 路由参数
    };
  },
  computed: {
    ...mapState('page', ['current', 'opened']),
    ...mapState('setting', ['isIFrame', 'productCode']),
    routerPath() {
      // 返回路由, 参数有优先级>props
      return this.backPath || this.path;
    }
  },
  created() {
    this.init();
  },
  activated() {
    this.init();
  },
  methods: {
    ...mapMutations('page', ['removeOpened']),
    toPage() {
      // if (this.isMicroApp) {
      //   const {
      //       $route: { path },
      //   } = this;
      //   this.closeTab(path);
      //   this.jump();
      // } else {
      //   const index = this.opened.findIndex(page => page.fullPath === this.current);
      //   if (index >= 0) {
      //     this.removeOpened(index);
      //   }
      //   this.jump();
      // }
      const {
        $route: { path }
      } = this;

      let routerPath = this.routerPath.replace('/' + this.productCode, '');

      this.closeTab(path, routerPath);
      // this.jump();
    },
    // 初始化处理
    init() {
      // 如果配置了下钻页面 $route.query 的 backPath 必须有值, 否在按钮不显示
      if (this.isDrillDown) {
        const backPath = this.$route.query.backPath;
        if (backPath) {
          this.visible = true;
        } else {
          this.visible = false;
        }
        this.backPath = backPath || this.path;
      }
    },
    // 页面跳转
    jump() {
      let routerPath = this.routerPath;
      let { path, query } = parsePath(routerPath);

      // 小门户环境下，去掉应用code前缀
      if (this.isMicroApp) {
        path = path.replace('/' + this.productCode, '');
      }

      if (query) {
        query = parseQuery(query);
        delete query.hideMultiTab;
        delete query.hideMenu;
      }
      console.log('跳转地址:' + path + ':' + JSON.stringify(query || {}));
      // this.goto({
      //   path,
      //   query: query || {}
      // });
      this.goto({
        path,
        query: query || {}
      });
    }
  }
};
</script>

<style lang="less" scoped></style>
