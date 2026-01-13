<template>
  <div class="search-box">
    <table-search>
      <w-row slot="form">
        <w-col :span="3">
          <w-form-model-item label="" prop="type">
            <w-radio-group
              class="supply-whitespace-nowrap"
              v-model="params.type"
              button-style="solid"
            >
              <template v-for="type in typeList">
                <w-radio-button :key="type.value" :value="type.value">
                  {{ type.label }}
                </w-radio-button>
              </template>
            </w-radio-group>
          </w-form-model-item>
        </w-col>
        <w-col :span="4">
          <w-form-item label="设备名称:">
            <w-input v-model="params.deviceDesc" placeholder="请输入设备名称" />
          </w-form-item>
        </w-col>

        <w-col :span="4" :offset="1">
          <w-form-item label="监测量名称:">
            <w-input v-model="params.pointDesc" placeholder="请输入监测量名称" />
          </w-form-item>
        </w-col>

        <w-col :span="5" :offset="1">
          <w-form-item label="工艺段:">
            <w-select v-model="params.processingType" placeholder="请选择工艺段" style="width:100%">
              <w-select-option
                v-for="video in processingList"
                :key="video.dictCode"
                :value="video.dictCode"
                >{{ video.dictName }}</w-select-option
              >
            </w-select>
          </w-form-item>
        </w-col>
        <w-col :span="5" class="table-page-search-submitButtons">
          <w-button type="primary" icon="search" @click="search">
            查询
          </w-button>
          <w-button icon="sync" class="supply-mx-3" @click="reset"> 重置 </w-button>
          <return-control :is-drill-down="true"></return-control>
        </w-col>
      </w-row>
      <div class="supply-h-full supply-flex supply-flex-col">
        <div
          id="reportTableCon"
          ref="reportTableCon"
          class="report-table-con supply-bg-bg-card-component supply-flex-1 supply-overflow-hidden"
        >
          <PaginationTable
            class="supply-h-full"
            ref="table"
            bordered
            :columns="columns"
            :pagination="false"
            rowKey="uid"
            :loading="loading"
            :data-source="temperatureData"
            :current.sync="params.page.current"
            :total.sync="total"
            :pageSize.sync="params.page.size"
            @change="onPageChange"
          >
            <template slot="deviceDesc" slot-scope="text, record">
              <div v-if="record.isDeviceEdit" class="desc-box">
                <w-input v-model="record.deviceDesc" placeholder="请输入设备名称" />
                <w-icon class="supply-mx-3" type="check" @click="handleEdit(record)" />
                <w-icon type="close" @click="record.isDeviceEdit = false" />
              </div>
              <span v-else class="curpor"
                >{{ text }}
                <w-icon
                  class="supply-ml-3"
                  @click="record.isDeviceEdit = true"
                  type="edit"
                ></w-icon>
              </span>
            </template>
            <template slot="processingType" slot-scope="text, record">
              <div v-if="record.isProcessEdit" class="desc-box">
                <w-select
                  v-model="record.processingType"
                  placeholder="请选择工艺段"
                  style="width:100%"
                  @change="processingTypeChange(record.processingType, record)"
                >
                  <w-select-option
                    v-for="item in processingList"
                    :key="item.dictCode"
                    :value="item.dictCode"
                    >{{ item.dictName }}</w-select-option
                  >
                </w-select>
                <w-icon class="supply-mx-3" type="check" @click="handleEdit(record)" />
                <w-icon type="close" @click="record.isProcessEdit = false" />
              </div>
              <span v-else class="curpor"
                >{{ text ? processingDict[text] : '' }}
                <w-icon
                  class="supply-ml-3"
                  @click="record.isProcessEdit = true"
                  type="edit"
                ></w-icon>
              </span>
            </template>
            <template slot="processingSmallType" slot-scope="text, record">
              <div v-if="record.isProcessingSmallType" class="desc-box">
                <w-select
                  v-model="record.processingSmallType"
                  placeholder="请选择处理段"
                  style="width:100%"
                >
                  <w-select-option
                    v-for="item in processingSmallTypeList"
                    :key="item.dictCode"
                    :value="item.dictCode"
                    >{{ item.dictName }}</w-select-option
                  >
                </w-select>
                <w-icon class="supply-mx-3" type="check" @click="handleEdit(record)" />
                <w-icon type="close" @click="record.isProcessingSmallType = false" />
              </div>
              <span v-else class="curpor"
                >{{ record.processingTypeName ? record.processingTypeName : '' }}
                <w-icon
                  class="supply-ml-3"
                  @click="record.isProcessingSmallType = true"
                  type="edit"
                ></w-icon>
              </span>
            </template>
            <template slot="pointDesc" slot-scope="text, record">
              <div v-if="record.isPointDescEdit" class="desc-box">
                <w-input v-model="record.pointDesc" placeholder="请输入监测量名称" />
                <w-icon class="supply-mx-3" type="check" @click="handleEdit(record)" />
                <w-icon type="close" @click="record.isPointDescEdit = false" />
              </div>
              <span v-else class="curpor"
                >{{ text }}
                <w-icon
                  class="supply-ml-3"
                  @click="record.isPointDescEdit = true"
                  type="edit"
                ></w-icon>
              </span>
            </template>
            <template slot="pointValue" slot-scope="text, record">
              <span :class="{ 'point-alarm': isAlarm(record) }">{{
                text == null ? '--' : text
              }}</span>
            </template>
          </PaginationTable>
        </div>
      </div>
    </table-search>
  </div>
