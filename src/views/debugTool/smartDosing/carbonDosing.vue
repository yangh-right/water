<!--
 * @Author: wangyr
 * @Date: 2023-07-28 16:03:21
 * @LastEditors: wangyr
 * @LastEditTime: 2024-11-19 18:00:37
 * @Description:
-->
<template>
  <div class="page">
    <div class="page__left">
      <chart-point-left :waterPlantId="waterPlantId"></chart-point-left>
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
          <template #programme>
            <div class="form-item">
              <w-input
                class="select-item"
                style="width:calc(100% - 45px)"
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
          <template #footer>
            <!-- <w-button class="btn-item" @click.native="toPredict">加药参数优化</w-button> -->
          </template>
        </w-form-header>
        <div class="iframe-view">
          <technology-flow title="工艺流程图" :waterPlantId="waterPlantId"></technology-flow>
        </div>
      </div>
      <div class="page-item">
        <control-theory :waterPlantId="waterPlantId"></control-theory>
      </div>
    </div>
    <div class="page__right">
      <chart-point-right
        :waterPlantId="waterPlantId"
        @suggestData="suggestData"
      ></chart-point-right>
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
import { runFields } from './components/data.js';
import { switchRunningSchemes, programmeList } from '@/api/optimization';
import TechnologyFlow from './components/TechnologyFlow.vue';
import { SolutionTypeMap } from '../data';
import { getModelList } from '@/api/runTime';
import ChartPointLeft from './components/ChartPointLeft.vue';
import ChartPointRight from './components/ChartPointRight.vue';
import ControlTheory from './components/ControlTheory.vue';
export default {
  name: 'sandDischarge',
  components: {
    FactorySelect: () => import('@/components/factory-select/index.vue'),
    TechnologyFlow,
    ChartPointRight,
    ChartPointLeft,
    ControlTheory
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
      solutionType: '3',
      layout: {
        span: 8,
        labelCol: { span: 8 },
        wrapperCol: { span: 16 },
        gutter: [0] //栅格间隔[水平间距，垂直间距]
      },
      fields: runFields,
      modelList: [],
      waterPlantId: '',
      programme: '',
      isShow: false,
      activeModule: {},
      programmeList: [],
      suggestDataInfo: [],
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
        modelTypeCode: '3',
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
    suggestData(data = []) {
      this.suggestDataInfo = data;
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
