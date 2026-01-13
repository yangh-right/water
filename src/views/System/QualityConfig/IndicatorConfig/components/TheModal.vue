<template>
  <div>
    <w-modal
      :visible="Boolean(this.type)"
      :title="title"
      :confirm-loading="confirmLoading"
      width="60%"
      @ok="handleSubmit"
      :maskClosable="false"
      @cancel="handleCancel"
    >
      <w-info-form :footer="null" :model="form" :fields="fields" ref="formOuter">
        <template #unit>
          <unit-select v-model="form.unit" :showAll="true"></unit-select>
        </template>
        <template #rangeField>
          <w-form-model ref="formRange" :model="form">
            <w-row>
              <w-col :span="8" v-if="typeIsNumer">
                <info-form-item
                  style="margin-bottom: 0px;"
                  :key="`${type}_${fieldExtra[0].name}`"
                  :field="fieldExtra[0]"
                  :form="form"
                  :type="'SUBMIT'"
                ></info-form-item>
              </w-col>
              <w-col
                :span="16"
                style="padding-left: 10px"
                v-if="typeIsNumer && !['bt', 'nb'].includes(form.opt)"
              >
                <info-form-item
                  style="margin-bottom: 0px;"
                  :key="`${type}_${fieldExtra[1].name}`"
                  :field="fieldExtra[1]"
                  :form="form"
                  :type="'SUBMIT'"
                ></info-form-item>
              </w-col>

              <w-col
                :span="16"
                style="padding-left: 10px"
                v-else-if="typeIsNumer && ['bt', 'nb'].includes(form.opt)"
              >
                <w-row>
                  <w-col :span="11">
                    <info-form-item
                      style="margin-bottom: 0px;"
                      :key="`${type}_${fieldExtra[2].name}`"
                      :field="fieldExtra[2]"
                      :form="form"
                      :type="'SUBMIT'"
                    ></info-form-item>
                  </w-col>
                  <w-col :span="2" style="line-height: 36px; text-align: center">-</w-col>
                  <w-col :span="11">
                    <info-form-item
                      style="margin-bottom: 0px;"
                      :key="`${type}_${fieldExtra[3].name}`"
                      :field="fieldExtra[3]"
                      :form="form"
                      :type="'SUBMIT'"
                    ></info-form-item>
                  </w-col>
                </w-row>
              </w-col>

              <w-col :span="24" v-else>
                <info-form-item
                  style="margin-bottom: 0px;"
                  :key="`${type}_${fieldExtra[4].name}`"
                  :field="fieldExtra[4]"
                  :form="form"
                  :type="'SUBMIT'"
                ></info-form-item>
              </w-col>
            </w-row>
          </w-form-model>
        </template>
      </w-info-form>
      <p class="wfc1">采样相关配置</p>
      <w-info-form :footer="null" :model="form" :fields="sampleFields" ref="formInner">
        <template #approach>
          <w-info-form
            :footer="null"
            v-for="(item, i) in approachArray"
            :key="i"
            :model="item"
            :fields="subSampleFields"
            ref="formSub"
          >
            <template #methodOperate>
              <w-row>
                <w-col :span="8"></w-col>
                <w-col :span="16">
                  <w-button type="link" v-if="i === 0" @click="addApproach" icon="ic_add"
                    >增加方法</w-button
                  >
                  <w-button type="link" v-else @click="deleteApproach(i)" icon="ic_remove"
                    >删除方法</w-button
                  >
                </w-col>
              </w-row>
            </template>

            <template #upload>
              <w-row>
                <w-col :span="8"></w-col>
                <w-col :span="16">
                  <Uploader
                    accept=".pdf,.png, .gif, .bmp, .jpg, .jpeg"
                    :confirmLoading.sync="confirmLoading"
                    v-model="approachArray[i].fileList"
                    :fileInfo="approachArray[i]"
                    @deletedFile="
                      file => {
                        deletedFile = file;
                      }
                    "
                  ></Uploader>
                </w-col>
              </w-row>
            </template>
          </w-info-form>
        </template>
        <template #samplingValue>
          <w-input
            v-model="form.samplingValue"
            placeholder="请填写采样量"
            style="width: 90%"
          ></w-input>
          <span style="width: 10%; text-align: right; display: inline-block"> ml </span>
        </template>
        <template #conservantValue>
          <w-input
            v-model="form.conservantValue"
            placeholder="请填写保存剂用量"
            style="width: 90%"
          ></w-input>
          <span style="width: 10%; text-align: right; display: inline-block">{{
            conserveUnit
          }}</span>
        </template>
        <template #storageLife>
          <w-row class="rowStyle">
            <w-col :span="14">
              <info-form-item
                :key="`${type}_${fieldExtra[5].name}`"
                :field="fieldExtra[5]"
                :form="form"
                :type="'SUBMIT'"
              ></info-form-item>
            </w-col>
            <w-col :span="10" style="padding-left: 10px">
              <w-select v-model="form.storageUnit" placeholder="请选择">
                <w-select-option v-for="item in timeType" :key="item.key" :value="item.label">
                  {{ item.label }}
                </w-select-option>
              </w-select>
            </w-col>
          </w-row>
        </template>

        <template #shareFlag>
          <w-radio-group v-model="form.shareFlag">
            <w-radio :value="1">是</w-radio>
            <w-radio :value="0">否</w-radio>
          </w-radio-group>
        </template>
      </w-info-form>
    </w-modal>
  </div>
