<template>
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
    <w-row class="config-wrap">
      <w-form-model
        ref="form"
        :model="form"
        :rules="rules"
        :labelCol="{ span: 10 }"
        :wrapperCol="{ span: 14 }"
      >
        <w-col span="24">
          <w-form-model-item label="选择污水厂" prop="waterPlantId">
            <FactorySelect v-model.trim="form.waterPlantId" autoSelect></FactorySelect>
          </w-form-model-item>
        </w-col>
        <w-col span="24">
          <w-form-model-item label="构筑物" prop="evaluationType">
            <w-select v-model="form.placeId" placeholder="请选择构筑物" allowClear>
              <w-select-option
                v-for="item in structureList"
                :key="item.value"
                :value="item.value"
                >{{ item.label }}</w-select-option
              >
            </w-select>
          </w-form-model-item>
        </w-col>
        <w-col span="24">
          <w-form-model-item label="指标名称" prop="indicatorName">
            <w-select v-model="form.indicatorName" placeholder="请选择指标名称" allowClear>
              <w-select-option
                v-for="item in indicatorList"
                :key="item.value"
                :value="item.value"
                >{{ item.label }}</w-select-option
              >
            </w-select>
          </w-form-model-item>
        </w-col>
        <w-col span="24">
          <w-form-model-item label="采集时间" prop="collectionTime">
            <w-date-picker
              :show-time="{ format: 'HH' }"
              :disabled-time="disabledDateTime"
              v-model="form.collectionTime"
              format="YYYY-MM-DD HH:00:00"
              placeholder="请选择采集时间"
              allowClear
            />
          </w-form-model-item>
        </w-col>
        <w-col span="24">
          <w-form-model-item label="指标值" prop="indicatorValue">
            <w-input v-model="form.indicatorValue" placeholder="请输入指标值" type="number" />
          </w-form-model-item>
        </w-col>
        <w-col span="24">
          <w-form-model-item label="污泥颜色" prop="colour">
            <w-input v-model="form.colour" placeholder="请输入污泥颜色" />
          </w-form-model-item>
        </w-col>
        <w-col span="24">
          <w-form-model-item label="指标描述" prop="indicatorMemo">
            <w-textarea v-model="form.indicatorMemo" placeholder="请输入指标描述" />
          </w-form-model-item>
        </w-col>
        <w-col span="24">
          <w-form-model-item label="图片上传" prop="fileList">
            <uploadImg ref="uploadImg" v-model="fileList" :limit="1"></uploadImg>
          </w-form-model-item>
        </w-col>
      </w-form-model>
    </w-row>
  </w-modal>
</template>

<script>
import { cloneDeep } from 'lodash-es';
import FactorySelect from '@/components/factory-select/index.vue';
import { addActivatedSludge, editActivatedSludge } from '@/api/reportRecord';
import uploadImg from './uploadImg.vue';
const formData = {
  waterPlantId: '',
  placeId: undefined,
  colour: undefined,
  indicatorMemo: '',
  indicatorName: undefined,
  collectionTime: null,
  indicatorValue: null
};

export default {
  name: 'ConfigEdit',
  components: {
    FactorySelect,
    uploadImg
  },
  props: {
    runTimeObj: {
      type: Number,
      default: 0
    },
    rowData: {
      type: Object,
      default: () => {}
    },
    structureList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      form: cloneDeep(formData),
      visible: false, //新增、编辑弹窗
      indicatorList: [
        { value: 'SV5', label: 'SV5' },
        { value: 'SV10', label: 'SV10' },
        { value: 'SV30', label: 'SV30' }
      ],
      rules: {
        waterPlantId: [{ required: true, message: '请选择水厂' }]
      },
      fileList: [] //图片上传
    };
  },
  watch: {
    visible(val) {
      if (val) {
        this.initData();
      }
    },
    runTimeObj(val) {
      if (!val) {
        this.form = cloneDeep(formData);
        this.fileList = [];
      }
    }
  },
  created() {},
  methods: {
    disabledDateTime() {
      return {
        disabledHours: () => [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23]
      };
    },
    initData() {
      if (!(this.rowData === null) && this.runTimeObj) {
        (this.fileList = [
          {
            status: 'done',
            fileUrl: this.rowData.imageUrl
          }
        ]),
          (this.form = {
            ...this.rowData
          });
      }
    },
    cancel() {
      this.visible = false;
      this.$emit('cancel');
    },
    handlerFrom() {
      if (this.fileList.length < 1) {
        this.$message.warning('请先上传图片信息！');
        return;
      }
      this.$refs.form.validate(async valid => {
        if (valid) {
          let params = {
            ...this.form,
            imageUrl: this.fileList[0]?.imageUrl,
            collectionTime: this.$moment(this.form.collectionTime).format('YYYY-MM-DD HH:00:00')
          };
          let methods = this.runTimeObj ? editActivatedSludge : addActivatedSludge;
          let { status } = await methods(params);
          if (status === 'complete') {
            let message = this.runTimeObj ? '编辑成功' : '新增成功';
            this.$message.success(message);
            this.visible = false;
            this.fileList = [];
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
