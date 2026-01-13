<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2023-04-12 09:47:12
 * @LastEditors:  Do not edit
 * @LastEditTime: 2024-04-11 14:06:55
 * @Description:
-->
<template>
  <w-select
    v-bind="$attrs"
    v-model="selectValue"
    @change="change"
    placeholder="请选择污水厂"
    :disabled="disabled"
    :allowClear="allowClear"
    :mode="mode"
    :getPopupContainer="node => node.parentNode"
  >
    <w-select-option v-for="item in factoryList" :key="item.id" :value="item.id">{{
      item.stationName
    }}</w-select-option>
  </w-select>
</template>

<script>
export default {
  name: 'FactorySelect',
  props: {
    value: {
      type: [String, Array],
      default() {
        return undefined;
      }
    },
    disabled: Boolean,
    allowClear: Boolean,
    showAll: Boolean,
    autoSelect: Boolean, // 为true则自动选择第一个污水厂
    mode: {
      type: String,
      default() {
        return 'default';
      }
    }
  },
  data() {
    return {
      selectValue: this.mode === 'multiple' ? [] : undefined,
      factoryList: []
    };
  },
  watch: {
    value(val) {
      this.selectValue = val;
    }
  },
  methods: {
    async getFactoryList() {
      if (this.$store.state.factoryList.length > 0) {
        this.factoryList = this.$store.state.factoryList;
      } else {
        const { resultData } = await this.$http.post('waterPlantClient/getWaterPlants');
        this.$store.commit('setFactory', resultData);
        this.factoryList = resultData;
      }
      if (this.showAll) {
        this.factoryList = [{ id: '', stationName: '全部' }].concat(this.factoryList);
      }
      this.selectValue = this.value;
      // 选择第一项
      if (this.autoSelect && !this.selectValue) {
        let index = this.showAll ? 1 : 0;
        this.selectValue = this.factoryList[index].id;
      }
      this.$emit('input', this.selectValue);
    },
    change(val) {
      this.$emit('input', val);
      this.$emit('change', val);
    }
  },
  created() {
    this.getFactoryList();
  }
};
</script>

<style scoped lang="less"></style>
