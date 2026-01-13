<!--
 * @Description:
 * @version:
 * @Author: fengtaotao
 * @Date: 2023-05-23 14:29:38
 * @LastEditors: wangyr
 * @LastEditTime: 2024-04-15 11:01:52
-->
<template>
  <div :class="bgClass" class="content">
    <w-spin :spinning="loading" class="spin">
      <iframe
        v-if="!!svgSmallUrl"
        :src="svgSmallUrl"
        ref="contentFrame"
        title=""
        id="contentFrame"
        name="contentFrame"
        class="contentFrame"
      ></iframe>
      <w-empty v-else class="empty" description="暂未配置"></w-empty>
    </w-spin>
  </div>
</template>
<script>
import { accessToken } from '@wpg/framework-vue';
import { getSvgListByCondition } from '@/api/optimization';
export default {
  name: 'OverviewFlow',
  props: {
    waterPlantId: {
      type: String,
      default: ''
    },
    svgType: {
      type: String,
      default: ''
    }
  },
  inject: ['state'],
  data() {
    return {
      loading: false,
      svgSmallUrl: ''
    };
  },
  components: {},
  computed: {
    bgClass() {
      if (this.svgSmallUrl) {
        let className;
        if (this.state.theme === 'dark') {
          className = 'dark-bg';
        } else if (this.state.theme === 'green') {
          className = 'green-bg';
        } else {
          className = 'default-bg';
        }
        return className;
      } else {
        return '';
      }
    }
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
        type: this.svgType
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

  .drill-box {
    position: absolute;
    right: 10px;
    top: 10px;
    z-index: 1;
    display: flex;
    flex-direction: column;

    /deep/.wpg-btn {
      margin-bottom: 5px;
    }
  }

  &.dark-bg {
    background: url('~@/assets/images/dark/conf_bg1.png');
    background-size: 100% 100%;
  }
  &.green-bg {
    background: url('~@/assets/images/green/conf_bg1.png');
    background-size: 100% 100%;
  }
  &.default-bg {
    background: url('~@/assets/images/default/conf_bg1.png');
    background-size: 100% 100%;
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
