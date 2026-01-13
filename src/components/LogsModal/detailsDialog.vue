<template>
  <div>
    <w-modal
      class="secondary-modal"
      :visible="visible"
      :width="950"
      :footer="null"
      destroyOnClose
      @cancel="handleColse"
    >
      <p slot="title" class="modal-header supply-text-deviate">日志详情</p>
      <div class="module">
        <div class="module-main st1" v-if="formData">
          <dl>
            <dt class="supply-text-third">日志类型 :</dt>
            <dd class="supply-text-secondary">{{ formData.recordType|filterType }}</dd>
            <p class="tag supply-text-warning" v-if="formData.important===1"><span>重要日志</span></p>
            <p
              v-if="formData&&formData.recordType===1"
              :class="['tag',formData.recordStatus===0?'supply-text-success':'end supply-text-third']">
              <span>{{ formData.recordStatus === 0 ? '进行中' : '已结束' }}</span>
            </p>
          </dl>
          <dl>
            <dt class="supply-text-third">日志标题 :</dt>
            <dd class="supply-text-secondary wrap-span">{{ formData.recordTitle || '--' }}</dd>
          </dl>
          <dl>
            <dt class="supply-text-third">最后记录人 :</dt>
            <dd class="supply-text-secondary wrap-span">{{ formData.latestRecordBy || '--' }}</dd>
          </dl>
          <template v-if="formData&&formData.recordType===1">
            <dl>
              <dt class="supply-text-third">发生地点 :</dt>
              <dd class="supply-text-secondary wrap-span">{{ formData.address || '--' }}</dd>
            </dl>
            <dl>
              <dt class="supply-text-third">经纬度 :</dt>
              <dd class="supply-text-third wrap-span">{{ formData.lngLat || '--' }}</dd>
            </dl>
          </template>
        </div>
        <template v-if="formData&&formData.recordType===1&&visibleMap">
          <div class="module-map">
            <!--<div id="map"></div>-->
            <wpg-map v-bind="mapInfo" @loaded="mapLoaded"/>
          </div>
        </template>
      </div>
      <div class="module-content st1">
        <dl>
          <dt class="supply-text-third">日志内容 :</dt>
          <dd v-if="formData&&formData.recordType===1&&menuAuth"><a href="javascript:;" @click="addToProgram">添加到方案库</a>
          </dd>
          <dd v-else class="wrap-span supply-text-secondary">{{ (infoList.length && infoList[0].recordContent) || '--' }}</dd>
        </dl>
        <template v-if="formData&&formData.recordType===1">
          <div class="module-container">
            <div :class="['module-list',formData.recordStatus===0?'item1':'item2']">
              <div class="module-item" v-for="(info,idx) in infoList" :key="idx">
                <div class="item-lf"><i :class="['circle']"></i>
                  <div class="line"></div>
                </div>
                <div class="item-rt">
                  <p class="supply-text-main"><span>{{ info.dateTime }}</span><span>{{ info.createBy }}</span></p>
                  <p class="supply-text-third">{{ info.recordContent || '--' }}</p>
                </div>
              </div>
            </div>
            <div class="module-form" v-if="formData.recordStatus===0">
              <div class="module-btns" v-if="!showForm">
                <w-button type="primary" ghost @click="handleAdd(0)">添加过程节点</w-button>
                <w-button type="primary" ghost @click="handleAdd(1)">添加结束节点</w-button>
              </div>
              <w-form
                v-if="showForm"
                class="dynamic-form"
                :form="form"
                :label-col="{ span: 3 }"
                :wrapper-col="{ span: 21 }"
                @submit="handleSubmit">
                <w-form-item label="日志时间" :colon="false">
                  <w-date-picker
                    v-decorator="[
                                            'dateTime',
                                            { rules: [{ required: true, message: '请选择日志时间' }] },
                                        ]"
                    :show-time="{ format: 'HH:mm' }"
                    :disabled-date="disabledDate"
                    :disabled-time="disabledDateTime"
                    format="YYYY-MM-DD HH:mm"
                    placeholder="请选择日志时间"
                  />
                </w-form-item>
                <w-form-item label="日志内容" :colon="false">
                  <w-textarea
                    v-decorator="['recordContent',{rules:[{required: true, message: '请输入日志内容'},{max: 1000, message: '至多可输入1000个字符'}]}]"
                    :placeholder="`请输入日志${placeholder}详情`"
                    :auto-size="{ minRows: 3 }"
                  />
                </w-form-item>
                <w-form-item :wrapper-col="{ span: 24}">
                  <div class="form-btns">
                    <w-button @click="_ => showForm=!showForm">取消</w-button>
                    <w-button type="primary" html-type="submit">保存</w-button>
                  </div>
                </w-form-item>
              </w-form>
            </div>
          </div>
        </template>
      </div>
    </w-modal>
    <program-dialog :info="extraOpts" ref="program"/>
  </div>
