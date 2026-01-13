<template>
  <w-modal :title="title" :visible="visible" @ok="handleOk" @cancel="handleCancel">
    <w-form-model ref="form" :model="form" :colon="true" :rules="rules" :labelCol="{ span: 7 }" :wrapperCol="{ span: 17 }">
      <span v-if="type === 0">
        <w-form-model-item prop="name" label="成本类型名称">
          <w-input v-model="form.name" placeholder="请填写成本类型名称"></w-input>
        </w-form-model-item>
        <w-form-model-item prop="otherName" label="成本类型别名">
          <w-input v-model="form.otherName" placeholder="请填写成本类型别名"></w-input>
        </w-form-model-item>
      </span>
      <span v-else>
        <w-form-model-item prop="parentName" label="上级成本类型">
          {{ form.parentName }}
        </w-form-model-item>
        <w-form-model-item prop="name" label="成本类型名称">
          <w-input v-model="form.name" placeholder="请填写成本类型名称"></w-input>
        </w-form-model-item>
      </span>

      <w-form-model-item v-if="showCost" prop="unit" label="计量单位" class="required-item">
        <cost-unit-select v-if="hasSubReduceUnit" v-model="form.reduceUnit" ref="unitSelect" :type="type" style="width: 100%"></cost-unit-select>
        <cost-unit-select v-else v-model="form.unit" ref="unitSelect" :type="type" style="width: 100%"></cost-unit-select>
      </w-form-model-item>

      <w-form-model-item v-if="showReduce && showCost" prop="reduceNum" label="单位成本折合">
        <span class="compo-item">
          <w-input v-model="form.reduceNum" placeholder="请填写折合数量"></w-input>
          <span>&nbsp;{{ form.parentUnit }}</span>
        </span>
      </w-form-model-item>

      <w-form-model-item v-if="showUnitCost && showCost" prop="costSum" label="成本金额单价" :class="isCostSumRequired ? 'required-item' : ''">
        <span class="compo-item">
          <w-form-model-item prop="costPrice" label="">
            <w-input v-model="form.costPrice" placeholder="请填写" :disabled="costDisabled"></w-input>
          </w-form-model-item>
          <w-form-model-item prop="costUnit" label="">
            <w-select v-model="form.costUnit" placeholder="请选择" :disabled="costDisabled" :getPopupContainer="node => node.parentNode">
              <w-select-option value="元">元</w-select-option>
              <w-select-option value="万元">万元</w-select-option>
            </w-select>
          </w-form-model-item>
        </span>
      </w-form-model-item>

      <w-form-model-item prop="sort" label="排序">
        <w-input v-model="form.sort" placeholder="请填写序号"></w-input>
      </w-form-model-item>
    </w-form-model>
  </w-modal>
</template>

