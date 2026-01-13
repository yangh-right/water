<template>
  <div>
    <w-modal :title="title" :visible="visible" @ok="handleOk" @cancel="handleCancel">
      <w-form-model
        ref="form"
        :model="form"
        :rules="rules"
        :colon="true"
        :labelCol="{ span: 5 }"
        :wrapperCol="{ span: 19 }"
        :class="mode === 'Composition' ? 'composition-form' : ''"
      >
        <w-form-model-item
          v-for="item in itemList"
          :key="item.prop"
          :label="item.label"
          :prop="item.prop"
        >
          <factory-select
            v-if="item.type === 'factory-select'"
            v-model="form.waterPlantId"
            v-bind="item.attrs"
            @change="waterPlantChange"
          ></factory-select>
          <component
            v-else
            :is="`w-${item.type}`"
            v-model="form[item.prop]"
            :placeholder="item.placeholder"
            v-bind="item.attrs"
            v-on="item.listeners"
            style="width: 100%"
          ></component>
        </w-form-model-item>
      </w-form-model>
    </w-modal>
  </div>
</template>

<script>
import FactorySelect from '@/components/factory-select';
import { formDict, rulesDict, itemDict, apiDict } from '../components/config';
import { cloneDeep } from 'lodash-es';
export default {
  name: 'AddModal',
  components: { FactorySelect },
  props: {
    // mode: Point, Composition, Vector, Preservatives
    mode: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    visible: {
      type: Boolean,
      default: false
    },
    outerForm: {
      type: Object,
      default: () => {}
    },
    outerList: {
      type: Array,
      default: () => []
    },
    waterPlantId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      form: formDict[this.mode],
      rules: cloneDeep(rulesDict[this.mode]),
      itemList: itemDict[this.mode],
      addrDict: apiDict[this.mode],
      list: []
    };
  },
  computed: {
    isEdit: function() {
      return this.title.slice(0, 2) === '编辑';
    }
  },
  watch: {
    async visible(val) {
      if (!val) return;
      // 设置form与list
      if (this.isEdit) {
        this.form = cloneDeep(this.outerForm);
      } else {
        this.form.waterPlantId = this.waterPlantId;
      }
      this.list = cloneDeep(this.outerList);
      // 设置select组件的选项
      await this.getOptions();
      // 补充验证规则
      this.rules = cloneDeep(rulesDict[this.mode]);
      this.setValidator();
    }
  },
  methods: {
    async waterPlantChange() {
      if (['Point', 'Composition'].includes(this.mode)) {
        // 重名校验，只限于相同水厂下的同名
        const { resultData } =
          this.mode === 'Point'
            ? await this.$http.post('/samplingPoint/list', this.form)
            : await this.$http.post('/indexCombination/list', {
                waterPlantId: this.form.waterPlantId,
                pageFlag: false
              });
        this.list = resultData?.records || [];
        this.$refs.form.validateField('name');
        // 切换水厂时置空采样地点或构筑物
        this.mode === 'Point' ? (this.form.locationDict = null) : (this.form.placeId = '');
      }
      await this.getOptions();
    },
    async handleOk() {
      let cb = await this.$refs.form.validate();
      if (cb) {
        this.isEdit ? await this.handleEdit() : await this.handleAdd();
        this.handleCancel();
      }
    },
    async handleAdd() {
      await this.$http.post(
        this.addrDict.add,
        this.mode === 'Point' ? { ...this.form, ...JSON.parse(this.form.locationDict) } : this.form
      );
    },
    async handleEdit() {
      await this.$http.post(
        this.addrDict.edit,
        this.mode === 'Point' ? { ...this.form, ...JSON.parse(this.form.locationDict) } : this.form
      );
    },
    handleCancel() {
      this.rules = {};
      this.$refs.form.resetFields();
      Object.keys(this.form).forEach(key => {
        this.form[key] = undefined;
      });
      setTimeout(() => {
        this.$refs.form.clearValidate();
        this.$emit('update:visible', false);
        this.$emit('getInit');
      }, 100);
    },

    // 字典与选项获取
    async getDict(code) {
      let { resultData } = await this.$http.get(`/sysDict/sysDictListByCode/${code}`);
      let res = resultData.map(v => {
        return { title: v.dictName, value: v.dictValue };
      });
      return res;
    },
    async getOptions() {
      // 采样点
      if (this.mode === 'Point') {
        let { resultData } = await this.$http.get(
          `/place/getStructureByStationId?waterPlantId=${this.form.waterPlantId}`
        );
        this.$findField('locationDict').attrs.treeData = this.filterTree(resultData);
      }
      // 指标组合
      else if (this.mode === 'Composition') {
        let list = [];
        if (this.form.waterPlantId !== undefined && this.form.waterPlantId !== '') {
          let { resultData } = await this.$http.post(`/place/list`, {
            waterPlantId: this.form.waterPlantId,
            pageFlag: false
          });
          list = resultData.records.map(v => {
            return { title: v.name, value: v.id };
          });
        }
        list.unshift({
          title: '不限',
          value: ''
        });
        if (this.form.waterPlantId === undefined || this.form.waterPlantId === '')
          this.form.placeId = '';
        this.$findField('placeId').attrs.options = list;
        this.$findField('cycle').attrs.options = await this.getDict('purification_test_cycle');
      }
      // 采样容器
      else if (this.mode === 'Vector') {
        this.$findField('containerUnit').attrs.options = await this.getDict(
          'purification_container_unit'
        );
        this.$findField('volumeUnit').attrs.options = await this.getDict(
          'purification_volume_unit'
        );
      }
      // 保存剂
      else {
        this.$findField('unit').attrs.options = await this.getDict('purification_preserve_unit');
      }
    },

    // 验证规则
    setValidator() {
      // 采样容器的相同容器验证
      if (this.mode === 'Vector') {
        this.rules.name.push({
          validator: this.sameVectorValidate,
          trigger: ['blur', 'change']
        });
        this.rules.volume.push({
          validator: this.sameVectorValidate,
          trigger: ['blur', 'change']
        });
        this.rules.volumeUnit.push({
          validator: this.sameVectorValidate,
          trigger: ['blur', 'change']
        });
      }
      // 指标组合
      else if (this.mode === 'Composition') {
        this.rules.name.push({
          validator: this.sameNameValidate,
          trigger: ['blur', 'change']
        });
        this.rules.placeId.push({
          validator: this.waterPlantIdValidate,
          trigger: ['blur', 'change']
        });
      }
      // 采样点、保存剂的同名验证
      else {
        this.rules.name.push({
          validator: this.sameNameValidate,
          trigger: ['blur', 'change']
        });
      }
    },
    async sameNameValidate(rule, value, cb) {
      // 编辑时对自身不做验证
      if (this.isEdit && value === this.outerForm.name) {
        cb();
        return;
      }
      // 重名验证
      let sameList = this.list.filter(item => item.name === value);
      if (sameList.length) cb(new Error(`${this.$findField(rule.field).label}不可重复`));
      else cb();
    },
    sameVectorValidate(rule, value, cb) {
      // 编辑时对自身不做验证
      if (
        this.isEdit &&
        this.form.name === this.outerForm.name &&
        this.form.volume === this.outerForm.volume &&
        this.form.volumeUnit === this.outerForm.volumeUnit
      ) {
        cb();
        return;
      }
      // 容器名称+容积+容积单位不能重复
      let sameList = this.list.filter(
        item =>
          item.name === this.form.name &&
          item.volume === this.form.volume &&
          item.volumeUnit === this.form.volumeUnit
      );
      if (sameList.length) cb(new Error('该容器已存在，请不要重复添加'));
      else {
        // 清空其他两项的验证提示
        this.$refs.form.clearValidate(['name', 'volume', 'volumeUnit']);
        cb();
      }
    },
    waterPlantIdValidate(rule, value, cb) {
      // 水厂为不限时，构筑物只能为不限，如选择具体构筑物，需选择对应水厂
      if (this.form.waterPlantId === '' && value !== '') cb(new Error('请先选择污水厂'));
      else cb();
    },

    filterTree(treeData) {
      let treeRes = [];
      treeData.forEach(v => {
        if (v.type !== 2) {
          treeRes.push({
            title: v.name,
            value: JSON.stringify({ locationId: v.id, locationType: v.type }),
            key: v.id,
            selectable: v.selectable,
            children: v.children && v.children.length ? this.filterTree(v.children) : []
          });
        }
      });
      return treeRes;
    },
    $findField(key) {
      return this.itemList.filter(v => v.prop === key)[0];
    }
  }
};
</script>

<style lang="less" scoped>
.composition-form {
  /deep/ .wpg-form-item-label {
    > *::before {
      display: inline-block;
      margin-right: 4px;
      color: #f64357;
      font-size: 14px;
      line-height: 1;
      content: '*';
    }
  }
}
</style>
