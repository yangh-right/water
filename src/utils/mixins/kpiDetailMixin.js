/* 驾驶舱指标下钻二级页面mixin */
import Vue from 'vue';
import KpiDialog from '@/views/kpiDetail/models/kpiDialog.vue';

export default {
  data() {
    return {
      kpiDialogVm: null,
    };
  },
  computed: {
    // 是否可下钻
    canDrill() {
      const drillType = this.moduleData?.block?.drillType;
      return !this.draggable && (drillType === '1' || drillType === '2');
    },
  },
  beforeDestroy() {
    if (this.kpiDialogVm) {
      this.kpiDialogVm.$destroy();
    }
  },
  methods: {
    /**
     * @description: 处理指标下钻
     * @return {*}
     */
    kpiDrill() {
      if (!this.canDrill) return;

      const { block } = this.moduleData || {};

      if (block) {
        if (block.drillType === '1') {
          // 弹窗形式
          this.kpiDrillDialog(this.moduleData);
        } else if (block.drillType === '2') {
          // 二级页面形式
          this.kpiDrillPage(this.moduleData);
        }
      }
    },

    /**
     * @description: 指标下钻弹窗逻辑
     * @param {*} data
     * @return {*}
     */
    kpiDrillDialog(data) {
      // 销毁弹窗实例
      if (this.kpiDialogVm) {
        this.kpiDialogVm.$destroy();
      }
      // 创建弹窗实例
      this.kpiDialogVm = new (Vue.extend(KpiDialog))({
        parent: this,
        propsData: { moduleData: data },
        data: { visible: true },
      }).$mount();
      this.$el.appendChild(this.kpiDialogVm.$el);
    },

    /**
     * @description: 指标下钻页面逻辑
     * @param {*} data
     * @return {*}
     */
    kpiDrillPage(data) {
      this.goto({
        path: '/kpiDetail/index',
        query: { id: data?.block?.mainshowId, name: data?.block?.popName },
      });
    },
  },
};
