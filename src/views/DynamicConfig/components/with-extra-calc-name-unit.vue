<!--
  @author: zhangxiang
  @date: 2021-10-15 16:05:50
  @desc：
-->
<template>
  <station-device-point-form
    ref="form"
    :waterPlantId="waterPlantId"
    :form="lcoalForm"
    :loading="loading"
    @submit="handleSubmit"
  >
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
          label="监测量单位"
          :prop="`domains[${idx}].unit`"
          :rules="[
            {
              required: true,
              message: '监测量单位不能为空!'
            }
          ]"
        >
          <w-input v-model="item.unit" :max-length="32" placeholder="监测量单位"></w-input>
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
  name: 'WithExtraCalcNameUnit',
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
        domains: []
      }
    };
  },
  watch: {
    form() {
      this.deal();
    }
  },
  beforeCreate() {
    this.calcTypeOptions = calcTypeOptions;
  },
  methods: {
    handleSubmit() {
      const list = [];
      this.lcoalForm.domains.forEach(item => {
        const idx = list.findIndex(i => i.name.trim() === item.name.trim());
        if (idx > -1) {
          list[idx].configParaItemList.push({
            facilitiesId: item.facilitiesId,
            deviceId: item.deviceId,
            pointName: item.pointName
          });
        } else {
          list.push({
            name: item.name,
            unit: item.unit,
            calculateType: item.calculateType,
            configParaItemList: [
              {
                facilitiesId: item.facilitiesId,
                deviceId: item.deviceId,
                pointName: item.pointName
              }
            ]
          });
        }
      });
      this.$emit('submit', {
        configParaList: list
      });
    },
    initForm() {
      this.deal();
      this.$refs['form'].initForm();
    },
    handleNameChange(e, item) {
      this.$set(item, 'name', e.target.value);
    },
    handleCalcChange(val, item) {
      this.$set(item, 'calculateType', val);
    },
    // 回显处理
    deal() {
      const list = [];
      this.form.domains.forEach(item => {
        if (item?.configParaItemList?.length) {
          const _i = item.configParaItemList.map(i => {
            return {
              name: item.name,
              unit: item.unit,
              calculateType: item.calculateType,
              facilitiesId: i.facilitiesId,
              deviceId: i.deviceId,
              pointName: i.pointName || []
            };
          });
          list.push(..._i);
        }
      });
      this.lcoalForm = {
        ...this.lcoalForm,
        domains: list.length
          ? list
          : [
              {
                key: Date.now(),
                facilitiesId: undefined,
                deviceId: undefined,
                pointName: [],
                unit: undefined,
                calculateType: undefined,
                name: undefined
              }
            ]
      };
    }
  }
};
</script>

<style lang="less" scoped></style>
