<template>
  <div>
    <w-modal
      class="secondary-modal"
      :title="title"
      :visible="visible"
      :width="800"
      ok-text="保存"
      :confirmLoading="confirmLoading"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <custom-form ref="form" :options="options" @submit="addLog">
        <div slot="isImportant" class="form-checkbox">
          <w-checkbox v-model="isImportant"></w-checkbox>
          <span v-if="0" class="supply-text-third">标记后此日志将被分享到首页重要日志列表</span>
        </div>
        <div slot="address" class="form-address">
          <span class="supply-text-main" v-if="address">{{ address }}</span>
          <span class="supply-text-secondary">{{ lngLat }}</span>
        </div>
      </custom-form>
    </w-modal>
  </div>
</template>

<script>
import moment from 'moment';
import customForm from '@/components/CustomForm';
import {
  reverseGeoCoding as apiReverseGeoCoding,
  saveDmLog as apiSaveDmLog,
} from '@/api';
import mapConfig from "@/config/map.config";

const _customData = {
  genOptions(type, self) {
    const _option = {
      layout: {
        gutter: 24,
        span: 24,
        labelCol: {span: 4},
        wrapperCol: {span: 19}
      },
      list: [{
        fieldType: 'slot',
        slotName: 'isImportant',
        label: '重要日志'
      }, {
        fieldType: 'input',
        fieldName: 'recordTitle',
        label: '日志标题',
        placeholder: '请输入日志标题',
        rules: [{required: true, message: '请输入日志标题'}, {max: 30, message: '至多可输入30个字符'}, {
          whitespace: true,
          message: '请输入合法字符'
        }]
      }, {
        fieldType: 'datePicker',
        fieldName: 'dateTime',
        label: '日志时间',
        placeholder: '请选择日志时间',
        format: 'YYYY-MM-DD HH:mm',
        showTime: {format: 'HH:mm'},
        initialValue: moment(),
        attrs: {
          disabledDate: self.disabledDate
        },
        rules: [{required: true, message: '请选择日志时间'}],
        resultFormat: 'YYYY-MM-DD HH:mm:ss'
      }, {
        fieldType: 'textarea',
        fieldName: 'content',
        label: '日志内容',
        placeholder: '请输入日志内容',
        initialValue: '',
        attrs: {
          autoSize: {minRows: 4}
        },
        rules: [{required: true, message: '请输入日志内容'}, {max: 1000, message: '至多可输入1000个字符'}]
      }]
    };

    // 事件日志添加发生地点
    if (type === 1) {
      _option.list.splice(3, 0, {
        fieldType: 'slot',
        slotName: 'address',
        label: '发生地点'
      });
    }
    return _option;
  }

};

export default {
  name: 'editDialog',
  components: {
    customForm
  },
  props: {
    formType: {
      type: Number,
      default: 1 // 1-事件 2-普通
    },
    formData: {
      type: Object,
      default: () => ({})
    },
    point: {
      type: Object,
      default: null
    },
    orgId: {
      type: String,
      default: ''
    },
    mapType: {
      type: String,
      default: 'BD'
    }
  },
  data() {
    return {
      visible: false,
      options: _customData.genOptions(this.formType, this),
      confirmLoading: false,
      isImportant: false,
      address: ''
    };
  },
  computed: {
    title() {
      return ['事件日志', '普通日志'][this.formType - 1];
    },
    lngLat() {
      return this.point ? this.point.lng + ',' + this.point.lat : ''
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.options = _customData.genOptions(this.formType, this);
        this.getAddress();
      }
    }
  },
  methods: {
    disabledDate(current) {
      return current && current > moment().endOf('day');
    },
    // 百度地图地址逆解析
    async getAddress() {
      if (!this.point || !mapConfig.coordTypeMap[this.mapType]) {
        this.address = '';
        return;
      }

      const res = await apiReverseGeoCoding(this.point.lat + ',' + this.point.lng, mapConfig.coordTypeMap[this.mapType]);
      if (res.status === 0) {
        this.address = res.result?.formatted_address ?? '';
      }
    },
    // 确认
    handleOk() {
      this.$refs.form.submit();
    },
    // 关闭
    handleClose() {
      this.$refs.form.reset();
      this.visible = false;
      this.isImportant = false;
    },
    // 取消
    handleCancel() {
      this.handleClose();
      // 事件日志取消移除marker
      if (this.formType === 1) {
        this.$emit('remove');
      }
    },
    // 添加日志
    async addLog(data) {
      try {
        this.confirmLoading = true;
        const log = await apiSaveDmLog({
          orgId: this.orgId,
          address: this.address,
          important: +this.isImportant,
          lngLat: this.lngLat,
          recordType: this.formType,
          ...data
        });
        this.$message.success('日志保存成功');
        this.handleClose();
        this.$emit('update');
        // 事件日志保存添加marker
        if (this.formType === 1) {
          this.$emit('save', log);
        }
      } catch (error) {
      } finally {
        this.confirmLoading = false;
      }
    }
  }
};
</script>

<style lang="less" scoped>
.form-checkbox {
  /deep/ .ant-checkbox {
    margin-right: 34px;
  }
}

.form-address {
  display: flex;
  flex-wrap: wrap;

  span:first-of-type {
    margin-right: 20px;
  }
}
</style>
