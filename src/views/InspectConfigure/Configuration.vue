<template>
  <div id="svgCon" class="svgContent">
    <div ref="svgContent" class="svg" v-html="svgContent"></div>
    <div
      v-show="show"
      id="showWaterPoint"
      class="show-water-point"
      @mouseover="show = true"
      :style="pointStyle"
    >
      <!-- <w-icon type="close" class="closeIcon" @click="show = false"></w-icon> -->
      <div id="showWaterPointContent">
        <div style="width: 100%; text-align: left" v-for="item in pointsList">
          <span>{{ item.pointName }}</span>
          <span style="color: #58d0d3; margin: 0 12px" @click="openPointHistoryModal(item)">
            {{ item.pointValue }}</span
          >
          <span>{{ item.pointUnit }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import 'svg.js';
import { getSiteSvgBySiteId, getSvgDataBySvgId } from '@/api/configuration';
import { QueryDsDeviceVideo } from '@/api/home';
import { getAlarmList } from '@/api/analysis';
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
    // 表示的是组态id
    svgId: {
      type: String,
      default: ''
    },
    pumpId: {
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
      show: false,
      loading: false,
      svgContent: '',
      svgElementsId: [],
      svgElementAttributeObj: {},
      svgElements: [],
      realTimeData: {},
      alarmSvgList: [],
      videoList: [],
      videoSvgList: [],
      moreAlarmList: [],
      pointStyle: '',
      pointCont: '',
      realData: [],
      refreshInterval: 10 * 1000,
      svgWidth: 0,
      svgHeight: 0,
      failureAlarmUrl: require('@/assets/images/default/pumpAlarm.png'),
      pointsList: []
    };
  },
  watch: {
    svgId: {
      handler: function(val) {
        if (val) {
          this.stopRefresh();
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
  },
  deactivated() {
    this.stopRefresh();
    document.querySelector('#svgCon')?.removeEventListener('click');
  },
  mounted() {
    document.querySelector('#svgCon')?.addEventListener('click', () => {
      this.show = false;
    });
    setTimeout(() => {
      let svgDom = document.getElementById('svgObjId');
      svgDom.setAttribute('width', '100%');
      svgDom.setAttribute('height', '100%');
    }, 1000);
  },
  activated() {
    this.dataViewtimer = setInterval(() => {
      this.getSvgData();
      this.getAlarmList();
    }, this.refreshInterval);
  },

  methods: {
    setSvgFit(svgOuterDom, svgDom) {
      let w = svgDom.getBoundingClientRect().width;
      let h = svgDom.getBoundingClientRect().height;
      let domWidth = svgOuterDom.offsetWidth;
      let domHeight = svgOuterDom.offsetHeight;
      if (domHeight / domWidth > h / w) {
        svgDom.setAttribute('width', domWidth);
        svgDom.setAttribute('height', '100%');
      } else if (domHeight / domWidth < h / w) {
        svgDom.setAttribute('width', '100%');
        svgDom.setAttribute('height', domHeight);
      }
    },

    setSvgZoom() {
      let svgOuterDom = this.$refs.svgContent;
      let svgDom = this.$refs.svgContent.children[0];
      svgDom.style.transform = 'scale(' + this.svgZoom + ')';
      if (this.svgZoom === 1) this.setSvgFit(svgOuterDom, svgDom);
      if (
        svgDom.getAttribute('width') * this.svgZoom > svgOuterDom.offsetWidth ||
        svgDom.getAttribute('height') * this.svgZoom > svgOuterDom.offsetHeight
      ) {
        svgOuterDom.style.justifyContent = 'flex-start';
        svgOuterDom.style.alignItems = 'flex-start';
        svgDom.style.transformOrigin = '0 0';
      } else {
        svgOuterDom.style.justifyContent = 'center';
        svgOuterDom.style.alignItems = 'center';
        svgDom.style.transformOrigin = 'center center';
      }
    },

    render(svgId) {
      this.svgContent = '';
      this.svgElementsId = [];
      this.loadSvgPointData(svgId);
    },

    async loadSvgPointData(svgId) {
      this.loading = true;
      this.globalLoading.show({ domId: 'svgCon' });
      let res = await getSiteSvgBySiteId({ id: svgId });
      this.globalLoading.hide({ domId: 'svgCon' });
      let { status, resultData } = res;
      if (status === 'complete') {
        this.$emit('setSvgData', resultData);
        this.svgContent = resultData.svgContent.replace(
          /HOST_PLACEHOLDER/g,
          serverConfig.IMG_BASE_URL
        );
        let svgElementId = JSON.parse(resultData.svgElementsId);
        this.svgElementsId = flatten(svgElementId);
        this.svgElementAttributeObj = JSON.parse(resultData.svgElementAttributeObj);
        this.svgWidth = resultData.svgWidth;
        this.svgHeight = resultData.svgHeight;

        this.svgDevicePoint = JSON.parse(res.resultData.svgDevicePoint);

        this.$nextTick(() => {
          this.autoRefresh();
          this.handleSvgEvent();
          this.$emit('resetZoom'); // 每次重新渲染svg内容时重置缩放比例
          this.setSvgZoom();
        });
      }
      this.loading = false;
    },

    async getSvgData() {
      let res = await getSvgDataBySvgId(this.svgId);

      let { status, resultData, errorMessage } = res;
      if (status === 'complete') {
        if (resultData.length > 0) {
          this.$emit('changeTime', resultData[0].time);
        }
        let realTimeData = {};
        resultData.forEach(item => {
          if (item.pointCode) {
            realTimeData[item.domId] = item;
          }
        });

        this.realTimeData = realTimeData;

        this.realData = resultData;
        this.handleSvgStatus();
      } else {
        this.$message.error(errorMessage || '网络异常');
      }
    },

    autoRefresh() {
      this.stopRefresh();
      this.getSvgData();
      this.getAlarmList();

      this.dataViewtimer = setInterval(() => {
        this.getSvgData();
        this.getAlarmList();
      }, this.refreshInterval);
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
      } else if (svgElementItem && item.svgElementType === 'img') {
        const svgHref = svgElementItem
          .getAttribute('xlink:href')
          .replace('HOST_PLACEHOLDER', serverConfig.IMG_BASE_URL);
        svgElementItem.setAttribute('href', svgHref);
        svgElementItem.setAttribute('xlink:href', svgHref);
        if (svgElementData && svgElementData.pointValue && svgElementData.pointValue >= maxValue) {
          if (svgElementAttribute?.codeElementObj?.maxImgUrl) {
            svgElementItem.setAttribute(
              'href',
              svgElementAttribute.codeElementObj.maxImgUrl.replace(
                'HOST_PLACEHOLDER',
                serverConfig.IMG_BASE_URL
              )
            );
            svgElementItem.setAttribute(
              'xlink:href',
              svgElementAttribute.codeElementObj.maxImgUrl.replace(
                'HOST_PLACEHOLDER',
                serverConfig.IMG_BASE_URL
              )
            );
          }
        } else {
          if (svgElementAttribute?.codeElementObj?.minImgUrl) {
            svgElementItem.setAttribute(
              'href',
              svgElementAttribute.codeElementObj.minImgUrl.replace(
                'HOST_PLACEHOLDER',
                serverConfig.IMG_BASE_URL
              )
            );
            svgElementAttribute.codeElementObj.minImgUrl.replace(
              'HOST_PLACEHOLDER',
              serverConfig.IMG_BASE_URL
            );
          }
        }
        // 将数据放到codeElementObj里
        svgElementAttribute.codeElementObj.pointValue = svgElementData?.pointValue || '--';
        svgElementAttribute.codeElementObj.pointUnit = svgElementData?.pointUnit || '--';
        const patt1 = /^No[0-9]PumpRun$/;
        if (svgElementData && patt1.test(svgElementData.pointCode)) {
          const name = svgElementData.pointCode.substring(0, 7) + 'FailureAlarm';
          this.realData.forEach(r => {
            if (r.pointCode === name && r.pointValue === '1.0') {
              svgElementItem.setAttribute('href', this.failureAlarmUrl);
              svgElementItem.setAttribute('xlink:href', this.failureAlarmUrl);
            }
          });
        }
        if (svgElementAttribute?.codeElementObj?.dealType === '2') {
          this.changeHeight(item.svgElementId, svgElementData);
        }
      } else if (svgElementItem && item.svgElementType === 'baseMap') {
        const svgHref = svgElementItem
          .getAttribute('xlink:href')
          .replace('HOST_PLACEHOLDER', serverConfig.IMG_BASE_URL);
        svgElementItem.setAttribute('href', svgHref);
        svgElementItem.setAttribute('xlink:href', svgHref);
      } else if (item.svgElementType === 'point') {
        let element = document.getElementById(item.svgElementId);
        if (element?.childNodes.length > 0) {
          const react = SVG.get(element.childNodes[0].id);
          const value = SVG.get(element.childNodes[3].id);
          const unit = SVG.get(element.childNodes[4].id);
          svgElementAttribute.value = svgElementData?.pointValue || '--';
          svgElementAttribute.codeElementObj.pointValue = svgElementData?.pointValue || '--';
          svgElementAttribute.codeElementObj.pointUnit = svgElementData?.pointUnit || '--';
          const pv =
            svgElementData?.pointValue || typeof svgElementData?.pointValue === 'number'
              ? svgElementData.pointValue
              : '--';
          const max =
            svgElementData?.maxValue || typeof svgElementData?.maxValue === 'number'
              ? svgElementData.maxValue
              : undefined;
          const min =
            svgElementData?.minValue || typeof svgElementData?.minValue === 'number'
              ? svgElementData.minValue
              : undefined;
          value.text(pv);
          if (pv !== '--' && (Number(pv) > Number(max) || Number(pv) < Number(min))) {
            value.attr('fill', '#ff0000');
            value
              .animate(650, '<', 500)
              .attr('fill', '#7E0505')
              .loop(true, true);
          } else {
            value.attr('fill', '#58D0D3');
          }
          unit.text(svgElementData && svgElementData.pointUnit ? svgElementData.pointUnit : '');
          const nameLength =
            (svgElementData?.pointName && Math.min(svgElementData.pointName.length, 6) * 20 + 10) ||
            100;
          const valueLength = pv.length * 16 || 80;
          const unitLength = svgElementData?.pointUnit ? svgElementData.pointUnit.length * 16 : 48;
          value.attr({ x: react.attr('x') + nameLength });
          unit.attr({ x: react.attr('x') + nameLength + valueLength });
          let width = nameLength + valueLength + unitLength + 10;
          if (svgElementAttribute.isControl === '1') {
            const control = SVG.get(element.childNodes[1].id);
            control.attr('x', react.attr('x') + width);
            width += 36;
          }
          react.attr('width', width);
        }
      }
    },

    // 修改元素高度
    changeHeight(id, data) {
      const img = SVG.get(id);
      const leve = SVG.get(id + 'Level');
      const h = img.attr('height');
      const pv = data.pointValue && data.pointValue !== '--' ? Number(data.pointValue) : 0;
      const levelH = h * 0.8 * (pv / 3 > 1 ? 1 : pv / 3);
      leve.attr({
        height: levelH,
        y: img.attr('y') + h * 0.9 - levelH
      });
    },

    handleSvgEvent() {
      let stepsInfo = [];
      const self = this;
      this.svgElementsId.forEach((v, index) => {
        if (v && v.svgElementId && v.svgElementType) {
          let domId = v.svgElementId;
          let type = v.svgElementType;
          let element = document.getElementById(domId);
          let svgElementAttribute = this.svgElementAttributeObj[domId];

          if (this.svgDevicePoint.length > 0) {
            this.svgDevicePoint.forEach(item => {
              if (item.domId === domId && item.videoCode) {
                svgElementAttribute.videoCode = item.videoCode;
                svgElementAttribute.videoType = item.videoType;
              } else if (item.domId === domId) {
                svgElementAttribute.deviceId = item.deviceId;
              }
            });
          }

          if (element && type === 'com') {
            element.classList.add('element-click');
            const svg = SVG.get(domId);
            stepsInfo.push({ svg, svgElementAttribute, domId });
            element.addEventListener('click', () => {
              this.$emit('element:click', svg, svgElementAttribute, type);
            });
          }
          if (type === 'img' && svgElementAttribute?.codeElementObj?.dealType === '2') {
            const img = SVG.get(domId);
            const h = img.attr('height');
            const w = img.attr('width');
            const draw = SVG.get('svgObjId');
            const levelH = 0;
            draw
              .rect(w * 0.07, levelH)
              .attr({
                id: domId + 'Level',
                x: img.attr('x') + w * 0.4,
                y: img.attr('y') + h * 0.9 - levelH
              })
              .fill('#58D0D3');
          }
          if (type === 'img') {
            if (svgElementAttribute.imgControl === '1') {
              const control = element;
              control.addEventListener('click', () => {
                this.$emit('element:click', element, svgElementAttribute, 'imgControl');
              });
            }
          }

          if (
            svgElementAttribute &&
            (CALLBACK_EVENTS.CLICK === svgElementAttribute.callBackEvent ||
              (svgElementAttribute.callEventTypeValue === 'video' &&
                CALLBACK_EVENTS.HOVER === svgElementAttribute.callBackEvent))
          ) {
            if (svgElementAttribute.callEventTypeValue === 'alarm') {
              this.alarmSvgList.push(svgElementAttribute);
              if (element) {
                element.classList.add('dis-none');
              }
            }
            if (svgElementAttribute.callEventTypeValue === 'video') {
              this.videoSvgList.push(svgElementAttribute);
              if (element) {
                element.classList.add('dis-none');
              }
            }
            if (element) {
              element.classList.add('element-click');
            }
            if (
              svgElementAttribute.callEventTypeValue === 'point' &&
              element?.childNodes.length > 0
            ) {
              const control = document.getElementById(element.childNodes[1].id);
              const rect = document.getElementById(element.childNodes[0].id);
              const name = document.getElementById(element.childNodes[2].id);
              const value = document.getElementById(element.childNodes[3].id);
              const unit = document.getElementById(element.childNodes[4].id);
              control.addEventListener('click', () => {
                this.$emit('element:click', element, svgElementAttribute, 'control');
              });
              rect.addEventListener('click', () => {
                this.$emit('element:click', element, svgElementAttribute, 'point');
              });
              name.addEventListener('click', () => {
                this.$emit('element:click', element, svgElementAttribute, 'point');
              });
              value.addEventListener('click', () => {
                this.$emit('element:click', element, svgElementAttribute, 'point');
              });
              unit.addEventListener('click', () => {
                this.$emit('element:click', element, svgElementAttribute, 'point');
              });
            } else if (element) {
              // 元素是图片且没有绑定点击打开视频事件时，这里不增加其单击事件
              if (
                svgElementAttribute.svgElementType === 'img' &&
                svgElementAttribute.callEventTypeValue !== 'video'
              )
                return;
              // 视频若绑定悬浮事件则不处理
              if (CALLBACK_EVENTS.CLICK === svgElementAttribute.callBackEvent) {
                element.addEventListener('click', () => {
                  this.$emit('element:click', element, svgElementAttribute, type);
                });
              }
              // 元素是图片且绑定点击打开视频事件时，让鼠标悬停的时候展示视频名称--把视频名称当成设备监测量一样来显示
              if (
                svgElementAttribute.svgElementType === 'img' &&
                svgElementAttribute.callEventTypeValue === 'video'
              ) {
                element.addEventListener('mouseover', e => {
                  this.pointsList = [
                    {
                      pointName: '',
                      pointValue: svgElementAttribute.videoName,
                      pointUnit: ''
                    }
                  ];
                  self.pointStyle = `left:${e.clientX + 10}px;top:${e.clientY - 20}px`;
                  self.show = true;
                });
                element.addEventListener('mouseout', () => {
                  this.show = false;
                });
              }
            }
          }

          if (
            svgElementAttribute &&
            CALLBACK_EVENTS.HOVER === svgElementAttribute.callBackEvent &&
            svgElementAttribute.callEventTypeValue !== 'video'
          ) {
            if (element) {
              element.classList.add('element-click');
              element.addEventListener('mouseover', e => {
                if (this.show) return;
                const hoverList = svgElementAttribute.hoverCodeList;
                if (hoverList.length > 0) {
                  let str = '';
                  this.pointsList = [];
                  hoverList.forEach(p => {
                    if (svgElementAttribute.deviceId) {
                      p.deviceId = svgElementAttribute.deviceId;
                      const serviceId = p.deviceId + '\\' + p.codeId;
                      // eslint-disable-next-line max-nested-callbacks
                      self.realData.forEach(r => {
                        if (r.serviceId === serviceId && r.pointName) {
                          this.pointsList.splice(0, 0, r);
                          // str += `<div style="width:100%;text-align: left;">
                          //     <span>${r.pointName || '--'}</span>
                          //     <span style="color: #58d0d3;margin: 0 12px;">${r.pointValue}</span>
                          //     <span> ${r.pointUnit || '--'}</span>
                          //   </div>`;
                        }
                      });
                    }
                  });
                  if (this.pointsList.length == 0) {
                    return;
                  }
                  // self.pointStyle = `left:${(svgElementAttribute.axisX / self.svgWidth) *
                  //   100}%;top:${e.clientY + 15}px`;
                  self.pointStyle = `left:${e.clientX - 80}px;top:${e.clientY + 15}px`;

                  self.pointCont = str;
                  self.show = true;
                }
              });
              element.addEventListener('mouseout', () => {
                this.show = false;
              });
            }
          }
        }
      });
      this.getVideoList();
      this.$emit('allSteps', stepsInfo);
    },

    _arrObgSearch(arr, key, val) {
      let rus = true;
      arr.forEach(v => {
        if (v[key] === val) {
          rus = false;
        }
      });
      return rus;
    },
    openPointHistoryModal(r) {
      let deviceId = r.serviceId.split('\\')[0];
      let codeId = r.serviceId.split('\\')[1];
      let relationPoint = r.pointName;
      const attr = {
        codeElementObj: { relationPoint, codeId },
        deviceId,
        callEventTypeValue: 'point'
      };
      this.$emit('element:click', '', attr, 'point');
      // this.$emit('openPointHistoryModal', r);
    },
    async getAlarmList() {
      const params = {
        pageFlag: false,
        status: 1,
        stationIds: [this.pumpId]
      };
      const { resultData } = await getAlarmList(params);
      this.moreAlarmList = [];
      if (resultData) {
        (resultData.records || []).forEach(item => {
          let flag = false;
          this.alarmSvgList.forEach(svg => {
            if (item.deviceId === svg.deviceId && item.pointCode === svg.codeElementObj.codeId) {
              flag = true;
              svg.alarmId = item.alarmHandlerDataId;
              const element = document.getElementById(svg.domId);
              if (element) {
                element.classList.remove('dis-none');
              }
            }
          });
          if (!flag) {
            this.moreAlarmList.push(item);
          }
        });
      }
      this.$emit('showAlarm', this.moreAlarmList);
    },

    getVideoList() {
      // 通过污水厂id查找视频
      const params = {
        pageFlag: false,
        dsAreaStationDeviceQueries: [
          {
            stationId: [this.pumpId]
          }
        ]
      };
      QueryDsDeviceVideo(params).then(res => {
        const { resultData } = res;
        (resultData || []).forEach(item => {
          this.videoSvgList.forEach(svg => {
            if (item.videoId === svg.videoCode) {
              const element = document.getElementById(svg.domId);
              if (element) {
                element.classList.remove('dis-none');
              }
            }
          });
        });
      });
    }
  }
};
</script>

<style lang="less" scoped>
.show-water-point {
  position: fixed;
  left: 0px;
  top: 0px;
  min-width: 140px;
  padding: 8px 30px;
  z-index: 999;
  background-image: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.39) 23%,
    rgba(0, 0, 0, 0.4) 73%,
    rgba(0, 0, 0, 0) 92%
  );
  font-family: PingFangSC-Regular, sans-serif;
  font-size: 12px;
  color: #fff;
  line-height: 24px;
  ul {
    width: 100%;
  }
  .closeIcon {
    position: absolute;
    right: 4px;
    top: 4px;
  }
}

.svgContent {
  width: 100%;
  height: 100%;
  overflow: hidden;
  text-align: center;
  .svg {
    width: 100%;
    height: 100%;
  }
}

/deep/ .element-click {
  cursor: pointer;
}
/deep/ .dis-none {
  display: none;
}
</style>
<style lang="less">
.supply-runing {
  stroke-dasharray: 30 5;
  stroke-dashoffset: 1000;
  animation: supply-run 10s linear infinite;
}

@keyframes supply-run {
  to {
    stroke-dashoffset: 0;
  }
}
</style>
