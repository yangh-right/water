<!--
 * @Description:
 * @Author: limz
 * @Date: 2021-07-27 13:58:51
 * @LastEditTime: 2024-10-29 19:10:12
 * @LastEditors: wangyr
-->
<template>
  <div id="reportTable" class="report-table">
    <table-search>
      <w-row slot="form" :gutter="20" class="report-table-search">
        <w-form-model ref="form" :model="form">
          <w-col v-if="false" :span="3">
            <w-form-model-item label="" prop="timeType">
              <w-radio-group
                class="supply-whitespace-nowrap"
                v-model="timeType"
                button-style="solid"
              >
                <template v-for="type in item.typeList">
                  <w-radio-button :key="type.value" :value="type.value">
                    {{ type.label }}
                  </w-radio-button>
                </template>
              </w-radio-group>
            </w-form-model-item>
          </w-col>
          <w-col :span="4">
            <w-form-model-item label="选择污水厂">
              <factory-select
                v-model="form.waterPlantId"
                autoSelect
                :showAll="!autoSelect"
              ></factory-select>
            </w-form-model-item>
          </w-col>
          <!-- <w-col :span="4" v-if="item.isShowDevice">
            <w-form-model-item>
              <w-radio-group v-model="form.dataLevel" @change="handleChange">
                <w-radio :value="-1">
                  按站点
                </w-radio>
                <w-radio :value="0">
                  按构筑物
                </w-radio>
              </w-radio-group>
            </w-form-model-item>
          </w-col>
          <w-col :span="5" v-if="form.dataLevel == '0'">
            <w-form-model-item class="select-pumps" label="选择构筑物" prop="placeIds">
              <pump-select
                class="supply-w-full"
                show-checkbox
                :replaceFields="{ label: 'title', children: 'children' }"
                v-model="form.placeIds"
                :tree-data="treeData"
                :max-tag-count="1"
                default-expand-all
              />
            </w-form-model-item>
          </w-col> -->
          <!-- <w-col :span="5" v-if="form.dataLevel == '-1'">
            <w-form-model-item class="select-pumps" label="选择站点" prop="deviceIds">
              <pump-select
                class="supply-w-full"
                show-checkbox
                :replaceFields="{ label: 'title', children: 'children' }"
                v-model="form.deviceIds"
                :tree-data="treeDataDevice"
                :max-tag-count="1"
                default-expand-all
              />
            </w-form-model-item>
          </w-col> -->
          <w-col :span="4">
            <w-form-model-item label="选择日期" prop="date">
              <w-date-picker
                v-if="timeType === 'day'"
                v-model="dateTime"
                :disabled-date="disabledDate"
                :allowClear="false"
              />
              <w-month-picker
                v-if="timeType === 'month'"
                v-model="dateTime"
                :disabled-date="disabledDate"
                :allowClear="false"
              />
              <w-year-picker
                v-if="timeType === 'year'"
                v-model="dateTime"
                :disabled-date="disabledDate"
                :allowClear="false"
              />
            </w-form-model-item>
          </w-col>
          <w-col
            style="width: fit-content;padding-right: 0"
            class="supply-ml-auto supply-float-right supply-whitespace-nowrap"
          >
            <w-form-model-item class="supply-ml-auto">
              <w-button class="supply-mx-3" @click="reset" icon="reload">重置</w-button>
              <w-button type="primary" @click="setParams" icon="search">查询</w-button>
              <return-control :path="goPath" :keep="true" :is-drill-down="true"></return-control>
            </w-form-model-item>
          </w-col>
        </w-form-model>
      </w-row>
      <div class="supply-h-full supply-flex supply-flex-col">
        <div class="btn-wrapper supply-bg-bg-card-component">
          <w-radio-group
            v-model="form.configCode"
            name="radioGroup"
            :options="item.plainOptions"
            @change="setParams"
          />
          <div class="btns supply-float-right">
            <w-tooltip>
              <template slot="title">表格行列置换</template>
              <span class="btn-item" @click="changeTable">
                <w-icon
                  :type="`ic_chart_table${tableType}`"
                  class="hover:supply-text-primary-hover"
                />
              </span>
            </w-tooltip>
            <w-tooltip>
              <template slot="title">折线图</template>
              <span class="btn-item supply-mr-2" @click="changeToChart">
                <w-icon type="ic_chart_line" class="hover:supply-text-primary-hover" />
              </span>
            </w-tooltip>
            <w-tooltip>
              <template slot="title">导出报表</template>
              <span class="btn-item" @click="download">
                <w-icon type="ic_get_app" class="hover:supply-text-primary-hover" />
              </span>
            </w-tooltip>
          </div>
        </div>
        <div
          id="reportTableCon"
          ref="reportTableCon"
          v-if="!nullDataState"
          class="report-table-con supply-bg-bg-card-component supply-flex-1 supply-overflow-hidden"
        >
          <div class="spin-wrapper">
            <w-spin class="spin" :spinning="spinning" />
          </div>
          <PaginationTable
            v-if="!isShowChart"
            class="supply-h-full"
            ref="table"
            bordered
            :columns="tableType === 1 ? columns1 : columns2"
            :pagination="false"
            rowKey="uid"
            :loading="loading"
            :data-source="tableData"
            :customRow="customRow"
            :scroll="{
              x: scrollX
            }"
            :current.sync="form.page.current"
            :total.sync="total"
            :pageSize.sync="form.page.size"
            @change="onPageChange"
          />
          <template v-else>
            <div
              :style="
                `height:calc(${
                  chartHeight ? (!index ? 1 / chartHeight + 0.03 : 1 / chartHeight - 0.01) : 0
                } * 100% )`
              "
              class="chart-wrapper__item"
              v-for="(item, index) in barOptions"
              :key="index"
            >
              <line-chart :ref="'chart' + index" :darkTheme="'light'" :option="item"></line-chart>
            </div>
          </template>
        </div>
        <div class="nullDataState" v-if="nullDataState">
          <w-empty description="暂无数据"></w-empty>
        </div>
      </div>
    </table-search>
  </div>
