<template>
  <div>
    <w-tabs class="detail-tabs" :activeKey="activeKey" @change="changeActiveKey">
      <w-tab-pane key="4" tab="知识库" class="tab-pane">
        <div class="tab-title">技术资料</div>
        <div class="tab-item">
          <span class="item-label">主要性能指标</span>
          <span class="item-value">
            {{ (deviceModelDetail && deviceModelDetail.devicePerformanceIndex) || '--' }}
          </span>
        </div>
        <div class="tab-item" v-show="deviceModelDetail && deviceModelDetail.deviceAttachment">
          <span class="item-label">配套主要附件</span>
          <span class="item-value">
            {{ deviceModelDetail && deviceModelDetail.deviceAttachment }}</span
          >
        </div>
        <div class="tab-item tab-file-item" v-show="fileList.length">
          <span class="item-label">设备技术文件</span>
          <span class="item-value" v-for="file of fileList" :key="file.id">
            <FileItem :file="file"></FileItem>
          </span>
        </div>
      </w-tab-pane>
      <w-tab-pane key="5" tab="采购及出厂" class="tab-pane">
        <div class="tab-title">出厂信息</div>
        <div class="factory-info">
          <div class="factory-info-item">
            <span class="item-label">出厂日期</span>
            <span class="item-value">{{ outFactoryTime || '--' }}</span>
          </div>
        </div>
        <w-divider></w-divider>
        <div class="tab-title">采购信息</div>
        <div class="tab-item">
          <span class="item-text">供应商</span>
          <w-button type="link" @click="ejectSupplierDetail(deviceDetail.supplier)">
            {{ (deviceDetail.supplier && deviceDetail.supplier.name) || '--' }}
          </w-button>
          <span class="item-value">
            地址：{{ (deviceDetail.supplier && deviceDetail.supplier.address) || '--' }}，电话：{{
              (deviceDetail.supplier && deviceDetail.supplier.contactsPhone) || '--'
            }}
          </span>
        </div>
        <div class="tab-item" v-show="deviceDetail.manufacturer">
          <span class="item-text">生产厂商</span>
          <w-button type="link" @click="ejectSupplierDetail(deviceDetail.manufacturer)">
            {{ (deviceDetail.manufacturer && deviceDetail.manufacturer.name) || '--' }}
          </w-button>
          <span class="item-value">
            地址：{{
              (deviceDetail.manufacturer && deviceDetail.manufacturer.address) || '--'
            }}，电话：{{
              (deviceDetail.manufacturer && deviceDetail.manufacturer.contactsPhone) || '--'
            }}
          </span>
        </div>
      </w-tab-pane>
    </w-tabs>
  </div>
</template>

<script>
import FileItem from '@/components/Uploader/file-item.vue';
import dayjs from 'dayjs';
export default {
  name: 'DetailTabs',
  props: {
    deviceId: {
      type: String,
      default: ''
    },
    deviceDetail: {
      type: Object,
      default: () => {}
    },
    deviceModelDetail: {
      type: Object,
      default: () => {}
    }
  },
  components: { FileItem },
  data() {
    return {
      modalInfo: {},
      activeKey: '4'
    };
  },
  computed: {
    outFactoryTime() {
      let time = this.deviceDetail.outFactoryTime
        ? this.$moment(this.deviceDetail.outFactoryTime).format('YYYY/MM/DD')
        : '--';
      return time;
    },
    fileList() {
      if (this.deviceModelDetail?.fileList) {
        return this.deviceModelDetail.fileList.filter(i => i.fileType === 2);
      }
      return {};
    }
  },
  watch: {},
  created() {},
  methods: {
    changeActiveKey(key) {
      this.activeKey = key;
    }
  }
};
</script>

<style lang="less" scoped>
.detail-tabs {
  margin-top: 20px;
  width: 100%;
  padding: 10px 30px;
  /deep/ .wpg-tabs-bar {
    width: 700px;
    .wpg-tabs-tab {
      margin: 0;
      text-align: center;
      width: 140px;
    }
  }
  .tab-pane {
    padding-top: 10px;
    padding-left: 24px;
    .tab-title {
      color: #333;
      font-size: 16px;
      font-weight: 500;
    }
    .factory-info {
      display: flex;
      flex-direction: row;
      .factory-info-item {
        padding-top: 12px;
        padding-bottom: 10px;
        width: 30%;
      }
    }
    .tab-item {
      padding-top: 12px;
    }
    .tab-file-item {
      display: flex;
      justify-content: flex-start;
      .item-value {
        margin-right: 26px;
      }
    }
    .item-label {
      color: #999;
    }
    .item-text {
      display: inline-block;
      width: 60px;
      color: #999;
    }
    .item-value {
      margin-left: 12px;
    }
  }
}
</style>
