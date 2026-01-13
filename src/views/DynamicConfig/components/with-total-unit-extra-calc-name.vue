<!--
  @author: zhangxiang
  @date: 2021-08-27 17:22:05
  @desc：添加form上的额外属性
-->
<template>
  <station-device-point-form
    ref="form"
    :waterPlantId="waterPlantId"
    :form="lcoalForm"
    :loading="loading"
    @submit="handleSubmit"
  >
    <template #prev="{ form }">
      <w-row :gutter="[12]">
        <w-col :span="7">
          <w-form-model-item
            prop="unit"
            label="监测量单位"
            :rules="[
              {
                required: true,
                message: '监测量单位不能为空!'
              }
            ]"
          >
            <w-input v-model="form.unit" :max-length="32" placeholder="监测量单位"></w-input>
          </w-form-model-item>
        </w-col>
      </w-row>
    </template>
    <template #extra="{ item, idx }">
      <w-col :span="7">
        <w-form-model-item
          :prop="`domains[${idx}].calculateType`"
          required
          label="计算方式"
          :rules="[
            {
              required: true,
              message: '计算方式不能为空!'
            }
          ]"
        >
          <w-info-select
            :value="item.calculateType"
            :max-length="32"
            placeholder="计算方式"
            :options="calcTypeOptions"
            @change="handleCalcChange($event, item)"
          />
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
  name: 'WithTotalUnitExtraCalcName',
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
      lcoalForm: {
        unit: undefined,
        ...this.form
      }
    };
  },
  watch: {
    form() {
      this.lcoalForm = {
        unit: undefined,
        ...this.form
      };
    }
  },
  beforeCreate() {
    this.calcTypeOptions = calcTypeOptions;
  },
  methods: {
    handleSubmit(value) {
      this.$emit('submit', {
        configParaList: value.map(i => ({
          key: Date.now(),
          placeId: i.placeId,
          facilitiesId: i.facilitiesId,
          deviceId: i.deviceId,
          pointName: i.pointName,
          name: i.name,
          calculateType: i.calculateType
        })),
        unit: this.lcoalForm.unit
      });
    },
    initForm() {
      this.$refs['form'].initForm();
    },
    handleNameChange(e, item) {
      this.$set(item, 'name', e.target.value);
    },
    handleCalcChange(val, item) {
      this.$set(item, 'calculateType', val);
    }
  }
};
</script>
