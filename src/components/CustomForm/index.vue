<template>
  <w-form
    v-if="formData.list.length"
    class="dynamic-form"
    :form="form"
    self-update
    :layout="formData.layout.type"
  >
    <w-row :gutter="formData.layout.gutter">
      <w-col
        v-for="(formItem, index) in formData.list"
        v-if="
          (formItem.id !== 'areaId' && formItem.id !== 'stationId' && formItem.id !== 'pumpId') ||
            formItem.visible
        "
        :key="formItem.fieldName || index"
        :span="formItem.layout.span"
      >
        <w-form-item
          v-if="!formItem.hidden"
          :class="formItem.className"
          :label="formItem.label"
          :labelCol="formItem.layout.labelCol"
          :colon="!!formItem.layout.labelColon"
          :wrapperCol="formItem.layout.wrapperCol"
        >
          <template v-if="isEdit">
            <!-- 文本输入框 -->
            <w-input
              v-if="formItem.fieldType === 'input'"
              v-decorator="[
                formItem.fieldName,
                {
                  getValueFromEvent: event => event.target.value.replace(/^\s|\s$/, ''),
                  rules: formItem.rules,
                  initialValue: formItem.initialValue,
                  ...formItem.decoratorOptions
                }
              ]"
              :placeholder="formItem.placeholder"
              :disabled="formItem.disabled"
              v-bind="formItem.attrs"
              v-on="formItem.listeners"
            />
            <!-- 地理位置输入框 -->
            <location-input
              v-else-if="formItem.fieldType === 'addressInput'"
              v-decorator="[
                formItem.fieldName,
                {
                  ...formItem.decoratorOptions,
                  initialValue: formItem.initialValue,
                  rules: formItem.rules,
                  ...formItem.decoratorOptions
                }
              ]"
              @input="addressChange($event, formItem)"
              :placeholder="formItem.placeholder"
              :disabled="formItem.disabled"
              v-bind="formItem.attrs"
              v-on="formItem.listeners"
            />
            <!-- 数字输入框 -->
            <w-input-number
              v-else-if="formItem.fieldType === 'inputNumber'"
              v-decorator="[
                formItem.fieldName,
                {
                  initialValue: formItem.initialValue,
                  rules: formItem.rules,
                  ...formItem.decoratorOptions
                }
              ]"
              :placeholder="formItem.placeholder"
              :disabled="formItem.disabled"
              v-bind="formItem.attrs"
              v-on="formItem.listeners"
            />
            <!-- 密码输入框 -->
            <w-input-password
              v-else-if="formItem.fieldType === 'password'"
              v-decorator="[
                formItem.fieldName,
                {
                  initialValue: formItem.initialValue,
                  rules: formItem.rules,
                  ...formItem.decoratorOptions
                }
              ]"
              :placeholder="formItem.placeholder"
              :disabled="formItem.disabled"
              v-bind="formItem.attrs"
              v-on="formItem.listeners"
            />
            <!-- 文本域输入框 -->
            <w-textarea
              v-else-if="formItem.fieldType === 'textarea'"
              v-decorator="[
                formItem.fieldName,
                {
                  initialValue: formItem.initialValue,
                  rules: formItem.rules,
                  ...formItem.decoratorOptions
                }
              ]"
              :placeholder="formItem.placeholder"
              :disabled="formItem.disabled"
              v-bind="formItem.attrs"
              v-on="formItem.listeners"
            />
            <!-- 下拉选择框 -->
            <w-select
              v-else-if="
                ((formItem.id !== 'stationId' && formItem.id !== 'pumpId') || formItem.visible) &&
                  formItem.fieldType === 'select'
              "
              v-decorator="[
                formItem.fieldName,
                {
                  initialValue: formItem.initialValue,
                  rules: formItem.rules,
                  ...formItem.decoratorOptions
                }
              ]"
              :getPopupContainer="getPopupContainer"
              :placeholder="formItem.placeholder"
              :disabled="formItem.disabled"
              option-filter-prop="children"
              :filter-option="filterOption"
              v-bind="formItem.attrs"
              v-on="formItem.listeners"
            >
              <w-select-option v-for="opt in formItem.options" :key="formItem.valueKey ? opt[formItem.valueKey] : opt.value" :value="formItem.valueKey ? opt[formItem.valueKey] : opt.value">
                {{ formItem.labelKey ? opt[formItem.labelKey] : opt.label }}
              </w-select-option>
            </w-select>
            <!-- 树选择器 -->
            <w-tree-select
              v-else-if="
                (formItem.id !== 'areaId' || formItem.visible) &&
                  formItem.fieldType === 'treeSelect'
              "
              v-decorator="[
                formItem.fieldName,
                {
                  initialValue: formItem.initialValue,
                  rules: formItem.rules,
                  ...formItem.decoratorOptions
                }
              ]"
              :getPopupContainer="getPopupContainer"
              :placeholder="formItem.placeholder"
              :disabled="formItem.disabled"
              :treeData="formItem.options"
              :dropdownStyle="{ maxHeight: '50vh' }"
              v-bind="formItem.attrs"
              v-on="formItem.listeners"
            />
            <!-- 带搜索多选树选择器 -->
            <xsc
              v-else-if="formItem.fieldType === 'xsc'"
              v-decorator="[
                formItem.fieldName,
                {
                  initialValue: formItem.initialValue,
                  rules: formItem.rules,
                  ...formItem.decoratorOptions
                }
              ]"
              :placeholder="formItem.placeholder"
              :treeData="formItem.options"
              v-bind="formItem.attrs"
            />
            <!-- 级联选择器 -->
            <w-cascader
              v-else-if="formItem.fieldType === 'cascader'"
              v-decorator="[
                formItem.fieldName,
                {
                  initialValue: formItem.initialValue,
                  rules: formItem.rules,
                  ...formItem.decoratorOptions
                }
              ]"
              :placeholder="formItem.placeholder"
              :disabled="formItem.disabled"
              :options="formItem.options"
              :fieldNames="formItem.fieldNames"
              v-bind="formItem.attrs"
              v-on="formItem.listeners"
            />
            <!-- 单选组 -->
            <w-radio-group
              v-else-if="formItem.fieldType === 'radio'"
              v-decorator="[
                formItem.fieldName,
                {
                  initialValue: formItem.initialValue,
                  rules: formItem.rules,
                  ...formItem.decoratorOptions
                }
              ]"
              :disabled="formItem.disabled"
              :options="formItem.options"
              :fieldNames="formItem.fieldNames"
              v-bind="formItem.attrs"
              v-on="formItem.listeners"
            />
            <!-- 多选组 -->
            <w-checkbox-group
              v-else-if="formItem.fieldType === 'checkbox'"
              v-decorator="[
                formItem.fieldName,
                {
                  initialValue: formItem.initialValue,
                  rules: formItem.rules,
                  ...formItem.decoratorOptions
                }
              ]"
              :disabled="formItem.disabled"
              :options="formItem.options"
              :fieldNames="formItem.fieldNames"
              v-bind="formItem.attrs"
              v-on="formItem.listeners"
            />
            <!-- 切换按钮 -->
            <w-switch
              v-else-if="formItem.fieldType === 'switch'"
              v-decorator="[
                formItem.fieldName,
                {
                  initialValue: formItem.initialValue,
                  rules: formItem.rules,
                  valuePropName: 'checked',
                  ...formItem.decoratorOptions
                }
              ]"
              :disabled="formItem.disabled"
              :fieldNames="formItem.fieldNames"
              v-bind="formItem.attrs"
              v-on="formItem.listeners"
            />
            <!-- 日期|日期时间选择器 -->
            <w-date-picker
              v-else-if="formItem.fieldType === 'datePicker'"
              v-decorator="[
                formItem.fieldName,
                {
                  initialValue: formItem.initialValue,
                  rules: formItem.rules,
                  ...formItem.decoratorOptions
                }
              ]"
              :show-time="formItem.showTime"
              :format="formItem.format"
              :placeholder="formItem.placeholder"
              :disabled="formItem.disabled"
              v-bind="formItem.attrs"
              v-on="formItem.listeners"
            />
            <!-- 月选择器 -->
            <w-month-picker
              v-else-if="formItem.fieldType === 'monthPicker'"
              v-decorator="[
                formItem.fieldName,
                {
                  initialValue: formItem.initialValue,
                  rules: formItem.rules,
                  ...formItem.decoratorOptions
                }
              ]"
              :format="formItem.format"
              :placeholder="formItem.placeholder"
              :disabled="formItem.disabled"
              v-bind="formItem.attrs"
              v-on="formItem.listeners"
            />
            <!-- 日期|日期时间范围选择器 -->
            <w-range-picker
              v-else-if="formItem.fieldType === 'rangePicker'"
              v-decorator="[
                formItem.fieldName,
                {
                  initialValue: formItem.initialValue,
                  rules: formItem.rules,
                  ...formItem.decoratorOptions
                }
              ]"
              :format="formItem.format"
              :placeholder="formItem.placeholder"
              :disabled="formItem.disabled"
              v-bind="formItem.attrs"
              v-on="formItem.listeners"
            />
            <!-- 月范围选择器 -->
            <w-range-picker
              v-if="formItem.fieldType === 'monthRangePicker'"
              v-decorator="[
                formItem.fieldName,
                {
                  initialValue: formItem.initialValue,
                  rules: formItem.rules,
                  ...formItem.decoratorOptions
                }
              ]"
              :format="formItem.format || 'YYYY-MM'"
              :placeholder="formItem.placeholder"
              :mode="['month', 'month']"
              :disabled="formItem.disabled"
              v-bind="formItem.attrs"
              @panelChange="handleMonthRangePanelChange(formItem.fieldName, ...arguments)"
              v-on="formItem.listeners"
            />
            <!-- 图片上传控件 -->
            <template v-else-if="formItem.fieldType === 'upload'">
              <div class="upload-wrap">
                <w-upload
                  v-decorator="[
                    formItem.fieldName,
                    {
                      rules: formItem.rules,
                      ...formItem.decoratorOptions
                    }
                  ]"
                  :file-list="fileListObj[formItem.fieldName]"
                  list-type="picture-card"
                  :class="{ uploader: true, noAdd: formItem.noAdd }"
                  :show-upload-list="true"
                  :action="formItem.action || uploaderAction"
                  :headers="headers"
                  :before-upload="beforeUpload(formItem)"
                  @preview="handlePreview($event, index)"
                  @change="handleUploadChange($event, formItem)"
                  v-bind="formItem.attrs"
                >
                  <div class="uploader-guide supply-text-secondary">
                    <w-icon type="plus" class="supply-text-secondary" />
                    <div class="wpg-upload-text">上传图片</div>
                  </div>
                </w-upload>
                <w-modal v-model="formItem.previewVisible" :footer="null">
                  <img alt="" style="width: 100%" :src="formItem.previewImage" />
                </w-modal>
              </div>
            </template>
          </template>
          <slot
            v-if="formItem.fieldType === 'slot'"
            :name="formItem.slotName"
            :data="formItem.data || {}"
          ></slot>
          <div v-if="!isEdit && formItem.fieldType !== 'slot'" class="genFormValue">
            {{ getPreviewData(formItem) }}
          </div>
        </w-form-item>
      </w-col>
    </w-row>
  </w-form>
