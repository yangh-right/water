<!--
 * @Description: 仓储管理-库存查询页面
 * @Author: qirui
-->
<template>
  <div class="warehouse-common warehouse-registration">
    <w-form-model
      ref="formItems"
      class="warehouse-common-top"
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
          <w-form-model-item label="关键字：" label-for="keywords" prop="keywords">
            <w-input
              v-model="formItem.keywords"
              placeholder="请输入物品名称或物品编号"
              @pressEnter="refresh"
            ></w-input>
          </w-form-model-item>
        </w-col>
        <template v-if="collapse">
          <w-col :span="6" v-bind="grid">
            <w-form-model-item label="物品类别：" label-for="materielTypeId" prop="materielTypeId">
              <w-tree-select
                :replaceFields="fieldNames"
                :treeData="articleTypeList"
                v-model="formItem.materielTypeId"
                :dropdown-style="{ 'max-height': '300px' }"
              >
              </w-tree-select>
            </w-form-model-item>
          </w-col>
          <w-col :span="6" v-bind="grid">
            <w-form-model-item label="仓库：" label-for="depotId" prop="depotId">
              <w-select v-model="formItem.depotId" @focus="checkFactory" allowClear>
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
            <w-form-model-item label="报警类型：" label-for="StockAlarm" prop="StockAlarm">
              <w-select v-model="formItem.StockAlarm" allowClear>
                <w-select-option
                  v-for="(item, i) in StockAlarmList"
                  :key="item.value + '' + i"
                  :value="item.value"
                  >{{ item.label }}</w-select-option
                >
              </w-select>
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
        </template>
        <w-col class="supply-float-right">
          <w-form-model-item :labelCol="{ span: 0 }" :wrapperCol="{ span: 24 }">
            <w-button class="mr_12 supply-relative" @click="handleExportExcel"
              ><w-icon type="export" /> 导出</w-button
            >
            <w-button @click="handleReset" class="mr_12" icon="reload">重置</w-button>
            <w-button type="primary" @click="refresh" class="mr_12" icon="search">查询</w-button>
            <a @click="collapse = !collapse" class="mr_12">
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
          </w-form-model-item>
        </w-col>
      </w-row>
    </w-form-model>
    <div class="warehouse-common-con">
      <!-- <div class="fix-box warehouse-common-con-btn">
        <div>
          总金额:
          <span class="total-txt">￥{{ totalAmount }}</span> 元
        </div>
      </div> -->
      <s-table
        ref="table"
        :scroll="{ x: 1600 }"
        :columns="maintainColumns"
        :rowKey="(record, index) => record.depotId + '' + index"
        :canResize="true"
        :initLoadData="false"
        :data="getDataList"
        class="inventory-table"
      >
        <template slot-scope="txt, row" slot="stockAlarm">
          <w-tag color="green" v-if="row.stockAlarm === 0">库存安全</w-tag>
          <w-tag color="red" v-else>库存报警</w-tag>
        </template>
        <template slot="factoryName" slot-scope="text">
          <w-tooltip>
            <template slot="title">{{ text }}</template>
            {{ text }}
          </w-tooltip>
        </template>
      </s-table>
    </div>
    <ExportModal v-model="showExportModal" :percent="percent" :status="exportStatus" />
  </div>
</template>

