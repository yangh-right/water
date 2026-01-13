<!--
 * @Description: 分区
 * @Author: limz
 * @Date: 2021-07-14 17:09:39
 * @LastEditTime: 2024-12-16 15:36:41
 * @LastEditors: wangyr
-->
<template>
  <div :class="['param-panel', isLowSize ? 'small-size' : '', isDark ? '' : 'no-dark']">
    <!-- <div class="head">
      <div class="head__name">{{ title }}</div>
      <div class="search">
        <div class="head__con">
          <span class="run-type">运行条件：</span>
          <w-checkbox-group :options="runTypeList" @change="typeChange" :value="runType">
          </w-checkbox-group>
        </div>
      </div>
    </div> -->
    <div class="module-wrap">
      <template v-if="moduleList.length">
        <div v-for="(item, index) in moduleList" :key="item.name" class="module">
          <div class="module-header supply-flex supply-items-center">
            <div class="module-title supply-text-main">{{ item.name }}</div>
            <span
              @click="changeState(index)"
              class="supply-ml-auto module__collapse supply-cursor-pointer"
            >
              {{ item.openState === 0 ? '展开' : '收起' }}
            </span>
          </div>
          <transition name="collapse">
            <div v-if="item.openState" class="module-main">
              <div class="point">
                <div v-for="(point, i) in item.points" :key="i" class="point__item">
                  <span class="item__name"
                    >{{ point.name }}
                    <span v-if="point.pointUnit" class="supply-w-10">
                      ({{ point.pointUnit }})</span
                    ></span
                  >
                  <div class="list">
                    <span
                      v-for="(item, index) in runTypeLength"
                      :key="index"
                      class="list__item"
                      :title="point.value[index]"
                      ><w-input-number
                        v-show="index === 1"
                        @blur="inputBlur(point.value, index)"
                        class="list__input"
                        :autoFocus="point.isActive"
                        v-model="point.value[index]"
                      ></w-input-number
                    ></span>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </template>
      <w-empty v-else></w-empty>
    </div>
    <div class="foot">
      <w-button @click="toSavePredict">保存</w-button>
      <w-button @click="openSimulationModal" class="supply-ml-3" type="primary">模拟</w-button>
    </div>
    <drag-modal
      class="modal-wrap"
      @close="confirmClose"
      :destroyOnClose="true"
      ref="alarmConfirm"
      :width="500"
      :height="420"
      :mask="true"
      :isShowFullBtn="false"
      title="方案保存"
    >
      <div class="form-body">
        <w-form-model ref="form" :model="form" :rules="rules">
          <w-form-model-item v-bind="formItem" label="方案名称:" prop="newPointName">
            <w-input v-model="form.newPointName" placeholder="请输入方案名称"></w-input>
          </w-form-model-item>
          <w-form-model-item v-bind="formItem" label="适用季节:" prop="applicationSeason">
            <w-select v-model="form.applicationSeason" placeholder="请选择">
              <w-select-option
                v-for="item in applicationSeasonList"
                :key="item.value"
                :value="item.value"
                >{{ item.label }}</w-select-option
              >
            </w-select>
          </w-form-model-item>
          <w-form-model-item v-bind="formItem" label="适用温度:" prop="applicationTemperature">
            <w-select v-model="form.applicationTemperature" placeholder="请选择">
              <w-select-option
                v-for="item in applicationTemperatureList"
                :key="item.value"
                :value="item.value"
                >{{ item.label }}</w-select-option
              >
            </w-select>
          </w-form-model-item>
          <w-form-model-item v-bind="formItem" label="碳氮比:" prop="carbonNitrogenRatio">
            <w-select v-model="form.carbonNitrogenRatio" placeholder="请选择">
              <w-select-option
                v-for="item in carbonNitrogenRatioList"
                :key="item.value"
                :value="item.value"
                >{{ item.label }}</w-select-option
              >
            </w-select>
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
    <custom-modal
      :destroyOnClose="true"
      ref="simulationModal"
      :width="450"
      :footer="null"
      :mask="true"
      title="模拟方式"
    >
      <simulation-modal :isEdit="true" @action="changeSimultaionType" />
    </custom-modal>
  </div>
</template>

