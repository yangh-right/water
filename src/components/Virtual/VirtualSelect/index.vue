<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2023-08-09 15:10:44
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2024-09-14 16:46:59
 * @Description: 
-->
<template>
  <w-select
    v-on="new$listeners"
    v-bind="$attrs"
    :placeholder="placeholder"
    v-model="selectItem.label"
  >
    <virtual-list
      slot="dropdownRender"
      :key="searchKey"
      style="max-height: 250px; overflow-y: auto;"
      data-key="value"
      :data-sources="filterOptions"
      :data-component="itemComponent"
      :extra-props="{
        value: selectItem.value,
        clickItem: clickItem
      }"
      :estimate-size="estimateSize"
      :keeps="keeps"
    />
  </w-select>
</template>

<script>
import { cloneDeep } from 'lodash-es';
import virtualList from 'vue-virtual-scroll-list';
import SelectOption from './SelectOption';
export default {
  name: 'VirtualSelect',
  props: {
    value: {
      default: undefined
    },
    replaceFields: {
      type: Object,
      default: () => ({})
    },
    keeps: {
      type: Number,
      default: 30
    },
    estimateSize: {
      type: Number,
      default: 37.99
    },
    placeholder: {
      type: String,
      default: '请选择'
    },
    options: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      searchKey: '',
      filterOptions: [],
      selectItem: { value: undefined, label: undefined },
      itemComponent: SelectOption
    };
  },
  computed: {
    new$listeners() {
      return Object.assign(this.$listeners, {
        change: this.change,
        search: this.search
      });
    }
  },
  watch: {
    value: {
      handler(val) {
        this.selectItem = cloneDeep(
          this.options.find(item => item.value === val) || { value: undefined, label: undefined }
        );
      },
      immediate: true
    },
    options: {
      handler(val) {
        this.options?.forEach(item => {
          Object.keys(this.replaceFields).forEach(key => {
            item[key] = item[this.replaceFields[key]];
          });
        });
        if (val) {
          this.selectItem = cloneDeep(
            this.options.find(item => item.value === this.value) || {
              value: undefined,
              label: undefined
            }
          );
        }
        this.filterOptions = [...this.options];
      },
      immediate: true
    }
  },
  methods: {
    search(val) {
      setTimeout(()=> {
        this.searchKey = val;
        this.filterOptions = this.options.filter(item => item.label.includes(this.searchKey));
        this.$emit('search', val);
      }, 100)
    },
    clickItem(row) {
      let item = cloneDeep(row);
      this.$emit('input', item.value, item);
      this.selectItem = { ...item };
      this.$emit('change', item.value, item);
    },
    change(val) {
      if (val === undefined) {
        let item = { label: undefined, value: undefined };
        this.$emit('input', undefined, item);
        this.selectItem = { ...item };
      }
      this.$emit('change', val);
    }
  }
};
</script>
<style lang="less" scoped></style>
