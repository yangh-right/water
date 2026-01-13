<!--
 * @Description: 门禁管理
 * @Author: liuct
 * @Date: 2021-06-23 15:25:29
 * @LastEditTime: 2024-07-26 10:28:07
 * @LastEditors:  Do not edit
-->
<template>
  <div class="door-manage">
    <div class="manage-top">
      <!-- 搜素 -->
      <w-row>
        <w-form-model
          ref="formSearch"
          layout="inline"
          :model="formSearch"
          class="door-query-form"
          @submit="handleSubmit"
          @submit.native.prevent
        >
          <w-col class="supply-float-left">
            <w-form-model-item label="模糊查询" prop="keyword">
              <w-input
                v-model="formSearch.keyword"
                placeholder="输入关键字"
                class="supply-w-full"
              ></w-input>
            </w-form-model-item>
          </w-col>
          <w-col class="supply-float-right">
            <w-form-model-item>
              <w-button icon="reload" @click="reset">重置</w-button>
              <w-button class="supply-ml-3" type="primary" icon="search" html-type="submit"
                >查询</w-button
              >
              <return-control class="supply-ml-3" :is-drill-down="true"></return-control>
            </w-form-model-item>
          </w-col>
        </w-form-model>
      </w-row>
    </div>
    <div class="manage-body supply-bg-bg-card-DEFAULT">
      <div class="content-block">
        <!-- 门禁管理 -->
        <door-device ref="device"></door-device>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import DoorDevice from './doorDevice.vue';
export default {
  name: 'DoorManage',
  components: {
    DoorDevice
  },
  data() {
    return {
      formSearch: {
        keyword: '',
        accStatus: 'all'
      }
    };
  },
  computed: {
    ...mapState('setting', ['searchKey'])
  },
  watch: {
    searchKey: {
      handler(val) {
        if (
          val &&
          this.$route.query.code === 'search' &&
          this.$route.path === '/runMonitor/doorManage'
        ) {
          this.formSearch.keyword = val;
          this.handleSubmit();
        }
      },
      immediate: true
    }
  },
  activated() {
    if (this.$route.query.code === 'search') {
      this.formSearch.keyword = this.searchKey;
      this.$nextTick(() => {
        this.handleSubmit();
      });
    }
  },
  mounted() {
    this.$refs.device.getAccessDevice();
  },
  methods: {
    handleSubmit() {
      const params = {
        keyword: this.formSearch.keyword,
        currentPage: 1
      };
      this.$refs.device && this.$refs.device.getAccessDevice(params);
    },
    reset() {
      this.$refs.formSearch.resetFields();
      this.handleSubmit();
    }
  }
};
</script>

<style lang="less" scoped>
.door-manage {
  height: 100%;
  .manage-top {
    padding: 4px 24px;
    margin-bottom: 10px;
    width: 100%;
    background: var(--supply-color-bg-card-DEFAULT);
  }
  .manage-body {
    height: calc(100% - 62px);
    border-radius: 4px;

    .content-block {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
