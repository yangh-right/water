<!--
 * @Description: 水池管理页面
 * @Author: liuct
 * @Date: 2021-06-07 15:59:56
 * @LastEditTime: 2025-02-13 10:24:20
 * @LastEditors: wangyr
-->
<template>
  <div class="tank-manage">
    <table-search>
      <w-row slot="form" :gutter="10">
        <w-form-model ref="form" :model="form">
          <!-- <w-col span="6">
            <RegionOrOrgSelect
              ref="regionOrOrg"
              class="form-region-select"
              label="区域"
              defaultType="region"
              :checkedKeys.sync="form.regionIds"
              @update:checkedKeys="handleOrgChange"
              @init="refresh"
            />
          </w-col> -->
          <w-col span="6">
            <w-form-model-item label="水泵型号" prop="pumpModel">
              <w-input
                v-model.trim="form.pumpModel"
                placeholder="水泵型号"
                :maxLength="50"
                allowClear
                @keyup.enter="refresh"
              />
            </w-form-model-item>
          </w-col>
          <w-col class="supply-float-left">
            <w-form-model-item>
              <w-button icon="reload" @click="reset">
                重置
              </w-button>
              <w-button icon="search" class="supply-ml-3" type="primary" @click="refresh">
                查询
              </w-button>
            </w-form-model-item>
          </w-col>
          <w-col class="supply-float-right">
            <w-form-model-item>
              <return-control :keep="true" :is-drill-down="true"></return-control>
            </w-form-model-item>
          </w-col>
        </w-form-model>
      </w-row>
      <div class="tank-con supply-bg-bg-card-DEFAULT">
        <s-table
          v-if="columns.length && selectedFlag"
          ref="table"
          :initLoadData="false"
          :columns="columns"
          :rowKey="record => record.id"
          :data="loadData"
          :dataKeys="dataKeys"
          :scroll="{ x: (selectedRowKeys.length + 1) * 100 + 210 }"
          :options="{ reload: false, setting: false, export: false }"
        >
          <template slot="tableTitle" class="follow-oper">
            <w-button icon="plus" type="primary" @click="editOrAdd(false)">
              新增水泵型号
            </w-button>
          </template>
          <template slot="action" slot-scope="text, record">
            <a style="margin-right:12px" @click="editOrAdd(record)">编辑</a>
            <a @click="deleteItem(record.pumpModeId)">删除</a>
          </template>
        </s-table>
      </div>
    </table-search>
    <w-modal
      class="edit-modal"
      :title="title"
      :visible="visible"
      centered
      width="780px"
      @cancel="cancel"
    >
      <template #footer>
        <w-button key="back" @click="cancel">取消</w-button>
        <w-button key="submit" type="primary" @click="handlerFrom">确认</w-button>
        <w-button key="curve" type="primary" @click="fittedCurve">拟合曲线</w-button>
      </template>
      <w-row>
        <w-form-model
          ref="editForm"
          :model="editForm"
          :rules="rules"
          class="query-form dev-edit-form"
          :labelCol="{ span: 10 }"
          :wrapperCol="{ span: 14 }"
        >
          <w-col span="24">
            <w-form-model-item
              label="水泵型号"
              prop="pumpModel"
              :labelCol="{ span: 6 }"
              :wrapperCol="{ span: 18 }"
            >
              <w-input
                v-model="editForm.pumpModel"
                placeholder="请输入水泵类型"
                :maxLength="255"
                allowClear
              />
            </w-form-model-item>
          </w-col>
          <w-col span="24">
            <w-form-model-item
              label="扬程到流量(拟合曲线参数)"
              prop="qHParamList"
              :labelCol="{ span: 6 }"
              :wrapperCol="{ span: 18 }"
            >
              <w-textarea
                v-model="editForm.qHParamList"
                placeholder="请输入字符串数组格式,示例：[2.13, 5.26]"
                :rows="2"
                :maxLength="255"
                allowClear
              />
            </w-form-model-item>
          </w-col>
          <w-col span="24">
            <w-form-model-item
              label="流量到扬程(拟合曲线参数)"
              prop="hQParamList"
              :labelCol="{ span: 6 }"
              :wrapperCol="{ span: 18 }"
            >
              <w-textarea
                v-model="editForm.hQParamList"
                placeholder="请输入字符串数组格式,示例：[2.13, 5.26]"
                :rows="2"
                :maxLength="255"
                allowClear
              />
            </w-form-model-item>
          </w-col>
          <w-col span="24">
            <w-form-model-item
              label="流量到频率(拟合曲线参数)"
              prop="pQParamList"
              :labelCol="{ span: 6 }"
              :wrapperCol="{ span: 18 }"
            >
              <w-textarea
                v-model="editForm.pQParamList"
                placeholder="请输入字符串数组格式,示例：[2.13, 5.26]"
                :rows="2"
                :maxLength="255"
                allowClear
              />
            </w-form-model-item>
          </w-col>
          <w-col span="24">
            <w-form-model-item
              label="频率到流量(拟合曲线参数)"
              prop="qPParamList"
              :labelCol="{ span: 6 }"
              :wrapperCol="{ span: 18 }"
            >
              <w-textarea
                v-model="editForm.qPParamList"
                placeholder="请输入字符串数组格式,示例：[2.13, 5.26]"
                :rows="2"
                :maxLength="255"
                allowClear
              />
            </w-form-model-item>
          </w-col>
          <w-col span="24">
            <w-form-model-item
              label="流量到效率(拟合曲线参数)"
              prop="eQParamList"
              :labelCol="{ span: 6 }"
              :wrapperCol="{ span: 18 }"
            >
              <w-textarea
                v-model="editForm.eQParamList"
                placeholder="请输入字符串数组格式,示例：[2.13, 5.26]"
                :rows="2"
                :maxLength="255"
                allowClear
              />
            </w-form-model-item>
          </w-col>
          <w-col span="24">
            <w-form-model-item
              label="工频最大效率"
              prop="maxEfficiency"
              :labelCol="{ span: 6 }"
              :wrapperCol="{ span: 18 }"
            >
              <w-input-number
                v-model="editForm.maxEfficiency"
                placeholder="请输入"
                :min="0"
                :step="1"
                :precision="0"
              />
            </w-form-model-item>
          </w-col>
        </w-form-model>
      </w-row>
    </w-modal>

    <!-- 拟合曲线弹框 -->
    <w-modal
      class="curve-modal"
      title="拟合曲线"
      :visible="showCurve"
      centered
      width="780px"
      @cancel="cancelCurve"
    >
      <template #footer>
        <w-button key="back" @click="cancelCurve">取消</w-button>
        <w-button key="submit" type="primary" @click="handlerCurve">确认</w-button>
      </template>
      <w-row>
        <w-form-model
          ref="curveForm"
          :model="curveForm"
          class="query-form dev-edit-form"
          :labelCol="{ span: 10 }"
          :wrapperCol="{ span: 14 }"
        >
          <w-col span="24">
            <w-form-model-item
              label="水泵型号"
              prop="pump_model"
              :labelCol="{ span: 6 }"
              :wrapperCol="{ span: 18 }"
            >
              <w-input
                v-model="curveForm.pump_model"
                placeholder="请输入水泵类型"
                :maxLength="255"
                allowClear
              />
            </w-form-model-item>
          </w-col>
          <w-col span="24">
            <w-form-model-item
              label="流量"
              prop="Q"
              :labelCol="{ span: 6 }"
              :wrapperCol="{ span: 18 }"
            >
              <w-textarea
                v-model="curveForm.Q"
                placeholder="请输入字符串数组格式,示例：[2.13, 5.26]"
                :rows="2"
                :maxLength="255"
                allowClear
              />
            </w-form-model-item>
          </w-col>
          <w-col span="24">
            <w-form-model-item
              label="扬程"
              prop="H"
              :labelCol="{ span: 6 }"
              :wrapperCol="{ span: 18 }"
            >
              <w-textarea
                v-model="curveForm.H"
                placeholder="请输入字符串数组格式,示例：[2.13, 5.26]"
                :rows="2"
                :maxLength="255"
                allowClear
              />
            </w-form-model-item>
          </w-col>
          <w-col span="24">
            <w-form-model-item
              label="功率"
              prop="P"
              :labelCol="{ span: 6 }"
              :wrapperCol="{ span: 18 }"
            >
              <w-textarea
                v-model="curveForm.P"
                placeholder="请输入字符串数组格式,示例：[2.13, 5.26]"
                :rows="2"
                :maxLength="255"
                allowClear
              />
            </w-form-model-item>
          </w-col>
          <w-col span="24">
            <w-form-model-item
              label="效率"
              prop="E"
              :labelCol="{ span: 6 }"
              :wrapperCol="{ span: 18 }"
            >
              <w-textarea
                v-model="curveForm.E"
                placeholder="请输入字符串数组格式,示例：[2.13, 5.26]"
                :rows="2"
                :maxLength="255"
                allowClear
              />
            </w-form-model-item>
          </w-col>
          <w-col span="24">
            <w-form-model-item
              label="工频最大效率"
              prop="max_efficiency"
              :labelCol="{ span: 6 }"
              :wrapperCol="{ span: 18 }"
            >
              <w-input-number
                v-model="curveForm.max_efficiency"
                placeholder="请输入"
                :min="0"
                :step="1"
                :precision="0"
              />
            </w-form-model-item>
          </w-col>
        </w-form-model>
      </w-row>
    </w-modal>
  </div>
