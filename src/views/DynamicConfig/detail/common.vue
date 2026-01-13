<!--
  @author: zhangxiang
  @date: 2021-08-27 11:06:58
  @desc：配置详情
-->
<template>
  <section>
    <header class="wbgc-card wbr-4">
      <span class="title wfc1">配置详情</span>
      <div class="item-wrapper">
        <w-form-model-item label="选择污水厂">
          <w-info-tree-select
            v-model="firstWaterPlant.id"
            style="width: 226px"
            :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
            :tree-data="waterPlantTree"
            placeholder="请选择污水厂"
            tree-default-expand-all
            @change="handleWaterPlantChange"
          >
          </w-info-tree-select>
        </w-form-model-item>
        <w-form-model-item label="水厂排序" class="sort">
          <a-input-number v-model="sort" />
        </w-form-model-item>
        <w-button v-if="$route.query.typeCode" style="margin-left: 12px" @click="handleBack">
          返回
        </w-button>
      </div>
    </header>
    <div class="wbgc-card wbr-4 content-wrapper">
      <div class="base-info">
        <div class="title">配置信息</div>
        <w-row :gutter="[12]">
          <w-col :span="7">
            <w-form-model-item
              label="配置模块"
              :label-col="{ span: 8 }"
              :wrapper-col="{ span: 16 }"
            >
              <span>{{ info.groupName || '--' }}</span>
            </w-form-model-item>
          </w-col>
          <w-col :span="7">
            <w-form-model-item
              label="配置项名称"
              :label-col="{ span: 8 }"
              :wrapper-col="{ span: 16 }"
            >
              <span>{{ info.typeName || '--' }}</span>
            </w-form-model-item>
          </w-col>
          <w-col :span="7">
            <w-form-model-item
              label="配置项code"
              :label-col="{ span: 8 }"
              :wrapper-col="{ span: 16 }"
            >
              <span>{{ info.typeCode || '--' }}</span>
            </w-form-model-item>
          </w-col>
        </w-row>
      </div>
      <div v-loading="loading" class="content wbdc-divider">
        <div class="title">配置项</div>
        <component
          :is="currentComponent"
          ref="component"
          :waterPlantId="waterPlantId"
          :info="info"
          :form="form"
          :loading="submitLoading"
          @submit="handleSubmit"
        />
      </div>
    </div>
  </section>
</template>

<script>
import { mapGetters } from 'vuex';
import {
  StationForm,
  StationDeviceForm,
  StationDevicePointForm,
  StructureForm,
  WithTotalUnitCalc,
  WithExtraCalc,
  WithExtraIndexCalc,
  PointForm,
  WithMDeviceMPointExtraCalcUnitName,
  WithTotalUnitExtraCalcName,
  StructureWithExtraSvgname,
  StructureWithSvgname,
  WithTotalUnitExtraCalc,
  RoleConfigTicketType,
  SvgConfigTicketType,
  WithExtraCalcNameUnit,
  WaterPlantConfigDetail,
  TicketTemplate,
  DeviceTemplate,
  WithTotalUnitCalcSinglePoint,
  WaterPiont,
  MessageForm,
  IndexUnit
} from '../components';
import {
  StationConfig,
  StationDeviceConfig,
  StationDevicePointConfig,
  StructureConfig,
  WithTotalUnitCalcConfig,
  WithExtraCalcConfig,
  WithExtraIndexCalcConfig,
  PointConfig,
  WithMDeviceMPointExtraCalcUnitNameConfig,
  StructureWithExtraSvgnameConfig,
  StructureWithSvgnameConfig,
  RoleConfigTicketTypeConfig,
  WithTotalUnitExtraCalcNameConfig,
  WithTotalUnitExtraCalcConfig,
  SvgConfigTicketTypeConfig,
  WithExtraCalcNameUnitConfig,
  WaterPlantConfig,
  TicketTemplateConfig,
  DeviceTemplateConfig,
  WIthTotalUnitCalcSinlePointConfig,
  WaterPiontConfig,
  MessageConfig,
  OAIndexConfig
} from '../dynamic-config.js';
import Empty from '@/components/empty.vue';

