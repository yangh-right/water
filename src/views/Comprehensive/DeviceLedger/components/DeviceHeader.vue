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
      <!-- <div
        class="life"
        :class="{ active: contentType === 'baseInfo' }"
        @click="handleOption('handleBaseInfo')"
      >
        基本信息
      </div>
      <div
        class="life"
        :class="{ active: contentType === 'deviceLife' }"
        @click="handleOption('handleDeviceLife')"
      >
        设备生命周期
      </div> -->

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
      <w-button @click="handleOption('handleCancel')">返回</w-button>
      <w-button
        v-if="['add', 'edit'].includes(type)"
        style="margin-left: 10px"
        type="primary"
        :loading="loading"
        @click="handleOption('handleSave')"
        >保存</w-button
      >
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
      default: ''
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
          label: '扩展信息',
          value: 'extendInfo',
          eventName: 'handleExtendInfo'
        },
        {
          label: '设备生命周期',
          value: 'deviceLife',
          eventName: 'handleDeviceLife'
        },
        {
          label: '运行分析',
          value: 'runAnalysis',
          eventName: 'handleRunAnalysis'
        }
      ]
    };
  },
  computed: {},
  methods: {
    handlePageChange(e) {
      let eventName = this.pageList.find(item => item.value === e.target.value).eventName;
      this.$emit(eventName);
    },
    handleOption(name) {
      this.$emit(name);
    }
  }
};
</script>

<style lang="less" scoped>
.life {
  cursor: pointer;
  background-color: #f0f5f5;
  border-radius: 8px;
  padding: 0 10px;
  margin-left: 12px;
  font-size: 14px;
  color: black;
}
.active {
  font-size: 14px;
  color: #fff;
  background-color: var(--supply-color-primary-DEFAULT);
}
</style>
