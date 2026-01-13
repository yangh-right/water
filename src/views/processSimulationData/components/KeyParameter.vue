<template>
  <div class="content">
    <div class="content-header">
      <div class="content-title">{{ title }}</div>
    </div>
    <w-spin :spinning="loading" class="content-body">
      <div v-if="pointsList.length > 0" class="point-list">
        <div
          v-for="item in pointsList"
          :key="item.pointMemoAlias"
          @click="paramsChange(item)"
          class="carbon-list"
        >
          <span class="point-name"><i class="ico-circle"></i>{{ item.pointMemoAlias }}</span>
          <div class="point-box">
            <span class="value">{{ item.realPv || item.realPv == '0' ? item.realPv : '' }}</span>
            <span class="unit" :title="item.pointUnit">{{ item.pointUnit }}</span>
          </div>
        </div>
      </div>
      <w-empty v-else class="empty"></w-empty>
    </w-spin>
  </div>
</template>
<script>
import { isObject } from 'lodash-es';
import { keyParameter } from '@/api/optimization';
export default {
  name: 'KeyParameter',
  props: {
    title: {
      type: String,
      default: ''
    },
    waterPlantId: {
      type: String,
      default: ''
    },
    environment: {
      type: String,
      default: ''
    },
    moduleType: {
      type: String,
      default: ''
    },
    activeModule: {
      type: Object,
      default: () => {}
    }
  },

  data() {
    return {
      loading: false,
      spinning: false,
      pointName: '',
      dataList: [],
      pointsList: [],
      startParameter: []
    };
  },
  watch: {
    waterPlantId(val) {
      this.getPointList();
    }
  },
  methods: {
    async getPointList() {
      this.loading = true;
      let { resultData, status } = await keyParameter(this.waterPlantId);
      this.loading = false;
      if (status === 'complete') {
        if (isObject(resultData) && Object.keys(resultData).length > 0) {
          this.pointsList = [
            {
              pointMemoAlias: '总内回流',
              realPv: resultData?.internalRefluxTotal,
              pointUnit: 'm³/h'
            },
            {
              pointMemoAlias: '总外回流',
              realPv: resultData?.externalRefluxTotal,
              pointUnit: 'm³/h'
            },
            {
              pointMemoAlias: '总PAC流量',
              realPv: resultData?.pacTotal,
              pointUnit: 'm³/h'
            },
            // {
            //   pointMemoAlias: this.environment === '1' ? '好氧中段MLSS' : '好氧段MLSS',
            //   realPv:
            //     this.environment === '1'
            //       ? resultData?.goodOxygenMiddleSegmentMlss
            //       : resultData?.goodOxygenSegmentMlss,
            //   pointUnit: 'mg/L'
            // },
            {
              pointMemoAlias: '总碳源流量',
              realPv: resultData?.carbonSource,
              pointUnit: 'm³/h'
            },
            {
              pointMemoAlias: '瞬时流量',
              realPv: resultData?.waterVolume,
              pointUnit: 'm³/h'
            }
            // {
            //   pointMemoAlias: '好氧末端MLSS',
            //   realPv: resultData?.goodOxygenEndSegmentMlss || '',
            //   pointUnit: 'mg/L'
            // },
            // {
            //   pointMemoAlias: this.environment === '1' ? '好氧中段DO' : '好氧段DO',
            //   realPv:
            //     this.environment === '1'
            //       ? resultData?.goodOxygenMiddleSegmentDo
            //       : resultData?.goodOxygenSegmentDo,
            //   pointUnit: 'mg/L'
            // }
          ];
          if (this.environment === '1') {
            this.pointsList.splice(6, 0, {
              pointMemoAlias: '好氧末段DO',
              realPv: resultData?.goodOxygenEndSegmentDo,
              pointUnit: 'mg/L'
            });
          }
        } else {
          this.pointsList = [];
        }
      }
    }
  }
};
</script>

<style lang="less" scoped>
.content {
  width: calc(33.3% - 6px);
  height: 100%;
  margin-bottom: 12px;
  background-color: var(--supply-color-bg-card-component);
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
    color: var(--supply-color-main);
    letter-spacing: 0;
  }
  &-body {
    width: 100%;
    height: calc(100% - 40px);

    .point-list {
      width: 100%;
      height: 100%;
      padding: 0 12px;
      box-sizing: border-box;
      overflow: auto;
      display: flex;
      flex-flow: wrap;
    }
    .carbon-list {
      width: calc(50% - 6px);
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 30px;
      font-weight: 400;
      font-size: 14px;
      color: var(--supply-color-main);
      margin-bottom: 4px;
      cursor: pointer;
      .point-name {
        width: 240px;
        display: flex;
        align-items: center;

        .ico-circle {
          display: inline-block;
          width: 4px;
          height: 4px;
          background: var(--supply-color-online);
          border-radius: 50%;
          margin-right: 8px;
        }
      }
      .point-box {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .unit {
        margin-left: 6px;
        width: 45px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .value {
        display: flex;
        margin-left: 10px;
        padding: 0 15px;
        text-align: left;
        box-sizing: border-box;
        width: 88px;
        height: 28px;
        line-height: 28px;
        background: var(--supply-color-bg-card-dark);
        border: 1px solid var(--supply-color-border-DEFAULT);
        color: var(--supply-color-secondary);
        border-radius: 4px;
      }
      /deep/ .list__input {
        display: flex;
        justify-content: center;
        align-items: flex-start;
        width: 88px;
        height: 28px;
        line-height: 28px;
        padding: 0 4px;
        box-sizing: border-box;
        background: #f3f6f8;
        border: 1px solid #e9e8e8;
        color: var(--supply-color-secondary);
        .wpg-input-number-handler-up,
        .wpg-input-number-handler-down {
          visibility: hidden;
        }
        .wpg-input-number-input-wrap input {
          height: 28px;
        }
      }
    }
    .split {
      height: calc(100% - 10px);
    }

    .empty {
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
}
/deep/.wpg-spin-container {
  height: 100%;
}
</style>
