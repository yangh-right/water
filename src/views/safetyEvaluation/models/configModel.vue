<!-- 安全评价配置弹窗组件 -->
<template>
  <!-- 模态框 -->
  <w-modal
    :destroyOnClose="true"
    :title="runTimeObj ? '编辑' : '新增'"
    :visible="visible"
    height="80vh"
    width="650px"
    centered
    :maskClosable="false"
    @cancel="cancel"
    @ok="handlerFrom"
  >
    <!-- 配置表单区域 -->
    <w-row class="config-wrap">
      <w-form-model
        ref="form"
        :model="form"
        :rules="rules"
        :labelCol="{ span: 10 }"
        :wrapperCol="{ span: 14 }"
      >
        <!-- 污水厂选择 -->
        <w-col span="24">
          <w-form-model-item label="选择污水厂" prop="waterPlantId">
            <FactorySelect v-model.trim="form.waterPlantId" autoSelect></FactorySelect>
          </w-form-model-item>
        </w-col>
        <!-- 构筑物名称选择 -->
        <w-col span="24">
          <w-form-model-item label="构筑物名称" prop="placeId">
            <w-select v-model="form.placeId" placeholder="请选择构筑物名称" showSearch allowClear>
              <w-select-option
                v-for="item in structureList"
                :key="item.value"
                :value="item.value"
                >{{ item.label }}</w-select-option
              >
            </w-select>
          </w-form-model-item>
        </w-col>
        <!-- 评价类型选择 -->
        <w-col span="24">
          <w-form-model-item label="评价类型" prop="evaluationType">
            <w-select v-model="form.evaluationType" placeholder="请选择评价类型" allowClear>
              <w-select-option
                v-for="item in evaluationList"
                :key="item.value"
                :value="item.value"
                >{{ item.label }}</w-select-option
              >
            </w-select>
          </w-form-model-item>
        </w-col>
        <!-- 频率选择 -->
        <w-col span="24">
          <w-form-model-item label="频率" prop="l">
            <w-select v-model="form.l" placeholder="请选择频率" allowClear>
              <w-select-option
                v-for="item in frequencyList"
                :key="item.value"
                :value="item.value"
                >{{ item.label }}</w-select-option
              >
            </w-select>
          </w-form-model-item>
        </w-col>
        <!-- 后果分析选择 -->
        <w-col span="24">
          <w-form-model-item label="后果分析" prop="s">
            <w-select v-model="form.s" placeholder="请选择后果" allowClear>
              <w-select-option
                v-for="item in consequenceList"
                :key="item.value"
                :value="item.value"
                >{{ item.label }}</w-select-option
              >
            </w-select>
          </w-form-model-item>
        </w-col>
      </w-form-model>
    </w-row>
  </w-modal>
</template>

<script>
// 导入相关依赖
import { cloneDeep } from 'lodash-es';
import FactorySelect from '@/components/factory-select/index.vue';
import { addSafetyEvaluation, editsSafetyEvaluation } from '@/api/safetyEvaluation';
import { evaluationList } from './options.js';

// 表单初始数据
const formData = {
  waterPlantId: '',
  placeId: undefined,
  evaluationType: undefined,
  l: undefined,
  s: undefined,
  id: undefined
};

export default {
  name: 'ConfigEdit',
  components: {
    FactorySelect
  },
  props: {
    // 是否为编辑模式
    runTimeObj: {
      type: Number,
      default: 0
    },
    // 行数据
    rowData: {
      type: Object,
      default: () => {}
    },
    // 构筑物列表
    structureList: {
      type: Array,
      default: () => []
    },
    // 频率列表
    frequencyList: {
      type: Array,
      default: () => []
    },
    // 后果分析列表
    consequenceList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      // 表单数据
      form: cloneDeep(formData),
      // 是否显示弹窗
      visible: false,
      // 评价类型列表
      evaluationList,
      // 表单验证规则
      rules: {
        waterPlantId: [{ required: true, message: '请选择水厂' }]
      }
    };
  },
  watch: {
    // 监听弹窗显示状态
    visible(val) {
      if (val) {
        this.initData();
      }
    },
    // 监听编辑模式变化
    runTimeObj(val) {
      if (!val) {
        this.form = cloneDeep(formData);
      }
    }
  },
  methods: {
    // 初始化数据
    initData() {
      if (!(this.rowData === null) && this.runTimeObj) {
        this.form = {
          ...this.rowData
        };
      }
    },
    // 取消操作
    cancel() {
      this.visible = false;
      this.$emit('cancel');
    },
    // 表单提交处理
    handlerFrom() {
      this.$refs.form.validate(async valid => {
        if (valid) {
          let params = {
            ...this.form
          };
          // 根据模式选择新增或编辑方法
          let methods = this.runTimeObj ? editsSafetyEvaluation : addSafetyEvaluation;
          let { status } = await methods(params);
          if (status === 'complete') {
            let message = this.runTimeObj ? '编辑成功' : '新增成功';
            this.$message.success(message);
            this.visible = false;
            this.form = cloneDeep(formData);
            this.$emit('cancel', true);
          } else {
            return false;
          }
        } else {
          return false;
        }
      });
    }
  }
};
</script>

<style lang="less" scoped>
/* 样式部分 */
.config-wrap {
  max-height: 70vh;
  overflow: auto;
}
/deep/.wpg-form-item-label {
  width: 150px;
}
.form-footer {
  position: absolute;
  right: 20px;
  bottom: 20px;
}
.af-time {
  position: relative;

  &::after {
    content: '年';
    font-weight: 500;
    font-size: 14px;
    color: var(--supply-color-third);
    position: absolute;
    right: -20px;
    top: 7px;
  }
}
</style>
