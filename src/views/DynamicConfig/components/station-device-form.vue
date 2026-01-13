<!--
  @author: zhangxiang
  @date: 2021-08-28 18:25:54
  @desc：设施-设备
-->
<template>
  <div class="form-wrapper">
    <w-form-model ref="form" :model="form" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
      <template v-for="(item, idx) in form.domains">
        <w-row :key="item.key" :gutter="[12]">
          <w-col :span="7">
            <w-form-model-item
              :ref="`${form.domains[idx].key}-facilitiesId`"
              required
              label="设施选择"
              :prop="`domains[${idx}].facilitiesId`"
              :rules="{
                required: true,
                message: '设施不能为空!',
                trigger: 'change'
              }"
            >
              <w-info-tree-select
                v-model="item.facilitiesId"
                :tree-data="stationTree"
                placeholder="选择设施"
                :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                @change="handleStationChange($event, idx)"
              />
            </w-form-model-item>
          </w-col>
          <w-col :span="7">
            <w-form-model-item
              :ref="`${form.domains[idx].key}-deviceId`"
              :prop="`domains[${idx}].deviceId`"
              :rules="{
                required: true,
                message: '设备不能为空!',
                trigger: 'change'
              }"
              required
              label="设备选择"
            >
              <w-info-select
                v-model="form.domains[idx].deviceId"
                placeholder="选择设备"
                :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                :options="deviceMap[form.domains[idx].facilitiesId]"
              />
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
  name: 'StationDeviceForm',
  mixins: [CommonMixin],
  data() {
    return {
      deviceMap: {}
    };
  },
  watch: {
    waterPlantId: {
      handler(val) {
        if (val) {
          this.getStationTree();
          this.initForm();
        }
      },
      immediate: true
    }
  },
  methods: {
    initForm() {
      if (this.form.domains.length) {
        for (let i = 0; i < this.form.domains.length; i++) {
          const { facilitiesId } = this.form.domains[i];
          this.form.domains[i].sort = this.form.domains[i].sort ?? i;
          if (facilitiesId) {
            this.handleStationChange(facilitiesId, i, false);
          }
        }
      } else {
        this.handleAddField();
      }
    },
    // 新增字段
    handleAddField() {
      this.form.domains.push({
        key: Date.now(),
        facilitiesId: undefined,
        deviceId: undefined,
        sort: this.form.domains.length
      });
    },
    /**
     * 设施更改, 获取该设施下的设备
     */
    async handleStationChange(facilitiesId, idx, reset = true) {
      if (!facilitiesId) {
        return;
      }
      if (reset) {
        this.form.domains[idx].deviceId = undefined;
      }
      try {
        const { resultData } = await this.$axios.get('/waterwork-device-api/Facilities/queryConIndustryDevice', {
          params: {
            entityId: facilitiesId
          }
        });
        const list = resultData.deviceEntities.map((i) => {
          return {
            key: i.id,
            value: i.deviceId,
            label: i.deviceName
          };
        });
        this.$set(this.deviceMap, facilitiesId, list);
      } catch (error) {
        console.log(error);
        this.$set(this.deviceMap, facilitiesId, []);
      }
    },
    handleSubmit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const list = this.form.domains.map((i) => ({
            key: i.key,
            facilitiesId: i.facilitiesId,
            deviceId: i.deviceId,
            sort: i.sort
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
