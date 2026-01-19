<template>
  <div class="water-quality-container">
    <w-form-table-page>
      <template #table>
        <div class="full-table-wrap">
          <!-- 氨氮沿程分析表格 -->
          <div class="table-title">
            氨氮沿程分析
          </div>
          <w-table
            :columns="ammoniaNitrogenColumns"
            :data-source="ammoniaNitrogenData"
            :pagination="false"
            :bordered="true"
            :scroll="{ x: 1000 }"
            size="middle"
          >
          </w-table>
          <!-- 总氮沿程分析表格 -->
          <div class="table-title table-title-tp">
            总氮沿程分析
          </div>
          <w-table
            :columns="totalNitrogenColumns"
            :data-source="totalNitrogenData"
            :pagination="false"
            :bordered="true"
            size="middle"
            class="sludge-table"
            :scroll="{ x: 1000 }"
            :rowClassName="() => 'sludge-row'"
          >
          </w-table>
          <!-- TP沿程分析表格 -->
          <div class="table-title table-title-tp">
            TP沿程分析
          </div>
          <w-table
            :columns="totalPhosphorusColumns"
            :data-source="totalPhosphorusData"
            :pagination="false"
            :bordered="true"
            size="middle"
            class="sludge-table"
            :scroll="{ x: 1000 }"
            :rowClassName="() => 'sludge-row'"
          >
          </w-table>
        </div>
      </template>
    </w-form-table-page>
  </div>
</template>

<script>
import { alongLayerAnalysis } from '@/api/manage';

// 常量定义
const POINT_TYPES = {
  TN: 'TN',
  NH3N: 'NH3N',
  TP: 'TP'
};

const ALIAS_MAP = {
  [POINT_TYPES.TN]: 'tn',
  [POINT_TYPES.NH3N]: 'nh3n',
  [POINT_TYPES.TP]: 'tp'
};

const COLUMN_MAP = {
  [POINT_TYPES.TN]: 'totalNitrogenColumns',
  [POINT_TYPES.NH3N]: 'ammoniaNitrogenColumns',
  [POINT_TYPES.TP]: 'totalPhosphorusColumns'
};

const DATA_MAP = {
  [POINT_TYPES.TN]: 'totalNitrogenData',
  [POINT_TYPES.NH3N]: 'ammoniaNitrogenData',
  [POINT_TYPES.TP]: 'totalPhosphorusData'
};

const INLET_WATER_PLACE = ['进水', '进水水质分析间'];

const DEFAULT_HOURS_OFFSET = 12;

