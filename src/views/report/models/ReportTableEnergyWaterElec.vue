<template>
  <div id="reportTable" class="report-table">
    <table-search>
      <w-row slot="form" :gutter="20" class="report-table-search">
        <w-form-model ref="form" :model="form">
          <w-col v-if="item.isShowTime" :span="3">
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
          <w-col :span="5">
            <w-form-model-item label="选择污水厂" prop="projectStatusList">
              <factory-select
                v-model="form.waterPlantId"
                autoSelect
                :showAll="!autoSelect"
              ></factory-select>
            </w-form-model-item>
          </w-col>
          <w-col :span="5">
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
          <w-col class="supply-float-right">
            <w-button @click="download" type="primary"><w-icon type="export" /> 导出</w-button>
            <w-button class="supply-mx-3" @click="reset" icon="reload">重置</w-button>
            <w-button type="primary" @click="setParams" icon="search">查询</w-button>
            <w-button v-if="item.isCompare" class="supply-ml-3" type="primary" @click="setCompare"
              >对比分析</w-button
            >
            <return-control class="supply-ml-3" :is-drill-down="true"></return-control>
          </w-col>
        </w-form-model>
      </w-row>
      <div class="supply-h-full supply-flex supply-flex-col">
        <!-- <div class="btn-wrapper supply-bg-bg-card-component">
          <div class="btns supply-float-right">
            <w-tooltip>
              <template slot="title">导出报表</template>
              <span class="btn-item" @click="download">
                <w-icon type="ic_get_app" class="hover:supply-text-primary-hover" />
              </span>
            </w-tooltip>
          </div>
        </div> -->
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
            class="supply-h-full"
            ref="table"
            bordered
            :columns="columns1"
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
import { exportFile } from '@/utils/util';
import { axios } from '@/utils/request';

import FactorySelect from '@/components/factory-select/index.vue';
import PaginationTable from '@/components/PaginationTable/index.vue';

