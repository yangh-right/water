<!-- 物料类别 -->
<template>
  <div>
    <SidebarPanel
      title="物料类别资料"
      :expand="sidebarPanelExpand"
      width="200px"
      class="basic-category"
    >
      <div slot="sidebar" class="sidebar">
        <Search @address="getMaterials" ref="search" />
      </div>
      <div
        class="table-card supply-bg-bg-card-DEFAULT"
        id="table-card"
        :class="{ pd_112: tipsFlag }"
      >
        <w-table
          ref="table"
          :columns="mainColumns"
          :rowKey="(record, index) => record.materielTypeNo + '' + index"
          :data-source="caredData"
          :pagination="false"
          :rowClassName="(record, index) => (index === deletingRow ? 'deleting-row' : '')"
        >
          <template slot-scope="txt, record, index" slot="sort">
            <span>{{ index + 1 }}</span>
          </template>
          <template slot-scope="txt" slot="materielTypeNo">
            {{ txt }}
          </template>
          <template slot-scope="txt" slot="materielTypeName">
            {{ txt }}
          </template>
          <template slot-scope="txt, record, index" slot="action">
            <div class="sw-table__row__opr">
              <span style="padding-right: 8px">
                <a href="javascript:;" @click="editType(record, index)">
                  编辑
                </a>
              </span>
              <span v-if="record.isDelete">
                <a href="javascript:;" @click="handleRemove(record, index, txt)">删除</a>
              </span>
            </div>
          </template>
        </w-table>
        <div class="btn-group">
          <!-- <w-alert
              v-if="tipsFlag"
              message="修改排序后必须确认保存"
              type="warning"
              show-icon
            /> -->
          <w-button type="primary" class="mr_12" @click="handleAdd"
            ><i class="wpgicon icon-ic_add"></i>新建</w-button
          >
          <w-button class="mr_12" @click="handleImport"
            ><w-icon type="ic_publish" />导入</w-button
          >
          <w-button class="mr_12" @click="handleExport"
            ><w-icon type="ic_file_download" />模板下载</w-button
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
        </div>
      </div>
    </SidebarPanel>
    <!-- 添加物品类别 -->
    <w-modal
      title="物品类别"
      width="1000px"
      class="add-type secondary-modal"
      :visible="addType"
      :maskClosable="false"
      @ok="asyncOK"
      @cancel="asyncCancel"
    >
      <w-form-model ref="addMType" :label-width="120" v-bind="layout" :labelCol="labelColWidth">
        <w-form-model-item label="所属类别：" label-for="parentId">
          <w-tree-select
            v-model="selectedParent"
            :tree-data="typeTree"
            :dropdown-style="{ maxHeight: '50vh' }"
            :replace-fields="replaceFields"
            allow-clear
          ></w-tree-select>
        </w-form-model-item>
      </w-form-model>
      <p class="tips">
        <w-icon type="warning" class="icon" />
        不选择所属类别时添加最外层类别
      </p>
      <w-button type="primary" style="margin-bottom: 12px" @click="handleAddType"
        ><i class="wpgicon icon-ic_add"></i>添加</w-button
      >
      <w-table
        ref="table"
        :columns="dataCardcolumns"
        :rowKey="(record, index) => index"
        :data-source="addData"
        :pagination="false"
        :rowClassName="(record, index) => (index === deletingRow2 ? 'deleting-row2' : '')"
      >
        <template slot="materielTypeNoTitle">
          <span>类别编号(不可重复)<span style ="color:#f64357;margin-left: 4px;">*</span></span>
        </template>
        <template slot="materielTypeNameTitle">
          <span>类别名称(不可重复)<span style ="color:#f64357;margin-left: 4px;">*</span></span>
        </template>
        <template slot-scope="txt, record, index" slot="sort">
          <span>{{ index + 1 }}</span>
        </template>
        <template slot-scope="txt, record, index" slot="materielTypeNo">
          <w-input class="sdf" type="text" required v-model="addData[index].materielTypeNo" />
        </template>
        <template slot-scope="txt, record, index" slot="materielTypeName">
          <w-input type="text" required v-model="addData[index].materielTypeName" />
        </template>
        <template slot-scope="txt, record, index" slot="action">
          <a href="javascript:;" @click="handleRemoveType(record, index, txt)">删除</a>
        </template>
      </w-table>
    </w-modal>

    <w-modal
      class="secondary-modal"
      title="编辑物品类别"
      width="800px"
      :visible="editTypeVisible"
      :maskClosable="false"
      @ok="editOK"
      @cancel="editCancel"
    >
      <w-form-model ref="addMType" class="editModel" v-bind="layout" :labelCol="labelColWidth">
        <w-row>
          <w-col span="12">
            <w-form-model-item label="类别编号：">
              <w-input v-model="editForm.materielTypeNo"></w-input>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="类别名称：">
              <w-input v-model="editForm.materielTypeName"></w-input>
            </w-form-model-item>
          </w-col>
        </w-row>
      </w-form-model>
    </w-modal>
  </div>
