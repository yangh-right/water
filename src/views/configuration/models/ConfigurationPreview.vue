<template>
  <div
    :id="svgBoxOutId"
    ref="svgBox"
    :class="[
      !svgElementId || svgElementId === svgBgImgId || svgElementId === 'grid'
        ? 'svgbox-out'
        : 'svgbox-out-hide'
    ]"
  >
    <div
      :id="svgBoxId"
      class="svgBox"
      :style="{ zoom: svgZoomValue, cursor: this.isMultiple ? 'crosshair' : 'default' }"
      @mousedown="selectElement"
      @mouseup="stopSelect"
    ></div>

    <w-modal
      v-model="svgElementSiteStatus"
      class="dialog-element element secondary-modal"
      :mask="false"
      :footer="null"
      centered
      :title="svgElementName"
      :getContainer="getContainer"
    >
      <ConfigurationElementForm
        ref="configForm"
        :waterPlantId="waterPlantId"
        :objectTypeList="objectTypeList"
        :disabled="svgElementAttributeNew.componentId && !isComponentEdit"
        :type="svgElementType"
        :element="svgElementAttributeNew"
        :imageElements="imageElements"
        :callBackEventValue="callBackEventValue"
        :callBackEvent="callBackEvent"
        :callBackEventType="callEventType"
        :textOption.sync="textOption"
        :stateOrNumberStaus="stateOrNumberStaus"
        :realDeviceData="realDeviceData"
        :videoList="textOption.videoList"
        @updateSvgElementAttributeNew="setSvgElementAttributeNew"
        @updataEventValue="updataEventValue"
        @updataEventType="updataEventType"
        @chooseValueImg="chooseValueImg"
        @choosePoint="choosePoint"
        @deleteRelationPoint="deleteRelationPoint"
        @getPointList="getPointList"
      />
    </w-modal>
    <w-modal
      v-model="svgComponentFromVisible"
      class="dialog-element element secondary-modal"
      :mask="false"
      centered
      :footer="null"
      title="组件配置"
      :getContainer="getContainer"
    >
      <svgComponentFrom
        @action="svgComponentFromVisible = false"
        ref="componentForm"
        :value="componentFrom"
        :isEdit="true"
        :element="svgElementAttributeNew"
      />
    </w-modal>
    <w-modal
      v-model="isShowImages"
      class="dialog-element img secondary-modal"
      style="z-index: 22"
      :mask="false"
      :footer="null"
      centered
      title="图片选择"
      :getContainer="getContainer"
    >
      <span class="svg-element-img" style="max-height: 228px; overflow: auto">
        <!-- 图片上传 -->
        <div class="image-add" @click="showImageElement">
          <w-icon type="cloud-upload" class="add-icon" />
        </div>
        <!-- 图片历史列表 -->
        <div v-for="(item, index) in imageElements" :key="index" class="images-list">
          <img
            :src="item.src"
            :alt="item.src"
            style="width: 100%; height: 100%; object-fit: contain;"
          />
          <!-- 浮层操作 -->
          <div v-show="!item.status" class="imges-ctl">
            <w-icon
              style="color: #fff"
              type="delete"
              @click="delectBaseMapOrIconMsg(item.id, 'elementImg')"
            />
            <div class="imges-ctl-v-s">
              <w-icon
                type="check-circle"
                theme="filled"
                :style="{ fontSize: '16px', color: '#fff' }"
                @click="chooseImgElementThis(item.src, item.type)"
              />
            </div>
          </div>
        </div>
      </span>
    </w-modal>

    <!-- 点表数据查询界面 -->
    <w-modal
      class="secondary-modal"
      v-model="pointVisible"
      :title="title"
      centered
      width="650px"
      :maskClosable="false"
      :footer="null"
    >
      <ConfigurationPointTable
        v-if="pointVisible"
        :waterPlantId="waterPlantId"
        :realCode="realCode"
        :element.sync="svgElementAttributeNew"
        :optionsDevice="textOption.optionsDevice"
        :deviceId="svgElementAttributeNew.deviceId"
        :optionsDeviceValue="textOption.optionsDeviceValue"
        @cancle="pointVisible = false"
        @getResult="getPoint"
      ></ConfigurationPointTable>
    </w-modal>

    <!-- 另存为 -->
    <w-modal
      class="secondary-modal"
      v-model="saveToOther"
      title="组态另存"
      centered
      width="450px"
      :confirm-loading="confirmSaveLoading"
      @ok="saveSvgToOtherName"
      @cancel="saveToOther = false"
    >
      <span>
        <w-row class="bar">
          <div class="demo-input-suffix">
            <span class="label-dia">组态名称：</span>
            <w-input
              v-model="saveToOtherName"
              placeholder="请输入内容"
              size="small"
              style="width: 70%; height: 32px; line-height: 32px"
            >
            </w-input>
          </div>
        </w-row>
      </span>
    </w-modal>

    <ConfigurationUpload
      :showImg="showImgElement"
      tipMassages="可上传jpg、png、gif类型的图片 大小不超过2M"
      :WHVerification="false"
      :isTailoring="false"
      @getResult="addImgElements"
      @cancelResult="hideImageElement"
    >
    </ConfigurationUpload>
  </div>
</template>

<script>
import 'svg.js';
import 'svg.draggable.js';
import 'svg.resize.js';
import 'svg.select.js';
import 'svg.draw.js';
import SvgComponentFrom from './SvgComponentFrom.vue';
import Bus from '../Bus.js';
import cloneDeep from 'lodash/cloneDeep';
import { lineReact } from './tools';
import {
  SvgStyleConfig,
  getElementTypeOptions,
  addPointNum,
  flatten,
  DEVLIST,
  VIDEOLIST
} from './data';
import {
  getEUUrlList,
  addEUSvgSrc,
  updateSvgSrc,
  getDevicePhSvgById,
  getSiteSvgBySiteId,
  addDevicePhSvg,
  updateDevicePhSvg,
  getDeviceList,
  getSvgModuleDetail
} from '@/api/configuration';
import { reRenderComponent } from './configurationMixin';
import { sysDictListByCode } from '@/api/manage';
import { QueryDsDeviceVideo } from '@/api/home';
import serverConfig from '@/config/server.config';
import ConfigurationElementForm from './ConfigurationElementForm';
import ConfigurationPointTable from './ConfigurationPointTable';
import ConfigurationUpload from './ConfigurationUpload';
import { mapState, mapMutations } from 'vuex';

