<template>
  <div class="supply-h-full supply-px-3 supply-pt-5 supply-pb-2.5">
    <w-info-form
      class="form-wrapper"
      ref="info_form"
      v-on="formEvent"
      v-bind="formProps"
      :layout="layout"
      :model="form"
      enterText="确定"
      :fields="fields"
    >
    </w-info-form>
  </div>
</template>

<script>
import { formMixin } from '@/components/SearchTable/option';
export default {
  mixins: [formMixin],
  data() {
    return {
      form: {
        simulationType: 1
      },
      layout: {
        span: 24,
        wrapperCol: { span: 24 },
        labelCol: { span: 0 }
      },
      fields: [
        {
          name: 'simulationType',
          type: 'radio-group',
          label: '',
          placeholder: '请选择',
          options: [
            { value: 1, label: '已有方案模拟' },
            { value: 2, label: '实时模拟' }
          ]
        }
      ]
    };
  },
  methods: {
    submit() {
      this.$emit('action', this.form.simulationType);
    }
  }
};
</script>
<style lang="less" scoped>
.form-wrapper {
  padding-left: 75px;
  margin: 20px 0;
}
</style>
