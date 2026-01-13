<!--
 * @Author: wangyr
 * @Date: 2023-04-17 17:02:10
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-07-26 16:03:02
 * @Description:
-->
<template>
  <w-detail-header :pageTitle="title" @handleBack="handleOption('handleCancel')">
    <template #extra>
      <w-radio-group
        class="supply-whitespace-nowrap supply-ml-6"
        :value="contentType"
        button-style="solid"
        @change="handlePageChange"
      >
        <template v-for="type in pageList">
          <w-radio-button :key="type.value" :value="type.value">
            {{ type.label }}
          </w-radio-button>
        </template>
      </w-radio-group>
    </template>
    <template>
      <w-button @click="handleOption('handleCancel')">取消</w-button>
      <w-button
        v-if="['add', 'copy', 'edit'].includes(type)"
        style="margin-left: 10px"
        type="primary"
        :loading="loading || deleteLoading"
        @click="handleOption('handleSave')"
        >保存</w-button
      >
      <w-button
        v-if="type === 'detail'"
        style="margin-left: 10px"
        type="primary"
        @click="handleOption('handleEdit')"
      >
        编辑设备
      </w-button>
    </template>
  </w-detail-header>
</template>

<script>
export default {
  name: 'DeviceHeader',
  props: {
    id: {
      type: String,
      default: ''
    },
    contentType: {
      type: String,
      default: 'baseInfo'
    },
    title: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'add'
    },
    devicePointList: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  inject: ['closeTab'],
  data() {
    return {
      pageList: [
        {
          label: '基本信息',
          value: 'baseInfo',
          eventName: 'handleBaseInfo'
        },
        {
          label: '设备生命周期',
          value: 'deviceLife',
          eventName: 'handleDeviceLife'
        }
      ],
      deleteLoading: false
    };
  },
  computed: {},
  methods: {
    handlePageChange(e) {
      let eventName = this.pageList.find(item => item.value === e.target.value).eventName;
      this.$emit(eventName);
    },
    handleOption(key) {
      this.$emit(key);
    }
  }
};
</script>

<style lang="less" scoped></style>
