<template>
  <cockpit-card :cardTitle="cardTitle">
    <div class="content">
      <div v-for="item in pointsArr" :key="item.name" :style="item.bgStyle" class="point-field">
        <div class="pint-val">
          <span class="active">{{ item.realPv }}</span>
          <span class="real">/{{ !!item.simulatePv ? item.simulatePv : 0 }}</span>
        </div>
        <div class="label">{{ item.pointMemoAlias }}</div>
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
      isLoading: false,
      imgsList: [
        {
          imgUrl: require('@/assets/images/default/integrated/ck-psludge.png'),
          imgMemo: '排泥量'
        },
        {
          imgUrl: require('@/assets/images/default/integrated/ck-do.png'),
          imgMemo: 'DO'
        },
        {
          imgUrl: require('@/assets/images/default/integrated/ck-flow.png'),
          imgMemo: '外回流量'
        },
        {
          imgUrl: require('@/assets/images/default/integrated/ck-tyuan.png'),
          imgMemo: '碳源投加'
        }
      ]
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
        resultData.forEach(item => {
          let imgObj = this.imgsList.find(img => {
            return item.pointMemoAlias.indexOf(img.imgMemo) > -1;
          });
          item['bgStyle'] = {
            background: 'url(' + imgObj.imgUrl + ')' + 'no-repeat',
            backgroundSize: '100% 100%'
          };
        });
        this.pointsArr = resultData;
        console.log('pppp', this.pointsArr);
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
    height: 46px;
    padding-left: 70px;
    display: flex;
    justify-content: space-around;
    align-items: flex-start;
    flex-direction: column;
    background: var(--supply-color-bg-DEFAULT);
    margin-top: 8px;

    .label {
      font-family: AlibabaPuHuiTi_2_55_Regular, sans-serif;
      font-weight: 400;
      font-size: 14px;
      color: #f0f6ff;
      letter-spacing: 0;
    }
    .pint-val {
      display: flex;
      align-items: center;
      .active {
        font-family: MiSans-Bold, sans-serif;
        font-weight: 700;
        font-size: 16px;
        color: #f0f6ff;
        letter-spacing: 0;
      }
      .real {
        font-family: MiSans-Regular, sans-serif;
        font-weight: 400;
        font-size: 12px;
        color: #87b7ff;
        letter-spacing: 0;
      }
    }
  }
}
</style>
