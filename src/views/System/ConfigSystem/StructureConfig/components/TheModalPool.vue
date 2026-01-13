<template>
  <div>
    <w-modal
      destroyOnClose
      :visible="showModal"
      :title="title"
      @ok="handleSubmit"
      :maskClosable="false"
      :confirm-loading="confirmLoading"
      @cancel="handleCancel"
      width="650px"
    >
      <p class="wfc3 warn" style="margin-bottom: 20px">
        <w-icon type="ic_error_outline"></w-icon>
        添加水池后，如构筑物之前有位置会被删除，且下属设备将被关联到第一个水池
      </p>
      <w-info-form :footer="null" :model="form" :fields="fields" ref="form">
        <template #name>
          <div class="name">
            <w-input v-model="form.name" placeholder="请填写构筑物编码"> </w-input>
            <w-button size="small" @click="locationNew.push({ name: '' })" type="link" icon="ic_add"
              >增加位置</w-button
            >
          </div>
        </template>
        <template #locations>
          <div class="position">
            <div class="position-content">
              <div v-for="(item, i) in location" :key="item.id" class="position-item">
                <w-input v-model="location[i].name" placeholder="如 “前端”"></w-input>
                <w-button
                  size="small"
                  @click="deleteLocation(i, true)"
                  type="link"
                  icon="ic_delete"
                ></w-button>
              </div>
              <div v-for="(item, i) in locationNew" :key="i" class="position-item">
                <w-input v-model="locationNew[i].name" placeholder="如 “前端”"></w-input>
                <w-button
                  size="small"
                  @click="deleteLocation(i, false)"
                  type="link"
                  icon="ic_delete"
                ></w-button>
              </div>
            </div>
          </div>
        </template>
      </w-info-form>
    </w-modal>
  </div>
</template>

<script>
import modalMixin from './modalMixin';
import { fieldsPoolModal } from '../config';
let defaultForm = {
  name: undefined,
  locations: undefined
};

export default {
  name: 'ModalPool',
  components: {},
  mixins: [modalMixin],
  data() {
    return {
      form: {
        ...defaultForm,
        sort: 1
      },
      fields: fieldsPoolModal,
      initForm: {
        ...defaultForm
      },
      location: [],
      locationNew: []
    };
  },
  props: {
    type: {
      type: String,
      default: ''
    },
    pool: {
      type: Object,
      default: () => {}
    },
    title: {
      type: String,
      default: undefined
    },
    waterPlantId: {
      type: String,
      default: undefined
    }
  },
  computed: {
    showModal: {
      get() {
        return this.type.includes('Pool');
      },
      set(v) {
        this.showModal = v;
      }
    },
    specialParams() {
      return {
        type: 3,
        placeId: this.pool.placeId,
        facilityId: this.pool.id,
        waterPlantId: this.waterPlantId,
        path: `${this.pool.pid},${this.pool.id}`,
        pid: `${this.pool.id}`
      };
    }
  },
  watch: {
    type: {
      //监测type的变化 根据type的变化 对相应的参数进行处理
      async handler(val) {
        this.locationNew = [];
        if (val === 'editPool') {
          this.form.name = this.pool.pool;
          this.form.placeId = this.pool.placeId;
          this.form.waterPlantId = this.waterPlantId;
          this.form.id = this.pool.id;
          //获取位置
          this.location = this.pool.locations;
        } else {
          this.form.name = undefined;
          this.form.id = undefined;
          this.form.placeId = this.pool?.id;
          this.form.waterPlantId = this.waterPlantId;
          this.location = [];
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
.position-item {
  margin-top: -3px;
}
</style>
