<!-- 基础资料 -->
<template>
  <div class="goods-info warehouse-common">
    <!-- <w-spin size="large" fix v-if="tableLoading"></w-spin> -->
    <w-form-model
      ref="informationFrom"
      class="warehouse-common-top"
      :model="informationFrom"
      :label-width="100"
      v-bind="layout"
    >
      <w-row :gutter="10">
        <w-col v-bind="grid">
          <w-form-model-item :label="`选择${textReplace}`" label-for="emergency">
            <factory-select
              v-model="informationFrom.waterPlantId"
              autoSelect
              :showAll="!autoSelect"
            ></factory-select>
          </w-form-model-item>
        </w-col>
        <w-col v-bind="grid">
          <w-form-model-item label="物品编号:">
            <w-input
              placeholder="请输入物品编号"
              v-model.trim="informationFrom.articleId"
              style="width: 100%"
              @pressEnter="refresh"
            ></w-input>
          </w-form-model-item>
        </w-col>
        <w-col v-bind="grid">
          <w-form-model-item label="物品名称:">
            <w-input
              v-model.trim="informationFrom.articleName"
              placeholder="请输入物品名称"
              @pressEnter="refresh"
            ></w-input>
          </w-form-model-item>
        </w-col>
        <w-col v-bind="grid">
          <w-form-model-item label="所属仓库：">
            <w-select
              placeholder="请选择所属仓库"
              v-model="informationFrom.default"
              @focus="checkFactory(informationFrom.waterPlantId)"
            >
              <w-select-option
                v-for="(item, i) in depotList"
                :key="item.id + '' + i"
                :value="item.id"
                >{{ item.depotName }}</w-select-option
              >
            </w-select>
          </w-form-model-item>
        </w-col>
        <w-col class="supply-float-right">
          <w-form-model-item label="" :labelCol="{ span: 0 }" :wrapperCol="{ span: 24 }">
            <w-button class="mr_12" @click="handleImport"
              ><w-icon type="ic_publish" />导入</w-button
            >
            <w-button class="mr_12" @click="handleExport(0)"
              ><w-icon type="ic_file_download" />导出</w-button
            >
            <w-button class="mr_12" @click="handleExport(1)"
              ><w-icon type="ic_file_download" />模板下载</w-button
            >
            <w-button type="primary" @click="addInformation" icon="plus" class="mr_12">
              新建</w-button
            >
            <w-button class="mr_12" @click="managementReset" icon="reload">重置</w-button>
            <w-button type="primary" @keyup.enter.native="refresh" @click="refresh" icon="search"
              >查询</w-button
            >
            <div ref="fileCon" style="display: none">
              <input
                id="file"
                ref="file"
                type="file"
                name="fileUpload"
                style="display: none"
                accept=".xls,.xlsx,.XLS,.XLSX"
                @change="handleFile"
              />
            </div>
          </w-form-model-item>
        </w-col>
      </w-row>
    </w-form-model>
    <div class="warehouse-common-con">
      <s-table
        ref="table"
        :columns="informationColumns"
        :rowKey="(record, i) => record.materielNo + '' + i"
        :scroll="{ x: 1400 }"
        :canResize="true"
        :initLoadData="false"
        :data="getBaseMaterielList"
        :rowClassName="(record, index) => (index === deletingRow ? 'deleting-row' : '')"
      >
        <template slot="action" slot-scope="text, records, index">
          <div class="sw-table__row__opr">
            <span class="mr_12">
              <a @click="editMaintain(records)">编辑</a>
            </span>
            <a @click="removeMaintain(records, index)">删除</a>
          </div>
        </template>
        <template slot="stuff" slot-scope="text">
          <w-tooltip>
            <template slot="title">
              {{ getDicName(MaterialList, text) }}
            </template>
            {{ getDicName(MaterialList, text) }}
          </w-tooltip>
        </template>
        <template slot="tooltip" slot-scope="text">
          <w-tooltip>
            <template slot="title">
              {{ text }}
            </template>
            {{ text }}
          </w-tooltip>
        </template>
      </s-table>
      <div></div>
    </div>
    <!-- 新增物料弹框 -->
    <w-modal
      class="secondary-modal"
      :visible="addInfoModelLoading"
      :maskClosable="false"
      title="物品资料"
      width="900px"
      @cancel="cancelAddInfoModel"
      @ok="addInfoModelOk"
    >
      <w-form-model
        ref="addInfoFormRule"
        :model="addInfoForm"
        :rules="addInfoFormRule"
        v-bind="layout"
        :labelCol="labelColWidth"
      >
        <w-row type="flex" justify="space-between">
          <w-col span="12">
            <w-form-model-item
              :label="`选择${textReplace}`"
              style="margin-bottom: 32px"
              prop="waterPlantId"
            >
              <factory-select
                v-model="addInfoForm.waterPlantId"
                autoSelect
                :showAll="!autoSelect"
                :disabled="addInfoForm.disabled"
              ></factory-select>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="物品编号：" label-for="selectType" prop="materielNo">
              <w-input v-model="addInfoForm.materielNo" placeholder style="width: 200px"></w-input>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="物品名称：" label-for="selectType" prop="materielName">
              <w-input
                v-model="addInfoForm.materielName"
                placeholder
                style="width: 200px"
              ></w-input>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="供应商：" label-for="selectType" prop="supplier">
              <span class="supply-relative">
                <w-select v-model="addInfoForm.supplier" style="width: 200px" clearable>
                  <w-select-option
                    v-for="(item, i) in supplierDic"
                    :key="item.code + '' + i"
                    :value="item.code"
                    >{{ item.name }}</w-select-option
                  >
                </w-select>
                <w-tooltip class="supplier-edit">
                  <template slot="title">
                    供应商维护
                  </template>
                  <w-icon @click="openSupplierEdit" type="ic_border_color" />
                </w-tooltip>
              </span>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="单价：" label-for="selectType" prop="price">
              <w-input
                v-model="addInfoForm.price"
                placeholder
                style="width: 200px"
                type="number"
                :min="0"
                :max="9999999999"
              ></w-input>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="规格型号：" label-for="selectType" prop="specification">
              <w-input
                v-model="addInfoForm.specification"
                placeholder
                style="width: 200px"
              ></w-input>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="材质：" label-for="selectType">
              <w-select v-model="addInfoForm.stuff" style="width: 200px" clearable>
                <w-select-option
                  v-for="(item, i) in MaterialList"
                  :key="item.dictCode"
                  :value="item.dictCode"
                  >{{ item.dictName }}</w-select-option
                >
              </w-select>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="计量单位：" label-for="selectType">
              <w-select v-model="addInfoForm.unit" style="width: 200px">
                <w-select-option
                  v-for="item in unitList"
                  :key="item.dictCode"
                  :value="item.dictName"
                >
                  {{ item.dictName }}
                </w-select-option>
              </w-select>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="所属仓库：" label-for="selectType" prop="depotId">
              <w-select
                v-model="addInfoForm.depotId"
                style="width: 200px"
                clearable
                @focus="checkFactory(addInfoForm.waterPlantId)"
                @change="checkDepoId(addInfoForm.depotId)"
              >
                <w-select-option
                  v-for="(item, i) in depotList1"
                  :key="item.id + '' + i"
                  :value="item.id"
                  >{{ item.depotName }}</w-select-option
                >
              </w-select>
            </w-form-model-item>
          </w-col>
          <w-col v-if="addInfoForm.depotId" span="12">
            <w-form-model-item label="货架号：" label-for="selectType">
              <w-select v-model="addInfoForm.depotShelfId" style="width: 200px" clearable>
                <w-select-option
                  v-for="(item, i) in ShelfList"
                  :key="item.id + '' + i"
                  :value="item.id"
                  >{{ item.shelfNo }}</w-select-option
                >
              </w-select>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="安全库存：" label-for="selectType" prop="minInventory">
              <w-input
                v-model="addInfoForm.minInventory"
                placeholder
                style="width: 200px"
                type="number"
                :min="0"
                :max="9999999999"
              ></w-input>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="是否是配件：" label-for="Radio" prop="accessoriesFlag">
              <w-radio-group
                v-model="addInfoForm.accessoriesFlag"
                name="radioGroup"
                :default-value="'isFalse'"
                @change="changeRadio"
              >
                <w-radio :value="'isTrue'" label="isTrue">是</w-radio>
                <w-radio :value="'isFalse'" label="isFalse">否</w-radio>
              </w-radio-group>
            </w-form-model-item>
          </w-col>
          <w-col v-if="addInfoForm.accessoriesFlag === 'isTrue'" span="12">
            <w-form-model-item label="配件类别：">
              <w-tree-select
                v-model="addInfoForm.accessories"
                style="width: 200px"
                :dropdown-style="{ maxHeight: '200px', overflow: 'auto' }"
                :tree-data="treeData"
                tree-default-expand-all
                @change="selectTreeData"
              />
            </w-form-model-item>
          </w-col>
          <w-col span="24">
            <w-form-model-item :labelCol="labelColWidth3" label="备注：" label-for="selectType">
              <w-input v-model="addInfoForm.memo" placeholder style="width: 100%"></w-input>
            </w-form-model-item>
          </w-col>
        </w-row>
      </w-form-model>
    </w-modal>
    <DragModal
      ref="dragModal"
      :isDrag="false"
      :isShowFullBtn="false"
      title="供应商维护"
      :width="748"
      :mask="true"
      :height="483"
    >
      <supplier-edit @changeSupplierList="changeSupplierList"></supplier-edit>
    </DragModal>
  </div>
