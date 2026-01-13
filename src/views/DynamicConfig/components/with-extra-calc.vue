<!--
  @author: zhangxiang
  @date: 2021-08-27 16:18:22
  @desc：添加form.domains 每项上的额外属性
-->
<template>
  <station-device-point-form
    ref="form"
    :waterPlantId="waterPlantId"
    :form="localForm"
    :loading="loading"
    @submit="handleSubmit"
  >
    <template #extra="{ item, idx }">
      <w-col :span="7">
        <w-form-model-item
          required
          label="监测量计算方式"
          :prop="`domains[${idx}].calculateType`"
          :rules="[
            {
              required: true,
              message: '不能为空!'
            }
          ]"
        >
          <w-info-select
            :max-length="32"
            :value="item.calculateType"
            placeholder="监测量计算方式"
            :options="calcTypeOptions"
            @change="handleCalcChange($event, item)"
          />
        </w-form-model-item>
      </w-col>
    </template>
  </station-device-point-form>
</template>

<script>
import StationDevicePointForm from './station-device-point-form.vue';
import { calcTypeOptions } from '../dynamic-config.js';

export default {
  name: 'WithExtraCalc',
  components: { StationDevicePointForm },
  inheritAttrs: false,
  props: {
    form: {
      type: Object
    },
    waterPlantId: {
      type: String
    },
    loading: Boolean
  },
  data() {
    return {
      localForm: {
        ...this.form
      }
    };
  },
  watch: {
    form(val) {
      this.localForm = { ...val };
    }
  },
  beforeCreate() {
    this.calcTypeOptions = calcTypeOptions;
  },
  methods: {
    initForm() {
      this.$refs['form'].initForm();
    },
    handleSubmit(value) {
      this.$emit('submit', {
        configParaList: value
      });
    },
    handleCalcChange(value, item) {
      console.log('value', item);
      item.calculateType = value;
      this.$set(item, 'calculateType', value);
    }
  }
};
</script>

<style lang="less" scoped>
.form-wrapper {
  .footer {
    flex: 0 0 54px;
    text-align: right;
    padding: 0 24px;
    margin-top: 24px;
  }
}
</style>