export default {
  name: 'WaterQualityTable',
  components: {},
  props: {
    waterPlantId: {
      type: String,
      default: ''
    },
    dateTime: {
      type: String,
      default: ''
    },
    lineCode: {
      type: Number,
      default: -1
    }
  },
  data() {
    return {
      loading: false,
      isEdit: false,
      exportLoading: false,
      tableData: [],
      unit: 'mg/L',
      // 氨氮指标列定义
      ammoniaNitrogenColumns: [],
      // 氨氮指标数据
      ammoniaNitrogenData: [],
      // 总磷指标列定义
      totalPhosphorusColumns: [],
      // 总磷指标数据
      totalPhosphorusData: [],
      // 总氮沿程分析列定义
      totalNitrogenColumns: [],
      // 总氮沿程分析数据
      totalNitrogenData: []
    };
  },
  watch: {
    waterPlantId: {
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          this.getList();
        }
      },
      immediate: true
    },
    dateTime: {
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          this.getList();
        }
      },
      deep: true
    },
    lineCode: {
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          this.getList();
        }
      }
    }
  },
  mounted() {
    this.getList();
  },
  methods: {
    /**
     * 获取沿程分析数据
     */
    async getList() {
      if (!this.waterPlantId) {
        console.warn('waterPlantId is required');
        return;
      }

      const params = this.buildRequestParams();

      try {
        const res = await alongLayerAnalysis(params);
        if (res?.status === 'complete' && res?.resultData) {
          this.tableData = res.resultData || [];
          this.handleTableData();
        } else {
          console.warn('API response is incomplete:', res);
        }
      } catch (error) {
        console.error('获取沿程分析数据失败:', error);
      }
    },

    /**
     * 构建请求参数
     */
    buildRequestParams() {
      const baseTime = this.dateTime ? this.$moment(this.dateTime) : this.$moment();

      const timeFormat = 'YYYY-MM-DD HH:00:00';

      return {
        waterPlantId: this.waterPlantId,
        line: this.lineCode,
        startDateTime: this.dateTime
          ? baseTime.format(timeFormat)
          : baseTime.subtract(DEFAULT_HOURS_OFFSET, 'hours').format(timeFormat),
        endDateTime: this.dateTime
          ? baseTime.format(timeFormat)
          : baseTime.add(DEFAULT_HOURS_OFFSET, 'hours').format(timeFormat)
      };
    },
    /**
     * 处理表格数据
     */
    handleTableData() {
      if (!this.tableData || !Array.isArray(this.tableData)) {
        console.warn('tableData is invalid');
        return;
      }

      // 使用常量处理各种指标类型
      Object.values(POINT_TYPES).forEach(pointType => {
        const data = this.tableData.find(item => item.pointName === pointType);
        if (data) {
          const aliasName = ALIAS_MAP[pointType];
          const columnName = COLUMN_MAP[pointType];
          const dataName = DATA_MAP[pointType];

          this.handleColumn(data, columnName, aliasName);
          this.handleData(data, dataName, aliasName);
        } else {
          console.warn(`No data found for point type: ${pointType}`);
        }
      });
    },
    /**
     * 处理表格列配置
     */
    handleColumn(data, columnName, aliasName = '') {
      if (!data || !data.sectionDataList) {
        console.warn('Invalid data for column handling');
        return;
      }

      const { sectionDataList } = data;
      const uniqueSectionDataList = this.getUniqueSectionDataList(sectionDataList);
      const nonInletColumns = uniqueSectionDataList.filter(
        item => INLET_WATER_PLACE.indexOf(item.placeName) === -1
      );

      const baseColumns = this.createBaseColumns(nonInletColumns);
      const dynamicColumns = this.createDynamicColumns(nonInletColumns, aliasName);

      this[columnName] = [...baseColumns, ...dynamicColumns];
    },

    /**
     * 获取去重后的sectionDataList
     */
    getUniqueSectionDataList(sectionDataList) {
      return (
        sectionDataList?.filter((item, index, arr) => {
          return arr.findIndex(t => t.placeName === item.placeName) === index;
        }) || []
      );
    },

    /**
     * 创建基础列配置
     */
    createBaseColumns(nonInletColumns) {
      let showTitle = nonInletColumns?.[0]?.showTitle || '';
      return [
        {
          title: '时间日期',
          dataIndex: 'createTime',
          key: 'createTime',
          width: 80
        }
        // },
        // {
        //   title: `进水(${showTitle}实际值 mg/L)`,
        //   dataIndex: 'inletWaterValue',
        //   key: 'inletWaterValue',
        //   width: 120,
        //   // 超出上下限报警
        //   customRender: (text, row) => {
        //     let _text = text || '-';
        //     let tempClass = '';
        //     if (_text && _text !== '-') {
        //       const actualValue = parseFloat(_text);
        //       if (
        //         actualValue < Number(row.minInletWaterValue) ||
        //         actualValue > Number(row.maxInletWaterValue)
        //       ) {
        //         tempClass = 'point-alarm';
        //       }
        //     }
        //     return (
        //       <span class={tempClass} title={_text}>
        //         {_text}
        //       </span>
        //     );
        //   }
        // }
      ];
    },

    /**
     * 创建动态列配置
     */
    createDynamicColumns(nonInletColumns, aliasName) {
      return nonInletColumns.map(item => ({
        title: item.placeName + `(${item.showTitle})`,
        dataIndex: `${aliasName}_${item.placeName}`,
        key: `${aliasName}_${item.placeName}`,
        children: [
          {
            title: '实际 (mg/L)',
            dataIndex: `${aliasName}_${item.placeName}_actual`,
            key: `${aliasName}_${item.placeName}_actual`,
            width: 80,
            // 超出上下限报警
            customRender: (text, row) => {
              let _text = text || '-';
              let tempClass = '';
              if (_text && _text !== '-') {
                const actualValue = parseFloat(_text);
                if (actualValue < Number(item.minValue) || actualValue > Number(item.maxValue)) {
                  tempClass = 'point-alarm';
                }
              }
              return (
                <span class={tempClass} title={_text}>
                  {_text}
                </span>
              );
            }
          },
          // {
          //   title: '预测 (mg/L)',
          //   dataIndex: `${aliasName}_${item.placeName}_predicted`,
          //   key: `${aliasName}_${item.placeName}_predicted`,
          //   width: 120
          // },
          {
            title: this.getRemovalRateTitle(item, aliasName),
            dataIndex: `${aliasName}_${item.placeName}_removalRate`,
            key: `${aliasName}_${item.placeName}_removalRate`,
            width: 80
          }
        ]
      }));
    },

    /**
     * 获取去除率标题
     */
    getRemovalRateTitle(item, aliasName) {
      if (item.removeRatioShowCode === -1) {
        return '去除率 (%)';
      }
      return aliasName === 'tp' ? '释磷比例 (%)' : '氨化比例 (%)';
    },
    /**
     * 处理表格数据
     */
    handleData(data, dataName, aliasName = '') {
      if (!data || !data.sectionDataList) {
        console.warn('Invalid data for data handling');
        return;
      }

      const { sectionDataList } = data;
      const uniqueSectionDataList = this.getUniqueSectionDataList(sectionDataList);

      const inletWaterValue = uniqueSectionDataList.find(
        item => INLET_WATER_PLACE.indexOf(item.placeName) !== -1
      );

      const pointsData = this.buildPointsData(inletWaterValue, uniqueSectionDataList, aliasName);
      this[dataName] = [pointsData];
    },

    /**
     * 构建点位数据
     */
    buildPointsData(inletWaterValue, uniqueSectionDataList, aliasName) {
      const pointsData = {
        createTime: this.formatDateTime(),
        inletWaterValue: inletWaterValue?.realPointValue ? inletWaterValue.realPointValue : '-'
      };

      uniqueSectionDataList.forEach(item => {
        const baseKey = `${aliasName}_${item.placeName}`;
        pointsData[`${baseKey}_actual`] = item.realPointValue ? item.realPointValue : '-';
        pointsData[`${baseKey}_predicted`] = item.modelPointValue ? item.modelPointValue : '-';
        pointsData[`${baseKey}_removalRate`] = item.inletRemoveRatio ? item.inletRemoveRatio : '-';
      });

      return pointsData;
    },

    /**
     * 格式化日期时间
     */
    formatDateTime() {
      return this.dateTime
        ? this.$moment(this.dateTime).format('YYYY-MM-DD HH:00')
        : this.$moment().format('YYYY-MM-DD HH:00');
    }
  }
};
</script>

