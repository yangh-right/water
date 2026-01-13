<template>
  <div class="device-detail-view full-view">
    <DeviceHeader
      :title="detailTitle"
      :devicePointList="deviceDetail.pointList"
      :id="deviceId"
      :contentType="contentType"
      type="detail"
      @handleCancel="handleCancel"
      @handleDeviceLife="handleDeviceLife"
      @handleBaseInfo="handleBaseInfo"
      @handleEdit="handleEdit"
    ></DeviceHeader>
    <div class="detail-content" v-loading="loading">
      <div v-if="contentType == 'baseInfo'" class="detail-content-left wbgc-card full-view">
        <DetailMessage
          :deviceId="deviceId"
          :deviceDetail="deviceDetail"
          :fileList="fileList"
          @getDeviceDetail="getDeviceDetail"
        ></DetailMessage>
      </div>
      <div v-else class="detail-content-left wbgc-card full-view">
        <div class="steps">
          <step
            v-for="(item, index) in steps"
            :key="item.dictCode"
            :index="index"
            :data="steps"
            :currentStep="currentStep"
            @changeStep="changeStep"
          ></step>
        </div>
        <w-divider
          style="margin: 4px 12px;width:calc(100% - 24px) !important;min-width: 20px !important;"
        />
        <w-spin :spinning="spinning">
          <div class="form-body">
            <w-form-model :model="formData" v-bind="layout" :labelCol="labelColWidth">
              <w-row type="flex" justify="space-between">
                <w-col
                  :span="item.attributeType === 'FILE' ? 24 : 12"
                  v-for="item in formAttributes"
                  :key="item.attributeCode"
                >
                  <w-form-model-item
                    :label="item.attributeName"
                    label-for="selectType"
                    :prop="item.attributeCode"
                    :labelCol="item.attributeType === 'FILE' ? labelColWidth1 : labelColWidth"
                    :wrapperCol="item.attributeType === 'FILE' ? { span: 21 } : { span: 17 }"
                  >
                    <file-list
                      v-if="item.attributeType === 'FILE'"
                      :isEdit="false"
                      :fileCode="item.attributeCode"
                      :fileList="formData[item.attributeCode]"
                    ></file-list>
                    <span v-else>{{ formData[item.attributeCode] }}</span>
                  </w-form-model-item>
                </w-col>
              </w-row>
            </w-form-model>
          </div>
        </w-spin>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import { DsPointList } from '@/api/public';
import { getOneDevice } from '@/api/deviceManagement';
import {
  deviceStageAttributesList,
  deviceStagesList,
  deviceStageValuesByDevice
} from '@/api/deviceLedger';
import step from '../components/step.vue';
import DeviceHeader from '../components/DeviceHeader.vue';
import DetailMessage from '../components/DetailMessage.vue';

