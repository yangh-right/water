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
      </w-info-form>
    </w-modal>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import FactorySelect from '@/components/factory-select/index';
import modalMixin from './modalMixin';
import { genFieldsStructureModal } from '../config';
let defaultForm = {
  waterPlantId: undefined,
  //构筑物名称
  areaName: undefined,
  functionDesc: undefined,
  //面积
  landArea: 0,
  width: 0,
  length: 0,
  height: 0
};

export default {
  name: 'modalAddStrcuture',
  components: {
    FactorySelect
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
    showModal: {
      get() {
        return this.type.includes('Structure');
      },
      set(v) {
        this.showModal = v;
      }
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
            this.form.areaName = this.structure.areaName;
            this.form.functionDesc = this.structure.functionDesc;
            this.form.id = this.structure.id;
            this.form.width = this.structure.width || 0;
            this.form.length = this.structure.length || 0;
            this.form.height = this.structure.height || 0;
            this.form.landArea = this.structure.landArea || 0;
          }
        }
        //若是添加构筑物
        else {
          this.form.areaName = undefined;
          this.form.functionDesc = undefined;
          this.form.id = undefined;
          this.form.width = 0;
          this.form.length = 0;
          this.form.height = 0;
          this.form.landArea = 0;
        }
      }
    },
    waterPlantId: {
      handler(val) {
        this.form.waterPlantId = val;
      }
    }
  },
  methods: {}
};
</script>

<style lang="less" scoped>
@import '/src/views/System/ConfigSystem/StructureConfig/components/style.less';
</style>
