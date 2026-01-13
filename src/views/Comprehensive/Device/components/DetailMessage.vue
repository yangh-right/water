<template>
  <div class="detail-message">
    <div class="message-title">
      基本信息
    </div>
    <div class="message-content">
      <div class="content">
        <div class="content-header">
          <div v-for="opt in processedBaseFields" :key="opt.name" class="header-item">
            <span class="item-label">{{ opt.label }}：</span>
            <span class="item-value">{{ opt.value }}</span>
          </div>
        </div>
        <w-divider></w-divider>
      </div>
    </div>
    <div class="message-title">
      运维信息
    </div>
    <div class="message-content">
      <div class="content">
        <div class="content-header">
          <div v-for="opt in processedUseFields" :key="opt.name" class="header-item">
            <span class="item-label">{{ opt.label }}：</span>
            <template v-if="opt.name === 'fileList' || opt.name === 'videoDetailList'">
              <span class="item-value">
                <DeviceMedia v-model="myFileList" :isEdit="false"></DeviceMedia>
              </span>
            </template>
            <template v-else>
              <span class="item-value">{{ opt.value }}</span>
            </template>
          </div>
          <div class="header-item">
            <div class="item-label">行业设备及监测量</div>
            <div class="item-value">
              <span v-if="deviceDetail.deviceName">{{ deviceDetail.deviceName }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { monitorDetailColumns, baseFields, useFields } from '../config';
import dayjs from 'dayjs';
import { sysDictListByCode } from '@/api/manage';
import serverConfig from '@/config/server.config';
import { mapGetters } from 'vuex';
import DeviceMedia from '@/views/Comprehensive/components/DeviceMedia.vue';

export default {
  name: 'DetailMessage',
  components: { DeviceMedia },
  props: {
    deviceId: {
      type: String,
      default: ''
    },
    fileList: {
      type: Array,
      default: () => []
    },
    deviceDetail: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      loading: false,
      monitorColumns: monitorDetailColumns,
      dataSource: [],
      deviceGradeList: [],
      deviceGradeName: {}
    };
  },
  computed: {
    ...mapGetters('device', ['currentDeviceType']),

    myFileList() {
      return this.fileList.filter(a => a.fileType !== 2) || [];
    },

    iotFlag() {
      return this.$route.query.iotFlag === 'true';
    },

    qrCode() {
      return `${serverConfig.IMG_BASE_URL}${this.deviceDetail?.qrCode}`;
    },

    // 处理基本信息字段
    processedBaseFields() {
      return baseFields.map(field => {
        // 设备分类
        if (field.name === 'deviceType') {
          return {
            ...field,
            value: this.deviceDetail.deviceTypeName || ''
          };
        }
        // 设备分级
        if (field.name === 'deviceGrade') {
          return {
            ...field,
            value: this.deviceGradeName[this.deviceDetail.deviceGrade] || ''
          };
        }
        return {
          ...field,
          value: this.deviceDetail[field.name] || ''
        };
      });
    },

    // 处理运维信息字段
    processedUseFields() {
      // 过滤掉设备照片视频字段
      return useFields.map(field => ({
        ...field,
        value: this.deviceDetail[field.name] || ''
      }));
    }
  },
  created() {
    console.log('this.deviceDetail', this.deviceDetail);
    this.sysDictListByCode('device_grade', 'deviceGrade');
  },
  methods: {
    async sysDictListByCode(code, data) {
      const res = await sysDictListByCode(code);
      this[`${data}List`] = res.resultData.map(item => {
        return {
          ...item,
          label: item.dictName,
          value: item.dictValue
        };
      });
      this[`${data}Name`] = this[`${data}List`].reduce((acc, item) => {
        acc[item.dictValue] = item.dictName;
        return acc;
      }, {});
    },
    /**
     * 跳转到规格详情页
     */
    handleSpecificationsDetail() {
      this.goto({
        path: '/Comprehensive/Specifications/detail',
        query: {
          deviceModelId: this.deviceDetail.deviceModelId,
          deviceId: this.deviceId,
          fromDevice: 'detail'
        }
      });
    },

    /**
     * 处理删除操作
     * @param {Object} row - 要删除的行数据
     */
    handleDelete(row) {
      const devicePointList = this.deviceDetail.devicePointList || [];

      if (devicePointList.length === 1) {
        this.$confirm({
          title: '非常抱歉，IoT设备至少需要关联1个监测量，无法删除！',
          okText: '关闭',
          cancelButtonProps: { style: { display: 'none' } },
          centered: true
        });
        return;
      }

      this.$confirm({
        title: '删除该监测量后将无法获得数据，确定删除吗？',
        okText: '确定删除',
        cancelText: '取消',
        onOk: () => this.deleteMonitor(row),
        onCancel: () => {}
      });
    },

    /**
     * 删除监测量
     * @param {Object} row - 要删除的行数据
     */
    async deleteMonitor(row) {
      try {
        const { success } = await this.$http.post('/sewageDeviceApi/Device/delDevicePoint', {
          id: this.deviceId,
          delPointIdList: [row.id]
        });

        if (success) {
          this.$emit('getDeviceDetail');
          this.$message.success('删除成功！');
        }
      } catch (error) {
        console.error('删除监测量失败:', error);
        this.$message.error('删除失败，请重试！');
      }
    }
  }
};
</script>

<style lang="less" scoped>
.detail-message {
  width: 100%;

  .message-title {
    padding: 16px 16px;
    color: #333;
    font-size: 16px;
    font-weight: 500;
  }

  .message-content {
    padding: 0px 16px;
    display: flex;
    flex-direction: row;

    .content {
      flex: 1;
      padding: 0 16px 0 24px;

      .content-header {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;

        .header-item {
          width: calc(50% - 20px);
          padding-bottom: 8px;
          line-height: 42px;
        }

        .header-special {
          width: calc(100% - 40px);
        }
      }

      .item-label {
        color: var(--supply-color-third);
      }

      .item-value {
        margin-left: 12px;
        color: var(--supply-color-main);
      }
    }
  }
}
</style>
