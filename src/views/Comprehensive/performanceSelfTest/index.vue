<template>
  <div class="performanceSelfTest">
    <table-search class="plan-manage-list">
      <w-row slot="form" :gutter="12">
        <w-col :span="6">
          <w-form-item :label="`选择${textReplace}:`">
            <factory-select
              v-model="options.waterPlantId"
              autoSelect
              :showAll="!autoSelect"
            ></factory-select>
          </w-form-item>
        </w-col>
        <w-col :span="6">
          <w-form-item label="设备关键词:">
            <w-input
              v-model="options.keyword"
              placeholder="请输入设备名称/规格型号/编号"
              allowClear
            ></w-input>
          </w-form-item>
        </w-col>
        <w-col class="supply-float-right">
          <w-form-item>
            <w-button @click="handleReset" class="supply-mr-3" icon="reload">重置</w-button>
            <w-button type="primary" @click="search" icon="search">查询</w-button>
          </w-form-item>
        </w-col>
      </w-row>
      <div class="table-flex">
        <div class="sets-box">
          <w-button class="run-btn" type="primary" @click="handleRunAnalysis">
            运行分析
          </w-button>
        </div>
        <PaginationTable
          class="supply-h-full"
          :columns="columns"
          :loading="loading"
          :pagination="false"
          :bordered="true"
          :data-source="dataSource"
          :scroll="{ x: 1666 }"
          :rowKey="
            (record, index) => {
              return record.deviceId;
            }
          "
          @change="changePage"
          :current.sync="page.current"
          :total.sync="page.total"
          :pageSize.sync="page.pageSize"
        >
          <template slot="deviceType" slot-scope="text, record">
            <span>{{ currentDeviceType(text).fullName }}</span>
          </template>
        </PaginationTable>
      </div>
    </table-search>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import { columns } from './config';
import PaginationTable from '@/components/PaginationTable/index.vue';
import {
  sysDictListByCode,
  getStructureByStationId,
  queryEquipmentSelfCheck
} from '@/api/deviceManagement';
import FactorySelect from '@/components/factory-select/index';
import DeviceType from '../components/DeviceType.vue';
export default {
  name: 'performanceSelfTest',
  components: {
    FactorySelect,
    DeviceType,
    PaginationTable
  },
  data() {
    return {
      options: {
        keyword: '',
        waterPlantId: undefined
      },
      dataSource: [],
      columns,
      page: {
        total: 0,
        current: 1,
        pageSize: 20,
        pageSizeOptions: ['10', '20', '30', '40'],
        showSizeChanger: true
      },
      total: 2,
      loading: false,
      placeIdList: []
    };
  },
  computed: {
    ...mapState('configure', ['textReplace']),
    ...mapGetters('device', ['currentDeviceType']),
    autoSelect() {
      return this.$store.state.factoryList?.length === 1;
    }
  },
  watch: {
    'page.pageSize': {
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          this.page.current = 1;
          this.getDeviceParameters();
        }
      }
    }
  },
  mounted() {
    this.search();
  },
  async created() {
    try {
      // 这里假设getSystemDictList和getStructureByStationId是必要的异步操作
      await this.getStructureByStationId();
    } catch (error) {
      console.error('创建组件时发生错误:', error);
    }
  },
  activated() {},
  methods: {
    handleRunAnalysis() {
      this.drillDown({
        path: '/Comprehensive/performanceAnalyse',
        query: {
          origin: 'performanceSelfTest'
        }
      });
    },
    // 获取安装地址（构筑物、仓库）
    async getStructureByStationId() {
      try {
        let params = {
          waterPlantId: this.options.waterPlantId || ''
        };
        const { resultData } = await getStructureByStationId(params);
        this.placeIdList = resultData.map(item => ({
          label: item.name,
          value: item.id,
          ...item
        }));
      } catch (error) {
        console.error('获取结构失败:', error);
        // 可以在这里添加弹窗提示等用户友好的错误处理
      }
    },
    async getDeviceParameters() {
      this.loading = true;
      try {
        let params = {
          page: {
            current: this.page.current,
            size: this.page.pageSize
          },
          ...this.options
        };
        const { status, resultData } = await queryEquipmentSelfCheck(params);
        if (status === 'complete') {
          this.handleData(resultData.records);
          this.handleColumns(resultData.records);
          this.page.total = resultData.total;
          this.loading = false;
        } else {
          this.loading = false;
          throw new Error('数据获取不完整');
        }
      } catch (error) {
        this.dataSource = [];
        this.loading = false;
        console.error('获取设备参数失败:', error);
        // 可以在这里添加弹窗提示等用户友好的错误处理
      }
    },
    handleData(data) {
      this.dataSource = Array.isArray(data)
        ? data.map(item => {
            // 使用对象解构和默认值处理空数组情况
            const { electricCurrentPointRealData = [], operatingTimePointRealData = [] } = item;

            // 使用 reduce 构建对象，减少中间变量
            const electricObj = electricCurrentPointRealData.reduce(
              (acc, { pointName, pointValue }, i) => {
                acc[`electric${i + 1}`] = pointValue;
                return acc;
              },
              {}
            );

            const operatingObj = operatingTimePointRealData.reduce(
              (acc, { pointName, pointValue }, i) => {
                acc[`runTime${i + 1}`] = pointValue;
                return acc;
              },
              {}
            );

            return {
              ...item,
              ...electricObj,
              ...operatingObj
            };
          })
        : [];
    },
    handleColumns(data) {
      if (!Array.isArray(data) || data.length === 0) {
        return;
      }

      const { electricCurrentPointRealData = [], operatingTimePointRealData = [] } = data[0];

      // 都为空数组时返回
      if (electricCurrentPointRealData.length === 0 && operatingTimePointRealData.length === 0) {
        return;
      }

      // 提取公共列配置
      const baseColumns = [
        {
          title: '设备名称',
          dataIndex: 'equipmentName',
          key: 'equipmentName',
          width: 160,
          ellipsis: true
        },
        {
          title: '设备型号',
          dataIndex: 'model',
          key: 'model',
          ellipsis: true,
          width: 200
        }
      ];

      // 生成子列的工厂函数
      const createChildColumns = (items, prefix, title) => ({
        title,
        children: items.map((item, i) => ({
          title: item.pointMemo,
          dataIndex: `${prefix}${i + 1}`,
          width: 160,
          key: `${prefix}${i + 1}`,
          ellipsis: true,
          customRender: (_, record) => record[`${prefix}${i + 1}`] ?? '--'
        }))
      });

      // 组合所有列
      this.columns = [
        ...baseColumns,
        createChildColumns(operatingTimePointRealData, 'runTime', '运行时长'),
        createChildColumns(electricCurrentPointRealData, 'electric', '电流')
      ];
    },
    // 页码change
    changePage(page, pageSize) {
      this.getDeviceParameters();
    },
    // 重置
    handleReset() {
      this.options = {
        keyword: '',
        waterPlantId: this.options.waterPlantId
      };
      this.search();
    },
    search() {
      this.page.current = 1;
      this.getDeviceParameters();
    }
  }
};
</script>

<style lang="less" scoped>
.performanceSelfTest {
  width: 100%;
  height: 100%;
}
/deep/.table-page-list-container {
  .table-flex {
    width: 100%;
    height: 100%;
    padding: 16px 12px;
    position: relative;
    background: var(--supply-color-bg-card-DEFAULT);
    display: flex;
    flex-direction: column;
    .sets-box {
      display: flex;
      justify-content: flex-end;
    }
  }
}
/deep/.table-page-search-wrapper {
  padding: 12px 24px !important;
}
</style>
