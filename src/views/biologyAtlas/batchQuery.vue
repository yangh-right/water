<!--
 * @Author: wangyr
 * @Date: 2023-05-18 10:53:35
 * @LastEditors: wangyr
 * @LastEditTime: 2025-02-11 10:30:04
 * @Description:
-->
<template>
  <div class="batchQuery">
    <div v-show="isAddStatus === 'table'" class="batchQuery-box">
      <div class="batchQuery-head">
        <w-form-model
          class="supply-bg-bg-card-DEFAULT"
          layout="inline"
          ref="form"
          :model="searchForm"
        >
          <w-form-model-item label="选择污水厂" prop="keyWord">
            <factory-select
              style="width: 220px"
              autoSelect
              v-model="searchForm.waterPlantId"
            ></factory-select>
          </w-form-model-item>
          <w-form-model-item label=" 取样时间" prop="keyWord">
            <w-range-picker v-model="samplTime" style="width: 300px;" allowClear />
          </w-form-model-item>
          <w-form-model-item label="批次名称" prop="keyWord">
            <w-input
              v-model="searchForm.batchName"
              allowClear
              placeholder="请输入批次名称"
              style="width: 230px;"
            />
          </w-form-model-item>
          <w-form-model-item label="文件类型" prop="keyWord">
            <w-select
              v-model="searchForm.fileType"
              allowClear
              style="width: 230px"
              placeholder="不限"
            >
              <w-select-option value="">
                全部
              </w-select-option>
              <w-select-option
                v-for="item of fileTypeData"
                :key="item.dictCode"
                :value="item.dictValue"
              >
                {{ item.dictName }}
              </w-select-option>
            </w-select>
          </w-form-model-item>
          <w-form-model-item label="识别状态" prop="keyWord">
            <w-select
              v-model="searchForm.status"
              allowClear
              style="width: 230px"
              placeholder="不限"
            >
              <w-select-option value="">
                全部
              </w-select-option>
              <w-select-option
                v-for="item of statusData"
                :key="item.dictCode"
                :value="item.dictValue"
              >
                {{ item.dictName }}
              </w-select-option>
            </w-select>
          </w-form-model-item>
          <w-form-model-item label="取样位置" prop="keyWord">
            <w-select
              v-model="searchForm.sampleLocation"
              allowClear
              style="width: 230px"
              placeholder="不限"
            >
              <w-select-option value="">
                全部
              </w-select-option>
              <w-select-option v-for="item of samplLocation" :key="item.value" :value="item.value">
                {{ item.label }}
              </w-select-option>
            </w-select>
          </w-form-model-item>
          <w-form-model-item prop="keyWord" style="float: right;">
            <w-button type="primary" @click="addBatchQuery" icon="plus">
              新建批次
            </w-button>
            <w-button icon="reload" class="supply-mx-3" @click="resetClick">
              重置
            </w-button>
            <w-button type="primary" icon="search" @click="searchClick">
              查询
            </w-button>
          </w-form-model-item>
        </w-form-model>
      </div>
      <div class="batchQuery-central">
        <div class="table-box">
          <w-table
            :columns="columns"
            :scroll="{ y: 670 }"
            :data-source="tableData"
            bordered
            :pagination="false"
          >
            <template slot="operation" slot-scope="text, record">
              <a @click="discernSampl(record)">识别取样</a>
              <a style="margin-left: 10px;" @click="discernResult(record)">识别结果</a>
              <w-popconfirm
                title="确定删除该批次数据吗？"
                ok-text="确定"
                cancel-text="取消"
                @confirm="deleteBatch(record)"
              >
                <a style="margin-left: 10px;">删除</a>
              </w-popconfirm>
            </template>
          </w-table>
        </div>
        <div class="pagination">
          <w-pagination
            show-size-changer
            :current="current"
            :page-size.sync="pageSize"
            :total="total"
            @showSizeChange="onShowSizeChange"
            @change="currentChange"
          />
        </div>
      </div>
    </div>
    <div v-if="isAddStatus === 'add'" class="addBatchQuery">
      <addBatchQuery
        @getBack="getBack"
        :isDiscern="isDiscern"
        :discernObj="discernObj"
        :eyepieceData="eyepieceData"
        :objectiveLensData="objectiveLensData"
        :fileTypeData="fileTypeData"
        :statusData="statusData"
        :samplLocation="samplLocation"
        :factoryList="factoryList"
      ></addBatchQuery>
    </div>
    <div v-if="isAddStatus === 'detail'" class="addBatchQuery">
      <batchDetail @goBack="getBacks" :batchDetailObj="batchDetailObj"></batchDetail>
    </div>
  </div>