</template>

<script>
import { accessToken } from '@wpg/framework-vue';
import moment from 'moment';
import { uploadByBucket } from '@/api/manage';
import { imageFullUrl, getFileUrlQuery } from '@/utils/js/tool/tools';
import { getBlob } from '@/utils/util';
import { vRequiredLong, vRequiredLati } from '@/utils/validator';
import serverConfig from '@/config/server.config';
import Xsc from './xsc';
import { findItemFromTree } from '@/utils/js/tool/tools';

const _customData = {
  // previewPrefix: 'http://119.3.37.131',
  validateImage(file) {
    if (['image/jpeg', 'image/png'].indexOf(file.type) === -1) {
      return '只能上传jpg/png图片';
    }
    if (file.size > 10 * 1024 * 1024) {
      return '图片大小不超过10M';
    }
    return '';
  },
  handleList(list, i = 0) {
    for (let index = i; index < list.length; index++) {
      if (list[index].fieldType === 'addressInput' && list[index]?.attrs?.canInput && !list[index].hasLnglat) {
        list[index].hasLnglat = true;
        if (!list[index].hideLnglat) {
          list.splice(
            index,
            0,
            {
              fieldType: 'input',
              disabled: list[index].disabled ? true : false,
              fieldName: list[index].fieldName + '_lng',
              label: '经度',
              placeholder: '请输入',
              rules: [{ required: true, validator: vRequiredLong }]
            },
            {
              fieldType: 'input',
              disabled: list[index].disabled ? true : false,
              fieldName: list[index].fieldName + '_lat',
              label: '纬度',
              placeholder: '请输入',
              rules: [{ required: true, validator: vRequiredLati }]
            }
          );
          _customData.handleList(list, index + 3);
        }else {
          _customData.handleList(list, index + 1);
        }
        break;
      }
    }
  },
  genFormData(formData) {
    const _formData = {
      id: Date.now(),
      layout: {
        type: 'horizontal',
        gutter: 24,
        span: 6,
        labelCol: { span: 8 },
        wrapperCol: { span: 16 }
      },
      list: []
    };
    if (formData && formData.list && formData.list.length) {
      // 全局配置（约定配置，潜拷贝即可）
      _formData.layout = { ..._formData.layout, ...formData.layout };
      _customData.handleList(formData.list);
      // 表单项
      formData.list.forEach((_v, i) => {
        // 保持单向数据流，浅拷贝
        let v = { ..._v };
        v.layout = { ..._formData.layout, ...v.layout };
        if (['_lng', '_lat'].find(key => v?.fieldName?.indexOf(key) > -1)) {
          let parentItem = formData.list.find(
            item => item?.fieldName === v.fieldName.split('_')[0]
          );
          if (!v.initialValue && parentItem.initialValue) {
            v.initialValue = parentItem.initialValue.point[v.fieldName.split('_')[1]];
          }
        } else if (
          ['datePicker', 'monthPicker', 'rangePicker', 'monthRangePicker'].indexOf(v.fieldType) > -1
        ) {
          // 初始值格式化
          if (v.initialValue) {
            if (Array.isArray(v.initialValue)) {
              v.initialValue = v.initialValue.map(vv => moment(vv));
            } else {
              v.initialValue = moment(v.initialValue);
            }
          }
          // 输出格式化
          if (!v.resultFormat) {
            if (v.fieldType === 'monthPicker' || v.fieldType === 'monthRangePicker') {
              v.resultFormat = 'YYYY-MM';
            } else if (v.showTime) {
              v.resultFormat = 'YYYY-MM-DD HH:mm';
            } else {
              v.resultFormat = 'YYYY-MM-DD';
            }
          }
        } else if (v.fieldType === 'upload') {
          // 上传控件初始化预览图
          v.loading = false;
          v.validator = v.validator || _customData.validateImage;
        } else if (v.fieldType === 'cascader') {
          // 级联选择器初始化字段映射
          v.fieldNames = { label: 'label', value: 'value', children: 'children', ...v.fieldNames };
        }

        _formData.list.push(v);
      });
    }
    return _formData;
  },
  getBase64(img, callback) {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
  },
  getFileListObj(optionList) {
    let fileListObj = {}
    optionList.map(item => {
      if (item.fieldType === 'upload') {
        fileListObj[item.fieldName] = item.initialValue?.map(item => {
          if (typeof item === 'string') {
            let fileName= item.lastIndexOf('/') > -1 ? item.slice(item.lastIndexOf('/')+1) : item 
            fileName = fileName.lastIndexOf('.') > -1 ? fileName.slice(0, fileName.lastIndexOf('.')) : fileName 
            return {
              url: imageFullUrl(item),
              urlQuery: getFileUrlQuery(item),
              uid: fileName,
              name: fileName,
              status: 'done'
            }
          }
          return item
        }) || []
      }
    })
    return fileListObj
  },
};

