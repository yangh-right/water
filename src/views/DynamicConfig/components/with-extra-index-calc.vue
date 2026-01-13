<!--
  @author: zhangxiang
  @date: 2021-08-27 16:18:22
  @desc：添加form.domains 每项上的额外属性  指标-计算方式
-->
<template>
  <station-device-point-form
    ref="form"
    :waterPlantId="waterPlantId"
    :form="form"
    :loading="loading"
    @submit="handleSubmit"
  >
    <template #extra="{ item, idx }">
      <w-col :span="7">
        <w-form-model-item
          required
          label="指标选择"
          :prop="`domains[${idx}].indexId`"
          :rules="[
            {
              required: true,
              message: '不能为空!'
            }
          ]"
        >
          <w-info-select
            :max-length="32"
            :value="item.indexId"
            :options="indexList"
            placeholder="指标选择"
            @change="handleIndexChange($event, item)"
          />
        </w-form-model-item>
      </w-col>
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
            :value="item.calculateType"
            :max-length="32"
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
  name: 'WithExtraIndexCalc',
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
      // localForm: {
      //   ...this.form
      // },
      indexList: []
    };
  },
  beforeCreate() {
    this.calcTypeOptions = calcTypeOptions;
  },
  created() {
    this.getIndexList();
  },
  methods: {
    initForm() {
      this.$refs['form'].initForm();
    },
    handleSubmit(value) {
      this.$emit('submit', value);
    },
    // 获取指标列表
    async getIndexList() {
      try {
        const { resultData } = await this.$axios.get('/waterwork-energy-api/getSmartAddAlumKeys');
        this.indexList = resultData.map(i => ({
          label: i,
          value: i
        }));
      } catch (error) {
        this.indexList = [];
      }
    },
    handleCalcChange(value, item) {
      this.$set(item, 'calculateType', value);
    },
    handleIndexChange(value, item) {
      this.$set(item, 'indexId', value);
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
