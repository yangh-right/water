<!--
 * @Description:
 * @version:
 * @Author: fengtaotao
 * @Date: 2023-05-23 14:29:38
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-09-07 09:29:31
-->
<template>
  <div class="content">
    <div class="content-header">
      <div class="content-title">{{ title }}</div>
    </div>
    <div class="points-list">
      <div v-for="item in interPointsList" :key="item.pointMemo" class="point-item">
        <div class="title">
          <img :src="item.imgUrl" :alt="item.pointMemo" />{{ item.pointMemo }}
        </div>
        <div class="val">{{ item.pointValue }} {{ item.pointUnit }}</div>
      </div>
    </div>
    <div class="content-header">
      <div class="content-title">出水水质</div>
    </div>
    <div class="points-list">
      <div v-for="item in pointsList" :key="item.pointMemo" class="point-item">
        <div class="title">
          <img :src="item.imgUrl" :alt="item.pointMemo" />{{ item.pointMemo }}
        </div>
        <div class="val">{{ item.pointValue }} {{ item.pointUnit }}</div>
      </div>
    </div>
  </div>
</template>
<script>
import codImg from '@/assets/images/default/point-cod.png';
import nh3Img from '@/assets/images/default/point-nh3-n.png';
import phImg from '@/assets/images/default/point-ph.png';
import ssImg from '@/assets/images/default/point-ss.png';
import tnImg from '@/assets/images/default/point-tn.png';
import tpImg from '@/assets/images/default/point-tp.png';
import { getRealDataByConfigCodeAndPlace } from '@/api/optimization';
export default {
  name: 'RunStrategy',
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
  components: {},
  data() {
    return {
      flag: true,
      loading: false,
      imgsUrl: {
        jsc_COD: codImg,
        jsc_ad: nh3Img,
        jsc_TN: tnImg,
        jsc_TP: tpImg,
        jsc_SS: ssImg,
        jsc_PH: phImg
      },
      pointsList: [],
      interPointsList: []
    };
  },
  watch: {
    waterPlantId: {
      immediate: true,
      handler(val) {
        if (val) {
          this.getInterTabsList();
          this.getTabsList();
        }
      }
    }
  },
  created() {},
  methods: {
    async getInterTabsList() {
      let params = {
        pumpHouseId: this.waterPlantId, //传水厂id
        configCode: 'inlet_water_quality', //进水
        line: null
      };
      let { resultData, status } = await getRealDataByConfigCodeAndPlace(params);
      if (status === 'complete') {
        if (resultData.length) {
          resultData.forEach(item => {
            item['imgUrl'] = this.imgsUrl[item.pointName];
          });
          this.interPointsList = resultData;
        } else {
          this.interPointsList = [];
          this.flag = false;
        }
      }
    },
    async getTabsList() {
      let params = {
        pumpHouseId: this.waterPlantId, //传水厂id
        configCode: 'outlet_water_quality', //出水
        line: null
      };
      let { resultData, status } = await getRealDataByConfigCodeAndPlace(params);
      if (status === 'complete') {
        if (resultData.length) {
          resultData.forEach(item => {
            item['imgUrl'] = this.imgsUrl[item.pointName];
          });
          this.pointsList = resultData;
        } else {
          this.pointsList = [];
          this.flag = false;
        }
      }
    }
  }
};
</script>

<style lang="less" scoped>
.content {
  width: calc(33.3% - 6px);
  overflow: auto;
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
  .ct-left {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .time-box {
      margin-right: 12px;
    }
  }
  .points-list {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    padding: 8px 12px 0 12px;
    box-sizing: border-box;
    .point-item {
      width: calc(33.3% - 8px);
      height: 60px;
      background: var(--supply-color-table-interval);
      padding: 6px 8px 0 8px;
      box-sizing: border-box;
      margin-bottom: 12px;
      display: flex;
      flex-direction: column;

      .title {
        font-size: 14px;
        font-weight: 500;
        color: var(--supply-color-deviate);
        margin-bottom: 4px;
        display: flex;
        align-items: center;

        img {
          display: inline-block;
          width: 18px;
          height: 18px;
          margin-right: 4px;
          margin-top: -2px;
        }
      }
      .val {
        font-family: DINAlternate-Bold, sans-serif;
        font-weight: 600;
        font-size: 14px;
        color: var(--mft-2-hv-cls);
        letter-spacing: 0;
      }
    }
  }
  .process-list {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    padding: 6px 12px;
    box-sizing: border-box;

    .process-item {
      width: 100%;
      margin-bottom: 4px;
      .label {
        font-family: PingFangSC-Regular, sans-serif;
        font-weight: 400;
        font-size: 14px;
        color: var(--supply-color-secondary);
        letter-spacing: 0;
        margin-bottom: 4px;
      }
      .point-box {
        display: flex;
        align-items: center;
        justify-content: space-between;
        .value {
          display: flex;
          padding: 0 15px;
          text-align: left;
          box-sizing: border-box;
          width: 125px;
          height: 28px;
          line-height: 28px;
          background: #f3f6f8;
          border: 1px solid #e9e8e8;
          color: var(--supply-color-secondary);
          border-radius: 4px;
        }
        .unit {
          margin-left: 10px;
          width: 72px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }

  /deep/ .wpg-select-selection--single {
    height: 32px;
  }
  /deep/ .wpg-spin-container {
    height: 100%;
  }
}
</style>
