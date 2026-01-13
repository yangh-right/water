<!-- 污泥排放关键指标组件 -->
<template>
  <div class="content">
    <!-- 标题区域 -->
    <div class="content-title">
      <div class="title">{{ title }}</div>
    </div>
    <!-- 加载状态 -->
    <w-spin :spinning="loading" class="content-spin">
      <!-- 数据展示区域 -->
      <div v-if="dataList.length > 0" class="content-body">
        <div v-for="item in dataList" :key="item.name" class="group-item">
          <div class="filed-type">{{ item.name }}</div>
          <div class="carbon-item">
            <div v-for="v in item.points" :key="v.code" class="item">
              <span class="name">{{ v.name }}</span>
              <span class="value">
                <w-input-number
                  v-model="v.defaultValue"
                  class="list__input"
                  placeholder="请输入"
                ></w-input-number>
              </span>
              <span class="unit">{{ v.pointObj.pointUnit }}</span>
            </div>
          </div>
        </div>
      </div>
      <!-- 空状态 -->
      <w-empty v-else class="empty"></w-empty>
    </w-spin>
    <!-- 方案保存弹窗 -->
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
// 导入API和组件
import { postForecastResult, getModelList } from '@/api/runTime';
import DragModal from '@/components/DragModal';

export default {
  name: 'MainPoint',
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
    }
  },
  components: { DragModal },
  computed: {
    disabled() {
      return this.mode === 'preview';
    }
  },
  data() {
    return {
      // 表单配置
      formItem: {
        labelCol: { span: 6 },
        wrapperCol: { span: 18 }
      },
      // 表单数据
      form: {
        newPointName: ''
      },
      // 表单验证规则
      rules: {
        newPointName: [{ required: true, message: '请输入方案名称' }]
      },
      // 加载状态
      loading: false,
      // 数据列表
      dataList: [],
      // 模型列表
      modelList: []
    };
  },
  watch: {
    // 监听模型ID变化
    modelId: {
      handler(val) {
        this.getModelList();
      },
      immediate: true
    }
  },
  methods: {
    // 获取模型列表
    async getModelList(isInit = true) {
      let params = {
        waterPlantId: this.waterPlantId,
        modelTypeCode: '4'
      };
      let res = await getModelList(params);
      const { resultData, status } = res;
      if (status === 'complete') {
        this.modelList = resultData;
        if (!this.modelList.find(item => item.id === this.modelId)) {
          this.modelId = this.modelList?.[0]?.id || '';
        }
        this.handleInputParam(this.modelList, false);
      }
    },
    // 处理输入参数
    handleInputParam(modelList, isInit = true) {
      let { modelId } = this;
      let inputParamStr = modelList.find(item => item.id === modelId)?.inputParam || '';
      if (inputParamStr) {
        let inputParam = JSON.parse(inputParamStr);
        inputParam.forEach((item, i) => {
          item.openState = 1;
        });
        this.dataList = inputParam;
      } else {
        this.dataList = [];
      }
    },
    // 关闭弹窗
    confirmClose() {
      this.$refs.alarmConfirm.visible = false;
    },
    // 确认保存
    handleConfirm() {
      this.$refs.form.validate(async valid => {
        if (valid) {
          this.confirmClose();
          this.toPredict(true);
        }
      });
    },
    // 跳转到预测页面
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
      let res = await predictParamForecast(params);
      let { status, resultData } = res;
      if (status === 'complete') {
        if (isSave) {
          this.$message.success('保存成功');
        }
      }
    },
    // 获取输入参数
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
    }
  }
};
</script>

<style lang="less" scoped>
/* 样式部分 */
.content {
  width: 100%;
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
  .content-spin {
    height: calc(100% - 50px);
    padding: 0 12px 12px 12px;
    box-sizing: border-box;
    overflow: hidden;
  }
  &-body {
    width: 100%;
    height: 100%;
    overflow: auto;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    .group-item {
      width: 50%;
      .filed-type {
        font-size: 14px;
        font-weight: 600;
        color: var(--supply-color-main);
        padding: 6px 0;
      }
      .carbon-item {
        width: 100%;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        font-weight: 400;
        font-size: 14px;
        color: #333333;
      }
      .item {
        margin-bottom: 8px;
        width: 50%;
        display: flex;
        align-items: center;
        justify-content: space-around;
      }
      .name {
        width: 50%;
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
        background: #f3f6f8;
        border: 1px solid #e9e8e8;
        border-radius: 4px;
      }
    }
  }
  .empty {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  /deep/ .wpg-input {
    height: 28px !important;
  }
  /deep/.wpg-spin-container {
    width: 100%;
    height: 100%;
  }
  /deep/ .list__input {
    height: 28px;
    background: #f3f6f8;
    border: 1px solid #e9e8e8;
    .wpg-input-number-handler-up,
    .wpg-input-number-handler-down {
      visibility: hidden;
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
