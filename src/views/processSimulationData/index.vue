<!--
 * @Author: wangyr
 * @Date: 2023-07-06 14:39:28
 * @LastEditors: wangyr
 * @LastEditTime: 2024-11-05 10:49:59
 * @Description:
-->
<template>
  <div class="page">
    <w-form-header :layout="layout" :fields="fields" class="supply-w-full">
      <template #waterPlantId>
        <FactorySelect
          style="max-width:179px"
          @input="factoryChange"
          v-model.trim="waterPlantId"
          autoSelect
        ></FactorySelect>
      </template>
      <template #programme>
        <div class="form-item">
          <w-input
            class="select-item"
            style="width: 202px"
            placeholder="请输入运行方案"
            :disabled="true"
            v-model="programme"
          ></w-input>
          <div class="ico-change" @click="handleClick">
            <img src="@/assets/images/default/ic_swap_horiz.png" alt="img" />
          </div>
        </div>
      </template>
      <template #action>
        <div class="supply-flex supply-justify-end">
          <w-button v-if="buttonCodes['modelBtn']" class="supply-ml-3" type="primary" ghost
            ><a :href="modelUrl + '://'">模型</a>
          </w-button>
          <w-button
            v-if="buttonCodes['modelVideo']"
            @click="toVideo"
            class="supply-ml-3"
            type="primary"
            ghost
            >模型视频</w-button
          >
          <w-button @click="toPredict" type="primary" ghost>仿真参数优化</w-button>
          <return-control :keep="true" :is-drill-down="true" class="supply-ml-3"></return-control>
        </div>
      </template>
      <template #footer></template>
    </w-form-header>
    <!-- 预测预警 -->
    <div class="page-item page-item1">
      <process-flow :waterPlantId="waterPlantId" @handleParams="handleParams"></process-flow>
      <!-- <palces-data
        title="水质预测"
        :waterPlantId="waterPlantId"
        :palcesInfo="palcesInfo"
        moduleType="alongWay"
      ></palces-data> -->
    </div>
    <div class="page-item page-item2">
      <points-data
        title="进水水质"
        :waterPlantId="waterPlantId"
        :activeModule="activeModule"
        moduleType="influenceQuality"
      ></points-data>
      <water-quality
        title="出水水质"
        :waterPlantId="waterPlantId"
        :moduleId="activeModule.id"
        :activeModule="activeModule"
        modleType="inWater"
      ></water-quality>
      <key-parameter
        title="关键参数"
        :waterPlantId="waterPlantId"
        :moduleId="activeModule.id"
        :activeModule="activeModule"
        :environment="environment"
        modleType="KeyParameter"
      ></key-parameter>
    </div>
    <div class="page-item page-item3">
      <w-tabs class="tab-wrap" size="large" v-model="tab">
        <w-tab-pane v-for="item in tabList" :key="item.id" :tab="item.name"></w-tab-pane>
      </w-tabs>
      <div class="info-box">
        <div class="info-title">
          <div class="title">适用季节：</div>
          <div class="info-content">{{ seasonLabel }}</div>
        </div>
        <div class="info-title">
          <div class="title">适用温度：</div>
          <div class="info-content">{{ temperatureLabel }}</div>
        </div>
        <div class="info-title">
          <div class="title">C/N：</div>
          <div class="info-content">{{ carbonNitrogenRatioLabel }}</div>
        </div>
      </div>
      <div class="modle-list">
        <div class="modle-item">
          <scheme-result
            title="预期效果"
            :waterPlantId="waterPlantId"
            :activeModule="tab"
            @handleModelData="handleModelData"
          ></scheme-result>
        </div>
        <div class="modle-item">
          <modle-evaluate
            title="准确率"
            :waterPlantId="waterPlantId"
            :activeModule="tab"
          ></modle-evaluate>
        </div>
      </div>
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
            :class="['filed', 'filed' + (i + 1), item.id === moduleId ? 'active' : '']"
          >
            <div class="ico-method"></div>
            <div class="method-title">{{ item.solutionName }}</div>
          </div>
        </div>
      </div>
    </w-modal>
    <!-- 视频 -->
    <video-dialog ref="modelVideo"></video-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { runFields } from './components/data';
