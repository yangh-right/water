<!--
 * @Description: 仓储管理-入库登记页面
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
        <w-col v-bind="grid">
          <w-form-model-item :label="`选择${textReplace}`" label-for="emergency">
            <factory-select
              v-model="formItem.waterPlantId"
              autoSelect
              :showAll="!autoSelect"
            ></factory-select>
          </w-form-model-item>
        </w-col>
        <w-col :span="6" v-bind="grid">
          <w-form-model-item label="单号：" label-for="orderId" prop="orderId">
            <w-input v-model="formItem.orderId" placeholder @pressEnter="refresh"></w-input>
          </w-form-model-item>
        </w-col>
        <template v-if="collapse">
          <w-col :span="6" v-bind="grid">
            <w-form-model-item label="入库类型：" label-for="selectType" prop="source">
              <w-select v-model="formItem.source">
                <w-select-option
                  v-for="(item, i) in sourceData"
                  :key="item.value + '' + i"
                  :value="item.value"
                  >{{ item.name }}</w-select-option
                >
              </w-select>
            </w-form-model-item>
          </w-col>
          <w-col :span="6" v-bind="grid">
            <w-form-model-item label="库单状态：" label-for="selectType" prop="source">
              <w-select v-model="formItem.billState">
                <w-select-option
                  v-for="(item, i) in billStateList"
                  :key="item.value + '' + i"
                  :value="item.value"
                  >{{ item.label }}</w-select-option
                >
              </w-select>
            </w-form-model-item>
          </w-col>
          <w-col :span="6" v-bind="grid">
            <w-form-model-item label="入库日期：" label-for="date">
              <w-range-picker
                v-model="formItem.date"
                :disabled-date="disabledDate"
                split-panels
                style="width: 100%"
                @change="handleChangeDate"
              ></w-range-picker>
            </w-form-model-item>
          </w-col>
          <w-col :span="6" v-bind="grid">
            <w-form-model-item label="经办人：" label-for="selectType" prop="manager">
              <w-input v-model="formItem.manager" @pressEnter="refresh"></w-input>
            </w-form-model-item>
          </w-col>
        </template>
        <w-col class="supply-float-right">
          <div class="f-right">
            <w-button
              v-permission:button="'inoutAdd'"
              type="primary"
              class="mr_12 supply-top-1"
              @click="addNews"
              icon="plus"
              >新建</w-button
            >
            <w-button @click="handleReset" class="mr_12 supply-top-1" icon="reload">重置</w-button>
            <w-button type="primary" class="mr_12 supply-top-1" @click="refresh" icon="search"
              >查询</w-button
            >
            <!-- <w-button class="mr_12" @click="handleExportExcel"
              ><w-icon type="export" />导出</w-button
            > -->
            <a class="mr_12" @click="collapse = !collapse">
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
          </div>
        </w-col>
      </w-row>
    </w-form-model>

    <div class="warehouse-common-con">
      <div v-if="file !== null">
        Upload file: {{ file.name }}
        <w-button type="text" :loading="loadingStatus" @click="upload">{{
          loadingStatus ? '上传中' : '点击上传'
        }}</w-button>
      </div>
      <s-table
        ref="table"
        :columns="maintainColumns"
        :scroll="{ x: 1510 }"
        :rowKey="(record, index) => record.billNo + '' + index"
        :canResize="true"
        :initLoadData="false"
        :data="getDepotInOutList"
        class="sw-mt"
      >
        <template slot="billNo" slot-scope="text, records">
          <w-tooltip>
            <template slot="title">
              {{ text }}
            </template>
            <a @click="watch(records)">{{ records.billNo }}</a>
          </w-tooltip>
        </template>
        <template slot="materielSource" slot-scope="text">
          <w-tooltip>
            <template slot="title">{{ getDicName('sourceData', text) }}</template>
            {{ getDicName('sourceData', text) }}
          </w-tooltip>
        </template>
        <template slot="billDate" slot-scope="text, records">{{
          records.billDate.split(' ')[0]
        }}</template>
        <template slot="depotManagerId" slot-scope="text, records">
          <span>{{ records.depotManager }}</span>
        </template>
        <template slot="materielAccountantId" slot-scope="text, records">
          <span>{{ records.materielAccountant }}</span>
        </template>
        <template slot="action" slot-scope="text, records, index">
          <div class="sw-table__row__opr">
            <span v-if="hasStateBtn(records.billState)" class="mr_12">
              <a
                @click="
                  records.billState === '已入库' ? deleteOrder(records) : editMaintain(records)
                "
              >
                {{ getStateName(records.billState) }}
              </a>
            </span>
            <span
              v-if="
                records.billState !== '已入库' &&
                  (records.billState === '审核未通过' || records.billState === '未提交') &&
                  buttonCodes['inoutDelete']
              "
              class="mr_12"
            >
              <a @click="removeMaintain(records, index)">删除</a>
            </span>
          </div>
        </template>
      </s-table>
    </div>
    <!-- 新增物品弹框 -->
    <w-modal
      class="secondary-modal"
      :visible="addInfoFormModel"
      :maskClosable="false"
      title="物品入库"
      width="80%"
      @cancel="cancelAdd"
    >
      <w-form-model
        ref="addInfoFormRule"
        :model="addInfoForm"
        :label-width="120"
        :rules="addInfoFormRule"
        v-if="addInfoFormModel"
        v-bind="layout"
        :labelCol="labelColWidth"
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
                :disabled="!addIn"
                :showAll="!autoSelect"
              ></factory-select>
            </w-form-model-item>
          </w-col>
          <w-col v-bind="grid2">
            <w-form-model-item label="供应商：" label-for="selectType" prop="supplier">
              <w-select
                v-model="addInfoForm.supplier"
                @change="orderSelectFactory"
                :disabled="!addIn"
              >
                <w-select-option
                  v-for="(item, i) in supplierArr"
                  :key="item.code + '' + i"
                  :value="item.code"
                  >{{ item.name }}</w-select-option
                >
              </w-select>
            </w-form-model-item>
          </w-col>
          <w-col v-bind="grid2">
            <w-form-model-item label="单号：" label-for="selectType" prop="billNo">
              <w-input v-model="addInfoForm.billNo" disabled></w-input>
            </w-form-model-item>
          </w-col>
          <w-col v-bind="grid2">
            <w-form-model-item label="入库类型：" label-for="selectType" prop="articleId">
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
            <w-form-model-item label="入库日期：" label-for="selectType" prop="billDate">
              <w-date-picker
                v-model="addInfoForm.billDate"
                :format="'YYYY-MM-DD'"
                :disabled="watchFlag"
                placeholder="入库日期"
                style="width: 100%"
              ></w-date-picker>
            </w-form-model-item>
          </w-col>
          <w-col v-bind="grid2">
            <w-form-model-item label="经办人：" label-for="selectType" prop="transactor">
              <w-input v-model="addInfoForm.transactor" style="width: 100%" :disabled="watchFlag" />
            </w-form-model-item>
          </w-col>
          <w-col v-bind="grid2">
            <w-form-model-item label="材料会计：" label-for="selectType">
              <w-input
                v-model="addInfoForm.materielAccountant"
                style="width: 100%"
                :disabled="watchFlag"
              />
            </w-form-model-item>
          </w-col>
          <w-col v-bind="grid2">
            <w-form-model-item label="总金额：" label-for="selectType">
              <w-input
                v-model="addInfoForm.totalAmount"
                type="number"
                style="width: 100%"
                disabled
              />
            </w-form-model-item>
          </w-col>
          <w-col v-bind="grid2">
            <w-form-model-item label="备注：" label-for="selectType">
              <w-input v-model="addInfoForm.memo" style="width: 100%" :disabled="watchFlag" />
            </w-form-model-item>
          </w-col>
        </w-row>
      </w-form-model>
      <w-button v-show="!watchFlag" style="margin-bottom: 20px" type="primary" @click="newAdd"
        ><i class="wpgicon icon-ic_add"></i>新建</w-button
      >
      <!-- <w-button v-show="!watchFlag" type="primary" style="margin-left: 20px;" @click="importBtm"
        ><w-icon type="import" />导入</w-button
      > -->
      <w-table
        id="addRegist"
        :scroll="{ x: 1456 }"
        :columns="detailColumns"
        :rowKey="(record, index) => record.numIndex + '' + index"
        :data-source="data3"
        :pagination="false"
        class="ivu-mt"
        :rowClassName="(record, index) => (index === deletingRow ? 'deleting-row' : '')"
      >
        <template slot="numIndex" slot-scope="txt, row, index">
          <span>{{ index + 1 }}</span>
        </template>
        <template slot="depotId" slot-scope="txt, row, index">
          <w-select
            v-model="row.depotId"
            :disabled="watchFlag"
            showSearch
            :filterOption="filterOption"
            style="width: 100%"
            @focus="checkFactory(addInfoForm.waterPlantId, addInfoForm.supplier)"
            @change="warehouseChange(row, index)"
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
            :disabled="watchFlag"
            showSearch
            v-model="row.materielTypeId"
            style="width: 100%"
            :dropdown-style="{ maxHeight: '200px', overflow: 'auto' }"
            :tree-data="articleTypeList"
            treeNodeFilterProp="title"
            :replaceFields="replaceFields"
            tree-default-expand-all
            @change="materielTypeChange(row, index)"
          />
        </template>
        <template slot="materielId" slot-scope="txt, row, index">
          <a
            v-if="row.materielName"
            :disabled="watchFlag"
            @click.prevent="checkFtuff(row, index)"
            >{{ row.materielName }}</a
          >
          <a v-else @click.prevent="checkFtuff(row, index)">选择</a>
        </template>
        <template slot="specifications" slot-scope="txt, row">
          <w-input v-model="row.specifications" type="text" disabled />
        </template>
        <template slot="unit" slot-scope="txt, row">
          <w-input v-model="row.unit" type="text" disabled />
        </template>
        <template slot="amount" slot-scope="txt, row, index">
          <w-input-number
            v-model="row.amount"
            type="number"
            required
            :disabled="watchFlag"
            @blur="amountChange(row, index)"
          />
        </template>
        <template slot="supplier" slot-scope="txt, row, index">
          <w-select :showArrow="false" style="width:100%" v-model="row.supplier" required disabled>
            <w-select-option
              v-for="(item, i) in supplierArr"
              :key="item.code + '' + i"
              :value="item.code"
              >{{ item.name }}</w-select-option
            >
          </w-select>
        </template>
        <template slot="price" slot-scope="txt, row, index">
          <w-input-number
            @change="priceChange(row, index)"
            v-model="data3[index].price"
            type="number"
            required
            :disabled="true"
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
        <!-- <template slot="memo" slot-scope="txt, row, index">
          <w-input v-model="data3[index].memo" type="text" required :disabled="watchFlag" />
        </template> -->
        <template slot="action" slot-scope="txt, row, index">
          <a href="javascript:;" @click="deleteRemove(row, index)">删除</a>
        </template>
      </w-table>
      <div slot="footer">
        <w-button type="default" @click="cancelAdd">取消</w-button>
        <w-button
          v-if="addInfoForm.id != -1 && addInfoForm.billState == '审核中'"
          type="error"
          :loading="addInfoModelLoading"
          @click="addInfoModelOk('审核未通过', addInfoForm.id)"
          >审核不通过</w-button
        >
        <w-button
          v-if="addInfoForm.id != -1 && addInfoForm.billState == '审核中'"
          type="primary"
          :loading="addInfoModelLoading"
          @click="addInfoModelOk('已入库', addInfoForm.id)"
          >审核通过</w-button
        >
        <w-button
          v-if="addInfoForm.billState === '审核未通过' || addInfoForm.billState === '未提交'"
          type="primary"
          :loading="addInfoModelLoading"
          @click="addInfoModelOk('未提交')"
          >保存</w-button
        >
        <w-button
          v-if="addInfoForm.billState === '审核未通过' || addInfoForm.billState === '未提交'"
          type="primary"
          :loading="addInfoModelLoading"
          @click="addInfoModelOk('审核中')"
          >提交</w-button
        >
      </div>
    </w-modal>
    <w-modal
      class="secondary-modal"
      :visible="addDepot"
      title="仓库材料"
      :loading="addLoading"
      :maskClosable="false"
      @ok="asyncOK"
      @cancel="asyncCancel"
    >
      <w-form-model ref="addDepotRef" :model="addDepotForm" :label-width="120" :rules="addDepotRef">
        <w-form-model-item label="物品：" label-for="materiel" prop="materiel">
          <select-materiel
            :depotId="addDepotForm.warehouse"
            :materielTypeId="addDepotForm.materielTypeId"
            :value="addDepotForm.materiel"
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
    <ImportModal v-model="showimportModal" modalType="in" />
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import FactorySelect from '@/components/factory-select/index';
import { sysDictListByCode } from '@/api/manage';
import {
  getDepotInOutList,
  inoutMainExportExcel,
  inoutMainPrint,
  getBaseMaterielList,
  deleteDepotInOutBill,
  getBaseMaterielDetail,
  getBeseDepotList,
  getBaseMaterielType,
  modifyDepotInOutBill,
  createDepotInOutBill,
  generateBillNo,
  getSupplierList
} from '@/api/warehouse.js';
import Loop from './base/levelLoop';
import { handleNum, handlePrice } from './base/data';
import { userList as getAllUser } from '@/api/baseInfo';
import ExportModal from './components/export';
import ImportModal from './components/import';
import { exportFile, printFile } from '@/utils/util';
import Sortable from 'sortablejs';
import SelectMateriel from './components/selectMateriel.vue';
import * as _ from 'lodash-es';

