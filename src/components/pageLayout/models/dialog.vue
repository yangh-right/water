<template>
  <w-modal
    v-model="visible"
    :title="scene.name"
    :width="800"
    :confirmLoading="confirmLoading"
    class="pageDialog"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <custom-form v-if="options" ref="customForm" :options="options" @submit="submit">
      <template v-for="(item, name) in scopedSlots" v-slot:[item.name]="data">
        <slot :name="name" v-bind="data" />
      </template>
    </custom-form>
  </w-modal>
</template>

<script>
import CustomForm from '@/components/CustomForm';

export default {
  name: 'PageDialog',
  components: { CustomForm },
  props: {
    name: String, // 弹窗名称，用于ref操作dom
    scenes: Array, // 弹窗场景，如新增、修改
    formType: [Number, String], // 当前场景类型
    formData: Object, // 表单数据
    formOptions: Object, // 表单配置
    submitOptionsHandler: Function, // 提交参数处理
    successCallback: Function, // 提交成功回调
  },
  data() {
    return {
      visible: false,
      options: null,
      confirmLoading: false,
    };
  },
  computed: {
    scene() {
      return this.scenes.find((v) => v.type === this.formType);
    },
    scopedSlots() {
      const prefix = `${this.name}-`;
      return Object.entries(this.$scopedSlots).reduce((slots, [key, scopedSlot]) => {
        if (key.startsWith(prefix)) {
          slots[key] = {
            name: key.replace(prefix, ''),
            slot: scopedSlot,
          };
        }
        return slots;
      }, {});
    },
  },
  watch: {
    visible: {
      immediate: true,
      handler(val) {
        if (val) {
          this.options = this.formOptions || null;
        }
      },
    },
  },
  methods: {
    /**
     * @description: 获取form实例
     * @return {*}
     */
    getForm() {
      return this.$refs.customForm?.form;
    },

    /**
     * @description: 提交
     * @return {*}
     */
    handleSubmit() {
      this.$refs.customForm && this.$refs.customForm.submit();
    },

    /**
     * @description: 取消
     * @return {*}
     */
    handleCancel() {
      this.$refs.customForm && this.$refs.customForm.reset();
      this.visible = false;
    },

    /**
     * @description: 确认提交
     * @param {*} data
     * @return {*}
     */
    async submit(data) {
      try {
        this.confirmLoading = true;
        let opts = data;

        // 提交参数处理
        if (typeof this.submitOptionsHandler === 'function') {
          opts = await this.submitOptionsHandler(data, this.formType, this.formData);
        }

        if (typeof this.scene.submitApi === 'function') {
          const res = await this.scene.submitApi(opts);

          // 成功提示
          this.$message.success(this.scene.successTip || this.scene.name + '成功');
          // 成功回调
          this.successCallback && this.successCallback(res);
          // 关闭弹窗
          this.handleCancel();
        } else {
          console.error('表单提交api未提供');
        }
      } catch (error) {
      } finally {
        this.confirmLoading = false;
      }
    },
  },
};
</script>

<style lang="less">
.pageDialog {
  .wpg-modal-body {
    padding: 0 40px;
  }
}
</style>
