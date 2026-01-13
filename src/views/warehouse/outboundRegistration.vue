<!--
 * @Description: 仓储管理-出库登记页面
 * @Author: qirui
-->
<template>
  <div class="warehouse-registration warehouse-common">
    <w-form-model
      ref="formItems"
      class="warehouse-common-top"
      :model="formItem"
      v-bind="layout"
      :label-width="100"
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
          <w-form-model-item label="单号：" label-for="selectType" prop="orderId">
            <w-input v-model="formItem.orderId" placeholder @pressEnter="refresh"></w-input>
          </w-form-model-item>
        </w-col>
        <template v-if="collapse">
          <w-col :span="6" v-bind="grid">
            <w-form-model-item label="出库类型：" label-for="selectType" prop="source">
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
            <w-form-model-item label="库单状态：" label-for="selectType" prop="billState">
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
            <w-form-model-item label="出库日期：" label-for="selectType" prop="date">
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
            <w-form-model-item label="领用单位：" label-for="selectType" prop="receiptUnit">
              <w-input @pressEnter="refresh" v-model="formItem.receiptUnit"></w-input>
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
            <w-button type="primary" @click="refresh" class="mr_12 supply-top-1" icon="search"
              >查询</w-button
            >
            <!-- <w-button class="mr_12" @click="handleExportExcel"
              ><w-icon type="export" />导出</w-button
            > -->
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
          </div>
        </w-col>
      </w-row>
    </w-form-model>
    <div class="warehouse-common-con">
      <div v-if="file !== null">
        Upload file: {{ file.name }}
        <w-button type="text" @click="upload" :loading="loadingStatus">{{
          loadingStatus ? '上传中' : '点击上传'
        }}</w-button>
      </div>
      <s-table
        ref="table"
        :scroll="{ x: 1450 }"
        :columns="maintainColumns"
        :rowKey="(record, index) => record.billNo + '' + index"
        :canResize="true"
        :initLoadData="false"
        :data="getDepotInOutList"
        class="ivu-mt out-table"
      >
        <template slot="materielSource" slot-scope="text">
          <w-tooltip>
            <template slot="title">{{ getDicName('sourceData', text) }}</template>
            {{ getDicName('sourceData', text) }}
          </w-tooltip>
        </template>
        <template slot="billNo" slot-scope="txt, row, index">
          <w-tooltip>
            <template slot="title">{{ row.billNo }}</template>
            <a @click="watch(row, index)">{{ row.billNo }}</a>
          </w-tooltip>
        </template>
        <template slot="billDate" slot-scope="txt, row">{{
          row.billDate && row.billDate.split(' ')[0]
        }}</template>
        <template slot="depotManagerId" slot-scope="txt, row">
          <span>{{ txt }}</span>
        </template>
        <template slot="materielAccountantId" slot-scope="txt, row">
          <span>{{ row.materielAccountant }}</span>
        </template>
        <template slot-scope="txt, row, index" slot="action">
          <div class="sw-table__row__opr">
            <span v-if="hasStateBtn(row.billState)" class="mr_12">
              <a @click="row.billState === '已出库' ? deleteOrder(row) : editMaintain(row, index)">
                {{ getStateName(row.billState) }}
              </a>
            </span>
            <span
              v-if="
                row.billState !== '已出库' &&
                  (row.billState === '审核未通过' || row.billState === '未提交') &&
                  buttonCodes['inoutDelete']
              "
              class="mr_12"
            >
              <a @click="removeMaintain(row, index)">删除</a>
            </span>
          </div>
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
                :disabled="!addOut"
                :showAll="!autoSelect"
              ></factory-select>
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
            <w-form-model-item label="领用单位：" label-for="selectType" prop="receiptUnit">
              <w-input :disabled="!addOut" v-model="addInfoForm.receiptUnit"></w-input>
            </w-form-model-item>
          </w-col>
          <w-col v-bind="grid2">
            <w-form-model-item label="领用人：" label-for="selectType" prop="transactor">
              <w-input v-model="addInfoForm.transactor" :disabled="watchFlag" />
            </w-form-model-item>
          </w-col>
          <w-col v-bind="grid2">
            <w-form-model-item label="领用目的：" label-for="selectType" prop="memo">
              <w-input v-model="addInfoForm.memo" style="width: 100%" :disabled="watchFlag" />
            </w-form-model-item>
          </w-col>
        </w-row>
      </w-form-model>
      <w-button style="margin-bottom: 20px" type="primary" @click="newAdd" v-show="!watchFlag"
        ><i class="wpgicon icon-ic_add"></i>新建</w-button
      >
      <!-- <w-button type="primary" @click="importBtm" style="margin-left: 20px;" v-show="!watchFlag"
        ><w-icon type="import" />导入</w-button
      > -->
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
            showSearch
            :filterOption="filterOption"
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
            showSearch
            :dropdown-style="{ maxHeight: '200px', overflow: 'auto' }"
            :tree-data="articleTypeList"
            treeNodeFilterProp="title"
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
          @click="addInfoModelOk('复核中', addInfoForm.id)"
          :loading="addInfoModelLoading"
          >审核通过</w-button
        >
        <w-button
          type="error"
          v-if="addInfoForm.id != -1 && addInfoForm.billState == '复核中'"
          @click="addInfoModelOk('审核未通过', addInfoForm.id)"
          :loading="addInfoModelLoading"
          >复核不通过</w-button
        >
        <w-button
          type="primary"
          v-if="addInfoForm.id != -1 && addInfoForm.billState == '复核中'"
          @click="addInfoModelOk('已出库', addInfoForm.id)"
          :loading="addInfoModelLoading"
          >复核通过</w-button
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
      :loading="addLoading"
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
    <ImportModal v-model="showimportModal" modalType="out" @changeFile="changeFile" />
  </div>
