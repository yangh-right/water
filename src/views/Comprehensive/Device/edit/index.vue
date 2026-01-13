<template>
  <div class="device-edit full-view">
    <DeviceHeader
      :title="editTitle"
      :type="type"
      :id="id"
      :contentType="contentType"
      :devicePointList="devicePointList"
      :loading="btnLoading"
      @handleCancel="handleCancel"
      @handleBaseInfo="handleBaseInfo"
      @handleDeviceLife="handleDeviceLife"
      @handleSave="handleSave"
    ></DeviceHeader>
    <div class="device-edit-content wbgc-card" v-loading="loading">
      <div v-show="contentType == 'baseInfo'" class="detail-content-left wbgc-card full-view">
        <BaseInfo
          ref="baseInfo"
          :type="type"
          :deviceId="id"
          :form="form"
          :validate.sync="validateOptions.baseInfo"
        ></BaseInfo>
        <UseInfo
          ref="useInfo"
          :form="form"
          :deviceNo.sync="deviceNo"
          :validate.sync="validateOptions.useInfo"
          @waterPlantChange="waterPlantChange"
        ></UseInfo>

        <div class="content-monitor">
          <div class="form-title">行业设备及监测量</div>
          <div class="industry-device">
            关联行业设备：
            <span v-if="industryDeviceItem.deviceName">{{ industryDeviceItem.deviceName }}</span>
            <w-button type="link" icon="ic_add" @click="handleIndustryDeviceChoose"
              >请选择行业设备</w-button
            >
          </div>
          <div v-if="form.deviceParentType === 'purification_Y'" class="form-pointName">
            <div class="form-label">关联监测量:</div>
            <w-select
              style="width: 202px"
              v-model="form.pointName"
              placeholder="请选择监测量"
              allowClear
            >
              <w-select-option v-for="opt of devicePointList" :key="opt.realPointCode">{{
                opt.realPointMemo
              }}</w-select-option>
            </w-select>
          </div>
        </div>
      </div>
      <div v-show="contentType == 'deviceLife'" class="detail-content-left wbgc-card full-view">
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
          style="margin: 4px 0px 4px 24px;width:calc(100% - 24px) !important;min-width: 20px !important;"
        />
        <w-spin :spinning="spinning">
          <div class="form-body">
            <w-form-model
              v-show="showFile"
              ref="addInfoFormRule1"
              :model="formData"
              :rules="addInfoFormRule1"
              v-bind="layout"
              :labelCol="labelColWidth"
            >
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
                    <w-date-picker
                      v-if="item.attributeType === 'DATE'"
                      v-model="formData[item.attributeCode]"
                      style="width:100%"
                      placeholder="请输入"
                      allowClear
                    />
                    <file-list
                      v-else-if="item.attributeType === 'FILE'"
                      :fileCode="item.attributeCode"
                      :fileList="formData[item.attributeCode]"
                      @deleteFile="deleteFile"
                      @uploadFile="uploadFile"
                    ></file-list>
                    <w-input
                      v-else
                      v-model="formData[item.attributeCode]"
                      placeholder="请输入"
                      style="width: 100%"
                    ></w-input>
                  </w-form-model-item>
                </w-col>
              </w-row>
            </w-form-model>
          </div>
        </w-spin>
      </div>
    </div>
    <IndustryDevice
      :visible.sync="industryVisible"
      :waterPlantId="form.waterPlantId"
      :deviceId="id"
      :placeId="placeId"
      :industryDeviceItem.sync="industryDeviceItem"
    />
  </div>
</template>

<script>
import debounce from 'lodash/debounce';
import { monitorColumns, addForm } from '../config';
import step from '../components/step.vue';
import DeviceHeader from '../components/DeviceHeader.vue';
import BaseInfo from '../components/BaseInfo.vue';
import UseInfo from '../components/UseInfo.vue';
import IndustryDevice from '@/views/Comprehensive/Device/components/IndustryDevice';
import { cloneDeep } from 'lodash';
import { mapState } from 'vuex';
import {
  selectIndustryList,
  queryIndustryPointByIndustryDeviceIds,
  DsPointList
} from '@/api/public';
import { allPointList } from '@/api/runTime';
import {
  deviceStageAttributesList,
  deviceStagesList,
  deviceStageValuesAdd,
  deviceStageValuesEdit,
  deviceStageValuesByDevice
} from '@/api/deviceLedger';
import {
  createDevice,
  updateDevice,
  getOneDevice,
  getOneDeviceModel,
  getIndustryPointForecastCodeList
} from '@/api/deviceManagement';
const LOAD_NUM = 50; // 加载条数--可自定义