</template>

<script>
import uuid from '@/utils/uuid';
import * as echarts from 'echarts';
import { deepClone } from '@/utils/util';
import { bottomRows, pumpLevelName, _colors, flowPowerOption } from './data';
import { sysDictListByCode } from '@/api/manage';
import { queryList, getStructureByStationId } from '@/api/deviceManagement';
import { exportFile } from '@/utils/util';
import { axios } from '@/utils/request';
import FactorySelect from '@/components/factory-select/index.vue';
import PaginationTable from '@/components/PaginationTable/index.vue';
import LineChart from '@/components/chart/LineChart';
import PumpSelect from '@/components/Virtual/VirtualTreeSelect';
import moment from 'moment';
export const queryOrgPumpHouseDeviceTree = parameter => {
  return axios({ url: '/navTree/tree', method: 'post', data: parameter });
};
export default {
  name: 'ReportTable',
  components: {
    FactorySelect,
    PaginationTable,
    LineChart,
    PumpSelect
  },
  props: {
    item: {
      default: () => {},
      type: Object
    },
    defaultPoints: {
      default: () => [],
      type: Array
    },
    isExceptionShow: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      spinning: false,
      tableType: 2, // 1时间为表头  2设备构筑物为表头
      timeType: '', // 日报/月报,
      reportName: '',
      showPumpDeviceLevel: false,
      pumpDeviceLevelList: [],
      pumpDeviceLevel: '',
      isInitializing: false, // 添加初始化标志位
      form: {
        isOnline: '1',
        startTime: this.$moment().format('YYYY-MM-DD 00:00:00'),
        endTime: this.$moment().format('YYYY-MM-DD 23:59:59'),
        indicators: [],
        configCode: '',
        period: '1',
        placeIds: [],
        deviceIds: [],
        dataLevel: -1,
        periodUnit: 'HOURS',
        maxMinValueDateFormat: '', // 最大值最小值日期格式化
        isMaxMinDatePeriodDateFormat: false, // 是否分段格式化时间格式:如HH:00
        isPeriodDateFormat: false, // 是否分段格式化时间(表头):00:00-00:01,00-01-00:02
        periodDateFormat: 'HH:00:00', // 分段格式化时间格式时间(表头):如HH:00
        periodStartCount: null, // 分段格式化时间格式开始时间(表头):从0开始
        periodEndCount: null, // 分段格式化时间格式结束时间(表头)
        page: {
          current: 1,
          size: 20
        }
      },
      projectStatusDic: [],
      dateTime: this.$moment(),
      yyyyMMddHH00Format: 'YYYY-MM-DD HH:00',
      yyyyMMdd0000Format: 'YYYY-MM-DD 00:00',
      yyyyMMddHHFormat: 'YYYY-MM-DD HH',
      offsetDays: 86400000, // 间隔1天,如果是2天的话 86400000*2
      dateTimeDefaultWidth: '310px',
      periodType: 'HOURS,1',
      treeData: [], // 构筑物
      allpIds: [], // 构筑物
      autoSelect: true,
      allpIdsDevice: [], // 设备
      treeDataDevice: [], // 设备
      periodOptions: Object.freeze(this.item.periodOptions),
      bottomRows: Object.freeze(bottomRows),
      columns1: [],
      columns2: [],
      tableData: [],
      total: 0,
      baseTableData: [], // 原始表格数据
      loading: false,
      valueCol: false, // 值类型 行/列
      scrollX: 1700, // 表格横向滚动
      tableW: 0, // 表格宽度
      sumColumns: {
        // 合计值 只有水电量报表有, isShowSum控制
        title: '合计值',
        dataIndex: 'sum',
        width: 110,
        align: 'center',
        fixed: 'right',
        ellipsis: true,
        customRender: text => {
          return <span title={text || ''}>{text || '--'}</span>;
        }
      },
      nullDataState: false,
      // 图表
      isShowChart: false,
      chartHeight: 0,
      barOptions: [],
      disabledCurrent: null
    };
  },
  computed: {
    timeColWidth() {
      return 110;
    },
    goPath() {
      return this.$route.query && this.$route.query.page === 'cockpit'
        ? '/cockpit'
        : '/reportCenter';
    }
  },
  watch: {
    timeType(val, oVal) {
      if (val === 'day') {
        this.dateTimeDefaultWidth = '350px';
      }
      if (oVal) {
        this.dateTime = this.item.date ? this.$moment(this.item.date) : this.$moment();
        this.setParams();
      }
    },
    pumpDeviceLevel(val, oVal) {
      if (this.form.dataLevel === '0') {
        this.item.title = '构筑物';
        this.item.treeType = 'pump';
      } else {
        this.item.title = '设备';
        this.item.treeType = 'device';
      }
      // this.form.dataLevel = this.pumpDeviceLevel === pumpLevelName ? 0 : 1;
      this.setParams();
    }
  },
  created() {},
  mounted() {
    this.updateQuery();
  },
  methods: {
    // 解析带入的参数，并更新查询条件，重新请求数据
    async updateQuery() {
      this.spinning = true;
      this.isInitializing = true; // 设置初始化标志

      // 是否显示构筑物设备维度
      this.showPumpDeviceLevel = this.item.showPumpDeviceLevel || false;
      // 构筑物设备纬度默认值
      this.pumpDeviceLevel = this.item.pumpDeviceLevel || this.item.pumpDeviceLevelList[0].value;

      this.form.configCode = this.item.plainOptions?.[0]?.value || '';
      this.timeType = this.item.timeType || this.item.typeList[0].value;
      this.dateTime = this.item.date ? this.$moment(this.item.date) : this.$moment();
      this.tableW = this.$refs.reportTableCon.clientWidth - 40;

      // 使用Promise.all等待所有异步操作完成
      const promises = [this.getOrgPumpTree()];
      if (this.item.showPumpDeviceLevel) {
        promises.push(this.getOrgPumpHouseDeviceTree());
      }

      try {
        await Promise.all(promises);
        // 所有初始化完成后，调用一次setParams
        this.isInitializing = false; // 清除初始化标志
        this.setParams();
      } catch (error) {
        console.error('初始化失败:', error);
      }
    },
    /* 切换表格状态 */
    changeTable() {
      this.isShowChart = false;
      this.tableType = this.tableType === 1 ? 2 : 1;
      this.dealData();
    },
    /**
     * @description: 切换成图表
     * @return {*}
     */

    changeToChart() {
      this.isShowChart = true;
      this.dealDataToChart();
    },
    getColor(i) {
      if (i < 10) {
        return _colors[i];
      } else {
        return 'rgb(' + ((i * 80) % 255) + ',' + ((i * 100) % 255) + ',' + ((i * 60) % 255) + ')';
      }
    },
    dealDataToChart() {
      let chartData = [];
      const resultData = this.baseTableData.map((data, statIndex) => {
        let dateList = [];

        // 处理每个监测量
        data.reportPoints.forEach((point, pointIndex) => {
          if (statIndex === 0) {
            // 如果是第一个统计项，初始化图表数据结构
            if (this.valueCol) {
              // 如果有值类型（当前值、环比、同比等），为每个监测量创建一个图表
              chartData.push({
                key: point.pointName,
                unit: point.memo?.split('(')?.[1]?.split(')')?.[0] || '',
                title: point.memo,
                height: '50%',
                pointName: point.pointName,
                valueTypes: point.reportPointCalList.map(cal => cal.calName) // 记录该监测量包含的值类型
              });
            } else {
              // 如果没有值类型，只创建当前值图表
              chartData.push({
                key: point.pointName,
                unit: point.memo?.split('(')?.[1]?.split(')')?.[0] || '',
                title: point.memo,
                height: '50%',
                calName: '当前值',
                pointName: point.pointName
              });
            }
          }

          // 构建时间列表（只在第一个点时构建）
          if (pointIndex === 0) {
            if (this.valueCol) {
              // 如果有值类型，使用第一个值类型的时间数据
              point.reportPointCalList[0].reportPointDataList.forEach(value => {
                dateList.push(value.dateTime.split(' ')?.[1] || value.dateTime);
              });
            } else {
              // 如果没有值类型，使用当前值的时间数据
              point.reportPointDataList.forEach(value => {
                dateList.push(value.dateTime.split(' ')?.[1] || value.dateTime);
              });
            }
          }

          // 处理数据
          if (this.valueCol) {
            // 如果有值类型，处理每个值类型的数据
            point.reportPointCalList.forEach((cal, calIndex) => {
              const key = `${point.pointName}_${cal.calName}`;
              data[key] = cal.reportPointDataList.map(value => value.pv);
            });
          } else {
            // 如果没有值类型，只处理当前值数据
            data[point.pointName] = point.reportPointDataList.map(value => value.pv);
          }
        });

        return {
          dateList,
          ...data
        };
      });

      // 多个图表，构建图表显示option
      resultData.forEach((item, index) => {
        chartData.forEach((cItem, i) => {
          cItem.dateList = item.dateList;
          if (!cItem.data) cItem.data = [];
          if (!cItem.titleList) cItem.titleList = [];

          if (this.valueCol) {
            // 如果有值类型，为每个值类型添加数据
            cItem.valueTypes.forEach(calName => {
              const key = `${cItem.pointName}_${calName}`;
              let data = item[key] || [];
              cItem.data.push(data.map(item => item ?? ''));
              cItem.titleList.push(`${item.statName}(${calName})`);
            });
          } else {
            // 如果没有值类型，只添加当前值数据
            let data = item[cItem.key] || [];
            cItem.data.push(data.map(item => item ?? ''));
            cItem.titleList.push(item.statName);
          }
        });
      });

      this.chartHeight = chartData.length;
      let chartOptions = [];
      this.myOption = flowPowerOption;
      console.log('chartData', chartData);

      chartData.forEach(itemY => {
        let myOption = deepClone(this.myOption);
        let legend = [];

        itemY.data.map((item, i) => {
          let curLegend = itemY.titleList[i];
          legend.push(curLegend);

          myOption.xAxis[0].data = itemY.dateList.map(item => item.replace('-', '/'));

          // 最大上限值
          let limitMaxPv = this.limitMaxPv?.[itemY.pointName];
          myOption.yAxis[0].max = value => {
            return Number(limitMaxPv?.value) > value.max ? Number(limitMaxPv?.value) : value.max;
          };

          // 判断当前数据系列是否为当前值
          let isCurrentValue = curLegend.includes('(当前值)');

          let seriesItem = {
            name: curLegend,
            type: 'line',
            data: item,
            smooth: true,
            symbolSize: 5,
            lineStyle: {
              shadowBlur: 5,
              shadowColor: this.getColor(i),
              shadowOffsetY: 2.5
            },
            itemStyle: {
              color: this.getColor(i)
            }
          };

          // 只有当前值才显示警戒线
          if (limitMaxPv?.value != undefined && isCurrentValue) {
            seriesItem.markLine = {
              label: {
                position: 'end'
              },
              data: [
                {
                  silent: true,
                  lineStyle: {
                    color: 'rgba(238, 99, 99)'
                  },
                  name: limitMaxPv.name,
                  yAxis: limitMaxPv.value
                }
              ]
            };
          }

          myOption.series.push(seriesItem);
          myOption.title.text = itemY.title;
        });

        chartOptions.push(myOption);
      });

      // 给图表赋值
      this.barOptions = [...chartOptions];

      // 图表间进行关联，同时显示tooltip
      setTimeout(() => {
        let connectChart = [];
        this.barOptions.map((item, index) => {
          connectChart.push(
            this.$refs['chart' + index] ? this.$refs['chart' + index][0]?.myChart : {}
          );
        });
        echarts.connect(connectChart);
      }, 1000);
    },

    /* 导出 */
    async download() {
      // 表格时间处理参数
      this.handleExcelParam();

      let placeIds = this.dealSendData();
      let params = {
        ...this.form,
        indicators: [this.form.configCode],
        placeIds,
        isCross: this.tableType === 1
      };
      //导出excel表名
      if (this.form.dataLevel == 0) {
        this.item.title = '构筑物';
      } else {
        this.item.title = '设备';
      }
      let res = await this.item.export(params);
      let exportDate = this.dateTime.format(
        this.timeType === 'day' ? 'YYYY-MM-DD' : this.timeType === 'month' ? 'YYYY-MM' : 'YYYY'
      );
      let type = this.item.typeList.filter(t => t.value === this.timeType);
      let fileName = `${this.item.title}${this.item.exportFileName}${type[0].label}${exportDate}`;
      exportFile(res, fileName, 'xls');
    },
    /* 禁选时间 */
    disabledDate(current) {
      return current && current > this.$moment().endOf(this.timeType);
    },
    // 选择完时间 清空限制
    changePriceRangeDate() {
      this.selectPriceDate = '';
    },
    // 选择开始时间/结束时间
    calendarPriceRangeChange(date) {
      this.selectPriceDate = date[0];
    },
    handleDayReportDisabledDate(current) {
      if (current && current > this.$moment().endOf(this.timeType)) {
        return true;
      }
      if (this.selectPriceDate) {
        let formatDate = 'YYYY-MM-DD';
        let selectV = moment(this.selectPriceDate, formatDate).valueOf();
        return (
          current > moment(new Date(selectV + this.offsetDays), formatDate) ||
          current < moment(new Date(selectV - this.offsetDays), formatDate)
        );
      } else {
        return false;
      }
    },
    handleChange(e) {
      this.setParams();
    },
    /* 处理参数 */
    setParams() {
      // 如果正在初始化，则不调用getTableData
      if (this.isInitializing) {
        return;
      }
      if (this.timeType === 'day') {
        let endTimeFormat = 'YYYY-MM-DD 23:59:59';
        let today = moment().startOf('day');
        if (moment(this.dateTime).isSame(today, 'd')) {
          endTimeFormat = 'YYYY-MM-DD HH:00:00';
        }
        this.form = {
          ...this.form,
          startTime: this.dateTime.format('YYYY-MM-DD 00:00:00'),
          endTime: this.dateTime.format(endTimeFormat)
        };
        this.form.period = this.periodType.split(',')[1];
        this.form.periodUnit = this.periodType.split(',')[0];
      } else if (this.timeType === 'month') {
        this.form = {
          ...this.form,
          startTime: this.dateTime.startOf('month').format('YYYY-MM-DD 00:00:00'),
          endTime: this.dateTime.endOf('month').format('YYYY-MM-DD 23:59:59'),
          period: '1',
          periodUnit: 'DAYS'
        };
        let flag =
          this.$moment().year() === this.$moment(this.dateTime).year() &&
          this.$moment().month() === this.$moment(this.dateTime).month();
        if (flag) {
          this.form.endTime = this.$moment()
            .subtract(1, 'day')
            .format('YYYY-MM-DD 23:59:59');

          // 如果是1号，则置空
          if (this.$moment().format('DD') === '01') {
            this.form.endTime = this.$moment().format('YYYY-MM-DD 23:59:59');
            this.total = 0;
            this.baseTableData = [];
          }
        }
      } else {
        this.form = {
          ...this.form,
          startTime: this.dateTime.startOf('year').format('YYYY-MM-DD 00:00:00'),
          endTime: this.dateTime.endOf('year').format('YYYY-MM-DD 23:59:59'),
          period: '1',
          periodUnit: 'MONTHS'
        };
        if (this.$moment().year() === this.$moment(this.dateTime).year()) {
          this.form.endTime = this.$moment()
            .subtract(1, 'day')
            .format('YYYY-MM-DD 23:59:59');
          if (this.$moment().format('MMDD') === '0101') {
            this.form.endTime = this.$moment().format('YYYY-MM-DD 23:59:59');
            this.total = 0;
            this.baseTableData = [];
          }
        }
      }
      this.form.page.current = 1;
      this.getTableData();
    },
    /* 选择监测量 */
    changePoint(checkedValues) {
      if (checkedValues.length <= 0) {
        this.form.indicators = [this.item.plainOptions[0].value];
        this.$message.info('请至少选中一个监测量');
      } else {
        this.form.indicators = checkedValues;
      }
      this.setParams();
    },
    async sysDictListByCode(code, data) {
      const res = await sysDictListByCode(code);
      this[data] = res.resultData;
    },
    /* 多选搜索过滤 */
    searchFilterTreeNode(inputValue, treeNode) {
      return (
        treeNode.componentOptions.propsData.title.toLowerCase().indexOf(inputValue.toLowerCase()) >=
        0
      );
    },
    /** 组织构筑物树 */
    async getOrgPumpTree() {
      try {
        const res = await getStructureByStationId({
          waterPlantId: this.form.waterPlantId ? this.form.waterPlantId : ''
        });
        let ids = [];
        this.treeData = [
          {
            value: 'allCheck',
            key: 'allCheck',
            title: '全选',
            children: this.handleData(res.resultData, ids)
          }
        ];
        this.allpIds = ids;
        if (this.item.placeIds?.length > 0) {
          this.form.placeIds = this.item.placeIds;
        } else {
          this.form.placeIds = ['allCheck', ...this.allpIds];
        }
        // 移除这里的setParams调用，由updateQuery统一调用
      } catch (error) {
        console.error('获取构筑物树失败:', error);
        throw error;
      }
    },
    /**
     * 组织构筑物设备树
     */
    async getOrgPumpHouseDeviceTree() {
      try {
        // fullTree==>false过滤没有设备的节点
        const res = await queryList({
          waterPlantId: this.form.waterPlantId ? this.form.waterPlantId : '',
          page: {
            size: 9999,
            current: 1,
            total: 0
          }
        });
        let ids = [];
        this.treeDataDevice = [
          {
            value: 'allCheck',
            key: 'allCheck',
            title: '全选',
            children: this.handleDataDevice(res.resultData.records, ids)
          }
        ];
        this.allpIdsDevice = ids;
        if (this.item.deviceIds?.length > 0) {
          this.form.deviceIds = this.item.deviceIds;
        } else {
          this.form.deviceIds = ['allCheck', ...this.allpIdsDevice];
        }
        // 移除这里的setParams调用，由updateQuery统一调用
      } catch (error) {
        console.error('获取设备树失败:', error);
        throw error;
      }
    },
    /** 处理数据 */
    handleData(data, ids = []) {
      if (data.length <= 0) return [];
      return data.map(item => {
        let { name, id } = item;
        ids.push(id + '||mark' + name);
        return {
          children: [],
          title: name,
          key: id + '||mark' + name,
          value: id + '||mark' + name
        };
      });
    },
    handleDataDevice(deviceTreeData, ids = []) {
      if (deviceTreeData.length <= 0) return [];
      return deviceTreeData.map(item => {
        let { deviceName, industryDeviceId } = item;
        ids.push(industryDeviceId + '||mark' + deviceName);
        return {
          children: [],
          title: deviceName,
          key: industryDeviceId + '||mark' + deviceName,
          value: industryDeviceId + '||mark' + deviceName
        };
      });
    },
    /* 获取表格数据 */
    async getTableData() {
      this.loading = true;
      let ids = this.dealSendData();
      let placeIds = this.form.dataLevel === '0' ? ids : [];
      let deviceIds = this.form.dataLevel === '0' ? [] : ids;
      // 表格时间处理参数
      this.handleExcelParam();
      this.tableData = [];
      let sendData = { ...this.form, placeIds, deviceIds, indicators: [this.form.configCode] };
      await this.item.queryData(sendData).then(res => {
        this.loading = false;
        let { resultData } = res;
        this.total = resultData.length;
        this.baseTableData = resultData;
        this.columns1 = [];
        this.columns2 = [];
        if (resultData.length <= 0) {
          this.tableData = [];
          this.spinning = false;
          this.nullDataState = true;
          return;
        } else {
          this.nullDataState = false;
        }
        if (this.isShowChart) {
          this.dealDataToChart();
        } else {
          this.dealData();
        }
        this.spinning = false;
      });
    },
    /* 表格时间处理参数 */
    handleExcelParam() {
      if (this.timeType === 'day' || this.form.periodUnit === 'HOURS') {
        this.form.maxMinValueDateFormat = 'HH:00'; // 最大值最小值日期格式化
        this.form.isMaxMinDatePeriodDateFormat = true;
        this.form.isPeriodDateFormat = true;
        this.form.periodDateFormat = 'HH:00';
        // 水电量结尾6 能效结尾5
        this.form.periodEndCount = this.item.periodEndCount;
        // 横向表头起始3 纵向2
        this.form.periodStartCount = this.form === 1 ? 3 : 2;
      } else {
        this.form.maxMinValueDateFormat = ''; // 最大值最小值日期格式化
        this.form.isMaxMinDatePeriodDateFormat = false;
        this.form.isPeriodDateFormat = false;
        this.form.periodDateFormat = '';
        this.form.periodEndCount = null;
        this.form.periodStartCount = null;
        this.form.periodStartCount = null;
      }
    },
    dealData() {
      let data = JSON.parse(JSON.stringify(this.baseTableData));
      if (data.length === 0) return;
      this.valueCol = data[0].reportPoints[0].reportPointCalList?.length > 0;
      this['_dealTableData' + this.tableType](data);
      if (this.tableType === 1) this._dealColumns1(data);
    },
    dealSendData() {
      let currentIds = this.form.dataLevel === '0' ? this.form.placeIds : this.form.deviceIds;
      let ids = JSON.parse(JSON.stringify(currentIds));
      let idx = ids.findIndex(id => id === 'allCheck');
      if (idx > -1) ids.splice(idx, 1);
      return ids.map((item, i) => {
        return item.split('||mark')[0];
      });
    },
    /* 表头 */
    _dealColumns1(data) {
      let temp = this.valueCol
        ? data[0].reportPoints[0].reportPointCalList[0].reportPointDataList
        : data[0].reportPoints[0].reportPointDataList;
      let statTitle = (this.item.title = this.form.dataLevel == '0' ? '构筑物' : '设备');
      let baseColumns = [
        {
          title: '序号',
          dataIndex: 'index',
          width: 60,
          fixed: 'left',
          align: 'center',
          customRender: (text, row, index) => {
            return index + 1;
          }
        },
        {
          title: statTitle,
          dataIndex: 'statName',
          width: 160,
          fixed: 'left',
          align: 'center'
          // ellipsis: true
        },
        {
          title: '指标名',
          dataIndex: 'memo',
          width: 180,
          fixed: 'left',
          align: 'center'
          // ellipsis: true
        }
      ];
      /* 底行数据 */
      let bottomRows = [
        {
          title: '最小值',
          dataIndex: 'min',
          width: 90,
          align: 'center',
          fixed: 'right',
          ellipsis: true,
          customRender: (text, row) => {
            let _text = text || '--';
            let tempBool = false;
            let tempStyle = {};
            if (this.isExceptionShow && this.timeType === 'day' && _text !== '--') {
              tempBool =
                parseFloat(_text) < parseFloat(row.minValue) ||
                parseFloat(_text) > parseFloat(row.maxValue);
              tempStyle = { color: tempBool ? 'red' : '' };
            }
            return (
              <span style={tempStyle} title={_text}>
                {_text}
              </span>
            );
          }
        },
        {
          title: '最小值时间',
          dataIndex: 'minDateTime',
          width: 110,
          align: 'center',
          fixed: 'right',
          ellipsis: true,
          customRender: text => {
            if (this.timeType === 'day') {
              if (!!text) {
                let num = parseInt(text);
                num = num > 10 ? `${num - 1}:00` : `0${num - 1}:00`;
                return num + '-' + text;
              } else {
                return '--';
              }
            } else {
              return text || '--';
            }
          }
        },
        {
          title: '最大值',
          dataIndex: 'max',
          width: 110,
          align: 'center',
          fixed: 'right',
          ellipsis: true,
          customRender: (text, row) => {
            let _text = text || '--';
            let tempBool = false;
            let tempStyle = {};
            if (this.isExceptionShow && this.timeType === 'day' && _text !== '--') {
              tempBool =
                parseFloat(_text) < parseFloat(row.minValue) ||
                parseFloat(_text) > parseFloat(row.maxValue);
              tempStyle = { color: tempBool ? 'red' : '' };
            }
            return (
              <span style={tempStyle} title={_text}>
                {_text}
              </span>
            );
          }
        },
        {
          title: '最大值时间',
          dataIndex: 'maxDateTime',
          width: 110,
          align: 'center',
          fixed: 'right',
          ellipsis: true,
          customRender: text => {
            if (this.timeType === 'day') {
              if (!!text) {
                let num = parseInt(text);
                num = num > 10 ? `${num - 1}:00` : `0${num - 1}:00`;
                return num + '-' + text;
              } else {
                return '--';
              }
            } else {
              return text || '--';
            }
          }
        },
        {
          title: '平均值',
          dataIndex: 'avg',
          width: 90,
          align: 'center',
          fixed: 'right',
          ellipsis: true,
          customRender: (text, row) => {
            let _text = text || '--';
            let tempBool = false;
            let tempStyle = {};
            if (this.isExceptionShow && this.timeType === 'day' && _text !== '--') {
              tempBool =
                parseFloat(_text) < parseFloat(row.minValue) ||
                parseFloat(_text) > parseFloat(row.maxValue);
              tempStyle = { color: tempBool ? 'red' : '' };
            }
            return (
              <span style={tempStyle} title={_text}>
                {_text}
              </span>
            );
          }
        }
      ];
      let fixedWidth = 910;
      if (this.valueCol) {
        baseColumns.push({
          title: '值类型',
          dataIndex: 'calName',
          width: 90,
          align: 'center',
          fixed: 'left',
          ellipsis: true
        });
        fixedWidth += 90;
      }
      if (this.item.isShowSum) fixedWidth += 90;
      let isSetColWidth = fixedWidth + temp.length * 110 >= this.tableW; // 是否设置列宽度
      this.scrollX = Math.max(fixedWidth + temp.length * 110, this.tableW);
      temp.forEach((t, idx) => {
        let title = t.dateTime;
        let endTime = '';
        let startTime = '';
        // 如果为日报，加工表头为时间区间
        if (this.timeType === 'day') {
          startTime = this.$moment(title).format('HH:mm');
          endTime = this.$moment(title)
            .add(1, 'hour')
            .format('HH:mm');
          title = startTime + '-' + endTime;
        }
        baseColumns.push({
          title:
            this.timeType === 'day' ? (
              <span title={title}>
                <span>{startTime + '-'}</span>
                <br />
                <span>{endTime}</span>
              </span>
            ) : (
              <span title={title}>{title}</span>
            ),
          dataIndex: `time${idx}`,
          width: isSetColWidth ? 110 : '',
          align: 'center',
          ellipsis: true,
          // 高亮路由带过来的日期那一列
          // customCell: (record, rowIndex) => {
          //   if (t.dateTime === this.$route.query.hightLightCol) {
          //     return {
          //       style: { background: '#F5FAFA !important' }
          //     };
          //   }
          // },
          customRender: (text, row) => {
            let _text = text || '--';
            let tempBool = false;
            let tempStyle = {};
            if (this.isExceptionShow && this.timeType === 'day' && _text !== '--') {
              tempBool =
                parseFloat(_text) < parseFloat(row.minValue) ||
                parseFloat(_text) > parseFloat(row.maxValue);
              tempStyle = { color: tempBool ? 'red' : '' };
            }
            return (
              <span style={tempStyle} title={_text}>
                {_text}
              </span>
            );
          }
        });
      });
      let _bottomRows = this.item.isShowSum ? [...bottomRows, this.sumColumns] : bottomRows;
      this.columns1 = [...baseColumns, ..._bottomRows];
      this.setColumns(data);
    },
    _dealColumns2(baseColumns) {
      let fixedWidth = 170;
      let pointColWidth = 0;
      baseColumns.slice(2).forEach(col => {
        if (col.children) {
          col.children.forEach(item => {
            pointColWidth += item.children
              ? item.children.length > 1
                ? item.children.length * 90
                : 180
              : 180;
          });
        } else {
          pointColWidth += 180;
        }
      });
      let isSetColWidth = fixedWidth + pointColWidth >= this.tableW; // 是否设置列宽度
      this.scrollX = Math.max(fixedWidth + pointColWidth, this.tableW);
      this.columns2 = baseColumns.map((col, cIdx) => {
        if (cIdx > 1) {
          if (col.children && col.children.length > 0) {
            col.children.forEach(c => {
              if (c.children && c.children.length > 0) {
                if (c.children.length > 1) {
                  c.children.forEach(citem => {
                    citem.width = isSetColWidth ? 90 : '';
                  });
                } else {
                  c.children.forEach(citem => {
                    citem.width = isSetColWidth ? 180 : '';
                  });
                }
              } else {
                c.width = isSetColWidth ? 180 : '';
              }
            });
          } else {
            col.width = isSetColWidth ? 180 : '';
          }
        }
        return col;
      });
    },
    /* 合并行数据 */
    setColumns(data) {
      let dealRows1 = [];
      if (!this.valueCol) {
        data.forEach(p => {
          let len = p.reportPoints.length;
          dealRows1.push(len);
          if (len > 1) {
            for (let i = 1; i < len; i++) {
              dealRows1.push(0);
            }
          }
        });
      } else {
        let dealRows2 = [];
        data.forEach(p => {
          let len = 0;
          p.reportPoints.forEach(z => {
            len = len + z.reportPointCalList.length;
            dealRows2.push(z.reportPointCalList.length);
            if (z.reportPointCalList.length > 1) {
              for (let i = 1; i < z.reportPointCalList.length; i++) {
                dealRows2.push(0);
              }
            }
          });
          dealRows1.push(len);
          if (len > 1) {
            for (let i = 1; i < len; i++) {
              dealRows1.push(0);
            }
          }
        });
        this.columns1[2].customRender = (text, row, index) => {
          return {
            children: <span title={text}>{text}</span>,
            attrs: {
              rowSpan: dealRows2[index]
            }
          };
        };
      }
      this.columns1[0].customRender = (text, row, index) => {
        let idx = data.findIndex(d => d.statId === row.statId);
        return {
          children: <span>{idx + 1}</span>,
          attrs: {
            rowSpan: dealRows1[index]
          }
        };
      };
      this.columns1[1].customRender = (text, row, index) => {
        let params = { pumpId: row.stationId };
        return {
          children: (
            <span
              // class="supply-text-primary curpor"
              title={text}
              // on-click={() => this.gotoPage(params)}
            >
              {text}
            </span>
          ),
          attrs: {
            rowSpan: dealRows1[index]
          }
        };
      };
    },
    /* 表格数据 */
    _dealTableData1(data) {
      let arr = [];
      data.forEach(d => {
        d.reportPoints.forEach((p, i) => {
          if (this.valueCol) {
            p.reportPointCalList.forEach(z => {
              z.memo = p.memo;
              arr.push(this.setColValues1(z, d, i));
            });
          } else {
            arr.push(this.setColValues1(p, d, i));
          }
        });
      });
      this.tableData = arr;
    },
    _dealTableData2(data) {
      let arr = [];
      let baseColumns = [
        {
          title: '序号',
          dataIndex: 'index',
          width: 60,
          align: 'center',
          fixed: 'left',
          customRender: (text, row, index) => {
            return row.type === 'text' ? '' : index + 1;
          }
        },
        {
          title: '时间',
          align: 'center',
          dataIndex: 'dateTime',
          width: 110,
          fixed: 'left',
          ellipsis: true,
          customRender: (text, row, index) => {
            let title = text;
            // 如果为日报，加工表头为时间区间
            if (this.timeType === 'day' && /^\d{4}-\d{2}-\d{2}/.test(title)) {
              let startTime = this.$moment(title).format('HH:mm');
              let endTime = this.$moment(title)
                .add(1, 'hour')
                .format('HH:mm');
              title = startTime + '-' + endTime;
            }
            return title;
          }
        }
      ];
      let dateTimeArr = ['最小值时间', '最大值时间'];
      data.forEach(d => {
        let { statName, statId, stationId, reportPoints } = d;
        // let params = this.item.treeType === 'pump' ? { pumpId: statId } : { pumpId: stationId };
        let params = { pumpId: stationId };
        baseColumns.push({
          title: (
            <span
              title={statName}
              // class="supply-text-primary curpor"
              // on-click={() => this.gotoPage(params)}
            >
              {statName}
            </span>
          ),
          align: 'center',
          ellipsis: true,
          children: reportPoints.map(p => {
            let col = {
              title: <span title={p.memo}>{p.memo}</span>,
              align: 'center',
              dataIndex: `${statId}${p.pointName}`,
              ellipsis: true
            };
            if (this.valueCol) {
              col.children = p.reportPointCalList.map((z, i) => {
                z.pointName = p.pointName;
                this.setColValues2({ data: z, p, d, arr, i });
                return {
                  title: <span title={z.calName}>{z.calName}</span>,
                  align: 'center',
                  dataIndex: `${statId}${p.pointName}${i}`,
                  ellipsis: true,
                  customRender: text => {
                    return text || '--';
                  }
                };
              });
            } else {
              col.customRender = (text, row) => {
                let _text = text || '--';
                let tempBool = false;
                let tempStyle = {};
                if (
                  this.isExceptionShow &&
                  this.timeType === 'day' &&
                  dateTimeArr.indexOf(row.dateTime) < 0 &&
                  _text !== '--'
                ) {
                  tempBool =
                    parseFloat(_text) < parseFloat(p['minValue']) ||
                    parseFloat(_text) > parseFloat(p['maxValue']);
                  tempStyle = { color: tempBool ? 'red' : '#333333' };
                }
                if (this.timeType === 'day' && dateTimeArr.indexOf(row.dateTime) > -1) {
                  if (_text !== '--') {
                    let num = parseInt(_text);
                    num = num > 10 ? `${num - 1}:00` : `0${num - 1}:00`;
                    _text = num + '-' + _text;
                  }
                }
                return (
                  <span style={tempStyle} title={_text}>
                    {_text}
                  </span>
                );
              };
              this.setColValues2({ data: p, d, arr, i: '' });
            }
            return col;
          })
        });
      });
      this._dealColumns2(baseColumns);
      this.tableData = arr;
    },
    /* 列数据 */
    setColValues1(data, d, i) {
      let { statName, statId, stationId, stationName } = d;
      data.reportPointDataList.forEach((t, idx) => {
        data[`time${idx}`] = t.pv === 0 ? '0' : String(t.pv || '--');
      });
      let { avg, max, min } = data;
      let minValue = null,
        maxValue = null;
      if (Array.isArray(d.reportPoints) && d.reportPoints.length > 0) {
        if (d.reportPoints[i]['minValue'] || d.reportPoints[i]['minValue'] == '0') {
          minValue = d.reportPoints[i]['minValue'];
        }
        if (d.reportPoints[i]['maxValue'] || d.reportPoints[i]['maxValue'] == '0') {
          maxValue = d.reportPoints[i]['maxValue'];
        }
      }
      return {
        statName,
        statId,
        stationId,
        stationName,
        uid: uuid(),
        ...data,
        avg: avg === 0 ? '0' : String(avg || '--'),
        max: max === 0 ? '0' : String(max || '--'),
        min: min === 0 ? '0' : String(min || '--'),
        maxValue,
        minValue
      };
    },
    setColValues2(obj) {
      let { data, d, arr, i, p } = obj;
      let { statId, statName, stationName, stationId } = d;
      let len = data.reportPointDataList.length;
      data.reportPointDataList.forEach((t, idx) => {
        let { dateTime, pv } = t;
        arr[idx] = {
          ...arr[idx],
          dateTime,
          uid: uuid(),
          statId,
          statName,
          stationName,
          stationId,
          [`${statId}${data.pointName}${i}`]: pv === 0 ? '0' : String(pv || '--')
        };
      });
      let _bottomRows = this.item.isShowSum
        ? [...this.bottomRows, this.sumColumns]
        : this.bottomRows;
      _bottomRows.forEach((r, index) => {
        let val = i ? p[r.dataIndex] : data[r.dataIndex];
        arr[len + index] = {
          ...arr[len + index],
          type: 'text',
          uid: uuid(),
          statId,
          statName,
          stationName,
          stationId,
          dateTime: r.title,
          [`${statId}${data.pointName}${i}`]: val === 0 ? '0' : String(val || '--')
        };
      });
    },
    /* 改变页码 */
    onPageChange(page, size) {
      this.form.page.current = page;
      this.getTableData();
    },
    /* 改变每页条数 */
    onPageSizeChange(page, size) {
      this.getTableData();
    },
    gotoPage(params) {
      // 跳转到设备
      this.drillDown({ path: '/runMonitor/pumpDetail', query: params });
    },
    reset() {
      this.timeType = this.item.typeList[0].value;
      this.form = {
        ...this.form,
        startTime: this.$moment().format('YYYY-MM-DD 00:00:00'),
        endTime: this.$moment().format('YYYY-MM-DD 23:59:59'),
        period: '1',
        configCode: '',
        periodUnit: 'HOURS',
        isOnline: '1',
        page: {
          current: 1,
          size: 50
        }
      };
      this.dateTime = this.$moment();
      this.periodType = 'HOURS,1';
      this.form.placeIds = ['allCheck', ...this.allpIds];
      this.form.deviceIds = ['allCheck', ...this.allpIdsDevice];
      this.setParams();
    },
    customRow(record, rowIndex) {
      // 高亮显示路由带过来的监测量名的那一行数据
      if (record.memo?.includes(this.item.memo)) {
        return {
          style: { background: '#F5FAFA !important' }
        };
      }
    }
  }
};
</script>

