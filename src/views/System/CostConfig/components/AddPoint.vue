<template>
  <w-modal :title="title" :visible="visible" :width="800" @ok="handleOk" @cancel="handleCancel">
    <w-form-model
      ref="form"
      :model="form"
      :colon="true"
      :rules="rules"
      :labelCol="{ span: 7 }"
      :wrapperCol="{ span: 17 }"
    >
      <w-row :span="24">
        <w-col :span="12">
          <w-form-model-item prop="name" label="成本点名称">
            <w-input v-model="form.name" placeholder="请填写成本点名称"></w-input>
          </w-form-model-item>
        </w-col>
        <w-col :span="12">
          <w-form-model-item prop="calculateType" label="计算类型">
            <w-radio-group v-model="form.calculateType" @change="triggerCompoValidate">
              <w-radio :value="'0'" v-show="!showOnlyCost">成本消耗</w-radio>
              <w-radio :value="'1'">成本金额</w-radio>
            </w-radio-group>
          </w-form-model-item>
        </w-col>
      </w-row>
      <w-row :span="24">
        <w-col :span="12">
          <w-form-model-item prop="costTypeId" label="所属成本类型">
            <w-tree-select
              v-model="form.costTypeId"
              :treeData="treeData"
              :showSearch="true"
              :maxTagCount="2"
              placeholder="请选择所属成本类型"
              treeNodeFilterProp="title"
              :replaceFields="{
                title: 'name',
                key: 'id',
                value: 'id'
              }"
              :getPopupContainer="node => node.parentNode"
              :dropdown-style="{
                maxHeight: '300px',
                overflow: 'auto'
              }"
            ></w-tree-select>
          </w-form-model-item>
        </w-col>
      </w-row>

      <w-row :span="24">
        <w-col :span="12">
          <w-form-model-item prop="waterPlantId" label="选择污水厂">
            <factory-select
              autoSelect
              v-model="form.waterPlantId"
              @change="waterPlantChange"
            ></factory-select>
          </w-form-model-item>
        </w-col>
        <w-col :span="12">
          <w-form-model-item prop="structureIdList" label="所属构筑物">
            <w-tree-select
              v-model="form.structureIdList"
              :showSearch="true"
              :treeCheckable="true"
              :treeData="structureTreeData"
              :maxTagCount="2"
              showCheckedStrategy="SHOW_PARENT"
              placeholder="请选择所属构筑物"
              treeNodeFilterProp="title"
              :replaceFields="{
                title: 'name',
                key: 'id',
                value: 'id'
              }"
              :getPopupContainer="node => node.parentNode"
              :dropdown-style="{
                maxHeight: '300px',
                overflow: 'auto'
              }"
            ></w-tree-select>
          </w-form-model-item>
        </w-col>
      </w-row>

      <!-- <w-row :span="24">
        <w-col :span="12">
          <w-form-model-item prop="calculation" label="计算方式">
            <w-radio-group v-model="form.calculation">
              <w-radio :value="'0'">录入</w-radio>
              <w-radio :value="'1'">监测量</w-radio>
              <w-radio :value="'2'">接口</w-radio>
            </w-radio-group>
          </w-form-model-item>
        </w-col>
      </w-row> -->

      <!-- 本期仅保留录入方式的计算方式 -->
      <w-row :span="24">
        <w-col :span="12">
          <w-form-model-item prop="entryMode" label="录入方式">
            <w-select
              v-model="form.entryMode"
              :getPopupContainer="node => node.parentNode"
              placeholder="请选择录入方式"
              @change="triggerCompoValidate"
            >
              <w-select-option value="0">按次</w-select-option>
              <w-select-option value="1">按月</w-select-option>
              <w-select-option value="2">按年</w-select-option>
            </w-select>
          </w-form-model-item>
        </w-col>
      </w-row>

      <!-- 计算方式--录入、监测量、接口 -->
      <!-- <w-row :span="24" v-if="form.calculation === '0'">
        <w-col :span="12">
          <w-form-model-item prop="entryMode" label="录入方式">
            <w-select
              v-model="form.entryMode"
              :options="entryOptions"
              :default-value="'0'"
              @change="triggerCompoValidate"
              :getPopupContainer="(node) => node.parentNode"
            ></w-select>
          </w-form-model-item>
        </w-col>
      </w-row> -->

      <!-- <w-row :span="24" v-else-if="form.calculation === '1'">
        <w-col :span="12">
          <w-form-model-item prop="pointId" label="监测量名称">
            <w-select
              v-model="form.pointId"
              :options="pointOptions"
              placeholder="请填写监测量名称"
              :getPopupContainer="(node) => node.parentNode"
            ></w-select>
          </w-form-model-item>
        </w-col>
        <w-col :span="12">
          <w-button type="link" icon="ic_add" @click="addItem">添加监测量</w-button>
        </w-col>
      </w-row> -->

      <!-- <span v-else-if="form.calculation === '2'">
        <w-row :span="24">
          <w-col :span="12">
            <w-form-model-item prop="interfaceName" label="接口名称">
              <w-input v-model="form.interfaceName" placeholder="请填写接口名称"></w-input>
            </w-form-model-item>
          </w-col>
          <w-col :span="12">
            <w-form-model-item prop="requestMethod" label="请求方法">
              <w-select
                v-model="form.requestMethod"
                placeholder="请选择请求方法"
                :options="reqMethodOptions"
                :getPopupContainer="(node) => node.parentNode"
              ></w-select>
            </w-form-model-item>
          </w-col>
        </w-row>
        <w-row :span="24">
          <w-col :span="12">
            <w-form-model-item prop="parameters" label="请求参数">
              <w-input v-model="form.parameters" placeholder="请填写请求参数"></w-input>
            </w-form-model-item>
          </w-col>
          <w-col :span="12">
            <w-form-model-item prop="url" label="接口地址">
              <w-input v-model="form.url" placeholder="请填写接口地址"></w-input>
            </w-form-model-item>
          </w-col>
        </w-row>
      </span> -->

      <!-- <span v-else></span> -->
    </w-form-model>

    <!-- 监测量弹窗 -->
    <!-- <AddItem
      :visible.sync="itemVisible"
      :waterPlantId="form.waterPlantId"
      :pointId.sync="form.pointId"
      :pointOptions.sync="pointOptions"
    /> -->
  </w-modal>
