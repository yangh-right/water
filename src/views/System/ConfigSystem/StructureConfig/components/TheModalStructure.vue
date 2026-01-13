<template>
  <div>
    <w-modal
      destroyOnClose
      :visible="showModal"
      :title="title"
      :confirm-loading="confirmLoading"
      @ok="handleSubmit"
      :maskClosable="false"
      @cancel="handleCancel"
      width="680px"
    >
      <w-info-form :footer="null" :model="form" :fields="fields" ref="form">
        <template #waterPlantId>
          <factory-select
            v-model="form.waterPlantId"
            :disabled="waterPlantDisabled"
          ></factory-select>
        </template>
        <template #coding>
          <w-input
            style="width:calc(100% - 30px)"
            v-model="form.coding"
            placeholder="请填写构筑物编码"
          >
          </w-input>
          <w-tooltip placement="top">
            <template slot="title">
              <span>将用于自动生成设备编号</span>
            </template>
            <w-icon
              class="supply-cursor-pointer supply-text-lg supply-ml-2.5"
              type="question-circle"
            ></w-icon>
          </w-tooltip>
        </template>
        <template #line>
          <w-select style="width:calc(100% - 30px)" v-model="form.line" placeholder="请选择路线">
            <w-select-option v-for="c in line_list" :key="c.dictValue" :value="c.dictValue">
              {{ c.dictName }}
            </w-select-option>
          </w-select>
          <w-tooltip placement="top">
            <template slot="title">
              线路维护
            </template>
            <w-icon
              @click="addline"
              type="ic_border_color"
              class="supply-cursor-pointer supply-text-lg supply-ml-2.5"
            />
          </w-tooltip>
        </template>
      </w-info-form>
    </w-modal>
    <DragModal
      ref="dragModal"
      :isDrag="false"
      :isShowFullBtn="false"
      title="线路维护"
      :width="748"
      :mask="true"
      :height="483"
    >
      <line-edit />
    </DragModal>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import FactorySelect from '@/components/factory-select/index';
import DragModal from '@/components/DragModal/index.vue';
import modalMixin from './modalMixin';
import lineEdit from './lineEdit.vue';
import { genFieldsStructureModal } from '../config';
let defaultForm = {
  waterPlantId: undefined,
  //构筑物名称
  name: undefined,
  processingType: undefined,
  line: undefined,
  type: undefined,
  //构筑物编码
  coding: undefined,
  //排序
  sort: 1,
  //位置
  locations: undefined,
  width: 0,
  length: 0,
  height: 0,
  volume: 0
};

