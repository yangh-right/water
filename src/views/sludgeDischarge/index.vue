<!--
 * @Author: wangyr
 * @Date: 2023-07-28 16:03:21
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2024-06-05 16:29:32
 * @Description:
-->
<!-- 污泥排放管理页面 -->
<template>
  <div class="page">
    <!-- 表单头部区域 -->
    <w-form-header
      :layout="layout"
      :fields="fields"
      class="supply-w-full"
      style="margin-bottom:10px"
    >
      <!-- 水厂选择 -->
      <template #waterPlantId>
        <FactorySelect
          style="max-width:179px"
          v-model.trim="waterPlantId"
          autoSelect
        ></FactorySelect>
      </template>
      <!-- 运行方案选择 -->
      <template #programme>
        <div class="form-item">
          <w-input
            class="select-item"
            style="width: 202px"
            placeholder="请输入运行方案"
            :disabled="true"
            v-model="programme"
            @change="programmeChange"
          ></w-input>
          <div class="ico-change" @click="handleClick">
            <img src="@/assets/images/default/ic_swap_horiz.png" alt="img" />
          </div>
        </div>
      </template>
      <!-- 操作按钮 -->
      <template #footer>
        <w-button @click="toPredict" type="primary" ghost>排泥参数优化</w-button>
      </template>
    </w-form-header>

    <!-- 工艺流程图展示区域 -->
    <div class="iframe-view">
      <technology-flow title="工艺流程图" :waterPlantId="waterPlantId"></technology-flow>
      <!-- 右侧控制按钮 -->
      <div class="map-top-right" :class="{ 'hide-right-control': hideRightControl }">
        <div
          class="map-right-control hover:supply-text-primary-hover supply-bg-bg-card-DEFAULT supply-cursor-pointer box-effect"
          @click="handleRightControl"
        >
          <w-icon type="menu-fold" />
        </div>
      </div>
    </div>

    <!-- 关键指标展示区域 -->
    <div class="page-item">
      <main-point title="关键指标" :waterPlantId="waterPlantId" :modelId="modelId"></main-point>
    </div>

    <!-- 右侧抽屉区域 -->
    <w-drawer
      :width="840"
      :placement="placement"
      :closable="false"
      :visible="hideRightControl"
      :get-container="false"
      :wrap-style="{ position: 'absolute' }"
      @close="onClose"
    >
      <!-- 配泵策略 -->
      <div class="page-item">
        <pump-match title="配泵策略" :tableData="predictionSolution"></pump-match>
      </div>
      <!-- 图表展示 -->
      <div class="page-item">
        <chart-point :waterPlantId="waterPlantId"></chart-point>
      </div>
    </w-drawer>

    <!-- 模型运行方案选择弹窗 -->
    <w-modal
      title="模型运行方案"
      :visible="isShow"
      width="616px"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <div class="methods-box">
        <div class="title">请选择模型运行方案</div>
        <div class="methods-list">
          <div
            v-for="(item, i) in programmeList"
            :key="item.id"
            @click="handleChange(item)"
            :class="['filed', 'filed' + (i + 1), item.id === modelId ? 'active' : '']"
          >
            <div class="ico-method"></div>
            <div class="method-title">{{ item.solutionName }}</div>
          </div>
        </div>
      </div>
    </w-modal>
  </div>
</template>

<script>
// 导入相关组件和API
import { runFields } from './components/data.js';
import { switchRunningSchemes, programmeList } from '@/api/optimization';
import { waterPredictionSolution } from '@/api/manage';
import RunStatus from './components/RunStatus.vue';
import SoilDischarging from './components/SoilDischarging.vue';
import TechnologyFlow from './components/TechnologyFlow.vue';
import MainPoint from './components/MainPoint.vue';
import ChartPoint from './components/ChartPoint.vue';
import pumpMatch from './components/pumpMatch.vue';