export default {
  name: 'CustomForm',
  components: {
    Xsc,
    LocationInput: () => import('@/components/InputAddress/InputAddress')
  },
  props: {
    options: {
      type: Object,
      default: () => ({})
    },
    isEdit: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      headers: {},
      form: this.$form.createForm(this, {
        name: `custom_form_${Math.random()
          .toString(16)
          .slice(2)}`
      }),
      formData: _customData.genFormData(this.options),
      uploaderAction: `${serverConfig.API_BASE_URL}/fileManage/uploadByBucket`,
      fileListObj: _customData.getFileListObj(this.options?.list || [])
    }
  },
  watch: {
    options: {
      deep: true,
      handler() {
        this.formData = _customData.genFormData(this.options,);
      }
    }
  },
  created() {
    const token = `Bearer ${accessToken.get()}`;
    this.headers = { Authorization: token };
  },
  mounted() {
    this.initData()
  },
  methods: {
    initData() {
      for (const [key, value] of Object.entries(this.fileListObj)) {
        this.form.setFieldsValue({
          [key]: { fileList: value },
        });
      }
    },
    filterOption(input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      );
    },
    validate() {
      return new Promise((resolve, reject) => {
        this.form.validateFields((err, values) => {
          if (!err) {
            resolve(values);
          } else {
            reject(err);
          }
        });
      });
    },
    /**
     * @description: 选择器弹出框渲染父节点上，解决滚动定位问题
     * @param {*}
     * @return {*}
     */
    getPopupContainer(node) {
      return node ? node.parentNode : document.body;
    },
    // 时间转换
    dateFormat(formItem) {
      // 日期格式
      if (!formItem.resultFormat) {
        if (formItem.fieldType === 'monthPicker' || formItem.fieldType === 'monthRangePicker') {
          formItem.resultFormat = 'YYYY-MM';
        } else if (formItem.showTime) {
          formItem.resultFormat = 'YYYY-MM-DD HH:mm';
        } else {
          formItem.resultFormat = 'YYYY-MM-DD';
        }
      }
      // 初始值
      let date = '';
      if (formItem.initialValue) {
        if (Array.isArray(formItem.initialValue)) {
          date = formItem.initialValue.reduce((total, item, index) => {
            if (index === 0) {
              return moment(item).format(formItem.resultFormat);
            } else {
              return total + '~' + moment(item).format(formItem.resultFormat);
            }
          }, '');
        } else {
          date = moment(formItem.initialValue).format(formItem.resultFormat);
        }
      }
      return date;
    },
    getPreviewData(formItem) {
      if (formItem.options && formItem.options.length) {
        let optionItem = findItemFromTree(
          formItem.options,
          formItem.initialValue,
          formItem.valueKey || 'value'
        );
        let label = optionItem && optionItem[formItem.labelKey || 'label'];
        return label || formItem.initialValue;
      } else if (formItem.fieldType.indexOf('Picker') > -1) {
        return this.dateFormat(formItem);
      } else if (formItem.fieldType.indexOf('addressInput') > -1) {
        return formItem.initialValue?.address || '';
      }
      return formItem.initialValue;
    },
    handleNum(value) {
      let strNum = '' + value;
      if (strNum.indexOf('.') > -1 && strNum.length - strNum.indexOf('.') > 11) {
        strNum = Number(strNum).toFixed(10);
      }
      return strNum;
    },
    addressChange(location, formItem) {
      if (formItem.attrs?.canInput) {
        this.form.setFieldsValue({
          [formItem.fieldName + '_lat']: this.handleNum(location?.point?.lat),
          [formItem.fieldName + '_lng']: this.handleNum(location?.point?.lng)
        });
      }
    },
    submit() {
      return new Promise((resolve, reject) => {
        this.form.validateFields((err, values) => {
          if (!err) {
            // 日期类型输出值格式化
            for (let k in values) {
              if (!values.hasOwnProperty(k)) continue;
              const v = values[k];
              const item = this.formData.list.find(vv => vv.fieldName === k);
              if (!item) continue;
              // 上传控件提取远程图片链接
              if (item.fieldType === 'upload') {
                if (!v) return
                values[k] = v?.fileList.map(item => 
                  item?.urlQuery || item?.response?.resultData?.url
                ).filter(item => item)
              }
              if (['_lng', '_lat'].find(key => item.fieldName.indexOf(key) > -1)) {
                values[item.fieldName.split('_')[0]].point[item.fieldName.split('_')[1]] = v;
              }
              // 输入结果格式化
              if (item.resultFormat) {
                // 日期类型值可能为单一值或数组
                if (v instanceof moment || (Array.isArray(v) && v[0] instanceof moment)) {
                  values[k] = Array.isArray(v)
                    ? v.map(vv => vv.format(item.resultFormat))
                    : v.format(item.resultFormat);
                } else if (typeof item.resultFormat === 'function') {
                  values[k] = item.resultFormat(v);
                } else if (
                  Array.isArray(item.resultFormat) &&
                  item.resultFormat.every(v => typeof v === 'string')
                ) {
                  // eslint-disable-next-line
                  values[k] = new Function(...item.resultFormat)(v);
                } else {
                  values[k] = v;
                }
              }
            }
            this.$emit('submit', values);
            resolve(values);
          } else {
            reject(err);
          }
        });
      });
    },
    reset() {
      this.form.resetFields();
      // 上传控件重置
      this.formData.list.forEach(v => {
        if (v.fieldType === 'upload') {
          v.loading = false;
          this.form.setFields({
            [v.fieldName]: []
          });
        }
      });
    },
    // 图片上传前校验
    beforeUpload(formItem) {
      return file => {
        const msg = formItem.validator(file);
        this.$nextTick(() => {
          this.form.setFields({
            [formItem.fieldName]: {
              errors: msg ? [new Error(msg)] : null
            }
          });
        });
        return !msg;
      };
    },
    // 图片上传回调
    handleUploadChange(info, formItem) {
      this.fileListObj[formItem.fieldName] = info.fileList;
      if (info.file.status === 'uploading') {
        formItem.loading = true;
      } else if (info.file.status === 'done') {
        formItem.noAdd = info.fileList.length >= (formItem.maxQuantity || 10);
        formItem.loading = false;
      } else if (info.file.status === 'error') {
        this.$message.error('图片上传失败');
        formItem.loading = false;
      } else if (info.file.status === 'removed') {
        let isAllImg = (info.fileList.filter(item => !item.type || ['image/jpeg', 'image/png'].includes(item.type)).length) === info.fileList.length
        if (isAllImg) {
          this.form.setFields({
            [formItem.fieldName]: {
              errors: null
            }
          });
        }
        formItem.loading = false;
      }
    },
    async handlePreview(file, index) {
      if (file.response?.resultData?.url) {
        this.$set(this.formData.list[index], 'previewImage', imageFullUrl(file.response.resultData.url))
      } else if (file.url) {
        this.$set(this.formData.list[index], 'previewImage', file.url)
      }else {
        _customData.getBase64(file.originFileObj, (imageUrl) => {
          this.$set(this.formData.list[index], 'previewImage', imageUrl)
        });
      }
      this.$set(this.formData.list[index], 'previewVisible', true)
    },
    handleAdd(formItem) {
      if (formItem.disabled) {
        this.$message.warn('最多十张图片');
      }
    },
    // 月范围选择器
    handleMonthRangePanelChange(fieldName, val) {
      this.form.setFieldsValue({
        [fieldName]: val
      });
    },
  }
};
</script>

