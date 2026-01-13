/** * @Author lmz * @Date 2021-01-11 09:30:22 Monday * @Description: 下控表格 */
<template>
  <div class="set-log">
    <w-popover placement="bottomRight" arrow-point-at-center trigger="click">
      <template slot="content">
        <w-table
          :columns="popColumns"
          class="pop-table"
          :data-source="setList"
          :pagination="false"
          :scroll="{ y: '350px' }"
          :rowKey="record => record.code"
        >
          <template slot="index" slot-scope="text, record, idx">{{ idx + 1 }}</template>
          <template slot="unit" slot-scope="text">({{ text || '-' }})</template>
          <template slot="pv" slot-scope="text">
            <span class="supply-text-primary">{{ text }}</span>
          </template>
          <template slot="action" slot-scope="text, record">
            <span class="supply-text-primary log-set" @click="showModal(record)">下控</span>
          </template>
        </w-table>
      </template>
      <w-button v-if="type === 'btn'" size="small" class="supply-float-right" type="primary">{{
        label
      }}</w-button>
      <span v-else class="supply-float-right supply-text-primary cursor">{{ label }}</span>
    </w-popover>

    <!-- 下控弹框 -->
    <w-modal v-if="setModalShow" v-model="setModalShow" title="远程下控" :footer="false">
      <div v-if="modalData && modalData.name" class="form-wrapper">
        <w-form
          :form="form"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 12 }"
          class="query-form"
          @submit="handleSubmit"
        >
          <w-form-item label="参数名称">
            <w-input autocomplete="off" :value="modalData.name" disabled />
          </w-form-item>
          <w-form-item :label="`当前值(${modalData.unit || '-'})`">
            <w-input
              v-decorator.trim="[
                'pv',
                {
                  initialValue: modalData.pv,
                  rules: [
                    {
                      required: true,
                      message: '请录入',
                      whitespace: true,
                      validator: (a, b, c) => {
                        return b.replace(/^\s+|\s+$/g, '') !== '';
                      }
                    }
                  ]
                }
              ]"
              autocomplete="off"
            />
          </w-form-item>
          <w-form-item :wrapper-col="{ span: 24 }">
            <w-button
              class="supply-float-right"
              style="margin-left: 5px"
              @click="setModalShow = false"
              >取消</w-button
            >
            <w-button class="supply-float-right" type="primary" html-type="submit">确认</w-button>
          </w-form-item>
        </w-form>
      </div>
    </w-modal>

    <!-- 短信验证弹框 -->
    <w-modal v-if="setMessageShow" v-model="setMessageShow" title="远程下控" :footer="false">
      <div class="form-wrapper">
        <w-form
          :form="uForm"
          :label-col="{ span: 7 }"
          :wrapper-col="{ span: 17 }"
          class="query-form"
          @submit="confirmCode"
        >
          <w-form-item>
            请输入 {{ phone.slice(0, 4) }}****{{ phone.slice(7, 11) }} 收到的验证码
          </w-form-item>
          <w-form-item label="请输入验证码">
            <w-input-search
              v-decorator.trim="[
                'code',
                {
                  rules: [
                    {
                      required: true,
                      message: '请输入'
                    }
                  ]
                }
              ]"
              class="msg-input"
              autocomplete="off"
              @search="getShortMsg"
            >
              <w-button slot="enterButton">
                <span class="supply-text-primary supply-text-xs">获取验证码</span>
              </w-button>
            </w-input-search>
          </w-form-item>
          <w-form-item :wrapper-col="{ span: 24 }">
            <w-button
              class="supply-float-right"
              style="margin-left: 5px"
              @click="setMessageShow = false"
              >取消</w-button
            >
            <w-button class="supply-float-right" type="primary" html-type="submit">确认</w-button>
          </w-form-item>
        </w-form>
      </div>
    </w-modal>
  </div>
</template>

<script>
import {
  realListSet, // 下控表格
  remoteCtrl, // 监测量下控
  getUserInfoByToken, // 查手机号
  getCode, // 验证码
  checkCode
} from '@/api/runMonitor';

