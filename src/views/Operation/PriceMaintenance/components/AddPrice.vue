<template>
  <w-modal
    :visible="visible"
    :title="title"
    width="600px"
    @cancel="handleCancel"
    @ok="handleOk"
    :confirmLoading="loading"
  >
    <w-form-model
      ref="form"
      :model="form"
      :rules="rules"
      :colon="true"
      :labelCol="{ span: 6 }"
      :wrapperCol="{ span: 18 }"
    >
      <w-row v-for="field in priceFields" :key="field.prop">
        <w-col :span="24">
          <w-form-model-item :label="field.label" :prop="field.prop" required>
            <w-input-number
              v-model="form[field.prop]"
              placeholder="请输入单价金额"
              :min="0"
              :precision="2"
              :step="0.01"
              style="width: 100%"
            >
              <template #addonAfter>元</template>
            </w-input-number>
          </w-form-model-item>
        </w-col>
      </w-row>
    </w-form-model>
  </w-modal>
</template>

<script>
import { getPriceOperate } from '@/api/reportRecord';

const PRICE_FIELDS = [
  { label: '流量单价', prop: 'flowUnitPrice' },
  { label: '电量单价', prop: 'powerUnitPrice' },
  { label: '药量单价', prop: 'dosageUnitPrice' },
  { label: 'PAC单价', prop: 'pacUnitPrice' },
  { label: '污泥单价', prop: 'sludgeUnitPrice' },
  { label: '乙酸钠单价', prop: 'sodiumAcetateUnitPrice' },
  { label: '次氯酸钠单价', prop: 'sodiumHypochloriteUnitPrice' }
];

export default {
  name: 'AddPrice',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '编辑单价'
    },
    outerForm: {
      type: Object,
      default: () => ({})
    },
    outerList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      loading: false,
      priceFields: PRICE_FIELDS,
      form: this.getInitialForm(),
      rules: this.generateRules()
    };
  },
  computed: {
    isEdit() {
      return this.title.includes('编辑');
    }
  },
  watch: {
    visible(val) {
      if (!val) return;
      this.getInit();
    }
  },
  methods: {
    getInitialForm() {
      return PRICE_FIELDS.reduce((acc, field) => {
        acc[field.prop] = undefined;
        return acc;
      }, {});
    },
    generateRules() {
      return PRICE_FIELDS.reduce((acc, field) => {
        acc[field.prop] = [
          { required: true, message: `请输入${field.label}` },
          { type: 'number', message: '请输入有效的单价金额' },
          { validator: this.validatePrice }
        ];
        return acc;
      }, {});
    },
    getInit() {
      Object.keys(this.form).forEach(key => {
        this.form[key] = this.outerForm[key];
      });
      this.form.id = this.outerForm.id;
    },
    async handleOk() {
      try {
        const valid = await this.$refs.form.validate();
        if (valid) {
          this.loading = true;
          await getPriceOperate(this.form);
          this.$message.success('编辑成功');
          this.handleCancel();
          this.$emit('success');
        }
      } catch (error) {
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
    handleCancel() {
      this.form = this.getInitialForm();
      this.$refs.form?.resetFields();
      this.$emit('update:visible', false);
    },
    validatePrice(rule, value, callback) {
      if (value === undefined || value === null) {
        callback();
        return;
      }
      if (value < 0) {
        callback(new Error('单价金额不能小于0'));
      } else if (value > 999999.99) {
        callback(new Error('单价金额不能大于999999.99'));
      } else {
        callback();
      }
    }
  }
};
</script>

<style lang="less" scoped>
.wpg-input-number-group-addon {
  padding: 0 8px;
}

.wpg-form-model {
  padding: 0 24px;

  /deep/ .wpg-row {
    margin-bottom: 8px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  /deep/ .wpg-form-model-item {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }

    .wpg-form-model-item-label {
      text-align: right;

      &::before {
        display: inline-block;
        margin-right: 4px;
        color: #ff4d4f;
        font-size: 14px;
        font-family: SimSun, sans-serif;
        line-height: 1;
        content: '*';
      }
    }
  }
}
</style>