</template>

<script>
import {
  getDepotInOutList,
  inoutMainExportExcel,
  inoutMainPrint,
  deleteDepotInOutBill,
  getBaseMaterielList,
  getBaseMaterielDetail,
  getBeseDepotList,
  modifyDepotInOutBill,
  getBaseMaterielType,
  createDepotInOutBill,
  getPrivateAndQuantity,
  generateBillNo
} from '@/api/warehouse.js';
import { mapState } from 'vuex';
import { userList as getAllUser } from '@/api/baseInfo';
import { sysDictListByCode } from '@/api/manage';
import { handleNum } from './base/data';
import Loop from './base/levelLoop';
import ExportModal from './components/export';
import ImportModal from './components/import';
import FactorySelect from '@/components/factory-select/index';
import { exportFile, printFile } from '@/utils/util';
import { findItemFromTree } from '@/utils/js/tool/tools.js';
import Sortable from 'sortablejs';
import * as _ from 'lodash-es';
import SelectMateriel from './components/selectMateriel.vue';
import { result } from 'lodash-es';
export default {
  name: 'outboundRegistration',
  components: {
    ExportModal,
    ImportModal,
    FactorySelect,
    SelectMateriel
  },
  data() {
    return {
      orgTree: [],
      supplierDic: [],
      replaceFields: {
        children: 'children',
        title: 'name',
        key: 'id',
        value: 'id'
      },
      articleTypeList: [],
      layout: {
        labelCol: { span: 6 },
        wrapperCol: { span: 18 }
      },
      labelColWidth: {
        span: 6
      },
      materialList: [],
      fieldNames: {
        // cascader
        label: 'name',
        value: 'id',
        children: 'children'
      },
      addDepot: false,
      addDepotRef: {
        material: {
          required: true,
          message: '材料不能为空',
          trigger: 'blur',
          type: 'array'
        }
      },
      priceNumList: [],
      priceQuantityMap: {},
      priceQuantityMapSelect: {},
      priceQuantityMapFixed: {},
      price: [],
      addDepotForm: {
        material: '',
        warehouse: '',
        materielName: ''
      },
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
          value: '复核中',
          label: '复核中'
        },
        {
          value: '审核未通过',
          label: '审核未通过'
        },
        {
          value: '已出库',
          label: '已出库'
        },
        {
          value: '已作废',
          label: '已作废'
        }
      ],
      addLoading: false,
      showExportModal: false, // 导出
      showimportModal: false, // 导入
      percent: 0,
      exportStatus: 0,
      options3: {
        disabledDate(date) {
          // 设置当天以后的日期不可选
          return date && date.valueOf() > Date.now();
        }
      }, // 设置不可选时间
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
        waterPlantId: undefined, //
        orderId: '', // 单号
        source: '', // 来源
        type: '', // 类别
        billState: '', // 库单状态
        name: '', // 商品名称
        status: '', // 状态
        startDate: '', // 出库日期
        endDate: '', // 出库截止日期
        receiptUnit: '' // 领料人
      },
      sourceData: [], //出库类型
      typeData: [
        {
          value: '1',
          label: '阀门'
        }
      ], // 物品类别
      collapse: false,
      pageData: {
        sorting: 'id',
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
          title: '单号',
          slot: 'billNo',
          scopedSlots: { customRender: 'billNo' },
          key: 'billNo',
          dataIndex: 'billNo',
          width: 170,
          tooltip: true,
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
          title: '出库类型',
          width: 170,
          tooltip: true,
          ellipsis: true,
          key: 'materielSource',
          dataIndex: 'materielSource',
          scopedSlots: { customRender: 'materielSource' }
        },
        {
          title: '出库日期',
          slot: 'billDate',
          scopedSlots: { customRender: 'billDate' },
          key: 'billDate',
          dataIndex: 'billDate',
          width: 200
        },
        {
          title: '领用单位',
          slot: 'receiptUnit',
          key: 'receiptUnit',
          dataIndex: 'receiptUnit',
          width: 170,
          tooltip: true
        },
        {
          title: '领用人',
          dataIndex: 'transactor',
          width: 120,
          tooltip: true
        },
        {
          title: '领用目的',
          dataIndex: 'memo',
          width: 170,
          tooltip: true
        },
        {
          title: '仓管员',
          // slot: 'depotManagerId',
          // scopedSlots: { customRender: 'depotManagerId' },
          key: 'depotManagerId',
          width: 120,
          dataIndex: 'depotManagerId',
          tooltip: true,
          customRender: (text, row, index) => {
            let tempArr = row.detailList.map(detail => detail.depotManager);
            return Array.from(new Set(tempArr)).join(',');
          },
          ellipsis: true
        },
        {
          title: '材料会计',
          slot: 'materielAccountantId',
          scopedSlots: { customRender: 'materielAccountantId' },
          key: 'materielAccountantId',
          width: 120,
          dataIndex: 'materielAccountant',
          tooltip: true
        },
        {
          title: '状态',
          key: 'billState',
          width: 120,
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
      userBaseList: [], // 经办人列表

      addInfoFormModel: false,
      addInfoForm: {
        id: -1,
        billNo: '',
        billDate: this.$moment().format('YYYY-MM-DD'),
        billState: '未提交'
      },
      addInfoModelLoading: false, // 弹框loading
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
      data3Loading: false,
      detailColumns: [],
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
          slot: 'materielTypeId',
          width: 150,
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
      ],
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
      watchFlag: false,
      file: null, // 导入文件
      loadingStatus: false,
      warehouseList: [],
      materialTypeList: [],
      inquireFlag: 0,
      editFlag: false,
      addOut: false
    };
  },
  computed: {
    ...mapState('setting', ['buttonCodes']),
    ...mapState('configure', ['textReplace']),
    autoSelect() {
      return this.$store.state.factoryList?.length === 1;
    }
  },
  watch: {
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
    },
    'addInfoForm.waterPlantId': {
      handler(val) {
        if (val) {
          this.getBeseDepotList();
        }
      },
      immediate: true
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
    this.getUserList();

    this.sysDictListByCode('OutStorgeType', 'sourceData');
    this.refresh(true, false);
  },
  activated() {
    this.getTypeList();
  },
  methods: {
    findItemFromTree,
    loadOrgTree(orgTree) {
      this.orgTree = orgTree || [];
    },
    hasStateBtn(state) {
      return !(
        state === '已作废' ||
        ((this.getStateName(state) === '审核' || this.getStateName(state) === '复核') &&
          !this.buttonCodes['inOutCheck']) ||
        (this.getStateName(state) === '作废' && !this.buttonCodes['inOutCancel'])
      );
    },
    getStateName(state) {
      return state === '审核未通过' || state === '未提交'
        ? '编辑'
        : state === '已出库'
        ? '作废'
        : state === '复核中'
        ? '复核'
        : '审核';
    },
    // 导入成功
    changeFile(data) {
      if (!this.data3[0].depotId) {
        this.data3 = data;
      } else {
        this.data3.push(...data);
      }
      this.showimportModal = false;
    },
    // 打印单据
    printMaintain(row, taxType) {
      this.$message.info('正在处理，请等待！');
      inoutMainPrint(row.id, taxType).then(res => {
        printFile(res, '出库登记');
      });
    },
    //选择材料
    changeMateriel(value) {
      this.addDepotForm.material = value.key;
      this.addDepotForm.materielName = value.label;
    },
    // 选厂
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
      this.addDepotForm.material = row.materielId;
      this.addDepotForm.materielTypeId = row.materielTypeId;
      this.addDepotForm.warehouse = row.depotId;
      this.addDepotForm.materielName = row.materielName;
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
    checkFactory(orgId) {
      if (!orgId) {
        this.warehouseList = [];
        this.$message.warn('请先选择组织');
      }
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
    // 出库列表
    getDepotInOutList(parameter) {
      const vo = {
        billType: 2,
        billState: this.formItem.billState,
        waterPlantId: this.formItem.waterPlantId,
        page: {
          current: parameter.pageNo,
          size: parameter.pageSize
        }
      };
      if (this.inquireFlag === 0) {
        vo.billNo = this.formItem.orderId;
        vo.materielSource = this.formItem.source;
        vo.receiptUnit = this.formItem.receiptUnit;
        vo.startBillDate = this.formItem.startDate;
        vo.endBillDate = this.formItem.endDate;
      }
      return getDepotInOutList(vo).then(response => {
        this.maintainList = response.resultData.records;
        return response.resultData;
      });
    },
    // 变换经办人
    handleTransactorChange(value) {
      this.addInfoForm.receiptUnit = this.userBaseList.filter(item => item.key === value)[0].title;
    },
    refresh(bool = true, flage = true) {
      if (this.$refs.table && !this.$refs.table.localLoading) {
        this.$refs.table.refresh(bool);
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
        // let filterData = this.removeElements(JSON.parse(JSON.stringify(oldList)), function(item) {
        //   return item.data.materielTypeNo !== 'beipinbeijian';
        // });
        // console.log('eee',filterData)
        // this.articleTypeList = filterData;
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
    // 导出当前展示数据
    handleExportExcel() {
      const vo = {
        billType: 2,
        billState: this.formItem.billState,
        waterPlantId: this.formItem.waterPlantId,
        page: {
          current: this.pageData.current,
          size: this.pageData.pageSize
        }
      };
      if (this.inquireFlag === 0) {
        vo.billNo = this.formItem.orderId;
        vo.materielSource = this.formItem.source;
        vo.receiptUnit = this.formItem.receiptUnit;
        vo.startBillDate = this.formItem.startDate;
        vo.endBillDate = this.formItem.endDate;
      }
      inoutMainExportExcel(vo).then(res => {
        exportFile(res, '出库登记');
      });
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
    disabledDate(current) {
      // Can not select days after today
      return current && current > this.$moment().endOf('day');
    },
    // 查询日期
    handleChangeDate(date) {
      this.formItem.startDate = this.$moment(date[0]).format('YYYY-MM-DD');
      this.formItem.endDate = this.$moment(date[1]).format('YYYY-MM-DD');
    },
    changeDepotManager(data) {
      this.addInfoForm.depotManager = data.user;
      this.addInfoForm.depotManagerId = data.userId;
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
    // 过滤经办人
    filterOption(input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      );
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
    handlePriceQuantityMapSelect() {
      this.priceQuantityMapSelect = JSON.parse(JSON.stringify(this.priceQuantityMap));
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
    // 查看
    watch(row, index) {
      this.editMaintain(row, index);
      this.watchFlag = true;
    },
    // 编辑 物品信息详情
    async editMaintain(row, index) {
      if (!(row.billState === '审核未通过' || row.billState === '未提交')) {
        this.detailColumns = [...this.columns2.slice(0, -1)];
      }
      this.addInfoFormModel = true;
      this.addOut = false;

      const resData = row;
      this.addInfoForm.billNo = resData.billNo;
      this.addInfoForm.waterPlantId = resData.waterPlantId;
      this.addInfoForm.id = resData.id;
      this.addInfoForm.billState = resData.billState;
      if (['审核中', '复核中'].includes(this.addInfoForm.billState)) {
        this.watchFlag = true;
      } else {
        this.watchFlag = false;
      }
      this.addInfoForm.articleId = resData.materielSource;
      this.addInfoForm.billDate = this.$moment(resData.billDate);
      this.addInfoForm.techParam = resData.techParam;
      this.addInfoForm.receiptUnit = resData.receiptUnit;
      this.addInfoForm.depotManagerId = resData.depotManagerId;
      this.addInfoForm.depotManager = resData.depotManager;
      this.addInfoForm.materielAccountant = resData.materielAccountant;
      this.addInfoForm.memo = resData.memo;
      this.addInfoForm.transactor = resData.transactor;
      this.addInfoForm.backupPurpose = resData.backupPurpose;
      this.data3 = [];
      const promises = [];
      resData.detailList.forEach(item => {
        promises.push(getPrivateAndQuantity(item.materielId));
      });
      let res = await Promise.all(promises);
      resData.detailList.forEach((item, i) => {
        if (!this.priceQuantityMap[item.materielId]) {
          this.priceQuantityMap[item.materielId] = { ...res[i].resultData };
          this.priceQuantityMapFixed[item.materielId] = JSON.parse(
            JSON.stringify(res[i].resultData)
          );
        }
      });

      resData.detailList.forEach((item, i) => {
        const obj = {
          numIndex: item.sortNo,
          depotId: item.depotId,
          materielTypeId: item.materielTypeId,
          materielName: item.materielName,
          supplier: item.supplier,
          supplierName: this.supplierDic.find(dic => dic.value === item.supplier)
            ? this.supplierDic.find(dic => dic.value === item.supplier).name
            : item.supplier,
          materielId: item.materielId,
          specification: item.specification,
          totalAmount: item.totalAmount,
          unit: item.unit,
          taxRate: item.taxRate,
          price: item.price,
          postTaxPrice: item.postTaxPrice,
          postTaxTotalAmount: item.postTaxTotalAmount,
          existingQuantity: this.priceQuantityMap[item.materielId][item.price],
          quantity: Number(item.quantity),
          memo: item.memo
        };
        if (Object.keys(this.priceQuantityMap[item.materielId]).length === 1) {
          let curPriceQuantity = this.priceQuantityMap[item.materielId];

          if (curPriceQuantity) {
            obj.curPriceQuantity = curPriceQuantity;
          }
        }
        this.data3.push(obj);
      });
      this.addInfoForm.billNo = resData.billNo;
      this.$set(this.addInfoForm);
      this.addInfoFormModel = true;
      this.updateData();
    },
    async sysDictListByCode(code, data) {
      const res = await sysDictListByCode(code);
      this[data] = res.resultData;
    },
    // 仓库选择
    warehouseChange(row, index) {
      this.data3[index].depotId = row.depotId;
      this.data3[index].materielId = '';
      this.data3[index].materielName = '';
      this.updateData();
      this.selectBaseLast(row.depotId, index);
    },
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
    // 仓库维修-删除
    removeMaintain(row, index) {
      this.tableLoading = true;
      this.$confirm({
        title: '提示',
        content: '您确定要删除吗',
        onOk: () => {
          deleteDepotInOutBill(row.id).then(res => {
            this.tableLoading = false;
            if (res.status === 'complete') {
              this.$message.success('删除成功');
              this.refresh(false);
            }
          });
        }
      });
    },
    change(index) {
      this.changeIndex = index;
    },

    // 重置
    handleReset() {
      this.inquireFlag = 0;
      this.pageData.current = 1;
      this.formItem.startDate = '';
      this.formItem.endDate = '';
      this.formItem.billState = '';
      this.formItem.waterPlantId = undefined;
      this.formItem.orderId = '';
      this.formItem.receiptUnit = '';
      this.formItem.managerId = '';
      this.formItem.date = '';
      this.refresh();
    },

    // 获取单号
    generateBillNo() {
      generateBillNo('').then(res => {
        this.addInfoForm.billNo = res.resultData;
      });
    },
    // 获取仓库列表
    getBeseDepotList() {
      this.tableLoading = true;
      const vo = {
        waterPlantId: this.addInfoForm.waterPlantId
      };
      getBeseDepotList(vo).then(responst => {
        this.tableLoading = false;
        this.warehouseList = responst.resultData.records;
      });
    },
    // 文件导入
    handleUpload(file) {
      this.file = file;
      return false;
    },
    getDicName(dicName, text) {
      return this[dicName].length
        ? this[dicName].filter(item => {
            return item.code === text + '' || item.value === text + '';
          })[0]?.name || ''
        : '';
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
            }
            // else if (item.supplier === '' || item.supplier === null) {
            //   this.$message.error(`第${index + 1}行供应商不能为空！`);
            //   throw new Error('breakForEach');
            // }
            else if (item.price === '' || item.price === null) {
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
            transactor: this.addInfoForm.transactor,
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
          let method = null;
          if (this.addOut) {
            method = createDepotInOutBill;
          } else {
            method = modifyDepotInOutBill;
          }
          this.tableLoading = true;
          this.addInfoModelLoading = true;
          method(vo).then(responst => {
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
.pick-edit {
  cursor: pointer;
  position: absolute;
  right: -30px;
  top: -2px;
  font-size: 24px;
  z-index: 20;
  &:hover {
    color: var(--supply-color-primary-DEFAULT);
  }
}
.mr_12 {
  margin-right: 12px;
}
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

.out-table {
  height: 100%;
}
</style>
