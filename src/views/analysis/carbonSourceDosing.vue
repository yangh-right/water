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
      <dosing-left :waterPlantId="waterPlantId"></dosing-left>
    </div>
    <div class="page__center">
      <div class="center__top">
        <w-form-header
          :fields="fields"
          class="supply-w-full"
          style="margin-bottom:10px"
        >
          <template #waterPlantId>
            <FactorySelect
              dropdownClassName="dark"
              v-model.trim="waterPlantId"
              autoSelect
            ></FactorySelect>
          </template>
          <template #footer>
          </template>
        </w-form-header>
        <div class="iframe-view">
          <technology-flow title="碳源加药" :waterPlantId="waterPlantId"></technology-flow>
        </div>
      </div>
    </div>
    <div class="page__right">
      <dosing-right
        :waterPlantId="waterPlantId"
      ></dosing-right>
    </div>
  </div>
</template>

<script>
import { switchRunningSchemes, programmeList } from '@/api/optimization';
import TechnologyFlow from './components/TechnologyFlow.vue';
import DosingLeft from './components/DosingLeft.vue';
import DosingRight from './components/DosingRight.vue';
export default {
  name: 'preciseDosing',
  components: {
    FactorySelect: () => import('@/components/factory-select/index.vue'),
    TechnologyFlow,
    DosingLeft,
    DosingRight
  },
  data() {
    return {
      templateId: '',
      schemeId: '',
      fields: [
        {
          label: '选择污水厂',
          name: 'waterPlantId',
          type: 'select',
          show: true,
          span: 8,
          labelCol: { span: 10 },
          wrapperCol: { span: 14 },
        }
      ],
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
        this.getSchemeList();
      }
    }
  },
  created() {},
  methods: {
    async getSchemeList() {
      let params = {
        waterPlantId: this.waterPlantId
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
@import '@/views/analysis/style/index.less';
</style>
