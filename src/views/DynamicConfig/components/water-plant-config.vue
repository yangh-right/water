<!--
  @author: zhangxiang
  @date: 2021-10-28 09:00:50
  @desc：水厂配置信息
-->
<template>
  <w-info-form
    :fields="fields"
    :model="form"
    @submit="handleSumit"
    :layout="{ span: 8, labelCol: { span: 8 }, wrapperCol: { span: 16 }, labelAuto: true }"
  >
    <template v-for="col in ['designedSupplyCapacity', 'servicePopulation']" :slot="col">
      <div :key="col">
        <a-input-number v-model="form[col]" :min="0"></a-input-number>
      </div>
    </template>
  </w-info-form>
</template>

<script>
import { mapGetters } from 'vuex';

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
        // {
        //   name: 'longitude',
        //   label: '经度',
        //   type: 'input',
        //   disabled: true
        // },
        // {
        //   name: 'latitude',
        //   label: '纬度',
        //   type: 'input',
        //   disabled: true
        // },
        {
          name: 'designedSupplyCapacity',
          label: '供水量(万m³)',
          type: 'input-number',
          required: true,
          attrs: {
            min: 0
          }
        },
        {
          name: 'servicePopulation',
          label: '服务人口(万人)',
          type: 'input-number',
          required: true,
          attrs: {
            min: 0
          }
        },
        {
          name: 'videoIdList',
          label: '视频',
          type: 'select',
          // required: true,
          placeholder: '请选择视频',
          attrs: {
            mode: 'multiple'
          }
        }
      ],
      videoList: []
    };
  },

  computed: {
    currentPlant() {
      return this.waterPlantsList.find((i) => i.id === this.waterPlantId);
    },
    ...mapGetters('dictionary', ['waterPlantsList'])
  },
  methods: {
    handleSumit() {
      this.$emit('submit', {
        // longitude: this.form.longitude,
        // latitude: this.form.latitude,
        monitorContactVOS: this.videoList
          .filter((i) => this.form.videoIdList.includes(i.videoVO.videoId))
          .map((i) => i.videoVO),
        designedSupplyCapacity: this.form.designedSupplyCapacity,
        servicePopulation: this.form.servicePopulation
      });
    },
    initForm() {
      const item = (this.form.monitorContactVOS || []).filter((a) => a) || [];
      this.$set(
        this.form,
        'videoIdList',
        (item || []).map((i) => i.videoId)
      );
      // this.$set(this.form, 'longitude', this.form.longitude ?? this.currentPlant.lati);
      // this.$set(this.form, 'latitude', this.form.latitude ?? this.currentPlant.longi);
      this.getVideoList();
    },

    async getVideoList() {
      const field = this.fields[2];
      try {
        const { resultData } = await this.$axios.post(
          '/waterwork-device-api/MonitorStructure/queryByStationIdAndStructureName',
          {
            pageFlag: false,
            stationId: this.waterPlantId,
            dsDeviceVideoQuery: {
              pageFlag: false,
              dsAreaStationDeviceQueries: [
                {
                  stationId: [this.waterPlantId]
                }
              ]
            }
          }
        );
        field.options = resultData.map((i) => ({
          label: i.videoVO.videoName,
          value: i.videoVO.videoId
        }));
        this.videoList = resultData;
      } catch (error) {
        field.options = [];
        this.videoList = [];
      }

      this.fields.splice(2, 1, {
        ...field
      });
    }
  }
};
</script>

<style lang="less" scoped>
/deep/ .wpg-form-item.label-auto .wpg-form-item-label {
  flex-basis: 120px;
}
</style>
