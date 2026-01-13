<!--
 * @Author: wangyr
 * @Date: 2023-07-28 16:03:21
 * @LastEditors: wangyr
 * @LastEditTime: 2024-08-21 17:06:50
 * @Description:
-->
<template>
  <div class="page">
    <div class="page__left">
      <chart-point-left :bucketId="bucketId" :waterPlantId="waterPlantId"></chart-point-left>
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
          <template #bucketId>
            <w-Select style="max-width:180px" dropdownClassName="dark" v-model="bucketId">
              <w-select-option
                v-for="(item, index) in bucketList"
                :key="item.id"
                :value="item.id"
                >{{ item.bucketName }}</w-select-option
              >
            </w-Select>
          </template>
          <template #footer>
            <w-button type="primary" @click.native="toPredict">砂桶录入</w-button>
          </template>
        </w-form-header>
        <div class="iframe-view">
          <technology-flow title="工艺流程图" :waterPlantId="waterPlantId"></technology-flow>
        </div>
      </div>
      <div class="page-item">
        <control-theory
          :bucketId="bucketId"
          :bucketList="bucketList"
          :waterPlantId="waterPlantId"
        ></control-theory>
      </div>
    </div>
    <div class="page__right">
      <chart-point-right
        :bucketId="bucketId"
        :bucketList="bucketList"
        :waterPlantId="waterPlantId"
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
  </div>
</template>

<script>
import { runFields } from './components/data.js';
import { switchRunningSchemes, getSandBucketList, programmeList } from '@/api/optimization';
import TechnologyFlow from './components/TechnologyFlow.vue';
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
      bucketId: '',
      bucketList: [],
      modelId: '' //方案id
    };
  },
  computed: {},
  watch: {
    waterPlantId(val) {
      if (val) {
        // this.getSchemeList();
        this.getSandBucketList();
      }
    }
  },
  created() {},
  methods: {
    async getSandBucketList() {
      if (!this.waterPlantId) return;
      let params = {
        page: {
          current: 1,
          size: 10000
        },
        waterPlantId: this.waterPlantId
      };
      const { resultData, status } = await getSandBucketList(params);
      if (status === 'complete') {
        this.bucketList = resultData.records;
        this.bucketId = this.bucketList?.[0]?.id;
      }
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
        solutionType: '5'
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
              solutionType: '5'
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
      this.drillDown({
        path: '/sandBucketConfig'
      });
    }
  },
  mounted() {}
};
</script>
<style lang="less" scoped>
@import '@/views/debugTool/style/index.less';
</style>
