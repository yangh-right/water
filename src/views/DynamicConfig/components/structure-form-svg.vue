<template>
  <div class="form-wrapper">
    <w-form-model ref="form" :model="form" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
      <template v-for="(item, idx) in form.domains">
        <w-row :key="item.key + '-' + idx" :gutter="[12]" class="structure">
          <w-col :span="7">
            <w-form-model-item
              :ref="`${form.domains[idx].key}-placeId`"
              required
              label="构筑物选择"
              :prop="`domains[${idx}].placeId`"
              :rules="{
                required: true,
                message: '构筑物不能为空!',
                trigger: 'change'
              }"
            >
              <w-info-select
                v-model="item.placeId"
                :options="structureList"
                placeholder="选择构筑物"
                :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                @change="changeStructure(item.placeId, idx)"
              />
            </w-form-model-item>
          </w-col>
          <!-- <w-col :span="7">
            <w-form-model-item
              required
              label="构筑物编码"
              :prop="`domains[${idx}].structureCode`"
              :rules="{
                required: true,
                message: '构筑物编码不能为空!'
              }"
            >
              <w-input v-model="item.structureCode" :max-length="32" placeholder="请填写" />
            </w-form-model-item>
          </w-col> -->
          <w-col :span="6">
            <w-form-model-item :wrapper-col="{ span: 24 }">
              <w-button type="link" size="small" icon="copy" class="wfc-success copy-button" @click="copyName(item)">
                复制名称
              </w-button>
              <w-button
                v-if="form.domains.length > 1"
                type="link"
                size="small"
                icon="delete"
                class="wfc-alarm remove-button"
                @click="handleRemoveField(idx, item)"
              >
                删除构筑物
              </w-button>
              <w-button
                v-if="form.domains.length === idx + 1"
                type="link"
                size="small"
                icon="plus"
                class="add-button"
                @click="handleAddField"
              >
                添加构筑物
              </w-button>
            </w-form-model-item>
          </w-col>
        </w-row>
        <template v-for="(stru, index) in item.strus">
          <w-row :key="stru.key + '-' + index" :gutter="[12]">
            <slot name="extra" :item="stru" :idx="idx" :index="index" />
          </w-row>
        </template>
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
  name: 'StructureForm',
  mixins: [CommonMixin],
  props: {
    form: {
      type: Object
    }
  },
  data() {
    return {
      structureList: []
    };
  },
  watch: {
    waterPlantId: {
      handler(val) {
        if (val) {
          this.getStructureList();
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
    // 查询构筑物
    async getStructureList() {
      try {
        const { resultData } = await this.$axios.post('/waterwork-device-api/Structure/list', {
          waterPlantId: this.waterPlantId,
          pageFlag: false
        });
        this.structureList = Object.freeze(
          resultData.map((i) => ({
            key: i.id,
            value: i.id,
            label: i.structureName
          }))
        );
      } catch (error) {
        this.structureList = Object.freeze([]);
      }
    },

    // 新增字段
    handleAddField() {
      this.form.domains.push({
        key: Date.now(),
        placeId: undefined,
        structureName: undefined,
        strus: [
          {
            key: `${Date.now()}001`,
            svgName: ''
          }
        ]
      });
    },
    handleSubmit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const list = this.form.domains.map((i) => {
            i.structureName = this.structureList.filter((item) => i.placeId === item.value)[0].label;
            return i;
          });
          // 判断是否有重复构筑物
          let s = this.form.domains.map((item) => item.structureName);
          let isRepeat = new Set(s).size === s.length;
          if (isRepeat) {
            this.$emit('submit', list);
          } else {
            this.$message.warn('构筑物不能重复！');
          }
        }
      });
    },
    changeStructure(val, idx) {
      this.form.domains[idx].placeId = val;
      this.form.domains[idx].structureName = this.structureList.filter((item) => item.value === val)[0].label;
    },
    copyName(item) {
      let text = item?.structureName;
      if (!text) {
        this.$message.error('复制失败,请选择一个构筑物！');
        return false;
      }
      let oInput = document.createElement('input');
      oInput.value = text;
      document.body.appendChild(oInput);
      oInput.select();
      document.execCommand('Copy');
      this.$message.success('复制成功！');
      oInput.remove();
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
.structure {
  margin-top: 20px;
}
</style>
