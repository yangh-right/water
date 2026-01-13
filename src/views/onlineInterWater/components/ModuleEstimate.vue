<!--
 * @Description:
 * @version:
 * @Author: fengtaotao
 * @Date: 2023-05-23 14:29:38
 * @LastEditors: wangyr
 * @LastEditTime: 2024-09-27 14:21:57
-->
<template>
  <div class="content">
    <div class="content-header">
      <div class="content-title">
        {{ title
        }}<w-tooltip placement="topLeft" class="supply-ml-1" style="cursor: pointer;">
          <template slot="title">
            纳什系数（Nash-Sutcliffe efficiency coefficient）的取值范围为负无穷至 1，其值越接近 1
            表示模型预测精度越高，0 表示模型预测结果仅与观测值的平均值持平，小于 0
            则表明模型不可信。
          </template>
          <img src="@/assets/cockpit/ic_help.png" alt="" style="width: 16px;" />
        </w-tooltip>
      </div>
    </div>
    <w-spin :spinning="loading" class="spin">
      <div v-if="pointsArr.length > 0" class="card-wrapper">
        <div v-for="item in pointsArr" :key="item.pointMemo" class="card-item">
          <div class="title">
            <div class="point"></div>
            <span>
              {{ item.pointMemo }}
            </span>
          </div>
          <div class="card-content">
            <div class="point-box">
              <div class="point-name">
                <w-tooltip placement="topLeft" class="supply-ml-1" style="cursor: pointer;">
                  <template slot="title">
                    纳什效率系数（NSE） = 1 -
                    [（预测值与实际值之差的平方和）/（预测值与实际值平均值之差的平方和）]
                  </template>
                  纳什系数<img src="@/assets/cockpit/ic_help.png" alt="" style="width: 16px;" />
                </w-tooltip>
              </div>
              <w-tooltip placement="topLeft">
                <template v-if="item.nSE.length > 6" slot="title">
                  {{ item.nSE }}
                </template>
                <div class="point-val">
                  {{ item.nSE.length > 6 ? item.nSE.slice(0, 6) + '...' : item.nSE }}
                </div>
              </w-tooltip>
            </div>
            <div class="point-box">
              <div class="point-name">精度要求</div>
              <div class="point-val">>{{ item.accuracy }}</div>
            </div>
          </div>
        </div>
      </div>
      <w-empty v-else class="empty"></w-empty>
    </w-spin>
  </div>
</template>
<script>
import { getModelAccuracyEvaluation, outWaterModelAccuracyEvaluation } from '@/api/optimization';
export default {
  name: 'ModuleEstimate',
  props: {
    title: {
      type: String,
      default: ''
    },
    waterPlantId: {
      type: String,
      default: ''
    },
    tabVal: {
      type: Number,
      default: 0
    }
  },
  components: {},
  data() {
    return {
      loading: false,
      currentParams: '',
      pointsArr: []
    };
  },
  watch: {
    waterPlantId() {
      this.getModelEvaluation();
    },
    tabVal: {
      handler(val) {
        this.getModelEvaluation();
      }
    }
  },
  created() {},
  methods: {
    async getModelEvaluation() {
      this.loading = true;
      let method = this.tabVal === 1 ? getModelAccuracyEvaluation : outWaterModelAccuracyEvaluation;
      let { resultData, status } = await method(this.waterPlantId);
      this.loading = false;
      if (status === 'complete') {
        this.pointsArr = resultData;
      } else {
        this.pointsArr = [];
      }
    }
  }
};
</script>

<style lang="less" scoped>
.content {
  width: calc(50% - 6px);
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
    color: var(--supply-color-main);
    letter-spacing: 0;
  }
  .spin {
    height: calc(100% - 42px);
  }
  .card-wrapper {
    height: 100%;
    padding: 0 12px 10px 12px;
    box-sizing: border-box;
    display: flex;
    justify-content: flex-start;
    flex-flow: row wrap;
    align-content: flex-start;
    overflow: auto;
    .card-item {
      width: calc(33% - 8px);
      height: 105px;
      background: var(--supply-color-bg-DEFAULT);
      padding: 8px 12px;
      box-sizing: border-box;
      margin: 0 12px 12px 0;
      &:nth-child(3n) {
        margin-right: 0px;
      }
      .title {
        font-family: PingFangSC-Regular, sans-serif;
        font-weight: 400;
        font-size: 18px;
        color: var(--mft-5-cls);
      }
      .card-content {
        display: flex;
        justify-content: space-between;
        margin-top: 12px;

        .point-box {
          .point-name {
            font-family: PingFangSC-Regular, sans-serif;
            font-weight: 400;
            font-size: 14px;
            color: var(--supply-color-third);
          }
          .point-val {
            font-family: DINAlternate-Bold, sans-serif;
            font-weight: 700;
            font-size: 14px;
            color: var(--supply-color-main);
          }
        }
      }
    }
  }
  .empty {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  /deep/ .wpg-spin-container {
    height: 100%;
  }
}
</style>