export default {
  name: 'sludgeDischarge',
  components: {
    FactorySelect: () => import('@/components/factory-select/index.vue'),
    RunStatus,
    SoilDischarging,
    TechnologyFlow,
    MainPoint,
    ChartPoint,
    pumpMatch
  },
  data() {
    return {
      // 布局配置
      layout: {
        span: 6,
        labelCol: { span: 8 },
        wrapperCol: { span: 16 },
        gutter: [0] //栅格间隔[水平间距，垂直间距]
      },
      // 表单字段配置
      fields: runFields,
      // 当前选中的水厂ID
      waterPlantId: '',
      // 当前运行方案
      programme: '',
      // 是否显示方案选择弹窗
      isShow: false,
      // 当前激活的模块
      activeModule: {},
      // 方案列表
      programmeList: [],
      // 预测方案数据
      predictionSolution: [],
      // 是否隐藏右侧控制
      hideRightControl: false,
      // 抽屉位置
      placement: 'right',
      // 当前选中的方案ID
      modelId: ''
    };
  },
  watch: {
    // 监听水厂ID变化
    waterPlantId(val) {
      if (val) {
        this.getSchemeList();
        this.getWaterPredictionSolution();
      }
    }
  },
  methods: {
    // 获取水厂预测方案
    async getWaterPredictionSolution() {
      let params = {
        endDateTime: this.$moment()
          .add(1, 'days')
          .format('YYYY-MM-DD 00:00:00'),
        scale: 1,
        startDateTime: this.$moment().format('YYYY-MM-DD 00:30:00'),
        stationId: this.waterPlantId
      };
      this.spinng = true;
      let { status, resultData } = await waterPredictionSolution(params);
      this.spinng = false;
      if (status === 'complete') {
        if (Array.isArray(resultData)) {
          resultData.forEach(item => {
            item['match'] = this.handlerArr(item.pumpRun);
          });
          this.predictionSolution = resultData;
        }
      }
    },
    // 处理数据数组
    handlerArr(data = []) {
      if (data.length === 0) {
        return false;
      }
      let tempArr = [];
      let tableData = [];
      // 默认48条数据
      if (data.length !== 48) {
        for (let i = 0; i < 48; i++) {
          let time = '';
          if (i % 2 === 0) {
            time = (i / 2).toFixed(0) + ':30';
          } else {
            if (i === 47) {
              time = '0:00';
            } else {
              time = (i / 2).toFixed(0) + ':00';
            }
          }
          if (data[i]['combinationTime'].indexOf(time) === -1) {
            data.splice(i, 0, {
              combinationTime: this.form.dateTime.format('YYYY-MM-DD') + ' ' + time,
              efficiency: 0,
              frequency: 0,
              isEfficient: 0,
              isOpen: 0,
              powerConsumption: 0,
              pumpId: data[0]['pumpId'],
              stationId: data[0]['stationId'],
              tenantId: data[0]['tenantId'],
              bgClass: 'leave-bar'
            });
          }
        }
      }
      data.forEach((item, j) => {
        if (!item['bgClass']) {
          item['bgClass'] =
            item['isOpen'] === 1
              ? item['frequency'] !== 50
                ? 'shake-bar'
                : 'noraml-bar'
              : 'stop-bar';
          // 4情况下为离线
          if (item['isOpen'] === 4) {
            item['bgClass'] = 'leave-bar';
          }
        }
        tempArr.push(item);
        if (tempArr.length >= 2) {
          tableData.push(tempArr);
          tempArr = [];
        }
      });
      return tableData;
    },
    // 右侧控制按钮点击事件
    handleRightControl() {
      this.hideRightControl = !this.hideRightControl;
    },
    // 关闭抽屉事件
    onClose() {
      this.hideRightControl = false;
    },
    // 获取方案列表
    async getSchemeList() {
      let params = {
        waterPlantId: this.waterPlantId,
        solutionType: 4
      };
      const { resultData, status } = await programmeList(params);
      if (status === 'complete') {
        this.programmeList = resultData;
        let activeProgrammeArr = this.programmeList.filter(item => item.runningFlag);
        if (activeProgrammeArr.length > 0) {
          this.activeModule = activeProgrammeArr[0];
          this.programme = activeProgrammeArr[0].solutionName;
          this.modelId = activeProgrammeArr[0].id;
        } else {
          this.activeModule = this.programmeList[0];
          this.programme = this.programmeList[0].solutionName;
          this.modelId = this.programmeList[0].id;
        }
      }
    },
    // 运行方案变更事件
    programmeChange() {},
    // 点击切换方案
    handleClick() {
      this.isShow = true;
    },
    // 选择方案
    handleChange(data) {
      this.methodLabel = data.solutionName;
      this.modelId = data.id;
    },
    // 确认切换方案
    async handleOk() {
      if (this.programmeList.length > 0) {
        this.$confirm({
          title: '是否切换当前运行方案？',
          okText: '确定',
          cancelText: '取消',
          onOk: async () => {
            this.programme = this.methodLabel;
            this.activeModule = this.programmeList.filter(item => {
              return item.id === this.modelId;
            })[0];
            let params = {
              solutionId: this.activeModule.id,
              waterPlantId: this.waterPlantId,
              solutionType: '4'
            };
            const { resultData, status } = await switchRunningSchemes(params);
            if (status === 'complete') {
              this.isShow = false;
              this.$message.success('切换成功！');
            }
          },
          onCancel: () => {}
        });
      }
    },
    // 取消切换方案
    handleCancel() {
      this.isShow = false;
      this.modelId = this.activeModule.id;
    },
    // 跳转到参数优化页面
    toPredict() {
      let { paramId, modelId, waterPlantId, id, solutionName } = this.activeModule;
      this.drillDown({
        path: '/runPredict/optimalDecision',
        query: {
          modelId,
          optionName: solutionName,
          predictionId: paramId,
          waterPlantId,
          schemeId: id,
          tabKey: 'sludgeParam'
        }
      });
    }
  }
};
</script>

