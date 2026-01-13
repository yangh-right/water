<!--
  @desc：角色与工单类型配置
-->
<template>
  <div class="form-wrapper">
    <w-form-model ref="form" :model="form" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
      <slot name="prev" :form="form" />
      <template v-for="(item, idx) in form.domains">
        <w-row :key="item.key + '-' + idx" :gutter="[12]">
          <w-col :span="7">
            <w-form-model-item
              :ref="`${form.domains[idx].key}-roleId`"
              required
              label="角色"
              :prop="`domains[${idx}].roleId`"
              :rules="{
                required: true,
                message: '角色不能为空!',
                trigger: 'change'
              }"
            >
              <w-info-select
                v-model="item.roleId"
                :options="roleList"
                placeholder="选择角色"
                :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
              />
            </w-form-model-item>
          </w-col>
          <w-col :span="7">
            <w-form-model-item
              required
              label="工单类型"
              :prop="`domains[${idx}].ticketType`"
              :rules="[
                {
                  required: true,
                  message: '工单类型不能为空!',
                  trigger: 'change'
                }
              ]"
            >
              <w-tree
                v-model="item.ticketType"
                multiple
                checkable
                :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                :tree-data="ticketList"
                :replaceFields="{
                  children: 'child',
                  title: 'name',
                  key: 'code'
                }"
              >
              </w-tree>
            </w-form-model-item>
          </w-col>

          <w-col :span="3">
            <w-form-model-item :wrapper-col="{ span: 24 }">
              <w-button
                v-if="form.domains.length > 1"
                type="link"
                size="small"
                icon="delete"
                class="wfc-alarm remove-button"
                @click="handleRemoveField(idx, item)"
              >
                删除
              </w-button>
              <w-button
                v-if="form.domains.length === idx + 1"
                type="link"
                size="small"
                icon="plus"
                class="add-button"
                @click="handleAddField"
              >
                添加
              </w-button>
            </w-form-model-item>
          </w-col>
        </w-row>
      </template>
      <slot />
    </w-form-model>
    <div class="footer">
      <w-button type="primary" :loading="loading" @click="handleSubmit">提交</w-button>
    </div>
  </div>
</template>

<script>
import CommonMixin from '../mixins/common-mixin';

export default {
  name: 'RoleConfigTicketType',
  mixins: [CommonMixin],
  props: {
    form: {
      type: Object
    }
  },
  data() {
    return {
      roleList: [],
      ticketList: []
    };
  },
  watch: {
    waterPlantId: {
      handler(val) {
        if (val) {
          this.getRoleList();
          this.getTicketList();
          this.initForm();
        }
      },
      immediate: true
    }
  },
  methods: {
    initForm() {
      if (this.form.domains.length === 0) {
        this.handleAddField();
      } else {
        this.form.domains.forEach((i) => {
          i.key = i.key ?? Date.now() + String((Math.random() * 1000).toFixed(0));
        });
      }
    },
    // 查询角色列表
    async getRoleList() {
      try {
        const { resultData } = await this.$axios.get(
          '/waterwork-sys-api/TicketDynamicConfigurationController/queryAllRoles'
        );
        this.roleList = Object.freeze(
          resultData.map((i) => ({
            key: i.id,
            value: i.id,
            label: i.roleName
          }))
        );
      } catch (error) {
        this.roleList = Object.freeze([]);
      }
    },
    // 查询工单类型列表
    async getTicketList() {
      try {
        const { resultData } = await this.$axios.get('/waterwork-ticket-api/ticketOutWork/allTicketType');
        this.ticketList = Object.freeze(resultData);
      } catch (error) {
        this.ticketList = Object.freeze([]);
      }
    },
    // 新增字段
    handleAddField() {
      this.form.domains.push({
        key: Date.now(),
        roleId: undefined
      });
    },
    ticketTypeChange(value, label, extra) {
      console.log(value);
      console.log(label);
      console.log(extra);
    },
    handleSubmit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const list = this.form.domains.map((i) => ({
            ...i,
            waterPlantId: this.waterPlantId
          }));
          this.$emit('submit', list);
        }
      });
    }
  }
};
</script>

<style lang="less" scoped>
.form-wrapper {
  .footer {
    flex: 0 0 54px;
    text-align: right;
    padding: 0 24px;
    margin-top: 24px;
  }
}
</style>
