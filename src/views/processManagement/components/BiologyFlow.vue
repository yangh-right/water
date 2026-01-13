<!--
 * @Description:
 * @version:
 * @Author: fengtaotao
 * @Date: 2023-05-23 14:29:38
 * @LastEditors: wangyr
 * @LastEditTime: 2024-07-25 11:09:37
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
    <div v-if="buttonCodes['biologyPanel']" class="tank-card card1">
      <div class="header">作用</div>
      <div class="content">
        <div v-for="(item, i) in cardInfo1" :key="i" class="tank-txt">
          {{ item.label }}
        </div>
      </div>
      <div class="bottom"></div>
    </div>
    <div v-if="buttonCodes['biologyPanel']" class="tank-card card-normal card2">
      <div class="header">系统构成</div>
      <div class="content">
        <div v-for="(item, i) in cardInfo2" :key="i" class="tank-txt">
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
  name: 'BiologyFlow',
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
          label: '利用生物降解水体有机污染物并除磷脱氮。工艺：倒置A2/O（分点进水）总处理能力：'
        },
        {
          label: '1、平均日流量220000m³/d'
        },
        {
          label: '2、平均瞬时流量9166.7m³/h'
        },
        {
          label: '3、高峰瞬时流量12000m³/h'
        }
      ],
      cardInfo2: [
        {
          label: '缺氧区有6格（1~6格），每格有效容积为1500m³，一共9000m³；'
        },
        {
          label: '厌氧区有6格（7~12格），每格有效容积为1500m³，一共9000m³；'
        },
        {
          label: '好氧区有效容积为19218.5m³'
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
        type: 'biochemical_pool_n1'
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
    top: 20px;
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
    top: 20px;
    right: 0px;
    width: 272px;
    height: 306px;
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