<script>
import CustomModal from '@/components/DragModal/CustomModal.vue';
import cloneDeep from 'lodash.clonedeep';
import DragModal from '@/components/DragModal';
import CheckBtn from './checkBtn';
import simulationModal from './simulationModal';
import { runTypeList } from './options';
import { predictParamForecast, pollingResult, getForecastResult } from '@/api/runTime';
import { getRunningSolution } from '@/api/optimization';
import FactorySelect from '@/components/factory-select/index.vue';
export default {
  name: 'paramPanel',
  components: { FactorySelect, DragModal, CheckBtn, simulationModal, CustomModal },
  inject: ['state'],
  props: {
    title: {
      type: String,
      default: ''
    },
    solutionType: {
      type: String,
      default: '1'
    },
    showType: {
      type: String,
      default: ''
    },
    simulationDuration: {
      type: Number,
      default: 24
    },
    waterPlantId: {
      type: String,
      default: ''
    },
    modelId: {
      type: String,
      default: ''
    },
    runningFlag: {
      type: [Boolean, undefined],
      default: undefined
    },
    optionName: {
      type: String,
      default: ''
    },
    schemeId: {
      type: String,
      default: ''
    },
    pointData: {
      type: String,
      default: ''
    },
    modelList: {
      type: Array,
      default: () => []
    },
    runType: {
      type: Array,
      default: () => []
    },
    abortedPredict: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isTimeOut: true,
      timeOut: null,
      predictResId: '',
      oldInputParamStr: '',
      formItem: {
        labelCol: { span: 6 },
        wrapperCol: { span: 18 }
      },
      form: {
        newPointName: '',
        applicationSeason: undefined,
        applicationTemperature: undefined,
        carbonNitrogenRatio: undefined
      },
      applicationSeasonList: [
        { label: '春', value: '1' },
        { label: '夏', value: '2' },
        { label: '秋', value: '3' },
        { label: '冬', value: '4' }
      ],
      applicationTemperatureList: [
        { label: '<15°C', value: '1' },
        { label: '<25°C', value: '2' },
        { label: '<35°C', value: '3' }
      ],
      carbonNitrogenRatioList: [
        { label: '3-4', value: '1' },
        { label: '4-5', value: '2' },
        { label: '5-6', value: '3' }
      ],
      rules: {
        newPointName: [{ required: true, message: '请输入方案名称' }],
        applicationSeason: [{ required: true, message: '请选择适用季节' }],
        applicationTemperature: [{ required: true, message: '请选择适用温度' }],
        carbonNitrogenRatio: [{ required: true, message: '碳氮比' }]
      },
      newPointName: '',
      runTypeList: runTypeList,
      isLowSize: false,
      moduleList: []
    };
  },
  computed: {
    runTypeLength() {
      return this.runTypeList.length;
    },
    isDark() {
      return this.state.theme === 'dark';
    }
  },
  watch: {
    modelId: {
      handler(val) {
        this.handleInputParam(this.modelList);
      },
      immediate: true
    }
  },

  mounted() {
    window.addEventListener('resize', this.handleSize);
    this.$once('hook:beforeDestroy', () => {
      window.removeEventListener('resize', this.handleSize);
    });
    this.handleSize();
  },
  methods: {
    inputBlur(valueList, index) {
      if (typeof valueList[index] === 'number') {
        valueList[index] = this.keepDecimal(valueList[index], 4);
      }
    },
    openSimulationModal() {
      this.$refs.simulationModal.visible = true;
    },
    changeSimultaionType(type) {
      this.$refs.simulationModal.visible = false;
      if (type === 2) {
        this.toPredict(false);
      } else if (type === 1) {
        this.getRunningSolution();
      }
    },
    async getRunningSolution() {
      const { resultData, status } = await getRunningSolution(this.waterPlantId);
      if (status === 'complete') {
        const predictionId = resultData?.filter(
          item => item.solutionType === this.solutionType
        )?.[0]?.predictionId;
        predictionId && this.$emit('change', { predictionId });
      }
    },
    keepDecimal(num, digit = 2) {
      let digitNum = Math.pow(10, digit);
      let result = parseFloat(num);
      if (isNaN(result)) {
        console.log('数字解析失败，请检查！');
        return null;
      }
      result = Math.round(result * digitNum) / digitNum;
      return result;
    },
    async getScheme(predictionId) {
      this.$emit('changeLoad', true);

      let res = await getForecastResult(predictionId);
      const { resultData, status } = res;
      if (status === 'complete') {
        let inputValue = resultData.inputParam ? JSON.parse(resultData.inputParam) : [];
        this.moduleList.forEach((item, index) => {
          if (inputValue?.[index]?.[item.name]) {
            let inputPointList = inputValue[index][item.name];
            item.points.forEach((point, i) => {
              if (inputPointList?.[i]?.[point.code]?.length === this.runTypeLength) {
                point.value = inputPointList?.[i]?.[point.code];
              }
            });
          }
        });
        this.$emit('change', { predictionId });
      } else {
        this.$emit('change');
      }
    },
    toSavePredict() {
      this.form.newPointName = '';
      if (this.schemeId) {
        this.form.newPointName = this.optionName;
      }
      this.$refs.alarmConfirm.visible = true;
    },
    confirmClose() {
      this.form = {
        newPointName: '',
        applicationSeason: undefined,
        applicationTemperature: undefined,
        carbonNitrogenRatio: undefined
      };
      this.$refs.alarmConfirm.visible = false;
    },
    typeChange(data) {
      this.$emit('update:runType', data);
    },
    handleConfirm() {
      this.$refs.form.validate(async valid => {
        if (valid) {
          let { newPointName } = this.form;
          this.toPredict(true);
          this.confirmClose();
        }
      });
    },
    async toPredict(isSave = false) {
      this.$emit('changeProcess', true);

      let { moduleList, modelId, runType, waterPlantId, simulationDuration } = this;
      if (!modelId) return;
      const inputParam = this.getInputParam(moduleList);
      const params = {
        modelCode: this.modelList.find(item => item.id === modelId)?.modelCode,
        inputParam,
        modelId,
        waterPlantId,
        runningFlag: this.runningFlag,
        applicationSeason: this.form.applicationSeason,
        applicationTemperature: this.form.applicationTemperature,
        carbonNitrogenRatio: this.form.carbonNitrogenRatio,
        type: runType.join(','),
        isSave: isSave ? '1' : '2'
      };
      if (this.showType === '1') {
        params.simulationDuration = simulationDuration;
      }
      const inputParamStr = inputParam + runType.join(',');
      if (isSave) {
        if (this.predictResId && this.oldInputParamStr && this.oldInputParamStr === inputParamStr) {
          params.id = this.predictResId;
        }
        params.solutions = [];
        runType.map(item => {
          let solution = {
            smallType: item,
            solutionType: this.solutionType,
            solutionName: this.form.newPointName
          };
          if (this.schemeId) {
            solution.solutionId = this.schemeId;
          }
          params.solutions.push(solution);
        });
      }
      try {
        let res = await predictParamForecast(params);
        const { resultData, status } = res;
        if (status === 'complete') {
          if (isSave) {
            this.$emit('changeProcess', false);
            this.$message.success('保存成功');
            this.$router.replace({ query: {} });
          } else {
            if (resultData.id) {
              this.predictResId = resultData.id;
              this.oldInputParamStr = inputParamStr;
              this.pollingResult(resultData.id);
            }
          }
        } else {
          this.$emit('change');
        }
      } catch (error) {
        console.error('Failed to fetch chart data:', error);
      }
    },
    pollingResult(predictionId) {
      this.$emit('update:abortedPredict', false);
      this.isTimeOut = false;
      this.timeOut = setTimeout(() => {
        this.isTimeOut = true;
      }, 210000);
      this.getPollingResult(predictionId);
    },
    async getPollingResult(predictionId) {
      let res = await pollingResult(predictionId);
      const { resultData, status } = res;

      if (status === 'complete' && resultData > 0 && !this.abortedPredict) {
        clearTimeout(this.timeOut);
        this.isTimeOut = true;
        setTimeout(() => {
          this.$emit('changeProcess', false);
          this.$emit('change', { predictionId });
        }, 5000);
      } else {
        if (!this.isTimeOut && !this.abortedPredict) {
          setTimeout(() => {
            this.getPollingResult(predictionId);
          }, 1000);
        } else {
          clearTimeout(this.timeOut);
          this.$emit('changeLoad', false);
          if (this.isTimeOut) {
            this.$emit('change');
            this.$emit('handleProcess');
            this.$message.success('预测超时');
          }
        }
      }
    },
    handleOutputParam(modelId, modelList) {
      let outputParamStr = modelList.find(item => item.id === modelId)?.outputParam || '';
      return outputParamStr ? JSON.parse(outputParamStr) : [];
    },
    getInputParam(list) {
      let resultList = [];
      list.forEach(item => {
        let pointObj = [];
        item.points.forEach(point => {
          pointObj.push({ [point.code]: point.value });
        });
        resultList.push({ [item.name]: pointObj });
      });
      return JSON.stringify(resultList);
    },
    handleInputParam(modelList, isInit = true) {
      let { modelId } = this;
      let inputParamStr = modelList.find(item => item.id === modelId)?.inputParam || '';
      if (inputParamStr) {
        let inputParam = JSON.parse(inputParamStr);
        const { backPath } = this.$route.query;
        console.log('111', backPath);
        console.log('111', this.pointData);

        inputParam.forEach((item, i) => {
          let hideNames = ['化学计量系数', '动力学参数'];
          item.openState = hideNames.includes(item.name) ? 0 : 1;
          item.points.forEach((point, j) => {
            point.isActive = false;
            if (
              point.code === 'qcon297' &&
              backPath &&
              backPath.includes('/debugTool/carbonDosing') &&
              this.pointData
            ) {
              point.isActive = true;
              point.defaultValue = Number(this.pointData);
            }
            if (
              point.code === 'chem1dosager435' &&
              backPath &&
              backPath.includes('/debugTool/delPDosing') &&
              this.pointData
            ) {
              point.isActive = true;
              point.defaultValue = Number(this.pointData);
            }
            let initValue = new Array(this.runTypeLength).fill(point.defaultValue ?? null);
            let oldValue = this.moduleList?.[i]?.points?.[j]?.value;
            point.value = !isInit && oldValue ? oldValue : initValue;
            if (item.openState === 1) {
              point.pointUnit = point?.pointUnit || point?.pointObj.pointUnit;
            }
          });
        });
        this.moduleList = inputParam;
      } else {
        this.moduleList = [];
      }
    },
    handleSize() {
      this.isLowSize = top.innerWidth <= 1366 ? true : false;
    },
    changeState(idx) {
      let val = Math.abs(this.moduleList[idx].openState - 1);
      this.moduleList.forEach((o, i) => {
        o.openState = i === idx ? val : o.openState;
      });
    }
  }
};
</script>

