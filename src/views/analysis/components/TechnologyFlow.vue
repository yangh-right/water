<!--
 * @Author: wangyr
 * @Date: 2023-04-21 17:20:07
 * @LastEditors: wangyr
 * @LastEditTime: 2024-08-16 15:48:49
 * @Description:
-->
<template>
  <div class="content">
    <w-spin :spinning="loading" class="spin">
      <iframe v-if="!!svgUrl" :src="svgUrl" title="组态图" ref="contentFrame" id="contentFrame" name="contentFrame"
        class="contentFrame"></iframe>
      <w-empty v-else class="empty" description="暂未配置"></w-empty>
    </w-spin>
    <!-- 放大图 -->
    <w-modal :visible="isFullScreen" :footeeleteDevicer="null" :footer="null" width="1080px"
      @cancel="isFullScreen = false">
      <iframe :src="svgUrl" width="1000" height="600" title="组态图" class="svgFrame"></iframe>
    </w-modal>
  </div>
</template>
<script>
import { accessToken } from '@wpg/framework-vue';
import { getSvgListByCondition } from '@/api/optimization';
export default {
  name: 'TechnologyFlow',
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
  data() {
    return {
      loading: false,
      isFullScreen: false,
      svgUrl: ''
    };
  },
  components: {},
  watch: {
    waterPlantId: {
      handler(val) {
        if (val) {
          this.getUrlMap();
        }
      },
      immediate: true
    }
  },
  created() { },
  methods: {
    async getUrlMap() {
      this.loading = true;
      let { resultData, status } = await getSvgListByCondition({
        pageSize: 50,
        stationIds: [this.waterPlantId]
      });
      this.loading = false;
      if (status === 'complete') {
        const token = accessToken.get();
        resultData.forEach(item => {
          if (item.templateName === this.title) {
            const isLocal = window.location.hostname === 'localhost';
            if (isLocal) {
              this.svgUrl = 'https://zhjs.ykqjsw.com/' + item.previewUrl + `&token=${token}&parent=${window.origin}`;
            } else {
              this.svgUrl = item.previewUrl + `&token=${token}&parent=${window.origin}`;
            }
          }
        });
      }
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
  height: 100%;
  border-radius: 4px;

  .full-screen {
    position: absolute;
    right: 16px;
    top: 16px;
  }

  &-title {
    height: 40px;
    padding: 8px 12px;
    font-weight: 600;
    font-size: 16px;
    color: var(--supply-color-main);
    letter-spacing: 0;
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
      height: 100%;
      padding: 6px;
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
