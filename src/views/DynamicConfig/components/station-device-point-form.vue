<!--
  @author: zhangxiang
  @date: 2021-08-27 16:18:22
  @desc：设施-设备-监测量 选择
-->
<template>
  <div class="form-wrapper">
    <w-form-model ref="form" :model="form" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
      <slot name="prev" :form="form" />
      <template v-for="(item, idx) in form.domains">
        <w-row :key="item.key + '-' + idx" :gutter="[12]">
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
                @change="handleStationChange(arguments, idx)"
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
                @change="handleDeviceChange($event, idx)"
              />
            </w-form-model-item>
          </w-col>
          <w-col :span="7">
            <w-form-model-item
              :ref="`${form.domains[idx].key}-pointName`"
              required
              label="监测量选择"
              :prop="`domains[${idx}].pointName`"
              :rules="{
                required: true,
                message: '监测量不能为空!',
                trigger: 'change'
              }"
            >
              <w-info-select
                v-model="form.domains[idx].pointName"
                placeholder="选择监测量"
                :mode="single ? 'default' : 'multiple'"
                :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                show-search
                :filter-option="filterOption"
                @change="handlePointChange($event, idx)"
              >
                <w-select-option
                  v-for="item in pointMap[form.domains[idx].deviceId]"
                  :key="item.pointName"
                  :value="item.pointName"
                  >{{ item.pointMemo }}</w-select-option
                >
              </w-info-select>
            </w-form-model-item>
          </w-col>
          <slot name="extra" :item="item" :idx="idx" />
          <!-- <w-col :span="3">
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
          </w-col> -->
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
import { selectDevicePointByDeviceEntityId } from '@/api/device-operation';

export default {
  name: 'StationDevicePointForm',
  mixins: [CommonMixin],
  inheritAttrs: false,
  props: {
    waterPlantId: {
      type: String
    },
    form: {
      type: Object
    },
    loading: {
      type: Boolean,
      default: false
    },
    single: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // 记录对应sttionId下的device
      deviceMap: {},
      // 记录对应deviceId下的point
      pointMap: {}
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
          const { facilitiesId, deviceId } = this.form.domains[i];
          if (facilitiesId) {
            this.handleStationChange(facilitiesId, i, false);
            if (deviceId) {
              this.handleDeviceChange(deviceId, i, false);
            }
          }
        }
      } else {
        this.handleAddField();
      }
    },
    /**
     * 设施更改, 获取该设施下的设备
     */
    async handleStationChange(args, idx, reset = true) {
      let facilitiesId;
      let dataRef;
      if (typeof args === 'string') {
        facilitiesId = args;
      } else {
        facilitiesId = args[0];
        dataRef = args[2].triggerNode.dataRef;
        this.form.domains[idx].placeId = dataRef.pId;
      }
      if (!facilitiesId) {
        return;
      }
      if (reset) {
        this.form.domains[idx].deviceId = undefined;
        this.form.domains[idx].pointName = undefined;
      }

      try {
        const { resultData } = await this.$axios.get(
          '/waterwork-device-api/Facilities/queryConIndustryDevice',
          {
            params: {
              entityId: facilitiesId
            }
          }
        );
        const list = resultData.deviceEntities.map(i => {
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
    async handleDeviceChange(deviceId, idx, reset = true) {
      if (!deviceId || !this.waterPlantId) {
        return;
      }
      if (reset) {
        this.form.domains[idx].pointName = undefined;
      }
      try {
        // const { resultData } = await this.$axios.post('/waterwork-device-api/industryDevice/selectDevicePointByDeviceEntityId', {
        //   waterPlantId: this.waterPlantId,
        //   deviceId,
        //   pageFlag: false
        // });
        const { resultData } = await selectDevicePointByDeviceEntityId({
          waterPlantId: this.waterPlantId,
          deviceId
        });
        this.$set(this.pointMap, deviceId, resultData);
      } catch (error) {
        console.log(error);
        this.$set(this.pointMap, deviceId, []);
      }
    },
    filterOption(input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      );
    },
    handlePointChange(value, idx) {
      const item = this.form.domains[idx];
      const pointList = this.pointMap[item.deviceId] || [];
      item.pointInfo = pointList.filter(i => value.includes(i.pointName));
    },
    handleRemoveField(idx) {
      this.form.domains.splice(idx, 1);
    },
    // 新增字段
    handleAddField() {
      this.form.domains.push({
        key: Date.now(),
        placeId: undefined,
        facilitiesId: undefined,
        deviceId: undefined,
        calculateType: undefined,
        pointName: []
      });
    },
    handleSubmit() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.$emit('submit', this.form.domains.slice(0));
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
