<template>
  <div ref="realdata" class="real-data">
    <div class="pump-title">
      <span class="pump-dev supply-text-deviate">{{ pumpName }}-{{ devName }}-{{ devId }}</span>
      <span :class="['refresh-time', 'supply-text-third', showBtns ? '' : 'oneline']">
        更新时间：{{ refreshTime || '--' }}
      </span>
      <div v-if="showBtns" class="supply-float-right tabs">
        <span
          v-for="(tab, idx) in realtimeTabs"
          :key="tab.key"
          :class="realKey === tab.key ? 'supply-text-primary' : 'supply-text-third'"
          @click="changeRealKey(tab.key)"
        >
          <i :class="['icon', idx === 0 ? 'icon-ic_list' : 'icon-ic_view_module']"></i>
          {{ tab.name }}
        </span>
      </div>
    </div>
    <div v-if="showBtns" class="module-list-wrap">
      <span
        :class="[
          'btn-item all',
          allChecked
            ? 'supply-border-primary supply-text-primary'
            : 'supply-border-border supply-text-secondary'
        ]"
        @click="setAllChecked"
      >
        全部参数
      </span>
      <i
        v-show="btnStatus"
        class="icon icon-ic_keyboard_arrow_left supply-text-secondary"
        @click="leftmove"
      ></i>
      <div ref="btnWrapper" class="btn-wrapper">
        <div
          ref="pointWrapper"
          class="point-wrapper supply-clear-both"
          :style="{ width: itemWidth * 2 - 200 + 'px', ...btnClass }"
        >
          <span
            v-for="(btn, idx) in btnList"
            :key="btn.value"
            :class="[
              'btn-item',
              btn.checked
                ? 'supply-border-primary supply-text-primary'
                : 'supply-border-border supply-text-secondary'
            ]"
            :style="{ marginRight: idx === btnList.length - 1 ? '0' : '8px' }"
            @click="handlePoints(idx, btn.checked)"
          >
            {{ btn.label }}
          </span>
        </div>
      </div>
      <i
        v-show="btnStatus"
        class="icon icon-ic_keyboard_arrow_right supply-text-secondary"
        @click="rightmove"
      ></i>
    </div>

    <div v-if="realKey === 1" v-resize="resize" class="data-box">
      <div class="table-wrapper">
        <w-config-provider>
          <template v-if="realData.length <= 0" #renderEmpty>
            <div class="no-real">
              <w-empty></w-empty>
            </div>
          </template>
          <w-table
            :columns="showBtns ? columns1 : columns"
            :class="status === '0' ? 'realDataTable' : ''"
            :data-source="realData"
            :pagination="false"
            :scroll="{ y: scrollY }"
            :customRow="customRow"
            :rowClassName="
              record => (record.code === activePoint.code ? 'ant-table-row-selected' : '')
            "
            :rowKey="record => record.code"
          >
            <template slot="pv" slot-scope="text, record">
              <span
                v-if="record.type === 'real' || record.type === 'word'"
                :class="
                  (record.max && Number(text) > Number(record.max)) ||
                  (record.min && Number(text) < Number(record.min))
                    ? 'supply-text-warning'
                    : ''
                "
                >{{ text || '--' }}</span
              >
              <i v-if="record.type === 'bool'" :class="'icon ic-bool' + (text || '0')"></i>
              <i v-if="record.type === 'alarm'" :class="'icon ic-alarm' + (text || '0')"></i>
            </template>
            <template slot="datetime" slot-scope="text, record">
              <span class="dateTime"> {{ record.date + ' ' + text }} </span>
            </template>
            <template slot="action" slot-scope="text, record">
              <a type="link" @click.stop="handleChange(record)" title="修改上下限值">编辑</a>
            </template>
          </w-table>
        </w-config-provider>
      </div>
      <div class="charts">
        <div :class="['current', showBtns ? '' : 'heightAll']">
          <div class="supply-text-deviate title supply-bg-bg-card-dark">
            {{ activePoint.name ? activePoint.name + '-' : '' }}近30min变化曲线
            <div
              v-if="!showBtns"
              class="more-btn supply-float-right supply-text-primary"
              @click="gotoPage('real')"
            >
              实时数据
              <i class="icon icon-ic_chevron_right_more"></i>
            </div>
          </div>
          <div class="chart-wrapper">
            <div v-if="currentStatus === 0" class="no-msg">
              <w-empty :id="'currentNo'" :size="'small'"></w-empty>
            </div>
            <line-chart
              v-else
              :chart-id="'realChart'"
              :darkTheme="'light'"
              :option="currentOption"
            ></line-chart>
            <div v-if="currentStatus !== 0" class="chart-tip">
              <div class="tip-detail">
                <span class="supply-bg-primary rect"></span>
                <span class="supply-text-deviate">{{ activePoint.name }}</span>
              </div>
              <div class="tip-detail">
                <span class="supply-text-warning line">----</span>
                <span class="supply-text-deviate">最大值</span>
              </div>
              <div class="tip-detail">
                <span class="supply-text-danger line">----</span>
                <span class="supply-text-deviate">最小值</span>
              </div>
            </div>
          </div>
        </div>
        <div v-if="activePoint.type === 'alarm' && showBtns" class="alarm">
          <div class="supply-text-deviate title supply-bg-bg-card-dark">
            {{ activePoint.name || '' }}-运维知识
          </div>
          <div class="operate-wrapper">
            <w-tabs default-active-key="1" @change="callback">
              <w-tab-pane
                v-for="a in alarmKnowledgeData"
                :key="a.id"
                :tab="`${a.knowledgeName || '--'}${a.version || '--'}`"
              >
                <div class="operate-item-content" v-html="a.knowledgeContent"></div>
              </w-tab-pane>
            </w-tabs>
          </div>
        </div>
        <div v-if="activePoint.type !== 'alarm' && showBtns" class="history">
          <div class="supply-text-deviate title supply-bg-bg-card-dark">
            {{ activePoint.name ? activePoint.name + '-' : '' }}历史数据
            <div
              class="more-btn supply-float-right supply-text-primary"
              @click="gotoPage('history')"
            >
              更多
              <i class="icon icon-ic_chevron_right_more"></i>
            </div>
            <div
              class="tabs supply-float-right"
              :style="{ marginRight: activePoint.type === 'bool' ? '35%' : '20%' }"
            >
              <w-tabs v-model="historyTabKey" size="small">
                <w-tab-pane v-for="t in historyTabs[activePoint.type]" :key="t.key" :tab="t.name" />
              </w-tabs>
            </div>
          </div>
          <div class="chart-wrapper">
            <div v-if="historyStatus === 0" class="no-msg">
              <w-empty :id="'history'" :size="'small'"></w-empty>
            </div>
            <line-chart
              v-else-if="activePoint.type === 'real' || activePoint.type === 'word'"
              :chart-id="'historyChart'"
              :darkTheme="'light'"
              :option="historyOption"
            ></line-chart>
            <bar-chart
              v-else-if="activePoint.type === 'bool' && historyBarOption.series.length > 0"
              :chart-id="'historyBoolChart'"
              :darkTheme="'light'"
              :option="historyBarOption"
            ></bar-chart>
            <div v-if="historyStatus !== 0 && activePoint.type !== 'bool'" class="chart-tip">
              <div class="tip-detail">
                <span class="supply-bg-primary rect"></span>
                <span class="supply-text-deviate">{{ activePoint.name }}</span>
              </div>
              <div class="tip-detail">
                <span class="supply-text-warning line">----</span>
                <span class="supply-text-deviate">最大值</span>
              </div>
              <div class="tip-detail">
                <span class="supply-text-danger line">----</span>
                <span class="supply-text-deviate">最小值</span>
              </div>
            </div>
            <div v-if="activePoint.type === 'bool'" class="legends supply-text-third">
              <i class="icon state2"></i> 变频运行 <i class="icon state1"></i> 工频运行
              <i class="icon state4"></i> 离线 <i class="icon state3"></i> 故障
              <i class="icon state0"></i> 停止
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="realKey === 2" class="show-box">
      <div class="desc supply-text-secondary">
        状态图例：当前时刻高于上限值
        <i class="icon ic-upvalue"></i>
        当前时刻低于下限值
        <i class="icon ic-downvalue"></i>
      </div>
      <div class="cards">
        <div v-if="realList.length <= 0" class="no-msg supply-text-secondary">
          <w-empty></w-empty>
        </div>
        <template v-for="r in realList">
          <div
            v-if="realList.length > 0"
            :key="r.code"
            class="card-item supply-float-left  supply-shadow  supply-bg-bg-card-light"
          >
            <div class="name supply-text-third">
              {{ r.name }}
              <i :class="['icon', iconCls(r.pv, r.min, r.max)]"></i>
            </div>
            <div class="val">
              <span class="num supply-text-main">{{ r.pv || '--' }}</span>
              <span class="unit supply-text-secondary">{{ r.unit }}</span>
            </div>
            <div class="min supply-text-main">下限值: {{ r.min >= 0 ? r.min : '--' }}</div>
            <div class="max supply-text-main">上限值: {{ r.max >= 0 ? r.max : '--' }}</div>
            <div class="goto-btn" @click.stop="handleChange(r)">
              <w-popover title="Title">
                <template slot="content">
                  <span class="supply-text-secondary">修改上下限值</span>
                </template>
                <i
                  class="supply-text-xl icon icon-ic_border_color supply-text-primary change-val"
                  @click.stop="handleChange(r)"
                ></i>
              </w-popover>
            </div>
          </div>
        </template>
      </div>
    </div>

    <w-modal v-if="setModalShow" v-model="setModalShow" title="编辑上下限值" :footer="false">
      <div class="modal-form">
        <w-form
          :form="form"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 12 }"
          class="query-form"
          @submit="handleSumbit"
        >
          <w-form-item label="监测量名称">
            <w-input autocomplete="off" :value="modalData.name" disabled />
          </w-form-item>
          <w-form-item v-if="modalData.type !== 'bool'" label="上限值">
            <w-input-number
              v-decorator.trim="[
                'maxValue',
                {
                  initialValue: modalData.max,
                  rules: [
                    {
                      required: true,
                      message: '请输入'
                    },
                    {
                      validator: (obj, val) => {
                        let num = this.form.getFieldValue('minValue') || 0;
                        return val > num;
                      },
                      message: '应大于下限值'
                    }
                  ]
                }
              ]"
              autocomplete="off"
              :min="0"
            />
          </w-form-item>
          <w-form-item v-if="modalData.type !== 'bool'" label="下限值">
            <w-input-number
              v-decorator.trim="[
                'minValue',
                {
                  initialValue: modalData.min,
                  rules: [
                    {
                      required: true,
                      message: '请输入'
                    },
                    {
                      validator: (obj, val) => {
                        let num = this.form.getFieldValue('maxValue') || 0;
                        return val < num;
                      },
                      message: '应小于上限值'
                    }
                  ]
                }
              ]"
              autocomplete="off"
              :min="0"
            />
          </w-form-item>
          <w-form-item label="倍率">
            <w-input-number
              v-decorator.trim="[
                'ratio',
                {
                  initialValue: modalData.ratio,
                  rules: [
                    {
                      required: true,
                      message: '请输入'
                    }
                  ]
                }
              ]"
              autocomplete="off"
              :min="0"
            />
          </w-form-item>
          <w-form-item :wrapper-col="{ span: 24 }">
            <w-button
              class="supply-float-right"
              style="margin-left: 5px"
              @click="setModalShow = false"
              >取消</w-button
            >
            <w-button class="supply-float-right" type="primary" html-type="submit">确认</w-button>
          </w-form-item>
        </w-form>
      </div>
    </w-modal>
  </div>