export default {
  name: 'DeviceDetail',
  components: {
    DeviceHeader,
    step,
    DetailMessage,
    'file-list': () => import('@/views/pressureEquipments/FileList.vue')
  },
  inject: ['closeTab'],
  data() {
    return {
      loading: false,
      deviceId: undefined,
      spinning: false,
      steps: [],
      contentType: 'baseInfo',
      placeId: '', // 构筑物id
      formData: {},
      deviceDetail: {},
      addInfoForm: {},
      addInfoFormRule: {},
      addInfoFormRule1: {}, // 添加缺失的属性
      formAttributes: [],
      labelColWidth1: {
        span: 3
      },
      labelColWidth: {
        span: 7
      },
      equipmentType: '',
      currentStep: '', // 添加缺失的currentStep属性
      deviceStageValuesType: 'add', // 添加缺失的属性
      realData: {}, // 添加缺失的属性
      layout: {
        colon: true, // 冒号
        span: 7,
        wrapperCol: { span: 17 },
        gutter: [12, 8] //栅格间隔[水平间距，垂直间距]
      }
    };
  },
  computed: {
    detailTitle() {
      return '设备档案 - ' + (this.deviceDetail?.deviceName || '');
    },
    fileList() {
      let list = [];
      if (this.deviceDetail?.videoDetailList?.length) {
        list = [
          ...list,
          ...(this.deviceDetail.videoDetailList || []).map((i, index) => {
            return {
              fileType: -1,
              fileName: i.videoName,
              fileId: i.videoId,
              showVideo: index === 0 ? true : false,
              ...i
            };
          })
        ];
      }
      if (this.deviceDetail?.fileList?.length) {
        list = [...list, ...this.deviceDetail.fileList];
      }
      return list;
    }
  },
  watch: {},
  activated() {
    this.deviceDetail = {};
    const query = this.$route.query;
    if (query?.id) {
      this.deviceId = query.id;
      this.placeId = query.placeId || '';
      this.getDeviceDetail();
      this.getDeviceStagesList();
    }
  },
  methods: {
    // 获取设备详情
    async getDeviceStagesList() {
      const { resultData, status } = await deviceStagesList();
      if (status === 'complete' && resultData && resultData.length) {
        this.steps = resultData.map(item => {
          return {
            value: String(item.id),
            label: item.stageName
          };
        });
        if (this.steps.length > 0) {
          this.currentStep = this.steps[0].value || '';
          this.getDeviceStageDetail();
        }
      }
    },
    async getDeviceStageDetail() {
      this.addInfoFormRule1 = {};
      this.spinning = true;
      const { resultData, status } = await deviceStageAttributesList(this.currentStep);
      if (status === 'complete' && resultData && resultData.length) {
        this.formAttributes = resultData.map(item => {
          if (item.isNodeTime || item.isHandler) {
            this.addInfoFormRule1[item.attributeCode] = [
              { required: true, message: item.attributeName + '不能为空', trigger: 'change' }
            ];
          }
          if (item.attributeType === 'DATE') {
            item.attributeValue = '';
          } else if (item.attributeType === 'FILE') {
            item.attributeValue = [];
          } else {
            item.attributeValue = '';
          }
          return item;
        });
        this.getFieldsValues();
      } else {
        this.spinning = false;
      }
    },
    async getFieldsValues() {
      let params = {
        deviceId: this.deviceId,
        deviceType: this.equipmentType,
        stageId: this.currentStep
      };
      let { resultData, status } = await deviceStageValuesByDevice(params);
      if (status === 'complete') {
        this.spinning = false;
        if (resultData && resultData.length && resultData[0]) {
          this.deviceStageValuesType = 'edit';
          this.realData = resultData[0];

          // 确保resultData[0]是数组
          if (Array.isArray(resultData[0])) {
            this.formAttributes.forEach(item => {
              const foundItem = resultData[0].find(v => v.attributeId === item.id);
              if (foundItem) {
                item.attributeValue = foundItem.attributeValue || '';
              }
            });
          }

          this.formAttributes.forEach(v => {
            if (v.attributeType === 'FILE') {
              try {
                this.formData[v.attributeCode] = v.attributeValue
                  ? JSON.parse(v.attributeValue)
                  : [];
              } catch (error) {
                console.warn('解析文件数据失败:', error);
                this.formData[v.attributeCode] = [];
              }
            } else {
              this.formData[v.attributeCode] = v.attributeValue;
            }
          });
        } else {
          this.deviceStageValuesType = 'add';
        }
      }
    },
    handleDeviceLife() {
      this.contentType = 'deviceLife';
    },
    handleBaseInfo() {
      this.contentType = 'baseInfo';
    },
    changeStep(data) {
      if (data) {
        this.currentStep = data;
        this.getDeviceStageDetail();
      }
    },
    // 获取设备详情
    async getDeviceDetail() {
      this.loading = true;
      let params = {
        deviceId: this.deviceId
      };
      try {
        const { resultData } = await getOneDevice(params);
        this.loading = false;
        if (resultData) {
          this.deviceDetail = resultData;
        }
      } catch (error) {
        console.error('获取设备详情失败:', error);
        this.loading = false;
      }
    },
    // 返回
    handleCancel() {
      const { query } = this.$route;
      if (query?.from) {
        this.goto({
          path: '/Comprehensive/Specifications/' + query.from,
          query: { deviceModelId: this.deviceDetail?.deviceModelId || '' }
        });
      } else {
        this.closeTab();
        this.goto('/Comprehensive/Device');
      }
    },
    handleEdit() {
      if (this.deviceId) {
        this.closeTab();
        this.goto({
          path: '/Comprehensive/Device/edit',
          query: {
            type: 'edit',
            id: this.deviceId,
            placeId: this.placeId || '',
            deviceTime: new Date().getTime(),
            from: 'deviceDetail'
          }
        });
      }
    }
  }
};
</script>

<style lang="less" scoped>
.device-detail-view {
  width: 100%;
  .detail-content {
    height: calc(100% - 77px);
    display: flex;
    flex-direction: row;
    position: relative;
    .detail-content-right {
      margin-left: 10px;
      width: 240px;
    }
  }
  .detail-content-left {
    flex: 1;
    overflow: auto;
    padding-top: 12px;
    .steps {
      padding-left: 30px;
      width: 100%;
      display: flex;
      justify-content: flex-start;
      flex-flow: row wrap;
    }
  }
}
</style>
