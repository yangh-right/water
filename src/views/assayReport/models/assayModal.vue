<template>
  <w-modal
    v-model="visible"
    class="assay-modal"
    title="数据填报"
    :width="1000"
    :height="680"
    cancelText="取消"
    okText="保存"
    :confirmLoading="loading"
    @ok="handleOK"
    @cancel="hide"
  >
    <div class="device-edit full-view">
      <div class="assay-set-tap supply-bg-bg-card-DEFAULT supply-flex-none supply-overflow-hidden">
        <span :class="activeCode === 'all' ? 'active' : ''" @click="changeTab('all')">全部</span>

        <span
          v-for="tab in manuallyDataList"
          :key="tab.dictValue"
          :class="activeCode === tab.dictValue ? 'active' : ''"
          @click="changeTab(tab.dictValue)"
        >
          {{ tab.dictName }}
        </span>
      </div>
      <div class="device-edit-content wbgc-card" v-loading="loading">
        <div class="detail-content-left wbgc-card full-view">
          <BaseInfo ref="baseInfo" :validate.sync="validateOptions.baseInfo"></BaseInfo>
          <!-- 水温 -->
          <WaterTemperatureInfo
            v-if="activeCode === 'all' || activeCode === 'water_temperature'"
            configCode="water_temperature"
            ref="waterTemperatureInfo"
            :isEdit="isEdit"
            :validate.sync="validateOptions.waterTemperatureInfo"
          ></WaterTemperatureInfo>
          <!-- pH检测模块 -->
          <PhInfo
            v-if="activeCode === 'all' || activeCode === 'pH'"
            configCode="pH"
            :isEdit="isEdit"
            ref="phInfo"
            :validate.sync="validateOptions.phInfo"
          ></PhInfo>
          <!-- 溶解氧 -->
          <DissolvedOxygen
            v-if="activeCode === 'all' || activeCode === 'dissolved_oxygen'"
            configCode="dissolved_oxygen"
            ref="dissolvedOxygenInfo"
            :isEdit="isEdit"
            :validate.sync="validateOptions.dissolvedOxygenInfo"
          ></DissolvedOxygen>
          <!-- 化学需氧量 -->
          <CodInfo
            v-if="activeCode === 'all' || activeCode === 'COD'"
            configCode="COD"
            :isEdit="isEdit"
            ref="codInfo"
            :validate.sync="validateOptions.codInfo"
          ></CodInfo>
          <!-- 五日生化需氧量 -->
          <Bod5Info
            v-if="activeCode === 'all' || activeCode === 'BOD₅'"
            configCode="BOD₅"
            :isEdit="isEdit"
            ref="bod5Info"
            :validate.sync="validateOptions.bod5Info"
          ></Bod5Info>
          <!-- 曝气池活性污泥 -->
          <ActivatedSludgeInfo
            v-if="activeCode === 'all' || activeCode === 'Activated_Sludge'"
            :isEdit="isEdit"
            configCode="Activated_Sludge"
            ref="activatedSludgeInfo"
            :validate.sync="validateOptions.activatedSludgeInfo"
          ></ActivatedSludgeInfo>
          <!-- 色度 -->
          <ChromaticityInfo
            v-if="activeCode === 'all' || activeCode === 'Chromaticity'"
            configCode="Chromaticity"
            :isEdit="isEdit"
            ref="chromaticityInfo"
            :validate.sync="validateOptions.chromaticityInfo"
          ></ChromaticityInfo>
          <!-- 粪大肠菌群 -->
          <FecalColiformsInfo
            v-if="activeCode === 'all' || activeCode === 'Fecal_Coliforms'"
            configCode="Fecal_Coliforms"
            :isEdit="isEdit"
            ref="fecalColiformsInfo"
            :validate.sync="validateOptions.fecalColiformsInfo"
          ></FecalColiformsInfo>
          <!-- 总磷 -->
          <TnInfo
            v-if="activeCode === 'all' || activeCode === 'TN'"
            configCode="TN"
            :isEdit="isEdit"
            ref="tnInfo"
            :validate.sync="validateOptions.tnInfo"
          ></TnInfo>
          <!-- 总氮 -->
          <TpInfo
            v-if="activeCode === 'all' || activeCode === 'TP'"
            configCode="TP"
            :isEdit="isEdit"
            ref="tpInfo"
            :validate.sync="validateOptions.tpInfo"
          ></TpInfo>
          <!-- 氨氮 -->
          <Nh3Info
            v-if="activeCode === 'all' || activeCode === 'NH₃-N'"
            configCode="NH₃-N"
            :isEdit="isEdit"
            ref="nh3Info"
            :validate.sync="validateOptions.nh3Info"
          ></Nh3Info>
          <!-- 微生物镜检 -->
          <MicrobialMicroscopyInfo
            v-if="activeCode === 'all' || activeCode === 'Microbial_Microscopy'"
            :isEdit="isEdit"
            configCode="Microbial_Microscopy"
            ref="microbialMicroscopyInfo"
            :validate.sync="validateOptions.microbialMicroscopyInfo"
          ></MicrobialMicroscopyInfo>
          <!-- 悬浮物 -->
          <SsInfo
            v-if="activeCode === 'all' || activeCode === 'SS'"
            configCode="SS"
            :isEdit="isEdit"
            ref="ssInfo"
            :validate.sync="validateOptions.ssInfo"
          ></SsInfo>
        </div>
      </div>
    </div>
  </w-modal>
