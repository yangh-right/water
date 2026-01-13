<!--
 * @Author: wangyr
 * @Date: 2023-04-17 17:01:52
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-04-18 15:25:54
 * @Description:
-->
<template>
  <w-select
    v-model="selectValue"
    showSearch
    placeholder="请选择计量单位"
    :disabled="disabled"
    :getPopupContainer="node => node.parentNode"
    @change="change"
  >
    <w-select-option v-for="item in unitList" :key="item.dictCode" :value="item.dictCode">
      {{ item.dictName }}
    </w-select-option>
  </w-select>
</template>
<script>
import { getPointUnitApi } from '@/api/public';
export default {
  name: 'UnitSelect',
  props: {
    type: {
      type: Number,
      default: 0
    },
    value: {
      type: [String, Array],
      default() {
        return undefined;
      }
    },
    disabled: { type: Boolean, default: false }
  },
  data() {
    return {
      selectValue: undefined,
      unitList: []
    };
  },
  watch: {
    value(val) {
      this.selectValue = val;
    }
  },
  mounted() {
    this.getUnitList();
  },
  methods: {
    async getUnitList() {
      const { resultData } = await getPointUnitApi();
      this.unitList = resultData;
      if (this.type === 0) this.unitList.unshift({ dictCode: '', dictName: '无单位' });
      this.selectValue = this.value;
      // 选择无单位
      if (!this.selectValue) {
        this.selectValue = this.unitList[0].dictCode;
      }
      this.$emit('input', this.selectValue);
    },
    change(val) {
      this.$emit('input', val);
      this.$emit('change', val);
    }
  }
};
</script>