export default {
  name: 'ConfigurationPreview',
  mixins: [reRenderComponent],
  inject: ['getPointOptions', 'isComponentEdit'],
  components: {
    ConfigurationElementForm,
    ConfigurationPointTable,
    ConfigurationUpload,
    SvgComponentFrom
  },

  props: {
    configurationId: {
      type: String,
      default: ''
    },
    waterPlantId: {
      type: String,
      default: ''
    },
    svgId: {
      type: String,
      default: 'svgObjId'
    },
    svgBoxOutId: {
      type: String,
      default: 'svgBoxOut'
    },
    svgBoxId: {
      type: String,
      default: 'svgBox'
    },
    svgBgImgId: {
      type: String,
      default: 'svgBgImg'
    },
    svgZoomValue: {
      type: String,
      default: '1'
    },
    isMultiple: {
      // 是否SVG元素框选状态
      type: Boolean,
      default: false
    },

    width: {
      type: Number,
      default: 1860
    },
    height: {
      type: Number,
      default: 870
    },
    showGrid: {
      type: Boolean,
      default: false
    },
    background: {
      type: String,
      default: ''
    },
    pathChangeTip: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      svgComponentFromVisible: false,
      componentFrom: {},
      svgElementId: '',
      svgInfo: null,
      svgObj: {
        svgName: '', // svg 的名称
        id: '', // svg 唯一标示
        svgWidth: this.width,
        svgHeight: this.height
      },
      svgElements: [], // svg 元素 id
      showImgElement: false, // 显示隐藏图片元素上传弹窗

      isShowImages: false, // 显示隐藏图片元素
      pointVisible: false, // 显示隐藏点表查询弹窗
      multiple: false,
      saveToOther: false, // 显示隐藏组态另存为弹
      saveToOtherName: '', // 另存为名称
      confirmSaveLoading: false,
      objectTypeList: [], //元素类别
      /* svg 实例化对象 */
      svgDraw: '', // svg实例绑定Dom后的对象
      svgElementNameT: {
        text: '文本设置',
        rect: '矩形设置',
        img: '图片设置',
        line: '线条设置',
        circle: '圆圈设置',
        triangle: '三角设置',
        com: '巡检步骤详情',
        point: '监测量设置',
        alarm: '报警设置'
      },

      /* svg 元素属性设置模版 */
      svgElementAttributeTemplate: {
        value: '默认文字', // 展示文字
        axisX: 10, // x轴位置
        axisY: 10, // y轴位置
        fill: '#333', // 填充颜色
        stroke: '#ccc', // 线条填充颜色
        strokeWith: 2, // 线条宽度
        fontSize: 14, // 字体大小
        deviceOrWaterpump: '', // 关联设备或者水泵
        codeElementObj: {
          codeId: '', // 关联监测量id
          relationPoint: '', // 关联监测量名称
          maxValue: 'null', //  关联监测量最大值
          maxImgUrl: '', // 关联监测量大于最大值展示图片
          minValue: 'null', // 关联监测量最小值
          minImgUrl: '', // 关联监测量小于最小值展示图片
          pointUnit: '', // 监测量单位
          dealType: '' // 处理类型
        },
        deviceId: '', // 关联的设备： ''没有关联 1一号设备 2二号设备 。。。。。。
        showType: 1, // 展示方式  0、不展示   1 、一直展示   2、鼠标放上展示   3、鼠标点击展示
        domId: '', // 绑定的domID
        svgElementType: '', // svg 元素的类型
        textOptionsList: ['', '0', ''], // 文本设置 【文本类型、关联对象、关联设备】
        callBackEvent: '1', // 回调事件 1无 2 hover 3 click
        hoverCodeNum: 3, // 悬浮关联的监测量数量
        hoverCodeList: [{ relationPoint: '' }, { relationPoint: '' }, { relationPoint: '' }], // 悬浮关联的数组
        hoverCodeIndex: '', // 用于悬浮绑定监测量回掉
        inspName: '',
        pointStatusList: [],
        controlPoints: [],
        infoPoints: [],
        inspDev: '',
        devInfo: '',
        configType: '',
        inspectionItem: [],
        alarmName: '报警名称',
        inspTime: '',
        videoCode: '', // 视频Code
        videoOriginCode: '',
        isControl: '0',
        imgControl: '0',
        animate: '0'
      },
      /* svg 当前元素属性设置 */
      svgElementAttributeNew: {
        codeElementObj: {
          codeId: '', // 关联监测量id
          relationPoint: '', // 关联监测量名称
          maxValue: 'null', //  关联监测量最大值
          maxImgUrl: '', // 关联监测量大于最大值展示图片
          minValue: 'null', // 关联监测量最小值
          minImgUrl: '', // 关联监测量小于最小值展示图片
          pointUnit: '', // 监测量单位
          dealType: '' // 处理类型
        },
        hoverCodeList: [{ relationPoint: '' }, { relationPoint: '' }, { relationPoint: '' }], // 悬浮关联的数组
        hoverCodeIndex: '', // 用于悬浮绑定监测量回掉
        inspName: '',
        inspDev: '',
        devInfo: '',
        configType: '',
        controlPoints: [],
        infoPoints: [],
        pointStatusList: [],
        inspectionItem: [],
        alarmName: '报警名称',
        inspTime: '',
        videoCode: '', // 视频Code
        videoOriginCode: '',
        isControl: '0',
        imgControl: '0',
        animate: '0'
      },
      /* svg 元素属性存储 */
      svgElementAttributeObj: {},

      /* svg 元素 id 分层存储 */
      svgElementDomList: [],

      svgElementType: '', // svg 当前选择元素的类型

      /* svg 图片元素domId  存储 */
      svgIcon: [],

      textOption: {
        /* svg 文本设置 select 文本类型 */
        options: [
          {
            value: '1',
            label: '文字'
          },
          {
            value: '2',
            label: '监测量值'
          },
          {
            value: '3',
            label: '设备名称'
          }
        ],
        optionsValue: '',

        /* svg select 关联设备or水泵 */
        options2: [
          {
            value: '0',
            label: '无'
          },
          {
            value: '1',
            label: '设备'
          }
        ],
        options2Value: '0',
        /* svg 关联设备 */
        optionsDevice: DEVLIST,
        optionsDeviceValue: '',
        videoList: VIDEOLIST
      },

      /* svg 元素设置 绑定事件 */
      callBackEvent: [
        {
          value: '1',
          label: '无'
        },
        {
          value: '2',
          label: '开启鼠标悬浮事件'
        },
        {
          value: '3',
          label: '开启鼠标点击事件'
        }
      ],
      callBackEventValue: '1',
      callEventType: '',
      // 编辑元素弹窗
      svgElementSiteStatus: false,
      svgElementName: '',

      /* 元素图片列表 */
      imageElements: [{ url: '', id: '' }],

      hoverCodeListObjTp: {
        relationPoint: '' // 关联监测量名称
      },

      stateOrNumberStaus: 'number',

      realCode: '',
      realDeviceData: [],
      comElement: null,
      accumulator: 1, // 步骤顺序累计器，用来让步骤顺序递增
      lastNode: null, // 上一个选中的svg节点用来校验区位是否必填
      dragSvgIdList: [] // 可以操作的SVG元素
    };
  },

  computed: {
    ...mapState('page', ['current', 'opened']),
    isEdit() {
      return !!this.configurationId;
    },
    title() {
      return this.waterPlantId ? '关联监测量' : '关联大点表';
    },
    pointOptions() {
      return this.getPointOptions();
    }
  },

  watch: {
    configurationId() {},
    width() {},

    height() {},

    showGrid(val) {
      this.toggleGuide(val);
    },

    isMultiple(val) {
      // 框选或结束框选都清空上次处理结果
      this.clearRest();
    },

    // svgElementSiteStatus(val) {
    //   if (val) {
    //     this.textOption.optionsValue = this.svgElementAttributeNew.textOptionsList[0]
    //     this.textOption.options2Value = this.svgElementAttributeNew.textOptionsList[1]
    //     this.textOption.optionsDeviceValue = this.svgElementAttributeNew.textOptionsList[2]
    //   } else {
    //     this.svgElementAttributeNew.textOptionsList[0] = this.textOption.optionsValue
    //     this.svgElementAttributeNew.textOptionsList[1] = this.textOption.options2Value
    //     this.textOption.optionsDeviceValue = this.svgElementAttributeNew.textOptionsList[2]
    //   }
    // },
    /* 监听 svg 属性的变化 */
    svgObj: {
      handler: function(newVal, oldVal) {
        let svgContent = document.querySelector('.svgContent');
        let SW = parseInt(newVal.svgWidth);
        let SH = parseInt(newVal.svgHeight);
        if (svgContent) {
          svgContent.setAttribute('width', SW);
          svgContent.setAttribute('height', SH);
        }

        /* 计算比例 */
        if (SW > 0 && SH > 0) {
          if (SW >= SH) this.proportionSvg = (SW / SH).toFixed(2) + ' / 1';
          else this.proportionSvg = '1 / ' + (SH / SW).toFixed(2);
        }
        /* 更改底图大小 */
        let element = SVG.get(this.svgBgImgId);
        if (element) element.size(newVal.svgWidth, newVal.svgHeight);
        if (this.svgDraw) {
          this.svgDraw.attr('viewBox', '0, 0, ' + SW + ',' + SH);
        }
      },
      deep: true
    },

    /*  监听元素属性变化  */
    svgElementAttributeNew: {
      handler: function(newVal, oldVal) {
        if (newVal.codeElementObj.codeId === 'DeviceOfflineAlarm') {
          this.stateOrNumberStaus = 'state';
        } else {
          this.stateOrNumberStaus = 'number';
        }
        if (this.svgElementId === this.svgBgImgId || !this.svgElementId) {
          return false;
        }
        this.renderElement(newVal);
        /* 悬浮关联数组更新 */
        if (this.svgElementAttributeNew.hoverCodeList) {
          if (newVal.hoverCodeNum > this.svgElementAttributeNew.hoverCodeList.length) {
            this.svgElementAttributeNew.hoverCodeList.push(this.hoverCodeListObjTp);
          }
          if (newVal.hoverCodeNum < this.svgElementAttributeNew.hoverCodeList.length) {
            this.svgElementAttributeNew.hoverCodeList.pop();
          }
        }
        if (this.waterPlantId && this.svgElementAttributeNew.videoCode) {
          this.textOption.videoList.forEach(item => {
            if (item.videoId === this.svgElementAttributeNew.videoCode) {
              this.svgElementAttributeNew.videoType = item.videoType;
              this.svgElementAttributeNew.videoName = item.videoName;
            }
          });
        }
        this.svgElementType = this.svgElementAttributeNew.svgElementType; // 更新元素类型
        /* 保存当前元素属性 */
        this.svgElementAttributeObj[newVal.domId] = JSON.parse(
          JSON.stringify(this.svgElementAttributeNew)
        );
      },
      deep: true
    },

    /*  监听文本元素绑定选择变化  */
    textOption: {
      handler: function(newVal, oldVal) {
        this.updatatTxtOption(newVal, oldVal);
      },
      deep: true
    },

    /* 监听绑定鼠标事件 */
    callBackEventValue: function(newEventValue, oldEventValue) {
      this.svgElementAttributeNew.callBackEvent = newEventValue;
    },
    callEventType: function(newType, oldType) {
      this.setSvgElementAttributeNew({
        ...this.svgElementAttributeNew,
        callEventTypeValue: newType
      });
    }
  },

  created() {
    this.getObjectTypeList();
    Bus.$on('create', this.busCreate);
    Bus.$on('save', this.busSave);
    Bus.$on('update', this.busUpdate);
    Bus.$on('drawLine', this.drawLine);
    Bus.$on('stopDraw', this.stopDrawLine);
    Bus.$on('changeType', this.changeType);
    this.$bus.$on('editComponent', this.editComponent);
  },

  beforeDestroy() {
    Bus.$off('create', this.busCreate);
    Bus.$off('save', this.busSave);
    Bus.$off('update', this.busUpdate);
    Bus.$off('drawLine', this.drawLine);
    Bus.$off('stopDraw', this.stopDrawLine);
    Bus.$off('changeType', this.changeType);
    this.$bus.$off('editComponent', this.editComponent);
  },

  mounted() {
    this.init();
  },
  methods: {
    ...mapMutations('page', ['removeOpened']),
    async getObjectTypeList() {
      const { resultData, status } = await sysDictListByCode('element_type');
      if (status === 'complete') {
        let dictList = resultData || [];
        dictList.forEach(item => {
          item.label = item.name;
        });
        this.objectTypeList = dictList;
      }
    },
    editComponent(componentId) {
      if (this.isComponentEdit) return;
      this.syncComponents(componentId);
    },
    initRenderElement() {
      Object.values(this.svgElementAttributeObj).forEach(svgElementAttribute => {
        const svgElement = SVG.get(svgElementAttribute.domId);
        if (this.waterPlantId) {
          if (svgElementAttribute.svgElementType === 'text') {
            if (svgElementAttribute?.textOptionsList?.[0] === '3') {
              if (svgElementAttribute?.deviceName) {
                svgElement.text(svgElementAttribute.deviceName);
              }
            }
          }
        }
        if (svgElement) {
          if (svgElementAttribute.svgElementType === 'point') {
            this.updatePointStyle(svgElementAttribute, svgElement);
          }
          if (svgElementAttribute.svgElementType === 'img') {
            svgElement.show();
          }
        }
      });
    },
    cancelMultiSelect() {
      if (this.isMultiple) {
        return new Promise(resolve => {
          this.clearRest();
          setTimeout(() => {
            resolve();
          }, 200);
        });
      }
    },
    /**
     * 设置元素位置
     */
    setElementAxis(_self, _type) {
      if (_self.node.id === this.svgBgImgId) return false;
      const svgElementAttribute = this.svgElementAttributeObj[_self.node.id];
      switch (_type) {
        case 'img':
        case 'text':
        case 'rect': {
          svgElementAttribute.axisX = _self.attr('x');
          svgElementAttribute.axisY = _self.attr('y');
          break;
        }
        case 'circle': {
          svgElementAttribute.axisX = _self.attr('cx');
          svgElementAttribute.axisY = _self.attr('cy');
          break;
        }
        case 'line': {
          svgElementAttribute.axisX = _self.attr('x1');
          svgElementAttribute.axisY = _self.attr('y1');
          break;
        }
        case 'triangle': {
          let points = _self.attr('points').split(' ')[0];
          let pointsArr = points.split(',');
          svgElementAttribute.axisX = pointsArr[0];
          svgElementAttribute.axisY = pointsArr[1];
          break;
        }
        case 'point':
        case 'com':
        case 'alarm': {
          let svgElement = SVG.get(_self.node.id);
          const react = SVG.get(svgElement.node.childNodes[0].id);
          svgElementAttribute.axisX = react.attr('x');
          svgElementAttribute.axisY = react.attr('y');
          break;
        }
      }
    },
    updateSvgAxis(v) {
      const attr = v.svg.attr();
      if (attr.transform && !v.type.includes('alarm') && !v.type.includes('point')) {
        const str = attr.transform;
        const [a, b, c, d, e, f] = attr.transform.substring(7, str.length - 1).split(',');
        if (v.type === 'text') {
          v.svg.x(a * attr.x + c * attr.y + e * 1);
          v.svg.y(b * attr.x + d * attr.y + f * 1);
          v.svg.node.childNodes.forEach(item => {
            const child = SVG.get(item.id);
            child.x(a * attr.x + c * attr.y + e * 1);
          });
        } else if (attr.points) {
          const points = attr.points
            .split(' ')
            .map(item => {
              const [x, y] = item.split(',');
              const newX = a * x + c * y + e * 1;
              const newY = b * x + d * y + f * 1;
              return newX + ',' + newY;
            })
            .join(' ');
          v.svg.attr('points', points);
        } else if (attr.x1 || attr.x1 === 0) {
          v.svg.attr({
            x1: a * attr.x1 + c * attr.y1 + e * 1,
            y1: b * attr.x1 + d * attr.y1 + f * 1,
            x2: a * attr.x2 + c * attr.y2 + e * 1,
            y2: b * attr.x2 + d * attr.y2 + f * 1
          });
        } else if (attr.r || attr.r === 0) {
          v.svg.cx(a * attr.cx + c * attr.cy + e * 1);
          v.svg.cy(b * attr.cx + d * attr.cy + f * 1);
        } else {
          v.svg.x(a * attr.x + c * attr.y + e * 1);
          v.svg.y(b * attr.x + d * attr.y + f * 1);
        }
        v.svg.attr('transform', null);
      }
    },
    // 清空上次处理结果
    clearRest() {
      if (this.group) {
        this.group.ungroup();
        this.group.remove();
        this.group = null;
      }
      if (this.selectRect) {
        this.selectRect.remove();
      }
      this.dragSvgIdList.forEach(v => {
        this.updateSvgAxis(v);
        this.setElementAxis(v.svg, v.type);
      });
      this.dragSvgIdList = [];
      this.svgElements.forEach((v, i) => {
        let element = SVG.get(v.domId);
        if (element) {
          element.draggable(false);
          element.removeClass('select-element');
          element.selectize(false).resize('stop');
        }
      });
    },

    selectElement(e) {
      if (this.isMultiple) {
        this.clearRest();
        this.group = this.svgDraw.group();
        this.group.draggable();
        this.selectRect = this.svgDraw
          .rect()
          .attr({ fill: '#409EFF', 'fill-opacity': 0.1, stroke: '#409EFF' });
        this.selectRect.draw(e);
      }
    },

    stopSelect(e) {
      if (this.isMultiple) {
        this.selectRect.draw('stop', e);
        // 筛选svg
        this.filterSvg();
      }
    },

    filterSvg() {
      this.group.add(this.selectRect);
      this.svgElements
        .filter(v => v.domId !== this.svgBgImgId)
        .forEach(v => {
          const svg = SVG.get(v.domId);
          if (this.isSeleced(v)) {
            let dragSvg = { domId: v.domId, type: v.type, svg: svg, level: v.level };
            this.dragSvgIdList.push(dragSvg);
            if (!(v.type.includes('alarm') || v.type.includes('point'))) {
              this.group.add(svg);
            }
            svg.selectize();
          }
        });
    },

    isSeleced(s) {
      // 判断svg是否被选中可以演变成矩形是否有重叠
      const x = this.selectRect.attr().x;
      const y = this.selectRect.attr().y;
      const w = this.selectRect.attr().width;
      const h = this.selectRect.attr().height;
      const type = s.type;
      let attr = SVG.get(s.domId).attr();

      if (type === 'img' || type === 'text' || type === 'rect') {
        if (!attr.width) {
          const clientReact = document.getElementById(s.domId).getBoundingClientRect();
          attr = { ...attr, width: clientReact.width, height: clientReact.height };
        }
        if (typeof attr.width === 'string' && attr.width.includes('px')) {
          attr.width = Number(attr.width.substring(0, attr.width.length - 2));
        }
        if (typeof attr.height === 'string' && attr.height.includes('px')) {
          attr.height = Number(attr.height.substring(0, attr.height.length - 2));
        }
        if (w === 0 || attr.width === 0) {
          return false;
        }
        return !(
          attr.x + attr.width <= x ||
          attr.x >= x + w ||
          attr.y >= y + h ||
          attr.y + attr.height <= y
        );
      } else if (type === 'line' || type === 'triangle') {
        if (attr.points) {
          const pArr = attr.points.split(' ');
          const arr = [];
          for (let i = 0; i < pArr.length - 1; i++) {
            const xy = pArr[i].split(',');
            const xy1 = pArr[i + 1].split(',');
            arr.push({ x1: xy[0], y1: xy[1], x2: xy1[0], y2: xy1[1] });
          }
          return arr.some(line => {
            return lineReact(this.selectRect.attr(), line);
          });
        } else {
          return lineReact(this.selectRect.attr(), attr);
        }
      } else if (type === 'circle') {
        return !(
          attr.cx + attr.r <= x ||
          attr.cx - attr.r >= x + w ||
          attr.cy - attr.r >= y + h ||
          attr.cy + attr.r <= y
        );
      } else if (type === 'alarm' || type === 'point') {
        const reactDom = document.getElementById(s.domId).children[0];
        const clientReact = reactDom.getBoundingClientRect();
        const groupTransform = attr.transform;
        let [a, b, c, d, e, f] = [1, 0, 0, 1, 0, 0];
        if (groupTransform) {
          [a, b, c, d, e, f] = groupTransform.substring(7, groupTransform.length - 1).split(',');
        }
        let reactAttr = SVG.get(document.getElementById(s.domId).childNodes[0].id).attr();
        attr = {
          x: a * reactAttr.x + c * reactAttr.y + e * 1,
          y: b * reactAttr.x + d * reactAttr.y + f * 1,
          width: clientReact.width,
          height: clientReact.height
        };
        return !(
          attr.x + attr.width <= x ||
          attr.x >= x + w ||
          attr.y >= y + h ||
          attr.y + attr.height <= y
        );
      }
    },

    init() {
      if (this.waterPlantId) {
        this.getDeviceList();
        this.getVideoList();
      }
      if (this.configurationId) {
        this.loadConfiguration(this.configurationId);
      } else {
        this.svgDraw = SVG(this.svgBoxId).size(this.svgObj.svgWidth, this.svgObj.svgHeight);
        this.svgDraw.attr('class', 'svgContent');
        this.svgDraw.attr('id', this.svgId);
        this.svgDraw.attr('viewBox', '0, 0, ' + this.svgObj.svgWidth + ',' + this.svgObj.svgHeight);
      }
      this.keyEvent();
    },
    keyEvent() {
      document.onkeydown = e => {
        let keyCode = e.keyCode || e.which || e.charCode;
        if (keyCode == 38) {
          this.svgElementAttributeNew.axisY -= 1;
        }
        if (keyCode == 40) {
          this.svgElementAttributeNew.axisY += 1;
        }
        if (keyCode == 37) {
          this.svgElementAttributeNew.axisX -= 1;
        }
        if (keyCode == 39) {
          this.svgElementAttributeNew.axisX += 1;
        }
      };
    },
    // 组态类型发生改变时回调
    changeType(type) {
      if (this._inactive) return;
      // 从巡检切换到详情需要把巡检步骤清除
      const comElements = this.svgElements.filter(v => v.type === 'com');
      if (type === 'plant_info_svg' && comElements.length > 0) {
        this.$confirm({
          title: '提示',
          content: '您已配置了巡检步骤，确定要更改组态类型吗',
          onOk: () => {
            comElements.forEach((c, ind) => {
              const svgElementId = c.domId;
              this.svgElements.forEach((v, i) => {
                if (c.domId === v.domId) {
                  this.svgElements.splice(i, 1);
                  const element = SVG.get(svgElementId);
                  if (element) {
                    element.draggable(false); // 去除拖拽事件
                    element.selectize(false).resize('stop'); // 去除选中、改变大小事件
                  }
                  let zIndex = element.attr('z-index'); // 获取层级
                  try {
                    document.getElementById(svgElementId).remove(); // 删除dom
                  } catch (err) {
                    document
                      .getElementById(svgElementId)
                      .parentNode.removeChild(document.getElementById(svgElementId));
                  }
                  delete this.svgElementAttributeObj[this.svgElementId]; // 删除元素属性
                  this.svgElementDomList[zIndex].forEach((val, index) => {
                    // 删除元素分层数据
                    if (val.svgElementId === svgElementId) {
                      this.svgElementDomList[zIndex].splice(index, 1);
                    }
                  });
                  this.svgElementSiteStatus = false;
                  this.svgElementId = '';
                }
              });
            });
          },
          onCancel: () => {
            Bus.$emit('cancelChange');
          }
        });
      }
    },

    getVideoList() {
      // 通过泵房id查找视频
      const params = {
        pageFlag: false,
        dsAreaStationDeviceQueries: [
          {
            stationId: [this.waterPlantId]
          }
        ]
      };
      QueryDsDeviceVideo(params).then(res => {
        const { resultData } = res;
        this.textOption.videoList = resultData || [];
      });
    },

    getDeviceList() {
      getDeviceList(this.waterPlantId).then(res => {
        this.realDeviceData = res.resultData;
      });
    },

    async sysDictListByCode(code, data) {
      const res = await sysDictListByCode(code);
      this[data] = res.resultData;
    },

    loadConfiguration(configurationId) {
      let params = {
        id: configurationId
      };
      let promiseFunc = this.waterPlantId ? getSiteSvgBySiteId : getDevicePhSvgById;
      console.log('promiseFunc', this.waterPlantId);
      promiseFunc(params).then(res => {
        console.log('res', res);
        if (res.status === 'complete') {
          this.svgInfo = res.resultData;
          this.svgInfo.svgContent = this.svgInfo.svgContent.replace(
            /HOST_PLACEHOLDER/g,
            serverConfig.IMG_BASE_URL
          );
          this.svgInfo.svgElementAttributeObj = this.svgInfo.svgElementAttributeObj.replace(
            /HOST_PLACEHOLDER/g,
            serverConfig.IMG_BASE_URL
          );
          this.dealSvgInfo(); // 对svg数据进行处理；
          Bus.$emit('loadSvg', this.svgObj);
          document.getElementById(this.svgId).removeAttribute('xmlns:svgjs');
          document.getElementById(this.svgId).removeAttribute('xmlns');
          this.svgDraw = SVG(this.svgId); // 初始化svg；
          this.initSvgEvent(); // 初始化 svg 元素监听事件；
          this.setGrid(); // 添加网格
          this.upDateSvgDom(); // 按照层级更新元素
        }
      });
    },

    getContainer() {
      return document.querySelector('.configuration-edit-content');
    },

    /**
     * 处理初始化 svg 信息
     */
    dealSvgInfo() {
      let self = this;
      this.svgObj.id = this.svgInfo.id;
      this.svgObj.svgName = this.svgInfo.svgName;
      this.svgObj.svgCode = this.svgInfo.svgCode;
      this.svgObj.svgType = this.svgInfo.svgType;
      this.svgObj.svgSort = this.svgInfo.sort;
      this.svgObj.svgHeight = this.svgInfo.svgHeight;
      this.svgObj.svgWidth = this.svgInfo.svgWidth;
      this.svgIcon = JSON.parse(this.svgInfo.svgIcon);
      this.svgElementDomList = JSON.parse(this.svgInfo.svgElementsId);
      this.svgElementAttributeObj = JSON.parse(this.svgInfo.svgElementAttributeObj);

      document.getElementById(this.svgBoxId).innerHTML = this.svgInfo.svgContent;
      this.$nextTick(() => {
        this.syncComponents();
        this.initRenderElement();
      });
      this.svgElementDomList.forEach((v, i) => {
        if (v) {
          v.forEach((val, index) => {
            if (val.svgElementId && self.svgElementAttributeObj[val.svgElementId]) {
              self.svgElements.push({
                domId: val.svgElementId,
                type: val.svgElementType,
                level: val.svgElementLevel || ''
              });
            }
          });
        }
      });

      /* 获取svg 底图 */
      if (SVG.get(this.svgBgImgId)) {
        let baseMap = SVG.get(this.svgBgImgId);
        let svgBgImgPre = baseMap.attr('xlink:href');
        if (svgBgImgPre) {
          this.$emit('update:background', svgBgImgPre);
        }
      }
    },

    /**
     * 创建网格
     */
    setGrid(_type) {
      let pattern = this.svgDraw.pattern(100, 100, function(add) {
        add.line(0, 100, 100, 100).stroke({ width: 2, color: '#9FC3EA' });
        add.line(0, 80, 100, 80).stroke({ width: 1, dasharray: '2 2', color: '#fff' });
        add.line(0, 60, 100, 60).stroke({ width: 1, dasharray: '2 2', color: '#fff' });
        add.line(0, 40, 100, 40).stroke({ width: 1, dasharray: '2 2', color: '#fff' });
        add.line(0, 20, 100, 20).stroke({ width: 1, dasharray: '2 2', color: '#fff' });
        add.line(100, 0, 100, 100).stroke({ width: 2, color: '#9FC3EA' });
        add.line(80, 0, 80, 100).stroke({ width: 1, dasharray: '2 2', color: '#fff' });
        add.line(60, 0, 60, 100).stroke({ width: 1, dasharray: '2 2', color: '#fff' });
        add.line(40, 0, 40, 100).stroke({ width: 1, dasharray: '2 2', color: '#fff' });
        add.line(20, 0, 20, 100).stroke({ width: 1, dasharray: '2 2', color: '#fff' });
      });
      let wg = this.svgDraw.rect(1860, 870).fill(pattern);
      if (_type) {
        wg.attr({ id: 'grid', 'z-index': '1', style: 'display:blcok' });
      } else {
        wg.attr({ id: 'grid', 'z-index': '1', style: 'display:none' });
      }

      wg.click(() => {
        this.monitorSvgClickEvent(wg, 'setGrid');
      });
      let obj = {};
      obj.svgElementId = 'grid';
      obj.svgElementType = 'setGrid';
      if (!this.svgElementDomList[1]) this.svgElementDomList[1] = [];
      this.svgElementDomList[1].push(obj); // 存储元素的DOM
    },

    /**
     * svg 元素监听事件
     */
    monitorSvgClickEvent(_self, _type) {
      if (this.isMultiple && _type === 'baseMap') {
        return false;
      }
      this.bindEvent(_self, _type);
    },

    /**
     * svg 元素绑定事件
     */
    bindEvent(_self, _type) {
      let self = this;
      this.svgElementId = _self.node.id;
      /* 显示当前元素的属性 */
      if (self.svgElementAttributeObj[_self.node.id]) {
        this.setSvgElementAttributeNew(cloneDeep(self.svgElementAttributeObj[_self.node.id]));
      }
      this.lastNode = self.svgElementAttributeNew;

      /* 绑定或者解除元素事件 */
      self.svgElements.forEach((v, i) => {
        let clickElement = SVG.get(v.domId);
        if (clickElement) {
          clickElement.draggable(false);
          clickElement.selectize(false).resize('stop');
        }

        if (v.domId === _self.node.id) self.bindEventDSC(_self, _type);
      });
    },

    /**
     * 解除元素绑定事件
     */
    elementUnbindEvt() {
      /* 绑定或者解除元素事件 */
      this.svgElements.map((v, i) => {
        let clickElement = SVG.get(v.domId);
        if (clickElement) {
          clickElement.draggable(false);
          clickElement.selectize(false).resize('stop');
          clickElement.off('click');
        }
      });
    },

    /**
     * 元素绑定拖拽、旋转、改变大小事件
     */
    bindEventDSC(_self, _type) {
      let self = this;
      if (_type !== 'baseMap') {
        _self.draggable().on('dragend', e => {
          self.getElementAttr(SVG.get(self.svgElementId), _type); // 获取元素属性
        });
      }
      _self.selectize();
      if (_type !== 'text' && _type !== 'com' && _type !== 'point' && _type !== 'alarm') {
        _self.resize();
      }
      this.svgElementId = _self.node.id;
      this.svgElementType = _type;
      this.svgElementName = this.svgElementNameT[_type];
      self.getElementAttr(SVG.get(self.svgElementId), _type); // 获取元素属性
    },

    /**
     * 获取元素属性值
     */
    getElementAttr(_self, _type) {
      if (_self.node.id === this.svgBgImgId) return false;
      switch (_type) {
        case 'img': {
          this.svgElementAttributeNew.axisX = _self.attr('x');
          this.svgElementAttributeNew.axisY = _self.attr('y');
          this.imageElementsSrc = _self.attr('xlink:href') || _self.attr('href') || _self.src;
          this.svgElementAttributeNew.value = this.imageElementsSrc;
          break;
        }
        case 'text': {
          /* 同步元素属性 */
          let textId = _self.node.id;
          let textCls = document.getElementById(textId).getAttribute('fill');
          this.svgElementAttributeNew.value = _self.text();
          this.svgElementAttributeNew.fill = textCls;
          this.svgElementAttributeNew.axisX = _self.attr('x');
          this.svgElementAttributeNew.axisY = _self.attr('y');

          /* 同步文本配置项 */
          if (this.svgElementAttributeNew.textOptionsList) {
            this.textOption.optionswaterPumpValue = this.svgElementAttributeNew.textOptionsList[3];
          }
          break;
        }
        case 'rect': {
          let rectId = _self.node.id;
          let rectCls = document.getElementById(rectId).getAttribute('fill');
          this.svgElementAttributeNew.fill = rectCls;
          this.svgElementAttributeNew.axisX = _self.attr('x');
          this.svgElementAttributeNew.axisY = _self.attr('y');
          break;
        }
        case 'circle': {
          let circleId = _self.node.id;
          let circleCls = document.getElementById(circleId).getAttribute('fill');
          this.svgElementAttributeNew.fill = circleCls;
          this.svgElementAttributeNew.axisX = _self.attr('cx');
          this.svgElementAttributeNew.axisY = _self.attr('cy');
          break;
        }
        case 'line': {
          let lineId = _self.node.id;
          let lineCls = document.getElementById(lineId).getAttribute('stroke');
          let lineWidth = document.getElementById(lineId).getAttribute('stroke-width');
          this.svgElementAttributeNew.width = lineWidth;
          this.svgElementAttributeNew.stroke = lineCls;
          this.svgElementAttributeNew.axisX = _self.attr('x1');
          this.svgElementAttributeNew.axisY = _self.attr('y1');
          break;
        }
        case 'triangle': {
          let triangleId = _self.node.id;
          let triangleCls = document.getElementById(triangleId).getAttribute('fill');
          this.svgElementAttributeNew.fill = triangleCls;
          let points = _self.attr('points').split(' ')[0];
          let pointsArr = points.split(',');
          this.svgElementAttributeNew.axisX = pointsArr[0];
          this.svgElementAttributeNew.axisY = pointsArr[1];
          break;
        }
        case 'point': {
          let svgElement = SVG.get(_self.node.id);
          const react = SVG.get(svgElement.node.childNodes[0].id);
          this.svgElementAttributeNew.axisX = react.attr('x');
          this.svgElementAttributeNew.axisY = react.attr('y');
          this.svgElementAttributeNew.fill = react.attr('fill');
          break;
        }
        case 'com': {
          let svgElement = SVG.get(_self.node.id);
          const react = SVG.get(svgElement.node.childNodes[0].id);
          this.svgElementAttributeNew.axisX = react.attr('x');
          this.svgElementAttributeNew.axisY = react.attr('y');
          break;
        }
        case 'alarm': {
          let svgElement = SVG.get(_self.node.id);
          const react = SVG.get(svgElement.node.childNodes[0].id);
          this.svgElementAttributeNew.axisX = react.attr('x');
          this.svgElementAttributeNew.axisY = react.attr('y');
          break;
        }
      }
      if (
        (_type === 'rect' ||
          _type === 'text' ||
          _type === 'img' ||
          _type === 'point' ||
          _type === 'alarm') &&
        this.svgElementAttributeNew.textOptionsList
      ) {
        /* 同步图片配置项 */
        this.textOption.optionsValue = this.svgElementAttributeNew.textOptionsList[0];
        this.textOption.options2Value = this.svgElementAttributeNew.textOptionsList[1];
        this.textOption.optionsDeviceValue = this.svgElementAttributeNew.textOptionsList[2];
        this.textOption.optionsDevice = this.waterPlantId ? this.realDeviceData : DEVLIST;
      }
      if (_type === 'com' && this.waterPlantId && this.svgElementAttributeNew.inspDev) {
        const id = this.svgElementAttributeNew.inspDev;
        if (id) {
          this.realDeviceData.forEach(v => {
            if (v.deviceId === id) {
              this.svgElementAttributeNew.devInfo = {
                label: v.deviceName,
                key: v.deviceId
              };
            }
          });
        }
      }
      this.callBackEventValue = this.svgElementAttributeNew.callBackEvent;
      this.callEventType = this.svgElementAttributeNew.callEventTypeValue || '';
      this.svgElementAttributeObj[_self.node.id] = cloneDeep(this.svgElementAttributeNew);
    },

    /**
     * svg元素初始化监听事件
     */
    initSvgEvent() {
      let self = this;
      // 添加背景图片添加点击事件
      if (!this.svgElements.find(item => item.domId === this.svgBgImgId)) {
        this.svgElements.push({ domId: this.svgBgImgId, type: 'baseMap', level: '' });
      }
      this.svgElements.forEach((v, index) => {
        if (v.domId && v.type) {
          if (v.type === 'com') {
            this.accumulator++;
          }
          let element = SVG.get(v.domId);
          if (element) {
            element.click(() => {
              self.monitorSvgClickEvent(element, v.type);
            });
          }
        }
      });
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
    },

    updatatTxtOption(newVal, oldVal) {
      if (!this.svgElementAttributeNew.textOptionsList) {
        return;
      }
      let optionList = JSON.parse(JSON.stringify(this.svgElementAttributeNew.textOptionsList));
      if (newVal.optionsValue === '1') {
        // 1 文本类性为文字 2文本类型为监测量值
        optionList = ['1', newVal.options2Value, newVal.optionsDeviceValue];
      }
      if (
        (newVal.optionsValue === '2' ||
          newVal.optionsValue === '3' ||
          this.svgElementType !== 'text') &&
        newVal.options2Value !== '0'
      ) {
        if (
          this.svgElementType === 'text' ||
          this.svgElementType === 'point' ||
          this.svgElementType === 'rect'
        ) {
          optionList = [newVal.optionsValue, newVal.options2Value, newVal.optionsDeviceValue];
          if (newVal.optionsValue === '2') {
            this.svgElementAttributeNew.value = '00.00';
          }
        } else {
          optionList = ['', newVal.options2Value, newVal.optionsDeviceValue];
        }
      }

      if (
        (newVal.optionsValue === '2' || this.svgElementType !== 'text') &&
        newVal.options2Value === '0'
      ) {
        if (this.svgElementType === 'text' || this.svgElementType === 'point') {
          optionList = ['2', '0', ''];
          this.svgElementAttributeNew.value = '00.00';
        } else {
          optionList = ['', '0', ''];
        }
        this.svgElementAttributeNew.codeElementObj = JSON.parse(
          JSON.stringify(this.svgElementAttributeTemplate.codeElementObj)
        );
      }

      this.svgElementAttributeNew.textOptionsList = JSON.parse(JSON.stringify(optionList));
      if (!this.waterPlantId) {
        this.svgElementAttributeNew.deviceId = newVal.optionsDeviceValue;
      }
      /* 保存当前元素属性 */
      this.svgElementAttributeObj[this.svgElementId] = JSON.parse(
        JSON.stringify(this.svgElementAttributeNew)
      );
    },

    updataEventValue(newVal) {
      this.callBackEventValue = newVal;
    },
    getSvgElementIdList() {
      return flatten(this.svgElementDomList);
    },
    updataEventType(type) {
      this.callEventType = type;
    },

    handleAction(actionType, svgElementId) {
      switch (actionType) {
        case 'saveComponent':
          this.handleSaveComponent(svgElementId);
          break;
        case 'copy':
          this.handleCopy(svgElementId);
          break;
        case 'pre':
          this.handleMove(actionType, svgElementId);
          break;
        case 'next':
          this.handleMove(actionType, svgElementId);
          break;
        case 'top':
          this.handleMove(actionType, svgElementId);
          break;
        case 'bottom':
          this.handleMove(actionType, svgElementId);
          break;
        case 'delete':
          this.handleDelete(svgElementId);
          break;
        case 'select':
          this.$emit('multipleSelect', !this.isMultiple);
          break;
      }
    },

    drawLine() {
      if (this._inactive) return;
      this.polyline = this.svgDraw
        .polyline()
        .fill('none')
        .stroke({ color: '#48a9f3', width: 4 })
        .draw();
    },

    stopDrawLine() {
      if (this._inactive) return;
      this.polyline.draw('done');
      this.polyline.off('drawstart');
      this.handleAdd('draw');
    },
    async handleSaveComponent(svgElementId) {
      if (!svgElementId || svgElementId === this.svgBgImgId || svgElementId === 'grid') {
        this.$message.info('请选择需要操作的非背景或网格的元素！');
        return false;
      }

      let element = SVG.get(svgElementId);
      let attributes = element.attr();
      let componentId = this.svgElementAttributeNew?.componentId;
      let componentData = cloneDeep({ ...this.svgElementAttributeNew, svgAttr: attributes });
      this.handleSvgElementAttribute(componentData);
      if (componentId) {
        const { resultData, status } = await getSvgModuleDetail(componentId);
        if (status === 'complete') {
          this.componentFrom = {
            id: componentId,
            iconUrl: resultData?.iconUrl,
            name: resultData?.name,
            configJson: JSON.stringify(componentData)
          };
        }
      } else {
        this.componentFrom = {
          id: undefined,
          iconUrl: undefined,
          name: undefined,
          configJson: JSON.stringify(componentData)
        };
      }

      this.svgComponentFromVisible = true;
    },
    handleCopy(svgElementId) {
      if (this.isMultiple) {
        if (this.dragSvgIdList.length > 0) {
          this.dragSvgIdList.forEach(item => {
            const attr = item.svg.attr();
            this.handleAdd(item.type + (item.level || ''), attr);
          });
          this.$emit('multipleSelect', false);
        } else {
          this.$message.info('请选择需要操作的元素！');
          return false;
        }
      } else {
        if (this.svgElementId == '') {
          this.$message.info('请选择需要操作的元素！');
          return false;
        }
        let element = SVG.get(svgElementId);
        let svgElement = this.svgElements.find(o => o.domId === svgElementId);
        let attributes = element.attr();
        this.handleAdd(svgElement.type + (svgElement.level || ''), attributes);
      }
      this.$message.success('复制成功！');
    },

    isCondition() {
      if (
        this.lastNode?.svgElementType === 'com' &&
        this.lastNode.configType === 1 &&
        !this.lastNode.inspDev
      ) {
        this.$message.error('设备区位为必填选项');
        return false;
      } else {
        return true;
      }
    },
    handleCreateComponent(component) {
      this.handleAdd(
        component.svgElementType + (component.alarmLevel || ''),
        component.svgAttr,
        component
      );
      if (this.isComponentEdit) {
        this.svgElementSiteStatus = true;
      }
    },

    /**
     * svg 添加元素
     * @param _type
     */
    handleAdd(_type, _attr, component) {
      let svgData = component || this.svgElementAttributeNew;
      let element = '';
      let svgBoxOutDom = document.getElementById(this.svgBoxOutId);
      let sL = svgBoxOutDom.scrollLeft;
      let sT = svgBoxOutDom.scrollTop;
      let wo = svgBoxOutDom.offsetWidth;
      let ho = svgBoxOutDom.offsetHeight;
      let axisX = sL + wo / 2;
      let axisY = sT + ho / 4;
      switch (_type) {
        case 'point': {
          const group = this.svgDraw.group();
          const rect = this.svgDraw
            .rect(262, 44)
            .attr({ x: axisX, y: axisY })
            .fill(SvgStyleConfig.point.bodyBg);
          const text = this.svgDraw.text('监测量名称');
          text.attr({ x: axisX + 10, y: axisY + 8 });
          const points = this.svgDraw.group().attr({ name: 'multiplePoint' });
          const value = this.svgDraw.text('0');
          value.attr({ x: axisX + 106, y: axisY });
          const unit = this.svgDraw.text('');
          unit.hide();
          unit.attr({ x: axisX + 190, y: axisY + 6 });
          const image = this.svgDraw
            .image(
              'data:image/png;base64,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'
            )
            .attr({ width: 26, height: 26, x: axisX + 234, y: axisY + 10 });
          group.add(rect);
          group.add(image);
          group.add(text);
          group.add(value);
          group.add(unit);
          group.add(points);
          element = group;
          this.svgElementType = 'point';
          group.click(() => {
            this.monitorSvgClickEvent(group, 'point');
          });
          this.svgElementName = this.svgElementNameT.point;
          break;
        }
        case 'com': {
          element = this.createComElement(element, axisX, axisY);
          break;
        }
        case 'img': {
          let image = this.svgDraw
            .image(component?.value || this.imageElementsSrc)
            .loaded(function(loader) {
              if (!_attr) {
                this.size('50px', '50px');
              }
            });
          image.click(() => {
            this.monitorSvgClickEvent(image, 'img');
          });
          image.attr({ x: axisX, y: axisY });
          element = image;
          this.svgElementType = 'img';
          this.svgElementName = this.svgElementNameT.img;
          break;
        }
        case 'text': {
          let text = '';
          if (_attr) {
            text = this.svgDraw.text(svgData.value);
          } else {
            text = this.svgDraw.text(this.svgElementAttributeTemplate.value);
          }
          text.attr({ x: axisX, y: axisY });
          text.fill(this.svgElementAttributeTemplate.fill);
          text.click(() => {
            this.monitorSvgClickEvent(text, 'text');
          });
          element = text;
          this.svgElementType = 'text';
          this.svgElementName = this.svgElementNameT.text;
          break;
        }
        case 'rect': {
          let rect = this.svgDraw.rect(100, 100).fill(this.svgElementAttributeTemplate.fill);
          rect.click(() => {
            this.monitorSvgClickEvent(rect, 'rect');
          });
          rect.attr({ x: axisX, y: axisY });
          element = rect;
          this.svgElementType = 'rect';
          this.svgElementName = this.svgElementNameT.rect;
          break;
        }
        case 'circle': {
          let circle = this.svgDraw
            .circle(50)
            .fill('#ccc')
            .move(10, 10);
          circle.click(() => {
            this.monitorSvgClickEvent(circle, 'circle');
          });
          element = circle;
          element.attr({ cx: axisX, cy: axisY });
          this.svgElementType = 'circle';
          this.svgElementName = this.svgElementNameT.circle;
          break;
        }
        case 'line': {
          let line = this.svgDraw.line('30, 30 100, 30').stroke({ width: 2 });
          line.click(() => {
            this.monitorSvgClickEvent(line, 'line');
          });
          line.attr({ x1: axisX, y1: axisY, x2: axisX + 70, y2: axisY, animate: '0' });
          element = line;
          this.svgElementType = 'line';
          this.svgElementName = this.svgElementNameT.line;
          break;
        }
        case 'triangle': {
          let triangle = this.svgDraw
            .polygon('50,0 25,50 75,50')
            .fill('#ccc')
            .stroke({ width: 1 });
          triangle.click(() => {
            this.monitorSvgClickEvent(triangle, 'triangle');
          });
          let oldAttr = triangle.attr('points').split(' ');
          let oldAttrNumX1 = parseInt(oldAttr[0].split(',')[0]);
          // eslint-disable-next-line radix
          let oldAttrNumY1 = parseInt(oldAttr[0].split(',')[1]);
          let addX = axisX - oldAttrNumX1;
          // eslint-disable-next-line no-case-declarations
          let addY = axisY - oldAttrNumY1;
          triangle.attr(
            'points',
            axisX +
              ',' +
              axisY +
              ' ' +
              (addX + 25) +
              ',' +
              (50 + addY) +
              ' ' +
              (75 + addX) +
              ',' +
              (50 + addY)
          );
          element = triangle;
          this.svgElementType = 'triangle';
          this.svgElementName = this.svgElementNameT.triangle;
          break;
        }
        case 'draw': {
          element = this.polyline;
          this.polyline.click(() => {
            this.monitorSvgClickEvent(this.polyline, 'line');
          });
          this.svgElementType = 'line';
          this.svgElementName = this.svgElementNameT.line;
          _type = 'line';
          break;
        }
      }
      if (_type.includes('alarm')) {
        element = this.createAlarmElement(_type, axisX, axisY);
      }
      this.svgElementId = element.node.id;
      this.svgElements.push({
        domId: element.node.id,
        type: this.svgElementType,
        level: _type.includes('alarm') ? _type.slice(-1) : ''
      });
      element.attr('z-index', 2); // 元素层级设置为3
      element.attr('class', 'svg-element');
      if (this.svgElementType === 'img' || this.svgElementType === 'rect') {
        this.svgIcon.push(this.svgElementId);
      }
      if (_attr) {
        // eslint-disable-next-line guard-for-in
        for (let key in _attr) {
          if (key !== 'id' && key !== 'xlink:href') {
            element.attr(key, _attr[key]);
          }
          // eslint-disable-next-line eqeqeq
          if (key == 'x' || key == 'y' || key == 'cx' || key == 'cy') {
            element.attr(key, _attr[key] + 5);
          }
        }
      }
      let obj = {};
      if (_type.includes('alarm')) {
        obj.svgElementLevel = _type.slice(-1);
        _type = 'alarm';
      }
      obj.svgElementId = this.svgElementId;
      obj.svgElementType = _type;
      if (!this.svgElementDomList[2]) {
        this.svgElementDomList[2] = [];
      }
      this.svgElementDomList[2].push(obj); // 存储元素的DOM
      if (_attr) {
        let copySvgElementAttribute = cloneDeep(svgData);
        copySvgElementAttribute.svgElementType = this.svgElementType; // 同步dom类型
        copySvgElementAttribute.domId = this.svgElementId;
        this.svgElementAttributeObj[copySvgElementAttribute.domId] = cloneDeep(
          copySvgElementAttribute
        );
        this.setSvgElementAttributeNew(this.svgElementAttributeObj[copySvgElementAttribute.domId]);
        this.$nextTick(() => {
          let element = SVG.get(copySvgElementAttribute.domId);
          this.bindEvent(element, _type);
        });
      } else {
        this.svgElementAttributeTemplate.svgElementType = this.svgElementType; // 同步dom类型
        this.svgElementAttributeTemplate.domId = this.svgElementId;
        this.svgElementAttributeTemplate.alarmLevel = obj.svgElementLevel || '';
        this.setSvgElementAttributeNew(cloneDeep(this.svgElementAttributeTemplate));
        if (_type === 'com') {
          this.svgElementAttributeNew.comData = this.comElement;
          this.svgElementAttributeNew.inspName = this.comElement.stepName;
          this.svgElementAttributeNew.configType = this.comElement.configType;
        } else if (_type === 'point' || _type.includes('alarm')) {
          this.svgElementAttributeNew.callBackEvent = '3';
          this.svgElementAttributeNew.callEventTypeValue = _type === 'point' ? 'point' : 'alarm';
        }
        if (_type === 'point') {
          this.svgElementAttributeNew.fill = SvgStyleConfig.point.bodyBg;
        }
        this.$nextTick(() => {
          this.bindEvent(element, _type); // 绑定拖拽事件
        });
        this.getElementAttr(element, _type);
        this.upDateSvgDom(); // 按照层级重新渲染
      }
    },

    createComElement(element, x, y) {
      y = Math.round(Math.random(1) * 100) + y;
      const group = this.svgDraw.group();
      const rect = this.svgDraw
        .rect(this.comElement.configType === 1 ? 180 : 120, 34)
        .attr({ x: x, y: y })
        .fill('rgba(0,0,0,0.65)')
        .stroke('rgba(0,0,0,0.65)');
      rect.radius(15);
      const text = this.svgDraw.text(String(this.accumulator));
      this.accumulator++;
      const itemName = this.comElement.stepName;
      const name = this.svgDraw.text(itemName);
      text.fill('#fff');
      text.font({ size: '14px' });
      text.attr({ x: x + 12, y: y + 4 });
      name.fill('#fff');
      name.font({ size: '14px' });
      name.attr({ x: x + 36, y: y + 4 });
      const circle = this.svgDraw
        .circle(24)
        .fill('#969999')
        .attr({ cx: x + 18, cy: y + 17 });
      group.add(rect);
      group.add(circle);
      group.add(text);
      group.add(name);
      group.click(() => {
        this.monitorSvgClickEvent(group, 'com');
      });
      this.svgElementType = 'com';
      this.svgElementName = this.svgElementNameT.com;
      return group;
    },

    createAlarmElement(_type, x, y) {
      const colors = [
        ['#ff5568', '#FF5F76'],
        ['#ff922b', '#FD7E14'],
        ['#ffbf00', '#F59F00'],
        ['#9c73fb', '#8F44F8']
      ];
      const leveValue = _type.slice(-1);
      const group = this.svgDraw.group();
      group.level = leveValue;
      const rect = this.svgDraw
        .rect(150, 44)
        .attr({ x: x, y: y })
        .fill(colors[leveValue - 1][0]);
      const circle = this.svgDraw
        .circle(28)
        .fill(colors[leveValue - 1][1])
        .attr({ cx: x + 24, cy: y + 24 });
      const leve = this.svgDraw.text(String(leveValue));
      leve.fill('#fff');
      leve.font({ size: '18px' });
      leve.attr({ x: x + 18, y: y + 6 });
      const name = this.svgDraw.text('报警名称');
      name.fill('#fff');
      name.font({ size: '18px' });
      name.attr({ x: x + 44, y: y + 6 });

      group.add(rect);
      group.add(circle);
      group.add(leve);
      group.add(name);

      group.click(() => {
        this.monitorSvgClickEvent(group, 'alarm');
      });
      this.svgElementType = 'alarm';
      this.svgElementName = this.svgElementNameT.alarm;
      return group;
    },

    handleDelete(svgElementId) {
      if (this.isMultiple) {
        this.$confirm({
          title: '提示',
          content: `您确定要删除框选的全部元素吗`,
          onOk: () => {
            if (this.dragSvgIdList.length > 0) {
              this.dragSvgIdList.forEach(item => {
                const attr = item.svg.attr();
                this.deleteSvgElement(item.domId, item.type, 0);
              });
              this.$emit('multipleSelect', false);
            } else {
              this.$message.info('请选择需要操作的元素！');
              return false;
            }
            this.$message.success('删除成功！');
          }
        });
      } else {
        if (this.svgElementId == '') {
          this.$message.info('请选择需要操作的元素！');
          return false;
        }
        let svgElement = this.svgElements.find(o => o.domId === svgElementId);
        let svgElementType = svgElement.type;
        let deleteComOrder = 0;
        let self = this;

        this.$confirm({
          title: '提示',
          content: `${svgElementType === 'com' ? '删除后步骤顺序会发生改变，' : ''}您确定要删除吗`,
          onOk: () => {
            this.deleteSvgElement(svgElementId, svgElementType, deleteComOrder);
            this.$message.success('删除成功！');
          }
        });
      }
    },

    deleteSvgElement(svgElementId, svgElementType, deleteComOrder) {
      let self = this;
      this.svgElements.forEach((v, i) => {
        if (svgElementId === v.domId) {
          if (svgElementType === 'com') {
            deleteComOrder = this.svgElementAttributeObj[v.domId].inspOrder;
          }
          this.svgElements.splice(i, 1);
          let element = SVG.get(svgElementId);
          if (element) {
            element.draggable(false); // 去除拖拽事件
            element.selectize(false).resize('stop'); // 去除选中、改变大小事件
            let zIndex = element.attr('z-index'); // 获取层级
            this.svgElementDomList[zIndex].forEach((val, index) => {
              // 删除元素分层数据
              if (val.svgElementId === svgElementId) {
                this.svgElementDomList[zIndex].splice(index, 1);
              }
            });
          }
          try {
            document.getElementById(svgElementId).remove(); // 删除dom
          } catch (err) {
            document
              .getElementById(svgElementId)
              ?.parentNode.removeChild(document.getElementById(svgElementId));
          }
          delete this.svgElementAttributeObj[this.svgElementId]; // 删除元素属性
          this.svgElementSiteStatus = false;
          this.svgElementId = '';
        }
      });

      if (svgElementType === 'com') {
        const comElements = self.svgElements.filter(v => v.type === 'com');
        let maxOrder = 0;
        comElements.forEach((v, i) => {
          if (this.svgElementAttributeObj[v.domId].inspOrder > deleteComOrder) {
            this.svgElementAttributeObj[v.domId].inspOrder--;
            let svgElement = SVG.get(v.domId);
            const text = SVG.get(svgElement.node.childNodes[2].id);
            text.text(String(this.svgElementAttributeObj[v.domId].inspOrder));
          }
          maxOrder = Math.max(maxOrder, this.svgElementAttributeObj[v.domId].inspOrder);
        });
        this.accumulator = Number(maxOrder) + 1;
      }

      if (svgElementType === 'img' || svgElementType === 'rect') {
        this.svgIcon.forEach((v, i) => {
          if (svgElementId === v.domId) {
            this.svgIcon.splice(i, 1);
          }
        });
      }
      if (svgElementType === 'baseMap') {
        this.svgBgImgStatus = false;
        this.$emit('update:background', '');
      }
    },

    handleMove(_toLayer, svgElementId) {
      let svgElement = this.svgElements.find(o => o.domId === svgElementId);
      let svgElementType = svgElement.type;

      if (svgElementType === 'baseMap') {
        // 如果是底图 提示不可操作
        this.$message.warn('底图只能置于最底层！');
        return false;
      }
      try {
        let self = this;
        let element = SVG.get(svgElementId);
        let index = element.attr('z-index');
        let codeObj = '';
        let ind = '';

        /* 根据元素id找到元素Dom */
        self.svgElementDomList[index].map(function(v, i) {
          if (v.svgElementId == svgElementId) {
            codeObj = v;
            ind = i;
          }
        });
        if (_toLayer === 'top') {
          self.svgElementDomList[index].splice(ind, 1); // 删除旧的层级元素dom
          self.svgElementDomList[index].push(codeObj);
        }
        if (_toLayer === 'bottom') {
          self.svgElementDomList[index].splice(ind, 1); // 删除旧的层级元素dom
          self.svgElementDomList[index].unshift(codeObj);
        }
        // 下移该元素不能为数组的第一个
        if (_toLayer === 'next' && ind > 0) {
          self.svgElementDomList[index].splice(ind, 1);
          self.svgElementDomList[index].splice(ind - 1, 0, codeObj);
        }
        if (_toLayer === 'pre' && ind < self.svgElementDomList[index].length - 1) {
          self.svgElementDomList[index].splice(ind, 1);
          self.svgElementDomList[index].splice(parseInt(ind) + 1, 0, codeObj);
        }
        this.upDateSvgDom(); // 重新排列渲染
        this.$message.success('操作成功！');
      } catch (err) {
        this.$message.error('操作失败！');
      }
    },

    handleCreateElement(elementType) {
      this.chooseDecive();
      if (elementType === 'image') {
        this.isShowImages = true;
        this.svgElementSiteStatus = false;
        this.svgElementName = '图片选择';
        this.getElementImgList('nomal');
      } else {
        if (this.$refs.configForm) {
          this.$refs.configForm.multiple = false;
        }
        this.isShowImages = false;
        this.svgElementSiteStatus = true;
        this.handleAdd(elementType);
      }
    },

    handleCreateCom(item) {
      this.comElement = item;
      this.handleCreateElement('com');
    },

    /**
     * 获取元素图片列表
     */
    getElementImgList(_type, status) {
      let self = this;
      getEUUrlList()
        .then(res => {
          if (res.status === 'complete') {
            let arr = [];
            res.resultData.map((v, index) => {
              arr.push({
                src: serverConfig.IMG_BASE_URL + v.elementUrl,
                id: v.id,
                type: _type,
                pointStatus: status
              });
            });
            self.imageElements = arr;
          }
        })
        .catch(() => {
          this.$message.error('系统异常,请重试!');
        });
    },
    setSvgElementAttributeNew(data) {
      if (this.svgElementAttributeNew?.domId)
        this.svgElementAttributeObj[
          this.svgElementAttributeNew?.domId
        ] = this.svgElementAttributeNew;
      this.svgElementAttributeNew = data;
    },
    /**
     * 展示元素属性配置列表
     */
    showSvgElementDialog(type) {
      if (
        !this.svgElementId ||
        this.svgElementId === this.svgBgImgId ||
        this.svgElementId === 'grid'
      ) {
        this.$message.info('请选择需要操作的元素！');
        return false;
      }
      this.isShowImages = false;
      if (type === 'new') {
        this.svgElementSiteStatus = true;
        return false;
      }
      this.svgElementSiteStatus = !this.svgElementSiteStatus;
      this.chooseDecive();
    },

    /**
     *  图片元素弹框
     */
    showImageElement() {
      this.showImgElement = true;
    },

    hideImageElement() {
      this.showImgElement = false;
    },

    /**
     * 展示元素图片列表
     */
    showSvgElementImgDialog() {
      this.isShowImages = !this.isShowImages;
      if (this.isShowImages) {
        this.getElementImgList('nomal');
        this.chooseDecive();
      }
    },

    /**
     * 控制网格显示
     */
    toggleGuide(isShowGuide) {
      if (isShowGuide) {
        if (!this.svgElementDomList[1]) {
          this.setGrid('block');
          this.upDateSvgDom(); // 按照层级更新元素
          return false;
        }
        document.getElementById('grid').style.display = 'block';
      } else {
        document.getElementById('grid').style.display = 'none';
      }
    },

    /**
     * svg添加底图
     */
    svgAddBgImg(svgBgImgPre) {
      let self = this;
      this.svgDraw.image(svgBgImgPre).loaded(function(loader) {
        // this.size(loader.width, loader.height);
        this.size('100%', '100%');
        this.attr('id', self.svgBgImgId);
        this.attr('z-index', '0');
        this.click(() => {
          self.monitorSvgClickEvent(this, 'baseMap');
        });
        let obj = {};
        obj.svgElementId = self.svgBgImgId;
        obj.svgElementType = 'baseMap';
        if (!self.svgElementDomList[0]) self.svgElementDomList[0] = [];
        self.svgElementDomList[0].push(obj); // 存储元素的DOM
        self.setSvgElementAttributeNew(
          JSON.parse(JSON.stringify(self.svgElementAttributeTemplate))
        );
        self.svgElementAttributeObj[self.svgBgImgId] = JSON.parse(
          JSON.stringify(self.svgElementAttributeNew)
        );
        self.upDateSvgDom(); // 按照层级更新元素
      });
      self.svgElements.push({ domId: self.svgBgImgId, type: 'baseMap' });
    },

    /**
     * 确认底图或者图标是否删除
     * @param id
     */
    delectBaseMapOrIconMsg(id, type) {
      this.$confirm({
        title: '此操作将删除该文件, 是否继续?',
        content: '',
        okText: '删除',
        cancelText: '取消',
        onOk: () => {
          this.delectBaseMapOrIcon(id, type);
        },
        onCancel: () => {}
      });
    },

    /**
     *  添加图片元素
     */
    addImgElements(_imgSrc) {
      let self = this;
      let params = {
        url: _imgSrc
      };
      addEUSvgSrc(params)
        .then(res => {
          if (res.status === 'complete') {
            self.imageElements.push({
              src: serverConfig.IMG_BASE_URL + _imgSrc,
              id: res.resultData
            });
            this.$message.success('添加成功');
          }
        })
        .then(() => {
          self.hideImageElement();
        })
        .catch(() => {
          this.$message.error('系统异常,请重试!');
        });
    },

    /**
     * 删除底图或者图标
     */
    delectBaseMapOrIcon(id, type) {
      updateSvgSrc(id)
        .then(res => {
          if (res.status === 'complete') {
            if (type === 'elementImg') {
              // 元素图片
              this.imageElements.forEach((v, index) => {
                if (v.id === id) {
                  this.imageElements.splice(index, 1);
                }
              });
            }

            if (type === 'baseMap') {
              // 底图
              this.imageHistory.forEach((v, index) => {
                if (v.id === id) {
                  this.imageHistory.splice(index, 1);
                }
              });
            }
            this.$message.success('删除成功');
          }
        })
        .catch(() => {
          this.$message.error('系统异常,请重试!');
        });
    },

    /**
     * 选择图片元素
     */
    chooseImgElementThis(_imgSrc, _type) {
      if (_type === 'min') {
        this.svgElementAttributeNew.codeElementObj.minImgUrl = _imgSrc;
        this.isShowImages = false;
        return false;
      }
      if (_type === 'max') {
        this.svgElementAttributeNew.codeElementObj.maxImgUrl = _imgSrc;
        this.isShowImages = false;
        return false;
      }
      this.isShowImages = false;
      this.svgElementSiteStatus = true;
      this.imageElementsSrc = _imgSrc;
      this.handleAdd('img'); // 添加图片
    },

    /**
     * 最大值最小值对应图片
     */
    chooseValueImg(_type, status) {
      this.isShowImages = true;
      this.getElementImgList(_type, status);
    },

    /**
     * 选择监测量
     */
    choosePoint(_index, flag = false) {
      this.pointVisible = true;
      this.multiple = flag;
      this.svgElementAttributeNew.hoverCodeIndex = _index ? _index : '';
    },

    /**
     * 监测量选择回调函数
     * @param point  // 选择的监测量
     */
    getPoint(point) {
      if (point && this.svgElementAttributeNew.hoverCodeIndex == '') {
        if (point === 'DeviceOfflineAlarm') {
          this.stateOrNumberStaus = 'state';
        } else {
          this.stateOrNumberStaus = 'number';
        }
        let newObj = {
          codeId: this.multiple
            ? `${this.svgElementAttributeNew.codeElementObj.codeId},${point.pointName}`
            : point.pointName,
          relationPoint: this.multiple
            ? this.svgElementAttributeNew.codeElementObj.relationPoint
            : point.pointMemo,
          dataType: point.dataType,
          dataTypeName: point.dataTypeName,
          minValue: point.minValue || point.minValue == 0 ? point.minValue : 'null',
          maxValue: point.maxValue || point.maxValue == 0 ? point.maxValue : 'null',
          maxImgUrl: this.imageElementsSrc,
          minImgUrl: this.imageElementsSrc,
          pointUnit: point.pointUnit ? point.pointUnit : '',
          svgElementType: this.svgElementType
        };
        this.svgElementAttributeNew.codeElementObj = newObj;
      } else {
        let newObj = {
          codeId: point.pointName,
          relationPoint: point.pointMemo,
          minValue: point.minValue || point.minValue == 0 ? point.minValue : 'null',
          maxValue: point.maxValue || point.maxValue == 0 ? point.maxValue : 'null',
          pointUnit: point.pointUnit ? point.pointUnit : '',
          svgElementType: this.svgElementType
        };
        this.svgElementAttributeNew.hoverCodeList[
          this.svgElementAttributeNew.hoverCodeIndex - 1
        ] = newObj;
        this.svgElementAttributeNew.hoverCodeIndex = '';
      }
      this.pointVisible = false; // 关闭点表查询界面
    },

    /**
     * 删除关联的监测量
     */
    deleteRelationPoint() {
      this.svgElementAttributeNew.codeElementObj = {};
    },

    /**
     * 组态另存
     */
    async saveSvgToOtherName() {
      if (!this.saveToOtherName) {
        this.$message.error('组态名称不能为空');
        return false;
      }
      await this.cancelMultiSelect();
      this.elementUnbindEvt(); // 清除元素绑定事件
      let params = this.dealSvgSaveData();
      params.svgName = this.saveToOtherName;
      this.confirmSaveLoading = true;
      addDevicePhSvg(params)
        .then(res => {
          this.confirmSaveLoading = false;
          if (res.status === 'complete') {
            this.saveToOther = false;
            this.$message.success('保存成功！');
            this.$emit('update:pathChangeTip', false);
            this.goto({ path: '/configuration' });
          }
        })
        .catch(() => {
          this.confirmSaveLoading = false;
          this.$message.error('系统异常,请重试!');
        });
    },

    /**
     * 处理需要保存的元素
     */
    dealSvgSaveData() {
      let sendData = {};
      sendData.svgName = this.svgObj.svgName;
      sendData.type = this.svgObj.type;
      sendData.svgType = this.svgObj.svgType;
      sendData.sort = this.svgObj.svgSort;
      sendData.id = this.svgObj.id;
      sendData.pumpNum = this.svgObj.pumpNum;
      sendData.deviceNum = this.svgObj.deviceNum;
      sendData.tankFlag = this.svgObj.tankFlag;

      sendData.svgHeight = this.svgObj.svgHeight;
      sendData.svgWidth = this.svgObj.svgWidth;
      sendData.svgContent = document.getElementById(this.svgBoxId).innerHTML;
      sendData.svgIcon = this.svgIcon;
      sendData.svgThumbnail = '';
      sendData.svgDevicePoint = [];
      sendData.svgPumpPoint = [];
      sendData.svgElementsId = this.svgElementDomList;
      let svgElementAttributeObj = {};
      Object.keys(this.svgElementAttributeObj).forEach(key => {
        if (this.getSvgElementIdList().find(element => element?.svgElementId === key)) {
          svgElementAttributeObj[key] = this.svgElementAttributeObj[key];
        }
      });
      sendData.svgElementAttributeObj = svgElementAttributeObj;
      this.handleSvgElementAttributeObj(sendData.svgElementAttributeObj);
      let newObj = this.svgElementAttributeObj;
      // eslint-disable-next-line guard-for-in
      // eslint-disable-next-line guard-for-in
      // for (let key in newObj) {
      //   if (newObj[key]?.textOptionsList && newObj[key].textOptionsList[1] !== '') {
      //     if (newObj[key].codeElementObj.codeId) {
      //       // 如果关联监测量
      //       newObj[key].codeElementObj.codeId?.split(',')?.forEach(code => {
      //         sendData.svgDevicePoint.push({
      //           deviceId: newObj[key].textOptionsList?.[2],
      //           domId: key,
      //           codeId: code,
      //           dealType: newObj[key].codeElementObj.dealType,
      //           domType: newObj[key].codeElementObj.svgElementType
      //         });
      //       });
      //     }
      //   }

      //   if (newObj[key]?.callBackEvent === '2') {
      //     // 水泵监测量
      //     newObj[key].hoverCodeList.forEach(v => {
      //       if (v.codeId) {
      //         sendData.svgDevicePoint.push({
      //           deviceId: newObj[key].textOptionsList?.[2],
      //           domId: key,
      //           codeId: v.codeId,
      //           domType: v.svgElementType
      //         });
      //       }
      //     });
      //   }
      //   if (
      //     newObj[key]?.textOptionsList?.[0] === '3' &&
      //     newObj[key]?.textOptionsList?.[2]
      //   ) {
      //     // 设备名称
      //     sendData.svgDevicePoint.push({
      //       deviceId: newObj[key].textOptionsList?.[2],
      //       domId: key,
      //       domType: newObj[key].svgElementType
      //     });
      //   }
      //   if (newObj[key]?.pointStatusList?.length) {
      //     let pointStatusList = newObj[key]?.pointStatusList;
      //     // 设备多监测量
      //     pointStatusList?.forEach(point => {
      //       sendData.svgDevicePoint.push({
      //         deviceId: newObj[key].textOptionsList?.[2],
      //         codeId: point.pointName,
      //         domId: key,
      //         domType: newObj[key].svgElementType
      //       });
      //     });
      //   }
      //   if (newObj[key]?.videoCode) {
      //     sendData.svgDevicePoint.push({
      //       videoCode: newObj[key].videoCode,
      //       domId: key,
      //       videoType: newObj[key].videoType,
      //       videoName: newObj[key].videoName,
      //       domType: newObj[key].codeElementObj.svgElementType
      //     });
      //   }
      // }
      sendData.svgIcon = JSON.stringify(sendData.svgIcon);
      sendData.svgDevicePoint = JSON.stringify(sendData.svgDevicePoint);
      sendData.svgPumpPoint = JSON.stringify(sendData.svgPumpPoint);
      sendData.svgElementsId = JSON.stringify(sendData.svgElementsId);
      sendData.svgElementAttributeObj = JSON.stringify(sendData.svgElementAttributeObj);

      // 根据waterPlantId判断是修改组态还是修改泵房组态
      if (this.$route.query.waterPlantId) {
        sendData.waterPlantId = this.$route.query.waterPlantId;
        sendData.svgName = this.svgObj.svgName;
      }

      return sendData;
    },
    handleSvgElementAttributeObj(svgDataMap) {
      Object.values(svgDataMap).forEach(item => {
        this.handleSvgElementAttribute(item);
      });
    },
    handleSvgElementAttribute(data) {
      if (data.objectType) {
        if (data.svgObjectValue) {
          let curObjectTypeOptions = getElementTypeOptions(this.objectTypeList, data.objectType);
          data.svgObjectName = curObjectTypeOptions.find(
            pump => pump.value === data.svgObjectValue
          )?.label;
        }
        data.controlPointList =
          data.controlPoints?.map(pointName => {
            return {
              ...this.pointOptions.find(item => item.pointName === pointName)
            };
          }) || [];
        data.infoPointList =
          data.infoPoints?.map(pointName => {
            return {
              ...this.pointOptions.find(item => item.pointName === pointName)
            };
          }) || [];
      }
    },
    busUpdate(svgObj) {
      if (this._inactive) return;
      this.svgObj = svgObj;
      this.updateSvg();
    },
    busCreate(svgObj) {
      if (this._inactive) return;
      this.svgObj = svgObj;
      this.saveSvg();
    },
    busSave(svgObj) {
      if (this._inactive) return;
      this.svgObj = svgObj;
      this.saveToOther = true;
    },
    /**
     * 更新svg
     */
    async updateSvg() {
      if (!this.svgObj.svgName || (this.waterPlantId && !this.svgObj.svgName)) {
        this.$message.error('组态名称不能为空');
        return false;
      }

      this.elementUnbindEvt(); // 清除元素绑定事件
      if (document.getElementById('grid')) {
        try {
          // 兼容ie
          document.getElementById('grid').remove(); // 删除dom
        } catch (err) {
          document.getElementById('grid').parentNode.removeChild(document.getElementById('grid'));
        }
      } // 删除网格
      await this.cancelMultiSelect();
      this.isShowGuide = false; // 更改网格状态
      if (this.svgElementDomList[1]) delete this.svgElementDomList[1]; // 删除网格数据
      let params = this.dealSvgSaveData();
      Bus.$emit('loadingStatus', 'update', true);
      updateDevicePhSvg(params).then(res => {
        Bus.$emit('loadingStatus', 'update', false);
        if (res.status === 'complete') {
          this.$message.success('修改成功！');
          this.$emit('update:pathChangeTip', false);
          this.closePage();
        }
      });
    },

    /**
     * 保存svg
     */
    async saveSvg() {
      this.elementUnbindEvt(); // 清除绑定事件
      if (document.getElementById('grid')) {
        try {
          // 兼容ie
          document.getElementById('grid').remove(); // 删除dom
        } catch (err) {
          document.getElementById('grid').parentNode.removeChild(document.getElementById('grid'));
        }
      } // 删除网格
      await this.cancelMultiSelect();
      this.isShowGuide = false; // 更改网格状态
      if (this.svgElementDomList[1]) delete this.svgElementDomList[1]; // 删除网格数据
      let params = this.dealSvgSaveData();
      Bus.$emit('loadingStatus', 'create', true);
      addDevicePhSvg(params).then(res => {
        Bus.$emit('loadingStatus', 'create', false);
        if (res.status === 'complete') {
          this.$message.success('保存成功！');
          this.$emit('update:pathChangeTip', false);
          this.closePage();
        }
      });
    },

    chooseDecive() {
      this.textOption.optionsDevice = this.waterPlantId ? this.realDeviceData : DEVLIST;
    },

    getPointList(value) {
      if (this.waterPlantId) {
        this.realCode = value;
      }
    },

    closePage() {
      const index = this.opened.findIndex(page => page.path.includes('/configuration/edit'));
      if (index >= 0) {
        this.removeOpened(index);
      }
      // if (this.waterPlantId) {
      //   this.goto({
      //     path: '/site/configuration',
      //     query: { waterPlantId: this.$route.query.waterPlantId }
      //   });
      // } else {
      //   this.goto({ path: '/configuration' });
      // }
      this.goto({
        path: '/site/configuration',
        query: { waterPlantId: this.$route.query.waterPlantId }
      });
      // if (this.waterPlantId) {
      //   this.goto({
      //     path: '/site/configuration',
      //     query: { waterPlantId: this.$route.query.waterPlantId }
      //   });
      // } else {
      //   this.goto({ path: '/configuration' });
      // }
    }
  }
};
</script>

