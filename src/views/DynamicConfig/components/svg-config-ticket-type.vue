<!--
  @author: zhangxiang
  @date: 2021-09-07 16:09:45
  @desc：
-->
<template>
  <div class="svg-form-page">
    <div class="form-box">
      <w-info-form
        ref="basicForm"
        :fields="fields"
        :model="configForm"
        :footer="null"
        :layout="{ span: 7, labelCol: { span: 8 }, wrapperCol: { span: 16 }, colon: true }"
      ></w-info-form>
    </div>
    <!--构件绑定  -->
    <div class="element-config" v-if="configForm.type === 'BIM'">
      <w-tabs :activeKey="activeKey" @change="tabChange">
        <w-tab-pane key="deviceConfigs" tab="设备" force-render>
          <div
            class="tab-box"
            v-if="configForm.elementConfig && configForm.elementConfig.deviceConfigs"
          >
            <div
              class="list-item"
              v-for="(device, _i) in configForm.elementConfig.deviceConfigs"
              :key="_i"
            >
              <w-info-form
                class="left-form"
                :ref="`device${_i}`"
                :fields="deviceFields"
                :model="device"
                :layout="{ span: 12, labelCol: { span: 6 }, wrapperCol: { span: 18 }, colon: true }"
                :footer="null"
              >
              </w-info-form>
              <div class="right-act-btn">
                <w-button type="dashed" @click="handleDelete('device', _i)"> 删除 </w-button>
              </div>
            </div>
            <w-button class="add-btn" type="primary" @click="handleAdd('device')"> 新增 </w-button>
          </div>
        </w-tab-pane>
        <w-tab-pane key="videoConfigs" tab="监控视频" force-render>
          <div
            class="tab-box"
            v-if="configForm.elementConfig && configForm.elementConfig.videoConfigs"
          >
            <div
              class="list-item"
              v-for="(video, _i) in configForm.elementConfig.videoConfigs"
              :key="_i"
            >
              <w-info-form
                class="left-form"
                :ref="`video${_i}`"
                :fields="videoFields"
                :model="video"
                :layout="{ span: 12, labelCol: { span: 6 }, wrapperCol: { span: 18 }, colon: true }"
                :footer="null"
              >
              </w-info-form>
              <div class="right-act-btn">
                <w-button type="dashed" @click="handleDelete('video', _i)"> 删除 </w-button>
              </div>
            </div>

            <w-button class="add-btn" type="primary" @click="handleAdd('video')"> 新增 </w-button>
          </div>
        </w-tab-pane>
        <w-tab-pane key="structureConfigs" tab="构筑物" force-render>
          <div
            class="tab-box"
            v-if="configForm.elementConfig && configForm.elementConfig.structureConfigs"
          >
            <div
              class="list-item"
              v-for="(structure, _i) in configForm.elementConfig.structureConfigs"
              :key="_i"
            >
              <w-info-form
                class="left-form"
                :ref="`structure${_i}`"
                :fields="structureFields"
                :model="structure"
                :layout="{ span: 12, labelCol: { span: 6 }, wrapperCol: { span: 18 }, colon: true }"
                :footer="null"
              >
              </w-info-form>
              <div class="right-act-btn">
                <w-button type="dashed" @click="handleDelete('structure', _i)"> 删除 </w-button>
              </div>
            </div>

            <w-button class="add-btn" type="primary" @click="handleAdd('structure')">
              新增
            </w-button>
          </div>
        </w-tab-pane>
      </w-tabs>
    </div>
    <div class="footer">
      <w-button type="primary" :loading="loading" @click="handleSubmit">提交</w-button>
    </div>
  </div>
</template>

