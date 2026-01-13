<template>
  <cockpit-card :cardTitle="cardTitle">
    <div class="content">
      <div v-for="item in pointsArr" :key="item.name" class="point-field">
        <div class="label">{{ item.pointMemoAlias }}</div>
        <div class="pint-val">
          <span class="active">{{ item.realPv }}</span>
          <!-- <span class="real">{{ !!item.simulatePv ? item.simulatePv : 0 }}</span> -->
        </div>
      </div>
      <div v-if="pointsArr.length === 0" class="tips">
        <w-empty id="ssmal" style="margin:auto" size="small"></w-empty>
      </div>
      <w-spin :spinning="isLoading" class="chart-spin"></w-spin>
    </div>
  </cockpit-card>
</template>

<script>
import CockpitCard from './CockpitCard.vue';
import { runningParam } from '@/api/cockpit.js';
export default {
  name: 'RunParameter',
  components: {
    CockpitCard
  },
  props: {
    factoryId: {
      type: String,
      required: true,
      default: ''
    }
  },
  data() {
    return {
      cardTitle: '运行参数',
      pointsArr: [],
      isLoading: false
    };
  },
  computed: {},
  watch: {
    factoryId: {
      handler(val) {
        if (!!val) {
          this.initData(val);
        }
      }
    }
  },
  activated() {
    if (this.factoryId) {
      this.initData(this.factoryId);
    }
  },
  methods: {
    async initData(id) {
      this.pointsArr = [];
      this.isLoading = true;
      let { status, resultData } = await runningParam(id);
      if (status === 'complete' && Array.isArray(resultData) && resultData.length > 0) {
        try {
          resultData.forEach(item => {
            item['simulatePv'] =
              item['realPv'] > 10
                ? (item['realPv'] - 1).toFixed(2)
                : (item['realPv'] - 0.25).toFixed(2);
          });
        } catch (err) {
          console.log(err);
        }
        this.pointsArr = resultData;
      }
      this.isLoading = false;
    }
  },
  created() {},
  mounted() {}
};
</script>

<style lang="less" scoped>
.content {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-content: flex-start;
  flex-wrap: wrap;
  overflow-y: auto;
  position: relative;
  .chart-spin {
    position: absolute;
    left: 50%;
    top: 50%;
    z-index: 10;
    transform: translate(-50%, -50%);
  }
  .tips {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  .point-field {
    width: calc(50% - 4px);
    height: 44px;
    padding: 0 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--supply-color-bg-DEFAULT);
    margin-top: 8px;

    .label {
      font-family: PingFangSC-Regular, sans-serif;
      font-weight: 400;
      font-size: 12px;
      color: var(--supply-color-secondary);
      text-align: right;
    }
    .pint-val {
      display: flex;
      align-items: center;
      flex-direction: column;
      .active {
        color: var(--supply-color-primary-DEFAULT);
        font-size: 14px;
        font-weight: 500;
        letter-spacing: 0;
      }
      .line {
        display: inline-block;
        width: 2px;
        height: 14px;
        margin: 0 6px;
        background: var(--mic-4-cls);
      }
      .real {
        color: var(--mic-4-cls);
        font-size: 14px;
        font-weight: 500;
        letter-spacing: 0;
      }
    }
  }
}
</style>