export default {
  name: 'modalAddStrcuture',
  components: {
    FactorySelect,
    DragModal,
    lineEdit
  },
  mixins: [modalMixin],
  data() {
    return {
      form: {
        ...defaultForm
      },
      fields: genFieldsStructureModal(this),
      location: [],
      locationNew: [],
      waterPlantDisabled: false
    };
  },
  props: {
    type: {
      type: String,
      default: ''
    },
    structure: {
      type: Object,
      default: () => {}
    },
    processList: {
      type: Array,
      default: () => []
    },
    waterPlantId: {
      type: String,
      default: undefined
    },
    title: {
      type: String,
      default: undefined
    }
  },
  computed: {
    ...mapState('dict', ['line_list']),
    showModal: {
      get() {
        return this.type.includes('Structure');
      },
      set(v) {
        this.showModal = v;
      }
    },
    specialParams() {
      return {
        type: 2,
        placeId: this.structure.id,
        facilityId: '',
        waterPlantId: this.waterPlantId
      };
    },
    showPosition() {
      return !this.structure || !this.structure.children || !this.structure.children.length;
    }
  },
  watch: {
    type: {
      //监测type的变化 根据type的变化 对相应的参数进行处理
      async handler(val) {
        //若是编辑构筑物
        this.locationNew = [];
        if (val === 'editStructure') {
          if (this.structure) {
            this.form.name = this.structure.name.split(' ')[0];
            this.form.coding = this.structure.coding;
            this.form.sort = this.structure.sort || 1;
            this.form.id = this.structure.id;
            this.form.waterPlantId = this.structure.waterPlantId;
            this.waterPlantDisabled = true;
            this.form.processingType = this.structure.processingType;
            this.form.type = this.structure.type;
            this.form.line = this.structure.line + '' || undefined;
            this.form.width = this.structure.width || 0;
            this.form.length = this.structure.length || 0;
            this.form.height = this.structure.height || 0;
            this.form.volume = this.structure.volume || 0;

            // 添加水箱参数
            this.addBankFilelds();

            //获取位置
            this.setLine();
          }
        }
        //若是添加构筑物
        else {
          this.form.name = undefined;
          this.form.coding = undefined;
          this.form.id = undefined;
          this.form.sort = 1;
          this.location = [];
          this.waterPlantDisabled = false;
          this.form.width = 0;
          this.form.length = 0;
          this.form.height = 0;
          this.form.volume = 0;
        }
      }
    },
    waterPlantId: {
      handler(val) {
        this.form.waterPlantId = val;
      }
    },
    showModal: {
      handler(val) {
        if (val) {
          this.fields.find(item => item.name === 'processingType').options = this.processList?.map(
            item => ({
              label: item.dictName,
              value: item.dictValue
            })
          );
        }
      },
      immediate: true
    }
  },
  methods: {
    setLine() {
      let lineField = this.fields.find(item => item.name === 'line');
      if (this.form.processingType === 'biochemical_treatment') {
        if (!lineField) {
          this.fields.splice(4, 0, {
            name: 'line',
            label: '线路',
            type: 'select',
            placeholder: '请选择线路1',
            required: true,
            span: 12,
            options: [],
            wrapperCol: { span: 16 }
          });
        }
      } else {
        if (lineField) {
          this.fields.splice(4, 1);
        }
      }
    },
    addBankFilelds() {
      let idx = this.fields.findIndex(item => item.name === 'type');
      let bankFiled = this.fields.find(item => item.name === 'width');
      if (this.form.type == '1') {
        if (!bankFiled) {
          let bankFiledArr = [
            {
              name: 'width',
              label: '宽度',
              type: 'input-number',
              placeholder: '请填写',
              attrs: { min: 0 },
              span: 12,
              wrapperCol: { span: 16 },
              listeners: {
                change: this.handleBankTotal //  // 这里的事件会传递给 `w-select`
              }
            },
            {
              name: 'length',
              label: '长度',
              type: 'input-number',
              placeholder: '请填写',
              attrs: { min: 0 },
              span: 12,
              wrapperCol: { span: 16 },
              listeners: {
                change: this.handleBankTotal //  // 这里的事件会传递给 `w-select`
              }
            },
            {
              name: 'height',
              label: '高度',
              type: 'input-number',
              placeholder: '请填写',
              attrs: { min: 0 },
              span: 12,
              wrapperCol: { span: 16 },
              listeners: {
                change: this.handleBankTotal //  // 这里的事件会传递给 `w-select`
              }
            },
            {
              name: 'volume',
              label: '体积',
              type: 'input-number',
              placeholder: '请填写',
              attrs: { min: 0 },
              span: 12,
              wrapperCol: { span: 16 }
            }
          ];
          this.fields.splice(idx + 1, 0, ...bankFiledArr);
        }
      } else {
        if (bankFiled) {
          this.fields.splice(idx + 1, 4);
        }
      }
    },
    handleBankTotal() {
      this.form.volume = this.form.width * this.form.length * this.form.height;
    },
    handleProcessTypeChange() {
      this.setLine();
    },
    handleSelectChange(val) {
      this.addBankFilelds();
    },
    addline() {
      this.$refs.dragModal.visible = true;
    }
  }
};
</script>

<style lang="less" scoped>
@import '/src/views/System/ConfigSystem/StructureConfig/components/style.less';
</style>
