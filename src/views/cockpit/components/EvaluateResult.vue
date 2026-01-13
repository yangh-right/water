<template>
  <div class="card-box">
    <!-- 卡片标题 -->
    <div class="card-title">活性污泥评价结果</div>
    <!-- 内容区域 -->
    <div class="content">
      <!-- 评分区域 -->
      <div class="score-box">
        <div :class="[themeColor ? 'default-score' : 'dark-score', 'score-info']">
          <img class="circle-bg" src="@/assets/images/default/station_around.png" alt="" />
          <div class="score-val">
            <span class="score-num">{{ scoreNum }}</span>
            <span class="score-unit">分</span>
          </div>
          <div class="score-label">综合评分</div>
        </div>
      </div>
      <!-- 指标区域 -->
      <div class="ponit-box">
        <div class="point-tab" v-for="item in ponitsArr" :key="item.indicatorName">
          <div class="point-label">
            <w-tooltip placement="topLeft" style="cursor: pointer;">
              <template slot="title">
                {{ item.indicatorMemo }}
              </template>
              {{ item.indicatorName }}
            </w-tooltip>
          </div>
          <div class="point-value">
            {{ !!item.indicatorValue || item.indicatorValue == '0' ? item.indicatorValue : '--' }}
            {{ item.indicatorUnit }}
          </div>
        </div>
      </div>
    </div>
    <!-- 加载中 -->
    <w-spin :spinning="isLoading" class="chart-spin"></w-spin>
  </div>
</template>

<script>
import { sludgeHealthEvaluation } from '@/api/cockpit.js';
export default {
  name: 'EvaluateResult',
  components: {},
  props: {
    // 水厂ID
    factoryId: {
      type: String,
      required: true,
      default: ''
    }
  },
  data() {
    return {
      isLoading: false, // 加载状态
      scoreNum: '', // 综合评分
      ponitsArr: [] // 指标列表
    };
  },
  inject: ['state'],
  computed: {
    // 根据主题设置样式
    themeColor() {
      if (this.state.theme !== 'dark') {
        return true;
      } else {
        return false;
      }
    }
  },
  watch: {
    // 监听水厂ID变化
    factoryId: {
      handler(val) {
        this.initData(val);
      }
    }
  },
  methods: {
    // 初始化数据，获取活性污泥评价结果
    async initData(id) {
      this.isLoading = true;
      let params = {
        line: 0,
        waterPlantId: id
      };
      let { status, resultData } = await sludgeHealthEvaluation(params);
      this.isLoading = false;
      if (status === 'complete' && Array.isArray(resultData.dataList)) {
        this.ponitsArr = resultData.dataList;
        this.scoreNum = resultData.totalScore;
      } else {
        // 默认数据
        this.ponitsArr = [
          {
            chainRatio: null,
            controlValue: null,
            deviceId: '2023053034',
            deviceName: null,
            facilityNo: null,
            localName: null,
            placeId: null,
            pointMemoAlias: '5分钟污泥沉降比',
            pointName: 'SV5',
            pointNo: null,
            pointUnit: '%',
            realPv: '--',
            simulatePv: null,
            standard: null,
            structureName: null
          },
          {
            chainRatio: null,
            controlValue: null,
            deviceId: '2023053034',
            deviceName: null,
            facilityNo: null,
            localName: null,
            placeId: null,
            pointMemoAlias: '10分钟污泥沉降比',
            pointName: 'SV10',
            pointNo: null,
            pointUnit: '%',
            realPv: '--',
            simulatePv: null,
            standard: null,
            structureName: null
          },
          {
            chainRatio: null,
            controlValue: null,
            deviceId: '2023053034',
            deviceName: null,
            facilityNo: null,
            localName: null,
            placeId: null,
            pointMemoAlias: '30分钟污泥沉降比',
            pointName: 'SV30',
            pointNo: null,
            pointUnit: '%',
            realPv: '--',
            simulatePv: null,
            standard: null,
            structureName: null
          }
        ];
        this.scoreNum = '';
      }
    }
  },
  created() {},
  mounted() {}
};
</script>

<style lang="less" scoped>
.chart-spin {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 10;
  transform: translate(-50%, -50%);
}
.content {
  height: calc(100% - 34px);
  display: flex;
  justify-content: space-between;
  align-items: center;

  .score-box {
    position: relative;
    width: 50%;
    display: flex;
    justify-content: center;

    .score-info {
      width: 130px;
      height: 130px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      position: relative;
    }
    .circle-bg {
      width: 132px;
      height: 132px;
      position: absolute;
      top: -1px;
      left: -1px;
      animation: turnX 3s linear infinite;
    }

    @keyframes turnX {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }

    .default-score {
      background: url('~@/assets/images/default/station_score.png') no-repeat center center;
      background-size: 100% 100%;
    }
    .dark-score {
      background: url('~@/assets/images/dark/station_score.png') no-repeat center center;
      background-size: 100% 100%;
    }
    .score-val {
      .score-num {
        font-family: DS-Digital-BoldItalic, sans-serif;
        font-size: 28px;
        color: #ffffff;
        letter-spacing: 0;
      }
      .score-unit {
        font-family: PingFangSC-Medium, sans-serif;
        font-weight: 500;
        font-size: 12px;
        color: #ffffff94;
        letter-spacing: 0;
      }
    }
    .score-label {
      font-family: PingFangSC-Medium, sans-serif;
      font-weight: 500;
      font-size: 12px;
      color: #ffffff94;
      letter-spacing: 0;
    }
  }
  .ponit-box {
    width: 50%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .point-tab {
      height: 32px;
      padding: 0 9px;
      box-sizing: border-box;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--supply-color-bg-card-dark);
      margin-bottom: 8px;
      .point-label {
        color: var(--mft-5-cls);
      }
      .point-value {
        color: var(--supply-color-main);
      }
    }
  }
}
</style>
