<!--
 * @Description:
 * @version:
 * @Author: fengtaotao
 * @Date: 2023-05-23 14:29:38
 * @LastEditors: fengtaotao
 * @LastEditTime: 2023-05-30 13:45:19
-->
<template>
  <div class="content">
    <iframe
      :src="svgUrl"
      ref="contentFrame"
      title="组态图"
      id="contentFrame"
      name="contentFrame"
      class="contentFrame"
    ></iframe>
  </div>
</template>
<script>
import { getSvgListByCondition } from '@/api/optimization';
export default {
  name: 'TechnologicalProcess',
  data() {
    return {
      svgUrl: ''
    };
  },
  created() {
    this.getUrlMap();
  },
  methods: {
    async getUrlMap() {
      let { resultData, status } = await getSvgListByCondition({ pageSize: 50 });
      if (status === 'complete') {
        resultData.forEach(item => {
          if (item.templateName === '净水工艺流程') {
            this.svgUrl = item.previewUrl;
          }
        });
      }
    }
  }
};
</script>

<style lang="less" scoped>
.content {
  width: 100%;
  height: 100%;
  background: #fff;
  .contentFrame {
    width: 100%;
    height: 100%;
  }
}
</style>