</template>

<script>
import moment from 'moment';
import { colorRgb } from '@/utils/util';

import LineChart from '@/components/chart/LineChart';
import BarChart from '@/components/chart/BarChart';

import {
  getRealTable, // 实时数据表格
  getRealList, // 实时数显
  getPumpInfoByDevId,
  getGroupPointByIndustryDeviceId, // 参数
  realDataLine,
  singleServiceFigure, // 泵基带图
  getKnowledgeByCode, // 运维知识
  updatePoint
} from '@/api/runMonitor';
import { ponitByDeviceIdApi } from '@/api/analysis';
import { sysDictListByCode } from '@/api/manage';

const columns = [
  {
    title: '数据项',
    ellipsis: true,
    dataIndex: 'name'
  },
  {
    title: '当前值',
    ellipsis: true,
    dataIndex: 'pv',
    scopedSlots: { customRender: 'pv' }
  },
  {
    title: '单位',
    ellipsis: true,
    dataIndex: 'unit'
  }
];
const columns1 = [
  {
    title: '数据项',
    ellipsis: true,
    dataIndex: 'name'
  },
  {
    title: '当前值',
    ellipsis: true,
    dataIndex: 'pv',
    scopedSlots: { customRender: 'pv' }
  },
  {
    title: '单位',
    ellipsis: true,
    dataIndex: 'unit'
  },
  {
    title: '更新时间',
    ellipsis: true,
    dataIndex: 'datetime',
    scopedSlots: { customRender: 'datetime' },
    width: 180
  },
  {
    title: '操作',
    ellipsis: true,
    dataIndex: 'action',
    width: 60,
    scopedSlots: { customRender: 'action' }
  }
];