<style scoped lang="less">
#reportTable {
  .form-region-select {
    margin: 0;
    /deep/ .ant-select-selection {
      width: 215px !important;
    }
  }
}
.report-table {
  height: 100%;
  /deep/ .table-page-search-wrapper {
    padding-bottom: 7px;
  }
  .btn-wrapper {
    padding: 16px 20px 13px;
    .btns {
      .btn-item {
        width: 24px;
        height: 24px;
        border-radius: 2px;
        background-color: var(--supply-color-bg-card-rank-default);
        float: left;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        &:nth-child(1) {
          margin-right: 8px;
        }
        &:hover {
          background-color: var(--supply-color-bg-card-rank-first);
        }
      }
    }
    .ant-checkbox-group {
      .ant-checkbox-wrapper > span {
        font-size: 12px;
        color: #666;
      }
    }
  }
  &-con {
    position: relative;
    padding: 0 20px;
    min-height: 160px;
    .spin-wrapper {
      position: absolute;
      height: 100%;
      width: calc(100% - 40px);
      max-height: 400px;
      .spin {
        z-index: 23;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
      }
    }
    .curpor {
      cursor: pointer;
    }
    /deep/ .ant-table-wrapper {
      .ant-table-header th {
        vertical-align: middle;
        border-bottom: 1px solid #e8e8e8;
      }
      .ant-table-body {
        margin: 0;
        .ant-table-thead {
          background: transparent !important;
        }
      }
      .ant-table-tbody {
        > tr:nth-child(even) {
          background: transparent;
        }
        > tr.ant-table-row:hover,
        > tr.ant-table-row,
        > tr.ant-table-row-hover {
          background: transparent !important;
          &:hover > td,
          td {
            background: transparent !important;
            border-bottom: 1px solid #d6d6d6;
          }
        }
      }
    }
    .pagination {
      width: 100%;
      text-align: right;
      padding: 12px;
    }
    /deep/ .pagination-wrapper {
      display: none !important;
    }
  }
}
.select-pumps {
  /deep/.wpg-form-item-control-wrapper {
    max-width: calc(100% - 70px);
    .wpg-select-selection__choice {
      max-width: 44%;
    }
  }
}
.nullDataState {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  align-content: center;
}
</style>
