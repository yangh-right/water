<!--
 * @Author: wangyr
 * @Date: 2023-04-12 11:40:41
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-04-18 15:14:59
 * @Description:
-->
<template>
  <w-select
    v-model="selectValue"
    @change="change"
    :placeholder="placeholder"
    showSearch
    :disabled="disabled"
    :allowClear="allowClear"
    :mode="mode"
    :size="size"
    :filter-option="filterOption"
    :getPopupContainer="node => node.parentNode"
    :style="'width: ' + width + 'px'"
  >
    <w-select-option v-for="item in unitList" :key="item.dictCode" :value="item.dictCode">{{
      item.dictName
    }}</w-select-option>
  </w-select>
</template>
<script>
import { getPointUnitApi } from '@/api/public';
export default {
  name: 'UnitSelect',
  props: {
    value: {
      type: [String, Array],
      default() {
        return undefined;
      }
    },
    size: {
      type: String,
      default: 'default'
    },
    placeholder: {
      type: String,
      default: '请选择单位'
    },
    disabled: Boolean,
    allowClear: Boolean,
    mode: {
      type: String,
      default() {
        return 'default';
      }
    },
    width: {
      type: Number,
      default: 120
    },
    showAll: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      selectValue: this.mode === 'multiple' ? [] : undefined,
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
      if (this.$store.state.unitList.length > 0) {
        this.unitList = this.$store.state.unitList;
      } else {
        const { resultData } = await getPointUnitApi();
        this.$store.commit('setUnit', resultData);
        this.unitList = resultData;
      }
      if (this.showAll) {
        this.unitList = [{ dictCode: '', dictName: '无' }].concat(this.unitList);
      }
      this.selectValue = this.value;
      this.$emit('input', this.selectValue);
    },
    change(val) {
      this.$emit('input', val);
      this.$emit('change', val);
    },
    filterOption(input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      );
    }
  }
};
</script>