<style lang="less">
.svg_select_points_lt {
  cursor: nw-resize;
}

.svg_select_points_rt {
  cursor: ne-resize;
}

.svg_select_points_rb {
  cursor: se-resize;
}

.svg_select_points_lb {
  cursor: sw-resize;
}

.svg_select_points_t {
  cursor: n-resize;
}

.svg_select_points_r {
  cursor: e-resize;
}

.svg_select_points_b {
  cursor: s-resize;
}

.svg_select_points_l {
  cursor: w-resize;
}

.svg_select_points_rot {
  display: none;
  fill: #f9ffed;
  stroke: black;
  stroke-width: 1;
}

.svg_select_points_point {
  cursor: move;
}

.svg_select_boundingRect {
  pointer-events: none; /* This ons is needed if you want to deselect or drag the shape */
  fill: gray;
  stroke: black;
  stroke-width: 1;
  stroke-dasharray: 10 10;
  stroke-opacity: 0.8;
  fill-opacity: 0.1;
}

#svgBoxOut {
  width: 100%;
  height: 100%;
}
#componentSvgBoxOut {
  width: 100%;
  height: 100%;
}

.dialog-element {
  &.img .wpg-modal-wrap {
    z-index: 222;
  }

  &.element .wpg-modal-wrap {
    z-index: 111;
  }

  .ant-modal-wrap {
    position: absolute;
    top: 0;
    right: 0;
    bottom: auto;
    left: auto;
    overflow: hidden;

    .ant-modal {
      top: 0;
    }
  }

  .wpg-modal {
    position: absolute;
    right: 335px;
    top: 144px;
  }
}