</template>

<script>
import moment from 'moment';
import ProgramDialog from './programDialog.vue'
import {loadBaiDuMap} from '@/utils/js/BMap/BMap.js';
import {
  getDispatchDetail as apiGetDispatchDetail,
  addDispatchDetail as apiAddDispatchDetail
} from '@/api';
import {checkMenuAuth} from "@/utils/js/tool/tools";
import mapConfig from "@/config/map.config";

export default {
  name: "detailDialog",
  components: {
    ProgramDialog,
    WpgMap: () => import('@/components/wpgMap'),
  },
  props: {
    formData: {
      type: Object,
      default: () => ({})
    },
    // 地图页已有地图，所以弹窗内不展示地图，通过该字段控制
    visibleMap: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      visible: false,
      infoList: [],
      form: this.$form.createForm(this, {
        name: `custom_form_${Math.random().toString(16).slice(2)}`
      }),
      showForm: false,
      domType: 0,
      map: null,
      menuAuth: checkMenuAuth('/planLibrary'),
      mapInfo: null,
    };
  },
  computed: {
    placeholder() {
      return ['新增节点', '结束节点'][this.domType]
    },
    lastTime() {
      if (this.infoList && this.infoList.length) {
        return moment(this.infoList[this.infoList.length - 1].dateTime)
      }
      return null;
    },
    extraOpts() {
      return {
        programmeName: this.formData && this.formData.recordTitle || '',
        options: {dispatchId: this.formData && this.formData.id || '', type: 1}
      }
    },
  },
  watch: {
    visible(val) {
      if (val) {
        this.getDetail();
        // this.initMap();
      }
    }
  },
  filters: {
    filterType(value) {
      return ['事件日志', '普通日志'][value - 1] || '--';
    }
  },
  methods: {
    // 获取日志详情
    async getDetail() {
      const res = await apiGetDispatchDetail({id: this.formData.id});
      this.infoList = res?.records ?? [];
      // 初始化地图配置
      this.initMapConfig(res?.baseMap);
    },
    /**
     * 初始化地图配置
     * @param info
     */
    initMapConfig(info) {
      const {echoCoordinate, serverType, mapUrl} = info || {}, {lngLat} = this.formData || {};
      this.mapInfo = {
        id: Date.now(),
        mapType: mapConfig.crsMap.b2f[echoCoordinate] ?? void 0,
        mapServer: serverType,
        mapUrl,
        center: lngLat ? lngLat.split(',').reverse() : void 0,
      }
    },
    /**
     * 地图加载完成
     */
    mapLoaded(map) {
      if (!this.mapInfo) return;
      L.marker(this.mapInfo.center, {
        icon: L.icon({
          iconUrl: require('@/assets/images/default/ic_location_on.png'),
          iconSize: 50,
          iconAnchor: [25, 42]
        })
      }).addTo(map);
    },
    // 初始化地图
    async initMap(zoom = 14) {
      if (!(this.formData && this.formData.lngLat) || !this.visibleMap) return;
      const [lng = '', lat = ''] = this.formData.lngLat.match(/^(.+),(.+)$/).slice(1);
      const BMap = await loadBaiDuMap();
      const point = new BMap.Point(lng, lat);
      const marker = new BMap.Marker(point);
      if (!this.map) {
        this.map = new BMap.Map('map', {enableMapClick: false});
        this.map.enableScrollWheelZoom(true);
        this.map.centerAndZoom(point, zoom);
      } else {
        this.map.panTo(point);
      }
      this.map.clearOverlays();
      this.map.addOverlay(marker);
    },
    // 新增节点
    handleAdd(flag) {
      this.domType = flag;
      this.showForm = !this.showForm;
    },
    // 关闭表单
    handleCancel() {
      this.form.resetFields();
      this.showForm = false;
      if (this.domType === 1) {
        this.handleColse();
      }
    },
    // 获取表单数据
    handleSubmit(e) {
      e.preventDefault();
      this.form.validateFields((err, values) => {
        if (!err) {
          values.dateTime = values.dateTime.format('YYYY-MM-DD HH:mm:ss');
          this.addLogs(values)
        }
      });
    },
    // 提交表单
    async addLogs(data) {
      await apiAddDispatchDetail({
        recordId: this.formData.id,
        recordStatus: this.domType,
        ...data
      });
      this.$message.success('新增节点成功');
      this.handleCancel();
      this.getDetail();
      this.$emit('update', this.domType);
    },
    // 禁选时间
    disabledDate(current) {
      let _lastTime = moment(this.lastTime).subtract(1, 'day')
      return ((current && this.lastTime) && current < _lastTime.endOf('day').valueOf()) || current > moment().endOf('day').valueOf()
    },
    // 禁选时间
    disabledDateTime(date) {
      if (date && date < moment(this.lastTime).endOf('day').valueOf()) {
        return {
          disabledHours: () => this.range(0, this.lastTime.hour()),
          disabledMinutes: () => {
            if (date.hour() === this.lastTime.hour()) {
              return this.range(0, this.lastTime.minute() + 1)
            } else {
              return []
            }
          }
        };
      }
    },
    range(start, end) {
      const result = [];
      for (let i = start; i < end; i++) {
        result.push(i);
      }
      return result;
    },
    // 关闭模态框
    handleColse() {
      this.form.resetFields();
      this.showForm = false;
      this.visible = false;
      this.map = null;
    },
    // 添加至方案库
    addToProgram() {
      this.$refs.program && (this.$refs.program.visible = true);
    }
  }
};
</script>