import ProcessFlow from './components/ProcessFlow.vue';
import PointsData from './components/PointsData.vue';
import PalcesData from './components/PalcesData.vue';
import ModleEvaluate from './components/ModleEvaluate';
import WaterQuality from './components/WaterQuality.vue';
import KeyParameter from './components/KeyParameter.vue';
import SchemeResult from './components/SchemeResult.vue';
import videoDialog from './components/videoDialog.vue';
import FactorySelect from '@/components/factory-select/index.vue';
import { getSysParamByCode } from '@/api/index';
import { switchRunningSchemes, programmeList } from '@/api/optimization';
import { getSolutionTree } from '@/api/runTime';

export default {
  name: 'onlineInterWater',
  components: {
    FactorySelect,
    ProcessFlow,
    ModleEvaluate,
    PointsData,
    PalcesData,
    WaterQuality,
    KeyParameter,
    videoDialog,
    SchemeResult
  },
  data() {
    return {
      layout: {
        span: 6,
        labelCol: { span: 8 },
        wrapperCol: { span: 16 },
        gutter: [0] //栅格间隔[水平间距，垂直间距]
      },
      fields: runFields,
      waterPlantId: '',
      showType: 'chart',
      programme: '',
      activeModule: {},
      palcesInfo: {},
      programmeList: [],
      isShow: false,
      moduleId: '',
      methodLabel: '',
      tab: '',
      tabList: [],
      season: '',
      temperature: '',
      modelUrl: '',
      carbonNitrogenRatio: '',
      environment: '1' // 1，广州  2，杭州
    };
  },
  computed: {
    ...mapState('setting', ['buttonCodes']),
    seasonLabel() {
      let seasonObj = {
        '1': '春',
        '2': '夏',
        '3': '秋',
        '4': '冬'
      };
      return seasonObj[this.season] || '';
    },
    temperatureLabel() {
      let temperatureObj = {
        '1': '<15˚C',
        '2': '<25˚C',
        '3': '<35˚C'
      };
      return temperatureObj[this.temperature] || '';
    },
    carbonNitrogenRatioLabel() {
      let carbonNitrogenRatioObj = {
        '1': '3-4',
        '2': '4-5',
        '3': '5-6'
      };
      return carbonNitrogenRatioObj[this.carbonNitrogenRatio] || '';
    }
  },
  watch: {
    waterPlantId: {
      immediate: true,
      handler(val) {
        if (val) {
          this.getTreeData();
        }
      }
    }
  },
  methods: {
    async getTreeData() {
      let params = {
        waterPlantId: this.waterPlantId || '',
        solutionName: this.searchValue,
        solutionType: '1'
      };
      const res = await getSolutionTree(params);
      const { resultData, status } = res;
      if (status === 'complete') {
        let tabList = [];
        this.schemeIds = [];
        if (Array.isArray(resultData)) {
          resultData.forEach(v => {
            if (Array.isArray(v.children)) {
              v.children.forEach(item => {
                tabList.push(...item.children);
              });
            }
          });
        }
        // this.$emit('schemeNameChange', this.solutionNameMap);
        // if (!(this.solutionId && findItemFromTree(treeData, this.solutionId, 'id'))) {
        //   this.$emit('change', this.getDefaultId(treeData));
        //   this.$nextTick(() => {
        //     this.setDefaultCheckedKeys();
        //   });
        // }
        if (tabList.length > 0) {
          this.tab = tabList[0].id;
        }
        this.tabList = tabList;
      }
    },
    handleModelData(applicationSeason, applicationTemperature, carbonNitrogenRatio) {
      this.season = applicationSeason || '';
      this.temperature = applicationTemperature || '';
      this.carbonNitrogenRatio = carbonNitrogenRatio || '';
    },
    getEnvironment() {
      getSysParamByCode('environment').then(res => {
        if (res.resultData === '2') {
          this.environment = '2';
        } else {
          this.environment = '1';
        }
      });
    },
    getModelUrl() {
      getSysParamByCode('model_url').then(res => {
        if (res.status === 'complete') {
          this.modelUrl = res.resultData || '';
        }
      });
    },
    // 切换水厂
    factoryChange() {
      this.getModelList();
    },
    async getModelList() {
      let params = {
        waterPlantId: this.waterPlantId,
        solutionType: '1'
      };
      const { resultData, status } = await programmeList(params);
      if (status === 'complete') {
        this.programmeList = resultData;
        let activeProgrammeArr = this.programmeList.filter(item => item.runningFlag);
        if (activeProgrammeArr.length > 0) {
          this.activeModule = activeProgrammeArr[0];
          this.programme = activeProgrammeArr[0].solutionName;
          this.moduleId = activeProgrammeArr[0].id;
        } else {
          this.activeModule = this.programmeList[0];
          this.programme = this.programmeList[0].solutionName;
          this.moduleId = this.programmeList[0].id;
        }
      }
    },
    toPredict() {
      let { paramId, modelId, waterPlantId, id, solutionName, runningFlag } = this.activeModule;
      this.drillDown({
        path: '/runPredict/optimalDecision',
        query: {
          modelId,
          optionName: solutionName,
          predictionId: paramId,
          runningFlag,
          waterPlantId,
          schemeId: id
        }
      });
    },
    toVideo() {
      this.$nextTick(() => {
        if (this.$refs.modelVideo) {
          this.$refs.modelVideo.visible = true;
        }
      });
    },
    handleParams(pointInfo) {
      this.palcesInfo = pointInfo;
    },
    /* 全屏切换 */
    handleClick() {
      this.isShow = true;
    },
    handleChange(data) {
      this.methodLabel = data.solutionName;
      this.moduleId = data.id;
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
              return item.id === this.moduleId;
            })[0];
            let params = {
              solutionId: this.activeModule.id,
              waterPlantId: this.waterPlantId,
              solutionType: '1'
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
      this.moduleId = this.activeModule.id;
    }
  },
  created() {
    this.getEnvironment();
    this.getModelUrl();
  },
  mounted() {}
};
</script>

