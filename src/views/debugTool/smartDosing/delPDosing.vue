<!--
 * @Author: wangyr
 * @Date: 2023-07-28 16:03:21
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2024-06-05 16:26:36
 * @Description:
-->
<template>
  <div class="page">
    <div class="page__left">
      <phosphorus-left :waterPlantId="waterPlantId"></phosphorus-left>
    </div>
    <div class="page__center">
      <div class="center__top">
        <w-form-header
          :layout="layout"
          :fields="fields"
          class="supply-w-full"
          style="margin-bottom:10px"
        >
          <template #waterPlantId>
            <FactorySelect
              style="max-width:180px"
              dropdownClassName="dark"
              v-model.trim="waterPlantId"
              autoSelect
            ></FactorySelect>
          </template>
          <template #footer>
            <!-- <w-button class="btn-item" @click.native="toPredict">排泥参数优化</w-button> -->
          </template>
        </w-form-header>
        <div class="iframe-view">
          <technology-flow title="工艺流程图" :waterPlantId="waterPlantId"></technology-flow>
        </div>
      </div>
      <div class="page-item">
        <smart-theory :waterPlantId="waterPlantId"></smart-theory>
      </div>
    </div>
    <div class="page__right">
      <chart-point-right :waterPlantId="waterPlantId"></chart-point-right>
    </div>
    <!-- 放大图 -->
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
            :class="['filed', 'filed' + (i + 1), item.id === templateId ? 'active' : '']"
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
import { pFields } from './components/data.js';
import { switchRunningSchemes, programmeList } from '@/api/optimization';
import TechnologyFlow from './components/TechnologyFlow.vue';
import PhosphorusLeft from './components/PhosphorusLeft.vue';
import ChartPointRight from './components/ChartPointRight.vue';
import SmartTheory from './components/SmartTheory.vue';
import { SolutionTypeMap } from '../data';
import { getModelList } from '@/api/runTime';

export default {
  name: 'sandDischarge',
  components: {
    FactorySelect: () => import('@/components/factory-select/index.vue'),
    TechnologyFlow,
    ChartPointRight,
    PhosphorusLeft,
    SmartTheory
  },
  provide() {
    return {
      toolConfig: SolutionTypeMap[this.solutionType]
    };
  },
  data() {
    return {
      templateId: '',
      schemeId: '',
      solutionType: '5',
      layout: {
        span: 8,
        labelCol: { span: 8 },
        wrapperCol: { span: 16 },
        gutter: [0] //栅格间隔[水平间距，垂直间距]
      },
      fields: pFields,
      modelList: [],
      waterPlantId: '',
      programme: '',
      isShow: false,
      activeModule: {},
      programmeList: [],
      hideRightControl: false,
      placement: 'right',
      modelId: '' //方案id
    };
  },
  computed: {},
  watch: {
    waterPlantId(val) {
      if (val) {
        this.getModelList();
        this.getSchemeList();
      }
    }
  },
  created() {},
  methods: {
    async getModelList() {
      let params = {
        modelTypeCode: '5',
        waterPlantId: this.waterPlantId
      };
      let res = await getModelList(params);
      let { status, resultData, errorMessage } = res;
      if (status === 'complete') {
        this.modelList = resultData;
        this.modelId = this.modelList?.[0]?.id || '';
      } else {
        this.modelList = [];
        this.modelId = '';
      }
    },
    async getSchemeList() {
      let params = {
        waterPlantId: this.waterPlantId,
        solutionType: this.solutionType
      };
      const { resultData, status } = await programmeList(params);
      if (status === 'complete') {
        this.programmeList = resultData;
        let activeProgrammeArr = this.programmeList.filter(item => item.runningFlag);
        if (activeProgrammeArr.length > 0) {
          this.activeModule = activeProgrammeArr[0];
          this.programme = activeProgrammeArr[0].solutionName;
          this.schemeId = activeProgrammeArr[0].id;
        } else {
          this.activeModule = this.programmeList[0];
          this.programme = this.programmeList[0].solutionName;
          this.schemeId = this.programmeList[0].id;
        }
      }
    },
    programmeChange() {},
    /* 全屏切换 */
    handleClick() {
      this.templateId = this.schemeId;
      this.isShow = true;
    },
    handleChange(data) {
      this.methodLabel = data.solutionName;
      this.templateId = data.id;
    },
    async handleOk() {
      this.$confirm({
        title: '是否切换当前运行方案？',
        okText: '确定',
        cancelText: '取消',
        onOk: async () => {
          if (this.programmeList.length > 0) {
            this.programme = this.methodLabel;
            this.activeModule = this.programmeList.filter(item => {
              return item.id === this.templateId;
            })[0];
            this.schemeId = this.templateId;
            let params = {
              solutionId: this.activeModule.id,
              waterPlantId: this.waterPlantId,
              solutionType: this.solutionType
            };
            const { resultData, status } = await switchRunningSchemes(params);
            if (status === 'complete') {
              this.isShow = false;
              this.$message.success('切换成功！');
            }
          }
        },
        onCancel: () => {}
      });
    },
    handleCancel() {
      this.isShow = false;
      this.schemeId = this.activeModule.id;
    },
    toPredict() {
      this.drillDown({
        path: '/runPredict/optimalDecision',
        query: {
          tabKey: 'dosingParam'
        }
      });
    }
  }
};
</script>

<style lang="less" scoped>
@import '@/views/debugTool/style/index.less';
</style>