<script>
import {
  queryTotalAmount,
  getStockList,
  stockExportExcel,
  getBeseDepotList,
  getBaseMaterielType,
  getSupplierList
} from '@/api/warehouse.js';
import { mapState } from 'vuex';
import { getDicName } from '@/utils/util';
import ExportModal from './components/export';
import FactorySelect from '@/components/factory-select/index';
import { exportFile } from './base/exportFile';
import Loop from './base/levelLoop';
export default {
  name: 'inventoryCheck',
  components: { ExportModal, FactorySelect },
  data() {
    return {
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
        waterPlantId: undefined, // 单位
        keywords: '',
        orderId: '', // 单号
        source: '', // 来源
        type: '', // 类别
        name: '', // 商品名称
        status: '', // 状态
        startDate: '', // 出库日期
        endDate: '', // 出库截止日期
        materielTypeId: null,
        supplier: ''
      },
      unitData: [
        {
          value: '1',
          label: '福田水厂'
        }
      ],
      sourceData: [
        {
          value: '1',
          label: '厂家备件'
        }
      ], // 物资来源
      typeData: [
        {
          value: '1',
          label: '阀门'
        }
      ], // 物品类别
      statusData: [
        {
          value: '1',
          label: '待出库'
        }
      ],
      collapse: true,
      pageData: {
        pageSize: 20, // 十条
        current: 1
      },
      maintainList: [], // 仓库数据
      tableLoading: false,
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
          ellipsis: true,
          scopedSlots: { customRender: 'factoryName' }
        },
        {
          title: '物品编号',
          tooltip: true,
          key: 'materielNo',
          width: 150,
          dataIndex: 'materielNo',
          scopedSlots: { customRender: 'factoryName' },
          ellipsis: true
        },
        {
          title: '物品名称',
          tooltip: true,
          key: 'materielName',
          dataIndex: 'materielName',
          scopedSlots: { customRender: 'factoryName' },
          width: 100,
          ellipsis: true
        },
        {
          title: '物品类别',
          key: 'materielTypeName',
          dataIndex: 'materielTypeName',
          width: 100,

          scopedSlots: { customRender: 'factoryName' },
          tooltip: true,
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
          title: '数量',
          key: 'existingQuantity',
          dataIndex: 'existingQuantity',
          width: 100,

          tooltip: true
        },
        {
          title: '计量单位',
          key: 'unit',
          width: 100,

          dataIndex: 'unit',
          tooltip: true
        },
        // {
        //   title: '单价（元）',
        //   key: 'price',
        //   width: 100,

        //   dataIndex: 'price',
        //   tooltip: true
        // },
        // {
        //   title: '金额（元）',
        //   key: 'totalAmount',
        //   width: 100,

        //   dataIndex: 'totalAmount',
        //   scopedSlots: { customRender: 'factoryName' },
        //   tooltip: true
        // },
        {
          title: '安全库存',
          width: 100,

          key: 'minInventory',
          dataIndex: 'minInventory',
          tooltip: true
        },
        {
          title: '库存预警',
          slot: 'stockAlarm',
          scopedSlots: { customRender: 'stockAlarm' },
          key: 'stockAlarm',
          dataIndex: 'stockAlarm',
          tooltip: true,
          width: 100
        },
        {
          title: '货架号',
          key: 'depotShelfNo',
          width: 100,

          dataIndex: 'depotShelfNo',
          tooltip: true
        },
        {
          title: '供应商',
          key: 'supplierName',
          dataIndex: 'supplierName',
          width: 120
        }
      ], // 仓库维修表头
      supplierDic: [],
      articleTypeList: [],
      fieldNames: {
        // cascader
        label: 'name',
        value: 'id',
        children: 'children'
      },
      addInfoFormModel: false,
      addInfoForm: {},
      addInfoModelLoading: false, // 弹框loading
      addInfoFormRule: {
        articleType: [{ required: true, message: '物品类别不能为空', trigger: 'blur' }],
        articleId: [{ required: true, message: '物品编号不能为空', trigger: 'blur' }],
        articleName: [{ required: true, message: '物品名称不能为空', trigger: 'blur' }]
      }, // 物品信息-验证信息
      warehouseList: [],
      StockAlarmList: [
        {
          value: 0,
          label: '库存安全'
        },
        {
          value: 1,
          label: '库存报警'
        }
      ],
      totalAmount: 0,
      inquireFlag: 0
    };
  },
  created() {},
  mounted() {
    this.getTypeList();
  },
  activated() {
    this.getSupplierList();
    this.refresh(true);
  },
  computed: {
    ...mapState('configure', ['textReplace']),
    autoSelect() {
      return this.$store.state.factoryList?.length === 1;
    }
  },
  watch: {
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
    // 查询现有库存
    getDataList(parameter) {
      const vo = {
        depotId: this.formItem.depotId,
        waterPlantId: this.formItem.waterPlantId,
        // 是否包含子集类型
        subTypeIdTree: true,
        page: {
          current: parameter.pageNo,
          size: parameter.pageSize
        }
      };
      if (this.inquireFlag === 0) {
        vo.keywords = this.formItem.keywords;
        vo.materielTypeId = +this.formItem.materielTypeId || '';
        vo.depotId = this.formItem.depotId;
        vo.stockAlarm = this.formItem.StockAlarm;
        vo.supplier = this.formItem.supplier;
      }
      this.tableLoading = true;
      queryTotalAmount(vo).then(response => {
        this.totalAmount = this.toMoney(response.resultData);
      });

      return getStockList(vo).then(response => {
        this.tableLoading = false;
        this.maintainList = response.resultData.records;
        return response.resultData;
      });
    },
    refresh(bool = true, flage = true) {
      if (this.$refs.table && !this.$refs.table.localLoading) {
        this.$refs.table.refresh(bool);
      }
    },
    // 导出当前展示数据
    handleExportExcel() {
      const vo = {
        depotId: this.formItem.depotId,
        waterPlantId: this.formItem.waterPlantId,
        page: {
          current: this.pageData.current,
          size: this.pageData.pageSize
        }
      };
      if (this.inquireFlag === 0) {
        vo.keywords = this.formItem.keywords;
        vo.materielTypeId = this.formItem.materielTypeId
          ? this.formItem.materielTypeId[this.formItem.materielTypeId.length - 1]
          : '';
        vo.depotId = this.formItem.depotId;
        vo.stockAlarm = this.formItem.StockAlarm;
        vo.supplier = this.formItem.supplier;
      }
      stockExportExcel(vo).then(res => {
        exportFile(res, '库存查询');
      });
    },
    // 编辑
    editMaintain() {},
    // 仓库维修-删除
    removeMaintain(index) {
      this.maintainList.splice(index, 1);
    },
    // 查询日期
    handleChangeDate(date) {},
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
      this.inquireFlag = 0;
      this.formItem = {
        waterPlantId: undefined, // 单位
        keywords: '',
        orderId: '', // 单号
        source: '', // 来源
        type: '', // 类别
        name: '', // 商品名称
        status: '', // 状态
        startDate: '', // 出库日期
        endDate: '', // 出库截止日期
        materielTypeId: null,
        supplier: ''
      };

      this.refresh();
    },
    // 物品信息-弹框确定按钮
    addInfoModelOk() {
      this.$refs.addInfoFormRule.validate(valid => {
        if (valid) {
          this.$message.success('Success!');
          this.addInfoModelLoading = false;
        }
      });
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
    },
    // 转金额
    toMoney(num) {
      num = num.toFixed(2);
      num = parseFloat(num);
      num = num.toLocaleString();
      return num;
    }
  }
};
</script>
<style lang="less" scoped>
@import './warehouse-top.less';
.fix-box {
  display: flex;
  justify-content: flex-end;
}

.inventory-table {
  height: 100%;
}
.total-txt {
  font-size: 22px;
  color: var(--color-primary);
}
</style>