.svgBox {
  box-sizing: border-box;
  // overflow: hidden;

  .svg_select_points {
    fill: #e2a123;
  }

  .selected {
    stroke: #e2a123;
    filter: drop-shadow(#e2a123 10px 0);
  }
}

.svgbox-out {
  overflow: auto;
}

.svgbox-out-hide {
  overflow: hidden;
}

.svg-element-img {
  display: flex;
  flex-wrap: wrap;

  .image-add {
    width: 49px;
    height: 50px;
    margin: 5px 0 0;
    cursor: pointer;

    .anticon {
      margin: 10px 0;
      font-size: 30px;
    }
  }

  .images-list {
    position: relative;
    float: left;
    width: 49px;
    height: 50px;
    margin: 5px;
    overflow: hidden;

    .imges-ctl,
    .imges-cho {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 99;
      display: none;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.4);

      .anticon-delete {
        position: absolute;
        top: 5px;
        right: 5px;
        color: red;
        font-weight: 600;
        cursor: pointer;
      }

      .imges-ctl-v-s {
        position: absolute;
        top: 50%;
        left: 50%;
        color: #fff;
        font-size: 18px;
        vertical-align: middle;
        transform: translate(-50%, -50%);

        .anticon {
          margin: 0 5px;
        }
      }
    }

    &:hover {
      .imges-ctl {
        display: block;

        .anticon {
          cursor: pointer;

          &:hover {
            color: #20a0ff;
          }
        }
      }

      .imges-ctl-v-s {
        .anticon {
          cursor: pointer;

          &:hover {
            color: #20a0ff !important;
          }
        }
      }
    }

    .imges-cho {
      display: block;

      .anticon {
        position: absolute;
        top: 50%;
        left: 50%;
        margin-top: -15px;
        margin-left: -15px;
        overflow: hidden;
        color: #11b95c;
        font-size: 30px;
        background: #fff;
        border-radius: 50%;
      }
    }
  }
}

.ant-upload.ant-upload-drag .ant-upload {
  padding: 0;
}

.dialog-element .ant-modal-body {
  padding: 10px 15px !important;
  overflow: hidden;
  border-top: 1px solid #ccc;
  border-bottom: 1px solid #e4e4e4;
}

.ant-popover-arrow {
  display: none;
}

.ant-popover-inner-content {
  padding: 0 !important;
}

.clickRowStyle {
  background-color: #ecf5ff !important;
}

.toolbar {
  margin-top: 10px;
  padding: 10px;
  background: #f2f2f2;

  .ant-input {
    height: 32px;
    line-height: 32px;
  }
}

.light .ant-select-selection {
  height: 32px;
  line-height: 32px;
}

.ant-select-sm .ant-select-selection__rendered {
  height: 32px;
  margin-left: 7px;
  line-height: 32px;
}

.demo-input-suffix {
  font-size: 14px;
}

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
