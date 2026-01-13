<!--
  @desc：消息模板配置
-->
<template>
  <w-info-form
    :fields="fields"
    :model="form"
    @submit="handleSumit"
    :layout="{ span: 12, labelCol: { span: 8 }, wrapperCol: { span: 16 } }"
  />
</template>

<script>
import { mapGetters } from 'vuex';
// import getServeConfig from '@/config/serve.config';

export default {
  name: 'WaterPlantConfig',
  props: {
    form: {
      type: Object,
      default: () => ({})
    },
    waterPlantId: {
      type: String
    }
  },
  data() {
    return {
      fields: [
        {
          name: 'scyjCode',
          label: '生产药剂阈值不足提醒模板',
          type: 'input',
          required: true,
          span: 12
        },
        {
          name: 'scyjRoles',
          label: '推送角色',
          type: 'select',
          options: [],
          required: true,
          span: 10,
          attrs: {
            mode: 'multiple'
          }
        },
        {
          name: 'wlCode',
          label: '物料阈值不足提醒模板',
          type: 'input',
          required: true,
          span: 12
        },
        {
          name: 'wlRoles',
          label: '推送角色',
          type: 'select',
          options: [],
          required: true,
          span: 10,
          attrs: {
            mode: 'multiple'
          }
        },
        {
          name: 'tzggCode',
          label: '通知公告模板',
          type: 'input',
          required: true,
          span: 12
        }
      ]
    };
  },

  computed: {
    currentPlant() {
      return this.waterPlantsList.find(i => i.id === this.waterPlantId);
    },
    ...mapGetters('dictionary', ['waterPlantsList'])
  },
  mounted() {},
  activated() {
    this.initForm();
  },
  methods: {
    async getTemplateList() {
      let res = await this.$axios.post(
        `${getServeConfig().JOIN_URL}/msgCenterApi/msg/template/page`,
        {
          current: 1,
          size: 20,
          keyword: '',
          channelName: 'client'
        }
      );
      console.log(res);
    },
    async getRolesList() {
      let res = await this.$http(`waterwork-sys-api/SysUser/getRolesByWaterPlant`, {
        params: {
          waterPlantId: this.waterPlantId
        }
      });
      this.fields[1].options = res?.resultData.map(v => ({ label: v.roleName, value: v.id }));
      this.fields[3].options = res?.resultData.map(v => ({ label: v.roleName, value: v.id }));
      console.log(res);
    },
    initForm() {
      // this.getTemplateList();
      this.getRolesList();
    },
    handleSumit() {
      let data = {
        tzggCode: this.form.tzggCode,
        scyjCode: this.form.scyjCode,
        scyjRoles: this.form.scyjRoles,
        wlCode: this.form.wlCode,
        wlRoles: this.form.wlRoles
      };
      this.$emit('submit', data);
    }
  }
};
</script>

<style lang="less" scoped>
/deep/ .wpg-form-item.label-auto .wpg-form-item-label {
  flex-basis: 120px;
}
</style>
