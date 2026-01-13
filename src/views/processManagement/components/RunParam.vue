-->
<template>
  <div class="content">
    <div class="content-header">
      <div class="content-title">{{ title }}</div>
      <div class="ct-left">
        <div class="time-box">
          <w-select style="width:92px" @change="handlerType" v-model="currentLine">
            <w-select-option value="1">A段</w-select-option>
            <w-select-option value="2">B段</w-select-option>
          </w-select>
        </div>
      </div>
    </div>
    <div class="module-wrap">
      <w-row :gutter="[31, 6]">
        <w-col :span="24" class="module">
          <div class="point" :style="{ columnCount: 3 }">
            <div v-for="(point, i) in processList" :key="i" class="point__item">
              <span class="item__name">{{ point.deviceName }}({{ point.pointMemo }})</span>
              <div class="list">
                <span class="value">{{ !!point.pointValue ? point.pointValue : '--' }}</span>
                <span class="supply-w-10 supply-ml-1.5 supply-inline-block">{{
                  point.pointUnit
                }}</span>
              </div>
            </div>
          </div>
        </w-col>
      </w-row>
    </div>
    <div class="content-header">
      <span class="content-title">工艺参数</span>
    </div>
    <div class="content-body">
      <div class="module-wrap">
        <w-row :gutter="[31, 6]">
          <w-col
            :span="item.span"
            v-for="(item, index) in moduleList"
            :key="item.name"
            class="module"
          >
            <div v-if="item.name" class="module-header supply-flex supply-items-center">
              <div class="module-title supply-text-main">{{ item.name }}</div>
            </div>
            <div class="point" :style="{ columnCount: item.col }">
              <div v-for="(point, i) in item.points" :key="i" class="point__item">
                <span class="item__name">{{ point.deviceName }}</span>
                <div class="list">
                  <span class="value">{{ !!point.pointValue ? point.pointValue : '--' }}</span>
                  <span class="supply-w-10 supply-ml-1.5 supply-inline-block">{{
                    point.pointUnit
                  }}</span>
                </div>
              </div>
            </div>
          </w-col>
        </w-row>
      </div>
    </div>
  </div>
</template>
<script>
import { getRealDataByConfigCodeAndPlace } from '@/api/optimization';

export default {
  name: 'RunParam',
  components: {},
  props: {
    title: {
      type: String,
      default: ''
    },
    waterPlantId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      moduleList: [
        {
          name: '',
          col: 3,
          span: 24,
          configCode: '',
          points: [
            { deviceName: '调蓄池提升流量', pointValue: 1000, pointUnit: 'm³/h' },
            { deviceName: 'SRT', pointValue: 25, pointUnit: '天' }
          ]
        },
        {
          name: '分流比例',
          span: 8,
          col: 1,
          configCode: 'biochemical_flow',
          points: [
            { deviceName: '分流比例A', pointValue: 40, pointUnit: '%' },
            { deviceName: '分流比例B', pointValue: 40, pointUnit: '%' },
            { deviceName: '分流比例A1', pointValue: 10, pointUnit: '%' },
            { deviceName: '分流比例B1', pointValue: 10, pointUnit: '%' }
          ]
        },
        {
          name: '内外回流量',
          col: 1,
          span: 8,
          configCode: 'biochemical_returnFlow',
          points: []
        },
        {
          name: '碳源投加量',
          col: 1,
          span: 8,
          configCode: 'biochemical_carbonAdded',
          points: []
        },
        {
          name: 'MLSS',
          configCode: 'base_mlss',
          col: 3,
          span: 24,
          points: []
        },
        {
          name: 'DO',
          configCode: 'biochemical_do',
          col: 3,
          span: 24,
          points: []
        }
      ],
      currentLine: '1',
      processList: []
    };
  },
  watch: {
    waterPlantId: {
      immediate: true,
      handler(val) {
        if (val) {
          this.getMlssList();
          this.getCarbonAddedList();
          this.getReturnFlowList();
          this.getDoList();
          this.getProcessTabsList();
        }
      }
    }
  },
  computed: {},
  mounted() {},
  methods: {
    async getReturnFlowList() {
      let params = {
        pumpHouseId: this.waterPlantId, //传水厂id
        configCode: 'biochemical_returnFlow',
        line: null
      };
      let { resultData, status } = await getRealDataByConfigCodeAndPlace(params);
      if (status === 'complete') {
        if (resultData.length) {
          this.moduleList.forEach(item => {
            if (item.configCode === 'biochemical_returnFlow') {
              item.points = resultData;
            }
          });
        } else {
          this.moduleList.forEach(item => {
            if (item.configCode === 'biochemical_returnFlow') {
              item.points = [];
            }
          });
        }
      }
    },
    async getCarbonAddedList() {
      let params = {
        pumpHouseId: this.waterPlantId, //传水厂id
        configCode: 'biochemical_carbonAdded',
        line: null
      };
      let { resultData, status } = await getRealDataByConfigCodeAndPlace(params);
      if (status === 'complete') {
        if (resultData.length) {
          this.moduleList.forEach(item => {
            if (item.configCode === 'biochemical_carbonAdded') {
              item.points = resultData;
            }
          });
        } else {
          this.moduleList.forEach(item => {
            if (item.configCode === 'biochemical_carbonAdded') {
              item.points = [];
            }
          });
        }
      }
    },
    async getMlssList() {
      let params = {
        pumpHouseId: this.waterPlantId, //传水厂id
        configCode: 'base_mlss',
        line: null
      };
      let { resultData, status } = await getRealDataByConfigCodeAndPlace(params);
      if (status === 'complete') {
        if (resultData.length) {
          this.moduleList.forEach(item => {
            if (item.configCode === 'base_mlss') {
              item.points = resultData;
            }
          });
        } else {
          this.moduleList.forEach(item => {
            if (item.configCode === 'base_mlss') {
              item.points = [];
            }
          });
        }
      }
    },
    async getDoList() {
      let params = {
        pumpHouseId: this.waterPlantId, //传水厂id
        configCode: 'biochemical_do',
        line: null
      };
      let { resultData, status } = await getRealDataByConfigCodeAndPlace(params);
      if (status === 'complete') {
        if (resultData.length) {
          this.moduleList.forEach(item => {
            if (item.configCode === 'biochemical_do') {
              item.points = resultData;
            }
          });
        } else {
          this.moduleList.forEach(item => {
            if (item.configCode === 'biochemical_do') {
              item.points = [];
            }
          });
        }
      }
    },
    async getProcessTabsList() {
      let params = {
        pumpHouseId: this.waterPlantId, //传水厂id
        configCode: 'process_water_quality', //进水
        line: this.currentLine
      };
      let { resultData, status } = await getRealDataByConfigCodeAndPlace(params);
      if (status === 'complete') {
        if (resultData.length) {
          this.processList = resultData;
        } else {
          this.processList = [];
          this.flag = false;
        }
      }
    },
    handlerType(type) {
      this.currentLine = type;
      this.getProcessTabsList();
    }
  }
};
</script>