<style lang="less" scoped>
.water-quality-container {
  width: 100%;
  height: 100%;
  position: relative;
  margin: 0 auto;

  .full-table-wrap {
    padding: 0 6px;
    box-sizing: border-box;
  }
  /deep/.form-warp {
    margin-bottom: 0 !important;
  }

  .sludge-table {
    margin-top: 16px;
  }
  .table-title {
    font-size: 16px;
    font-weight: bold;
    margin: 50px 0 12px 0;
    color: var(--supply-color-main);

    &.table-title-tp {
      margin-top: 16px;
    }
  }
  @keyframes point_alarm {
    0% {
      color: #ff0000;
    }
    100% {
      color: rgba(255, 0, 0, 0.3);
    }
  }
  .point-alarm {
    -webkit-animation: point_alarm 1s ease-in infinite;
    animation: point_alarm 1s ease-in infinite;
  }
  /deep/.wpg-table-header-column {
    width: 100% !important;
    height: 100% !important;
    > div {
      width: 100% !important;
    }
  }

  // 表格列头斑马条纹样式
  /deep/.wpg-table-thead > tr > th:nth-child(odd) {
    background-color: var(--supply-color-bg-tabelHead) !important;
  }

  /deep/.wpg-table-thead > tr > th:nth-child(even) {
    background-color: var(--supply-color-bg-li) !important;
  }

  // 子列头也需要斑马条纹
  /deep/.wpg-table-thead > tr > th .ant-table-column-title {
    background-color: inherit !important;
  }
  /deep/.wpg-table-wrapper {
    height: auto !important;
  }
}
</style>