</template>

<script>
import { cloneDeep } from 'lodash-es';
import UnitSelect from '@/components/unit-select';
import Uploader from './TheUploader.vue';
import InfoFormItem from '@/components/form-item/form-item.vue';
import { allPointList } from '@/api/manage';
import {
  modalField,
  modalSampleField,
  modalSubSampleField,
  modalFieldExtra,
  operators
} from '../config';
let defaultFrom = {
  dataType: 1,
  opt: undefined,
  shareFlag: 0,
  methodList: [],
  conservantId: undefined,
  containerId: undefined,
  storageUnit: undefined,
  storageLife: undefined,
  conservantValue: undefined,
  samplingValue: undefined,
  range: undefined,
  rangeField: ' ',
  rangeMax: undefined,
  rangeMin: undefined,
  value: undefined,
  name: undefined,
  unit: undefined,
  verificationFormula:''
};
let titleMap = {
  edit: '编辑水质指标',
  add: '新增水质指标'
};

let timeType = [
  { key: 'min', label: '分钟' },
  { key: 'hour', label: '小时' },
  { key: 'day', label: '天' }
];

let defaultApproachArray = [{ name: undefined, standard: undefined, fileList: [] }];
export default {
  name: 'theModal',
  components: {
    InfoFormItem,
    UnitSelect,
    Uploader
  },
  props: {
    type: {
      type: String,
      default: ''
    },
    indicatorObj: {
      type: Object,
      default: undefined
    }
  },
  data() {
    return {
      confirmLoading: false,
      fields: modalField,
      sampleFields: modalSampleField,
      subSampleFields: modalSubSampleField,
      fieldExtra: modalFieldExtra,
      fileList: [],
      approachArray: defaultApproachArray,
      form: {
        ...defaultFrom
      },
      operators: operators,
      timeType: timeType,
      deletedFile: undefined,
      conserveUnit: undefined,
      pointsList: [],
      searchVal: '',
      filterDataList: []
    };
  },
  computed: {
    title() {
      return titleMap[this.type];
    },
    typeIsNumer() {
      return this.form.dataType === 1;
    }
  },
  watch: {
    type: {
      handler(val) {
        this.$refs['formOuter']?.$_clearValidate();
        this.$refs['formInner']?.$_clearValidate();
        this.$refs['formSub']?.[0].$_clearValidate();
        if (val === 'edit') {
          Object.assign(this.form, this.indicatorObj);
          //处理上传文件
          this.approachArray = this.form.methodList.map(item => {
            return {
              name: item.name,
              standard: item.standard,
              fileList: [{ id: item.id, name: item.fileName }],
              indexId: item.indexId
            };
          });
          this.approachArray = this.approachArray.length
            ? this.approachArray
            : cloneDeep(defaultApproachArray);
        } else {
          this.form = { ...defaultFrom };
          this.approachArray = cloneDeep(defaultApproachArray);
        }
      }
    },
    'form.dataType': {
      handler(val) {
        //为选项时
        if (val === 2) {
          this.form.opt = 'rg';
          this.form.value = undefined;
          this.form.rangeMax = undefined;
          this.form.rangeMin = undefined;
        } else if (val === 1) {
          this.form.opt = undefined;
          this.form.range = undefined;
        }
      }
    },
    'form.conservantId': {
      handler(val) {
        this.conserveUnit = this.sampleFields[3].options.find(element => element.key === val)?.unit;
      }
    }
  },
  async created() {
    const common = {
      currentPage: 1,
      delFlag: 0,
      orderBy: '',
      pageFlag: false,
      pageSize: 10,
      tenantId: '',
      validFlag: 1
    };
    //获取采样容器
    let { resultData: containerList } = await this.$http.post(`/samplingContainer/list`, {
      keywords: '',
      ...common
    });

    //获取保存剂
    let { resultData: conserveList } = await this.$http.post(`/conservant/list`, {
      ...common,
      keywords: '',
      name: ''
    });
    containerList = containerList.records.filter(item => item.validFlag === 1); // 启用的采样容器
    containerList = containerList.map(item => {
      return {
        key: item.id,
        label: item.volume + item.volumeUnit + item.name
      };
    });

    conserveList = conserveList.records.map(item => {
      return {
        key: item.id,
        label: item.name,
        unit: item.unit
      };
    });

    this.sampleFields[1].options = containerList;
    this.sampleFields[3].options = conserveList;
  },
  methods: {
    addApproach() {
      this.approachArray.push({ name: undefined, standard: undefined });
    },
    async deleteApproach(i) {
      // 通过indexId 判断是否是已经通过接口添加过的
      if (this.approachArray[i]?.indexId) {
        try {
          await this.$http.delete(
            `/waterIndex/deleteMethod?methodId=${this.approachArray[i].fileList[0].id}`
          );
          this.$message.success('删除方法成功');
          this.approachArray.splice(i, 1);
        } catch (error) {
          console.log(error);
        }
      } else {
        this.approachArray.splice(i, 1);
      }
    },
    async handleSubmit() {
      let params = cloneDeep(this.form);
      delete params.approach;
      delete params.tmp1;
      delete params.tmp2;
      delete params.rangeField;
      //与后端协调 当涉及到重新伤上传的时候 先删除之前的
      if (this.deletedFile) {
        try {
          await this.$http.delete(`/WaterIndex/deleteMethod?methodId=${this.deletedFile.id}`);
          this.deletedFile = undefined;
        } catch (error) {
          console.log(error);
        }
      }

      //校验其他
      this.validate();
    },
    handleCancel() {
      this.$emit('cancel');
    },
    formValidate(name, msg) {
      return new Promise((resolve, reject) => {
        this.$refs[name].validate(valid => {
          if (valid) {
            resolve();
          } else {
            reject(msg);
          }
        });
      });
    },
    validate() {
      let promiseArray = [];
      //校验上传文件表单
      for (let index = 0; index < this.$refs['formSub'].length; index++) {
        const element = this.$refs['formSub'][index];
        promiseArray.push(element.validate());
      }

      Promise.all(promiseArray)
        .then(
          () => {
            return new Promise((res, rej) => {
              let flag = 0;
              //上传文件;
              this.form.methodList = this.approachArray.map(item => {
                //没上传文件
                if (!item.fileList[0]) {
                  flag = 1;
                }
                return {
                  name: item.name,
                  standard: item.standard,
                  id: item.fileList[0]?.id,
                  fileName: item.fileList[0]?.name,
                  indexId: item?.indexId
                };
              });
              res();
            });
          },
          () => {
            return new Promise((res, rej) => {
              rej('请按要求正确填写表单');
            });
          }
        )
        .then(() => {
          return this.formValidate('formOuter', '请按要求正确填写表单');
        })
        .then(() => {
          return this.formValidate('formRange', '请按要求正确填写表单');
        })
        .then(() => {
          return new Promise((resolve, reject) => {
            if (
              this.form.rangeMin &&
              this.form.rangeMax &&
              Number(this.form.rangeMin) > Number(this.form.rangeMax)
            ) {
              console.log('判断 reje');
              reject('最小值必须小于最大值');
            } else {
              console.log('判断 resolve');
              resolve();
            }
          });
        })
        .then(() => {
          return this.formValidate('formInner', '请按要求正确填写表单');
        })
        .then(() => {
          this.$emit('submit', this.form);
        })
        .catch(error => {
          this.$message.error(error);
        });
    }
  }
};
</script>

<style lang="less" scoped>
//单位组件里面 style 120px 需要修改
/deep/ .wpg-select {
  width: 100% !important;
}
/deep/ .wpg-btn.wpg-btn-link {
  padding: 0;
}

.afterText {
  position: relative;
}
.afterText:after {
  position: absolute;
  width: 50px;
  height: 36px;
  left: 0;
  top: 0;
}
</style>