</template>

<script>
import { batchAddAssayReport } from '@/api/report';

import BaseInfo from './BaseInfo.vue';
import WaterTemperatureInfo from './WaterTemperatureInfo.vue';
import PhInfo from './PhInfo.vue';
import DissolvedOxygen from './DissolvedOxygen.vue';
import CodInfo from './CodInfo.vue';
import Bod5Info from './Bod5Info.vue';
import ActivatedSludgeInfo from './ActivatedSludgeInfo.vue';
import ChromaticityInfo from './ChromaticityInfo.vue';
import FecalColiformsInfo from './FecalColiformsInfo.vue';
import TnInfo from './TnInfo.vue';
import TpInfo from './TpInfo.vue';
import Nh3Info from './Nh3Info.vue';
import MicrobialMicroscopyInfo from './MicrobialMicroscopyInfo.vue';
import SsInfo from './SsInfo.vue';
export default {
  name: 'AssayModal',
  components: {
    BaseInfo,
    WaterTemperatureInfo,
    PhInfo,
    DissolvedOxygen,
    CodInfo,
    Bod5Info,
    ActivatedSludgeInfo,
    ChromaticityInfo,
    FecalColiformsInfo,
    TnInfo,
    TpInfo,
    Nh3Info,
    MicrobialMicroscopyInfo,
    SsInfo
  },
  props: {
    fields: {
      type: Array,
      default: () => []
    },
    visible: {
      type: Boolean,
      default: false
    },
    manuallyDataList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      form: {},
      validateOptions: {
        baseInfo: false,
        waterTemperatureInfo: false,
        phInfo: false,
        dissolvedOxygenInfo: false,
        codInfo: false,
        bod5Info: false,
        activatedSludgeInfo: false,
        chromaticityInfo: false,
        fecalColiformsInfo: false,
        tnInfo: false,
        tpInfo: false,
        nh3Info: false,
        microbialMicroscopyInfo: false,
        ssInfo: false
      },
      loading: false,
      isEdit: false,
      activeCode: 'all'
    };
  },
  watch: {
    visible(val) {}
  },
  mounted() {},
  methods: {
    // 统一维护各化验模块的映射关系
    getSections() {
      return [
        { code: 'water_temperature', ref: 'waterTemperatureInfo' },
        { code: 'pH', ref: 'phInfo' },
        { code: 'dissolved_oxygen', ref: 'dissolvedOxygenInfo' },
        { code: 'COD', ref: 'codInfo' },
        { code: 'BOD₅', ref: 'bod5Info' },
        { code: 'Activated_Sludge', ref: 'activatedSludgeInfo' },
        { code: 'Chromaticity', ref: 'chromaticityInfo' },
        { code: 'Fecal_Coliforms', ref: 'fecalColiformsInfo' },
        { code: 'TN', ref: 'tnInfo' },
        { code: 'TP', ref: 'tpInfo' },
        { code: 'NH₃-N', ref: 'nh3Info' },
        { code: 'Microbial_Microscopy', ref: 'microbialMicroscopyInfo' },
        { code: 'SS', ref: 'ssInfo' }
      ];
    },
    changeTab(val) {
      this.activeCode = val;
    },
    hide() {
      // 重置校验及清除数据
      if (this.$refs['baseInfo']) {
        this.$refs['baseInfo'].resetFields();
      }
      this.getSections().forEach(({ ref }) => {
        const comp = this.$refs[ref];
        if (comp && typeof comp.clearData === 'function') {
          comp.clearData();
        }
      });
      this.activeCode = '';
      this.visible = false;
    },
    show(row, type, tabVal) {
      this.activeCode = tabVal;
      this.isEdit = type === 'edit';
      this.visible = true;
      this.$nextTick(() => {
        if (type === 'edit') {
          // 基础信息
          this.$refs['baseInfo'].handleEditData(row);
          const target = this.getSections().find(s => s.code === this.activeCode);
          if (
            target &&
            this.$refs[target.ref] &&
            typeof this.$refs[target.ref].handleEditData === 'function'
          ) {
            this.$refs[target.ref].handleEditData(row);
          }
        }
      });
    },
    handleOK() {
      // 校验基础信息
      this.$refs['baseInfo'].formValidate();
      if (!this.validateOptions.baseInfo) {
        return;
      }
      let params = {
        manuallyDataList: [],
        samplingDate: '',
        waterPlantId: '',
        ...this.$refs['baseInfo'].handleData()
      };

      this.getSections().forEach(({ code, ref }) => {
        if (this.activeCode === 'all' || this.activeCode === code) {
          const comp = this.$refs[ref];
          if (comp && typeof comp.handleData === 'function') {
            params.manuallyDataList.push(...comp.handleData());
          }
        }
      });

      batchAddAssayReport(params).then(res => {
        if (res.status === 'complete') {
          this.$message.success('新增成功');
          this.$emit('refresh');
          this.hide();
        }
      });
    }
  }
};
</script>
<style lang="less" scoped>
.assay-modal {
  /deep/ .wpg-modal {
    height: 680px;
    min-height: 600px;
    padding: 0;
    overflow: hidden;

    .wpg-modal-content {
      display: flex;
      flex-direction: column;
      height: 100%;

      .wpg-modal-header {
        padding: 12px 4px;
        background-color: var(--supply-color-bg-card-dark);

        &::after {
          content: unset;
        }
      }

      .wpg-modal-body {
        flex: 1;
        padding: 8px 16px;
        overflow-y: auto;
      }
    }
  }
}
.assay-set-tap {
  height: 42px;
  border-radius: 4px;
  padding: 0 12px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  /deep/ .ant-radio-group {
    display: flex;
    align-items: center;
  }
  span {
    display: inline-block;
    height: 100%;
    width: 120px;
    font-size: 14px;
    color: #999999;
    text-align: center;
    font-weight: 400;
    line-height: 42px;
    cursor: pointer;
    &.active {
      color: var(--supply-color-primary-DEFAULT);
      border-bottom: 2px solid var(--supply-color-primary-DEFAULT);
    }
  }
  .ant-btn {
    height: 28px;
    margin-top: 10px;
    margin-right: 30px;
  }
}
.device-edit {
  width: 100%;

  .device-edit-content {
    height: calc(100% - 42px);
    padding: 0px 40px 0 40px;
    overflow: auto;
    .content-monitor {
      margin-bottom: 20px;
    }
  }
  .detail-content-left {
    flex: 1;
    overflow: auto;
    .steps {
      padding-left: 30px;
      width: 100%;
      display: flex;
      justify-content: flex-start;
      flex-flow: row wrap;
    }
  }
  .form-pointName {
    width: 326px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;

    .form-label {
      height: 20px;
      font-family: PingFangSC-Regular, sans-serif;
      font-weight: 400;
      font-size: 14px;
      color: var(--supply-color-secondary);
      letter-spacing: 0;
      margin-right: 12px;
    }
  }
  .form-title {
    padding: 15px 0;
    font-size: 16px;
  }
  .table-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    .table-title {
      color: #6281a3;
      .table-tip-text {
        color: #999999;
      }
    }
  }
  .row-repeat {
    border-color: rgb(246, 67, 87);
  }
}
.assay-modal {
  /deep/ .wpg-form-item {
    margin-bottom: 0;
    .wpg-form-item-children {
      p {
        margin-bottom: 0;
      }
    }
    .wpg-form-item-text {
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }
    .hidden-word {
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      display: block;
    }
  }
}
</style>