</template>

<script>
import {
  pumpTypeInfo,
  deletePumpTypeInfo,
  addPumpTypeInfo,
  editPumpTypeInfo,
  getPumpTypeInfo,
  fittedCurveApi,
  selectDictEnumByCode,
  pumpHouseList,
  tankLevelPoint,
  sysDictListByCode,
  getPumpList
} from '@/api/manage';
import { getTreeData } from '@/api/baseInfo';
import { mapState } from 'vuex';
import { pumpTypeColumns } from './columns';
import RegionOrOrgSelect from '@/components/RegionOrOrgSelect/index.vue';
export default {
  name: 'pumpTypeManage',
  components: {
    RegionOrOrgSelect
  },
  data() {
    return {
      title: '新增泵型号',
      columns: pumpTypeColumns,
      selectedFlag: true,
      dataKeys: {
        total: 'total',
        records: 'records',
        current: 'current'
      },
      replaceFields: {
        children: 'children',
        title: 'name',
        key: 'id',
        value: 'id'
      },
      form: {
        pumpModel: '',
        page: {
          current: 1,
          size: 20
        }
      },
      pump: {
        keyword: undefined,
        current: 1,
        size: 20,
        list: [],
        total: 0
      },
      selectedRowKeys: pumpTypeColumns,
      isShowMore: false,
      visible: false,
      showCurve: false,
      editForm: {
        pumpModel: '',
        qHParamList: '',
        hQParamList: '',
        pQParamList: '',
        eQParamList: '',
        qPParamList: '',
        maxEfficiency: ''
      },
      curveForm: {
        pump_model: '',
        Q: '',
        H: '',
        P: '',
        E: '',
        max_efficiency: ''
      },
      type: 'org',
      rules: {
        pumpModel: [{ required: false, message: '请输入泵型号' }],
        qHParamList: [{ required: false, message: '请输入扬程到流量' }],
        hQParamList: [{ required: false, message: '请输入流量到扬程' }],
        pQParamList: [{ required: false, message: '请输入流量到频率' }],
        eQParamList: [{ required: false, message: '请输入流量到效率' }],
        maxEfficiency: [{ required: false, message: '请输入工频最大效率' }]
      },
      locationsName: null,
      controlModes: [],
      controlModesName: null,
      tankMaters: [],
      tankMatersName: null,
      pumpList: [],
      regionTree: [],
      orgTree: [],
      points: [],
      facilities: null,
      facilitiesName: [],
      division: null,
      divisionName: [],
      indicator: null,
      indicatorName: [],
      isEdit: false
    };
  },
  watch: {
    'editForm.isRule'() {
      let boo = this.editForm.isRule ? true : false;
      this.rules.chang[0].required = boo;
      this.rules.kuan[0].required = boo;
      this.rules.gao[0].required = boo;
    }
  },
  computed: {
    ...mapState('setting', ['buttonCodes'])
  },
  mounted() {
    // this.initData();
    this.refresh();
  },
  methods: {
    addOrUpdate() {
      this.visible = false;
      this.refresh();
    },
    cancelSubmit() {
      this.visible = false;
    },
    async changePump() {
      if (this.editForm.pumpId) {
        const { resultData } = await tankLevelPoint(this.editForm.pumpId);
        resultData.forEach(item => {
          item.name = item.deviceName;
          item.value = item.deviceId;
          item.industryPointList.forEach(p => {
            p.name = p.pointMemo;
            p.value = p.pointName;
          });
        });
        this.points = resultData;
      }
    },
    async getTreeData(treeCode) {
      const params = {
        orgId: '',
        treeCode: treeCode,
        treeType: 'pump'
      };
      let res = await getTreeData(params);
      if (treeCode === 1) {
        this.regionTree = res.resultData || [];
      } else {
        this.orgTree = res.resultData || [];
      }
    },
    // 查询组织/区域范围改变
    handleOrgChange(value) {
      this.form.pumpId = undefined;
      this.resetPumpList();
      this.getPumpList();
    },
    initData() {
      // this.sysDictListByCode('pumpstation_tank_control_mode', 'controlModes', 1); // 进水控制方式
      // this.sysDictListByCode('pumpstation_tank_material', 'tankMaters', 1); // 水池材质
      // this.sysDictListByCode('pumpstation_tank_facilities', 'facilities', 1); // 水池设施
      // this.sysDictListByCode('pumpstation_tank_division', 'division', 1); // 水池分格情况
      // this.sysDictListByCode('pumpstation_tank_liquid_level_indicator', 'indicator', 1); // 液位指示装置
      this.pumpHouseList();
      this.getTreeData(1); // 区域树
      this.getTreeData(2); // 区域树
    },
    async pumpHouseList() {
      const res = await pumpHouseList();
      this.pumpList = res.resultData;
    },

    async sysDictListByCode(code, data, type = 0) {
      const meth = type === 1 ? sysDictListByCode : selectDictEnumByCode;
      const res = await meth(code);
      this[data] = res.resultData;
      let obj = {};
      res.resultData.forEach(item => {
        obj[item.value] = item.name;
      });
      this[`${data}Name`] = obj;
    },
    refresh(bool = true) {
      this.selectedRowKeys = [];
      if (this.$refs.table) this.$refs.table.refresh(bool);
    },
    reset() {
      this.$refs.form.resetFields();
      this.refresh();
    },
    async loadData(parameter) {
      this.form.page.current = parameter.pageNo;
      this.form.page.size = parameter.pageSize;
      return await pumpTypeInfo({
        ...this.form
      }).then(res => {
        return {
          total: res.resultData.total,
          records: res.resultData.records,
          current: res.resultData.current
        };
      });
    },
    deleteItem(id) {
      this.$confirm({
        title: '提示',
        content: '您确定要删除吗',
        onOk: () => {
          deletePumpTypeInfo(id).then(res => {
            if (res.status === 'complete') {
              this.$message.success('删除成功');
              this.refresh();
            }
          });
        }
      });
    },
    async editOrAdd(flag) {
      if (flag) {
        this.isEdit = true;
        this.title = '编辑水泵型号';
        getPumpTypeInfo(flag.pumpModeId).then(res => {
          if (res.status === 'complete') {
            this.visible = true;
            this.editForm = res.resultData;
          }
        });
      } else {
        this.visible = true;
        this.editForm = {};
        this.isEdit = false;
        this.title = '新增水泵型号';
      }
    },
    // 打开拟合曲线弹框
    fittedCurve() {
      this.curveForm = {
        pump_model: this.editForm['pumpModel'],
        Q: '',
        H: '',
        P: '',
        E: '',
        max_efficiency: this.editForm['maxEfficiency']
      };
      this.visible = false;
      this.showCurve = true;
    },
    cancelCurve() {
      this.$refs.curveForm.resetFields();
      this.curveForm = {
        pump_model: '',
        Q: '',
        H: '',
        P: '',
        E: '',
        max_efficiency: ''
      };
      this.showCurve = false;
      this.visible = true;
    },
    handlerCurve() {
      try {
        let obj = {
          pump_model: this.curveForm['pump_model'],
          max_efficiency: this.curveForm['max_efficiency'],
          Q: JSON.parse(this.curveForm['Q']),
          H: JSON.parse(this.curveForm['H']),
          P: JSON.parse(this.curveForm['P']),
          E: JSON.parse(this.curveForm['E'])
        };
        this.$refs.curveForm.validate(valid => {
          if (valid) {
            let params = {
              json: JSON.stringify(obj),
              url: 'http://10.10.102.105:8061/type'
            };
            fittedCurveApi(params).then(res => {
              let { status, resultData } = res;
              if (status !== 'complete') {
                return false;
              }
              if (resultData) {
                this.$message.success('拟合成功');
                this.editForm = {
                  ...this.editForm,
                  pumpModel: resultData['pump_model'],
                  qHParamList: this.handleTofixed(resultData['q_h_param_list']),
                  hQParamList: this.handleTofixed(resultData['h_q_param_list']),
                  pQParamList: this.handleTofixed(resultData['p_q_param_list']),
                  eQParamList: this.handleTofixed(resultData['e_q_param_list']),
                  qPParamList: this.handleTofixed(resultData['q_p_param_list']),
                  maxEfficiency: resultData['max_efficiency']
                };
                this.cancelCurve();
              } else {
                this.$message.error('根据相关参数无法计算出拟合曲线，请确认');
              }
            });
          } else {
            return false;
          }
        });
      } catch (error) {
        if (error instanceof Error) {
          this.$message.error('请输入正确的参数');
        }
      }
    },
    cancel() {
      this.$refs.editForm.resetFields();
      this.editForm = {
        pumpModel: '',
        qHParamList: '',
        hQParamList: '',
        pQParamList: '',
        eQParamList: '',
        qPParamList: '',
        maxEfficiency: ''
      };
      this.visible = false;
    },
    async handlerFrom() {
      try {
        let obj = {
          qHParamList: this.handleTofixed(this.editForm['qHParamList']),
          hQParamList: this.handleTofixed(this.editForm['hQParamList']),
          pQParamList: this.handleTofixed(this.editForm['pQParamList']),
          eQParamList: this.handleTofixed(this.editForm['eQParamList']),
          qPParamList: this.handleTofixed(this.editForm['qPParamList'])
        };
        this.$refs.editForm.validate(valid => {
          if (valid) {
            const method = this.title === '新增水泵型号' ? addPumpTypeInfo : editPumpTypeInfo;
            let params = {
              ...this.editForm,
              ...obj
            };
            method(params).then(res => {
              if (res.status !== 'complete') {
                return false;
              }
              this.$message.success(this.title === '新增水泵型号' ? '新增成功' : '编辑成功');
              this.refresh();
              this.cancel();
            });
          } else {
            return false;
          }
        });
      } catch (error) {
        if (error instanceof Error) {
          this.$message.error('请输入正确的参数');
        }
      }
    },
    async getPumpList() {
      const params = {
        ids: this.form.regionIds,
        type: 'region',
        keyword: this.pump.keyword,
        page: {
          size: this.pump.size,
          current: this.pump.current
        }
      };
      let res = await getPumpList(params);
      let list = (res?.resultData?.records ?? []).map(v => ({
        value: v.pumpHouseId,
        label: v.pumpHouseName
      }));
      this.pump.total = res?.resultData?.total;
      if (this.pump.current === 1) {
        this.pump.list = list;
      } else {
        this.pump.list.push(...list);
      }
    },
    handleTofixed(str) {
      let arr = JSON.parse(str);
      let param = arr.map(item => {
        return parseFloat(item.toFixed(2));
      });
      return JSON.stringify(param);
    },
    pumpSearch(val) {
      this.pump.keyword = val;
      this.pump.current = 1;
      this.getPumpList();
    },
    resetPumpList() {
      this.pump.keyword = undefined;
      this.pump.current = 1;
    },

    pumpPopupScroll(e) {
      const target = e.target;
      if (target.scrollTop + target.offsetHeight === target.scrollHeight) {
        if (this.pump.current < Math.ceil(this.pump.total / this.pump.size)) {
          this.pump.current += 1;
          this.getPumpList();
        }
      }
    }
  }
};
</script>