<style lang="less" scoped>
/deep/.wpg-tabs {
  width: 100%;
  height: 45px;

  .wpg-tabs-bar {
    padding: 0 0 0;
    margin-bottom: 0px;
    background-color: var(--supply-color-bg-card-component);
  }
}
.modle-list {
  display: flex;
  justify-content: space-between;
  height: calc(100% - 82px);
  padding: 0 16px 16px 16px;
  .modle-item {
    width: calc(50% - 6px);
    height: 100%;
    background: var(--supply-color-bg-card-dark);
    border-radius: 2px;
  }
}
.page {
  height: 100%;
  overflow: hidden;
  position: relative;
}
.page-item {
  display: flex;
  justify-content: space-between;
  width: 100%;

  margin-top: 10px;
}
.page-item1 {
  height: calc(28% - 34px);
}
.page-item2 {
  height: calc(28% - 20px);
}
.page-item3 {
  height: calc(43% - 12px);
  background: var(--supply-color-bg-card-DEFAULT);
  flex-direction: column;
  justify-content: flex-start;

  .info-box {
    display: flex;
    padding: 0 20px;

    .info-title {
      display: flex;
      align-items: center;
      margin-right: 30px;
      height: 38px;
      .title {
        font-family: PingFangSC-Regular, sans-serif;
        font-weight: 400;
        font-size: 14px;
        color: var(--supply-color-secondary);
        letter-spacing: 0;
        text-align: center;
      }
      .info-content {
        font-family: PingFangSC-Regular, sans-serif;
        font-weight: 400;
        font-size: 14px;
        color: var(--supply-color-main);
        letter-spacing: 0;
      }
    }
  }
}
.points-module {
  width: calc(25% - 4px);
}
/deep/.wpg-form-header {
  padding: 4px 24px !important;
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
    height: 42px;
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
