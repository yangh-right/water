<!--
 * @Description: 仓储管理-库存台账页面
 * @Author: qirui
-->
<template>
  <div class="warehouse-common inventory-ledger">
    <w-form-model
      class="warehouse-common-top"
      ref="formItems"
      :model="formItem"
      :label-width="100"
      v-bind="layout"
    >
      <w-row :gutter="10">
        <w-col :span="6" v-bind="grid">
          <w-form-model-item :label="`选择${textReplace}`" label-for="emergency">
            <factory-select
              v-model="formItem.waterPlantId"
              autoSelect
              :showAll="!autoSelect"
            ></factory-select>
          </w-form-model-item>
        </w-col>
        <w-col :span="6" v-bind="grid">
          <w-form-model-item label="表单类型：" label-for="billType" prop="billType">
            <w-select v-model="formItem.billType">
              <w-select-option
                v-for="(item, i) in billTypeData"
                :key="item.value + '' + i"
                :value="item.value"
                >{{ item.label }}</w-select-option
              >
            </w-select>
          </w-form-model-item>
        </w-col>
        <template v-if="collapse">
          <w-col :span="6" v-bind="grid">
            <w-form-model-item label="物品类别：" label-for="materielTypeId" prop="materielTypeId">
              <w-tree-select
                :replaceFields="fieldNames"
                :treeData="articleTypeList"
                v-model="formItem.materielTypeId"
                :dropdownStyle="{ maxHeight: '300px' }"
              >
              </w-tree-select>
            </w-form-model-item>
          </w-col>
          <w-col :span="6" v-bind="grid">
            <w-form-model-item label="关键字：" label-for="materielNo" prop="materielNo">
              <w-input
                v-model="formItem.keywords"
                placeholder="请输入物品名称或物品编号"
                @pressEnter="refresh"
              ></w-input>
            </w-form-model-item>
          </w-col>
          <w-col :span="6" v-bind="grid">
            <w-form-model-item label="仓库：" label-for="depotId" prop="depotId">
              <w-select v-model="formItem.depotId" @focus="checkFactory">
                <w-select-option
                  v-for="(item, i) in warehouseList"
                  :key="item.id + '' + i"
                  :value="item.id"
                  >{{ item.depotName }}</w-select-option
                >
              </w-select>
            </w-form-model-item>
          </w-col>
          <w-col :span="6" v-bind="grid">
            <w-form-model-item label="表单时间：" label-for="startDate" prop="startDate">
              <w-range-picker
                v-model="formItem.startDate"
                split-panels
                style="width: 100%"
              ></w-range-picker>
            </w-form-model-item>
          </w-col>
          <w-col :span="6" v-bind="grid">
            <w-form-model-item label="供应商：" label-for="supplier" prop="supplier">
              <w-select v-model="formItem.supplier" allowClear>
                <w-select-option
                  v-for="(item, i) in supplierDic"
                  :key="item.code + '' + i"
                  :value="item.code"
                  >{{ item.name }}</w-select-option
                >
              </w-select>
            </w-form-model-item>
          </w-col>
          <w-col :span="6" v-bind="grid">
            <w-form-model-item label="领用单位：" label-for="receiptUnit" prop="receiptUnit">
              <w-input @pressEnter="refresh" v-model="formItem.receiptUnit"></w-input>
            </w-form-model-item>
          </w-col>
          <w-col :span="6" v-bind="grid" style="height:44px">
            <w-form-model-item label="库单状态：" label-for="billStates" prop="billStates">
              <w-select
                showArrow
                class="bill-state"
                mode="multiple"
                @change="selectBillStatus"
                v-model="formItem.billStates"
              >
                <w-select-option
                  v-for="(item, i) in billStateList"
                  :key="item.label + '' + i"
                  :value="i"
                  >{{ item.label }}</w-select-option
                >
              </w-select>
            </w-form-model-item>
          </w-col>
        </template>
        <w-col class="supply-float-right">
          <w-button class="mr_12 supply-top-1" @click="handleExportExcel(1)"
            ><w-icon type="export" />入库流水导出</w-button
          >
          <w-button class="mr_12 supply-top-1" @click="handleExportExcel(2)"
            ><w-icon type="export" />出库流水导出</w-button
          >
          <w-button @click="handleReset" class="mr_12 supply-top-1" icon="reload">重置</w-button>
          <w-button type="primary" @click="refresh" class="mr_12 supply-top-1" icon="search"
            >查询</w-button
          >
          <a @click="collapse = !collapse" class="mr_12 supply-top-1">
            <template v-if="!collapse">
              展开
              <w-icon type="down" />
            </template>
            <template v-else>
              收起
              <w-icon type="up" />
            </template>
          </a>
          <return-control :is-drill-down="true" path="/warehouse"></return-control>
        </w-col>
      </w-row>
    </w-form-model>
    <div class="warehouse-common-con">
      <s-table
        ref="table"
        :scroll="{ x: 2000 }"
        :columns="maintainColumns"
        :rowKey="(record, index) => record.materielNo + '' + index"
        :canResize="true"
        :initLoadData="false"
        :data="getInventoryFlowList"
        class="ivu-mt"
      >
        <template slot="transactor" slot-scope="text, row">
          <!-- <GlobalUserSpan v-model="row.transactor"></GlobalUserSpan> -->
          {{ text }}
        </template>
        <template slot="factoryName" slot-scope="text">
          <w-tooltip>
            <template slot="title">{{ text }}</template>
            {{ text }}
          </w-tooltip>
        </template>
        <template slot="supplier" slot-scope="text">
          {{ getDicName(supplierDic, text) }}
        </template>
        <template slot-scope="txt, row" slot="billType">
          <span>{{ row.status == 1 ? '入库' : '出库' }}</span>
        </template>
      </s-table>
    </div>
    <ExportModal v-model="showExportModal" :percent="percent" :status="exportStatus" />
  </div>
