<!--
  @author: zhangxiang
  @date: 2021-08-27 16:18:22
  @desc：添加form.domains 名称
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
            :value="item.calculateType"
            placeholder="监测量计算方式"
            :options="calcTypeOptions"
            @change="handleCalcChange($event, item)"
          />
        </w-form-model-item>
      </w-col>
      <w-col :span="7">
        <w-form-model-item
          label="监测量单位"
          :rules="[
            {
              required: true,
              message: '不能为空!'
            }
          ]"
          :prop="`domains[${idx}].unit`"
        >
          <w-input
            :max-length="32"
            :value="item.unit"
            placeholder="监测量单位"
            @change="handleUnitChange($event, item)"
          ></w-input>
        </w-form-model-item>
      </w-col>
      <w-col :span="7">
        <w-form-model-item
          required
          label="名称"
          :prop="`domains[${idx}].name`"
          :rules="[
            {
              required: true,
              message: '不能为空!'
            }
          ]"
        >
          <w-input
            :value="item.name"
            :max-length="32"
            placeholder="名称"
            @change="handleNameChange($event, item)"
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
  name: 'WithMDeviceMPointExtraCalcUnitName',
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
        domains: []
      }
    };
  },
  watch: {
    form() {
      this.initForm();
    }
  },
  beforeCreate() {
    this.calcTypeOptions = calcTypeOptions;
  },
  methods: {
    initForm() {
      const res = [];
      this.form.domains.forEach(i => {
        i.info.forEach(ii => {
          res.push({
            facilitiesId: i.facilitiesId,
            deviceId: i.deviceId,
            ...ii
          });
        });
      });
      this.localForm.domains = res;
      this.$refs['form'].initForm();
    },
    handleSubmit(list) {
      const res = [];
      list.forEach(i => {
        const item = res.find(ii => ii.deviceId === i.deviceId);
        if (item) {
          item.info.push({
            key: i.key,
            pointName: i.pointName,
            name: i.name,
            unit: i.unit,
            calculateType: i.calculateType
          });
        } else {
          res.push({
            facilitiesId: i.facilitiesId,
            deviceId: i.deviceId,
            info: [
              {
                key: i.key,
                pointName: i.pointName,
                name: i.name,
                unit: i.unit,
                calculateType: i.calculateType
              }
            ]
          });
        }
      });
      this.$emit('submit', {
        configParaList: res
      });
    },
    handleNameChange(e, item) {
      this.$set(item, 'name', e.target.value);
    },
    handleUnitChange(e, item) {
      this.$set(item, 'unit', e.target.value);
    },
    handleCalcChange(value, item) {
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
