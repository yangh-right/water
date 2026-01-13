<template>
  <div ref="svgContent" class="svgContent" v-html="svgContent"></div>
</template>

<script>
import { getSiteSvgBySiteId, getSvgDataBySvgId } from '@/api';
import serverConfig from '@/config/server.config';

const CALLBACK_EVENTS = {
  HOVER: '2',
  CLICK: '3'
};

// 多维数组扁平化----> 类似flat
function flatten(arr) {
  return arr.reduce((pre, cur) => {
    return pre.concat(Array.isArray(cur) ? flatten(cur) : cur);
  }, []);
}

export default {
  name: 'Configuration',

  props: {
    deviceId: {
      type: String,
      default: ''
    },
    svgZoom: {
      type: Number,
      default: 1.0
    }
  },

  data() {
    return {
      loading: false,
      svgContent: '',
      svgElementsId: [],
      svgElementAttributeObj: {},
      svgElements: [],
      realTimeData: {}
    };
  },

  watch: {
    deviceId: {
      handler: function(val) {
        if (val) {
          this.stopRefresh();
          this.unbindEvt();
          this.render(val);
        }
      },
      immediate: true
    },
    svgZoom(newValue) {
      this.setSvgZoom();
    }
  },

  beforeDestroy() {
    this.stopRefresh();
    this.unbindEvt();
  },

  methods: {
    setSvgFit(svgOuterDom, svgDom) {
        let w = svgDom.getBoundingClientRect().width, h = svgDom.getBoundingClientRect().height;
        let domWidth = svgOuterDom.offsetWidth; let domHeight = svgOuterDom.offsetHeight;
        if ((domHeight / domWidth) > (h / w)) {
            svgDom.setAttribute('width', domWidth);
            svgDom.setAttribute('height', '100%');
        } else if ((domHeight / domWidth) < (h / w)) {
            svgDom.setAttribute('width', '100%');
            svgDom.setAttribute('height', domHeight);
        }
    },
    setSvgZoom() {
      let svgOuterDom = this.$refs.svgContent; let svgDom = this.$refs.svgContent.children[0];
      svgDom.style.transform = 'scale(' + this.svgZoom + ')';
      if (this.svgZoom === 1) this.setSvgFit(svgOuterDom, svgDom);
      if (svgDom.getAttribute('width') * this.svgZoom > svgOuterDom.offsetWidth || svgDom.getAttribute('height') * this.svgZoom > svgOuterDom.offsetHeight) {
        svgOuterDom.style.justifyContent = 'flex-start';
        svgOuterDom.style.alignItems = 'flex-start';
        svgDom.style.transformOrigin = '0 0';
      } else {
        svgOuterDom.style.justifyContent = 'center';
        svgOuterDom.style.alignItems = 'center';
        svgDom.style.transformOrigin = 'center center';
      }
    },
    render(deviceId) {
      this.svgContent = '';
      this.svgElementsId = [];
      this.loadSvgPointData(deviceId);
    },

    async loadSvgPointData(deviceId) {
      this.loading = true;
      let res = await getSiteSvgBySiteId({ id: deviceId });
      let { status, resultData, errorMessage } = res;

      if (status === 'complete') {
        this.svgContent = resultData.svgContent.replace(/HOST_PLACEHOLDER/g, serverConfig.IMG_BASE_URL);
        let svgElementId = JSON.parse(resultData.svgElementsId);
        this.svgElementsId = flatten(svgElementId);
        this.svgElementAttributeObj = JSON.parse(resultData.svgElementAttributeObj);

        this.$nextTick(() => {
          this.autoRefresh();
          this.handleSvgEvent();
          this.$emit('resetZoom');  // 每次重新渲染svg内容时重置缩放比例
          this.setSvgZoom();
        });
      } else {
        this.$message.error(errorMessage || '网络异常');
      }
      this.loading = false;
    },

    async getSvgData() {
      let res = await getSvgDataBySvgId(this.deviceId);

      let { status, resultData, errorMessage } = res;
      if (status === 'complete') {
        let realTimeData = {};

        resultData.forEach((item) => {
          if (item.pointCode) {
            realTimeData[item.domId] = item;
          }

          if (this.svgElementAttributeObj[item.domId]) {
            this.svgElementAttributeObj[item.domId].serviceId = item.serviceId;
          }
        });

        this.realTimeData = realTimeData;
        this.handleSvgStatus();
      } else {
        this.$message.error(errorMessage || '网络异常');
      }
    },

    autoRefresh() {
      this.stopRefresh();
      this.getSvgData();

      this.dataViewtimer = setInterval(() => {
        this.getSvgData();
      }, 10 * 1000);
    },

    stopRefresh() {
      clearInterval(this.dataViewtimer);
    },

    // 处理svg数据以及状态图
    handleSvgStatus() {
      if (!this.svgElementsId.length) return;

      for (let item of this.svgElementsId) {
        if (item) {
          this.handleSvgElement(item);
        }
      }
    },
    getSvgElementIdList() {
      return this.svgElementsId
    },
    handleSvgElement(item) {
      let svgElementAttribute = this.svgElementAttributeObj[item.svgElementId];
      let svgElementData = this.realTimeData[item.svgElementId];
      let svgElementItem = document.getElementById(item.svgElementId);
      let maxValue = svgElementAttribute?.codeElementObj?.maxValue;
      let minValue = svgElementAttribute?.codeElementObj?.minValue;

      if (item.svgElementType === 'text') {
        if (svgElementItem && svgElementData && svgElementData.pointValue) {
          svgElementItem.children[0].innerHTML = svgElementData.pointValue;
        }
      } else if (item.svgElementType === 'img') {
        const svgHref = svgElementItem
          .getAttribute('xlink:href')
          .replace('HOST_PLACEHOLDER', serverConfig.IMG_BASE_URL);
        svgElementItem.setAttribute('href', svgHref);
        svgElementItem.setAttribute('xlink:href', svgHref);
        if (svgElementData && svgElementData.pointValue && svgElementData.pointValue >= maxValue) {
          if (svgElementAttribute?.codeElementObj?.maxImgUrl) {
            svgElementItem.setAttribute(
              'href',
              svgElementAttribute.codeElementObj.maxImgUrl.replace('HOST_PLACEHOLDER', serverConfig.IMG_BASE_URL)
            );
            svgElementItem.setAttribute(
              'xlink:href',
              svgElementAttribute.codeElementObj.maxImgUrl.replace('HOST_PLACEHOLDER', serverConfig.IMG_BASE_URL)
            );
          }
        } else {
          if (svgElementAttribute?.codeElementObj?.minImgUrl) {
            svgElementItem.setAttribute(
              'href',
              svgElementAttribute.codeElementObj.minImgUrl.replace('HOST_PLACEHOLDER', serverConfig.IMG_BASE_URL)
            );
            svgElementItem.setAttribute(
              'xlink:href',
              svgElementAttribute.codeElementObj.minImgUrl.replace('HOST_PLACEHOLDER', serverConfig.IMG_BASE_URL)
            );
          }
        }
      } else if (item.svgElementType === 'baseMap') {
        const svgHref = svgElementItem
          .getAttribute('xlink:href')
          .replace('HOST_PLACEHOLDER', serverConfig.IMG_BASE_URL);
        svgElementItem.setAttribute('href', svgHref);
        svgElementItem.setAttribute('xlink:href', svgHref);
      }
    },

    handleSvgEvent() {
      this.svgElementsId.forEach((v, index) => {
        if (v && v.svgElementId && v.svgElementType) {
          let domId = v.svgElementId;
          let type = v.svgElementType;
          let element = document.getElementById(domId);
          let svgElementAttribute = this.svgElementAttributeObj[domId];

          if (svgElementAttribute && CALLBACK_EVENTS.CLICK === svgElementAttribute.callBackEvent) {
            element.classList.add('element-click');
            element.addEventListener('click', () => {
              this.$emit('element:click', element, svgElementAttribute, type);
            });
          }
        }
      });
    },

    /**
     * 解除元素绑定事件
     */
    unbindEvt() {
      /* 绑定或者解除元素事件 */
      // this.svgElements.map((v, i) => {
      //   let clickElement = SVG.get(v.domId);
      //   clickElement.off('click');
      // });
    }
  }
};
</script>

<style lang="less" scoped>
.configuration-box {
  width: 100%;
  height: 100%;
}

.svgContent {
  width: 100%;
  height: 100%;
  overflow: auto;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

/deep/ .element-click {
  cursor: pointer;
}
</style>