</template>

<script>
import { getDicName } from '@/utils/util';
import {
  getInventoryFlowList,
  inoutDetailExportExcel,
  getBeseDepotList,
  getBaseMaterielType,
  getSupplierList
} from '@/api/warehouse.js';
import { mapState } from 'vuex';
import ExportModal from './components/export';
import FactorySelect from '@/components/factory-select/index';
import GlobalUserSpan from './components/globalUser-span/index.vue';
import { exportFile } from './base/exportFile';
import Loop from './base/levelLoop';
import moment from 'moment';

export default {
  name: 'inventoryLedger',
  components: { ExportModal, FactorySelect, GlobalUserSpan },
  data() {
    let startDate = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000);
    let rangeDate = [this.$moment(startDate), this.$moment(new Date())];
    return {
      supplierDic: [],
      showExportModal: false, // 导出
      percent: 0,
      exportStatus: 0,
      grid: {
        xl: 6,
        lg: 6,
        md: 12,
        sm: 24,
        xs: 24
      },
      layout: {
        labelCol: { span: 6 },
        wrapperCol: { span: 18 }
      },
      formItem: {
        keywords: '',
        billStatusList: [],
        materielTypeId: null,
        depotId: '',
        waterPlantId: undefined,
        transactor: '',
        startDate: rangeDate,
        startTime: '',
        endTime: '',
        billType: '',
        warehouse: ''
      },
      billStateList: [
        {
          value: ['未提交', '审核中', '审核未通过'],
          label: '未审核'
        },
        {
          value: ['已出库', '已入库'],
          label: '已审核'
        },
        {
          value: ['已作废'],
          label: '已作废'
        }
      ],
      tableLoading: false,
      billTypeData: [
        {
          value: 1,
          label: '入库'
        },
        {
          value: 2,
          label: '出库'
        }
      ],
      articleTypeList: [],
      fieldNames: {
        // cascader
        label: 'name',
        value: 'id',
        children: 'children'
      },
      unitData: [
        {
          value: 1,
          label: '南山水厂'
        }
      ],
      collapse: false,
      addInfoFormModel: false,
      maintainColumns: [
        {
          title: '序号',
          width: 60,
          align: 'center',
          dataIndex: 'index',
          fixed: 'left',
          customRender: (text, row, index) => {
            return index + 1;
          }
        },
        {
          title: '污水厂名称',
          key: 'waterPlantName',
          dataIndex: 'waterPlantName',
          fixed: 'left',
          width: 150
        },
        {
          title: '仓库',
          tooltip: true,
          key: 'depotName',
          width: 120,
          dataIndex: 'depotName',
          scopedSlots: { customRender: 'factoryName' },
          ellipsis: true
        },
        {
          title: '物品编号',
          tooltip: true,
          width: 150,
          key: 'materielNo',
          dataIndex: 'materielNo',
          scopedSlots: { customRender: 'factoryName' },
          ellipsis: true
        },
        {
          title: '物品名称',
          tooltip: true,
          width: 100,
          key: 'materielName',
          dataIndex: 'materielName',
          scopedSlots: { customRender: 'factoryName' },
          ellipsis: true
        },
        {
          title: '规格型号',
          key: 'specification',
          dataIndex: 'specification',
          width: 100,
          scopedSlots: { customRender: 'factoryName' },
          tooltip: true,
          ellipsis: true
        },
        {
          title: '供应商',
          key: 'supplier',
          scopedSlots: { customRender: 'supplier' },
          dataIndex: 'supplier',
          width: 120
        },
        {
          title: '领用单位',
          key: 'receiptUnit',
          dataIndex: 'receiptUnit',
          width: 120
        },
        {
          title: '经办人',
          slot: 'transactor',
          scopedSlots: { customRender: 'transactor' },
          key: 'transactor',
          width: 100,
          dataIndex: 'transactor',
          tooltip: true
        },
        {
          title: '表单日期',
          key: 'billDate',
          width: 100,
          dataIndex: 'billDate',
          tooltip: true
        },
        {
          title: '表单类型',
          slot: 'billType',
          scopedSlots: { customRender: 'billType' },
          key: 'billType',
          width: 100,
          dataIndex: 'status',
          tooltip: true
        },
        {
          title: '数量',
          key: 'quantity',
          width: 100,
          dataIndex: 'quantity',
          tooltip: true
        },
        {
          title: '计量单位',
          key: 'unit',
          width: 100,
          dataIndex: 'unit',
          tooltip: true
        },
        {
          title: '单价（元）',
          key: 'price',
          width: 100,
          dataIndex: 'price',
          tooltip: true
        },
        {
          title: '金额（元）',
          key: 'totalAmount',
          width: 100,
          dataIndex: 'totalAmount',
          scopedSlots: { customRender: 'factoryName' },
          tooltip: true
        }
      ], // 仓库流水表头
      pageData: {
        pageSize: 20, // 十条
        current: 1
      },
      warehouseList: [],
      maintainList: []
    };
  },
  computed: {
    ...mapState('configure', ['textReplace']),
    autoSelect() {
      return this.$store.state.factoryList?.length === 1;
    }
  },
  watch: {
    'formItem.startDate': {
      handler(date) {
        this.formItem.startBillDate = moment(date[0]).format('YYYY-MM-DD 00:00:00');
        this.formItem.endBillDate = moment(date[1]).format('YYYY-MM-DD HH:mm:ss');
      },
      immediate: true
    },
    'formItem.waterPlantId': {
      handler(val) {
        if (val) {
          this.getBeseDepotList();
        } else {
          this.warehouseList = [];
        }
      },
      deep: true,
      immediate: true
    }
  },
  mounted() {
    this.getTypeList();
  },
  activated() {
    this.getSupplierList();
    this.refresh(true);
  },
  methods: {
    getDicName,
    async getSupplierList() {
      const res = await getSupplierList({ current: 1, size: 1000 });
      const { status, resultData } = res;
      if (status === 'complete') {
        this.supplierDic = res.resultData || [];
      }
    },
    // 单位是否已选择
    checkFactory() {
      if (!this.formItem.waterPlantId) {
        this.$message.warn('请先选择污水厂');
      }
    },
    moment,
    // 厂选择
    changeFactory(val) {
      this.refresh();
      if (val) {
        this.getBeseDepotList();
      } else {
        this.warehouseList = [];
      }
    },
    selectBillStatus() {
      let billStatusList = [];
      this.formItem.billStates.forEach(item => {
        billStatusList = billStatusList.concat(this.billStateList[item].value || []);
      });
      this.formItem.billStatusList = billStatusList;
    },
    // 获取列表
    getInventoryFlowList(parameter) {
      const vo = {
        ...this.formItem,
        materielTypeId: +this.formItem.materielTypeId || '',
        page: {
          current: parameter.pageNo,
          size: parameter.pageSize
        }
      };

      this.tableLoading = true;
      return getInventoryFlowList(vo).then(response => {
        this.tableLoading = false;
        let arr = response.resultData.records || [];
        if (arr && arr.length) {
          arr.forEach(item => {
            item.billDate = item.billDate.split(' ')[0];
          });
        }
        this.maintainList = arr;
        return response.resultData;
      });
    },
    refresh(bool = true, flage = true) {
      if (this.$refs.table && !this.$refs.table.localLoading) {
        this.$refs.table.refresh(bool);
      }
    },
    // 导出当前展示数据
    handleExportExcel(billType) {
      const vo = {
        waterPlantId: this.formItem.waterPlantId,
        page: {
          current: this.pageData.current,
          size: this.pageData.pageSize
        }
      };
      Object.assign(vo, this.formItem);
      vo.billType = billType;
      vo.endBillDate = this.formItem.endBillDate;
      vo.startBillDate = this.formItem.startBillDate;
      let fileName = billType === 1 ? '入库明细' : '出库明细';
      inoutDetailExportExcel(vo).then(res => {
        exportFile(res, fileName);
      });
    },
    // 获取仓库列表
    getBeseDepotList() {
      this.tableLoading = true;
      const vo = {
        waterPlantId: this.formItem.waterPlantId
      };
      getBeseDepotList(vo).then(responst => {
        this.tableLoading = false;
        this.warehouseList = responst.resultData.records;
      });
    },
    // 重置
    handleReset() {
      let startDate = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000);
      let rangeDate = [this.$moment(startDate), this.$moment(new Date())];
      this.formItem = {
        keywords: '',
        materielTypeId: null,
        depotId: '',
        billStatusList: [],
        waterPlantId: undefined,
        startDate: rangeDate,
        transactor: '',
        startTime: '',
        endTime: '',
        billType: '',
        warehouse: '',
        startBillDate: moment(rangeDate[0]).format('YYYY-MM-DD'),
        endBillDate: moment(rangeDate[1]).format('YYYY-MM-DD')
      };
      this.refresh();
    },
    // 导出
    exportFail() {},
    // 查询日期
    handleChangeDate(date) {
      this.formItem.startBillDate = moment(date[0]).format('YYYY-MM-DD');
      this.formItem.endBillDate = moment(date[1]).format('YYYY-MM-DD');
    },
    // 获取物品类别
    getTypeList() {
      this.tableLoading = true;
      getBaseMaterielType(this.formItem.waterPlantId).then(respionse => {
        this.tableLoading = false;
        const oldList = Loop.levelLoop(respionse.resultData);
        loopChangeTitle(oldList);
        function loopChangeTitle(obj) {
          obj.forEach(item => {
            item.value = item.id;
            item.label = item.materielTypeName;
            if (item.children) {
              loopChangeTitle(item.children);
            }
          });
        }
        this.articleTypeList = oldList;
      });
    },
    // 导出
    handleShowExportModal(result) {
      this.showExportModal = true;
      this.percent = 0;
      this.exportStatus = 0;
      const loopHandler = setInterval(() => {
        this.percent += Math.floor(Math.random() * 10 + 1);
        if (this.percent > 99) {
          this.percent = 100;
          clearInterval(loopHandler);
          this.exportStatus = result ? 1 : -1;
        }
      }, 200);
    }
  }
};
</script>
<style lang="less" scoped>
@import './warehouse-top.less';
/deep/ .bill-state {
  padding-top: 3px;
  .wpg-select-selection--multiple {
    height: 36px;
    cursor: pointer;
    .wpg-select-arrow {
      padding-top: 3px;
    }
    .wpg-select-selection__rendered {
      height: 31px;
      ul {
        display: flex;
      }
    }
  }
}
.ivu-mt {
  height: 100%;
}
</style>