<style scoped lang="less">
.modal-wrap {
  /deep/ .wpg-modal {
    min-height: 250px;
    .wpg-modal-content .wpg-modal-body {
      padding: 6px 32px 16px 0px;
    }
  }
}
.collapse-enter-active {
  transition: all 0.3s ease-out;
}
.list__item {
  display: inline-block;
}
.collapse-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}
.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
}
.param-panel {
  display: flex;
  flex-direction: column;
  width: 419px;
  overflow-x: hidden;
  height: 100%;
  position: relative;
  &__content {
    height: calc(100% - 60px);
    overflow-y: auto;
  }
  .head {
    padding: 15px 12px 12px;
    .search {
    }
    &__name {
      color: var(--supply-text-main);
      font-weight: 600;
      font-size: 16px;
    }
    &__con {
      display: flex;
      align-items: center;
      min-width: 197px;
      .run-type {
        line-height: 28px;
        display: inline-block;
        color: var(--supply-text-secondary);
        font-size: 14px;
      }
      /deep/ .wpg-radio-group-small .wpg-radio-button-wrapper {
        padding: 0 12px;
      }
    }
  }
  .module-wrap {
    flex: 1;
    overflow-y: auto;
  }
  .module {
    margin-bottom: 12px;
    &:nth-last-child(1) {
      margin-bottom: 0;
    }
    &-header {
      height: 32px;
      padding: 0 12px 0 8px;
      background: rgb(18, 22, 29);
      .module-title {
        font-weight: 600;
        font-size: 14px;
        color: var(--supply-text-secondary);
        &::before {
          width: 2px;
          content: '';
          top: -1px;
          position: relative;
          vertical-align: middle;
          height: 14px;
          display: inline-block;
          margin-right: 5px;
          background-color: var(--supply-color-primary-DEFAULT);
        }
      }
      .module__collapse {
        color: var(--supply-color-primary-DEFAULT);
        font-weight: 400;
        font-size: 12px;
      }
    }
    &-main {
      .point {
        padding: 12px 12px 0;
        &__item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
          .item__name {
            width: calc(100% - 180px);
            white-space: wrap;

            font-weight: 400;
            font-size: 14px;
            color: var(--supply-text-main);
          }
          .list {
            &__item {
              margin-right: 4px;
              &:nth-last-child(1) {
                margin-right: 0;
              }
            }
            &__input {
              width: 78px;
              height: 30px;
              border-radius: 4px;
            }
          }
        }
      }
    }
  }
  .foot {
    border-radius: 0 0 4px 4px;
    background-color: var(--supply-color-bg-card-component);
    padding: 12px;
    width: 100%;
    justify-content: flex-end;
    align-items: center;
    display: flex;
    height: 60px;
    box-shadow: 0 -2px 8px 0 #00000017;
  }
  &.small-size {
    width: 281px;
    .point {
      .point__item {
        flex-direction: column;
        .item__name {
          width: 100%;
          margin-bottom: 8px;
        }
        .list {
          display: flex;
          justify-content: space-between;
          &__input {
            width: 80px;
          }
        }
      }
    }
  }
  &.no-dark {
    .module-header {
      background: #f3f3f3;
    }
  }
  /deep/ .list__input {
    .wpg-input-number-handler-wrap {
      display: none;
    }
    .wpg-input-number-input-wrap input {
      height: 28px;
    }
  }
}
</style>
