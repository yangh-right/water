<template>
  <div class="point">
    <div class="card card0">
      <point-box title="加药策略" :list="dosingData"></point-box>
    </div>
    <div class="card card1">
      <point-box :col="1" title="碳源建议投加" :list="adviceItems"></point-box>
    </div>
  </div>
</template>

<script>
import {
  getPollingResult,
  getMedicateResult,
  predictParamForecast,
  getForecastResult,
  pollingResult
} from '@/api/runTime';
import pointBox from '../../models/pointBox';
export default {
  components: { pointBox },
  props: {
    title1: {
      type: String,
      default: ''
    },
    title2: {
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
    suggestDataInfo: {
      type: Array,
      default: () => []
    },
    schemeId: {
      type: String,
      default: ''
    }
  },
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
      adviceItems: [{ name: '碳源投加量', defaultValue: '', unit: 'L/h' }],
      drugItems: []
    };
  },
  computed: {
    optionName() {
      return this.curScheme?.solutionName || '';
    },
    predictionId() {
      return this.curScheme?.predictionId || '';
    },
    dosingData() {
      return this.dataList?.find(item => item.name === '加药策略')?.points || [];
    }
  },
  watch: {
    modelId: {
      handler(val) {
        this.predictResId = '';
        this.resetAdviceItems();
        if (val) {
          this.initDataList();
        }
      },
      immediate: true
    },
    schemeId: {
      handler(val) {
        this.predictResId = '';
        this.resetAdviceItems();

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
    },
    suggestDataInfo: {
      immediate: true,
      deep: true,
      handler(val) {
        if (val.length > 0) {
          let timeDataList = val.filter(v => !!v);
          this.adviceItems = [
            {
              name: '碳源投加量',
              defaultValue: timeDataList.length > 0 ? timeDataList[timeDataList.length - 1] : '',
              unit: 'L/h'
            }
          ];
        }
      }
    }
  },
  methods: {
    resetAdviceItems() {
      this.adviceItems[0].defaultValue = '';
      // this.adviceItems[1].defaultValue = '';
    },
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
        // this.getData(id);
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
        dateTime: this.$moment().format('YYYY-MM-DD HH')
      };
      let res = await getMedicateResult(params);
      let { status, resultData, errorMessage } = res;
      if (status === 'complete') {
        this.adviceItems[0].defaultValue = resultData.suggestedCarbonA || '';
        // this.adviceItems[1].defaultValue = resultData.suggestedCarbonB || '';
      }
    }
  }
};
</script>
<style lang="less" scoped>
.point {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: space-between;
  .card {
    height: 100%;
    width: calc(74% - 6px);
    &.card0 {
      /deep/.point__item {
        &:nth-last-of-type(-n + 3) {
          margin-bottom: 0;
        }
      }
    }
    &.card1 {
      width: calc(26% - 6px);
      /deep/.point__wrapper {
        .point__item:nth-last-of-type(-n + 1) {
          margin-bottom: 0;
        }
        .point__item {
          /* width: 100%;
          display: flex;
          justify-content: center; */

          /* .item__con {
            width: 87%;
          } */
          .point__pv {
            width: calc(100% - 46px);
          }
          .point__unit {
            width: 30px;
          }
        }
      }
    }
  }
}
</style>
