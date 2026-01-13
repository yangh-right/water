<!--
 * @Description:
 * @version:
 * @Author: fengtaotao
 * @Date: 2023-05-23 14:29:38
 * @LastEditors: wangyr
 * @LastEditTime: 2024-04-16 14:16:34
-->
<template>
  <div class="content">
    <div class="content-title">
      <div class="supply-flex supply-items-center">
        <div class="title">{{ title }}</div>
        <!-- <span class="supply-ml-6">
          <span>模型：</span>
          <w-select style="width:160px" v-model="modelId">
            <w-select-option v-for="item in modelList" :key="item.id" :value="item.id">{{
              item.modelName
            }}</w-select-option>
          </w-select>
        </span> -->
        <!-- <span class="supply-ml-4">
          <span>方案：</span>
          <w-select style="width:160px" v-model="schemeId">
            <w-select-option v-for="item in schemeList" :key="item.id" :value="item.id">{{
              item.solutionName
            }}</w-select-option>
          </w-select>
        </span> -->
      </div>
    </div>
    <w-spin :spinning="loading">
      <div class="content-body">
        <div class="carbon-list">
          <div v-for="item in dataList" :key="item.name" class="group-item">
            <div class="carbon-item">
              <div v-for="v in item.points" :key="v.code" class="item">
                <span class="name">
                  {{ v.name }}
                  <span class="tip" v-if="v.tip">{{ v.tip }}</span>
                </span>
                <span class="value">{{ v.defaultValue }}</span>
                <span class="unit">{{ v.pointObj.pointUnit || '' }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="split"></div>
        <div v-for="item in adviceItems" :key="item.name" class="advice-list">
          <span class="name">{{ item.name }}</span>
          <span class="value">{{ item.value }}</span>
          <span class="unit">{{ item.unit }}</span>
        </div>
      </div>
    </w-spin>
    <drag-modal
      class="modal-wrap"
      @close="confirmClose"
      :destroyOnClose="true"
      ref="alarmConfirm"
      :width="500"
      :height="220"
      :mask="true"
      :isShowFullBtn="false"
      title="方案保存"
    >
      <div class="form-body">
        <w-form-model ref="form" :model="form" :rules="rules">
          <w-form-model-item v-bind="formItem" label="方案名称:" prop="newPointName">
            <w-input v-model="form.newPointName" placeholder="请输入方案名称"></w-input>
          </w-form-model-item>
        </w-form-model>
      </div>
      <div
        style="position: absolute;right: 20px; bottom:23px"
        class="form-footer supply-text-right"
      >
        <w-button type="primary" class="supply-mr-4" ghost @click="confirmClose">取消</w-button>
        <w-button type="primary" class="supply-mr-3" @click="handleConfirm">确定</w-button>
      </div>
    </drag-modal>
  </div>
</template>
<script>
import moment from 'moment';
import {
  getPollingResult,
  getModelList,
  getMedicateResult,
  predictParamForecast,
  getForecastResult,
  pollingResult
} from '@/api/runTime';
import { programmeList } from '@/api/optimization';
import DragModal from '@/components/DragModal';
export default {
  name: 'AddDrugStrategy',
  props: {
    title: {
      type: String,
      default: ''
    },
    waterPlantId: {
      type: String,
      default: ''
    },
    modelId: {
      type: String,
      default: ''
    },
    schemeList: {
      type: Array,
      default: () => []
    },
    modelList: {
      type: Array,
      default: () => []
    },
    schemeId: {
      type: String,
      default: ''
    }
  },
  components: { DragModal },
  data() {
    return {
      curScheme: null,
      formItem: {
        labelCol: { span: 6 },
        wrapperCol: { span: 18 }
      },
      form: {
        newPointName: ''
      },
      rules: {
        newPointName: [{ required: true, message: '请输入方案名称' }]
      },
      loading: false,
      newPointName: '',
      checked: true,
      predictResId: '', //模拟id
      dataList: [],
      isTimeOut: true,
      timeOut: null,
      startTime: '',
      endTime: '',
      adviceItems: [
        {
          name: 'A区碳源建议投加',
          value: '',
          unit: ''
        },
        {
          name: 'B区碳源建议投加',
          value: '',
          unit: ''
        }
      ],
      drugItems: []
    };
  },
  computed: {
    optionName() {
      return this.curScheme?.solutionName || '';
    },
    predictionId() {
      return this.curScheme?.predictionId || '';
    }
  },
  watch: {
    modelId: {
      handler(val) {
        this.predictResId = '';
        this.adviceItems[0].value = '';
        this.adviceItems[1].value = '';
        if (val) {
          this.initDataList();
        }
      },
      immediate: true
    },
    schemeId: {
      handler(val) {
        this.predictResId = '';
        this.adviceItems[0].value = '';
        this.adviceItems[1].value = '';
        // 该模型没有方案,使用模型默认的配置
        if (val) {
          this.curScheme = this.schemeList.find(item => item.id === val) || {};
          if (this.predictionId) {
            this.getForecast(this.predictionId);
          }
        } else {
          this.curScheme = null;
          this.schemeId = '';
          this.initDataList();
        }
      },
      immediate: true
    }
  },
  methods: {
    initDataList() {
      if (this.modelList && this.modelId) {
        let inputValue = this.modelList.find(item => item.id === this.modelId)?.inputParam;
        this.dataList = inputValue ? JSON.parse(inputValue) : [];
      }
    },
    async getForecast(id) {
      let res = await getForecastResult(id);
      let { status, resultData, errorMessage } = res;
      if (status === 'complete') {
        let inputValue = resultData.inputParam ? JSON.parse(resultData.inputParam) : [];
        this.dataList.forEach((item, index) => {
          if (inputValue?.[index]?.[item.name]) {
            let inputPointList = inputValue[index][item.name];
            item.points.forEach((point, i) => {
              point.defaultValue = inputPointList?.[i]?.[point.code][0];
            });
          }
        });
        this.getData(id);
      }
    },
    changeValue(data) {
      if (data.defaultValue !== null && data.tip) {
        data.tip = '';
        this.$forceUpdate();
      }
    },
    validate() {
      let count = 0;
      this.dataList.forEach(item => {
        item.points.forEach(v => {
          if (v.defaultValue === null) {
            v.tip = '请输入 ' + v.name;
            count++;
          } else {
            v.tip = '';
          }
        });
      });
      return count > 0;
    },
    toSavePredict() {
      let valid = this.validate();
      this.form.newPointName = '';
      if (this.schemeId) {
        this.form.newPointName = this.optionName;
      }
      this.$forceUpdate();
      if (!valid) {
        this.$refs.alarmConfirm.visible = true;
      }
    },
    handleConfirm() {
      this.$refs.form.validate(async valid => {
        if (valid) {
          this.confirmClose();
          this.toPredict(true);
        }
      });
    },
    confirmClose() {
      this.$refs.alarmConfirm.visible = false;
    },
    async toPredict(isSave = false) {
      let { dataList, modelId, waterPlantId } = this;
      if (!modelId) return;
      const inputParam = this.getInputParam(dataList);
      const params = {
        waterPlantId,
        inputParam,
        modelCode: this.modelList.find(item => item.id === modelId)?.modelCode,
        modelId,
        isSave: isSave ? '1' : '2',
        type: '1'
      };
      if (isSave) {
        params.id = this.predictResId;
        params.optionName = this.form.newPointName;
        if (this.schemeId) {
          params.optionId = this.schemeId;
        }
      }
      let res = await predictParamForecast(params);
      let { status, resultData, errorMessage } = res;
      if (status === 'complete') {
        if (isSave) {
          this.getSchemeList(!this.schemeId);
          this.$emit('changeLoad', false);
          this.$message.success('保存成功');
        } else {
          if (resultData.id) {
            this.predictResId = resultData.id;
            this.pollingResult(resultData.id);
          }
        }
      }
    },
    getInputParam(list) {
      let resultList = [];
      list.forEach(item => {
        let pointObj = [];
        item.points.forEach(point => {
          let value = point.value || point.defaultValue;
          pointObj.push({ [point.code]: [value, value, value] });
        });
        resultList.push({ [item.name]: pointObj });
      });
      return JSON.stringify(resultList);
    },
    pollingResult(predictionId) {
      this.loading = true;
      this.isTimeOut = false;
      this.timeOut = setTimeout(() => {
        this.isTimeOut = true;
      }, 60000);
      this.getPollingResult(predictionId);
    },
    async getPollingResult(predictionId) {
      let res = await pollingResult(predictionId);
      const { resultData, status } = res;
      if (status === 'complete' && resultData > 0) {
        clearTimeout(this.timeOut);
        this.isTimeOut = true;
        this.$message.success('模拟完成');
        this.getData(predictionId);
      } else {
        if (!this.isTimeOut) {
          this.getPollingResult(predictionId);
        } else {
          clearTimeout(this.timeOut);
          if (this.isTimeOut) {
            this.loading = false;
            this.$message.success('模拟超时');
          }
        }
      }
    },
    async getData(predictionId) {
      if (!predictionId) {
        return;
      }
      const params = {
        predictionId: predictionId,
        dateTime: moment(this.date).format('YYYY-MM-DD HH')
      };
      let res = await getMedicateResult(params);
      let { status, resultData, errorMessage } = res;
      this.loading = false;
      if (status === 'complete') {
        this.adviceItems[0].value = resultData.suggestedCarbonA || '';
        this.adviceItems[1].value = resultData.suggestedCarbonB || '';
      }
    }
  }
};
</script>

<style lang="less" scoped>
.content {
  width: calc(50% - 6px);
  height: 240px;
  background-color: var(--supply-color-bg-card-component);
  &-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 12px;
    height: 50px;
    .title {
      font-weight: 600;
      font-size: 16px;
      letter-spacing: 0;
    }
  }
  .mode {
    display: flex;
    align-items: center;
    padding: 0px 12px;
    height: 30px;
    font-weight: 400;
    font-size: 14px;
    color: #333333;
    .switch {
      margin: 0 20px 0 36px;
    }
  }
  &-body {
    padding: 0 12px;
    display: flex;
    justify-content: space-around;
    width: 100%;
    height: calc(100% - 80px);
    flex-wrap: wrap;
    .carbon-list {
      width: 100%;
      height: 140px;
      display: flex;
      align-content: flex-start;
      justify-content: flex-start;
      flex-wrap: wrap;
      overflow-y: auto;
    }
    .group-item {
      width: 100%;
    }
    .carbon-item {
      //margin-top: 6px;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      //  height: 30px;
      // width: 50%;
      font-weight: 400;
      font-size: 14px;
      color: #333333;
      .item {
        margin-top: 4px;
        width: 50%;
        display: flex;
        align-items: center;
        justify-content: space-around;
        //  flex-wrap: wrap;
      }
      .name {
        position: relative;
        width: 50%;
        height: 30px;
        line-height: 30px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        .tip {
          position: absolute;
          top: 15px;
          left: 0px;
          color: #f64357;
          font-size: 12px;
        }
      }
      .unit {
        margin-left: -16px;
        width: 80px;
      }
      .value {
        margin: 0 10px;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 80px;
        height: 28px;
        background: #f3f6f8;
        border: 1px solid #e9e8e8;
        border-radius: 4px;
      }
    }
    .split {
      margin-top: 6px;
      width: 100%;
      height: 1px;
      border-top: 1px dashed #0000001a;
    }
    .advice-list {
      margin-top: 6px;
      display: flex;
      align-items: center;
      height: 30px;
      width: 50%;
      font-weight: 400;
      font-size: 14px;
      color: #6281a3;
      .name {
        width: calc(100% - 240px);
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      .unit {
        width: 80px;
      }
      .value {
        margin: 0 10px;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 80px;
        height: 28px;
        color: #4285f4;
        background: #f3f6f8;
        border: 1px solid #e9e8e8;
        border-radius: 4px;
      }
    }
  }
  /deep/ .wpg-input {
    height: 28px !important;
  }
  /deep/ .list__input {
    height: 28px;
    .wpg-input-number-handler-wrap {
      display: none;
    }
    .wpg-input-number {
      height: 28px;
    }
    .wpg-input-number-input-wrap input {
      height: 28px;
    }
  }
}
</style>