<script>
import costUnitSelect from '@/views/System/CostConfig/components/cost-unit-select';
import { cloneDeep } from 'lodash-es';
export default {
  name: 'AddType',
  components: { costUnitSelect },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    // 0--一级成本，1--二级成本
    type: {
      type: Number,
      default: 0
    },
    title: {
      type: String,
      default: '新增成本类型'
    },
    outerForm: {
      type: Object,
      default: () => {}
    },
    outerList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      form: {
        name: '',
        otherName: '',
        unit: undefined,
        reduceNum: undefined,
        reduceUnit: '',
        costPrice: '',
        costUnit: '元',
        sort: 1
      },
      rules: {
        name: [
          { required: true, message: '请填写成本类型名称' },
          { validator: this.nameValidate, message: '成本类型名称不能重复' },
          { max: 50, message: '请填写正确的成本类型名称' }
        ],
        otherName: [
          { validator: this.nameValidate, message: '成本类型别名不能重复' },
          { max: 50, message: '请填写正确的成本类型名称' }
        ],
        unit: [
          { required: true, message: '请选择计量单位' }
        ],
        reduceNum: [
          { required: true, message: '请填写折合数量' },
          { pattern: /^(([1-9][0-9]{0,9})|([0-9]\.[0-9]{1,9}))$/, message: '请填写正确的折合数量' }
        ],
        costPrice: [{ pattern: /^(([1-9][0-9]{0,9})|([0-9]\.[0-9]{1,9}))$/, message: '请填写正确的成本单价' }],
        sort: [
          { required: true, message: '请填写序号' },
          { pattern: /^[1-9][0-9]*$/, message: '请填写正确的序号' }
        ]
      },
      costDisabled: false,
      isCostSumRequired: false,
      showCost: true,
      showUnitCost: true,
      showReduce: false
    };
  },
  computed: {
    isEdit: function () {
      return this.title.slice(0, 2) === '编辑';
    },
    // 子类类型编辑时，如果子类有折合单位，交换unit和ReduceUnit的回显
    hasSubReduceUnit: function () {
      return this.isEdit && this.outerForm.type === 1 && this.outerForm.reduceUnit !== null;
    }
  },
  watch: {
    visible(val) {
      if (!val) return;
      this.getInit();
    },
    'form.unit': {
      handler(val) {
        // 一级类型的计量单位为“无单位”时不显示成本金额单价
        if (val === '') {
          this.showUnitCost = false;
        } else {
          this.showUnitCost = true;
        }
        // 新增子类时，如果计量单位和父类单位相同，不显示折合单位表单项
        if (this.type === 1 && !this.hasSubReduceUnit) {
          this.showReduce = this.form.parentUnit && this.form.parentUnit === val ? false : true;
        }
      }
    },
    // 子类类型编辑时，如果子类有折合单位，交换unit和ReduceUnit的回显
    'form.reduceUnit': {
      handler(val) {
        if (this.hasSubReduceUnit) {
          this.showReduce = this.form.parentUnit && this.form.parentUnit === val ? false : true;
        }
      }
    }
  },
  methods: {
    async getInit() {
      await this.$refs.unitSelect?.getUnitList();
      if (this.isEdit) {
        this.form = cloneDeep(this.outerForm);
      } else {
        this.form = Object.assign(this.form, this.outerForm);
        if (!this.form.costUnit) this.form.costUnit = '元';
      }

      // 验证规则补充
      // 计量单位验证规则
      if (this.type === 1) {
        // 对子类
        if (this.form.parentUnit) {
          this.showReduce = this.form.parentUnit && this.form.parentUnit === this.form.unit ? false : true;
          this.form.unit = this.isEdit && this.form.unit ? this.form.unit : this.form.parentUnit;
          // 成本折合单位默认取大类的计量单位，如果已添加折合单位则使用已有的
          this.form.reduceUnit = this.hasSubReduceUnit ? this.form.reduceUnit : this.form.parentUnit;
        } else {
          // 如果父类无单位，则子类的计量单位、单位成本、成本金额单价不显示
          this.showCost = false;
        }
      } else {
        this.showReduce = false;
      }
      // 成本金额单价验证规则
      if (this.type === 1) {
        // 对子类，如果一级成本配置了单价，二级成本应该带出并置灰，并且需要添加必选验证规则
        this.isCostSumRequired = true;
        this.rules.costPrice.push({ required: true, trigger: ['blur', 'change'], message: '请填写成本金额单价' });
        if (this.form.parentCostPrice) {
          this.costDisabled = true;
          this.form.costPrice = this.form.parentCostPrice;
        }
      }
    },
    async handleOk() {
      let cb = await this.$refs.form.validate();
      // 计量单位规则
      let submitForm = this.type === 0 ? { ...this.form, unit: this.form.unit === undefined ? null : this.form.unit } : this.showCost ? this.form : { ...this.form, unit: null };
      // 折合单位规则
      submitForm = this.showReduce ? submitForm : { ...submitForm, reduceUnit: null };
      // 子类首次添加折合时，交换unit和reductUnit
      if (submitForm.unit !== null && submitForm.reduceUnit !== null && !this.hasSubReduceUnit) {
        let _unit = submitForm.unit;
        let _reduceUnit = submitForm.reduceUnit;
        submitForm = { ...submitForm, unit: _reduceUnit, reduceUnit: _unit };
      }
      if (cb) {
        if (this.isEdit) {
          await this.$http.put('/costType', { ...submitForm, type: this.type });
        } else {
          await this.$http.post('/costType', { ...submitForm, type: this.type });
        }
        this.handleCancel();
      }
    },
    handleCancel() {
      this.$refs.form.resetFields();
      Object.keys(this.form).forEach(key => {
        this.form[key] = undefined;
      });
      this.$emit('update:visible', false);
      this.$emit('getList');
      setTimeout(() => {
        this.form.reduceNum = undefined;
        this.rules.costPrice = [];
        this.costDisabled = false;
        this.isCostSumRequired = false;
        this.showCost = true;
        this.showUnitCost = true;
        this.showReduce = false;
      }, 100);
    },

    async getDict(code) {
      let { resultData } = await this.$http.get(`/sysDict/sysDictListByCode/${code}`);
      let res = resultData.map(v => {
        return { title: v.dictName, value: v.dictValue };
      });
      return res;
    },

    // 成本类型名称/成本类型别名校验规则--“不能与其它成本类型名称、别名重复”
    nameValidate(rule, value, cb) {
      if (this.isEdit && this.outerForm[rule.field] === value) {
        cb();
        return;
      }
      let res = this.outerList.some(v => v.name === value || (v.otherName && v.otherName === value));
      if (res) cb(new Error());
      else cb();
    }
  }
};
</script>
<style lang="less" scoped>
.compo-item {
  display: flex;
  justify-content: space-between;

  margin: 0 -5px;

  > * {
    flex: 1;
    margin: 0 5px;
  }
}

.required-item {
  /deep/ .wpg-form-item-label {
    > *::before {
      display: inline-block;
      margin-right: 4px;
      color: #f64357;
      font-size: 14px;
      line-height: 1;
      content: '*';
    }
  }
}
</style>
