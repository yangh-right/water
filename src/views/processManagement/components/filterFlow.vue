<!--
 * @Description:
 * @version:
 * @Author: fengtaotao
 * @Date: 2023-05-23 14:29:38
 * @LastEditors: wangyr
 * @LastEditTime: 2024-07-25 11:10:52
-->
<template>
  <div class="content">
    <w-spin :spinning="loading" class="spin">
      <iframe
        v-if="!!svgSmallUrl"
        :src="svgSmallUrl"
        title="组态"
        ref="contentFrame"
        id="contentFrame"
        name="contentFrame"
        class="contentFrame"
      ></iframe>
      <w-empty v-else class="empty" description="暂未配置"></w-empty>
    </w-spin>
    <div v-if="buttonCodes['filterPanel']" class="tank-card card1">
      <div class="header">设计规模</div>
      <div class="content">
        <div v-for="(item, i) in cardInfo1" :key="i" class="tank-txt">
          {{ item.label }}
        </div>
      </div>
      <div class="bottom"></div>
    </div>
    <div v-if="buttonCodes['filterPanel']" class="tank-card card-normal card2">
      <div class="header">系统构成</div>
      <div class="content">
        <div v-for="(item, i) in cardInfo2" :key="i" class="tank-txt">
          {{ item.label }}
        </div>
      </div>
      <div class="bottom"></div>
    </div>
    <div v-if="buttonCodes['filterPanel']" class="tank-card card-normal card3">
      <div class="header">作用</div>
      <div class="content">
        <div v-for="(item, i) in cardInfo3" :key="i" class="tank-txt">
          {{ item.label }}
        </div>
      </div>
      <div class="bottom"></div>
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import { accessToken } from '@wpg/framework-vue';
import { getSvgListByCondition } from '@/api/optimization';
export default {
  name: 'filterFlow',
  props: {
    waterPlantId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loading: false,
      svgSmallUrl: '',
      cardInfo1: [
        {
          label:
            '深度处理组合池由1座提升泵池、2个微絮凝池、16格V型滤池、1座反冲洗废水池、1座反冲洗设备间组成。'
        },
        {
          label: '设计处理能力为22×104m³/d，变化系数1.3。'
        }
      ],
      cardInfo3: [
        {
          label: '利用滤池池底出水孔表面铺满的沙粒，在水渗透过表面沙粒的作用下去除杂质。'
        },
        {
          label:
            '目的是去除废水中细小的悬浮物质，特别是去除生化处理以及混凝沉淀不能去除的一些细小悬浮颗粒及胶体物质。'
        }
      ],
      cardInfo2: [
        {
          label: '共16格滤池，单池过滤面积105㎡'
        },
        {
          label: '反冲洗废水池，有效容积1000m³'
        },
        {
          label: '反冲洗罗茨鼓风机4台'
        },
        {
          label: '反冲洗水泵3台'
        },
        {
          label: '空压系统2套'
        }
      ]
    };
  },
  components: {},
  computed: {
    ...mapState('setting', ['buttonCodes'])
  },
  watch: {
    waterPlantId: {
      immediate: true,
      handler(val) {
        if (val) {
          this.getUrlMap();
        }
      }
    }
  },
  created() {},
  methods: {
    async getUrlMap() {
      this.loading = true;
      let { resultData, status } = await getSvgListByCondition({
        stationIds: [this.waterPlantId],
        type: 'filter_tank'
      });
      this.loading = false;
      if (status === 'complete' && resultData?.length > 0) {
        const token = accessToken.get();
        this.svgSmallUrl = resultData[0]?.previewUrl + `&token=${token}&parent=${window.origin}`;
      } else {
        this.svgSmallUrl = '';
      }
    }
  }
};
</script>

<style lang="less" scoped>
.content {
  position: relative;
  width: 100%;
  height: 100%;
  background: var(--supply-color-bg-card-DEFAULT);
  border-radius: 4px;

  .tank-card {
    .header {
      font-family: AlibabaPuHuiTi_2_85, sans-serif;
      font-weight: 700;
      font-size: 18px;
      color: #b1ffff;
      letter-spacing: 0;
      display: flex;
      align-items: center;
      padding: 0 0 0 29px;
    }
    .content {
      padding: 6px 19px 0 19px;
      box-sizing: border-box;

      .tank-txt {
        position: relative;
        padding: 0 0 0 16px;
        font-family: AlibabaPuHuiTi_2_55, sans-serif;
        font-weight: 400;
        font-size: 14px;
        color: #d8f7ff;
        letter-spacing: 0;
        margin-bottom: 18px;
        &::before {
          content: '';
          width: 14px;
          height: 11px;
          background: url('~@/assets/images/default/device/mg-p.png') no-repeat;
          background-size: 100% 100%;
          position: absolute;
          left: 0;
          top: 3px;
        }
      }
    }
  }

  .card1 {
    position: absolute;
    top: 10px;
    left: 0px;
    width: 442px;
    height: 306px;
    transform: scale(0.8);
    .header {
      height: 53px;
      background: url('~@/assets/images/default/device/mg-hg.png') no-repeat;
      background-size: 100% 100%;
    }
    .content {
      height: calc(100% - 86px);
      background: url('~@/assets/images/default/device/mg-cg.png') no-repeat;
      background-size: 100% 100%;
    }
    .bottom {
      height: 33px;
      background: url('~@/assets/images/default/device/mg-bg.png') no-repeat;
      background-size: 100% 100%;
    }
  }
  .card2 {
    position: absolute;
    top: 10px;
    right: 0px;
    width: 272px;
    height: 306px;
    transform: scale(0.8);
  }
  .card3 {
    position: absolute;
    bottom: 10px;
    left: 0px;
    width: 272px;
    height: 406px;
    transform: scale(0.8);
  }
  .card-normal {
    .header {
      height: 54px;
      background: url('~@/assets/images/default/device/mg-hm.png') no-repeat;
      background-size: 100% 100%;
    }
    .content {
      height: calc(100% - 98px);
      background: url('~@/assets/images/default/device/mg-cm.png') no-repeat;
      background-size: 100% 100%;
    }
    .bottom {
      height: 40px;
      background: url('~@/assets/images/default/device/mg-bm.png') no-repeat;
      background-size: 100% 100%;
    }
  }

  .full-screen {
    position: absolute;
    right: 16px;
    top: 16px;
  }
  .select {
    position: absolute;
    right: 10px;
    top: 10px;
    width: 120px;
  }
  .spin {
    height: 100%;
    /deep/.wpg-spin-container {
      height: 100%;
    }
    .contentFrame {
      width: 100%;
      height: calc(100% - 12px);
      padding: 0 12px;
      margin: 10px 0;
      box-sizing: border-box;
    }
    .empty {
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
}
</style>