<style scoped lang="less">
@import '@/styles/switch.less';
.dynamic-form {
  .genFormValue {
    word-break: break-all;
    display: block;
    min-height: 32px;
    padding: 6px;
    line-height: 20px;
    background: var(--supply-color-bg-select-DEFAULT);
    border-radius: 4px;
  }
}
.wpg-form {
  /* a-row 会有左右12px的负margin */
  padding: 12px;

  /deep/ &-item-children {
    background: transparent;
  }
}

.wpg-row {
  /* 主题全局样式，modal下无效，内部添加 */
  margin: 10px 0;
}

/deep/ .wpg-form-explain {
  /* 避免破坏布局 */
  position: absolute;
}

/deep/ .wpg-input-number {
  width: 100%;
}

.wpg-calendar-picker {
  width: 100% !important;
}

// /deep/ .wpg-cascader-picker {
//   /* 主题全局样式下颜色偏灰，此处重置 */
//   color: inherit;
// }
.uploader {
  /deep/ .wpg-upload {
    &-select-picture-card {
      display: table;
      float: left;
      width: 100px;
      height: 100px;
      margin-right: 8px;
      margin-bottom: 8px;
      text-align: center;
      vertical-align: top;
      border: 1px dashed var(--supply-color-border-DEFAULT);
      border-radius: 4px;
      cursor: pointer;
      transition: border-color 0.3s ease;
    }
  }
  &.noAdd {
    /deep/ .wpg-upload {
      &-select-picture-card {
        display: none;
      }
    }
  }
}
</style>
