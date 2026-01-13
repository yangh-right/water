<!--
 * @Description:
 * @version:
 * @Author: fengtaotao
 * @Date: 2023-05-23 14:29:38
 * @LastEditors: wangyr
 * @LastEditTime: 2024-07-02 18:07:27
-->
<template>
  <div class="content">
    <div class="content-header">
      <div class="content-title">工艺流程图</div>
      <div v-if="!!svgUrl" class="full-screen">
        <w-icon
          class="supply-mx-2 supply-cursor-pointer"
          :type="isFullScreen ? 'ic_resize_shrink' : 'ic_resize_enlarge'"
          @click="fullScreen"
        />
      </div>
      <div v-if="false" class="tabs">
        <w-radio-group v-model="currentParams" size="small" button-style="solid">
          <w-radio-button v-for="item in tabs" :key="item.coding" :value="item.coding">
            {{ item.name }}
          </w-radio-button>
        </w-radio-group>
      </div>
    </div>
    <w-spin :spinning="loading" class="spin">
      <iframe
        v-if="!!svgUrl"
        :src="svgUrl"
        ref="contentFrame"
        id="contentFrame"
        name="contentFrame"
        title="组态图"
        class="contentFrame"
      ></iframe>
      <w-empty v-else class="empty" description="暂未配置"></w-empty>
    </w-spin>
    <!-- 放大图 -->
    <w-modal
      :visible="isFullScreen"
      :footeeleteDevicer="null"
      :footer="null"
      width="1080px"
      @cancel="isFullScreen = false"
    >
      <iframe :src="svgUrl" width="1000" height="600" title="" class="svgFrame"></iframe>
    </w-modal>
  </div>
</template>
<script>
import { accessToken } from '@wpg/framework-vue';
import { getSvgListByCondition, getProcessSimulationPlaces } from '@/api/optimization';
export default {
  name: 'ProcessFlow',
  props: {
    waterPlantId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      currentParams: '',
      tabs: [],
      mode: 'top',
      swiperOptions: {
        slidesPerView: 6, //显示个数
        touchAngle: 10,
        autoplay: {
          delay: 3000,
          stopOnLastSlide: false,
          disableOnInteraction: false
        },
        navigation: {
          nextEl: '.swiper-button-next', // 下一张
          prevEl: '.swiper-button-prev' // 上一张
        }
      },
      loading: false,
      isFullScreen: false,
      svgUrl: ''
    };
  },
  components: {},
  watch: {
    waterPlantId() {
      this.getUrlMap();
      this.getSimulationPlaces();
    }
  },
  created() {},
  methods: {
    callback(val) {
      console.log(val);
    },
    async getSimulationPlaces() {
      this.tabs = [];
      let { resultData, status } = await getProcessSimulationPlaces(this.waterPlantId);
      if (status === 'complete') {
        if (Array.isArray(resultData) && resultData.length > 0) {
          this.currentParams = resultData[0].coding;
          this.$emit('handleParams', resultData[0]);
        }
        this.tabs = resultData;
      }
    },
    async getUrlMap() {
      this.loading = true;
      let { resultData, status } = await getSvgListByCondition({
        stationIds: [this.waterPlantId],
        type: 'biochemical_pool'
      });
      this.loading = false;
      if (status === 'complete' && resultData?.length > 0) {
        const token = accessToken.get();
        this.svgUrl = resultData[0]?.previewUrl + `&token=${token}&parent=${window.origin}`;
      } else {
        this.svgUrl = '';
      }
    },
    paramsChange(value) {
      let activeTab = this.tabs.find(item => item.coding === value);
      this.currentParams = activeTab.coding;
      this.$emit('handleParams', activeTab);
    },
    /* 全屏切换 */
    fullScreen() {
      this.isFullScreen = true;
    }
  }
};
</script>

<style lang="less" scoped>
.content {
  position: relative;
  width: 100%;
  background: var(--supply-color-bg-card-DEFAULT);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  .full-screen {
    position: absolute;
    right: 16px;
    top: 13px;
  }
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

  .tabs {
    width: calc(100% - 136px);
    margin: -1px 46px 0 0;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    flex-wrap: nowrap;
    flex-wrap: wrap;
    cursor: pointer;
    overflow: hidden;
    .tab {
      flex-shrink: 0;
      padding: 0 15px;
      background: #f4f6f8;
      color: #666666;
      border-radius: 12px;
      font-size: 14px;
      margin-bottom: 2px;
    }
    .active {
      color: #5b8ff9;
      background: #5b8ff91a;
    }
  }
  .select {
    position: absolute;
    right: 10px;
    top: 10px;
    width: 120px;
  }
  .spin {
    height: calc(100% - 64px);
    flex: 1 1 auto;

    /deep/.wpg-spin-container {
      height: 100%;
    }
    .contentFrame {
      width: 100%;
      height: 100%;
      padding: 6px;
      transform: scale(0.86);
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