</template>

<script>
import { getDicName } from '@/utils/util';
import DragModal from '@/components/DragModal/index.vue';
import FactorySelect from '@/components/factory-select/index';
import { exportFile } from '@/utils/util';
import { numValidator, handleNum, numValidator1, handlePrice } from './base/data.js';
import {
  deleteBaseMateriel,
  getDepotShelfList,
  getBaseMaterielList,
  createBaseMateriel,
  modifyBaseMateriel,
  getBeseDepotList,
  getSupplierList,
  exportMateriel,
  exportMaterielTemplate,
  importMateriel
} from '@/api/warehouse.js';
import SupplierEdit from './components/SupplierEdit.vue';
import { sysDictListByCode } from '@/api/manage';
import Loop from './base/levelLoop';
import * as _ from 'lodash-es';
import { mapState } from 'vuex';
export default {
  name: 'BasicInformation',
  components: { FactorySelect, SupplierEdit, DragModal },
  data() {
    return {
      grid: {
        xl: 8,
        lg: 8,
        md: 12,
        sm: 24,
        xs: 24
      },
      tableLoading: false,
      formItem: {
        id: '',
        unit: '',
        warehouseId: '', // 仓库编号
        warehouseName: '', // 仓库名称
        manager: '', // 仓库管理员
        depotManagerID: '', // 管理员ID
        memo: ''
      },
      unitData: [], // 单位
      pageData: {
        size: 20,
        current: 1
      }, // 仓库维修分页数据
      unitList: [], // 计量单位下拉数据
      supplierDic: [],
      addFormModelLoading: true, // 仓库维修-弹框loading
      dragstartNode: '', // 物料类别-拖拽
      dragstartData: '', // 物料类别-拖拽
      informationFrom: {
        unit: undefined,
        waterPlantId: '',
        articleId: '', // 物品编号
        articleName: '', // 物品名称
        articleType: undefined, // 物品管理员
        default: undefined // 默认仓库
      }, // 物料资料-查询数据
      informationColumns: [
        {
          title: '序号',
          width: 60,
          align: 'center',
          dataIndex: 'index',
          customRender: (text, row, index) => {
            return index + 1;
          },
          fixed: 'left'
        },
        {
          title: '物品编号',
          key: 'materielNo',
          dataIndex: 'materielNo',
          width: 100,
          tooltip: true,
          scopedSlots: { customRender: 'tooltip' },
          ellipsis: true,
          fixed: 'left'
        },
        {
          title: '物品名称',
          key: 'materielName',
          width: 120,
          dataIndex: 'materielName',
          tooltip: true,
          scopedSlots: { customRender: 'tooltip' },
          ellipsis: true,
          fixed: 'left'
        },
        {
          title: '规格型号',
          key: 'specification',
          dataIndex: 'specification',
          tooltip: true,
          scopedSlots: { customRender: 'tooltip' },
          ellipsis: true
        },
        {
          title: '材质',
          key: 'stuff',
          dataIndex: 'stuff',
          tooltip: true,
          scopedSlots: { customRender: 'stuff' },
          ellipsis: true
        },
        {
          title: '计量单位',
          key: 'unit',
          dataIndex: 'unit',
          tooltip: true,
          scopedSlots: { customRender: 'tooltip' },
          ellipsis: true
        },
        {
          title: '物品类别',
          key: 'materielType', // 'materielType',
          dataIndex: 'materielTypeName', // 'materielType',
          tooltip: true,
          scopedSlots: { customRender: 'tooltip' },
          ellipsis: true
        },
        {
          title: '所属仓库',
          key: 'depotName',
          dataIndex: 'depotName',
          tooltip: true,
          scopedSlots: { customRender: 'tooltip' },
          ellipsis: true
        },
        {
          title: '仓库编号',
          key: 'depotNo',
          dataIndex: 'depotNo',
          tooltip: true,
          scopedSlots: { customRender: 'tooltip' },
          ellipsis: true
        },
        {
          title: '安全库存',
          key: 'minInventory',
          dataIndex: 'minInventory',
          tooltip: true,
          scopedSlots: { customRender: 'tooltip' },
          ellipsis: true
        },
        {
          title: '单价',
          key: 'price',
          dataIndex: 'price',
          tooltip: true,
          scopedSlots: { customRender: 'tooltip' },
          ellipsis: true
        },
        {
          title: '货架号',
          key: 'shelfNo',
          dataIndex: 'shelfNo',
          tooltip: true,
          scopedSlots: { customRender: 'tooltip' },
          ellipsis: true
        },
        {
          title: '备注',
          key: 'memo',
          dataIndex: 'memo',
          tooltip: true,
          scopedSlots: { customRender: 'tooltip' },
          ellipsis: true
        },
        {
          title: '操作',
          slot: 'action',
          scopedSlots: { customRender: 'action' },
          width: 100,
          fixed: 'right',
          tooltip: true,
          ellipsis: true
        }
      ], // 物品信息表头
      informationList: [], // 物品信息数据
      addInfoForm: {
        id: '',
        waterPlantId: '',
        materielTypeId: '',
        materielNo: '',
        materielName: '',
        specification: '',
        unit: null,
        depotId: '',
        depotShelfId: 0,
        price: 0,
        taxRate: 1,
        supplier: '',
        minInventory: 0,
        memo: '',
        stuff: '',
        accessoriesFlag: 'isFalse',
        accessories: '',
        accessoriesName: '',
        disabled: false
      }, // 物品信息-新增编辑数据
      addInfoFormModel: false, // 物品信息-新增编辑弹框是否展示
      addInfoFormRule: {
        supplier: [{ required: true, message: '供应商不能为空', trigger: 'change' }],
        specification: [{ required: true, message: '规格型号不能为空', trigger: 'change' }],
        waterPlantId: [{ required: true, message: '污水厂', trigger: 'change' }],
        materielNo: [{ required: true, message: '物品编号不能为空', trigger: 'change' }],
        materielName: [{ required: true, message: '物品名称不能为空', trigger: 'change' }],
        accessoriesFlag: [{ required: true, message: '是否是配件不能为空', trigger: 'change' }],
        price: [
          { required: true, message: '单价不能为空', trigger: 'blur' },
          { validator: numValidator }
        ],
        minInventory: [
          { required: true, message: '安全库存不能为空', trigger: 'blur' },
          { validator: numValidator }
        ],
        accessories: [
          {
            required: true,
            message: '配件类别不能为空',
            trigger: 'change',
            type: 'number'
          }
        ],
        depotId: [
          {
            required: true,
            message: '默认仓库不能为空',
            trigger: 'change'
          }
        ]
      }, // 物品信息-验证信息
      addInfoModelLoading: false, // 物品信息-弹框loading
      layout: {
        labelCol: { span: 6 },
        wrapperCol: { span: 18 }
      },
      labelColWidth3: {
        span: 3
      },
      labelColWidth: {
        span: 6
      },

      MaterialList: [], // 材质列表
      managementFlag: false, // 物料查看更多
      articleTypeList: [],
      replaceFields: {
        children: 'children',
        title: 'name',
        key: 'id',
        value: 'id'
      },
      depotList: [],
      depotList1: [], //新建弹窗中的仓库列表
      confirmBtnFlag: false, // 确认按钮是否展示
      ShelfList: [],
      treeData: [], // 配件类别
      inquireFlag: 0,
      isAdd: true, // 是否新建物品
      deletingRow: -1,
      materielTypeId: '' //物品类型-备品备件
    };
  },
  computed: {
    ...mapState('configure', ['textReplace']),
    autoSelect() {
      return this.$store.state.factoryList?.length === 1;
    }
  },
  watch: {
    addInfoModelLoading: {
      handler(val) {
        this.depotList1 = [];
      }
      // deep: true
    },
    'informationFrom.waterPlantId': {
      handler(val) {
        if (val) {
          this.getDepotList(this.informationFrom.waterPlantId, false);
        }
      },
      deep: true,
      immediate: true
    },
    'addInfoForm.waterPlantId': {
      handler(val) {
        if (val) {
          this.getDepotList(this.informationFrom.waterPlantId, true);
        }
      },
      deep: true,
      immediate: true
    }
  },

  created() {
    // 获取计量单位
    sysDictListByCode('quantity_unit').then(res => {
      if (res.status === 'complete') {
        this.unitList = res.resultData;
      }
    });
    // 获取材质
    sysDictListByCode('materialQuality').then(res => {
      if (res.status === 'complete') {
        this.MaterialList = res.resultData;
      }
    });
    this.getSupplierList();
  },

  mounted() {
    this.refresh(true, false);
    this.getAllAddress();
  },
  methods: {
    changeSupplierList(list) {
      if (list) {
        this.supplierDic = list.filter(item => !item.delFlag);
      } else {
        this.getSupplierList();
      }
    },
    async getSupplierList() {
      const res = await getSupplierList({ current: 1, size: 1000 });
      const { status, resultData } = res;
      if (status === 'complete') {
        this.supplierDic = res.resultData.filter(item => !item.delFlag);
      }
    },
    getDicName,
    openSupplierEdit() {
      this.$refs.dragModal.visible = true;
    },
    async handleFile() {
      let file = this.$refs.file.files[0];
      let formData = new FormData();
      formData.append('file', file);
      let res = await importMateriel(formData);
      if (res.size) {
        this.$message.success('导入失败');
        exportFile(res, '导入失败信息');
      } else {
        this.$message.success('导入成功');
      }
      this.refresh();
      document.getElementById('file').value = '';
    },
    handleImport() {
      this.$refs.file.click();
    },
    handleExport(type) {
      let method = exportMateriel;
      let title = '物品资料';
      if (type) {
        method = exportMaterielTemplate;
        title = '物品资料模板';
      }
      const vo = {
        waterPlantId: this.informationFrom.waterPlantId,
        page: this.pageData
      };
      // if (this.inquireFlag === 1) {
      vo.depotId = this.informationFrom.default;
      vo.materielNo = this.informationFrom.articleId;
      vo.materielName = this.informationFrom.articleName;
      vo.materielTypeId = this.materielTypeId;
      method(vo).then(res => {
        exportFile(res, title);
      });
    },
    // 删除
    removeMaintain(row, index) {
      this.deletingRow = index;
      this.$confirm({
        title: '提示',
        content: '是否要删除此物品资料？',
        onOk: () => {
          deleteBaseMateriel(row.id).then(response => {
            if (response.status === 'complete') {
              this.$message.success('删除成功');
              this.deletingRow = -1;
              this.refresh(false);
            }
          });
        },
        onCancel: () => {
          this.deletingRow = -1;
        }
      });
    },
    //
    changeRadio(value) {
      this.addInfoForm.accessoriesFlag = value.target.value;
      // this.$set(this.addInfoForm,'accessoriesFlag', value) 为什么这里的视图要手动更新？ 为啥$set 都不起作用需要$forceUpdate呢？ 啊为什么啊啊啊。我的数据变了视图还不变的
      this.$forceUpdate();
    },
    // 根据选中的仓库查货架
    checkDepoId(depotId) {
      if (depotId) {
        const vo = {
          depotId: this.addInfoForm.depotId,
          page: {
            current: 1,
            size: 999
          }
        };
        this.tableLoading = true;
        getDepotShelfList(vo).then(response => {
          this.tableLoading = false;
          this.ShelfList = response.resultData.records;
        });
      }
    },

    // TDO:
    CheckTreeSelect(value, label, extra) {},
    // 物料-编辑
    editMaintain(row) {
      this.isAdd = false;
      this.addInfoModelLoading = true;
      // this.addInfoForm = { ...this.addInfoForm, taxRate: row.taxRate}
      this.addInfoForm.id = row.id;
      this.addInfoForm.materielTypeId = this.materielTypeId;
      this.addInfoForm.materielNo = row.materielNo;
      this.addInfoForm.materielName = row.materielName;
      this.addInfoForm.specification = row.specification;
      this.addInfoForm.unit = row.unit;
      this.addInfoForm.depotId = row.depotId;
      this.addInfoForm.disabled = true;
      this.addInfoForm.taxRate = row.taxRate;
      this.addInfoForm.supplier = row.supplier;
      this.addInfoForm.price = row.price;
      this.addInfoForm.stuff = row.stuff;
      this.addInfoForm.accessoriesFlag = Number(row.isAccessories) === 1 ? 'isTrue' : 'isFalse';
      this.addInfoForm.accessories = row.equipmentType;
      if (row.depotId && row.depotShelfId) {
        this.checkDepoId(row.depotId);
        this.addInfoForm.depotShelfId = row.depotShelfId;
      }
      // this.addInfoForm.taxRate = row.taxRate;
      this.addInfoForm.minInventory = row.minInventory;
      this.addInfoForm.stu = row.stuff;
      this.addInfoForm.memo = row.memo;
      this.addInfoForm.waterPlantId = row.waterPlantId;
    },
    // 物品资料 - 获取资料列表
    getBaseMaterielList(parameter) {
      this.pageData = {
        size: parameter.pageSize,
        current: parameter.pageNo
      };
      const vo = {
        page: {
          current: parameter.pageNo,
          size: parameter.pageSize
        }
      };
      // if (this.inquireFlag === 1) {
      vo.depotId = this.informationFrom.default;
      vo.materielNo = this.informationFrom.articleId;
      vo.materielName = this.informationFrom.articleName;
      vo.materielTypeId = '19';
      // }
      this.tableLoading = true;
      return getBaseMaterielList(vo).then(response => {
        this.tableLoading = false;
        this.informationList = response.resultData.records;
        return response.resultData;
        // const pagination = { ...this.pageData };
        // pagination.total = response.resultData.total;
        // this.pageData = pagination;
      });
    },
    refresh(bool = true, flage = true) {
      if (this.$refs.table && !this.$refs.table.localLoading) {
        this.$refs.table.refresh(bool);
      }
    },
    // 物品资料 - 增加
    addInformation() {
      this.addInfoForm = { taxRate: 1 };
      this.addInfoModelLoading = true;
      this.addInfoForm.accessoriesFlag = 'isFalse';
      // this.addInfoForm.taxRate = 1;
    },

    // 物料类别-添加
    append(data) {
      const children = data.children || [];
      children.push({
        title: 'appended node',
        expand: true
      });
      this.$set(data, 'children', children);
    },
    // 物料类别-删除
    remove(root, node, data) {
      const parentKey = root.find(el => el === node).parent;
      const parent = root.find(el => el.nodeKey === parentKey).node;
      const index = parent.children.indexOf(data);
      parent.children.splice(index, 1);
    },
    // 物料类别-开始拖动
    handleDragStart(root, node, data) {
      this.dragstartNode = node;
      this.dragstartData = data;
    },
    // 物品信息重置
    managementReset() {
      this.inquireFlag = 0;
      this.informationFrom.articleId = '';
      this.informationFrom.articleName = '';
      this.informationFrom.default = undefined;
      this.informationFrom.articleType = undefined;
      this.pageData.current = 1;
      this.refresh();
    },

    // 物品信息 - 弹框确定按钮
    addInfoModelOk() {
      this.$refs.addInfoFormRule.validate(valid => {
        if (valid) {
          let vo = {
            id: this.addInfoForm.id ? this.addInfoForm.id : '',
            materielTypeId: '19',
            materielNo: this.addInfoForm.materielNo,
            materielName: this.addInfoForm.materielName,
            specification: this.addInfoForm.specification,
            unit: this.addInfoForm.unit,
            depotId: this.addInfoForm.depotId,
            depotShelfId: this.addInfoForm.depotShelfId,
            price: handlePrice(this.addInfoForm.price),
            supplier: this.addInfoForm.supplier,
            taxRate: handleNum(this.addInfoForm.taxRate),
            minInventory: handleNum(this.addInfoForm.minInventory),
            memo: this.addInfoForm.memo,
            stuff: this.addInfoForm.stuff,
            waterPlantId: this.addInfoForm.waterPlantId
          };
          if (this.addInfoForm.accessoriesFlag === 'isTrue') {
            vo.isAccessories = 1;
            vo.equipmentTypeId = 0; // this.addInfoForm.accessories;
            vo.equipmentType = this.addInfoForm.accessories; // this.addInfoForm.accessoriesName;
          } else {
            vo.isAccessories = 0;
          }
          this.tableLoading = true;
          if (this.isAdd) {
            createBaseMateriel(vo).then(response => {
              this.tableLoading = false;
              if (response.status === 'complete') {
                this.$message.success('添加成功!');
                this.refresh(false);
                this.addInfoModelLoading = false;
                this.cancelAddInfoModel();
              }
            });
          } else {
            modifyBaseMateriel(vo).then(response => {
              if (response.status === 'complete') {
                this.tableLoading = false;
                this.$message.success('保存成功!');
                this.refresh(false);
                this.addInfoModelLoading = false;
                this.cancelAddInfoModel();
              }
            });
          }
        }
      });
    },

    // 物品信息 - 弹框取消按钮
    cancelAddInfoModel() {
      this.addInfoForm = {
        id: '',
        waterPlantId: '',
        materielTypeId: this.materielTypeId,
        materielNo: '',
        materielName: '',
        specification: '',
        unit: null,
        depotId: '',
        depotShelfId: 0,
        price: 0,
        taxRate: '',
        minInventory: 0,
        memo: '',
        supplier: '',
        stuff: '',
        accessoriesFlag: 'isFalse',
        accessories: '',
        accessoriesName: '',
        disabled: false
      };
      this.addInfoModelLoading = false;
      this.isAdd = true;
      this.$refs.addInfoFormRule && this.$refs.addInfoFormRule.resetFields();
    },
    // 获取仓库列表下拉
    getDepotList(waterPlantId, isModal = false) {
      this.tableLoading = true;
      let vo = {
        waterPlantId: this.informationFrom.waterPlantId
      };
      getBeseDepotList(vo).then(res => {
        this.tableLoading = false;
        if (isModal) {
          this.depotList1 = res.resultData.records;
        } else {
          this.depotList = res.resultData.records;
        }
      });
    },
    // 获取所有配件
    getAllAddress() {
      sysDictListByCode('component_type').then(response => {
        const data = response.resultData;
        this.treeData = data.map(d => {
          return {
            value: d.dictValue,
            label: d.dictName
          };
        });
      });
    },
    // 选择配件
    selectTreeData(value, label, extra) {
      // this.addInfoForm.accessoriesName = searchId(
      //   this.treeData,
      //   this.addInfoForm.accessories
      // ).name
      this.addInfoForm.accessoriesName = label[0];
      function searchId(arr, id) {
        return arr.find(item => {
          if (item.id === id) {
            return true;
          } else if (item.children) {
            return searchId(item.children, id);
          } else {
            return false;
          }
        });
      }
    },
    checkFactory(orgId) {
      if (!orgId) {
        this.$message.warn('请先选择污水厂');
      }
    }
  }
};
</script>
<style lang="less" scoped>
@import './warehouse-top.less';
.supplier-edit {
  cursor: pointer;
  position: absolute;
  right: -30px;
  top: -2px;
  font-size: 24px;
  &:hover {
    color: var(--supply-color-primary-DEFAULT);
  }
}
</style>