export default {
  name: 'WarehouseRegistration',
  components: {
    ExportModal,
    ImportModal,
    FactorySelect,
    SelectMateriel
  },

  data() {
    return {
      supplierDic: [],
      replaceFields: {
        children: 'children',
        title: 'name',
        key: 'id',
        value: 'id'
      },
      articleTypeList: [],
      userBaseList: [], // 经办人列表
      supplierArr: [],
      addLoading: false,
      addDepotRef: {
        materiel: {
          required: true,
          message: '材料不能为空',
          trigger: 'blur',
          type: 'array'
        }
      },
      addDepotForm: {
        materiel: '',
        warehouse: '',
        materielName: ''
      },
      materiel: [], // 入库材料
      materielList: [],
      fieldNames: {
        // cascader
        label: 'name',
        value: 'id',
        children: 'children'
      },
      showExportModal: false, // 导出
      showimportModal: false, // 导入
      percent: 0,
      addInfoModelLoading: false,
      exportStatus: 0,
      grid: {
        xl: 6,
        lg: 6,
        md: 12,
        sm: 24,
        xs: 24
      },
      grid2: {
        xl: 8,
        lg: 8,
        md: 8,
        sm: 8,
        xs: 8
      },
      formItem: {
        waterPlantId: undefined,
        orderId: '', // 单号
        source: '', // 来源
        billState: '',
        type: '', // 类别
        name: '', // 商品名称
        status: '', // 状态
        startDate: '', // 入库日期
        endDate: '', // 入库截止日期
        manager: '' // 领料人
      },
      sourceData: [], // 入库类型：
      collapse: false,
      pageData: {
        pageSize: 10, // 十条
        current: 1
      },
      maintainList: [], // 仓库数据
      tableLoading: false,
      billStateList: [
        {
          value: '未提交',
          label: '未提交'
        },
        {
          value: '审核中',
          label: '审核中'
        },
        {
          value: '审核未通过',
          label: '审核未通过'
        },
        {
          value: '已入库',
          label: '已入库'
        },
        {
          value: '已作废',
          label: '已作废'
        }
      ],
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
          title: '单号',
          key: 'billNo',
          dataIndex: 'billNo',
          slot: 'billNo',
          scopedSlots: { customRender: 'billNo' },
          width: 160,
          fixed: 'left',
          ellipsis: true
        },
        {
          title: '污水厂名称',
          key: 'waterPlantName',
          dataIndex: 'waterPlantName',
          fixed: 'left',
          width: 150
        },
        {
          title: '入库类型',
          key: 'materielSource',
          dataIndex: 'materielSource',
          scopedSlots: { customRender: 'materielSource' },
          width: 170,
          ellipsis: true
        },
        {
          title: '入库日期',
          slot: 'billDate',
          scopedSlots: { customRender: 'billDate' },
          key: 'billDate',
          dataIndex: 'billDate',
          width: 200,
          ellipsis: true
        },
        {
          title: '经办人',
          key: 'transactor',
          width: 170,
          dataIndex: 'transactor',
          tooltip: true,
          ellipsis: true
        },
        {
          title: '仓管员',
          slot: 'depotManagerId',
          scopedSlots: { customRender: 'depotManagerId' },
          key: 'depotManagerId',
          width: 170,
          dataIndex: 'depotManagerId',
          tooltip: true,
          ellipsis: true
        },
        {
          title: '材料会计',
          slot: 'materielAccountantId',
          scopedSlots: { customRender: 'materielAccountantId' },
          key: 'materielAccountant',
          width: 170,
          dataIndex: 'materielAccountant',
          tooltip: true,
          ellipsis: true
        },
        {
          title: '状态',
          key: 'billState',
          width: 170,
          dataIndex: 'billState',
          tooltip: true
        },
        {
          title: '操作',
          slot: 'action',
          fixed: 'right',
          scopedSlots: { customRender: 'action' },
          width: 120
        }
      ], // 仓库维修表头
      addInfoFormModel: false,
      addInfoForm: {
        id: -1,
        supplier: '',
        billNo: '',
        billDate: this.$moment().format('YYYY-MM-DD'),
        billState: '未提交',
        transactor: '',
        waterPlantId: ''
      }, // 弹框loading
      layout: {
        labelCol: { span: 6 },
        wrapperCol: { span: 18 }
      },
      labelColWidth: {
        span: 6
        // offset: 12
      },
      addInfoFormRule: {
        waterPlantId: [{ required: true, message: '污水厂不能为空', trigger: 'change' }],
        billNo: [{ required: true, message: '单号不能为空', trigger: 'change' }],
        supplier: [
          {
            required: true,
            message: '供应商不能为空',
            trigger: 'change',
            type: 'string'
          }
        ],
        articleId: [
          {
            required: true,
            message: '入库类型不能为空',
            trigger: 'change',
            type: 'string'
          }
        ],
        billDate: [
          {
            required: true,
            message: '入库日期不能为空',
            trigger: 'blur',
            type: 'date'
          }
        ]
      }, // 物品信息-验证信息
      detailColumns: [],
      columns2: [
        {
          title: '编号',
          align: 'center',
          slot: 'numIndex',
          scopedSlots: { customRender: 'numIndex' },
          key: 'numIndex',
          dataIndex: 'numIndex',
          width: 60
        },
        {
          title: '仓库(*)',
          align: 'center',
          slot: 'depotId',
          scopedSlots: { customRender: 'depotId' },
          key: 'depotId',
          dataIndex: 'depotId',
          width: 150,
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
          width: 150,
          slot: 'materielTypeId',
          scopedSlots: { customRender: 'materielTypeId' },
          key: 'materielTypeId',
          dataIndex: 'materielTypeId'
        },
        {
          title: '物品(*)',
          align: 'center',
          slot: 'materielId',
          scopedSlots: { customRender: 'materielId' },
          key: 'materielId',
          dataIndex: 'materielId',
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
          slot: 'specifications',
          scopedSlots: { customRender: 'specifications' },
          key: 'specifications',
          dataIndex: 'specifications'
        },
        {
          title: '单位',
          align: 'center',
          slot: 'unit',
          scopedSlots: { customRender: 'unit' },
          key: 'unit',
          dataIndex: 'unit'
        },
        {
          title: '数量(*)',
          align: 'center',
          slot: 'amount',
          scopedSlots: { customRender: 'amount' },
          key: 'amount',
          dataIndex: 'amount',
          renderHeader: (h, params) => {
            return h('div', [
              h('span', '数量('),
              h('span', { style: { color: 'red' } }, '*'),
              h('span', ')')
            ]);
          }
        },
        // {
        //   title: '供应商(*)',
        //   align: 'supplier',
        //   slot: 'supplier',
        //   scopedSlots: { customRender: 'supplier' },
        //   key: 'supplier',
        //   dataIndex: 'supplier'
        // },
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
          title: '操作',
          align: 'center',
          width: 80,
          fixed: 'right',
          scopedSlots: { customRender: 'action' },
          slot: 'action'
        }
      ],
      data3: [
        {
          supplier: '',
          supplierName: '',
          materielList: [],
          depotId: '',
          materielTypeId: '',
          materielName: '',
          numIndex: '',
          materielId: '',
          unit: ''
        }
      ],
      file: null, // 导入文件
      loadingStatus: false,
      warehouseList: [],
      materielTypeList: [],
      watchFlag: false,
      addDepot: false,
      inquireFlag: 0,
      addIn: false,
      deletingRow: -1
    };
  },

  computed: {
    ...mapGetters('account', ['user']),
    ...mapState('setting', ['buttonCodes']),
    ...mapState('configure', ['textReplace']),
    autoSelect() {
      return this.$store.state.factoryList?.length === 1;
    }
  },
  watch: {
    data3: {
      handler(val, oldval) {
        let totalAmount = 0;
        val.forEach((item, index) => {
          if (item.amount) {
            if (!item.price) item.price = 0;
            this.addInfoForm.totalAmount = 0;
            item.totalAmount = handleNum(item.amount * item.price);
            totalAmount += item.totalAmount;
            if (item.taxRate) {
              item.postTaxPrice = handleNum(item.price / item.taxRate);
              item.postTaxTotalAmount = handleNum(item.totalAmount / item.taxRate);
            }
            this.$forceUpdate();
          }
        });
        this.addInfoForm.totalAmount = handleNum(totalAmount);
      },
      deep: true
    },
    addInfoFormModel: {
      handler(val) {
        if (!val) {
          this.detailColumns = [...this.columns2];
        }
      },
      immediate: true
    },
    addDepot(val) {
      if (!val) {
        this.$refs.addDepotRef && this.$refs.addDepotRef.resetFields();
      }
    },
    'addInfoForm.waterPlantId': {
      handler(val) {
        if (this.addInfoForm.supplier === '') return;
        this.addInfoFormModel && this.addIn && this.getBeseDepotList();
      },
      deep: true,
      immediate: true
    },
    'addInfoForm.supplier': {
      handler(val) {
        if (this.addInfoForm.waterPlantId === '') return;
        this.addInfoFormModel && this.addIn && this.getBeseDepotList();
      }
    }
  },
  created() {
    sysDictListByCode('materielSupplier').then(res => {
      if (res.status === 'complete') {
        this.supplierDic = res.resultData;
      }
    });
  },
  mounted() {
    this.sysDictListByCode('StorageType', 'sourceData');
    this.getUserList();
    this.getSupplierList();
    this.addInfoForm.transactor = this.user.userName;
    this.refresh(true, false);
  },
  activated() {
    this.getTypeList();
  },
  methods: {
    async getSupplierList() {
      let params = { current: 1, size: 1000 };
      let res = await getSupplierList(params);
      if (res.status === 'complete') {
        this.supplierArr = res.resultData.filter(item => !item.delFlag);
      }
    },
    getTypeList() {
      this.tableLoading = true;
      getBaseMaterielType().then(respionse => {
        this.tableLoading = false;
        const oldList = Loop.levelLoop(respionse.resultData);
        loopChangeTitle(oldList);
        function loopChangeTitle(obj) {
          obj.forEach(item => {
            item.expand = true;
            item.value = item.id;
            item.selected = true;
            item.checked = false;
            if (item.children) {
              // item.disabled = true
              loopChangeTitle(item.children);
            }
          });
        }
        this.articleTypeList = oldList;
      });
    },
    hasStateBtn(state) {
      return !(
        state === '已作废' ||
        (this.getStateName(state) === '审核' && !this.buttonCodes['inOutCheck']) ||
        (this.getStateName(state) === '作废' && !this.buttonCodes['inOutCancel'])
      );
    },
    getStateName(state) {
      return state === '审核未通过' || state === '未提交'
        ? '编辑'
        : state === '已入库'
        ? '作废'
        : '审核';
    },
    // 过滤经办人
    filterOption(input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      );
    },
    // 获取经办人列表
    getUserList() {
      getAllUser({ pageFlag: false }).then(res => {
        if (res.status === 'complete') {
          this.userBaseList = [];
          res.resultData.forEach(item => {
            this.userBaseList.push({
              title: item.userName,
              value: item.id,
              key: item.id
            });
          });
        }
      });
    },
    // 变换经办人
    handleTransactorChange(value) {
      this.addInfoForm.transactor = this.userBaseList.filter(item => item.key === value)[0].title;
    },
    async sysDictListByCode(code, data) {
      const res = await sysDictListByCode(code);
      this[data] = res.resultData;
    },
    // 选择材料
    changeMateriel(value) {
      this.addDepotForm.materiel = value.key;
      this.addDepotForm.materielName = value.label;
    },
    // 厂改变
    selectFactory() {
      this.refresh();
    },
    // 选择物料
    checkFtuff(row, index) {
      if (!row.depotId || !row.materielTypeId) {
        this.$message.error('请先选择仓库和类别');
        return;
      }
      this.addDepot = true;
      this.changeIndex = index;
      this.addDepotForm.materiel = row.materielId;
      this.addDepotForm.warehouse = row.depotId;
      this.addDepotForm.materielTypeId = row.materielTypeId;
      this.addDepotForm.materielName = row.materielName;
    },
    // 确认选中的物料
    asyncOK() {
      if (this.addDepotForm.materiel) {
        this.updateData(this.changeIndex);
        this.data3[this.changeIndex].materielId = this.addDepotForm.materiel;
        this.data3[this.changeIndex].materielName = this.addDepotForm.materielName;
        this.materialChange(this.addDepotForm.materiel);
        this.asyncCancel(); // 确认后取消所填的物料数据
      } else {
        this.$message.error('请选择材料');
      }
      this.addDepotForm.materiel = '';
    },
    asyncCancel() {
      this.addDepotForm.materiel = '';
      this.addDepotForm.warehouse = '';
      this.addDepotForm.materielTypeId = '';
      this.addDepotForm.materielName = '';
      this.addDepot = false;
    },
    // 删除
    deleteRemove(row, index) {
      this.deletingRow = index;
      this.$confirm({
        title: '提示',
        content: '确定要删除吗？',
        onOk: async () => {
          this.$message.success('删除成功');
          this.data3.splice(index, 1);
          this.deletingRow = -1;
        },
        onCancel: () => {
          this.deletingRow = -1;
        }
      });
    },
    // 入库列表
    getDepotInOutList(parameter) {
      const vo = {
        billState: this.formItem.billState,
        billType: 1,
        waterPlantId: this.formItem.waterPlantId,
        page: {
          current: parameter.pageNo,
          size: parameter.pageSize
        }
      };
      if (this.inquireFlag === 0) {
        vo.billNo = this.formItem.orderId;
        vo.materielSource = this.formItem.source;
        vo.transactor = this.formItem.manager;
        vo.startBillDate = this.formItem.startDate;
        vo.endBillDate = this.formItem.endDate;
      }

      return getDepotInOutList(vo).then(respons => {
        if (Array.isArray(respons.resultData.records) && respons.resultData.records.length > 0) {
          respons.resultData.records.forEach(item => {
            let tempArr = item.detailList.map(detail => detail.depotManager);
            item['depotManager'] = Array.from(new Set(tempArr)).join(',');
          });
        }
        this.maintainList = respons.resultData.records;
        return respons.resultData;
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
        billState: this.formItem.billState,
        billType: 1,
        waterPlantId: this.formItem.waterPlantId,
        page: {
          current: this.pageData.current,
          size: this.pageData.pageSize
        }
      };
      if (this.inquireFlag === 0) {
        vo.billNo = this.formItem.orderId;
        vo.materielSource = this.formItem.source;
        vo.transactor = this.formItem.manager;
        vo.startBillDate = this.formItem.startDate;
        vo.endBillDate = this.formItem.endDate;
      }
      inoutMainExportExcel(vo).then(res => {
        exportFile(res, '入库登记');
      });
    },
    // 新增入库
    addNews() {
      this.addInfoFormModel = !this.addInfoFormModel;
      this.watchFlag = false;
      this.addIn = true;

      this.data3 = [
        {
          supplier: '',
          supplierName: '',
          numIndex: '',
          depotId: '',
          materielId: '',
          materielList: [],
          specifications: '',
          unitPrice: '',
          amount: '',
          totalPrice: ''
          // memo: ''
        }
      ];
      this.$nextTick(() => {
        this.initSortable();
      });
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
    disabledDate(current) {
      // Can not select days after today
      return current && current > this.$moment().endOf('day');
    },
    checkFactory(orgId, supplier) {
      if (!orgId) {
        this.warehouseList = [];
        this.$message.warn('请先选择组织');
        return;
      }
      if (!supplier) {
        this.warehouseList = [];
        this.$message.warn('请先选择供应商');
        return;
      }
    },
    // 查询日期
    handleChangeDate(date) {
      this.formItem.startDate = this.$moment(date[0]).format('YYYY-MM-DD');
      this.formItem.endDate = this.$moment(date[1]).format('YYYY-MM-DD');
    },
    changeManager(data) {
      this.formItem.manager = data.user;
      this.formItem.managerId = data.userId;
    },
    changeDepotManager(data) {
      this.addInfoForm.depotManager = data.user;
      this.addInfoForm.depotManagerId = data.userId;
    },
    // 仓库选择
    warehouseChange(row, index) {
      this.data3[index].depotId = row.depotId;
      this.updateData(index);
      this.selectBaseLast(row.depotId, index);
    },
    materielTypeChange(row, index) {
      this.updateData(index);
    },
    updateData(index) {
      this.data3[index].supplier = '';
      this.data3[index].supplierName = '';
      this.data3[index].taxRate = '';
      this.data3[index].materielId = '';
      this.data3[index].price = '';
      this.data3[index].amount = '';
      this.data3[index].specifications = '';
      this.data3[index].unit = '';
      this.data3[index].materielName = '';
      this.data3[index].totalAmount = '';
      this.data3[index].postTaxPrice = '';
      this.data3[index].postTaxTotalAmount = '';
    },

    // //类别选择
    // checkTreeSelect(value, label, extra) {
    //   this.addInfoForm.materielTypeId = value
    // },

    amountChange(row, index) {
      if (row.amount <= 0 && typeof row.amount === 'number') {
        this.$message.error('数量需要大于0');
        // this.data3[index].amount = "";
        return;
      }
      this.data3[index].amount = row.amount;
    },
    priceChange(row, index) {
      if (row.price < 0 && typeof row.price === 'number') {
        this.$message.error('单价不能小于0');
        return;
      }
      this.data3[index].price = row.price;
    },
    // 弹框取消
    cancelAdd() {
      this.addInfoForm = {
        id: -1,
        billNo: '',
        billDate: this.$moment().format('YYYY-MM-DD'),
        billState: '未提交',
        waterPlantId: '',
        transactor: ''
      };
      this.addInfoFormModel = false;
      this.$refs.addInfoFormRule && this.$refs.addInfoFormRule.resetFields();
    },
    // 查看
    watch(row, index) {
      this.editMaintain(row, index);
      this.watchFlag = true;
    },
    getDicName(dicName, text) {
      return this[dicName].length
        ? this[dicName].filter(item => {
            return item.code === text + '' || item.value === text + '';
          })[0]?.name || ''
        : '';
    },
    // 编辑 物品信息详情
    editMaintain(row, index) {
      if (!(row.billState === '审核未通过' || row.billState === '未提交')) {
        this.detailColumns = [...this.columns2.slice(0, -1)];
      }
      this.addIn = false;
      this.watchFlag = false;
      this.addInfoForm = Object.assign({}, row);
      if (this.addInfoForm.billState === '审核中' || this.addInfoForm.billState === '审核通过') {
        this.watchFlag = true;
      } else {
        this.watchFlag = false;
      }
      this.addInfoForm.articleId = row.materielSource;
      this.data3 = [];
      row.detailList.forEach(item => {
        const obj = {
          numIndex: item.sortNo,
          depotId: item.depotId,
          materielTypeId: item.materielTypeId,
          materielId: item.materielId,
          materielName: item.materielName,
          specifications: item.specification,
          unit: item.unit,
          amount: item.quantity,
          supplier: item.supplier,
          supplierName: this.supplierDic.find(dic => dic.value === item.supplier)
            ? this.supplierDic.find(dic => dic.value === item.supplier).name
            : item.supplier,
          taxRate: item.taxRate,
          postTaxPrice: handleNum(item.postTaxPrice),
          postTaxTotalAmount: handleNum(item.postTaxTotalAmount),
          price: handlePrice(item.price),
          totalAmount: item.totalAmount
          // memo: item.memo
        };
        this.data3.push(obj);
      });
      this.addInfoFormModel = true;
      this.editFlag = true;
    },
    // 作废
    handleVoidOrder(row) {
      const vo = { ...row, detailDtoList: row.detailList, billState: '已作废' };
      modifyDepotInOutBill(vo)
        .then(responst => {
          this.addInfoModelLoading = false;
          if (responst.status === 'complete') {
            this.addInfoFormModel = false;
            this.$message.success('作废成功!');
          }
          this.refresh(false);
        })
        .finally(() => {
          this.tableLoading = false;
        });
    },

    // 作废
    deleteOrder(row) {
      this.$confirm({
        title: '确定作废吗？',
        onOk: () => {
          this.tableLoading = true;
          this.handleVoidOrder(row);
        }
      });
    },
    // 仓库维修-删除
    removeMaintain(row, index) {
      this.$confirm({
        title: '确定删除吗？',
        onOk: () => {
          this.tableLoading = true;
          deleteDepotInOutBill(row.id).then(res => {
            this.tableLoading = false;
            if (res.status === 'complete') {
              this.$message.success('删除成功');
              this.maintainList.splice(index, 1);
              this.refresh(false);
            }
          });
        }
      });
    },
    // 打印单据
    printMaintain(row, taxType) {
      this.$message.info('正在处理，请等待！');
      inoutMainPrint(row.id, taxType).then(res => {
        printFile(res, '入库登记');
      });
    },
    // 弹框-材料选择
    materialChange(value) {
      if (value) {
        this.data3Loading = true;
        getBaseMaterielDetail({ materielId: parseInt(value) }).then(responst => {
          const { resultData } = responst;
          this.data3Loading = false;
          this.$set(this.data3, this.changeIndex, {
            ...this.data3[this.changeIndex],
            specifications: resultData.specification,
            supplierName: this.supplierDic.find(item => item.value === resultData.supplier)
              ? this.supplierDic.find(item => item.value === resultData.supplier).name
              : resultData.supplier,
            supplier: resultData.supplier,
            price: resultData.price,
            taxRate: resultData.taxRate,
            unit: resultData.unit
          });
        });
      } else {
        this.data3[this.changeIndex].specifications = '';
        this.data3[this.changeIndex].unit = '';
      }
    },
    // 重置
    handleReset() {
      this.inquireFlag = 0;
      this.$refs.formItems && this.$refs.formItems.resetFields();
      this.formItem.startDate = '';
      this.formItem.billState = '';
      this.formItem.endDate = '';
      this.formItem.waterPlantId = undefined;
      this.formItem.date = '';
      this.formItem.managerId = '';
      this.formItem.manager = '';
      this.refresh();
    },
    orderSelectFactory(val, code) {
      this.generateBillNo(val);
    },
    // 获取单号
    generateBillNo(val) {
      if (val) {
        generateBillNo(val).then(res => {
          this.addInfoForm.billNo = res.resultData;
        });
      } else {
        this.addInfoForm.billNo = '';
      }
    },
    // 获取仓库列表
    getBeseDepotList() {
      this.tableLoading = true;
      const vo = {
        waterPlantId: this.addInfoForm.waterPlantId,
        supplier: this.addInfoForm.supplier
      };
      getBeseDepotList(vo).then(res => {
        this.tableLoading = false;
        this.warehouseList = res.resultData.records;
      });
    },
    // 文件导入
    handleUpload(file) {
      this.file = file;
      return false;
    },
    // 导入
    importBtm() {
      this.showimportModal = true;
    },
    // 文件加载
    upload() {
      this.loadingStatus = true;
      setTimeout(() => {
        this.file = null;
        this.loadingStatus = false;
        this.$message.success('Success');
      }, 1500);
    },
    initSortable() {
      let _this = this;
      const mytb = document.querySelector('#addRegist tbody');
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
    // 物品信息-弹框确定按钮
    addInfoModelOk(billState, id) {
      this.$refs.addInfoFormRule.validate(valid => {
        if (valid) {
          const depoList = [];
          try {
            _.forEach(this.data3, (item, index) => {
              if (item.depotId === '' || item.depotId === null) {
                this.$message.error(`第${index + 1}行仓库不能为空！`);
                throw new Error('breakForEach');
              } else if (item.materielTypeId === '' || item.materielTypeId === null) {
                this.$message.error(`第${index + 1}行类别不能为空！`);
                throw new Error('breakForEach');
              } else if (item.materielId === '' || item.materielId === null) {
                this.$message.error(`第${index + 1}行材料不能为空！`);
                throw new Error('breakForEach');
              } else if (item.amount === '' || item.amount === null) {
                this.$message.error(`第${index + 1}行数量不能为空！`);
                throw new Error('breakForEach');
              } else if (item.amount <= 0) {
                this.$message.error(`第${index + 1}行数量需要大于0！`);
                throw new Error('breakForEach');
              }
              //  else if (item.supplier === '' || item.supplier === null) {
              //   this.$message.error(`第${index + 1}行供应商不能为空！`);
              //   throw new Error('breakForEach');
              // }
              else if (item.price === '' || item.price === null) {
                this.$message.error(`第${index + 1}行单价不能为空！`);
                throw new Error('breakForEach');
              } else if (item.price < 0) {
                this.$message.error(`第${index + 1}行单价不能小于0！`);
                throw new Error('breakForEach');
              } else if (item.totalAmount === '' || item.totalAmount === null) {
                this.$message.error(`第${index + 1}行金额不能为空！`);
                throw new Error('breakForEach');
              }
              depoList.push({
                sortNo: index,
                materielId: item.materielId,
                depotId: item.depotId,
                materielTypeId: item.materielTypeId,
                quantity: handleNum(item.amount),
                price: handleNum(item.price),
                supplier: item.supplier,
                taxRate: handleNum(item.taxRate),
                postTaxPrice: handleNum(item.postTaxPrice),
                postTaxTotalAmount: handleNum(item.postTaxTotalAmount),
                totalAmount: handleNum(item.totalAmount)
                // memo: item.memo
              });
            });
            const vo = {
              billNo: this.addInfoForm.billNo,
              materielSource: this.addInfoForm.articleId,
              billState: billState,
              billType: 1,
              billDate:
                this.$moment(this.addInfoForm.billDate).format('YYYY-MM-DD') + ' ' + '00:00:00',
              transactor: this.addInfoForm.transactor,
              depotManagerId: this.addInfoForm.depotManagerId,
              depotManager: this.addInfoForm.depotManager,
              materielAccountant: this.addInfoForm.materielAccountant,
              memo: this.addInfoForm.memo,
              totalAmount: handleNum(this.addInfoForm.totalAmount),
              waterPlantId: this.addInfoForm.waterPlantId,
              eqBillId: '',
              techParam: this.addInfoForm.techParam,
              backupPurpose: this.addInfoForm.backupPurpose,
              supplier: this.addInfoForm.supplier,
              detailDtoList: depoList
            };
            this.addInfoModelLoading = true;
            if (this.addInfoForm.id !== -1) {
              vo.id = this.addInfoForm.id;
            }
            let method = null;
            if (this.addIn) {
              method = createDepotInOutBill;
            } else {
              method = modifyDepotInOutBill;
            }
            method(vo).then(responst => {
              this.addInfoModelLoading = false;
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
                  materielId: '',
                  specifications: '',
                  unitPrice: '',
                  amount: '',
                  price: '',
                  supplier: '',
                  supplierName: '',
                  taxRate: '',
                  postTaxPrice: '',
                  postTaxTotalAmount: '',
                  materielTypeId: '',
                  totalPrice: ''
                  // memo: ''
                }
              ];
            });
          } catch (e) {
            if (e.message !== 'breakForEach') throw e;
          }
        }
      });
    },
    // 弹框新增
    newAdd() {
      this.editFlag = false;
      this.data3.push({
        depotId: '',
        materielTypeId: '',
        materielTypeName: '',
        numIndex: '',
        materielId: ''
      });
    },
    // 导入
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

.ivu-table-wrapper {
  overflow: inherit;
}
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
input[type='number'] {
  -moz-appearance: textfield;
}

.sw-mt {
  height: 100%;
}
</style>
