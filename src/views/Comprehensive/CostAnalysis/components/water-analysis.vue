<!--  -->
<template>
  <div class="water-analysis-view">
    <div class="top wbgc-card" v-loading="loading">
      <div class="top-item">
        <p>
          累计进水
          <span v-if="resultData && resultData.inUnit">({{ resultData.inUnit }})</span>
          <span else>--</span>
        </p>
        <p>{{ resultData && resultData.inWater | changeData }}</p>
      </div>
      <div class="top-item">
        <p>
          累计出水
          <span v-if="resultData && resultData.outUnit">({{ resultData.outUnit }})</span>
        </p>
        <p>{{ resultData && resultData.outWater | changeData }}</p>
      </div>
      <div class="top-item">
        <p>
          总成本
          <span v-if="resultData && resultData.costUnit">({{ resultData.costUnit }})</span>
        </p>
        <p>{{ resultData && resultData.allCost | changeData }}</p>
      </div>
      <div class="top-item">
        <p>
          吨水成本
          <span v-if="resultData && resultData.waterCostUnit"
            >({{ resultData.waterCostUnit }})</span
          >
        </p>
        <p>{{ resultData && resultData.waterCost | changeData }}</p>
      </div>
    </div>
    <div class="content wbgc-card" v-loading="loading">
      <p class="decs wfc1">各项成本及环比：</p>
      <w-empty v-if="!empty" />
      <div v-else class="model">
        <div class="model-item" v-for="item in resultData.costList" :key="item.name">
          <div class="model-item-content">
            <w-tooltip>
              <template slot="title">
                {{ item.name }}
                <span v-if="item.unit">({{ item.unit }})</span>
              </template>
              <p class="title wfc2">
                {{ item.name }}
                <span v-if="item.unit">({{ item.unit }})</span>
              </p>
            </w-tooltip>
            <p class="number wfc1">{{ item.num | changeData }}</p>
            <div
              :class="['rate', item.type === 1 ? 'redRate' : item.type === 2 ? 'greenRate' : '']"
            >
              <img v-if="item.type" :src="item.type === 1 ? icUp : icDown" />
              <span class="rate-data wfc1">{{ item | symbolData }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WaterAnalysis',
  inject: ['waterPlantIdObj'],
  data() {
    return {
      loading: false,
      resultData: {},
      icUp: require('@/assets/icons/ic_up.png'),
      icDown: require('@/assets/icons/ic_down.png')
    };
  },
  watch: {
    waterPlantIdObj: {
      deep: true,
      handler() {
        this.getList();
      }
    }
  },
  computed: {
    empty() {
      if (this.resultData) {
        return Boolean(this.resultData.costList?.length);
      } else {
        return false;
      }
    }
  },
  filters: {
    symbolData(val) {
      if (val.monthRatio === null) return '--';
      else return val.monthRatio + '%';
    },
    changeData(val) {
      return val === null || val === undefined ? '--' : val;
    }
  },
  methods: {
    async getList() {
      this.loading = true;
      try {
        let { resultData } = await this.$http.post(
          '/costAnalysis/getAllCost',
          this.waterPlantIdObj
        );
        this.resultData = resultData;
      } catch (error) {
        console.log(error);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>
<style lang="less" scoped>
.water-analysis-view {
  width: 100%;
  height: 100%;
  p {
    margin-bottom: 0;
  }
  .top {
    width: 100%;
    height: 94px;
    padding: 20px 16px 24px;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
    box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.1);
    &-item {
      p:first-child {
        font-family: PingFangSC-Regular, sans-serif;
        font-weight: 400;
        font-size: 14px;
        letter-spacing: 0;
        line-height: 18px;
        margin-bottom: 15px;
      }
      p:nth-child(2) {
        font-family: PingFangSC-Regular, sans-serif;
        font-weight: 600;
        font-size: 22px;
        letter-spacing: 0;
        line-height: 18px;
      }
    }
  }
  .content {
    margin-top: 8px;
    padding: 16px;
    border-radius: 4px;
    width: 100%;
    height: calc(100% - 102px);
    min-height: 270px;
    box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.1);
    overflow: auto;
    &::-webkit-scrollbar {
      display: none;
    }

    .decs {
      font-family: PingFangSC-Regular, sans-serif;
      font-weight: 400;
      font-size: 14px;
      letter-spacing: 0;
      margin-bottom: 4px;
    }
    .model {
      display: flex;
      flex-wrap: wrap;
      &-item {
        flex: 1;
        min-width: 33%;
        padding-right: 6px;
        margin-top: 6px;
        &:nth-child(3n) {
          padding-right: 0;
        }
        &:last-child {
          padding-right: 0;
        }
        &-content {
          border-radius: 4px;
          padding: 16px 16px 12px;
          background: #f2f6fc;
          .title {
            width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-family: PingFangSC-Regular, sans-serif;
            font-weight: 400;
            font-size: 14px;
            letter-spacing: 0;
            line-height: 18px;
            margin-bottom: 8px;
          }
          .number {
            font-family: PingFangSC-Regular, sans-serif;
            font-weight: 600;
            font-size: 20px;
            letter-spacing: 0;
            line-height: 18px;
            margin-bottom: 10px;
          }
          .rate {
            display: flex;
            align-items: center;
            &-data {
              font-family: PingFangSC-Regular, sans-serif;
              font-size: 13px;
              letter-spacing: 0;
              line-height: 16px;
            }
            img {
              width: 14px;
              height: 14px;
              margin-right: 5px;
            }
          }
          .redRate {
            .wpgicon {
              color: #f64357;
              background: rgba(246, 67, 87, 0.12);
            }
            .rate-data {
              color: #f64357;
            }
          }
          .greenRate {
            .wpgicon {
              color: #20c997;
              background: rgba(32, 201, 151, 0.12);
            }
            .rate-data {
              color: #20c997;
            }
          }
        }
      }
    }
  }
}

html[data-wpg-theme='green'] {
  .water-analysis-view {
    .model-item-content {
      background: #ddf3f0;
    }
  }
}
html[data-wpg-theme='red'] {
  .water-analysis-view {
    .model-item-content {
      background: #fcf3f2;
    }
  }
}
html:not([data-wpg-theme='dark']) {
  .water-analysis-view {
    .top {
      box-shadow: 0 1px 6px -1px rgba(4, 12, 25, 0.08);
      &-item {
        p:first-child {
          color: #666;
        }
        p:nth-child(2) {
          color: #333;
        }
      }
    }
  }
}

html[data-wpg-theme='dark'] {
  .water-analysis-view {
    .top {
      box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.3);
      &-item {
        p:first-child {
          color: #adb5bd;
        }
        p:nth-child(2) {
          color: #fff;
        }
      }
    }
    .content {
      box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.3);
      .model-item-content {
        background: #181c24;
      }
    }
  }
}
</style>