<style lang="less" scoped>
.tank-manage {
  width: 100%;
  height: 100%;
  /deep/ .region-org-select .region-org-select-tree {
    width: 100%;
  }
  .tank-con {
    height: 100%;
    width: 100%;
  }
  .arrow-icon {
    position: relative;
    top: 5px;
    margin-left: 8px;
    font-size: 26px;
    cursor: pointer;
  }
  /deep/.ant-form-item-control-wrapper {
    padding-right: 8px;
  }
}
.form-region-select {
  /deep/ .ant-form-item-children {
    display: flex;
    width: 100%;

    .region-org-tree-container {
      flex: 1;
      // min-width: 200px !important;
      .ant-select,
      .ant-select-selection {
        width: 100% !important;
      }
    }
  }
}
/deep/.dev-edit-form {
  .ant-col {
    height: 54px;
  }
  .ant-form-item {
    display: flex;
    margin: 0 0 12px 0;
    padding: 0 12px;
  }
  .ant-form-item-label {
    // width: 100px;
    // border: 1px solid;
    min-width: 60px;
    text-align: right;
    margin-right: 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .ant-form-item-control-wrapper {
    flex: 1;
  }
}
.edit-modal,
.curve-modal {
  /deep/.ant-btn.ant-btn-primary {
    height: 32px;
  }
  /deep/.ant-modal {
    padding-bottom: 0;
    .ant-modal-content {
      .ant-modal-body {
        // padding: 0;
        height: calc(100vh - 200px);
      }
    }
  }
}
</style>
