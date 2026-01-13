<!--
 * @Author: duyibo
 * @Date: 2024-05-07 08:34:40
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2024-08-16 10:25:45
 * @Description:
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
          <w-form-model-item label="关键字：" label-for="materielNo" prop="materielNo">
            <w-input
              v-model="formItem.keywords"
              placeholder="请输入物品名称或物品编号"
              @pressEnter="refresh"
            ></w-input>
          </w-form-model-item>
        </w-col>
        <template v-if="collapse">
          <w-col :span="6" v-bind="grid">
            <w-form-model-item label="仓库：" label-for="depotId" prop="depotId">
              <w-select
                v-model="formItem.depotId"
                @focus="checkFactory(formItem.waterPlantId)"
                placeholder="请选择仓库"
              >
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
            <w-form-model-item label="供应商：" label-for="supplier" prop="supplier">
              <w-select v-model="formItem.supplier" allowClear placeholder="请选择供应商">
                <w-select-option
                  v-for="(item, i) in supplierDic"
                  :key="item.code + '' + i"
                  :value="item.code"
                  >{{ item.name }}</w-select-option
                >
              </w-select>
            </w-form-model-item>
          </w-col>
          <w-col :span="12">
            <w-form-model-item label="表单时间：" label-for="startDate" prop="startDate">
              <w-range-picker
                v-model="formItem.startDate"
                split-panels
                style="width: 100%"
              ></w-range-picker>
            </w-form-model-item>
          </w-col>
          <w-col :span="6" v-bind="grid">
            <w-form-model-item label="领用单位：" label-for="receiptUnit" prop="receiptUnit">
              <w-input
                @pressEnter="refresh"
                v-model="formItem.receiptUnit"
                placeholder="请输入领用单位"
              ></w-input>
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
                placeholder="请选择库单状态"
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
          <w-form-model-item :labelCol="{ span: 0 }" :wrapperCol="{ span: 24 }">
            <w-button type="primary" @click="addNews" class="mr_12">出库登记</w-button>
            <w-button class="mr_12" @click="handleExportExcel(2)"
              ><w-icon type="export" />出库流水导出</w-button
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
        <!-- <w-col class="supply-float-right">
            <div class="f-right supply-items-center">

            </div>
          </w-col> -->
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
    <!-- 新增物品弹框 -->
    <w-modal
      class="secondary-modal"
      :visible="addInfoFormModel"
      title="物品出库"
      :maskClosable="false"
      width="80%"
      @cancel="cancelAdd"
    >
      <w-form-model
        ref="addInfoForm"
        v-bind="layout"
        v-if="addInfoFormModel"
        :labelCol="labelColWidth"
        :model="addInfoForm"
        :label-width="120"
        :rules="addInfoFormRule"
        @cancel="cancelAdd"
      >
        <w-row :gutter="24" type="flex">
          <w-col v-bind="grid2">
            <w-form-model-item
              :label="`选择${textReplace}`"
              label-for="selectType"
              prop="waterPlantId"
            >
              <factory-select
                v-model="addInfoForm.waterPlantId"
                autoSelect
                :showAll="!autoSelect"
              ></factory-select>
            </w-form-model-item>
          </w-col>
          <w-col v-bind="grid2">
            <w-form-model-item label="领用单位：" label-for="selectType" prop="receiptUnit">
              <w-input :disabled="!addOut" v-model="addInfoForm.receiptUnit"></w-input>
            </w-form-model-item>
          </w-col>
          <w-col v-bind="grid2">
            <w-form-model-item label="单号：" label-for="selectType" prop="billNo">
              <w-input v-model="addInfoForm.billNo" disabled></w-input>
            </w-form-model-item>
          </w-col>
          <w-col v-bind="grid2">
            <w-form-model-item label="出库类型：" label-for="selectType" prop="articleId">
              <w-select v-model="addInfoForm.articleId" :disabled="watchFlag">
                <w-select-option
                  v-for="(item, i) in sourceData"
                  :key="item.value + '' + i"
                  :value="item.value"
                  >{{ item.name }}</w-select-option
                >
              </w-select>
            </w-form-model-item>
          </w-col>
          <w-col v-bind="grid2">
            <w-form-model-item label="出库日期：" label-for="selectType" prop="billDate">
              <w-date-picker
                :disabled="watchFlag"
                placeholder="出库日期"
                style="width: 100%"
                v-model="addInfoForm.billDate"
                :options="options3"
              ></w-date-picker>
            </w-form-model-item>
          </w-col>
          <w-col v-bind="grid2">
            <w-form-model-item
              label="材料会计："
              label-for="selectType"
              prop="materielAccountantId"
            >
              <w-input :disabled="watchFlag" v-model="addInfoForm.materielAccountant"></w-input>
            </w-form-model-item>
          </w-col>
          <w-col v-bind="grid2">
            <w-form-model-item label="备注：" label-for="selectType" prop="memo">
              <w-input v-model="addInfoForm.memo" style="width: 100%" :disabled="watchFlag" />
            </w-form-model-item>
          </w-col>
        </w-row>
      </w-form-model>
      <w-button style="margin-bottom: 20px" type="primary" @click="newAdd" v-show="!watchFlag"
        ><i class="wpgicon icon-ic_add"></i>新建</w-button
      >
      <w-table
        id="addOutbound"
        :scroll="{ x: 1700 }"
        :columns="detailColumns"
        :rowKey="(record, index) => record.numIndex + '' + index"
        :data-source="data3"
        :loading="data3Loading"
        :pagination="false"
        class="ivu-mt"
      >
        <template slot-scope="txt, row, index" slot="numIndex">
          <span>{{ index + 1 }}</span>
        </template>
        <template slot-scope="txt, row, index" slot="depotId">
          <w-select
            @focus="checkFactory(addInfoForm.waterPlantId)"
            @change="warehouseChange(row, index)"
            v-model="row.depotId"
            :disabled="watchFlag"
            style="width: 100%"
          >
            <w-select-option
              v-for="(item, i) in warehouseList"
              :key="item.id + '' + i"
              :value="item.id"
              >{{ item.depotName }}</w-select-option
            >
          </w-select>
        </template>
        <template slot="materielTypeId" slot-scope="txt, row, index">
          <w-tree-select
            v-model="row.materielTypeId"
            style="width: 100%"
            :dropdown-style="{ maxHeight: '200px', overflow: 'auto' }"
            :tree-data="articleTypeList"
            :replaceFields="replaceFields"
            tree-default-expand-all
            @change="materielTypeChange(index)"
            :disabled="watchFlag"
          />
        </template>
        <template slot="material" slot-scope="txt, row, index">
          <a
            v-if="row.materielName"
            @click.prevent="checkFtuff(row, index)"
            :disabled="watchFlag"
            >{{ row.materielName }}</a
          >
          <a @click.prevent="checkFtuff(row, index)" v-else>选择</a>
        </template>
        <template slot="specification" slot-scope="txt, row">
          <w-input type="text" v-model="row.specification" disabled />
        </template>
        <template slot="unit" slot-scope="txt, row">
          <w-input type="text" v-model="row.unit" required disabled />
        </template>
        <template slot="supplier" slot-scope="txt, row, index">
          <w-input v-model="row.supplierName" required disabled />
        </template>
        <template slot="price" slot-scope="txt, row, index">
          <w-select
            v-if="
              row.materielId &&
                priceQuantityMap[row.materielId] &&
                Object.keys(row.filterPriceObj).length > 1
            "
            @change="numChange(row, index)"
            v-model="data3[index].price"
            :disabled="watchFlag"
            style="width: 100%"
          >
            <w-select-option
              v-for="(item, key) in row.filterPriceObj"
              :key="item + '' + key"
              :value="key + ''"
              >{{ key + '' }}</w-select-option
            >
          </w-select>
          <w-input v-else v-model="data3[index].price" type="number" required disabled />
        </template>
        <template slot-scope="txt, row, index" slot="existingQuantity">
          <w-input type="text" v-model="data3[index].existingQuantity" required disabled />
        </template>
        <template slot="quantity" slot-scope="txt, row, index">
          <w-input-number
            type="number"
            v-model="row.quantity"
            :min="0"
            required
            @blur="amountChange(row, index)"
            :disabled="watchFlag || !row.price"
          />
        </template>
        <template slot="taxRate" slot-scope="txt, row, index">
          <w-input v-model="row.taxRate" type="number" required disabled />
        </template>
        <template slot="postTaxPrice" slot-scope="txt, row, index">
          <w-input v-model="data3[index].postTaxPrice" type="number" disabled />
        </template>
        <template slot="postTaxTotalAmount" slot-scope="txt, row, index">
          <w-input v-model="data3[index].postTaxTotalAmount" type="number" disabled />
        </template>
        <template slot="totalAmount" slot-scope="txt, row, index">
          <w-input v-model="data3[index].totalAmount" type="number" disabled />
        </template>

        <template slot="memo" slot-scope="txt, row, index">
          <w-input type="text" v-model="data3[index].memo" required :disabled="watchFlag" />
        </template>
        <template slot-scope="txt, row, index" slot="action">
          <a @click="deleteRemove(row, index)">删除</a>
        </template>
      </w-table>
      <div slot="footer">
        <w-button type="default" @click="cancelAdd">取消</w-button>
        <w-button
          type="error"
          v-if="addInfoForm.id != -1 && addInfoForm.billState == '审核中'"
          @click="addInfoModelOk('审核未通过', addInfoForm.id)"
          :loading="addInfoModelLoading"
          >审核不通过</w-button
        >
        <w-button
          type="primary"
          v-if="addInfoForm.id != -1 && addInfoForm.billState == '审核中'"
          @click="addInfoModelOk('已出库', addInfoForm.id)"
          :loading="addInfoModelLoading"
          >审核通过</w-button
        >
        <w-button
          type="primary"
          @click="addInfoModelOk('未提交')"
          v-if="addInfoForm.billState === '审核未通过' || addInfoForm.billState === '未提交'"
          :loading="addInfoModelLoading"
          >保存</w-button
        >
        <w-button
          type="primary"
          @click="addInfoModelOk('审核中')"
          v-if="addInfoForm.billState === '审核未通过' || addInfoForm.billState === '未提交'"
          :loading="addInfoModelLoading"
          >提交</w-button
        >
      </div>
    </w-modal>
    <w-modal
      class="secondary-modal"
      :visible="addDepot"
      title="仓库材料"
      :loading="false"
      @ok="asyncOK"
      :maskClosable="false"
      @cancel="asyncCancel"
      v-bind="layout"
      :labelCol="labelColWidth"
    >
      <w-form-model ref="addDepotRef" :model="addDepotForm" :label-width="120" :rules="addDepotRef">
        <w-form-model-item label="物品：" label-for="material" prop="material">
          <select-materiel
            :depotId="addDepotForm.warehouse"
            :materielTypeId="addDepotForm.materielTypeId"
            :value="addDepotForm.material"
            :valueText="addDepotForm.materielName"
            @change="changeMateriel"
          ></select-materiel>
        </w-form-model-item>
      </w-form-model>
      <div slot="footer">
        <w-button @click="asyncOK">确认</w-button>
      </div>
    </w-modal>
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
  getSupplierList,
  generateBillNo,
  getBaseMaterielList,
  getBaseMaterielDetail,
  getPrivateAndQuantity,
  createDepotInOutBill
} from '@/api/warehouse.js';
import Sortable from 'sortablejs';
import { sysDictListByCode } from '@/api/manage';
import { mapState } from 'vuex';
import ExportModal from './components/export';
import FactorySelect from '@/components/factory-select/index';
import GlobalUserSpan from './components/globalUser-span/index.vue';
import SelectMateriel from './components/selectMateriel.vue';
import { exportFile } from './base/exportFile';
import Loop from './base/levelLoop';
import moment from 'moment';
import { handleNum } from './base/data';
export default {
  name: 'convenientDelivery',
  components: { ExportModal, FactorySelect, GlobalUserSpan, SelectMateriel },
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
      addOut: false,
      layout: {
        labelCol: { span: 6 },
        wrapperCol: { span: 18 }
      },
      formItem: {
        keywords: '',
        billStatusList: [],
        materielTypeNo: 'beipinbeijian',
        depotId: undefined,
        waterPlantId: undefined,
        transactor: '',
        startDate: rangeDate,
        startTime: '',
        endTime: '',
        billType: 2,
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
      watchFlag: false,
      addInfoModelLoading: false, // 弹框loading
      sourceData: [], //出库类型
      detailColumns: [],
      data3: [
        {
          supplier: '',
          supplierName: '',
          materielTypeId: '',
          materialList: [],
          depotId: '',
          materielName: '',
          numIndex: '',
          materielId: ''
        }
      ],
      addInfoForm: {
        id: -1,
        billNo: '',
        billDate: this.$moment().format('YYYY-MM-DD'),
        billState: '未提交'
      },
      maintainColumns: [
        {
          title: '序号',
          width: 60,
          align: 'center',
          dataIndex: 'index',
          customRender: (text, row, index) => {
            return index + 1;
          }
        },
        {
          title: '污水厂',
          key: 'waterPlantName',
          dataIndex: 'waterPlantName',
          width: 130
        },
        {
          title: '仓库',
          tooltip: true,
          key: 'depotName',
          width: 100,
          dataIndex: 'depotName',
          scopedSlots: { customRender: 'factoryName' },
          ellipsis: true
        },
        {
          title: '物品编号',
          tooltip: true,
          width: 100,
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
      maintainList: [],
      data3Loading: false,
      labelColWidth: {
        span: 6
      },
      addInfoFormRule: {
        unit: [{ required: true, message: '组织不能为空', trigger: 'change' }],
        billNo: [{ required: true, message: '单号不能为空', trigger: 'blur' }],
        articleId: [
          {
            required: true,
            message: '物品来源不能为空',
            trigger: 'blur',
            type: 'string'
          }
        ],
        billDate: [
          {
            required: true,
            message: '出库日期不能为空',
            trigger: 'blur',
            type: 'date'
          }
        ]
      }, // 物品信息-验证信息
      grid2: {
        xl: 8,
        lg: 8,
        md: 8,
        sm: 8,
        xs: 8
      },
      options3: {
        disabledDate(date) {
          // 设置当天以后的日期不可选
          return date && date.valueOf() > Date.now();
        }
      }, // 设置不可选时间
      replaceFields: {
        children: 'children',
        title: 'name',
        key: 'id',
        value: 'id'
      },
      priceQuantityMap: {},
      addDepot: false,
      addDepotForm: {
        material: '',
        warehouse: '',
        materielName: ''
      },
      addDepotRef: {
        material: {
          required: true,
          message: '材料不能为空',
          trigger: 'blur',
          type: 'array'
        }
      },
      columns2: [
        {
          title: '编号',
          align: 'center',
          slot: 'numIndex',
          scopedSlots: { customRender: 'numIndex' },
          dataIndex: 'numIndex',
          key: 'numIndex',
          width: 60
        },
        {
          title: '仓库(*)',
          align: 'center',
          slot: 'depotId',
          scopedSlots: { customRender: 'depotId' },
          dataIndex: 'depotId',
          key: 'depotId',
          width: 120,
          renderHeader: (h, params) => {
            return h('div', [
              h('span', '仓库（'),
              h('span', { style: { color: 'red' } }, '*'),
              h('span', ')')
            ]);
          }
        },
        {
          title: '类别(*)',
          align: 'materielTypeId',
          slot: 'materielTypeId',
          width: 120,
          scopedSlots: { customRender: 'materielTypeId' },
          key: 'materielTypeId',
          dataIndex: 'materielTypeId'
        },
        {
          title: '物品(*)',
          align: 'center',
          slot: 'material',
          scopedSlots: { customRender: 'material' },
          dataIndex: 'material',
          key: 'material',
          // width: 180,
          renderHeader: (h, params) => {
            return h('div', [
              h('span', '物品('),
              h('span', { style: { color: 'red' } }, '*'),
              h('span', ')')
            ]);
          }
        },
        {
          title: '规格型号',
          align: 'center',
          slot: 'specification',
          scopedSlots: { customRender: 'specification' },
          dataIndex: 'specification',
          key: 'specification'
        },
        {
          title: '单价(*)',
          align: 'price',
          slot: 'price',
          scopedSlots: { customRender: 'price' },
          key: 'price',
          dataIndex: 'price',
          renderHeader: (h, params) => {
            return h('div', [
              h('span', '单价('),
              h('span', { style: { color: 'red' } }, '*'),
              h('span', ')')
            ]);
          }
        },
        {
          title: '剩余数量',
          align: 'center',
          slot: 'existingQuantity',
          scopedSlots: { customRender: 'existingQuantity' },
          dataIndex: 'existingQuantity',
          key: 'existingQuantity'
        },
        {
          title: '数量(*)',
          align: 'center',
          slot: 'quantity',
          scopedSlots: { customRender: 'quantity' },
          dataIndex: 'quantity',
          key: 'quantity',
          renderHeader: (h, params) => {
            return h('div', [
              h('span', '数量('),
              h('span', { style: { color: 'red' } }, '*'),
              h('span', ')')
            ]);
          }
        },
        {
          title: '金额(*)',
          align: 'totalAmount',
          slot: 'totalAmount',
          scopedSlots: { customRender: 'totalAmount' },
          key: 'totalAmount',
          dataIndex: 'totalAmount',
          renderHeader: (h, params) => {
            return h('div', [
              h('span', '金额('),
              h('span', { style: { color: 'red' } }, '*'),
              h('span', ')')
            ]);
          }
        },
        {
          title: '单位',
          align: 'center',
          slot: 'unit',
          scopedSlots: { customRender: 'unit' },
          dataIndex: 'unit',
          key: 'unit'
        },

        {
          title: '领用目的',
          align: 'center',
          slot: 'memo',
          scopedSlots: { customRender: 'memo' },
          dataIndex: 'memo',
          key: 'memo'
          // width: 180
        },
        {
          title: '操作',
          align: 'center',
          slot: 'action',
          fixed: 'right',
          scopedSlots: { customRender: 'action' },
          width: 80
        }
      ]
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
        this.formItem.startBillDate = moment(date[0]).format('YYYY-MM-DD');
        this.formItem.endBillDate = moment(date[1]).format('YYYY-MM-DD');
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
    },
    data3: {
      handler(val, oldval) {
        val.forEach((item, index) => {
          if (item.amount && item.price) {
            this.addInfoForm.totalAmount = 0;
            item.totalAmount = handleNum(item.amount * item.price);
            if (item.taxRate) {
              item.postTaxPrice = handleNum((item.price * (100 - item.taxRate)) / 100);
              item.postTaxTotalAmount = handleNum(item.postTaxPrice * item.quantity);
            }
            this.$forceUpdate();
          }
        });
      },
      deep: true
    },
    'addInfoForm.waterPlantId': {
      handler(val) {
        if (val) {
          this.getBeseDepotList();
        }
      },
      immediate: true
    },
    addInfoFormModel: {
      handler(val) {
        if (!val) {
          this.detailColumns = [...this.columns2];
          this.$refs.addInfoForm && this.$refs.addInfoForm.resetFields();
          this.priceQuantityMap = {};
          this.priceQuantityMapSelect = {};
          this.priceQuantityMapFixed = {};
          this.priceNumList = [];
          this.addDepotForm = {
            material: '',
            warehouse: '',
            materielName: ''
          };
        }
      },
      immediate: true
    }
  },
  mounted() {
    this.getTypeList();
    this.sysDictListByCode('OutStorgeType', 'sourceData');
  },
  activated() {
    this.getSupplierList();
    this.refresh(true);
  },
  methods: {
    getDicName,
    async sysDictListByCode(code, data) {
      const res = await sysDictListByCode(code);
      this[data] = res.resultData;
    },
    async getSupplierList() {
      const res = await getSupplierList({ current: 1, size: 1000 });
      const { status, resultData } = res;
      if (status === 'complete') {
        this.supplierDic = res.resultData || [];
      }
    },
    // 单位是否已选择
    checkFactory(waterPlantId) {
      if (!waterPlantId) {
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
      inoutDetailExportExcel(vo).then(res => {
        exportFile(res, '出库明细');
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
    // 仓库选择
    warehouseChange(row, index) {
      this.data3[index].depotId = row.depotId;
      this.data3[index].materielId = '';
      this.data3[index].materielName = '';
      this.updateData();
      this.selectBaseLast(row.depotId, index);
    },
    //类别选择
    materielTypeChange(index) {
      this.data3[index].materielId = '';
      this.data3[index].materielName = '';
      this.updateData();
    },
    // 获取物品类别
    selectBaseLast(depotId, dataIndex) {
      getBaseMaterielList({ depotId }).then(respionse => {
        const oldList = respionse.resultData;
        this.materielList = oldList;
        this.data3[dataIndex].materielList = oldList;
        this.$forceUpdate();
      });
    },
    // 重置
    handleReset() {
      let startDate = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000);
      let rangeDate = [this.$moment(startDate), this.$moment(new Date())];
      this.formItem = {
        keywords: '',
        // materielTypeId: 16,
        materielTypeNo: 'beipinbeijian',
        depotId: undefined,
        billStatusList: [],
        waterPlantId: undefined,
        startDate: rangeDate,
        transactor: '',
        startTime: '',
        endTime: '',
        billType: 2,
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
        // this.articleTypeList = oldList;
        let filterData = this.removeElements(JSON.parse(JSON.stringify(oldList)), function(item) {
          return item.data.materielTypeNo !== 'beipinbeijian';
        });
        this.articleTypeList = filterData;
      });
    },
    removeElements(arr, predicate) {
      arr = arr.filter(item => {
        if (predicate(item)) {
          return false;
        } else if (Array.isArray(item.children) && item.children.length > 0) {
          removeElements(item.children, predicate);
        }
        return true;
      });
      return arr;
    },
    //选择材料
    changeMateriel(value) {
      this.addDepotForm.material = value.key;
      this.addDepotForm.materielName = value.label;
    },
    // 选择物料
    checkFtuff(row, index) {
      if (!row.depotId || !row.materielTypeId) {
        this.$message.error('请先选择仓库和类别');
        return;
      }
      this.addDepot = true;
      this.changeIndex = index;
      this.addDepotForm.material = row.materielId;
      this.addDepotForm.materielTypeId = row.materielTypeId;
      this.addDepotForm.warehouse = row.depotId;
      this.addDepotForm.materielName = row.materielName;
    },
    // 物品信息-弹框确定按钮
    async addInfoModelOk(billState, id) {
      const valid = await this.$refs.addInfoForm.validate();
      if (valid) {
        const depoList = [];
        try {
          _.forEach(this.data3, (item, index) => {
            if (item.depotId === '' || item.depotId == null) {
              this.$message.error(`第${index + 1}行仓库不能为空！`);
              throw new Error('breakForEach');
            } else if (item.materielTypeId === '' || item.materielTypeId == null) {
              this.$message.error(`第${index + 1}行类别不能为空！`);
              throw new Error('breakForEach');
            } else if (item.materielId === '' || item.materielId == null) {
              this.$message.error(`第${index + 1}行材料不能为空！`);
              throw new Error('breakForEach');
            } else if (item.price === '' || item.price === null) {
              this.$message.error(`第${index + 1}行单价不能为空！`);
              throw new Error('breakForEach');
            } else if (item.quantity === '' || item.quantity == null) {
              this.$message.error(`第${index + 1}行数量不能为空！`);
              throw new Error('breakForEach');
            } else if (item.quantity <= 0) {
              this.$message.error(`第${index + 1}行数量需要大于0！`);
              throw new Error('breakForEach');
            } else if (item.totalAmount === '' || item.totalAmount === null) {
              this.$message.error(`第${index + 1}行金额不能为空！`);
              throw new Error('breakForEach');
            } else if (
              billState !== '审核未通过' &&
              Number(item.quantity) > item.existingQuantity
            ) {
              this.$message.error(`第${index + 1}行出库数量不能大于库存数量！`);
              throw new Error('breakForEach');
            }

            depoList.push({
              sortNo: index,
              materielId: item.materielId,
              depotId: item.depotId,
              materielTypeId: item.materielTypeId,
              quantity: handleNum(item.quantity),
              taxRate: handleNum(item.taxRate),
              supplier: item.supplier,
              price: item.price,
              postTaxPrice: handleNum(item.postTaxPrice),
              postTaxTotalAmount: handleNum(item.postTaxTotalAmount),
              totalAmount: handleNum(item.totalAmount) || 0,
              existingQuantity: handleNum(item.existingQuantity) || 0,
              memo: item.memo
            });
          });
          const vo = {
            billNo: this.addInfoForm.billNo,
            materielSource: this.addInfoForm.articleId,
            billType: 2,
            billState: billState,
            billDate:
              this.$moment(this.addInfoForm.billDate).format('YYYY-MM-DD') + ' ' + '00:00:00',
            receiptUnit: this.addInfoForm.receiptUnit,
            depotManagerId: this.addInfoForm.depotManagerId,
            depotManager: this.addInfoForm.depotManager,
            materielAccountant: this.addInfoForm.materielAccountant,
            memo: this.addInfoForm.memo,
            waterPlantId: this.addInfoForm.waterPlantId,
            eqBillId: '',
            techParam: this.addInfoForm.techParam,
            backupPurpose: this.addInfoForm.backupPurpose,
            detailDtoList: depoList
          };
          if (this.addInfoForm.id !== -1) {
            vo.id = this.addInfoForm.id;
          }
          this.tableLoading = true;
          this.addInfoModelLoading = true;
          createDepotInOutBill(vo).then(responst => {
            this.addInfoModelLoading = false;
            this.tableLoading = false;
            if (responst.status === 'complete') {
              this.addInfoFormModel = false;
              this.$message.success(id ? '审核成功!' : '保存成功!');
            }
            this.refresh(false);
            this.cancelAdd();

            this.data3 = [
              {
                numIndex: '',
                depotId: '',
                supplier: '',
                supplierName: '',
                materielId: '',
                price: '',
                taxRate: '',
                specification: '',
                unitPrice: '',
                quantity: null,
                totalPrice: '',
                postTaxPrice: '',
                postTaxTotalAmount: '',
                materielTypeId: '',
                memo: ''
              }
            ];
          });
        } catch (e) {
          this.addInfoModelLoading = false;
          this.tableLoading = false;
          if (e.message !== 'breakForEach') throw e;
        }
      } else {
        console.log('验证失败');
      }
    },
    // 确认选中的物料
    asyncOK() {
      if (this.addDepotForm.material) {
        this.data3[this.changeIndex].materielId = this.addDepotForm.material;
        this.data3[this.changeIndex].materielName = this.addDepotForm.materielName;
        this.materialChange(this.addDepotForm.material);
        this.asyncCancel(); // 确认后取消所填的物料数据
      } else {
        this.$message.error('请选择材料');
      }
      this.addDepotForm.material = '';
    },
    asyncCancel() {
      this.addDepotForm.material = '';
      this.addDepotForm.warehouse = '';
      this.addDepotForm.materielTypeId = '';
      this.addDepotForm.materielName = '';
      this.addDepot = false;
    },
    // 新增
    addNews() {
      this.addInfoFormModel = !this.addInfoFormModel;
      this.generateBillNo();
      this.watchFlag = false;
      this.addOut = true;

      this.data3 = [
        {
          supplier: '',
          supplierName: '',
          numIndex: '',
          depotId: '',
          materielId: '',
          specification: '',
          existingQuantity: '',
          unitPrice: '',
          quantity: null,
          totalPrice: '',
          memo: ''
        }
      ];
      this.$nextTick(() => {
        this.initSortable();
      });
    },
    initSortable() {
      let _this = this;
      const mytb = document.querySelector('#addOutbound tbody');
      Sortable.create(mytb, {
        handle: '.wpg-table-row',
        animation: 150,
        sort: true,
        onUpdate({ newIndex, oldIndex }) {
          const dataSource = JSON.parse(JSON.stringify(_this.data3));

          // 把数组从老的位置删除再插入新的位置
          const item = dataSource[oldIndex];
          dataSource.splice(oldIndex, 1);
          dataSource.splice(newIndex, 0, item);
          _this.data3 = [];
          _this.$nextTick(() => {
            _this.data3 = dataSource;
          });
        }
      });
    },
    // 删除
    deleteRemove(row, index) {
      this.$confirm({
        title: '提示',
        content: '您确定要删除吗',
        onOk: () => {
          this.$message.success('删除成功');
          this.data3.splice(index, 1);
          this.updateData();
        }
      });
    },
    numChange(row, index) {
      this.initPrice(index);
      this.data3[index].price = row.price;
      this.updateData();
      this.$forceUpdate();
    },
    amountChange(row, index) {
      if (!row.existingQuantity) {
        this.$message.error('库存数量不能为空');
        return;
      }
      if (row.quantity <= 0 && typeof row.quantity === 'number') {
        this.$message.error('数量需要大于0');
        return;
      }
      if (row.existingQuantity && row.quantity > row.existingQuantity) {
        this.$message.error('出库数量不能大于库存数量');
        // this.data3[index].quantity = row.quantity;
      } else {
        this.data3[index].quantity = row.quantity;
        if (row.taxRate) {
          this.data3[index].postTaxPrice = handleNum((row.price * (100 - row.taxRate)) / 100);
        }
        if (row.quantity === '') {
          // row.curPriceQuantity[row.price] = this.priceQuantityMapFixed[row.price]
          this.data3[index].totalAmount = '';
        } else {
          // row.curPriceQuantity[row.price] = this.data3[index].existingQuantity - row.quantity
          this.data3[index].totalAmount = handleNum(row.quantity * row.price);
          if (row.taxRate) {
            this.data3[index].postTaxTotalAmount = handleNum(row.postTaxPrice * row.quantity);
          }
        }
        this.handleCurPriceQuantity(row.materielId, row.price);
        this.handleLaveQuantity();
        this.$forceUpdate();
      }
    },
    handleCurPriceQuantity(materielId, price) {
      this.data3.forEach(item => {
        if (item.materielId) {
          item.curPriceQuantity = this.priceQuantityMap[item.materielId];
        }
      });
    },
    handleLaveQuantity() {
      this.data3.forEach(item => {
        if (item.curPriceQuantity) {
          item.existingQuantity = item.curPriceQuantity[item.price];
        } else {
          item.existingQuantity = '';
        }
      });
    },
    // 获取单号
    generateBillNo() {
      generateBillNo('').then(res => {
        this.addInfoForm.billNo = res.resultData;
      });
    },
    // 弹框新增
    newAdd() {
      // this.addInfoForm = {}
      this.data3.push({
        depotId: '',
        materielTypeId: '',
        materielTypeName: '',
        numIndex: '',
        material: []
      });
    },
    // 弹框取消
    cancelAdd() {
      this.addInfoForm = {
        id: -1,
        billNo: '',
        billDate: this.$moment().format('YYYY-MM-DD'),
        billState: '未提交'
      };
      this.addInfoFormModel = false;
      this.$refs.addInfoForm && this.$refs.addInfoForm.resetFields();
    },
    handlePriceQuantityMapSelect() {
      this.priceQuantityMapSelect = JSON.parse(JSON.stringify(this.priceQuantityMap));
    },
    updateData() {
      // this.priceQuantityMap = JSON.parse(JSON.stringify(this.priceQuantityMapFixed))
      this.data3.forEach(item => {
        if (!item.materielId) {
          item.curPriceQuantity = '';
          item.specification = '';
          item.supplier = '';
          item.supplierName = '';
          item.price = '';
          item.supplier = '';
          item.existingQuantity = '';
          item.quantity = '';
          item.taxRate = '';
          item.totalAmount = '';
          item.postTaxPrice = '';
          item.postTaxTotalAmount = '';
          item.unit = '';
        }
        if (item.materielId) {
          item.curPriceQuantity = this.priceQuantityMap[item.materielId];
        }
      });
      this.handlePriceQuantityMapSelect();
      this.data3.forEach(item => {
        if (item.materielId && item.price) {
          this.priceQuantityMapSelect[item.materielId][item.price] = false;
        }
        if (item.curPriceQuantity) {
          item.existingQuantity = item.curPriceQuantity[item.price];
        } else {
          item.existingQuantity = '';
        }
      });
      this.data3.forEach((item, index) => {
        item.filterPriceObj = this.filterPrice(
          this.priceQuantityMap[item.materielId],
          this.priceQuantityMapSelect[item.materielId],
          index
        );
      });
    },
    initPrice(index) {
      this.data3[index].existingQuantity = '';
      this.data3[index].quantity = '';
      this.data3[index].totalAmount = '';
      this.data3[index].postTaxPrice = '';
      this.data3[index].postTaxTotalAmount = '';
    },
    filterPrice(obj, boolObj, index) {
      let boolObj1 = { ...boolObj };
      if (this.data3[index].price) {
        boolObj1[this.data3[index].price] = true;
      }
      let targetObj = {};
      for (const key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) {
          if (boolObj1[key]) {
            targetObj[key] = obj[key];
          }
        }
      }
      // if (Object.keys(targetObj).length === 1) {
      //   this.data3[index].price =Object.keys(targetObj)[0]
      //   this.data3[index].existingQuantity =Object.values(targetObj)[0]
      // }
      return targetObj;
    },
    initMaterialData(index) {
      this.data3[index].curPriceQuantity = '';
      this.data3[index].specification = '';
      this.data3[index].supplier = '';
      this.data3[index].supplierName = '';
      this.data3[index].price = '';
      this.data3[index].supplier = '';
      this.data3[index].existingQuantity = '';
      this.data3[index].quantity = '';
      this.data3[index].taxRate = '';
      this.data3[index].totalAmount = '';
      this.data3[index].postTaxPrice = '';
      this.data3[index].postTaxTotalAmount = '';
      this.data3[index].unit = '';
    },
    // 弹框-材料选择
    async materialChange(value) {
      if (value) {
        this.initMaterialData(this.changeIndex);
        // 调用接口获取 todo
        this.data3Loading = true;
        const promises = [];
        promises.push(getBaseMaterielDetail({ materielId: value }));
        promises.push(getPrivateAndQuantity(value));
        let res = await Promise.all(promises);

        let resultData = res[0].resultData || {};
        this.data3Loading = false;
        this.data3[this.changeIndex].specification = resultData.specification;
        this.data3[this.changeIndex].unit = resultData.unit;
        this.data3[this.changeIndex].supplier = resultData.supplier;
        this.data3[this.changeIndex].supplierName = this.supplierDic.find(
          item => item.value === resultData.supplier
        )
          ? this.supplierDic.find(item => item.value === resultData.supplier).name
          : resultData.supplier;
        this.data3[this.changeIndex].taxRate = resultData.taxRate;
        if (!this.priceQuantityMap[value]) {
          this.priceQuantityMap[value] = { ...res[1].resultData };
          this.priceQuantityMapSelect[value] = JSON.parse(JSON.stringify(res[1].resultData));
          this.priceQuantityMapFixed[value] = JSON.parse(JSON.stringify(res[1].resultData));
        }
        let curPriceQuantity = this.priceQuantityMap[value];
        this.data3[this.changeIndex].curPriceQuantity = curPriceQuantity;
        let filterObj = this.filterPrice(
          this.priceQuantityMap[value],
          this.priceQuantityMapSelect[value],
          this.changeIndex
        );
        if (Object.keys(filterObj).length === 1) {
          this.data3[this.changeIndex].price = Object.keys(filterObj)[0];

          if (curPriceQuantity) {
            this.data3[this.changeIndex].existingQuantity =
              filterObj[this.data3[this.changeIndex].price];
          } else {
            this.data3[this.changeIndex].existingQuantity = '';
          }
          this.handlePriceQuantityMapSelect();

          this.data3.forEach(item => {
            if (item.materielId && item.price) {
              this.priceQuantityMapSelect[item.materielId][item.price] = false;
            }
          });
        }
        this.data3[this.changeIndex].quantity = '';
        this.data3[this.changeIndex].totalAmount = '';
        this.data3[this.changeIndex].postTaxPrice = '';
        this.data3[this.changeIndex].postTaxTotalAmount = '';
        this.updateData();
      } else {
        this.data3[this.changeIndex].specification = '';
        this.data3[this.changeIndex].unit = '';
        this.data3[this.changeIndex].existingQuantity = '';
        this.data3[this.changeIndex].price = '';
      }
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