<style lang="less" scoped>
.content {
  width: calc(66.6% - 6px);
  overflow-y: auto;
  overflow-x: hidden;
  background: var(--supply-color-bg-card-DEFAULT);
  border-radius: 4px;
  &-header {
    width: 100%;
    padding: 15px 12px;
    display: inline-flex;
    justify-content: space-between;
    align-items: center;
    height: 40px;
  }
  &-title {
    font-weight: 600;
    font-size: 16px;
    line-height: 22px;
    color: var(--supply-color-main);
    letter-spacing: 0;
  }
  &-body {
    padding-bottom: 12px;
  }
  .form-item {
    margin-top: 10px;
    width: 80px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .ct-left {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .time-box {
      margin-right: 12px;
    }
  }
  .tabs {
    padding: 0 12px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    cursor: pointer;
    .tab {
      height: 24px;
      line-height: 24px;
      margin-right: 8px;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0 15px;
      background: #f4f6f8;
      color: #666666;
      border-radius: 12px;
      font-size: 14px;
    }
    .active {
      color: #5b8ff9;
      background: #5b8ff91a;
    }
  }
  .spin {
    height: calc(100% - 44px);
  }
  .chart-wrapper {
    height: 100%;
    padding: 0 0 10px;
  }
  .table-wrapper {
    padding: 0 12px;
    box-sizing: border-box;
    margin: 0;
  }
  .empty {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  /deep/ .wpg-select-selection--single {
    height: 32px;
  }
  /deep/ .wpg-spin-container {
    height: 100%;
  }
  /deep/ .wpg-select {
    width: 120px !important;
  }
}
</style>

<style lang="less" scoped>
.module-wrap {
  padding: 0 12px;
  box-sizing: border-box;
  .module {
    margin-bottom: 0px;
    &-header {
      padding: 8px 0;
      .module-title {
        font-weight: 600;
        font-size: 14px;
        color: var(--supply-text-main);
      }
      .module__collapse {
        color: var(--supply-color-primary-DEFAULT);
        font-weight: 400;
        font-size: 12px;
      }
    }
    .point {
      column-gap: 31px;
      &__item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
        .item__name {
          width: calc(100% - 150px);
          white-space: wrap;

          font-weight: 400;
          font-size: 14px;
          color: var(--supply-text-secondary);
        }
        .list {
          &__item {
            margin-right: 8px;
            &:nth-last-child(1) {
              margin-right: 0;
            }
          }
        }
        /deep/ .list__input {
          .wpg-input-number-handler-wrap {
            display: none;
          }
        }
      }
      .value {
        display: inline-block;
        padding: 0 15px;
        text-align: left;
        box-sizing: border-box;
        width: 90px;
        height: 28px;
        line-height: 28px;
        background: #f3f6f8;
        border: 1px solid #e9e8e8;
        color: var(--supply-color-secondary);
        border-radius: 4px;
      }
    }
  }
}
</style>