export default {
  name: 'DynamicConfigDetail',
  inject: ['closeTab'],
  props: {
    propsTypeCode: {
      type: String,
      default: ''
    },
    propsOriginCode: {
      type: String,
      default: ''
    },
    path: {
      type: String,
      default: ''
    }
  },
  components: {
    StationDevicePointForm,
    StationForm,
    StationDeviceForm,
    StructureForm,
    WithTotalUnitCalc,
    WithExtraCalc,
    Empty,
    WithExtraIndexCalc,
    PointForm,
    WithMDeviceMPointExtraCalcUnitName,
    StructureWithExtraSvgname,
    StructureWithSvgname,
    // WithTotalUnitCalcExtraName,
    RoleConfigTicketType,
    SvgConfigTicketType,
    WithTotalUnitExtraCalcName,
    WithTotalUnitExtraCalc,
    WithExtraCalcNameUnit,
    WaterPlantConfigDetail,
    TicketTemplate,
    DeviceTemplate,
    WithTotalUnitCalcSinglePoint,
    WaterPiont,
    MessageForm,
    IndexUnit
  },
  data() {
    return {
      waterPlantId: undefined,
      sort: 0,
      form: {
        domains: []
      },
      info: {},
      typeInfo: {},
      loading: false,
      submitLoading: false
    };
  },
  computed: {
    ...mapGetters('dictionary', ['normalizeWaterPlantList']),
    ...mapGetters('user', {
      userInfo: 'info'
    }),
    ...mapGetters('dictionary', ['waterPlantTree', 'firstWaterPlant']),
    originCode() {
      return this.propsOriginCode || this.$route.query.originCode || this.info?.originCode;
    },
    typeCode() {
      return this.propsTypeCode || this.$route.query.typeCode || this.info?.typeCode;
    },
    currentComponent() {
      // const typeId = this.$route.query.typeId;
      const originCode = this.originCode;
      // let originCode = 'messageConfig';
      if (StationDevicePointConfig.has(originCode)) {
        return 'StationDevicePointForm';
      } else if (WithTotalUnitCalcConfig.has(originCode)) {
        return 'WithTotalUnitCalc';
      } else if (StructureConfig.has(originCode)) {
        return 'StructureForm';
      } else if (StationConfig.has(originCode)) {
        return 'StationForm';
      } else if (StationDeviceConfig.has(originCode)) {
        return 'StationDeviceForm';
      } else if (WithExtraIndexCalcConfig.has(originCode)) {
        return 'WithExtraIndexCalc';
      } else if (WithExtraCalcConfig.has(originCode)) {
        return 'WithExtraCalc';
      } else if (PointConfig.has(originCode)) {
        return 'PointForm';
      } else if (WithMDeviceMPointExtraCalcUnitNameConfig.has(originCode)) {
        return 'WithMDeviceMPointExtraCalcUnitName';
      } else if (StructureWithExtraSvgnameConfig.has(originCode)) {
        return 'StructureWithExtraSvgname';
      } else if (StructureWithSvgnameConfig.has(originCode)) {
        return 'StructureWithSvgname';
      } else if (WithTotalUnitExtraCalcNameConfig.has(originCode)) {
        return 'WithTotalUnitExtraCalcName';
      } else if (WithTotalUnitExtraCalcConfig.has(originCode)) {
        return 'WithTotalUnitExtraCalc';
      } else if (RoleConfigTicketTypeConfig.has(originCode)) {
        return 'RoleConfigTicketType';
      } else if (SvgConfigTicketTypeConfig.has(originCode)) {
        return 'SvgConfigTicketType';
      } else if (WithExtraCalcNameUnitConfig.has(originCode)) {
        return 'WithExtraCalcNameUnit';
      } else if (WaterPlantConfig.has(originCode)) {
        return 'WaterPlantConfigDetail';
      } else if (TicketTemplateConfig.has(originCode)) {
        return 'TicketTemplate';
      } else if (DeviceTemplateConfig.has(originCode)) {
        return 'DeviceTemplate';
      } else if (WIthTotalUnitCalcSinlePointConfig.has(originCode)) {
        return 'WithTotalUnitCalcSinglePoint';
      } else if (WaterPiontConfig.has(originCode)) {
        return 'WaterPiont';
      } else if (MessageConfig.has(originCode)) {
        return 'MessageForm';
      } else if (OAIndexConfig.has(originCode)) {
        return 'IndexUnit';
      } else {
        return 'empty';
      }
    }
  },
  watch: {
    firstWaterPlant: {
      handler(val) {
        this.waterPlantId = val?.id;
        this.getConfigInfo();
      },
      immediate: true
    }
  },
  async activated() {
    if (this.path !== this.$route.path) {
      return;
    }
    if (this.$route?.meta?.menuJson?.code) {
      await this.getSubTypeByCode(this.$route?.meta?.menuJson?.code);
    } else {
      this.info = JSON.parse(window.sessionStorage.getItem('dynamic-config')) ?? {};
    }
    this.getConfigInfo();
  },
  async mounted() {
    if (this.path !== this.$route.path) {
      return;
    }
    if (this.$route?.meta?.menuJson?.code) {
      await this.getSubTypeByCode(this.$route?.meta?.menuJson?.code);
      this.getConfigInfo();
    } else {
      this.info = JSON.parse(window.sessionStorage.getItem('dynamic-config')) ?? {};
    }
  },
  methods: {
    async getSubTypeByCode(code) {
      try {
        if (this.path !== this.$route.path) {
          return;
        }
        const { resultData } = await this.$axios.post('/waterwork-sys-api/ConfigureType/list', {
          groupCode: `${this.$store.state.user.info.tenantCode}_${code}`,
          pageFlag: false
        });
        this.info = resultData?.[0] || {};
      } catch (error) {
        this.info = {};
        console.log('error', error);
      }
    },
    handleWaterPlantChange(value) {
      this.waterPlantId = value;
      this.getConfigInfo();
    },
    // 获取具体项目的水厂的配置信息
    async getConfigInfo() {
      if (this.path !== this.$route.path) {
        return;
      }
      const typeCode = this.typeCode;
      if (!typeCode || !this.waterPlantId) {
        return;
      }
      this.loading = true;
      try {
        const { resultData } = await this.$axios.get(
          '/waterwork-sys-api/configureItem/deviceUseConfig',
          {
            params: {
              waterPlantId: this.waterPlantId,
              typeCode: typeCode
            }
          }
        );
        const value = resultData?.value && JSON.parse(resultData?.value);
        this.sort = Array.isArray(resultData) && !resultData.length ? 0 : resultData.sort ?? 0;
        if (Array.isArray(value)) {
          this.form.domains = value;
          console.log('this.form.domains', this.form.domains);
        } else {
          this.form = {
            ...value,
            domains: value?.configParaList ?? []
          };
          delete this.form.configParaList;
        }
        this.typeInfo = Array.isArray(resultData) && !resultData.length ? {} : resultData;
      } catch (error) {
        console.log(error);
        this.form = {
          domains: []
        };
        this.typeInfo = {};
      } finally {
        this.$nextTick(() => {
          this.currentComponent !== 'empty' && this.$refs['component'].initForm();
          this.loading = false;
        });
      }
    },
    // 提交配置信息
    async handleSubmit(value) {
      try {
        this.submitLoading = true;
        if (!this.typeCode) {
          return;
        }
        const { resultData } = await this.$axios.post(
          '/waterwork-sys-api/configureItem/CreateOrUpdate/measureConfig',
          {
            value: JSON.stringify(value),
            // configureTypeId: this.$route.query.typeId,
            typeCode: this.info.typeCode,
            typeName: this.info.typeName,
            groupCode: this.info.groupCode,
            tenantId: this.userInfo.tenantId,
            waterPlantId: this.waterPlantId,
            userId: this.userInfo.userId,
            id: this.typeInfo.id
          }
        );
        if (resultData) {
          this.$message.success('操作成功!');
          this.getConfigInfo();
        }
      } catch (error) {
        console.log(error);
      } finally {
        this.submitLoading = false;
      }
    },
    handleBack() {
      this.closeTab(this.$route.path);
    }
  }
};
</script>

<style lang="less" scoped>
section {
  display: flex;
  flex-flow: column nowrap;
  height: 100%;
  header {
    font-size: 18px;
    flex: 0 0 54px;
    display: flex;
    align-items: center;
    padding: 0 24px;
    justify-content: space-between;

    .item-wrapper {
      display: flex;
      flex: 1;
      align-items: center;
      justify-content: flex-end;

      .wpg-form-item {
        display: flex;
        margin-bottom: 0;

        &.sort {
          margin-left: 10px;
        }
      }
    }
  }
  .content-wrapper {
    margin-top: 12px;
    flex: 1;
    min-height: 0;
    display: flex;
    flex-flow: column nowrap;
    overflow: hidden scroll;
    padding-bottom: 24px;
    &::-webkit-scrollbar {
      width: 0;
    }

    .base-info,
    .content {
      .title {
        height: 54px;
        display: flex;
        align-items: center;
        padding: 0 24px;
        font-weight: 400;
        font-size: 18px;
      }
    }

    .content {
      border-top-width: 1px;
      border-top-style: solid;
      flex: 1;
      display: flex;
      flex-direction: column;
    }
  }
}
</style>
