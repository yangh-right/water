<!-- 添加班组 -->
<template>
  <w-modal
    class="add-model"
    destroyOnClose
    :visible="visible"
    :title="title"
    :footer="null"
    :maskClosable="false"
    @cancel="handleCancel"
  >
    <w-info-form
      :fields="modelFields"
      :model="AddForm"
      :layout="layout"
      :loading="loading"
      @submit="handleSubmit"
      @cancel="handleCancel"
      v-if="!showDetails"
    >
      <template #waterPlantId="{ form }">
        <factory-select
          v-model="form.waterPlantId"
          :disabled="factoryDisabled"
          @change="factoryChange"
        ></factory-select>
      </template>
    </w-info-form>
    <w-info-form
      v-else
      type="info"
      :fields="modelFields"
      :model="AddForm"
      :layout="layout"
      :footer="null"
    >
      <template #waterPlantId="{ form }">
        <span>{{ form.waterPlantName }}</span>
      </template>
    </w-info-form>
  </w-modal>
</template>

<script>
import FactorySelect from '@/components/factory-select/index';
import { setTree } from '@/utils/util';
import { without, concat, difference } from 'lodash-es';

export default {
  components: { FactorySelect },
  props: {
    title: {
      type: String,
      default: ''
    },
    AddForm: {
      type: Object,
      default: () => {}
    },
    modelType: {
      type: String,
      default: 'add'
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const checkName = (rule, value, callback) => {
      let flag = this.nameList.findIndex(item => item === value);
      if (!value) {
        callback(new Error('请填写班组名称'));
      } else if (flag > -1) {
        callback(new Error('班组名称重复'));
      } else {
        callback();
      }
    };
    return {
      layout: { span: 24, labelCol: { span: 5 }, wrapperCol: { span: 19 }, colon: true },
      loading: false, //确定按钮时显示等待
      nameList: [],
      peopleList: [],
      factoryDisabled: false, //水厂是否可已切换
      modelFields: [
        {
          submit: true,
          required: true,
          colon: true,
          name: 'waterPlantId',
          label: '污水厂名称',
          type: 'input'
        },
        {
          submit: true,
          required: true,
          colon: true,
          name: 'name',
          label: '班组名称',
          type: 'input',
          placeholder: '请输入班组名称',
          rules: [{ required: true, trigger: 'change', validator: checkName }]
        },
        {
          submit: true,
          required: true,
          colon: true,
          name: 'crewName',
          label: '班组人员',
          type: 'input',
          placeholder: '请输入班组名称',
          rules: [{ required: true, trigger: 'change', validator: checkName }]
        },
        {
          submit: true,
          colon: true,
          name: 'remark',
          label: '备注',
          type: 'input'
        }
      ]
    };
  },
  computed: {
    showDetails() {
      return this.modelType === 'check';
    }
  },
  watch: {
    async visible(val) {
      if (val && this.modelType === 'edit') {
        this.factoryDisabled = true;
        await this.nameChange(this.AddForm.waterPlantId, this.AddForm.name);
        this.getPeopleTrees(this.AddForm.crews);
      } else {
        //this.modelFields[2].attrs['tree-data'] = [];
        this.factoryDisabled = false;
      }
    }
  },
  methods: {
    async factoryChange(val) {
      await this.nameChange(val);
      this.getPeopleTrees();
    },
    //获取列表中已存在的班组名称和人员
    async nameChange(val, name = '') {
      this.nameList = [];
      this.peopleList = [];
      let params = {
        delFlag: 0,
        orderBy: '',
        pageFlag: true,
        tenantId: '',
        validFlag: '',
        nameLike: '',
        waterPlantId: val,
        currentPage: 1,
        pageSize: 50
      };
      let { resultData } = await this.$http.post('/team/list', params);
      resultData.records.forEach(item => {
        this.nameList.push(item.name);
        let arr = item.crew.split(',');
        if (item.validFlag) this.peopleList = concat(this.peopleList, arr);
      });
      this.nameList = without(this.nameList, name);
    },
    // 获取用户树
    async getPeopleTrees(people = []) {
      let { resultData } = await this.$http.post(
        '/userCenterApi/orgClient/getOrgUserTreeOnlyUserId',
        {
          keyword: '',
          userRoleIds: []
        }
      );
      this.peopleList = difference(this.peopleList, people);
      resultData = this.defaultPeopleTrees(resultData, this.peopleList);
      setTree(resultData, true);
      //this.modelFields[2].attrs['tree-data'] = resultData;
    },

    //对已选择的用户进行禁选
    defaultPeopleTrees(trees, people) {
      trees.forEach(item => {
        let index = people.findIndex(v => v === item.id);
        if (index > -1) {
          item.checkable = false;
        }
        this.defaultPeopleTrees(item.children, people);
      });
      return trees;
    },

    async handleSubmit() {
      this.loading = true;
      let list = this.AddForm.crews;
      this.AddForm.crews = [];
      list.forEach(item => {
        item = item.replace('-', ',');
        this.AddForm.crews.push(item);
      });
      if (this.modelType === 'add') {
        try {
          await this.$http.post('/team/add', {
            ...this.AddForm
          });
          this.$message.success('新增成功');
          this.loading = false;
          this.$emit('update:visible', false);
          // 调用父组件方法
          this.$parent.handleSearch();
        } catch {
          this.loading = false;
        }
      } else {
        try {
          await this.$http.put('/team', this.AddForm);
          this.$message.success('修改成功');
          this.loading = false;
          this.$emit('update:visible', false);
          // 调用父组件方法
          this.$parent.handleSearch();
        } catch {
          this.loading = false;
        }
      }
    },
    handleCancel() {
      this.loading = false;
      this.$emit('update:visible', false);
    }
  }
};
</script>
<style lang="less" scoped>
.add-model {
  /deep/.wpg-select-tree li .wpg-select-tree-node-content-wrapper-unselectable {
    color: #999;
  }
}
</style>