const ColorMap = {
  dark: ['#4285F4'],
  green: ['#37c2ce'],
  red: ['#ce4c1c'],
  default: ['#4285F4']
};

/* 分钟转时刻 */
let pumpsStartDate = '';
function _changeHourMinutestr(num) {
  let arr = pumpsStartDate.slice(11).split(':');
  num = Number(num) + 60 * Number(arr[0]) + Number(arr[1]);
  if (num > 1440) num -= 1440;
  if (num !== '' && num !== null) {
    let _time =
      (Math.floor(num / 60).toString().length < 2
        ? '0' + Math.floor(num / 60).toString()
        : Math.floor(num / 60).toString()) +
      ':' +
      ((num % 60).toString().length < 2 ? '0' + (num % 60).toString() : (num % 60).toString());
    return _time;
  } else {
    return '';
  }
}

export default {
  name: 'RealData',
  components: {
    LineChart,
    BarChart
  },
  props: {
    devId: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      default: ''
    },
    showBtns: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      groupDict: null,
      moment,
      move: 0,
      weekArr: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      columns,
      columns1,
      realtimeTabs: [
        {
          key: 1,
          name: '列表模式'
        },
        {
          key: 2,
          name: '数显模式'
        }
      ],
      realKey: 1, // 1-数据 2-数显
      realData: [], // 数据 表格
      realList: [], // 数显 卡片
      scrollY: 0,
      activePoint: {},
      baseOption: {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            animation: false,
            label: {
              backgroundColor: '#ccc',
              borderColor: '#aaa',
              borderWidth: 1,
              shadowBlur: 0,
              shadowOffsetX: 0,
              shadowOffsetY: 0,
              color: '#222'
            }
          },
          formatter: params => {
            return `${params[0].name}<br />${params[0].marker} ${this.activePoint.name}ooo： ${params[0].value} ${this.activePoint.unit}`;
          }
        },
        grid: [{ top: 35, right: 30, bottom: 5 }],
        legend: {
          // bottom: 10,
          // itemWidth: 8,
          // itemHeight: 8,
          // icon: 'rect',
          // textStyle: {
          //   color: '#999999',
          // },
          show: false
        },
        xAxis: [
          {
            boundaryGap: false,
            data: [],
            splitLine: {
              interval: 1
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              // rotate: 30,
              textStyle: {
                codanglor: '#999999'
              }
            }
          }
        ],
        yAxis: [
          {
            axisLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              textStyle: {
                color: '#999999'
              }
            }
          }
        ],
        series: [
          {
            smooth: true,
            symbol: 'circle',
            symbolSize: 1,
            animation: true,
            name: '',
            barWidth: 12,
            itemStyle: {
              normal: {},
              emphasis: {
                color: '#4285F4',
                borderColor: '#fff',
                borderWidth: 1,
                shadowColor: 'rgba(66, 133, 244, .3)',
                shadowBlur: 8
              }
            },
            color: this.themeColor,
            data: []
          }
        ]
      },
      currentStatus: 0,
      currentOption: null,
      historyOption: null,
      alarmList: [],
      alarmKnowledgeData: '',
      waterPumpList: [],
      devInfoList: [
        {
          name: '进口压力',
          code: 'InletPressure',
          pv: '--',
          unit: ''
        },
        {
          name: '出口压力',
          code: 'OutletPressure',
          pv: '--',
          unit: ''
        },
        {
          name: '给定压力',
          code: 'GivenPressure',
          pv: '--',
          unit: ''
        }
      ],
      setList: [],
      alarmDetails: {},
      historyTabs: {
        real: [
          {
            name: '过去24小时',
            key: 'day'
          },
          {
            name: '过去7天',
            key: 'week'
          }
        ],
        word: [
          {
            name: '过去24小时',
            key: 'day'
          },
          {
            name: '过去7天',
            key: 'week'
          }
        ],
        bool: []
      },
      historyTabKey: 'day',
      historyBarOption: {
        legend: {
          show: false
        },
        grid: [
          {
            top: 10,
            right: 20
          }
        ],
        tooltip: {
          trigger: 'item',
          // backgroundColor: 'rgba(13, 24, 38, 0.7)',
          confine: true,
          formatter: params => {
            let statusStr =
              Number(params.data.status) === 0
                ? '停止'
                : Number(params.data.status) === 1
                ? '工频运行'
                : Number(params.data.status) === 2
                ? '变频运行'
                : Number(params.data.status) === 3
                ? '故障'
                : '离线';
            let str =
              '开始时间：' +
              params.data.startDate +
              '<br/>' +
              '结束时间：' +
              params.data.endDate +
              '<br/>' +
              params.marker +
              statusStr;
            let h = Math.floor(params.value / 60);
            let m = Math.floor(params.value % 60);
            return str + ` ${h > 0 ? h + '小时' : ''}${m > 0 ? m + '分钟' : ''}`;
          }
        },
        yAxis: [
          {
            type: 'category',
            name: '',
            data: []
            // axisLabel: {
            //   formatter: (val) => {
            //     let arr = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
            //     return arr[val];
            //   },
            // },
          }
        ],
        xAxis: [
          {
            type: 'value',
            axisLabel: {
              textStyle: {
                color: '#999999'
              },
              // rotate: 60,
              formatter: val => {
                let time = _changeHourMinutestr(Number(val));
                return time;
              }
            },
            axisTick: {
              show: false
            },
            min: 0,
            max: 1440,
            interval: 720
          }
        ],
        series: []
      },
      historyStatus: 0,
      timer: null,
      setTimer: null,
      devName: '',
      pumpName: '',
      btnList: [],
      allChecked: true,
      checkedList: { 1: [], 2: [] },
      btnClass: { left: '0' },
      itemWidth: '',
      btnStatus: false,
      pointCode: '',
      setModalShow: false,
      modalData: {},
      form: this.$form.createForm(this, { name: 'realDataForm' })
    };
  },
  computed: {
    refreshTime() {
      let { realData } = this;
      let time =
        realData.length > 0 ? `${realData[0].date || ''} ` + ` ${realData[0].datetime || ''}` : '';
      return time;
    },
    iconCls() {
      return (pv, min, max) => {
        return Number(pv) < Number(min)
          ? 'ic-downvalue'
          : Number(pv) > Number(max)
          ? 'ic-upvalue'
          : '';
      };
    },
    themeColor: {
      get() {
        return ColorMap[this.state.theme] || ColorMap['default'];
      },
      set() {}
    }
  },
  inject: ['state'],
  watch: {
    'state.theme': {
      handler() {
        if (this.currentOption) {
          this.currentOption.series[0].areaStyle.color.colorStops = [
            {
              offset: 0,
              color: colorRgb(this.themeColor[0], 0.7) // 0% 处的颜色
            },
            {
              offset: 1,
              color: colorRgb(this.themeColor[0], 0.1) // 100% 处的颜色
            }
          ];
          this.currentOption.series[0].color = this.themeColor;
        }
        if (this.historyOption) {
          this.historyOption.series[0].areaStyle.color.colorStops = [
            {
              offset: 0,
              color: colorRgb(this.themeColor[0], 0.7) // 0% 处的颜色
            },
            {
              offset: 1,
              color: colorRgb(this.themeColor[0], 0.1) // 100% 处的颜色
            }
          ];
          this.historyOption.series[0].color = this.themeColor;
        }
      }
    },
    activePoint(val) {
      clearInterval(this.timer);
      if (val && val.code) {
        this.getChartData();
        this.timer = setInterval(() => {
          this.getChartData();
        }, 60 * 1000);
      } else {
        this.currentStatus = 0;
        this.historyStatus = 0;
      }
    },
    devId: {
      handler(val) {
        if (val) {
          if (this.showBtns) {
            this.getPointBtns();
          } else {
            this._clearInterval();
            this.getRealData('new');
            this.getRealList();
            this._setInterval();
          }
          this.getPumpInfo();
        }
      },
      immediate: true
    },
    historyTabKey(val) {
      if (val) {
        let type = this.activePoint.type;
        if (type === 'bool') {
          this.getWeekHistoryData();
        } else if (type === 'real' || type === 'word') {
          this.getRealChart(val);
        }
      }
    },
    btnList: {
      handler(val) {
        // if (val.length > 0) {
        let arr = [];
        val.forEach(b => {
          if (b.checked) arr.push(b.value);
        });
        this.allChecked = arr.length === val.length;
        this.checkedList[this.realKey] = arr;
        // }
      },
      deep: true
    },
    checkedList: {
      handler() {
        this._clearInterval();
        this.getRealData('new');
        this.getRealList();
        this._setInterval();
      },
      deep: true
    }
  },
  mounted() {
    this.$store.dispatch('dict/GetOperationType');
    if (this.showBtns) {
      this.$nextTick(() => {
        this.itemWidth = this.$refs.btnWrapper.scrollWidth - 216;
        this.leftmove();
      });
    }
  },
  activated() {
    this._setInterval();
    this.$once('hook:deactivated', () => {
      this._clearInterval();
    });
    this.$once('hook:beforeDestory', () => {
      this._clearInterval();
    });
  },
  methods: {
    /* 修改上下限值 */
    handleChange(record) {
      this.modalData = record;
      this.setModalShow = true;
    },
    /* 提交上下限 */
    handleSumbit(e) {
      e.preventDefault();
      this.form.validateFields((err, values) => {
        if (!err) {
          this.$confirm({
            title: '提示',
            content: '确认进行此操作? ',
            onOk: () => {
              let {
                devId,
                modalData: { code }
              } = this;
              let params = {
                industryDeviceId: devId,
                pointName: code,
                ...values
              };
              updatePoint(params).then(res => {
                let { status } = res;
                if (status === 'complete') {
                  this.$message.success('修改成功');
                  this.setModalShow = false;
                  this.realKey === 1 ? this.getRealData() : this.getRealList();
                  this.activePoint = { ...this.activePoint };
                }
              });
            }
          });
        }
      });
    },
    /* 数据字典 - 分组 */
    async getDict() {
      await sysDictListByCode('pumpstation_point_group_type').then(res => {
        if (res.status === 'complete') {
          this.groupDict = this.dealDict(res.resultData, 'dictCode');
        }
      });
    },
    dealDict(_data, type) {
      let obj = {};
      _data.forEach(r => {
        obj[r[type]] = r.name;
      });
      return obj;
    },
    leftmove() {
      this.btnClass = { left: '0' };
    },
    rightmove() {
      this.btnClass = { right: '0' };
    },
    getChartData() {
      let { type, code } = this.activePoint;
      if (type === 'real' || type === 'word') {
        this.historyTabKey = 'day';
        this.getRealChart('hour');
        this.getRealChart(this.historyTabKey);
      } else if (type === 'bool') {
        this.getRealChart('hour');
        this.getWeekHistoryData();
      } else if (type === 'alarm') {
        this.getRealChart('hour');
        this.getRealAlarmDetailNew(code);
      }
    },
    /* 跳转页面 */
    gotoPage(flag, code) {
      if (code) {
      } else {
        let path = flag === 'real' ? '/runMonitor/realTimeData' : '/runMonitor/historyData';
        let {
          devId,
          activePoint: { code }
        } = this;
        this.drillDown({
          path,
          query: {
            siteId: devId,
            pointCode: code
          }
        });
      }
    },
    /* 实时数显 */
    getRealList() {
      let params = {
        id: this.devId,
        types: this.checkedList[this.realKey]
      };
      getRealList(params).then(res => {
        let { status, resultData } = res;
        if (status === 'complete') {
          this.realList = resultData;
        }
      });
    },
    /* 污水厂信息 */
    getPumpInfo() {
      getPumpInfoByDevId(this.devId).then(res => {
        let { status, resultData } = res;
        if (status === 'complete') {
          let { stationName, deviceName } = resultData;
          let stationInfo = stationName.split('-');
          this.pumpName = stationInfo[stationInfo.length - 1];
          this.devName = deviceName;
        }
      });
    },
    /* 实时数据 */
    getRealData(_s) {
      let params = {
        id: this.devId,
        types: this.checkedList[this.realKey]
      };
      getRealTable(params).then(res => {
        let { status, resultData } = res;
        if (status === 'complete') {
          this.realData = resultData;
          if (_s === 'new') {
            if (!this.activePoint.type || this.activePoint.devId != this.devId) {
              this.activePoint =
                resultData.length > 0 ? { ...resultData[0], devId: this.devId } : {};
            }
          }
          let code = '';
          if (this.$route.query.pointCode) {
            if (!this.pointCode || this.pointCode != this.$route.query.pointCode) {
              code = this.$route.query.pointCode;
              this.pointCode = code;
            }
          }
          resultData.forEach(r => {
            if (code && code == r.code) {
              this.activePoint = { ...r, devId: this.devId };
            }
            this.devInfoList.map(d => {
              if (d.code === r.code) {
                d.pv = r.pv;
                d.unit = r.unit;
                return d;
              }
            });
          });
        }
        this.resize();
      });
    },
    changeRealKey(key) {
      this.realKey = key;
      this.getPointBtns();
    },
    /* 修改参数 */
    handlePoints(idx, checked) {
      this.btnList[idx].checked = !checked;
    },
    setAllChecked() {
      this.allChecked = !this.allChecked;
      this.btnList.forEach(d => {
        d.checked = this.allChecked;
      });
    },
    /* 表头参数 */
    async getPointBtns() {
      if (!this.groupDict) await this.getDict();

      let pageCode = this.realKey === 1 ? 'real_page' : 'real_num_page';
      let params = {
        industryDeviceIds: [this.devId],
        pageCode
      };
      let { status, resultData } = await ponitByDeviceIdApi(params);
      if (status === 'complete') {
        let list = this.dealPointData(resultData);
        if (this.btnList.length) {
          this.btnList.forEach(item => {
            let idx = list.findIndex(it => it.value === item.value);
            if (idx > -1) {
              list[idx].checked = item.checked;
            }
          });
        }
        this.btnList = list;
        this.btnStatus = false;
        if (this.btnList.length * 82 > this.itemWidth) this.btnStatus = true;
      }
    },
    dealPointData(data) {
      if (this.checkedList[this.realKey].length <= 0 || this.allChecked) {
        this.allChecked = true;
        let _data = data.map(d => {
          return {
            value: d.pointGroupCode,
            label: this.groupDict[d.pointGroupCode],
            checked: true
          };
        });
        return _data;
      } else {
        let _data = data.map(d => {
          d.checked = this.checkedList[this.realKey].indexOf(d.value) > -1;
          return { value: d.pointGroupCode, label: this.groupDict[d.pointGroupCode] };
        });
        return _data;
      }
    },
    /* 点击表格 */
    customRow(record, idx) {
      return {
        on: {
          click: e => {
            this.activePoint = { ...record, devId: this.devId };
          }
        }
      };
    },
    /* 报警详情 */
    getRealAlarmDetailNew(code) {
      getKnowledgeByCode(code).then(res => {
        let { status, resultData } = res;
        if (status === 'complete') {
          this.alarmKnowledgeData = resultData || '';
        }
      });
    },
    /* 重置表格高度 */
    resize() {
      if (this.$refs.realdata) {
        let boxH = this.$refs.realdata.offsetHeight;
        this.scrollY = boxH - 130;
      }
    },
    /* 判断是否是数字 */
    isNumber(val) {
      let regPos = /^\d+(\.\d+)?$/; // 非负浮点数
      let regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/; // 负浮点数
      if (regPos.test(val) || regNeg.test(val)) {
        return true;
      } else {
        return false;
      }
    },
    /* 实时数据chart */
    getRealChart(_key) {
      let { type, code, name } = this.activePoint;
      let params = {
        deviceId: this.devId,
        code,
        type: _key
      };
      realDataLine(params).then(res => {
        if (_key === 'hour') {
          this.currentStatus = 0;
        } else if (type === 'real' || type === 'word') {
          this.historyStatus = 0;
        }
        let {
          status,
          resultData: { data, max, min, isStage }
        } = res;
        if (status === 'complete') {
          let arr = [];
          let sData = [];
          data.forEach(r => {
            if (_key === 'hour') {
              arr.push(r.dateTime.split(' ')[1]);
            } else if (_key === 'day') {
              arr.push(r.dateTime.split(' ')[1]);
            } else {
              arr.push(r.dateTime.split(' ')[0]);
            }
            sData.push(r.pv);
          });
          this.baseOption.series[0].areaStyle = {
            opacity: 0.5,
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: colorRgb(this.themeColor[0], 0.7) // 0% 处的颜色
                },
                {
                  offset: 1,
                  color: colorRgb(this.themeColor[0], 0.1) // 100% 处的颜色
                }
              ]
            }
          };
          let option = JSON.parse(JSON.stringify(this.baseOption));
          option.xAxis[0].data = arr;
          option.series[0].data = sData;
          let markLineData = [];
          if (type !== 'bool') {
            if (this.isNumber(max)) {
              markLineData.push({
                type: 'max',
                yAxis: max,
                label: { color: '#f64357' },
                lineStyle: { color: '#f64357' }
              });
            }
            if (this.isNumber(min)) {
              markLineData.push({
                type: 'min',
                yAxis: min,
                label: { color: '#f59f00' },
                lineStyle: { color: '#f59f00' }
              });
            }
          }
          option.series[0].markLine = {
            lineStyle: {
              type: 'dashed'
            },
            data: markLineData
          };
          option.series[0].name = name;
          option.series[0].step = isStage ? 'start' : false;
          if (type === 'bool') {
            option.series[0].step = 'start';
            option.series[0].smooth = false;
            option.yAxis[0].splitNumber = 1;
            // option.yAxis[0].splitLine = {show: false};
          } else {
            option.yAxis[0].splitNumber = 5;
          }
          if (isStage && type !== 'bool') {
            option.series[0].markPoint = {
              data: [
                { type: 'max', name: '最大值' },
                { type: 'min', name: '最小值' }
              ]
            };
            option.series[0].type = 'bar';
          } else {
            option.series[0].markPoint = {
              data: []
            };
            option.series[0].type = 'line';
          }
          if (_key === 'hour') {
            this.currentStatus = 1;
            this.currentOption = JSON.parse(JSON.stringify(option));
          } else if (type === 'real' || type === 'word') {
            this.historyStatus = 1;
            this.historyOption = JSON.parse(JSON.stringify(option));
            // this.historyOption.series[0].color = '#62DAAB';
          }
        }
      });
    },
    /* 历史数据 bool chart */
    getWeekHistoryData() {
      if (!this.showBtns) return false;
      let {
        devId,
        activePoint: { code }
      } = this;
      let params = {
        deviceId: devId,
        code
      };
      singleServiceFigure(params).then(res => {
        let { status, resultData } = res;
        // 停止 工频 变频 故障 离线
        let colors = ['#C0C0C0', '#0ACC9D', '#4183F1', '#FFBF00', '#F45668'];
        if (status === 'complete') {
          let sData = [];
          let yData = [];
          if (resultData.length > 0) {
            resultData.map((r, idx) => {
              yData.push(r.name);
              r.data.map((d, i) => {
                if (i === 0) {
                  pumpsStartDate = d.startTime;
                }
                if (sData[i] && sData[i].name) {
                  sData[i].data.map((item, idx) => {
                    if (!item) {
                      item = {
                        value: 0
                      };
                    }
                  });
                  sData[i].data[idx] = {
                    value: d.time,
                    status: d.status,
                    startDate: d.startTime,
                    endDate: d.endTime,
                    itemStyle: {
                      normal: {
                        barBorderRadius: 0,
                        color: colors[d.status]
                      },
                      emphasis: {
                        color: colors[d.status]
                      }
                    }
                  };
                } else {
                  let temp = [];
                  if (idx > 0) {
                    for (let i = 0; i < idx; i++) {
                      temp[i] = { value: 0 };
                    }
                  }
                  temp[idx] = {
                    value: d.time,
                    status: d.status,
                    startDate: d.startTime,
                    endDate: d.endTime,
                    itemStyle: {
                      normal: {
                        barBorderRadius: 0,
                        color: colors[d.status]
                      },
                      emphasis: {
                        color: colors[d.status]
                      }
                    }
                  };
                  sData[i] = {
                    name: r.name,
                    type: 'bar',
                    stack: 'pump',
                    barWidth: 12,
                    data: [...temp],
                    color: colors
                  };
                }
              });
            });
          }
          this.historyBarOption.series = sData;
          this.historyBarOption.yAxis[0].data = yData;
          this.historyStatus = 1;
        } else {
          this.historyBarOption.series = [];
        }
      });
    },
    _clearInterval() {
      if (this.setTimer) clearInterval(this.setTimer);
      if (this.timer) clearInterval(this.timer);
    },
    _setInterval() {
      let that = this;
      this.setTimer = setInterval(() => {
        if (that.showBtns) {
          that.getPointBtns();
        }
        if (that.realKey == 1 && !that.showBtns) that.getRealData();
        if (that.realKey == 2) that.getRealList();
      }, 5 * 1000);
    }
  }
};
</script>