</template>

<script>
import {
  getBaseMaterielType,
  modifyBaseMaterielType,
  deleteBaseMaterielType,
  createBaseMaterielType,
  exportMaterielType,
  importMaterielType
} from '@/api/warehouse.js';
import { exportFile } from '@/utils/util';
import SidebarPanel from './sidebar-panel';
import Search from './search';
import Sortable from 'sortablejs';
export default {
  name: '',
  components: { SidebarPanel, Search },
  data() {
    return {
      tipsFlag: false, // 提示是否展示
      sidebarPanelExpand: true,
      caredData: [], // 物品类别数据
      addData: [
        {
          materielTypeNo: '',
          materielTypeName: '',
          isDelete: true
        }
      ],
      mainColumns: [
        {
          title: '排序编号',
          slot: 'sort',
          scopedSlots: { customRender: 'sort' },
          key: 'sort',
          dataIndex: 'sort'
        },
        {
          title: '类别编号',
          slot: 'materielTypeNo',
          scopedSlots: { customRender: 'materielTypeNo' },
          key: 'materielTypeNo',
          dataIndex: 'materielTypeNo'
        },
        {
          title: '类别名称',
          slot: 'materielTypeName',
          scopedSlots: { customRender: 'materielTypeName' },
          key: 'materielTypeName',
          dataIndex: 'materielTypeName'
        },
        {
          title: '操作',
          slot: 'action',
          scopedSlots: { customRender: 'action' },
          key: 'action',
          maxWidth: 80
        }
      ], 
      dataCardcolumns: [
        {
          title: '排序编号',
          slot: 'sort',
          scopedSlots: { customRender: 'sort' },
          key: 'sort',
          dataIndex: 'sort'
        },
        {
          slots: { title: 'materielTypeNoTitle' },
          slot: 'materielTypeNo',
          scopedSlots: { customRender: 'materielTypeNo' },
          key: 'materielTypeNo',
          dataIndex: 'materielTypeNo'
        },
        {
          slots: { title: 'materielTypeNameTitle' },
          slot: 'materielTypeName',
          scopedSlots: { customRender: 'materielTypeName' },
          key: 'materielTypeName',
          dataIndex: 'materielTypeName'
        },
        {
          title: '操作',
          slot: 'action',
          scopedSlots: { customRender: 'action' },
          key: 'action',
          maxWidth: 80
        }
      ], 
      addType: false,
      typeTree: [],
      replaceFields: {
        label: 'name',
        key: 'id',
        value: 'id',
        title: 'name'
      },
      selectedParent: '',
      layout: {
        labelCol: { span: 4 },
        wrapperCol: { span: 10 }
      },
      labelColWidth: {
        span: 6
      },
      editTypeVisible: false,
      editIndex: '',
      editForm: {
        materielTypeNo: '',
        materielTypeName: ''
      },
      deletingRow: -1,
      deletingRow2: -1
    };
  },
  mounted() {
    this.getBaseMaterielType();
  },

  methods: {
    getBaseMaterielType() {
      getBaseMaterielType().then(res => {
        if (res.status === 'complete') {
          this.typeTree = res.resultData;
        }
      });
    },
    // 物料类别 - 获取地址
    getMaterials(e, type) {
      if (!e.id) {
        this.parentID = -1;
        return;
      }
      this.parentID = e.id;
      let caredDataList = e.dataRef.children || [];
      let caredDataTemp = (this.caredData = []);
      caredDataTemp.push({
        id: e.dataRef.data.id,
        materielTypeNo: e.dataRef.data.materielTypeNo,
        materielTypeName: e.dataRef.data.materielTypeName,
        isDelete: !(e.dataRef.children && e.dataRef.children.length), // 如果存在子集，不可被删除
        editFlag: true,
        parentId: e.dataRef.parentId
      });
      if (type === 'init') {
        caredDataList = e.children || [];
      }

      if (caredDataList.length) {
        caredDataList.forEach(item => {
          const vo = {
            id: item.data.id,
            sort: parseInt(item.data.sort),
            materielTypeNo: item.data.materielTypeNo,
            materielTypeName: item.data.materielTypeName,
            isDelete: !(item.children && item.children.length), // 如果存在子集，不可被删除
            editFlag: true,
            parentId: item.data.parentId
          };
          caredDataTemp.push(vo);
        });
        this.caredData = caredDataTemp;
        this.tipsFlag = false;
        this.$nextTick(() => {
          this.initSortable();
        });
      }
    },
    editType(record, index) {
      this.editForm = record;
      this.editTypeVisible = true;
    },
    editCancel() {
      this.editForm = {};
      this.editTypeVisible = false;
    },
    async handleFile() {
      let file = this.$refs.file.files[0];
      let formData = new FormData();
      formData.append('file', file);
      let res = await importMaterielType(formData);
      if (res.size) {
        this.$message.success('导入失败');
        exportFile(res, '导入失败信息')
      } else {
        this.$message.success('导入成功');
      }
      document.getElementById('file').value = '';
      this.getBaseMaterielType();
    },
    handleImport() {
      this.$refs.file.click();
    },
    handleExport() {
      exportMaterielType({}).then(res => {
        exportFile(res, '物料类别');
      });
    },
    editOK() {
      if (!this.editForm.materielTypeNo) {
        this.$message.error('类别编号不能为空');
      } else if (!this.editForm.materielTypeName) {
        this.$message.error('类别名称不能为空');
      } else {
        modifyBaseMaterielType([this.editForm]).then(response => {
          if (response.status === 'complete') {
            this.$message.success('保存成功');
          }
          this.editCancel();
          this.$refs.search.getBaseMaterielType();
          this.getBaseMaterielType();
          this.$refs.search.onSelect();
        });
      }
    },
    // 物品类别 - 删除
    handleRemove(row, index) {
      this.deletingRow = index;
      this.$confirm({
        title: '提示',
        content: '确定要删除吗？',
        onOk: () => {
          deleteBaseMaterielType(row.id).then(res => {
            if (res.status === 'complete') {
              this.$message.success('删除成功');
              this.$refs.search.getBaseMaterielType();
              this.getBaseMaterielType();
              this.caredData.splice(index, 1);
            }
            this.deletingRow = -1;
          });
        },
        onCancel: () => {
          this.deletingRow = -1;
        }
      })
    },
    handleRemoveType(row, index) {
      this.deletingRow2 = index;
      this.$confirm({
        title: '提示',
        content: '确定要删除吗？',
        onOk: () => {
          this.addData.splice(index, 1);
          this.$message.success('删除成功');
          this.deletingRow2 = -1;
        },
        onCancel: () => {
          this.deletingRow2 = -1;
        }
      })
    },
    // 物料类别 - 修改类别编号
    changematerielTypeNo(value, index) {
      console.log(value);
      // this.addData[index].materielTypeNo = row.materielTypeNo
    },
    // 物品管理-输入框编辑
    changeInput(row, index) {
      this.addData[index].materielTypeName = row.materielTypeName;
    },
    // 物品管理 - 添加
    handleAdd() {
      this.addType = true;
    },
    asyncCancel() {
      this.addType = false;
      this.selectedParent = '';
      this.addData = [
        {
          materielTypeNo: '',
          materielTypeName: '',
          isDelete: true
        }
      ];
    },
    handleAddType() {
      this.addData.push({
        materielTypeNo: '',
        materielTypeName: '',
        isDelete: true
      });
    },
    // 物品管理 - 确认修改 确认修改
    asyncOK() {
      const vo = [];
      // 判断是否有重复项
      if (!this.addData.length) {
        return;
      }
      let typeNameEmptyArr = this.addData.filter(item => item.materielTypeName.trim() === '');
      let typeNoEmptyArr = this.addData.filter(item => item.materielTypeNo.trim() === '');
      if(typeNoEmptyArr.length > 0){
        this.$message.error('类别编号不能为空.');
        return false;
      }
      if(typeNameEmptyArr.length > 0){
        this.$message.error('类别名称不能为空.');
        return false;
      }

      if (this.isRepeat(this.addData, 'materielTypeNo')) {
        this.$message.error('类别编号存在重复项');
      } else if (this.isRepeat(this.addData, 'materielTypeName')) {
        this.$message.error('类别名称存在重复项');
      } else {
        this.addData.forEach((item, index) => {
          const obj = {
            materielTypeNo: item.materielTypeNo,
            materielTypeName: item.materielTypeName,
            parentId: this.selectedParent || 0,
            sort: parseInt(index + 1)
          };
          if (item.id !== -1) {
            obj.id = item.id;
          }
          vo.push(obj);
        });
        this.tableLoading = true;
        createBaseMaterielType(vo).then(response => {
          if(response.status === 'complete'){
            this.tableLoading = false;
            this.tipsFlag = false;
            this.addType = false;
            this.$message.success('保存成功');
            this.asyncCancel();
            this.$refs.search.getBaseMaterielType();
            this.getBaseMaterielType();
          }
        });
      }
    },
    isRepeat(arr, key) {
      var hash = {};
      for (var i in arr) {
        if (hash[arr[i][key]]) {
          return true;
        } else {
          hash[arr[i][key]] = true;
        }
      }
      return false;
    },
    initSortable() {
      let _this = this;
      const mytb = document.querySelector('#table-card tbody');
      Sortable.create(mytb, {
        // handle: ".wpg-table-row",
        animation: 150,
        sort: true,
        onUpdate({ newIndex, oldIndex }) {
          console.log(
            newIndex,
            oldIndex,
            _this.caredData[newIndex].materielTypeName,
            _this.caredData[oldIndex].materielTypeName
          );
          const dataSource = JSON.parse(JSON.stringify(_this.caredData));

          // 把数组从老的位置删除再插入新的位置
          const item = dataSource[oldIndex];
          dataSource.splice(oldIndex, 1);
          dataSource.splice(newIndex, 0, item);
          _this.caredData = [];
          _this.$nextTick(() => {
            _this.caredData = dataSource;
            _this.tipsFlag = true;
          });
        }
      });
    }
  }
};
</script>
<style lang="less">
.basic-category {
  display: flex;
  height: 100%;
  padding-top: 0;

  .sw-sidebar-panel__content {
    width: 100%;
    height: 100%;
    margin-left: 0 !important;
  }

  .sw-sidebar-panel__sidebar {
    top: 60px;
    bottom: 20px;
    background: var(--supply-color-bg-card-component);
    // position: absolute;
  }
  .table-card {
    height: 100%;
    padding: 0 0 90px;
    min-height: 400px;
    overflow-y: auto;
    &.pd_112 {
      padding-bottom: 112px;
    }
  }
  .btn-group {
    text-align: center;
    border-top: 1px solid var(--supply-color-border-DEFAULT);
    position: absolute;
    bottom: 0;
    right: 20px;
    left: 25px;
    padding: 20px 20px 10px;
    background-color: var(--supply-color-bg-card-component);
    .mr_12 {
      margin-right: 20px;
    }
  }
}
</style>
<style scoped lang="less">
.btn-group > .wpg-alert-warning.wpg-alert {
  padding: 0 75px;
  text-align: left;
  height: auto;
  margin-bottom: 10px;
}
.btn-group > .wpg-alert-icon {
  top: 6px;
}

.add-type {
  /deep/.wpg-form-item-label {
    width: auto;
  }
}
.editModel {
  /deep/.wpg-form-item-label {
    width: auto;
  }

  /deep/.wpg-form-item-control-wrapper {
    flex: 1;
    width: auto;
  }
}

.tips {
  margin-bottom: 12px;
  color: var(--supply-color-third);

  .icon {
    font-size: 16px;
    color: var(--supply-color-warning-DEFAULT);
  }
}

/deep/.deleting-row2{
  background: rgba(0,0,0,.2);
}
</style>
