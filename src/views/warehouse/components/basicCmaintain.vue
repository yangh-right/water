<!-- 仓库维护 -->
<template>
  <div class="baseinfo-keep warehouse-common">
    <ShelfDetail
      v-show="showBaseinfoLeftFlag"
      :class="{ active: showBaseinfoLeftFlag }"
      :audit="audit"
      @isShow="getisShow"
    ></ShelfDetail>
    <div v-show="!showBaseinfoLeftFlag" class="baseinfo-keep-r">
      <w-form-model
        ref="form"
        class="warehouse-common-top"
        :model="formItem"
        :label-width="100"
        v-bind="layout"
      >
        <w-row :gutter="10">
          <w-col :span="8" v-bind="grid">
            <w-form-model-item :label="`选择${textReplace}`" label-for="emergency">
              <factory-select
                v-model="formItem.waterPlantId"
                autoSelect
                :showAll="!autoSelect"
              ></factory-select>
            </w-form-model-item>
          </w-col>
          <w-col :span="8" v-bind="grid">
            <w-form-model-item label="关键字：" label-for="selectType">
              <w-input
                v-model.trim="formItem.keywords"
                placeholder="请输入仓库编号、名称或地址"
                @pressEnter="refresh"
              ></w-input>
            </w-form-model-item>
          </w-col>
          <w-col class="supply-float-right">
            <w-button type="primary" class="mr_12 supply-top-1" @click="createDepot" icon="plus"
              >新建
            </w-button>
            <w-button class="mr_12 supply-top-1" @click="resetSubmit" icon="reload">重置</w-button>
            <w-button type="primary" class="mr_12 supply-top-1" @click="refresh" icon="search"
              >查询</w-button
            >
          </w-col>
        </w-row>
      </w-form-model>
      <div class="warehouse-common-con">
        <s-table
          ref="table"
          :columns="maintainColumns"
          :rowKey="(record, i) => record.depotNo + '' + i"
          :scroll="{ x: 1400 }"
          :canResize="true"
          :initLoadData="false"
          :data="getBeseDepotList"
          :rowClassName="(record, index) => (index === deletingRow ? 'deleting-row' : '')"
        >
          <template slot="depotNo" slot-scope="text">
            <w-tooltip>
              <template slot="title">
                {{ text }}
              </template>
              {{ text }}
            </w-tooltip>
          </template>
          <template slot="fileBarCode" slot-scope="text">
            <img
              class="file-item"
              :src="handleImgSrc(text)"
              @click="handlePreview(handleImgSrc(text))"
            />
          </template>
          <template slot="action" slot-scope="text, records, index">
            <span class="mr_12">
              <a @click="getBeseDepotById(records)">编辑</a>
            </span>
            <span class="mr_12">
              <a @click="shelfMaintenance(records)">货架维护</a>
            </span>
            <span>
              <a @click="removeMaintain(records.id, index)">删除</a>
            </span>
          </template>
        </s-table>
      </div>
    </div>

    <!-- 新增弹框 -->
    <w-modal
      class="secondary-modal"
      title="仓库维护"
      :visible="addFormModel"
      :maskClosable="false"
      width="600px"
      @cancel="cancel"
      @ok="addFormModelOk"
    >
      <w-form-model
        ref="ruleWarehouse"
        :model="addForm"
        :rules="ruleWarehouse"
        v-bind="layout"
        :labelCol="labelColWidth"
      >
        <w-form-model-item :label="`选择${textReplace}`" prop="waterPlantId" placeholder="选择组织">
          <factory-select
            v-model="addForm.waterPlantId"
            autoSelect
            :showAll="!autoSelect"
            @on-change="changeFormFactory"
          ></factory-select>
        </w-form-model-item>
        <w-form-model-item label="仓库编号：" prop="depotNo">
          <w-input v-model="addForm.depotNo" :disabled="!canEditDepotNo" />
        </w-form-model-item>
        <w-form-model-item label="仓库名称：" prop="warehouseName">
          <w-input v-model="addForm.warehouseName" />
        </w-form-model-item>
        <w-form-model-item label="仓库管理员：" prop="depotManagerId">
          <w-select
            v-model="addForm.depotManagerId"
            style="width: 100%"
            placeholder="请选择"
            showSearch
            :filter-option="filterOption"
            @change="handleTransactorChange"
          >
            <w-select-option v-for="item in userBaseList" :key="item.key" :value="item.value">
              {{ item.title }}
            </w-select-option>
          </w-select>
        </w-form-model-item>
        <w-form-model-item label="仓库地址：" prop="address">
          <w-input v-model="addForm.address" />
        </w-form-model-item>
        <w-form-model-item label="备注：" prop="memo">
          <w-input v-model="addForm.memo" />
        </w-form-model-item>
      </w-form-model>
    </w-modal>
    <w-modal
      :visible="imgVisible"
      width="400px"
      :footeeleteDevicer="null"
      :footer="null"
      @cancel="imgVisible = false"
    >
      <img style="width: 100%" :src="previewImgUrl" />
    </w-modal>
  </div>