<style scoped lang="less">
.modal-header {
  display: flex;
  align-items: center;
  text-align: left;
  font-size: 16px;
  line-height: 1;
  margin-bottom: 2px;

  &:before {
    content: '';
    width: 5px;
    height: 14px;
    margin-right: 10px;
    background-color: #87CE40;
  }
}

.module {
  display: flex;
  justify-content: space-between;

  &:not(:first-of-type) {
    margin-top: 10px;
  }

  &-main {
    width: 55%;
  }

  &-main, &-content {
    font-size: 14px;
    padding-right: 35px;
  }

  &-item {
    display: flex;

    .item {
      &-lf {
        width: 84px;
        margin-right: 6px;
        padding-left: 40px;

        i.circle {
          display: block;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 4px solid #FFFFFF;
          box-shadow: 0 0 10px 0 rgba(55, 76, 110, 0.20);
        }

        .line {
          width: 1px;
          height: calc(100% - 20px);
          margin: 0 10px;
        }
      }

      &-rt {
        flex: 1;
        margin-bottom: 20px;
        overflow: hidden;

        p {
          margin-bottom: 10px;

          &:first-of-type {
            font-size: 16px;
          }

          span {
            margin-right: 30px;
          }
        }
      }
    }

    &:last-of-type {
      .item-lf > .line {
        display: none;
      }
    }
  }

  &-container {
    height: 300px;
    overflow-y: auto;
    padding-top: 5px;
    padding-right: 20px;
    margin-bottom: 20px;
  }

  &-form {
    padding-left: 90px;

    .ant-btn:first-of-type {
      margin-right: 20px;
    }

    .dynamic-form {
      .ant-form-item {
        margin-bottom: 20px;

        /deep/ .ant-calendar-picker {
          width: 100%;
        }

        &:last-of-type {
          padding-top: 20px;
          margin-bottom: 4px;
        }
      }

      .form-btns {
        display: flex;
        justify-content: flex-end;

        .ant-btn {
          width: 100px;

          &:first-of-type {
            margin-right: 10px;
          }
        }
      }

      /deep/ .ant-form-explain {
        /* 避免破坏布局 */
        position: absolute;
      }
    }
  }

  &-map {
    width: 350px;
    height: 220px;
    margin: 0 35px 0 0;

    #map {
      width: 100%;
      height: 100%;
    }
  }
}

.st1 {
  dl {
    display: flex;
    margin-bottom: 20px;

    p.tag {
      height: 24px;
      padding: 0 10px;
      border-radius: 4px;

      &:first-of-type {
        margin: 0 20px 0 63px;
      }
    }

    p.supply-text-warning {
      border: 1px solid rgba(246, 67, 87, 0.30);
      background: #FFEFF1;
    }

    p.supply-text-success {
      background: #E9FDF8;
      border: 1px solid #76E3C9;
    }

    p.end {
      background: #F4F4F4;
      border: 1px solid #E5E5E5;
    }

    dd.wrap-span {
      overflow: hidden;
      width: calc(100% - 84px);
    }
  }

  dt {
    width: 84px;
    margin-right: 6px;
  }
}

ul.item1 {
  /deep/ .module-item {
    .circle,
    .line {
      background: #A7C8FF;
    }

    &:last-of-type {
      .circle {
        background: #4285F4;;
      }
    }
  }
}

ul.item2 {
  /deep/ .module-item {
    .circle,
    .line {
      background: #0ACC9D;
    }
  }
}
</style>