<script>
import { cloneDeep } from 'lodash-es';
export default {
  name: 'SvgConfigTicketType',
  inheritAttrs: false,
  props: {
    form: {
      type: Object
    },
    waterPlantId: {
      type: String
    },
    loading: Boolean
  },
  data() {
    return {
      fields: [
        {
          required: true,
          name: 'type',
          label: '方式选择',
          type: 'select',
          placeholder: '请选择展示方式',
          options: [
            {
              label: 'BIM',
              value: 'BIM'
            },
            {
              label: '组态',
              value: 'HT'
            }
          ],
          listeners: {
            change: this.typeChange
          }
        },
        {
          required: true,
          name: 'svgName',
          label: '图纸名称',
          type: 'input',
          span: 14,
          labelCol: { span: 4 },
          wrapperCol: { span: 8 },
          placeholder: '请输入图纸名称',
          ifRender: form => {
            return form.type === 'HT';
          }
        },
        {
          required: true,
          name: 'projectId',
          label: '项目',
          type: 'select',
          options: [],
          span: 14,
          labelCol: { span: 6 },
          wrapperCol: { span: 6 },
          placeholder: '请选择项目',
          listeners: {
            change: this.projectChange
          },
          ifRender: form => {
            return form.type === 'BIM';
          }
        },
        {
          required: true,
          name: 'runInspectConfig',
          label: '巡检漫游配置',
          type: 'select',
          options: [],
          placeholder: '请选择巡检漫游配置',
          attrs: {
            mode: 'multiple'
          },
          ifRender: form => {
            return form.type === 'BIM';
          }
        },
        {
          required: true,
          name: 'jumpInspectConfig',
          label: '跳跃式巡检配置',
          type: 'select',
          options: [],
          labelCol: { span: 12 },
          wrapperCol: { span: 12 },
          attrs: {
            mode: 'multiple'
          },
          placeholder: '请选择跳跃式巡检配置',
          ifRender: form => {
            return form.type === 'BIM';
          }
        }
      ],
      activeKey: 'deviceConfigs',
      deviceFields: [
        {
          required: true,
          name: 'elementId',
          label: '构件ID',
          type: 'select',
          options: [],
          placeholder: '请选择构件',
          attrs: {
            getPopupContainer: () => document.querySelector('.svg-form-page'),
            showSearch: true,
            filterOption: this.filterOption
          }
        },
        {
          required: true,
          name: 'deviceId',
          label: '设备选择',
          type: 'select',
          options: [],
          placeholder: '请选择设备',
          attrs: {
            getPopupContainer: () => document.querySelector('.svg-form-page')
          }
        }
      ],
      videoFields: [
        {
          required: true,
          name: 'elementId',
          label: '构件ID',
          type: 'select',
          options: [],
          placeholder: '请选择构件',
          attrs: {
            getPopupContainer: () => document.querySelector('.svg-form-page'),
            showSearch: true,
            filterOption: this.filterOption
          }
        },
        {
          required: true,
          name: 'videoId',
          label: '视频选择',
          type: 'select',
          options: [],
          placeholder: '请选择视频',
          attrs: {
            getPopupContainer: () => document.querySelector('.svg-form-page')
          }
        }
      ],
      structureFields: [
        {
          required: true,
          name: 'elementId',
          label: '构件ID',
          type: 'select',
          options: [],
          placeholder: '请选择构件',
          attrs: {
            getPopupContainer: () => document.querySelector('.svg-form-page'),
            showSearch: true,
            filterOption: this.filterOption
          }
        },
        {
          required: true,
          name: 'placeId',
          label: '构筑物选择',
          type: 'select',
          options: [],
          placeholder: '请选择构筑物',
          attrs: {
            getPopupContainer: () => document.querySelector('.svg-form-page')
          }
        }
      ],
      configForm: {
        type: undefined,
        svgName: '',
        projectId: undefined,
        runInspectConfig: undefined,
        jumpInspectConfig: undefined,
        elementConfig: {
          deviceConfigs: [
            {
              elementId: '',
              deviceId: ''
            }
          ],
          videoConfigs: [
            {
              elementId: ' ',
              videoId: ''
            }
          ],
          structureConfigs: [
            {
              elementId: ' ',
              placeId: ''
            }
          ]
        }
      },
      basicComplist: []
    };
  },
  watch: {
    waterPlantId: {
      handler(val) {
        if (val) {
          this.getProjectList();
          this.getDeviceList();
          this.getVideoList();
          this.getStructureList();
        }
      },
      immediate: true
    }
  },
  methods: {
    // 获取项目ID列表
    async getProjectList() {
      try {
        let res = await this.$http.post(`/wpgBimApi/BimProject/page`, {
          pageFlag: false
        });
        this.fields[2].options = res?.resultData
          .map(item => ({
            ...item,
            label: item.projectName,
            value: item.projectNo
          }))
          .filter(item => item.state === 2);
      } catch (error) {
        this.fields[2].options = [];
      }
    },
    // 获取视点列表
    async getCamerashotList(appId) {
      try {
        let res = await this.$http.post(
          `/wpgBimApi/BimViewPointProvider/selectCamerashotAll?appId=${appId}`,
          {
            appId
          }
        );
        this.fields[4].options = res?.resultData.map(item => ({
          ...item,
          label: item.name,
          value: item.tid
        }));
      } catch (error) {
        this.fields[4].options = [];
      }
    },
    // 获取视点动画列表
    async getViewAnimList(appId) {
      try {
        let res = await this.$http.get(
          `/wpgBimApi/BimViewPointVideoProvider/getViewAnimList?appId=${appId}`
        );
        this.fields[3].options = res?.resultData.map(item => ({
          ...item,
          label: item.name,
          value: item.viewId
        }));
      } catch (error) {
        this.fields[3].options = [];
      }
    },
    // 获取构建列表
    async getComponentList(appId) {
      try {
        let res = await this.$http.get(
          `/wpgBimApi/ModelComponentProvider/getComponentTree?appId=${appId}`
        );
        this.deviceFields[0].options = res?.resultData.map(item => ({
          ...item,
          label: item.name,
          value: item.uuid
        }));
        this.videoFields[0].options = res?.resultData.map(item => ({
          ...item,
          label: item.name,
          value: item.uuid
        }));
        this.structureFields[0].options = res?.resultData.map(item => ({
          ...item,
          label: item.name,
          value: item.uuid
        }));
      } catch (error) {
        this.deviceFields[0].options = [];
        this.videoFields[0].options = [];
        this.structureFields[0].options = [];
      }
    },
    // 获取设备列表
    async getDeviceList() {
      try {
        let res = await this.$http.post(`/waterwork-device-api/deviceEntity/listWithPosition`, {
          waterPlantId: this.waterPlantId,
          pageFlag: false
        });
        this.deviceFields[1].options = res?.resultData
          .map(item => ({
            ...item,
            label: item.deviceName,
            value: item.id
          }))
          .filter(item => item.deviceStatus === 1);
      } catch (error) {
        this.deviceFields[1].options = [];
      }
    },
    // 获取视频列表
    async getVideoList() {
      try {
        let res = await this.$http.post(
          `/waterwork-device-api/MonitorStructure/queryByStationIdAndStructureName`,
          {
            stationId: this.waterPlantId,
            pageFlag: false,
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
        this.videoFields[1].options = res?.resultData.map(item => ({
          ...item,
          label: item.monitorName,
          value: item.videoVO.videoId
        }));
      } catch (error) {
        this.videoFields[1].options = [];
      }
    },
    // 获取构筑物列表
    async getStructureList() {
      try {
        let res = await this.$http.post(`/waterwork-device-api/Structure/list`, {
          waterPlantId: this.waterPlantId,
          pageFlag: false
        });
        this.structureFields[1].options = res?.resultData
          .map(item => ({
            ...item,
            label: item.structureName,
            value: item.id
          }))
          .filter(item => item.validFlag);
      } catch (error) {
        this.structureFields[1].options = [];
      }
    },
    async projectChange(val, type) {
      this.appId = val;
      this.getCamerashotList(val);
      this.getViewAnimList(val);
      this.getComponentList(val);
      if (type !== 'init') {
        // 清空项目相关内容
        this.configForm.runInspectConfig = undefined;
        this.configForm.jumpInspectConfig = undefined;
        this.configForm.elementConfig = {
          deviceConfigs: [
            {
              elementId: '',
              deviceId: ''
            }
          ],
          videoConfigs: [
            {
              elementId: ' ',
              videoId: ''
            }
          ],
          structureConfigs: [
            {
              elementId: ' ',
              placeId: ''
            }
          ]
        };
      }
    },
    filterOption(input, option) {
      return option.componentOptions.children[0].text.toLowerCase().startsWith(input.toLowerCase());
    },
    initForm() {
      console.log(this.form);
      if (this.form.type) {
        if (this.form.type === 'BIM' && this.form.projectId) {
          this.configForm = cloneDeep(this.form);
          this.projectChange(this.form.projectId, 'init');
        } else {
          this.configForm = {
            ...this.configForm,
            type: 'HT',
            svgName: this.form.svgName
          };
        }
      } else {
        this.configForm = {
          type: undefined,
          svgName: '',
          projectId: undefined,
          runInspectConfig: undefined,
          jumpInspectConfig: undefined,
          elementConfig: {
            deviceConfigs: [
              {
                elementId: '',
                deviceId: ''
              }
            ],
            videoConfigs: [
              {
                elementId: ' ',
                videoId: ''
              }
            ],
            structureConfigs: [
              {
                elementId: ' ',
                placeId: ''
              }
            ]
          }
        };
      }
    },
    handleSubmit() {
      console.log(this.configForm);
      // 检验必填
      this.$refs['basicForm'].validate().then(val => {
        if (val) {
          if (this.configForm.type === 'BIM') {
            // 校验所有的表单
            let validatePromiseArr = [];
            this.configForm.elementConfig.deviceConfigs.forEach((item, index) => {
              validatePromiseArr.push(this.$refs[`device${index}`][0].validate());
            });
            this.configForm.elementConfig.videoConfigs.forEach((item, index) => {
              validatePromiseArr.push(this.$refs[`video${index}`][0].validate());
            });
            this.configForm.elementConfig.structureConfigs.forEach((item, index) => {
              validatePromiseArr.push(this.$refs[`structure${index}`][0].validate());
            });
            Promise.all(validatePromiseArr).then(res => {
              if (res.find(_i => !_i)) {
                console.log('fail');
              } else {
                this.$emit('submit', {
                  ...this.configForm
                });
              }
            });
          } else {
            this.$emit('submit', {
              type: 'HT',
              svgName: this.configForm.svgName,
              theme: 'dark'
            });
          }
        }
      });
      // this.$emit('submit', {
      //   configParaList: value
      // });
    },
    tabChange(val) {
      this.activeKey = val;
    },
    typeChange() {
      // if (val === 'BIM') {
      //   this.configForm = cloneDeep(this.basicForm);
      // } else {
      //   this.configForm = { type: 'HT', svgName: '' };
      // }
    },
    handleDelete(type, index) {
      this.$confirm({
        title: '删除确认',
        content: '确定删除么？',
        onOk: () => {
          if (type === 'device') {
            this.configForm.elementConfig.deviceConfigs.splice(index, 1);
          } else if (type === 'video') {
            this.configForm.elementConfig.videoConfigs.splice(index, 1);
          } else if (type === 'structure') {
            this.configForm.elementConfig.structureConfigs.splice(index, 1);
          }
        }
      });
    },
    handleAdd(type) {
      if (type === 'device') {
        this.configForm.elementConfig.deviceConfigs.push({
          elementId: '',
          deviceId: ''
        });
      } else if (type === 'video') {
        this.configForm.elementConfig.videoConfigs.push({
          elementId: '',
          videoId: ''
        });
      } else if (type === 'structure') {
        this.configForm.elementConfig.structureConfigs.push({
          elementId: '',
          placeId: ''
        });
      }
    }
  }
};
</script>

<style lang="less" scoped>
.svg-form-page {
  flex: 1;
  width: 100%;
  padding: 10px 30px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  .form-box {
    width: 100%;
    /deep/ .wpg-col.wpg-col-7 {
      padding-right: 0 !important;
    }
  }
  .element-config {
    padding: 20px 50px;
    box-sizing: border-box;
    width: 100%;
    .tab-box {
      width: 100%;
      position: relative;
      min-height: 50px;
      .list-item {
        width: 100%;
        display: flex;
        margin: 20px 0;
        .left-form {
          width: 70%;
        }
        .right-act-btn {
          width: 30%;
          padding-top: 3px;
          display: flex;
          padding-left: 20px;
        }
      }
      .add-btn {
        position: absolute;
        top: 3px;
        right: 60px;
      }
    }
  }
  .footer {
    width: 100%;
    margin-top: 24px;
    padding-right: 30px;
    display: flex;
    flex-direction: row-reverse;
  }
}
</style>
