<!--
 * @Author: wangyr
 * @Date: 2023-07-28 16:03:21
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2024-06-05 16:17:04
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
            <w-button class="btn-item" @click.native="showModal">含水率</w-button>
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
            :class="['filed', 'filed' + (i + 1), item.id === modelId ? 'active' : '']"
          >
            <div class="ico-method"></div>
            <div class="method-title">{{ item.solutionName }}</div>
          </div>
        </div>
      </div>
    </w-modal>
    <DragModal
      ref="dragModal"
      :isDrag="false"
      :isShowFullBtn="false"
      title="含水率"
      :width="848"
      :mask="true"
      :height="483"
      @close="closeModal"
    >
      <moistureContent @changeList="changeList"></moistureContent>
    </DragModal>
  </div>
</template>

<script>
import { runFields } from './components/data.js';
import { switchRunningSchemes, programmeList } from '@/api/optimization';
import { waterPredictionSolution } from '@/api/manage';
import TechnologyFlow from './components/TechnologyFlow.vue';
import MainPoint from './components/MainPoint.vue';
import ChartPointLeft from './components/ChartPointLeft.vue';
import ChartPointRight from './components/ChartPointRight.vue';
import ControlTheory from './components/ControlTheory.vue';
import DragModal from '@/components/DragModal/index.vue';
import moistureContent from '../models/moistureContent.vue';
export default {
  name: 'sandDischarge',
  components: {
    FactorySelect: () => import('@/components/factory-select/index.vue'),
    TechnologyFlow,
    MainPoint,
    ChartPointLeft,
    ChartPointRight,
    ControlTheory,
    moistureContent,
    DragModal
  },
  data() {
    return {
      layout: {
        span: 8,
        labelCol: { span: 8 },
        wrapperCol: { span: 16 },
        gutter: [0] //栅格间隔[水平间距，垂直间距]
      },
      fields: runFields,
      waterPlantId: '',
      programme: '',
      isShow: false,
      activeModule: {},
      programmeList: [],
      predictionSolution: [],
      hideRightControl: false,
      placement: 'right',
      suggestDataInfo: {},
      modelId: '' //方案id
    };
  },
  computed: {},
  watch: {
    waterPlantId(val) {
      if (val) {
        this.getSchemeList();
        this.getWaterPredictionSolution();
      }
    }
  },
  created() {},
  methods: {
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
    showModal() {
      this.$refs.dragModal.visible = true;
    },
    closeModal() {
      this.$refs.dragModal.visible = false;
    },
    changeList() {},
    suggestData(data) {
      this.suggestDataInfo = data;
    },
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
    handleRightControl() {
      this.hideRightControl = !this.hideRightControl;
    },
    onClose() {
      this.hideRightControl = false;
    },
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
    programmeChange() {},
    /* 全屏切换 */
    handleClick() {
      this.isShow = true;
    },
    handleChange(data) {
      this.methodLabel = data.solutionName;
      this.modelId = data.id;
    },
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
    handleCancel() {
      this.isShow = false;
      this.modelId = this.activeModule.id;
    },
    toPredict() {
      // let { paramId, modelId, waterPlantId, id, solutionName } = this.activeModule;
      // this.drillDown({
      //   path: '/runPredict/optimalDecision',
      //   query: {
      //     modelId,
      //     optionName: solutionName,
      //     predictionId: paramId,
      //     waterPlantId,
      //     schemeId: id,
      //     tabKey: 'sludgeParam'
      //   }
      // });
    }
  },
  mounted() {}
};
</script>

<style lang="less" scoped>
@import '@/views/debugTool/style/index.less';
</style>