<style lang="less" scoped>
.page {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  /deep/.form-header {
    height: 50px !important;
  }
  /deep/.wpg-form-header {
    padding: 4px 24px !important;
  }
}
.iframe-view {
  margin-bottom: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: calc(100% - 312px);
  background: #fff;
  position: relative;

  .map-top-right {
    position: absolute;
    top: 16px;
    right: 16px;
    z-index: 1000;
    width: 36px;
    height: 36px;


    .map-right-control {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      border-radius: 4px;
    }
  }
}
.page-item {
  display: flex;
  justify-content: space-between;
  width: 100%;
}
.form-item {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-right: 20px;

  .form-label {
    height: 20px;
    font-family: PingFangSC-Regular, sans-serif;
    font-weight: 400;
    font-size: 14px;
    color: var(--supply-color-secondary);
    letter-spacing: 0;
    margin-right: 12px;
  }
  .select-item {
    margin-right: 8px;
    color: var(--mft-2-cls);
  }
  .ico-change {
    width: 36px;
    height: 36px;
    background-color: var(--supply-color-primary-DEFAULT);
    border-color: var(--supply-color-primary-DEFAULT);
    text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.12);
    box-shadow: 0 2px 0 rgba(0, 0, 0, 0.045);
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 4px;
  }
  .ico-change:hover {
    background-color: var(--supply-color-primary-hover);
    border-color: var(--supply-color-primary-hover);
  }
}
.methods-box {
  .title {
    font-family: PingFangSC-Regular, sans-serif;
    font-weight: 400;
    font-size: 14px;
    color: var(--supply-color-main);
  }
  .methods-list {
    max-height: 290px;
    overflow: auto;
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    margin-top: 15px;
    .filed {
      width: calc(25% - 8px);
      height: 90px;
      margin-right: 8px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: #f7f8fa;
      border: 1px solid #ebedf0;
      border-radius: 4px;
      cursor: pointer;
      margin-bottom: 8px;
    }
    .active {
      background: #4285f414;
      border: 1px solid #4285f4;
    }
    .ico-method {
      width: 40px;
      height: 40px;
      margin-bottom: 8px;
    }
    .method-title {
      width: 100%;
      padding: 0 4px;
      font-family: PingFangSC-Regular, sans-serif;
      font-weight: 400;
      font-size: 12px;
      text-align: center;
      color: var(--supply-color-secondary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .filed:nth-child(4n + 1) .ico-method {
      background: url('~@/assets/images/default/ico-leaf.png') no-repeat;
      background-size: 100% 100%;
    }
    .filed:nth-child(4n + 2) .ico-method {
      background: url('~@/assets/images/default/ico-sun.png') no-repeat;
      background-size: 100% 100%;
    }
    .filed:nth-child(4n + 3) .ico-method {
      background: url('~@/assets/images/default/ico-maple.png') no-repeat;
      background-size: 100% 100%;
    }
    .filed:nth-child(4n) .ico-method {
      background: url('~@/assets/images/default/ico-snow.png') no-repeat;
      background-size: 100% 100%;
    }
    .filed1.active .ico-method {
      background: url('~@/assets/images/default/ico-leaf1.png') no-repeat;
      background-size: 100% 100%;
    }
    .filed2.active .ico-method {
      background: url('~@/assets/images/default/ico-sun1.png') no-repeat;
      background-size: 100% 100%;
    }
    .filed3.active .ico-method {
      background: url('~@/assets/images/default/ico-maple1.png') no-repeat;
      background-size: 100% 100%;
    }
    .filed4.active .ico-method {
      background: url('~@/assets/images/default/ico-snow1.png') no-repeat;
      background-size: 100% 100%;
    }
  }
}
</style>
