<!--
 * @Description: 能耗配置弹框
 * @Author: zhangtianwen
 * @LastEditTime: 2022-10-08 16:30:21
-->
<template>
  <div
    id="svgBox"
    class="svgBox"
    :style="{ zoom: svgZoomValue }"
  ></div>
</template>

<script>
import 'svg.js';
import serverConfig from '@/config/server.config';

export default {
  name: 'ConfigurationPreviewDialog',
  props: {
    svgInfo: {
      type: Object,
      default: () => ({})
    },
    svgZoomValue: {
      type: Number,
      default: 0.2
    }
  },
  data() {
    return {
      visible: false,
      svgObj: {
        svgName: '', // svg 的名称
        id: '', // svg 唯一标示
        svgWidth: this.width,
        svgHeight: this.height
      }
    };
  },
  mounted() {
    this.loadConfiguration();
  },
  methods: {
    loadConfiguration() {
      this.svgDevicePoint = JSON.parse(this.svgInfo.svgDevicePoint);
      this.svgInfo.svgContent = this.svgInfo.svgContent.replace(
        /HOST_PLACEHOLDER/g,
        serverConfig.IMG_BASE_URL
      );
      this.svgInfo.svgElementAttributeObj = this.svgInfo.svgElementAttributeObj.replace(
        /HOST_PLACEHOLDER/g,
        serverConfig.IMG_BASE_URL
      );
      this.dealSvgInfo(); // 对svg数据进行处理；
      document.getElementById('svgObjId').removeAttribute('xmlns:svgjs');
      document.getElementById('svgObjId').removeAttribute('xmlns');
      this.svgDraw = SVG('svgObjId'); // 初始化svg；
      this.upDateSvgDom(); // 按照层级更新元素
    },
    /**
     * 处理初始化 svg 信息
     */
    dealSvgInfo() {
      let self = this;
      this.svgObj.id = this.svgInfo.id;
      this.svgObj.svgName = this.svgInfo.svgName;
      this.svgObj.svgCode = this.svgInfo.svgCode;
      this.svgObj.keyData = this.svgInfo.keyData;
      this.svgObj.svgSort = this.svgInfo.sort;
      this.svgObj.svgHeight = this.svgInfo.svgHeight;
      this.svgObj.svgWidth = this.svgInfo.svgWidth;
      this.svgIcon = JSON.parse(this.svgInfo.svgIcon);
      this.svgElementDomList = JSON.parse(this.svgInfo.svgElementsId);
      this.svgElementAttributeObj = JSON.parse(this.svgInfo.svgElementAttributeObj);
      this.svgDevicePoint.forEach(item => {
        if (this.svgElementAttributeObj[item.domId]) {
          if (item.videoCode) {
            this.svgElementAttributeObj[item.domId].videoCode = item.videoCode;
            this.svgElementAttributeObj[item.domId].videoType = item.videoType;
            this.svgElementAttributeObj[item.domId].videoName = item.videoName;
          } else {
            this.svgElementAttributeObj[item.domId].textOptionsList[2] = item.deviceId;
            this.svgElementAttributeObj[item.domId].deviceId = item.deviceId;
          }
        }
      });
      document.getElementById('svgBox').innerHTML = this.svgInfo.svgContent;

      /* 获取svg 底图 */
      if (SVG.get('svgBgImg')) {
        let baseMap = SVG.get('svgBgImg');
        let svgBgImgPre = baseMap.attr('xlink:href');
        if (svgBgImgPre) {
          this.$emit('update:background', svgBgImgPre);
        }
      }
    },

    /**
     * 更新svgDOM
     */
    upDateSvgDom() {
      let self = this;
      self.svgElementDomList.forEach((val, index) => {
        if (val) {
          val.forEach((v, i) => {
            if (SVG.get(v.svgElementId)) {
              self.svgDraw.node.appendChild(SVG.get(v.svgElementId).node); // 按照层级重新排列元素
            }
          });
        }
      });
    }
  }
};
</script>

<style scoped lang="less">


</style>