</template>

<script>
import FactorySelect from '@/components/factory-select';
import { defaultPointRules, reqMethodOptions } from './config';
export default {
  name: 'AddPoint',
  components: { FactorySelect },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '新增成本点'
    },
    outerForm: {
      type: Object,
      default: () => {}
    },
    outerList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      form: {
        name: '',
        calculateType: '0',
        costTypeId: undefined,
        waterPlantId: undefined,
        structureIdList: [],
        calculation: '0',
        // 录入
        entryMode: undefined,
        // 监测量
        pointId: '',
        // 接口
        interfaceName: '',
        requestMethod: '',
        parameters: '',
        url: ''
      },
      rules: {
        name: [
          { required: true, message: '请填写成本点名称' },
          {
            validator: this.compoValidate,
            trigger: ['change', 'blur']
          },
          { max: 50, message: '请填写正确的成本点名称' }
        ],
        structureIdList: [{ validator: this.structureValidate }],
        ...defaultPointRules
      },
      showOnlyCost: false,
      // 表单选项
      reqMethodOptions,
      treeData: [],
      structureTreeData: [],
      pointOptions: [],
      // 监测量弹窗
      itemVisible: false
    };
  },
  computed: {
    isEdit: function() {
      return this.title.slice(0, 2) === '编辑';
    }
  },
  watch: {
    visible(val) {
      if (!val) return;
      this.getInit();
    },
    // 该类型的一级成本计量单位为“无单位”，或成本类型本身没有单价时，计算类型只能选成本金额
    'form.costTypeId': {
      handler(val) {
        this.showOnlyCost = this.getShowOnlyCost(val);
      }
    }
  },
  methods: {
    async getInit() {
      if (this.isEdit) {
        Object.keys(this.form).forEach(key => {
          this.form[key] = this.outerForm[key];
        });
        this.form.id = this.outerForm.id;
        // 回显监测量名称
        if (this.form.calculation === '1' && this.form.pointId) {
          this.getPointName();
        }
      } else {
        Object.keys(this.form).forEach(key => {
          this.form[key] = undefined;
        });
      }
      await this.getOptions();
      await this.getStructures();
      if (this.isEdit) {
        // 构筑物id处理
        this.form.structureIdList = this.outerForm.placeId.split(',');
      }
    },
    async handleOk() {
      let cb = await this.$refs.form.validate();
      if (cb) {
        if (this.isEdit) {
          await this.$http.put('/costPlace', this.form);
        } else {
          await this.$http.post('/costPlace', this.form);
        }
        this.handleCancel();
      }
    },
    handleCancel() {
      Object.keys(this.form).forEach(key => {
        this.form[key] = undefined;
      });
      this.$refs.form.resetFields();
      this.form.entryMode = '0';
      this.showOnlyCost = false;
      this.$emit('update:visible', false);
      this.$emit('getList');
    },

    // 成本类型配置
    async getOptions() {
      const { resultData } = await this.$http.post('/costType/list', { pageFlag: false });
      this.treeData = resultData.records;
    },
    // 构筑物选项配置
    async getStructures() {
      if (this.form.waterPlantId === '' || this.form.waterPlantId === undefined) {
        this.structureTreeData = [];
        return;
      }
      const { resultData } = await this.$http.post('/place/queryListByWaterPlantId', [
        this.form.waterPlantId
      ]);
      this.structureTreeData = [
        {
          name: '全厂',
          id: '',
          children: resultData
        }
      ];
    },
    async waterPlantChange() {
      this.$refs.form.validateField(['structureIdList']);
      await this.getStructures();
      this.form.structureIdList = [''];
    },
    // 该类型的一级成本计量单位为“无单位”，或成本类型本身没有单价时，计算类型只能选成本金额
    getShowOnlyCost(val) {
      if (!val) return false;
      // 找到该成本类型
      let treeNode = this.treeData.find(v => v.id === val);
      if (treeNode) {
        // 一级成本类型
        if (treeNode.unit === '' || treeNode.costPrice === null) return true;
      } else {
        // 二级成本类型
        this.treeData.forEach(_type => {
          treeNode = _type.children.find(v => v.id === val) || treeNode;
        });
        if (treeNode.parentUnit === '' || treeNode.costPrice === null) return true;
      }
      return false;
    },

    // 监测量弹窗
    // addItem() {
    //   this.itemVisible = true;
    // },
    // async getPointName() {
    //   const { resultData } = await this.$http.post("/sewageDeviceApi/DevicePoint/getDevicePointList", {
    //     pointIdList: [this.form.pointId],
    //   });
    //   if (resultData && resultData.length)
    //     this.pointOptions = [{ title: resultData[0].pointMemo, value: resultData[0].id }];
    // },

    // 验证规则配置
    // 计算类型、录入方式的改变触发成本点名称验重规则
    triggerCompoValidate() {
      this.$refs.form.clearValidate('name');
      this.$refs.form.validateField('name');
    },
    // 成本点名称和计算类型、录入方式的组合不能重复
    compoValidate(rule, value, cb) {
      // 只考虑录入方式下的验证
      if (this.form.calculation !== '0') cb();
      let res = this.outerList.filter(
        v =>
          v.name === this.form.name &&
          v.calculateType === this.form.calculateType &&
          v.entryMode === this.form.entryMode
      );
      // 编辑条件下，不对自身做重复校验
      if (this.isEdit && res && res.length && res[0].id === this.outerForm.id) {
        cb();
        return;
      }
      if (res && res.length !== 0) cb(new Error('成本点名称和计算类型、录入方式的组合不能重复'));
      cb();
    },
    // 未选污水厂前无法选择所属构筑物
    structureValidate(rule, value, cb) {
      if (this.form.waterPlantId === '' || this.form.waterPlantId === undefined)
        cb(new Error('请先选择污水厂'));
      else cb();
    }
  }
};
</script>
<style lang="less" scoped></style>
