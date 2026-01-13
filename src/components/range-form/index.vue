<template>
  <div>
    <w-form-model ref="form" :model="form">
      <w-row>
        <w-col :span="8">
          <info-form-item :key="`${field[0].name}`" :field="field[0]" :form="form" :type="'SUBMIT'"></info-form-item>
        </w-col>
        <w-col :span="16" style="padding-left: 10px" v-if="!['bt', 'nb'].includes(form[fieldNameList[0]])">
          <w-row>
            <w-col :span="unit ? 18 : 24">
              <info-form-item :key="`${field[1].name}`" :field="field[1]" :form="form" :type="'SUBMIT'"></info-form-item>
            </w-col>
            <w-col :span="6" class="common">{{ unit }}</w-col>
          </w-row>
        </w-col>

        <w-col :span="16" style="padding-left: 10px" v-else-if="['bt', 'nb'].includes(form[fieldNameList[0]])">
          <w-row>
            <w-col :span="unit ? 8 : 10">
              <info-form-item :key="`${field[2].name}`" :field="field[2]" :form="form" :type="'SUBMIT'"></info-form-item>
            </w-col>
            <w-col :span="unit ? 2 : 4" class="common">-</w-col>
            <w-col :span="unit ? 8 : 10">
              <info-form-item :key="`${field[3].name}`" :field="field[3]" :form="form" :type="'SUBMIT'"></info-form-item>
            </w-col>
            <w-col :span="6" class="common">{{ unit }}</w-col>
          </w-row>
        </w-col>
      </w-row>
    </w-form-model>
  </div>
</template>

<script>
import InfoFormItem from '@/components/form-item/form-item.vue';
function testPositiveNumer(rule, value, callback, msg) {
  if (value && !/^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/.test(value)) {
    callback(new Error(msg));
  } else {
    callback();
  }
}
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
      default: () => ['opt', 'value', 'rangeMin', 'rangeMax']
    },
    unit: {
      type: String,
      default: undefined
    }
  },
  data() {
    return {
      field: [
        {
          name: this.fieldNameList[0],
          type: 'select',
          options: [
            { key: 'eq', label: '=' },
            { key: 'gt', label: '>' },
            { key: 'lt', label: '<' },
            { key: 'ge', label: '≥' },
            { key: 'le', label: '≤' },
            { key: 'ne', label: '≠' },
            { key: 'bt', label: '介于' },
            { key: 'nb', label: '非介于' }
          ],
          placeholder: '请选择'
        },
        {
          name: this.fieldNameList[1],
          type: 'input',
          placeholder: '请填写',
          rules: [
            {
              validator: (rule, value, callback) => {
                testPositiveNumer(rule, value, callback, '请填写正确的数值范围');
              },
              trigger: 'change'
            }
          ]
        },
        {
          name: this.fieldNameList[2],
          type: 'input',
          placeholder: '请填写',
          rules: [
            {
              validator: (rule, value, callback) => {
                testPositiveNumer(rule, value, callback, '请填写正确的数值范围最小值');
              },
              trigger: 'change'
            }
          ]
        },
        {
          name: this.fieldNameList[3],
          type: 'input',
          placeholder: '请填写',
          rules: [
            {
              validator: (rule, value, callback) => {
                testPositiveNumer(rule, value, callback, '请填写正确的数值范围最大值');
              },
              trigger: 'change'
            }
          ]
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

<style lang="less" scoped>
.common {
  text-align: center;
  line-height: 40px;
}
</style>