</template>

<script>
import { getElectricalDeviceDataPage, updateElectricalDevice } from '@/api/analysis.js';
import { sysDictListByCode } from '@/api/manage';
import PaginationTable from '@/components/PaginationTable/index.vue';
export default {
  name: 'ElectricData',
  components: { PaginationTable },
  data() {
    return {
      nullDataState: false,
      typeList: [
        {
          value: '1',
          label: '电能'
        },
        {
          value: '2',
          label: '电力'
        }
      ],
      columns: [
        {
          title: '序号',
          dataIndex: 'index',
          width: 80,
          align: 'center',
          ellipsis: 'ellipsis',
          customRender: (text, row, index) => {
            return index + 1;
          }
        },
        {
          title: '设备ID',
          width: 200,
          align: 'center',
          dataIndex: 'industryDeviceId'
        },
        {
          title: '设备名称',
          dataIndex: 'deviceDesc',
          align: 'center',
          scopedSlots: { customRender: 'deviceDesc' }
        },
        {
          title: '监测量名称',
          align: 'center',
          dataIndex: 'pointDesc',
          scopedSlots: { customRender: 'pointDesc' },
          defaultChecked: true
        },
        {
          title: '监测量',
          align: 'center',
          dataIndex: 'pointName'
        },
        {
          title: '监测量值',
          dataIndex: 'pointValue',
          align: 'center',
          scopedSlots: { customRender: 'pointValue' }
        },
        {
          title: '工艺段',
          dataIndex: 'processingType',
          align: 'center',
          scopedSlots: { customRender: 'processingType' }
        },
        {
          title: '处理段',
          dataIndex: 'processingSmallType',
          align: 'center',
          scopedSlots: { customRender: 'processingSmallType' }
        }
      ],
      loading: false,
      temperatureData: [],
      processingSmallTypeList:[],
      processingList: [],
      processingDict: {},
      params: {
        type: '1',
        deviceDesc: '',
        pointDesc: '',
        processingType: undefined,
        page: {
          current: 1,
          size: 20
        }
      },
      total: 0
    };
  },
  watch: {
    'params.type'() {
      this.search();
    }
  },
  mounted() {
    this.getDict();
  },
  methods: {
    search() {
      this.params.page.current = 1;
      this.getLoadData();
    },
    async processingTypeChange(code, record) {
      record.processingSmallType = '';
      let { resultData, status } = await sysDictListByCode(code);
      if (status === 'complete') {
        this.processingSmallTypeList = resultData;
      }
    },
    handleEdit(record) {
      let params = {
        ...record
      };
      updateElectricalDevice(params).then(res => {
        if (res.status === 'complete') {
          record.isDeviceEdit = false;
          record.isPointDescEdit = false;
          record.isProcessEdit = false;
          record.isProcessingSmallType = false;
          this.$message.success('修改成功');
          this.getLoadData();
        }
      });
    },
    isAlarm(record) {
      if (record.pointValue || record.pointValue == 0) {
        return !this.isBetweenInclusive(record.pointValue, record.maxValue, record.minValue);
      } else {
        return false;
      }
    },
    isBetweenInclusive(data, max, min) {
      if (data === '--') return true;
      if ((min || min === 0) && max) {
        return data >= min && data <= max;
      } else if ((min || min === 0) && !max) {
        return data >= min;
      } else if (!min && max) {
        return data <= max;
      } else {
        return true;
      }
    },

    /* 改变页码 */
    onPageChange(page, size) {
      this.params.page.current = page;
      this.getLoadData();
    },
    //字典code
    async getDict() {
      let { resultData, status } = await sysDictListByCode('energy_processing_type');
      if (status === 'complete') {
        this.processingList = resultData;
        resultData.forEach(item => {
          this.processingDict[item.dictCode] = item.dictName;
        });
      }
      this.search();
    },
    // 加载数据方法 必须为 Promise 对象
    getLoadData() {
      this.loading = true;
      getElectricalDeviceDataPage(this.params).then(res => {
        if (res.status === 'complete') {
          this.loading = false;
          this.temperatureData = res.resultData.records.map(item => {
            return { ...item, isDeviceEdit: false, isProcessEdit: false, isProcessingSmallType: false, isPointDescEdit: false };
          });
          this.total = res.resultData.total;
        } else {
          this.loading = false;
          this.temperatureData = [];
          this.total = 0;
        }
      });
    },
    // 重置
    reset() {
      this.params = {
        stationName: '',
        page: {
          current: 1,
          size: 20
        }
      };
      this.getLoadData();
    }
  }
};
</script>

<style lang="less" scoped>
.search-box {
  width: 100%;
  height: 100%;
  overflow: auto;
  /deep/.table-page-search-wrapper {
    padding: 10px 20px;
  }
  .table {
    background-color: var(--supply-color-bg-card-component);
  }
  .report-table-con {
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
    .curpor,
    .desc-box {
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
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
}
</style>