import { getSysParamByCode } from '@/api/index';

const popColumns = [
  {
    title: '序号',
    ellipsis: true,
    dataIndex: 'index',
    scopedSlots: { customRender: 'index' }
  },
  {
    title: '数据项',
    ellipsis: true,
    dataIndex: 'name',
    width: 70
  },
  {
    title: '当前值',
    ellipsis: true,
    dataIndex: 'pv',
    scopedSlots: { customRender: 'pv' },
    width: 70
  },
  {
    title: '单位',
    ellipsis: true,
    dataIndex: 'unit',
    scopedSlots: { customRender: 'unit' }
  },
  {
    title: '操作',
    ellipsis: true,
    dataIndex: 'action',
    scopedSlots: { customRender: 'action' }
  }
];
export default {
  name: 'SetLog',
  props: {
    devId: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'text'
    },
    label: {
      type: String,
      default: '下控'
    }
  },
  data() {
    return {
      popColumns,
      setList: [],
      setModalShow: false,
      modalData: null,
      setMessageShow: false,
      phone: '',
      form: this.$form.createForm(this, { name: 'setForm' }),
      uForm: this.$form.createForm(this, { name: 'getForm' })
    };
  },
  watch: {
    devId(val) {
      if (val) {
        this.getSetList();
      }
    }
  },
  mounted() {
    this.getPhone();
  },
  methods: {
    /* 获取短信验证码 */
    getShortMsg() {
      getCode({ phone: this.phone }).then(res => {
        if (res.status === 'complete') this.$message.success('发送成功');
      });
    },
    confirmCode(e) {
      e.preventDefault();
      this.uForm.validateFields((err, values) => {
        if (!err) {
          let params = {
            code: values.code,
            phone: this.phone
          };
          checkCode(params).then(res => {
            if (res.status === 'complete') {
              this.setModalShow = true;
              this.setMessageShow = false;
              this.$message.success('验证成功');
            }
          });
        }
      });
    },
    getPhone() {
      getUserInfoByToken().then(res => {
        let {
          status,
          resultData: { phone }
        } = res;
        if (status === 'complete') {
          this.phone = phone;
        }
      });
    },
    /* 下控表格 */
    getSetList() {
      // realListSet({ id: 'adaada11zza' }).then((res) => {
      realListSet({ id: this.devId }).then(res => {
        let { status, resultData } = res;
        if (status === 'complete') {
          this.setList = resultData;
        }
      });
    },
    /* 点击远程下控按钮 */
    showModal(record) {
      getSysParamByCode('control_phone_verification').then(res => {
        if (res.resultData === 'true') {
          this.setMessageShow = true;
          this.modalData = record;
        } else {
          this.setMessageShow = false;
          this.setModalShow = true;
          this.modalData = record;
        }
      });
    },
    /* 询问是否提交下控操作 */
    handleSubmit(e) {
      e.preventDefault();
      this.form.validateFields((err, values) => {
        if (!err) {
          this.$confirm({
            title: '提示',
            content: '确认进行此操作? ',
            onOk: () => {
              let {
                devId,
                modalData: { code }
              } = this;
              let { pv } = values;
              let params = {
                deviceId: devId,
                values: {}
              };
              params.values[code] = pv;
              remoteCtrl(params).then(res => {
                let { status } = res;
                if (status === 'complete') {
                  this.$message.success('下控成功');
                  this.getSetList();
                  this.setModalShow = false;
                }
              });
            }
          });
        }
      });
    }
  }
};
</script>

<style lang="less" scoped>
.set-log {
  display: inline-block;
}
.cursor {
  cursor: pointer;
}
.form-wrapper {
  .msg-input {
    /deep/ .wpg-input-group-addon {
      background-color: transparent;
      .wpg-btn {
        border-left: none;
      }
    }
    /deep/ .wpg-input {
      border-right: none;
    }
  }
  .wpg-form-item {
    margin: 12px;
    padding-left: 10px;
  }
}
</style>
<style lang="less">
.pop-table {
  width: 330px;
  .log-set {
    cursor: pointer;
  }
}
</style>