export default {
  name: 'ReportTable',
  components: {
    FactorySelect,
    PaginationTable
  },
  props: {
    item: {
      default: () => {},
      type: Object
    },
    isExceptionShow: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      timeType: 'day',
      form: {
        startTime: this.$moment().format('YYYY-MM-DD 00:00:00'),
        endTime: this.$moment().format('YYYY-MM-DD 23:59:59'),
        waterPlantId: '',
        page: {
          current: 1,
          size: 10
        }
      },
      dateTime: this.$moment(),
      spinning: false,
      nullDataState: false,
      loading: false,
      autoSelect: true,
      columns1: [],
      tableData: [],
      total: 0,
      isAnalysis: false,
      baseTableData: [], // 原始表格数据
      scrollX: 1700 // 表格横向滚动
    };
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {
    this.updateQuery();
  },
  methods: {
    setCompare() {
      this.isAnalysis = true;
      this.setParams();
    },
    // 解析带入的参数，并更新查询条件，重新请求数据
    updateQuery() {
      this.spinning = true;
      this.timeType = this.item.timeType || this.item.typeList[0].value;
      this.dateTime = this.item.date ? this.$moment(this.item.date) : this.$moment();
      this.tableW = this.$refs.reportTableCon.clientWidth - 40;
      this.setParams();
    },
    /* 处理参数 */
    setParams() {
      if (this.timeType === 'day') {
        let endTimeFormat = 'YYYY-MM-DD 23:59:59';
        let today = this.$moment().startOf('day');
        if (this.$moment(this.dateTime).isSame(today, 'd')) {
          endTimeFormat = 'YYYY-MM-DD HH:00:00';
        }
        this.form = {
          ...this.form,
          startTime: this.dateTime.format('YYYY-MM-DD 00:00:00'),
          endTime: this.dateTime.format(endTimeFormat)
        };
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
      }

      // this.form = {
      //   ...this.form,
      //   startTime: this.dateTime.format('YYYY-MM-DD 00:00'),
      //   endTime: this.dateTime.format(endTimeFormat)
      // };
      this.form.isAnalysis = this.isAnalysis;
      this.form.page.current = 1;
      this.getTableData();
    },
    /* 获取表格数据 */
    async getTableData() {
      this.loading = true;
      this.tableData = [];
      let sendData = { ...this.form };
      await this.item.queryData(sendData).then(res => {
        this.loading = false;
        let { resultData } = res;
        // this.total = total;
        this.baseTableData = resultData;
        this.columns1 = [];
        if (resultData.length <= 0) {
          this.tableData = [];
          this.columns1 = this.item.columns;
          this.spinning = false;
          if (this.item.columns.length <= 0) {
            this.nullDataState = true;
          }
          return;
        } else {
          this.nullDataState = false;
        }
        this.dealData();
        this.spinning = false;
      });
    },
    dealData() {
      let data = JSON.parse(JSON.stringify(this.baseTableData));
      if (data.length === 0) return;
      this._dealTableData(data);
    },
    _dealTableData(data) {
      let arr = [];
      let baseColumns = [
        // {
        //   title: '序号',
        //   dataIndex: 'index',
        //   width: 60,
        //   align: 'center',
        //   fixed: 'left',
        //   customRender: (text, row, index) => {
        //     return row.type === 'text' ? '' : index + 1;
        //   }
        // }
      ];
      data.forEach(d => {
        let { groupCode, groupMemo, classList } = d;
        // 过滤日期、时间
        if (classList.length > 0 && classList[0].classCode === groupCode) {
          baseColumns.push({
            title: `${classList[0].classMemo}`,
            align: 'center',
            dataIndex: `${groupCode}_${classList[0].classCode}`,
            width: 140,
            fixed: 'left',
            ellipsis: true,
            customRender: (text, row, index) => {
              return text;
            }
          });
        } else {
          baseColumns.push({
            title: <span title={groupMemo}>{groupMemo}</span>,
            align: 'center',
            ellipsis: true,
            children: classList.map(p => {
              let col = {
                title: <span title={p.classMemo}>{p.classMemo}</span>,
                align: 'center',
                dataIndex: `${groupCode}_${p.classCode}`,
                ellipsis: true
              };
              col.customRender = (text, row) => {
                let _text = text || '--';
                return _text;
              };
              return col;
            })
          });
        }
      });
      this.setColValues2({ data, arr });
      this._dealColumns(baseColumns);
      this.setColumns(data);
      this.tableData = arr;
    },
    setColValues2(obj) {
      let { data, arr } = obj;
      // 数组对象初始化
      if (
        data.length > 0 &&
        data[0].classList.length > 0 &&
        data[0].classList[0].indicatorList.length > 0 &&
        data[0].classList[0].indicatorList[0].dataList.length > 0
      ) {
        let length = data[0].classList[0].indicatorList[0].dataList.length;
        for (let i = 0; i < length; i++) {
          arr.push({});
        }
      }
      data.forEach(item => {
        item.classList.forEach((t, index) => {
          let { classCode, classMemo, indicatorList } = t;
          if (Array.isArray(indicatorList) && indicatorList.length > 0) {
            for (let idx = 0; idx < indicatorList[0].dataList.length; idx++) {
              if (arr[idx]) {
                arr[idx][`${item.groupCode}_${classCode}`] = indicatorList[0].dataList[idx];
              }
            }
          }
        });
      });

      // 添加key
      arr.forEach(item => {
        item['uid'] = uuid();
      });
    },
    _dealColumns(baseColumns) {
      let fixedWidth = 220;
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
      this.columns1 = baseColumns.map((col, cIdx) => {
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
      if (
        data.length > 0 &&
        data[0].classList.length > 0 &&
        data[0].classList[0].indicatorList.length > 0 &&
        data[0].classList[0].indicatorList[0].dataList.length > 0
      ) {
        let length = data[0].classList[0].indicatorList[0].dataList.length;
        let dateArr = [];
        let dateNumArr = [];
        data[0].classList[0].indicatorList[0].dataList.forEach((item, idx) => {
          if (dateArr.indexOf(item) === -1) {
            dateArr.push(item);
            dateNumArr.push(idx);
          }
        });
        dateNumArr.push(length);

        for (let i = 0; i < dateNumArr.length; i++) {
          if (i + 1 < dateNumArr.length) {
            dealRows1.push(dateNumArr[i + 1] - dateNumArr[i]);
            for (let j = 1; j < dateNumArr[i + 1] - dateNumArr[i]; j++) {
              dealRows1.push(0);
            }
          }
        }
      }
      // this.columns1[0].customRender = (text, row, index) => {
      //   let idx = data.findIndex(d => d.statId === row.statId);
      //   return {
      //     children: <span>{idx + 1}</span>,
      //     attrs: {
      //       rowSpan: dealRows1[index]
      //     }
      //   };
      // };
      this.columns1[0].customRender = (text, row, index) => {
        return {
          children: <span title={text}>{text}</span>,
          attrs: {
            rowSpan: dealRows1[index]
          }
        };
      };
    },
    reset() {
      this.timeType = this.item.typeList[0].value;
      this.form = {
        ...this.form,
        startTime: this.$moment().format('YYYY-MM-DD 00:00:00'),
        endTime: this.$moment().format('YYYY-MM-DD 23:59:59'),
        period: '1',
        periodUnit: 'HOURS',
        page: {
          current: 1,
          size: 10
        }
      };
      this.isAnalysis = false;
      this.dateTime = this.$moment();
      this.setParams();
    },
    /* 改变页码 */
    onPageChange(page, size) {
      this.form.page.current = page;
      this.getTableData();
    },
    /* 导出 */
    async download() {
      let params = {
        ...this.form,
        isAnalysis: this.isAnalysis,
        isCross: this.tableType === 1
      };
      //导出excel表名
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

<style lang="less" scoped>
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
    padding: 0 12px;
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
  }
}
/deep/.table-page-list-container {
  background: var(--supply-rgb-color-bg-card-DEFAULT);
}
.select-pumps {
  /deep/.wpg-form-item-control-wrapper {
    max-width: calc(100% - 70px);
    .wpg-select-selection__choice {
      max-width: 50%;
    }
  }
}
/deep/ .pagination-wrapper {
  display: none !important;
}
.nullDataState {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  align-content: center;
}
</style>