</template>
<script>
import {
  getBeseDepotList,
  deleteBeseDepotList,
  createBeseDepot,
  modifyBeseDepot
} from '@/api/warehouse';
import serverConfig from '@/config/server.config';
import { userList as getAllUser } from '@/api/baseInfo';
import FactorySelect from '@/components/factory-select/index';
import ShelfDetail from './shelfDetail.vue';
import { mapState } from 'vuex';
export default {
  name: 'BasiCmaintain',
  components: {
    FactorySelect,
    ShelfDetail
  },
  data() {
    return {
      canEditDepotNo: false,
      userBaseList: [],
      showBaseinfoLeftFlag: false,
      tableLoading: false,
      layout: {
        labelCol: { span: 6 },
        wrapperCol: { span: 18 }
      },
      labelColWidth: {
        span: 5
        // offset: 12
      },
      grid: {
        xl: 6,
        lg: 6,
        md: 12,
        sm: 24,
        xs: 24
      },
      audit: {},
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
          title: '污水厂名称',
          key: 'waterPlantName',
          dataIndex: 'waterPlantName',
          minWidth: 120
        },
        {
          title: '仓库编号',
          key: 'depotNo',
          dataIndex: 'depotNo',
          scopedSlots: { customRender: 'depotNo' },
          ellipsis: true
        },
        {
          title: '仓库名称',
          key: 'depotName',
          dataIndex: 'depotName',
          minWidth: 80
        },
        {
          title: '仓库地址',
          key: 'depotAddress',
          dataIndex: 'depotAddress',
          minWidth: 100
        },
        {
          title: '仓库管理员',
          key: 'depotManager',
          dataIndex: 'depotManager',
          tooltip: true
        },
        {
          title: '二维码',
          key: 'fileId',
          dataIndex: 'fileId',
          width: 120,
          tooltip: true,
          scopedSlots: { customRender: 'fileBarCode' },
          ellipsis: true
        },
        {
          title: '备注',
          key: 'memo',
          dataIndex: 'memo',
          tooltip: true
        },
        {
          title: '总价',
          key: 'totalAmount',
          dataIndex: 'totalAmount',
          tooltip: true
        },
        {
          title: '操作',
          key: 'action',
          scopedSlots: { customRender: 'action' },
          width: '170'
        }
      ], // 仓库维修表头
      maintainList: [], // 仓库维修数据
      formItem: {
        id: '',
        waterPlantId: '',
        keywords: '',
        manager: '', // 仓库管理员
        depotManagerId: '', // 管理员ID
        memo: ''
      },
      addForm: {
        id: -1,
        waterPlantId: '',
        depotNo: '', // 仓库编号
        warehouseName: '', // 仓库名称
        manager: '', // 管理员
        depotManagerId: null,
        address: '', // 地址
        memo: '' // 备注
      }, // 仓库维修-新增编辑弹框
      addFormModel: false, // 仓库维修-弹框是否显示
      pageData: {
        pageSize: 20, // 十条
        current: 1
      }, // 仓库维修分页数据
      imgVisible: false,
      previewImgUrl: '',
      previewBaseUrl: serverConfig.PUBLIC_API_BASE_URL + '/userCenterApi/FileManager/download/',

      ruleWarehouse: {
        waterPlantId: [{ required: true, message: '组织不能为空', trigger: 'change' }],
        depotNo: [{ required: true, message: '仓库编号不能为空', trigger: 'change' }],
        warehouseName: [{ required: true, message: '仓库名称不能为空', trigger: 'change' }],
        depotManagerId: [{ required: true, message: '仓库管理员不能为空', trigger: 'change' }],
        address: [{ required: true, message: '仓库地址不能为空', trigger: 'change' }]
      }, // 仓库维修-新增规则
      collapse: true,
      inquireFlag: 0, // 初始化、查询flag
      deletingRow: -1
    };
  },
  computed: {
    ...mapState('configure', ['textReplace']),
    autoSelect() {
      return this.$store.state.factoryList?.length === 1;
    }
  },
  watch: {
    'formItem.waterPlantId': {
      immediate: true,
      handler(val) {
        if (val) {
          this.refresh(true, false);
        }
      }
    }
  },
  mounted() {
    this.getUserList();
  },

  methods: {
    //获取仓库管理员
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
    // 变换仓库管理员
    handleTransactorChange(value) {
      this.addForm.manager = this.userBaseList.filter(item => item.key === value)[0].title;
    },
    // 过滤仓库管理员
    filterOption(input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      );
    },
    // 修改表单里的单位
    changeFormFactory() {
      this.addForm.depotManagerId = '';
    },
    // 仓库维修 - 弹框取消
    cancel() {
      this.addForm = {
        id: -1,
        waterPlantId: '',
        depotNo: '', // 仓库编号
        warehouseName: '', // 仓库名称
        depotManagerId: null, // 管理员
        address: '', // 地址
        memo: '' // 备注
      };
      this.addFormModel = false;
      this.$refs.ruleWarehouse && this.$refs.ruleWarehouse.resetFields();
    },
    // 厂改变
    unitChange() {
      this.refresh();
    },
    handleImgSrc(fileId) {
      if (fileId) {
        return this.previewBaseUrl + fileId;
      }
      return '';
    },
    handlePreview(src) {
      this.imgVisible = true;
      this.previewImgUrl = src;
    },
    getisShow() {
      this.showBaseinfoLeftFlag = false;
      this.refresh(false);
    },
    // 仓库维护 - 获取仓库信息
    getBeseDepotList(parameter) {
      const vo = {
        waterPlantId: this.formItem.waterPlantId,
        page: {
          current: parameter.pageNo,
          size: parameter.pageSize
        },
        needPage: true
      };
      // if (this.inquireFlag === 1) {
      vo.keywords = this.formItem.keywords;
      vo.depotManagerId = this.formItem.depotManagerId;
      // }
      this.tableLoading = true;
      return getBeseDepotList(vo).then(res => {
        this.tableLoading = false;
        this.maintainList = res.resultData.records;
        return res.resultData;
      });
    },
    refresh(bool = true, flage = true) {
      if (this.$refs.table && !this.$refs.table.localLoading) {
        this.$refs.table.refresh(bool);
      }
    },
    // 仓库维护 - 获取仓库详情
    getBeseDepotById(record) {
      this.canEditDepotNo = false;
      const data = record;
      this.addForm.id = data.id;
      this.addForm.waterPlantId = data.waterPlantId;

      this.addForm.depotNo = data.depotNo;
      this.addForm.warehouseName = data.depotName;
      this.addForm.manager = data.depotManager;
      this.addForm.depotManagerId = data.depotManagerId;
      this.addForm.address = data.depotAddress;
      this.addForm.memo = data.memo;
      this.addFormModel = true;
      // })
    },
    // 仓库维护 - 跳转货架维护
    shelfMaintenance(row) {
      this.showBaseinfoLeftFlag = true;
      this.audit = row;
    },
    // 仓库维护 - 增加按钮点击
    createDepot() {
      this.canEditDepotNo = true;
      this.addFormModel = !this.addFormModel;
    },
    // 重置
    resetSubmit() {
      this.inquireFlag = 0;
      this.pageData.current = 1;
      this.formItem.id = '';
      this.formItem.keywords = '';
      this.formItem.manager = '';
      this.formItem.depotManagerId = '';
      this.formItem.memo = '';
      this.formItem.waterPlantId = '';
      this.refresh();
    },
    // 仓库维修-删除
    removeMaintain(id, index) {
      this.deletingRow = index;
      this.tableLoading = true;
      this.$confirm({
        title: '提示',
        content: '您确定要删除吗',
        onOk: () => {
          deleteBeseDepotList(id).then(res => {
            this.tableLoading = false;
            if (res.status === 'complete') {
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
    // 仓库维修 - 弹框确认
    addFormModelOk() {
      this.$refs.ruleWarehouse.validate(valid => {
        if (valid) {
          const vo = {
            waterPlantId: this.addForm.waterPlantId,
            depotAddress: this.addForm.address,
            depotManager: this.addForm.manager,
            depotManagerId: this.addForm.depotManagerId,
            depotName: this.addForm.warehouseName,
            depotNo: this.addForm.depotNo,
            memo: this.addForm.memo
          };

          this.tableLoading = true;
          if (this.addForm.id === -1) {
            createBeseDepot(vo).then(response => {
              this.tableLoading = false;
              let msg = '新增成功!';
              this.$message.success(msg);
              this.cancel();
              this.refresh(false);
            });
          } else {
            vo.id = this.addForm.id;
            modifyBeseDepot(vo).then(response => {
              this.tableLoading = false;
              let msg = '编辑成功!';
              this.$message.success(msg);
              this.cancel();
              this.refresh(false);
            });
          }
        }
      });
    }
  }
};
</script>
<style lang="less" scoped>
@import '../warehouse-top.less';

.baseinfo-keep {
  width: 100%;
  padding-top: 0;
  > div {
    width: 100%;
    border-radius: 4px;
  }

  .mb_20 {
    margin-bottom: 20px;
  }

  .baseinfo-keep-l,
  .baseinfo-keep-r {
    height: 100%;
    padding-top: 12px;
    display: flex;
    flex-direction: column;
  }

  .mr_12 {
    margin-right: 12px;
  }
}
.file-item {
  width: 120px;
  cursor: pointer;
}
</style>
