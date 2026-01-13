<template>
  <w-modal v-model="visible" title="设备商家详情" :width="1000" cancelText="关闭" okText="编辑" :confirmLoading="loading" @ok="handleOK">
    <w-info-form type="info" :model="form" :fields="fields" :layout="{ span: 12 }" :footer="null">
      <template #url>
        <w-tooltip placement="topLeft" class="hidden-word">
          <template slot="title">
            <a :href="form.url" target="_blank">{{ form.url || '--' }}</a>
          </template>
          <a :href="form.url" target="_blank">{{ form.url || '--' }}</a>
        </w-tooltip>
      </template>
      <template #email>
        <a :href="'mailto:' + form.email" target="_blank">{{ form.email || '--' }}</a>
      </template>
      <template #name>
        <w-tooltip placement="topLeft" class="hidden-word">
          <template slot="title">
            {{ form.name }}
          </template>
          {{ form.name }}
        </w-tooltip>
      </template>
      <template #address>
        <div>{{ form.address }}</div>
      </template>
      <template #remark>
        <div>{{ form.remark }}</div>
      </template>
    </w-info-form>
    <w-divider />
    <w-info-form type="info" :model="form" :fields="otherFields" :layout="{ span: 12, wrapperCol: { span: 16 }, labelCol: { span: 6 } }" :footer="null">
      <template #createUser>
        <w-tooltip placement="topLeft" class="hidden-word">
          <template slot="title">
            {{ form.createUser }}
          </template>
          {{ form.createUser }}
        </w-tooltip>
      </template>
      <template #updateUser>
        <w-tooltip placement="topLeft" class="hidden-word">
          <template slot="title">
            {{ form.updateUser }}
          </template>
          {{ form.updateUser }}
        </w-tooltip>
      </template>
      <template #createTime>
        {{form.createTime | formatTime }}
      </template>
      <template #updateTime>
        {{ form.updateTime | formatTime }}
      </template>
    </w-info-form>
  </w-modal>
</template>

<script>
import { fields } from './config';
import moment from 'moment';
import { getQueryById } from '@/api/deviceManagement';
export default {
  name: 'DetailModal',
  props: {
    modalInfo: {
      type: Object,
      default: () => {}
    }
  },
    filters: {
    formatTime(val) {
      return moment(val).format('YYYY-MM-DD HH:mm');
    }
  },
  data() {
    return {
      fields,
      visible: false,
      form: {},
      loading: false,
      otherFields: [
        {
          name: 'createUser',
          type: 'input',
          label: '创建人'
        },
        {
          name: 'createTime',
          type: 'input',
          label: '创建时间'
        },
        {
          name: 'updateUser',
          type: 'input',
          label: '最后编辑'
        },
        {
          name: 'updateTime',
          type: 'datetime',
          label: '编辑时间'
        }
      ]
    };
  },
  watch: {
    visible(val) {
      if (val) {
        if (this.modalInfo.id) {
          this.getInfo(this.modalInfo.id);
        } else {
          this.form = {};
        }
      }
    }
  },
  methods: {
    hide() {
      this.visible = false;
    },
    show() {
      this.visible = true;
    },
    handleOK() {
      this.hide();
      this.$emit('edit', this.form);
    },
    async getInfo(id) {
      try {
        this.loading = true;
              let params={ entityId: id };
             const { resultData } = await getQueryById(params);
        const type = resultData.type === 1 ? '生产厂商' : resultData.type === 2 ? '供应商' : resultData.type === 3 ? '供应商/生产厂商' : '';
        this.form = { ...resultData, property: type };
      } catch (error) {
        console.log('error', error);
        this.form = {};
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>
<style lang="less" scoped>
/deep/ .wpg-form-item {
  margin-bottom: 0;
  .wpg-form-item-children {
    p {
      margin-bottom: 0;
    }
  }
  .wpg-form-item-text {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
  .hidden-word {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    display: block;
  }
}
</style>