export default {
  name: 'DeviceEdit',
  components: {
    DeviceHeader,
    BaseInfo,
    UseInfo,
    IndustryDevice,
    step,
    FileList: () => import('@/views/pressureEquipments/FileList.vue')
  },
  inject: ['closeTab'],
  props: {
    type: {
      // 判断【新增】还是【编辑】还是【复制新增】
      type: String,
      default: 'edit'
    }
  },
  data() {
    this.handleScroll = debounce(this.handlePopupScroll, 150);
    return {
      loading: false,
      btnLoading: false,
      id: undefined,
      deviceId: undefined,
      equipmentType: '',
      placeId: '', // 构筑物id
      deviceModelId: undefined,
      form: cloneDeep(addForm),
      monitorColumns,
      validateOptions: {
        baseInfo: false,
        useInfo: false
      },
      formAttributes: [],
      labelColWidth1: {
        span: 3
      },
      labelColWidth: {
        span: 7
      },
      layout: {
        colon: true, // 冒号
        span: 7,
        wrapperCol: { span: 17 },
        gutter: [12, 8] //栅格间隔[水平间距，垂直间距]
      },
      formData: {},
      addInfoFormRule1: {},
      spinning: false,
      showFile: true,
      contentType: 'baseInfo',
      refreshKey: 1,
      deviceNo: '',
      industryVisible: false,
      industryDeviceItem: {},
      pointsList: [],
      pointsAllList: [],
      renderedOptions: [],
      searchVal: '',
      devicePointList: [],
      currentStep: '',
      steps: []
    };
  },
  computed: {
    ...mapState('account', ['user']),
    editTitle() {
      return this.type === 'edit' ? '编辑设备' : '新增设备';
    }
  },
  watch: {
    industryDeviceItem(val) {
      if (val.deviceId) {
        this.getIndustryPoints();
      }
    },
    refreshKey() {
      if (this.deviceModelId) {
        let { deviceType, manufacturerId, deviceModelName } = this.$route.query;
        this.form = cloneDeep(addForm);
        this.form.deviceModelId = this.deviceModelId;
        if (deviceType && manufacturerId) {
          this.form.deviceType = deviceType;
          this.form.manufacturerId = manufacturerId;
          this.form.deviceModelName = deviceModelName;
        }
      } else {
        this.industryDeviceItem = {};
        this.devicePointList = [];
        this.getOneDevice();
      }
    },
    'form.iotFlag'(val) {
      if (!this.form.iotFlag) {
        this.industryDeviceItem = {};
        this.devicePointList = [];
      }
    }
  },
  created() {},
  async activated() {
    if (this.type === 'add') {
      this.form = cloneDeep(addForm);
      this.industryDeviceItem = {};
      this.devicePointList = [];
    }
    let { id, deviceModelId, placeId, deviceTime } = this.$route.query;
    if (deviceTime) {
      this.refreshKey = deviceTime;
    }
    if (placeId) {
      this.placeId = placeId;
      this.getPointList();
    }
    this.id = id;
    this.deviceId = id;
    this.deviceModelId = deviceModelId;
    this.equipmentType = this.$route.query.equipmentType;
    // 设备型号-添加设备时，获取iotFlag
    if (this.deviceModelId) {
      let params = {
        id: this.deviceModelId
      };
      let { resultData } = await getOneDeviceModel(params);
      this.form.iotFlag = resultData.iotFlag;
    }
    this.getDeviceStagesList();
  },
  methods: {
    async getPointList() {
      let params = {
        placeId: this.placeId,
        placeRelated: false
      };
      const { resultData } = await allPointList(params);
      this.pointsAllList = JSON.parse(JSON.stringify(resultData));
      this.pointsList = resultData.map(p => {
        return {
          label: p.pointMemo,
          value: p.pointName,
          key: p.pointName
        };
      });
      this.renderedOptions = this.pointsList.slice(0, LOAD_NUM);
    },
    // 文本框值变化时触发 -- 从数据源中过滤出含搜索内容的数据，并取过滤结果的前n条作为下拉列表的可选项
    handleSearch(val) {
      this.searchVal = val;
      let filterList = [];
      if (val) {
        filterList = this.pointsList.filter(item => {
          let value = item.value + item.label;
          if (value.indexOf(val) > -1) return item;
        });
      } else {
        filterList = this.pointsList;
      }
      this.filterDataList = filterList;
      let arr = filterList.length < LOAD_NUM ? filterList : filterList.slice(0, LOAD_NUM);
      this.$set(this, 'renderedOptions', arr);
    },
    // 滚动时触发（防止抖动）
    handlePopupScroll() {
      if (this.searchVal === '') {
        this.loadMoreData(this.pointsList);
      } else {
        this.loadMoreData(this.filterDataList);
      }
    },
    // 加载更多数据到select框
    loadMoreData(dataList) {
      const renderedLen = this.renderedOptions.length; // 已渲染的下拉列表长度
      const totalLen = dataList.length; // 当前数据源的长度
      let addList = [];
      if (renderedLen < totalLen) {
        if (renderedLen + LOAD_NUM <= totalLen) {
          addList = dataList.slice(renderedLen, renderedLen + LOAD_NUM);
        } else {
          addList = dataList.slice(renderedLen, renderedLen + (totalLen % LOAD_NUM));
        }
        this.renderedOptions = this.renderedOptions.concat(addList);
      }
    },
    // 被选中时调用，参数为选中项的 value (或 key) 值
    handleSelect(val, row) {
      const selectedObj = this.pointsAllList.find(item => item.pointMemo === val);
      row.pointName = selectedObj.pointName;
      row.pointMemo = selectedObj.pointMemo;
      row.pointUnit = selectedObj.pointUnit;
      row.id = selectedObj.id;
    },
    // 获取设备详情
    async getDeviceStagesList() {
      const { resultData, status } = await deviceStagesList();
      if (status === 'complete') {
        this.steps = resultData.map(item => {
          return {
            value: String(item.id),
            label: item.stageName
          };
        });
        this.currentStep = this.steps[0].value || '';
        this.getDeviceStageDetail();
      }
    },
    changeStep(data) {
      this.currentStep = data;
      this.getDeviceStageDetail();
    },
    async getDeviceStageDetail() {
      this.addInfoFormRule1 = {};
      const { resultData, status } = await deviceStageAttributesList(this.currentStep);
      if (status === 'complete') {
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
        this.getValues();
      }
    },
    async getValues() {
      let params = {
        deviceId: this.deviceId,
        deviceType: this.equipmentType,
        stageId: this.currentStep
      };
      const { resultData, status } = await deviceStageValuesByDevice(params);
      if (status === 'complete') {
        if (resultData.length) {
          this.deviceStageValuesType = 'edit';
          this.realData = resultData[0];
          this.formAttributes.map(item => {
            item.attributeValue =
              resultData[0].find(v => v.attributeId === item.id).attributeValue || '';
            return item;
          });
          this.formAttributes.forEach(v => {
            if (v.attributeType === 'FILE') {
              this.$set(
                this.formData,
                v.attributeCode,
                v.attributeValue ? JSON.parse(v.attributeValue) : []
              );
            } else {
              this.$set(this.formData, v.attributeCode, v.attributeValue);
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
      console.log('11111');
      this.contentType = 'baseInfo';
    },
    uploadFile(data, code) {
      if (!this.formData[code]) this.formData[code] = [];
      this.formData[code].push(data);
      this.showFile = false;
      this.$nextTick(() => {
        this.showFile = true;
      });
    },
    deleteFile(id, code) {
      let index = this.formData[code].findIndex(v => v.id === id);
      this.formData[code].splice(index, 1);
    },
    uploadFile(data, code) {
      if (!this.formData[code]) this.formData[code] = [];
      this.formData[code].push(data);
      this.showFile = false;
      this.$nextTick(() => {
        this.showFile = true;
      });
    },
    deleteFile1(id, code) {
      let index = this.addInfoForm[code].findIndex(v => v.id === id);
      this.addInfoForm[code].splice(index, 1);
    },
    async getOneDevice() {
      if (!this.id) {
        return;
      }
      this.loading = true;
      let params = {
        deviceId: this.id
      };
      let { resultData } = await getOneDevice(params);
      let iotFlag = resultData.iotFlag;
      if (iotFlag) {
        await this.getIndustryItem(resultData.industryDeviceId);
      }
      let keys = Object.keys(resultData);
      keys.forEach(key => {
        switch (key) {
          case 'deviceStatus':
            resultData[key] =
              typeof resultData[key] === 'number' ? String(resultData[key]) : undefined;
            break;
          case 'deviceModelId':
          case 'waterPlantId':
          case 'responsibleUser':
          case 'deviceModelName':
          case 'manufacturerId':
          case 'supplierId':
          case 'installAddress':
            resultData[key] = resultData[key] ? resultData[key] : undefined;
            break;
          case 'outFactoryTime':
          case 'openDate':
            resultData[key] = resultData[key]
              ? this.$moment(resultData[key]).format('YYYY-MM-DD')
              : undefined;
            break;
          case 'devicePointList':
            resultData[key] = resultData[key].map(i => {
              return {
                isRepeat: false,
                ...i
              };
            });
            // this.devicePointList = resultData[key]
            break;
          case 'fileList':
            if (this.type === 'edit') {
              resultData.deviceFileList = resultData.fileList;
            }
            break;
          case 'allPositionIds':
          case 'allMonitoringIds':
            resultData[key] = resultData[key].filter(i => !!i);
            break;
          case 'videoIdList':
            resultData.videoIdList = resultData.videoDetailList.map(i => i.id);
            break;
        }
      });
      if (this.type === 'copy') {
        this.form = {
          iotFlag: resultData.iotFlag,
          ...resultData,
          devicePointList: [],
          deviceFileList: []
        };
      } else {
        this.form = keys?.length
          ? { iotFlag: resultData.iotFlag, ...resultData }
          : cloneDeep(addForm);
      }
      if (iotFlag) this.form.iotFlag = true;
      if (this.type === 'edit') {
        setTimeout(() => {
          this.loading = false;
        }, 200);
      } else {
        this.loading = false;
      }
    },
    handleCancel() {
      this.$confirm({
        title: '返回后将无法保留当前编辑信息，确定返回吗？',
        okText: '返回',
        cancelText: '取消',
        onOk: () => {
          this.$refs['baseInfo'].resetFields();
          this.$refs['useInfo'].resetFields();
          this.closeTab();
          let { deviceModelId, from } = this.$route.query;
          if (from === 'detail') {
            this.goto({
              path: '/Comprehensive/Specifications/detail',
              query: { deviceModelId: deviceModelId }
            });
          } else if (from === 'deviceDetail') {
            this.goto({
              path: '/Comprehensive/Device/detail',
              query: { id: this.id, deviceTime: new Date().getTime() }
            });
          } else if (deviceModelId) {
            this.goto('/Comprehensive/Specifications');
          } else {
            this.goto('/Comprehensive/Device');
          }
        },
        onCancel: () => {}
      });
    },
    // 保存
    handleSave() {
      if (this.contentType === 'baseInfo') {
        this.handleSaveBaseInfo();
      } else {
        this.handleSaveDeviceLife();
      }
    },
    handleSaveBaseInfo() {
      this.$refs['baseInfo'].formValidate();
      this.$refs['useInfo'].formValidate();

      if (this.form.iotFlag && !this.devicePointList?.length) {
        this.$message.warning('请先选择行业设备！');
      } else {
        if (this.validateOptions.baseInfo && this.validateOptions.useInfo) {
          this.btnLoading = true;
          this.handleSaveContinue();
        }
      }
    },
    handleSaveDeviceLife() {
      this.$refs.addInfoFormRule1.validate(valid => {
        if (valid) {
          this.tableLoading = true;
          if (this.deviceStageValuesType == 'add') {
            let params = this.formAttributes.map(item => {
              let obj = {};

              if (item.attributeType === 'DATE') {
                obj.attributeValue = this.formData[item.attributeCode]
                  ? this.$moment(this.formData[item.attributeCode]).format('YYYY-MM-DD')
                  : '';
              } else if (item.attributeType === 'FILE') {
                obj.attributeValue = JSON.stringify(this.formData[item.attributeCode]);
              } else {
                obj.attributeValue = this.formData[item.attributeCode];
              }
              obj.attributeId = item.id;
              obj.deviceType = this.equipmentType;
              obj.deviceId = this.deviceId;
              obj.stageId = item.stageId;
              return obj;
            });
            deviceStageValuesAdd(params).then(response => {
              this.tableLoading = false;
              if (response.status === 'complete') {
                this.$message.success('保存成功!');
              }
            });
          } else {
            let params = this.realData.map(item => {
              let attributeCode = this.formAttributes.find(v => v.id == item.attributeId)
                .attributeCode;
              item.attributeValue = this.formData[attributeCode];
              return item;
            });
            deviceStageValuesEdit(params).then(response => {
              if (response.status === 'complete') {
                this.tableLoading = false;
                this.$message.success('保存成功!');
              }
            });
          }
        }
      });
    },
    handleSaveContinue() {
      if (this.type === 'add' || this.type === 'copy') {
        this.createDevice();
      } else {
        this.updateDevice();
      }
    },
    // 创建设备
    async createDevice() {
      try {
        let params = {
          tenantId: this.user.tenantId,
          ...this.form,
          devicePointList: this.devicePointList,
          // deviceNo: this.deviceNo + this.form.deviceNo,
          industryDeviceId: this.industryDeviceItem.deviceId
        };
        let { success } = await createDevice(params);
        if (success) {
          this.closeTab();
          this.$message.success('保存设备成功！');
          this.goto('/Comprehensive/Device');
        }
      } catch (error) {
        console.log(error);
      } finally {
        this.btnLoading = false;
      }
    },
    // 更新设备
    async updateDevice() {
      try {
        let params = {
          ...this.form,
          devicePointList: this.devicePointList,
          industryDeviceId: this.industryDeviceItem.deviceId
        };
        let { success } = await updateDevice(params);
        if (success) {
          this.closeTab();
          this.$message.success('保存设备成功');
          this.goto('/Comprehensive/Device');
        }
      } catch (error) {
        console.log(error);
      } finally {
        this.btnLoading = false;
      }
    },
    // 编辑
    handleEdit(row) {
      this.devicePointList.forEach(item => {
        if (item.realPointCode === row.realPointCode) {
          item.isEdit = true;
        } else {
          item.isEdit = false;
        }
      });
    },
    handleBlur(row) {
      row.isEdit = false;
    },
    // 行业设备优化-根据选择的行业设备ID查询监测量列表
    async getIndustryPoints() {
      this.loading = true;
      const { resultData } = await getIndustryPointForecastCodeList(
        this.industryDeviceItem.deviceId,
        this.placeId
      );
      this.devicePointList = resultData.map(item => {
        return {
          ...item,
          isEdit: false
        };
      });

      this.loading = false;
    },
    // 行业设备弹窗
    handleIndustryDeviceChoose() {
      if (!this.form.waterPlantId) {
        this.$confirm({
          title: '请先选择净水厂',
          cancelButtonProps: { style: { display: 'none' } },
          okButtonProps: { style: { 'margin-left': 0 } },
          okText: '关闭',
          centered: true
        });
      } else if (!this.form.placeId) {
        this.$confirm({
          title: '请先选择构筑物',
          cancelButtonProps: { style: { display: 'none' } },
          okButtonProps: { style: { 'margin-left': 0 } },
          okText: '关闭',
          centered: true
        });
      } else {
        this.industryVisible = true;
        this.placeId = this.form.placeId;
      }
    },
    // 编辑时根据设备型号获取行业设备信息
    async getIndustryItem(industryDeviceId) {
      if (!industryDeviceId) return;
      let params = {
        productCode: 'water_purification',
        dsAreaStationDeviceQueries: [
          {
            stationId: this.waterPlantId,
            productCode: 'water_purification',
            areaId: []
          }
        ],
        industryDeviceIds: [industryDeviceId]
      };
      let { resultData } = await selectIndustryList(params);
      this.industryDeviceItem = resultData[0] || {};
    },
    filterOption(input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      );
    },
    // 切换水厂时清空行业设备
    waterPlantChange() {
      this.industryDeviceItem = {};
      this.devicePointList = [];
    }
  }
};
</script>

<style lang="less" scoped>
.device-edit {
  width: 100%;
  .device-edit-content {
    height: calc(100% - 75px);
    padding: 30px 40px 0 40px;
    overflow: auto;
    .content-monitor {
      margin-bottom: 20px;
    }
  }
  .detail-content-left {
    flex: 1;
    overflow: auto;
    .steps {
      padding-left: 30px;
      width: 100%;
      display: flex;
      justify-content: flex-start;
      flex-flow: row wrap;
    }
  }
  .form-pointName {
    width: 326px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;

    .form-label {
      height: 20px;
      font-family: PingFangSC-Regular, sans-serif;
      font-weight: 400;
      font-size: 14px;
      color: var(--supply-color-secondary);
      letter-spacing: 0;
      margin-right: 12px;
    }
  }
  .form-title {
    padding: 15px 0;
    font-size: 16px;
  }
  .table-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    .table-title {
      color: #6281a3;
      .table-tip-text {
        color: #999999;
      }
    }
  }
  .row-repeat {
    border-color: rgb(246, 67, 87);
  }
}
/deep/.wpg-table {
  line-height: 24px !important;
}
/deep/.wpg-select-selection--single {
  position: relative;
  height: 36px !important;
  padding: 8px 12px;
  cursor: pointer;
}
/deep/.wpg-select-selection__rendered {
  position: relative;
  display: block;
  margin-left: 11px;
  line-height: 20px !important;
}
.industry-device {
  font-size: 14px;
  margin-bottom: 10px;

  .table-header {
    justify-content: space-between;
    .table-tip-text {
      color: #999999;
    }
  }

  /deep/ .wpg-select-enabled {
    width: 200px;
  }
}
</style>
