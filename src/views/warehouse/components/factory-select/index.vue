<!--
 * @Description:
 * @Author: limz
 * @Date: 2021-09-17 17:15:24
 * @LastEditTime: 2022-10-11 14:01:46
 * @LastEditors: yuan wenyu
-->
<template>
  <w-tree-select
    v-model="currentValue"
    :allow-clear="clearable"
    :disabled="disabled"
    :tree-data="orgData"
    :placeholder="placeholderText"
    :not-found-text="noDataText"
    :label-in-value="labelInValue"
    :replace-fields="replaceFields"
    :dropdown-style="{maxHeight: '50vh'}"
    :show-search="true"
    tree-node-filter-prop="title"
    @change="selectChange"
  >
  </w-tree-select>
</template>

<script>
// import { isArray } from 'lodash'
import { GetOrgTreeByUser } from '@/api/home';

  export default {
    name: 'FactorySelect',
    props: {
      clearable: {
        type: Boolean,
        default: true
      },
      disabled: {
        type: Boolean,
        default: false
      },
      labelInValue: {
        type: Boolean,
        default: false
      },
      placeholderText: {
        type: String,
        default: '选择组织'
      },
      noDataText: {
        type: String,
        default: '没有设置组织'
      },
      value: {
        type: Object | Array | String,
        default: () => []
      }
    },
    data() {
      return {
        currentValue: '',
        factoryId: '',
        orgData: [],
        replaceFields: {
          label: 'name',
          key: 'id',
          value: 'id',
          title: 'name'
        }
      };
    },

    watch: {
      value: {
        handler(val) {
          if (this.currentValue !== val) {
            this.currentValue = val;
          }
        },
        immediate: true,
        deep: true
      }
    },

    mounted() {
      this.getTree();
    },

    methods: {
      selectChange(selectedValue) {
        this.$emit('input', selectedValue);
        this.$emit('on-change', selectedValue, arguments[2].triggerNode?.dataRef?.data?.code || '');
      },

      async getTree() {
        let res = await GetOrgTreeByUser();
        if (res.status === 'complete') {
          this.orgData = res.resultData;
          this.$emit('loadOrgTree', this.orgData)
        }
      }
    }

  };
</script>
<style lang="less">
</style>
