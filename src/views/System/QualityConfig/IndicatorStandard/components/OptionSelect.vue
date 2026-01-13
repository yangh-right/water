<template>
  <div>
    <w-form-model ref="form" :model="form">
      <w-row>
        <w-col :span="8">
          <info-form-item :key="`${field[0].name}`" :field="field[0]" :form="form" :type="'SUBMIT'"></info-form-item>
        </w-col>
        <w-col :span="16" style="padding-left: 10px">
          <w-row>
            <w-col :span="unit ? 20 : 24">
              <info-form-item
                :key="`${field[1].name}`"
                :field="field[1]"
                :form="form"
                :type="'SUBMIT'"
              ></info-form-item>
            </w-col>
            <w-col :span="4" style="text-align: center; line-height: 40px">{{ unit }}</w-col>
          </w-row>
        </w-col>
      </w-row>
    </w-form-model>
  </div>
</template>

<script>
import InfoFormItem from '@/components/form-item/form-item.vue';
export default {
  components: {
    InfoFormItem
  },
  props: {
    form: {
      type: Object,
      default: () => ({})
    },
    fieldNameList: {
      type: Array,
      default: () => ['include', 'includeValue']
    },
    unit: {
      type: String,
      default: undefined
    },
    options: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      field: [
        {
          name: this.fieldNameList[0],
          type: 'select',
          options: [
            { key: 'in', label: '包含' },
            { key: 'ni', label: '不包含' }
          ],
          placeholder: '请选择'
        },
        {
          name: this.fieldNameList[1],
          type: 'select',
          options: this.options,
          placeholder: '请选择',
          attrs: {
            mode: 'multiple'
          }
        }
      ]
    };
  },
  methods: {
    validate() {
      return new Promise((res, rej) => {
        this.$refs['form'].validate(valid => {
          valid ? res() : rej('请按要求正确填写表单');
        });
      });
    },
    $_clearValidate() {
      this.$refs['form'].clearValidate();
    }
  }
};
</script>

<style lang="less" scoped></style>