</template>

<script>
import { getBatchPage, getBatchDetail, deleteBatch } from '@/api/biologyAtlas';
import { sysDictListByCode, getStructureByStationId } from '@/api/deviceManagement';
import addBatchQuery from './addBatchQuery';
import batchDetail from './components/batchDetail';
import FactorySelect from '@/components/factory-select';
import moment from 'moment';
export default {
  name: 'BiologyAtlas',
  components: { addBatchQuery, batchDetail, FactorySelect },
  mixins: [],
  data() {
    return {
      current: 1,
      pageSize: 20,
      total: 0,
      searchForm: {
        batchName: '',
        fileType: '',
        status: '',
        sampleLocation: '',
        waterPlantId: '',
        startTime: '',
        endTime: ''
      },
      samplTime: [],
      columns: [
        {
          title: '序号',
          dataIndex: 'num',
          key: 'num',
          align: 'center',
          width: 80,
          customRender: (text, row, index) => {
            return index + 1;
          }
        },
        {
          title: '批次名称',
          dataIndex: 'batchName',
          align: 'center',
          width: 250,
          key: 'batchName'
        },
        {
          title: '取样时间',
          dataIndex: 'sampleTime',
          align: 'center',
          width: 200,
          key: 'sampleTime'
        },
        {
          title: '取样位置',
          align: 'center',
          dataIndex: 'sampleLocationText',

          key: 'sampleLocationText'
        },
        {
          title: '批次状态',
          align: 'center',
          dataIndex: 'statusText',

          key: 'statusText'
        },
        {
          title: '文件类型',
          dataIndex: 'fileTypeText',
          align: 'center',
          key: 'fileTypeText'
        },
        {
          title: '原始文件数量',
          dataIndex: 'fileNum',
          align: 'center',
          key: 'fileNum',
          customRender: (text, row, index) => {
            return row.microorganismBatchFileList.length;
          }
        },
        {
          title: '目镜',
          dataIndex: 'eyepiece',
          align: 'center',
          key: 'eyepiece'
        },

        {
          title: '物镜',
          dataIndex: 'objectiveLens',
          align: 'center',
          key: 'objectiveLens'
        },
        {
          title: '操作',
          dataIndex: 'operation',
          align: 'center',
          width: 200,
          key: 'operation',
          scopedSlots: { customRender: 'operation' }
        }
      ],
      tableData: [],
      atlasId: '',
      eyepieceData: [],
      objectiveLensData: [],
      fileTypeData: [],
      statusData: [],
      dictionaries: [
        {
          type: 'purification_microorganism_eyepiece',
          name: 'eyepiece'
        },
        {
          type: 'purification_microorganism_objectiveLens',
          name: 'objectiveLens'
        },
        {
          type: 'purification_microorganism_file_type',
          name: 'fileType'
        },
        {
          type: 'purification_microorganism_status',
          name: 'status'
        }
      ],
      samplLocation: [],
      factoryList: [],
      isAddStatus: 'table',
      isDiscern: false,
      discernObj: {},
      batchDetailObj: {}
    };
  },
  computed: {},
  watch: {
    'searchForm.waterPlantId': {
      immediate: true,
      async handler(val) {
        if (val) {
          this.searchForm.sampleLocation = '';
          this.getStructureByStationId();
        }
      }
    }
  },
  activated() {},
  async mounted() {
    await this.getSysDictListByCode();
    await this.getFactoryList();
    this.searchClick();
  },
  methods: {
    getSysDictListByCode() {
      this.dictionaries.forEach(async item => {
        const { resultData } = await sysDictListByCode(item.type);
        this[item.name + 'Data'] = resultData;
      });
    },
    // 获取安装地址（构筑物、仓库）
    async getStructureByStationId() {
      let params = {
        waterPlantId: this.searchForm.waterPlantId ? this.searchForm.waterPlantId : ''
      };
      const { resultData } = await getStructureByStationId(params);
      let data = resultData.map(item => {
        return {
          label: item.name,
          value: item.id,
          ...item
        };
      });
      this.samplLocation = data;
    },
    async getFactoryList() {
      const { resultData } = await this.$http.post('waterPlantClient/getWaterPlants');
      this.factoryList = resultData;
    },
    searchClick() {
      this.current = 1;
      this.getPageData();
    },
    getPageData() {
      let params = {
        ...this.searchForm,
        page: {
          current: this.current,
          size: this.pageSize
        },
        startTime: this.samplTime[0] ? moment(this.samplTime[0]).format('YYYY-MM-DD 00:00:00') : '',
        endTime: this.samplTime[1] ? moment(this.samplTime[1]).format('YYYY-MM-DD 23:59:59') : ''
      };
      getBatchPage(params).then(res => {
        let { status, resultData } = res;
        if (status === 'complete') {
          resultData.records.forEach(item => {
            item.sampleLocationText =
              this.samplLocation.find(it => it.id === item.sampleLocation)?.name || '';
            item.statusText =
              this.statusData.find(it => Number(it.dictValue) === Number(item.status))?.dictName ||
              '';
            item.fileTypeText =
              this.fileTypeData.find(it => it.dictValue === item.fileType)?.dictName || '';
          });
          this.tableData = resultData.records;
          this.total = resultData.total;
        }
      });
    },
    resetClick() {
      this.searchForm = {
        batchName: '',
        fileType: '',
        status: '',
        sampleLocation: '',
        waterPlantId: '',
        startTime: '',
        endTime: ''
      };
      this.samplTime = [];
      this.current = 1;
      this.pageSize = 20;
      this.searchClick();
    },
    onShowSizeChange(current, size) {
      this.current = 1;
      this.pageSize = size;
      this.getPageData();
    },
    currentChange(page, pageSize) {
      this.current = page;
      this.pageSize = pageSize;
      this.getPageData();
    },
    deleteBatch(row) {
      deleteBatch(row.id).then(res => {
        if (res.status === 'complete') {
          this.$message.success('删除成功');
          this.searchClick();
        }
      });
    },
    discernSampl(row) {
      this.discernObj = row;
      this.isDiscern = true;
      this.isAddStatus = 'add';
    },
    discernResult(row) {
      this.isAddStatus = 'detail';
      getBatchDetail(row.id).then(res => {
        if (res.status === 'complete') {
          this.samplLocation.forEach(item => {
            if (item.value === res.resultData.sampleLocation) {
              res.resultData.sampleLocationText = item.label;
            }
          });
          this.batchDetailObj = res.resultData;
        }
      });
    },
    addBatchQuery() {
      this.isAddStatus = 'add';
    },
    getBack() {
      this.isAddStatus = 'table';
      this.isDiscern = false;
      this.getPageData();
    },
    getBacks() {
      this.isAddStatus = 'table';
    }
  }
};
</script>

<style lang="less" scoped>
.batchQuery {
  height: 100%;
  width: 100%;
  .batchQuery-box {
    height: 100%;
    width: 100%;
  }
  .addBatchQuery {
    height: 100%;
    width: 100%;
  }
  // padding: 10px;
  .batchQuery-head {
    width: 100%;
    min-height: 60px;
    background-color: var(--supply-color-bg-card-DEFAULT);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
  }
  .batchQuery-central {
    margin-top: 10px;
    height: calc(100% - 120px);
    width: 100%;
    background-color: var(--supply-color-bg-card-DEFAULT);
    border-radius: 4px;
    padding: 10px 12px;
    .table-box {
      width: 100%;
      height: calc(100% - 50px);
      .file-item {
        width: 120px;
        height: 120px;
        cursor: pointer;
      }
    }
    .pagination {
      height: 50px;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }
  }
}
</style>
