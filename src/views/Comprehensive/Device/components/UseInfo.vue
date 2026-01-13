<template>
  <div class="use-info">
    <div class="form-title wfc1">运维信息</div>
    <w-info-form ref="useForm" :model="form" :fields="fields" :layout="layout" :footer="null">
      <template #waterPlantId>
        <factory-select
          v-model="form.waterPlantId"
          :allowClear="true"
          @change="changeWaterPlantId"
        ></factory-select>
      </template>
      <template #placeId>
        <PlaceSelect
          ref="PlaceCascader1"
          v-model="form.placeId"
          :waterPlantId="form.waterPlantId"
          @change="placeTreeChange"
        ></PlaceSelect>
      </template>
      <template #openDate>
        <w-date-picker
          v-model="form.openDate"
          :disabled-date="disabledStartDate"
          allowClear
          :getCalendarContainer="getPopupContainer"
          valueFormat="YYYY-MM-DD"
          style="width: 100%"
        />
      </template>
      <template #fileList>
        <DeviceMedia v-model="form.fileList"></DeviceMedia>
      </template>
    </w-info-form>
  </div>
</template>

<script>
import { useFields } from '../config';
import InfoMixin from './InfoMixin';
import PlaceSelect from '@/components/place-select-tree/index.vue';
import FactorySelect from '@/components/factory-select/index.vue';
import DeviceMedia from '../../components/DeviceMedia.vue';
import { sysDictListByCode } from '@/api/deviceManagement';
import { queryRelationUser, videoList } from '@/api/public';
import { mapState } from 'vuex';
export default {
  name: 'UseInfo',
  mixins: [InfoMixin],
  components: { FactorySelect, DeviceMedia, PlaceSelect },
  props: {
    form: {
      type: Object,
      default: () => {}
    },
    validate: {
      type: Boolean,
      default: false
    },
    deviceNo: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      useFields,
      placeTreeData: [],
      videoOptions: [],
      userOptions: [],
      installAddressOptions: [],
      refreshKey: undefined
    };
  },
  computed: {
    ...mapState('account', ['user']),
    fields() {
      return this.useFields;
    },
    deviceCodeObj() {
      let obj = {
        code1: '',
        name1: '',
        type1: '',
        code2: '',
        name2: '',
        code3: '',
        name3: ''
      };
      if (this.form.deviceStatus === '-1') {
        let dictValue = this.useFields
          .find(i => i.name === 'deviceStatus')
          .options.find(i => i.value === '-1').dictValue;
        obj.code1 = dictValue ? dictValue : 'BF';
        obj.type1 = dictValue ? dictValue : 'BF';
        obj.name1 = '报废';
      } else {
        if (this.form.placeId) {
          this.placeTreeData.forEach(i => {
            if (i.id === this.form.placeId) {
              // 取构筑物code和name，拼接设备编号
              obj.code1 = i.coding;
              obj.name1 = i.name;
              obj.type1 = i.type === 2 ? '仓库' : '构筑物';
            }
          });
        } else {
          obj.code1 = '';
          obj.type1 = '';
          obj.name1 = '';
        }
      }
      if (this.form.deviceType) {
        obj.code2 = String(this.form.deviceType.split('')[0]);
        obj.code3 = this.form.deviceType;
        this.$store.state.device.deviceType.forEach(item => {
          if (item.dictCode === obj.code2) {
            obj.name2 = item.dictName;
            item.children.forEach(i => {
              if (i.dictCode === obj.code3) {
                obj.name3 = i.dictName;
              }
            });
          }
        });
      } else {
        obj.code2 = '';
        obj.code3 = '';
        obj.name2 = '';
        obj.name3 = '';
      }
      return obj;
    },
    deviceCodeText() {
      let keys = Object.keys(this.deviceCodeObj);
      if (keys.every(i => this.deviceCodeObj[i])) {
        if (this.form.deviceStatus !== '-1') {
          return (
            this.deviceCodeObj.code1 +
            ',（' +
            '安装' +
            this.deviceCodeObj.type1 +
            '“' +
            this.deviceCodeObj.name1 +
            '”）,' +
            this.deviceCodeObj.code2 +
            ',（' +
            this.deviceCodeObj.name2 +
            '）,' +
            this.deviceCodeObj.code3.split('')[1] +
            ',（' +
            '第' +
            this.deviceCodeObj.code3.split('')[1] +
            '个子类“' +
            this.deviceCodeObj.name3 +
            '”） - '
          );
        } else {
          return (
            this.deviceCodeObj.code1 +
            ',（' +
            '“' +
            this.deviceCodeObj.name1 +
            '”）,' +
            this.deviceCodeObj.code2 +
            ',（' +
            this.deviceCodeObj.name2 +
            '）,' +
            this.deviceCodeObj.code3.split('')[1] +
            ',（' +
            '第' +
            this.deviceCodeObj.code3.split('')[1] +
            '个子类“' +
            this.deviceCodeObj.name3 +
            '”） - '
          );
        }
      }
      return '';
    }
  },
  watch: {
    'form.waterPlantId'() {
      this.getPlaceTree();
      this.getQueryRelationUser();
      this.getVideoList();
    },
    deviceCodeObj: {
      handler(obj) {
        let str = obj.code1 + obj.code3 + '-';
        this.$emit('update:deviceNo', str);
      },
      deep: true
    }
  },
  async created() {
    // await this.getSystemDictList('install_address', 'installAddress');
    await this.getVideoList();
  },
  activated() {
    let { deviceTime } = this.$route.query;
    if (deviceTime) {
      this.refreshKey = deviceTime;
    }
  },
  methods: {
    handleDeviceCodeClass(text) {
      if (text) {
        // console.log(text, /^（.*）/.test(text));
        return text.match(/^（.*）/) ? 'wfc3' : '';
      }
      return '';
    },
    // 获取地点树
    async getPlaceTree() {
      this.placeTreeData = [];
      // 需要传入污水厂Id才能请求地址
      if (this.form.waterPlantId) {
        const res = await this.$http.get(
          `/place/getStructureByStationId?waterPlantId=${this.form.waterPlantId}`
        );
        if (res.success) {
          this.placeTreeData = res.resultData;
        }
      }
    },
    // 获取使用状态
    async getSystemDictList(key, value) {
      const { resultData } = await sysDictListByCode(key);
      this[value + 'Options'] = resultData.map(i => {
        return {
          label: i.dictName,
          value: i.dictCode,
          ...i
        };
      });
      this.useFields.find(i => i.name === value).options = this[value + 'Options'];
    },
    // 获取负责人列表
    async getQueryRelationUser() {
      if (this.form.waterPlantId) {
        let params = {
          stationId: this.form.waterPlantId,
          keyword: '',
          productId: '',
          pageFlag: false
        };
        const { resultData } = await queryRelationUser(params);
        this.userOptions = resultData.map(i => {
          return {
            label: i.userName,
            value: i.id,
            ...i
          };
        });
        this.useFields.find(i => i.name === 'responsibleUser').options = this.userOptions;
        if (!this.userOptions.some(i => i.id === this.form.responsibleUser)) {
          this.form.responsibleUser = undefined;
        }
      } else {
        this.form.responsibleUser = undefined;
        this.useFields.find(i => i.name === 'responsibleUser').options = [];
      }
    },
    // 获取视频列表
    async getVideoList() {
      if (!this.form.waterPlantId) return;
      let params = {
        currentPage: 1,
        pageSize: 999,
        tenantId: this.user.tenantId,
        productCode: 'water_purification',
        dsAreaStationDeviceQueries: [
          {
            stationId: [this.form.waterPlantId],
            productCode: 'water_purification',
            areaId: []
          }
        ]
      };
      const { resultData } = await videoList(params);
      this.videoOptions = resultData.map(i => {
        return {
          label: i.videoName,
          value: i.id,
          ...i
        };
      });
      this.useFields.find(i => i.name === 'videoIdList').options = this.videoOptions;
    },
    // 地点树change
    placeTreeChange(value, option) {
      if (option === null) return;
      if (!this.form.monitoringPosition) {
        // 第一次个监测位置赋值
        if (this.form.deviceStatus === '1' || this.form.deviceStatus === '2') {
          this.form.monitoringPosition = value;
          this.form.monitoringPositionStructureId = option.id;
        }
      }
      if (value) {
        this.form.installType = option.type;
        // this.form.placeId = options[0].id;
        // 处理设备编号
        this.getPlaceTree();
      }
    },
    // 监测位置tree change
    monitoringPlaceTreeChange(value, options) {
      if (value && value.length) {
        this.form.monitoringPosition = value[value.length - 1];
        this.form.monitoringPositionStructureId = options[0].id;
      }
    },
    formValidate() {
      this.$refs['useForm'].validate(valid => {
        this.$emit('update:validate', !!valid);
      });
    },
    resetFields() {
      this.$refs['useForm'].$_resetFields();
    },
    // 当水厂change时，清除地点树
    changeWaterPlantId() {
      this.$refs['PlaceCascader1']?.clearValue();
      // 清空行业设备
      this.$emit('waterPlantChange');
    }
  }
};
</script>

<style lang="less" scoped>
.use-info {
  width: 100%;
  .form-title {
    padding: 20px 0 15px 0;
    // color: #333;
    font-size: 16px;
  }
  .form-special {
    display: flex;
    flex-direction: row;
    button {
      padding: 0 14px;
    }
  }
  .form-text {
    margin-bottom: 0;
  }
}
</style>