<style lang="less" scoped>
.real-data {
  position: relative;
  flex: 3;
  height: 100%;
  .icon {
    display: inline-block;
    width: 14px;
    height: 14px;
    &.ic-bool0 {
      background: url(../../../assets/images/default/icons/suspend_run.png) no-repeat center center;
      background-size: auto 100%;
    }
    &.ic-bool1 {
      background: url(../../../assets/images/default/icons/run.png) no-repeat center center;
      background-size: auto 100%;
    }
    &.ic-alarm0 {
      background: url(../../../assets/images/default/icons/not_warning.png) no-repeat center center;
      background-size: auto 100%;
    }
    &.ic-alarm1 {
      background: url(../../../assets/images/default/icons/warning.png) no-repeat center center;
      background-size: auto 100%;
    }
    &.ic-upvalue {
      // 升值
      background: url(../../../assets/images/default/icons/rising.png) no-repeat center center;
      background-size: auto 100%;
    }
    &.ic-downvalue {
      // 降值
      background: url(../../../assets/images/default/icons/rising-down.png) no-repeat center center;
      background-size: auto 100%;
    }
  }
  .no-msg {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    border-radius: 4px;
  }
  .pump-title {
    padding: 6px 0 6px 0;
    .refresh-time {
      font-size: 12px;
      &.oneline {
        display: block;
        padding-left: 14px;
      }
    }
    .pump-dev {
      padding: 0 10px 0 14px;
    }
    .tabs {
      span {
        margin-right: 20px;
        cursor: pointer;
        .icon {
          position: relative;
          top: 5px;
          right: 4px;
          font-size: 24px;
        }
      }
    }
  }
  .data-box {
    display: flex;
    width: 100%;
    height: calc(100% - 90px);
    .table-wrapper {
      flex: 1;
      margin-right: 8px;
      .realDataTable /deep/ .wpg-table-tbody {
        opacity: 0.5;
      }
      .change-range {
        cursor: pointer;
      }
      /deep/ .wpg-table-row-cell-ellipsis {
        position: relative;
        .change-val {
          position: absolute;
          top: 8px;
          cursor: pointer;
        }
      }
      .dateTime {
        position: relative;
        display: inline-block;
        width: 100%;
        min-width: 80px;
        .set-icon {
          position: absolute;
          top: -7px;
          right: 0;
          display: inline-block;
          width: 36px;
          height: 36px;
          font-size: 18px;
          line-height: 36px;
          text-align: center;
          cursor: pointer;
        }
      }

      .no-real {
        margin-top: 40%;
      }
    }
    .title {
      height: 28px;
      padding: 0 20px;
      line-height: 28px;
    }
    .alarm-wrapper {
      position: relative;
      flex: 1;
      overflow-y: auto;
      .no-data {
        position: absolute;
        top: 35%;
        left: 45%;
      }
      .title {
        text-align: center;
      }
      .detail-box {
        height: calc(100% - 28px);
        > div {
          padding: 12px;
        }
        .alarm-detail {
          height: 40%;
          margin-bottom: 10px;
          .name {
            margin-bottom: 10px;
          }
        }
        .methods {
          height: calc(60% - 10px);
          overflow-y: auto;
          > p {
            margin-bottom: 10px;
          }
          ul > li {
            padding-left: 10px;
            line-height: 25px;
          }
        }
      }
    }
    .charts {
      display: flex;
      flex: 1;
      flex-direction: column;
      .current,
      .alarm,
      .history {
        height: 50%;
        &.heightAll {
          height: 100%;
        }
        .chart-wrapper {
          display: flex;
          flex-direction: column;
          height: calc(100% - 28px);
          #realChart,
          #historyChart {
            height: calc(100% - 36px);
          }
          .chart-tip {
            display: flex;
            width: 100%;
            .tip-detail {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 33.3%;
              font-size: 12px;
              .line {
                margin-right: 3px;
              }
              .rect {
                width: 8px;
                height: 8px;
                margin-right: 3px;
              }
            }
          }
        }
        .more-btn {
          cursor: pointer;
          .icon {
            position: relative;
            top: 4px;
            font-size: 22px;
          }
        }
        .legends {
          margin: 0 auto;
          .icon {
            display: inline-block;
            width: 10px;
            height: 10px;
            margin-left: 16px;
            &.state0 {
              background: #c0c0c0;
            }
            &.state1 {
              background: #0acc9d;
            }
            &.state2 {
              background: #4183f1;
            }
            &.state3 {
              background: #ffbf00;
            }
            &.state4 {
              background: #f45668;
            }
          }
        }
      }
      .current,
      .alarm,
      .history {
        .title {
          height: 40px;
          font-size: 12px;
          line-height: 40px;
        }
      }
      .alarm {
        .operate-wrapper {
          padding: 0 20px;
        }
      }
      .history {
        /deep/ .wpg-tabs-bar {
          width: 100%;
          margin: 0;
        }
        /deep/ .wpg-tabs .wpg-tabs-small-bar .wpg-tabs-tab {
          padding: 10px 6px;
          font-size: 12px;
        }
      }
    }
  }
  .show-box {
    height: calc(100% - 90px);
    > .desc {
      height: 28px;
      line-height: 28px;
      text-align: center;
      .icon {
        width: 20px;
        height: 20px;
      }
    }
    .cards {
      height: calc(100% - 28px);
      padding: 10px;
      overflow-y: auto;
      .card-item {
        position: relative;
        width: calc(25% - 6px);
        margin: 0 8px 8px 0;
        padding: 10px 20px;
        border-radius: 8px;
        &:nth-child(4n) {
          margin-right: 0;
        }
        .val {
          margin-bottom: 10px;
          text-align: center;
          .num {
            font-size: 32px;
            font-family: Digifaw, sans-serif;
          }
        }
        .max,
        .min {
          display: inline-block;
          width: 50%;
        }
        .goto-btn {
          position: absolute;
          right: 25px;
          bottom: 0;
          font-size: 24px;
          .icon.supply-text-primary {
            cursor: pointer;
          }
        }
      }
    }
  }
}
.module-list-wrap {
  width: 100%;
  overflow: hidden;
  .btn-wrapper {
    position: relative;
    display: inline-block;
    width: calc(100% - 240px);
    height: 30px;
    overflow: hidden;
    .point-wrapper {
      position: absolute;
    }
  }
  .btn-item {
    float: left;
    margin: 0 8px 8px 0;
    padding: 2px 9px;
    font-size: 12px;
    border-style: solid;
    border-width: 1px;
    border-radius: 4px;
    cursor: pointer;
    &.all {
      margin-left: 14px;
    }
  }
  .icon {
    display: inline-block;
    width: 30px;
    font-size: 24px;
    vertical-align: top;
  }
}
.module-list li {
  display: inline-block;
  width: 100px;
  font-style: normal;
}
.modal-form {
  .wpg-input-number {
    width: 100%;
  }
}
</style>
