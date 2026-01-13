<template>
  <div class="device-detail-view full-view">
    <DeviceHeader
      :title="detailTitle"
      :id="deviceId"
      :type="type"
      :contentType="contentType"
      @handleCancel="handleCancel"
      @handleDeviceLife="handleDeviceLife"
      @handleBaseInfo="handleBaseInfo"
      @handleExtendInfo="handleExtendInfo"
      @handleSave="handleSave"
      @handleRunAnalysis="handleRunAnalysis"
    ></DeviceHeader>
    <div class="detail-content" v-loading="loading">
      <div v-show="contentType == 'baseInfo'" class="detail-content-left wbgc-card full-view">
        <!--仪表设备-->
        <div v-if="deviceType == 2">
          <w-form-model
            v-show="showFile"
            ref="addInfoFormRule"
            :model="addInfoForm"
            :rules="addInfoFormRule"
            v-bind="layout"
            :labelCol="labelColWidth"
          >
            <w-row type="flex" justify="space-between">
              <w-col span="12">
                <w-form-model-item label="仪表名称：" label-for="selectType" prop="equipmentName">
                  <span v-if="preview">{{ addInfoForm.equipmentName }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.equipmentName"
                    placeholder="请输入"
                    style="width: 100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="仪表类型：" label-for="selectType" prop="instrumentType">
                  <span v-if="preview">{{ addInfoForm.instrumentType }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.instrumentType"
                    placeholder="请输入"
                    style="width: 100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="品牌：" label-for="selectType" prop="brand">
                  <span v-if="preview">{{ addInfoForm.brand }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.brand"
                    placeholder="请输入"
                    style="width:100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="型号：" label-for="selectType" prop="model">
                  <span v-if="preview">{{ addInfoForm.model }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.model"
                    placeholder="请输入"
                    style="width: 100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>

              <w-col span="12">
                <w-form-model-item label="数量：" label-for="selectType" prop="quantity">
                  <span v-if="preview">{{ addInfoForm.quantity }}</span>
                  <w-input-number
                    v-else
                    v-model="addInfoForm.quantity"
                    :min="0"
                    style="width: 100%;"
                    placeholder="请输入"
                  />
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="单位：" label-for="selectType" prop="unit">
                  <span v-if="preview">{{ addInfoForm.unit }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.unit"
                    placeholder="请输入"
                    style="width:100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="工艺段：" label-for="selectType" prop="processSection">
                  <span v-if="preview">{{ addInfoForm.processSection }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.processSection"
                    placeholder="请输入"
                    style="width:100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item
                  label="安装位置："
                  label-for="selectType"
                  prop="installationLocation"
                >
                  <span v-if="preview">{{ addInfoForm.installationLocation }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.installationLocation"
                    placeholder="请输入"
                    style="width:100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="参数：" label-for="selectType" prop="parameters">
                  <span v-if="preview">{{ addInfoForm.parameters }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.parameters"
                    placeholder="请输入"
                    style="width:100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="原理：" label-for="selectType" prop="principle">
                  <span v-if="preview">{{ addInfoForm.principle }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.principle"
                    placeholder="请输入"
                    style="width:100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item
                  label="清洁周期(天)："
                  label-for="selectType"
                  prop="cleaningPeriod"
                >
                  <span v-if="preview">{{ addInfoForm.cleaningPeriod }}</span>
                  <w-input-number
                    v-else
                    v-model="addInfoForm.cleaningPeriod"
                    :min="0"
                    style="width: 100%;"
                    placeholder="请输入"
                  />
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item
                  label="上一次清洁时间："
                  label-for="selectType"
                  prop="lastCleaningTime"
                >
                  <span v-if="preview">{{ addInfoForm.lastCleaningTime }}</span>
                  <w-date-picker
                    v-else
                    v-model="addInfoForm.lastCleaningTime"
                    style="width:100%"
                    placeholder="请输入"
                    allowClear
                  />
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item
                  label="校准周期(天)："
                  label-for="selectType"
                  prop="calibrationPeriod"
                >
                  <span v-if="preview">{{ addInfoForm.calibrationPeriod }}</span>
                  <w-input-number
                    v-else
                    v-model="addInfoForm.calibrationPeriod"
                    :min="0"
                    style="width: 100%;"
                    placeholder="请输入"
                  />
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item
                  label="上一次校准时间："
                  label-for="selectType"
                  prop="lastCalibrationTime"
                >
                  <span v-if="preview">{{ addInfoForm.lastCalibrationTime }}</span>
                  <w-date-picker
                    v-else
                    v-model="addInfoForm.lastCalibrationTime"
                    style="width:100%"
                    placeholder="请输入"
                    allowClear
                  />
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="设备位号：" label-for="selectType" prop="equipmentCode">
                  <span v-if="preview">{{ addInfoForm.equipmentCode }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.equipmentCode"
                    placeholder="请输入"
                    style="width:100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="供应商：" label-for="selectType" prop="supplier">
                  <span v-if="preview">{{ addInfoForm.supplier }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.supplier"
                    placeholder="请输入"
                    style="width:100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="其他参数：" label-for="selectType" prop="otherParameters">
                  <span v-if="preview">{{ addInfoForm.otherParameters }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.otherParameters"
                    placeholder="请输入"
                    style="width:100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="24">
                <w-form-model-item
                  label="说明书："
                  label-for="manual"
                  :labelCol="labelColWidth1"
                  :wrapperCol="wrapperCol"
                >
                  <file-list
                    fileCode="manual"
                    :fileList="addInfoForm.manual"
                    @deleteFile="deleteFile1"
                    @uploadFile="uploadFile1"
                  ></file-list>
                </w-form-model-item>
              </w-col>
              <w-col span="24">
                <w-form-model-item
                  label="合格证："
                  label-for="qualityCertificate"
                  :labelCol="labelColWidth1"
                  :wrapperCol="wrapperCol"
                >
                  <file-list
                    fileCode="qualityCertificate"
                    :fileList="addInfoForm.qualityCertificate"
                    @deleteFile="deleteFile1"
                    @uploadFile="uploadFile1"
                  ></file-list>
                </w-form-model-item>
              </w-col>
              <w-col span="24">
                <w-form-model-item
                  label="验收依据："
                  label-for="acceptanceCertificate"
                  :labelCol="labelColWidth1"
                  :wrapperCol="wrapperCol"
                >
                  <file-list
                    fileCode="acceptanceCertificate"
                    :fileList="addInfoForm.acceptanceCertificate"
                    @deleteFile="deleteFile1"
                    @uploadFile="uploadFile1"
                  ></file-list>
                </w-form-model-item>
              </w-col>
              <w-col span="24">
                <w-form-model-item
                  label="照片："
                  label-for="picUrl"
                  :labelCol="labelColWidth1"
                  :wrapperCol="wrapperCol"
                >
                  <img-slider
                    :imgList="addInfoForm.picUrl"
                    @deleteImg="deleteImg"
                    @uploadImg="uploadImg"
                  />
                </w-form-model-item>
              </w-col>
            </w-row>
          </w-form-model>
        </div>

        <!--电气设备-->
        <div v-if="deviceType == 4">
          <w-form-model
            ref="addInfoFormRule"
            :model="addInfoForm"
            :rules="addInfoFormRule"
            v-bind="layout"
            :labelCol="labelColWidth"
          >
            <w-row type="flex" justify="space-between">
              <w-col span="12">
                <w-form-model-item label="设备名称：" label-for="selectType" prop="equipmentName">
                  <span v-if="preview">{{ addInfoForm.equipmentName }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.equipmentName"
                    placeholder="请输入"
                    style="width: 100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="编号：" label-for="selectType" prop="serialNumber">
                  <span v-if="preview">{{ addInfoForm.serialNumber }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.serialNumber"
                    placeholder="请输入"
                    style="width: 100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="下级供电设备：" label-for="selectType" prop="powerSupply">
                  <span v-if="preview">{{ addInfoForm.powerSupply }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.powerSupply"
                    placeholder="请输入"
                    style="width: 100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="型号：" label-for="selectType" prop="model">
                  <span v-if="preview">{{ addInfoForm.model }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.model"
                    placeholder="请输入"
                    style="width: 100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="额定电压：" label-for="selectType" prop="ue">
                  <span v-if="preview">{{ addInfoForm.ue }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.ue"
                    placeholder="请输入"
                    style="width:100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="额定电流：" label-for="selectType" prop="le">
                  <span v-if="preview">{{ addInfoForm.le }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.le"
                    placeholder="请输入"
                    style="width:100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="额定容量：" label-for="selectType" prop="sn">
                  <span v-if="preview">{{ addInfoForm.sn }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.sn"
                    placeholder="请输入"
                    style="width:100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="防护等级：" label-for="selectType" prop="ip">
                  <span v-if="preview">{{ addInfoForm.ip }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.ip"
                    placeholder="请输入"
                    style="width:100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="品牌：" label-for="selectType" prop="brand">
                  <span v-if="preview">{{ addInfoForm.brand }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.brand"
                    placeholder="请输入"
                    style="width:100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="供应商：" label-for="selectType" prop="supplier">
                  <span v-if="preview">{{ addInfoForm.supplier }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.supplier"
                    placeholder="请输入"
                    style="width:100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="数量：" label-for="selectType" prop="quantity">
                  <span v-if="preview">{{ addInfoForm.quantity }}</span>
                  <w-input-number
                    v-else
                    v-model="addInfoForm.quantity"
                    :min="0"
                    style="width: 100%;"
                    placeholder="请输入"
                  />
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="单位：" label-for="selectType" prop="unit">
                  <span v-if="preview">{{ addInfoForm.unit }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.unit"
                    placeholder="请输入"
                    style="width:100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item
                  label="安装位置："
                  label-for="selectType"
                  prop="installationLocation"
                >
                  <span v-if="preview">{{ addInfoForm.installationLocation }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.installationLocation"
                    placeholder="请输入"
                    style="width:100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>

              <w-col span="24">
                <w-form-model-item
                  label="说明书："
                  label-for="manual"
                  :labelCol="labelColWidth1"
                  :wrapperCol="wrapperCol"
                >
                  <file-list
                    fileCode="manual"
                    :fileList="addInfoForm.manual"
                    @deleteFile="deleteFile1"
                    @uploadFile="uploadFile1"
                  ></file-list>
                </w-form-model-item>
              </w-col>
              <w-col span="24">
                <w-form-model-item
                  label="合格证："
                  label-for="qualityCertificate"
                  :labelCol="labelColWidth1"
                  :wrapperCol="wrapperCol"
                >
                  <file-list
                    fileCode="qualityCertificate"
                    :fileList="addInfoForm.qualityCertificate"
                    @deleteFile="deleteFile1"
                    @uploadFile="uploadFile1"
                  ></file-list>
                </w-form-model-item>
              </w-col>
              <w-col span="24">
                <w-form-model-item
                  label="验收依据："
                  label-for="acceptanceCertificate"
                  :labelCol="labelColWidth1"
                  :wrapperCol="wrapperCol"
                >
                  <file-list
                    fileCode="acceptanceCertificate"
                    :fileList="addInfoForm.acceptanceCertificate"
                    @deleteFile="deleteFile1"
                    @uploadFile="uploadFile1"
                  ></file-list>
                </w-form-model-item>
              </w-col>
              <w-col span="24">
                <w-form-model-item
                  label="照片："
                  label-for="picUrl"
                  :labelCol="labelColWidth1"
                  :wrapperCol="wrapperCol"
                >
                  <img-slider
                    :imgList="addInfoForm.picUrl"
                    @deleteImg="deleteImg"
                    @uploadImg="uploadImg"
                  />
                </w-form-model-item>
              </w-col>
            </w-row>
          </w-form-model>
        </div>
        <!--自控设备-->
        <div v-if="deviceType == 3">
          <w-form-model
            ref="addInfoFormRule"
            :model="addInfoForm"
            :rules="addInfoFormRule"
            v-bind="layout"
            :labelCol="labelColWidth"
          >
            <w-row type="flex" justify="space-between">
              <w-col span="12">
                <w-form-model-item label="设备名称：" label-for="selectType" prop="equipmentName">
                  <span v-if="preview">{{ addInfoForm.equipmentName }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.equipmentName"
                    placeholder="请输入"
                    style="width: 100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="品牌：" label-for="selectType" prop="brand">
                  <span v-if="preview">{{ addInfoForm.brand }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.brand"
                    placeholder="请输入"
                    style="width:100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="型号：" label-for="selectType" prop="model">
                  <span v-if="preview">{{ addInfoForm.model }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.model"
                    placeholder="请输入"
                    style="width: 100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>

              <w-col span="12">
                <w-form-model-item label="编号：" label-for="selectType" prop="serialNumber">
                  <span v-if="preview">{{ addInfoForm.serialNumber }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.serialNumber"
                    placeholder="请输入"
                    style="width: 100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="上级供电：" label-for="selectType" prop="powerSupply">
                  <span v-if="preview">{{ addInfoForm.powerSupply }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.powerSupply"
                    placeholder="请输入"
                    style="width: 100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="数量：" label-for="selectType" prop="quantity">
                  <span v-if="preview">{{ addInfoForm.quantity }}</span>
                  <w-input-number
                    v-else
                    v-model="addInfoForm.quantity"
                    :min="0"
                    style="width: 100%;"
                    placeholder="请输入"
                  />
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="单位：" label-for="selectType" prop="unit">
                  <span v-if="preview">{{ addInfoForm.unit }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.unit"
                    placeholder="请输入"
                    style="width:100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item
                  label="位置："
                  label-for="selectType"
                  prop="installationLocation"
                >
                  <span v-if="preview">{{ addInfoForm.installationLocation }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.installationLocation"
                    placeholder="请输入"
                    style="width:100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item
                  label="数据采集范围："
                  label-for="selectType"
                  prop="dataCollectionRange"
                >
                  <span v-if="preview">{{ addInfoForm.dataCollectionRange }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.dataCollectionRange"
                    placeholder="请输入"
                    style="width:100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>

              <w-col span="12">
                <w-form-model-item label="冗余情况：" label-for="selectType" prop="redundancy">
                  <span v-if="preview">{{
                    addInfoForm.redundancy === true
                      ? '有'
                      : addInfoForm.redundancy === false
                      ? '无'
                      : ''
                  }}</span>
                  <w-select v-model="addInfoForm.redundancy" placeholder="请选择">
                    <w-select-option value="true">有</w-select-option>
                    <w-select-option value="false">无</w-select-option>
                  </w-select>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="AI点位：" label-for="selectType" prop="aiPoints">
                  <span v-if="preview">{{ addInfoForm.aiPoints }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.aiPoints"
                    placeholder="请输入"
                    style="width:100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="AO点位：" label-for="selectType" prop="aoPoints">
                  <span v-if="preview">{{ addInfoForm.aoPoints }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.aoPoints"
                    placeholder="请输入"
                    style="width:100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="DI点位：" label-for="selectType" prop="diPoints">
                  <span v-if="preview">{{ addInfoForm.diPoints }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.diPoints"
                    placeholder="请输入"
                    style="width:100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="DO点位：" label-for="selectType" prop="doPoints">
                  <span v-if="preview">{{ addInfoForm.doPoints }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.doPoints"
                    placeholder="请输入"
                    style="width:100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>

              <w-col span="12">
                <w-form-model-item
                  label="模块余量："
                  label-for="selectType"
                  prop="moduleSpareCapacity"
                >
                  <span v-if="preview">{{ addInfoForm.moduleSpareCapacity }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.moduleSpareCapacity"
                    placeholder="请输入"
                    style="width:100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item
                  label="数据传输至："
                  label-for="selectType"
                  prop="dataTransmissionTo"
                >
                  <span v-if="preview">{{ addInfoForm.dataTransmissionTo }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.dataTransmissionTo"
                    placeholder="请输入"
                    style="width:100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="其他参数：" label-for="selectType" prop="otherParameters">
                  <span v-if="preview">{{ addInfoForm.otherParameters }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.otherParameters"
                    placeholder="请输入"
                    style="width:100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
            </w-row>
          </w-form-model>
        </div>
        <!--机械设备-->
        <div v-if="deviceType == 1">
          <w-form-model
            ref="addInfoFormRule"
            :model="addInfoForm"
            :rules="addInfoFormRule"
            v-bind="layout"
            :labelCol="labelColWidth"
          >
            <w-row type="flex" justify="space-between">
              <w-col span="12">
                <w-form-model-item label="设备名称：" label-for="selectType" prop="equipmentName">
                  <span v-if="preview">{{ addInfoForm.equipmentName }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.equipmentName"
                    placeholder="请输入"
                    style="width: 100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="品牌：" label-for="selectType" prop="brand">
                  <span v-if="preview">{{ addInfoForm.brand }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.brand"
                    placeholder="请输入"
                    style="width:100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="型号：" label-for="selectType" prop="model">
                  <span v-if="preview">{{ addInfoForm.model }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.model"
                    placeholder="请输入"
                    style="width: 100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>

              <w-col span="12">
                <w-form-model-item label="参数：" label-for="selectType" prop="parameters">
                  <span v-if="preview">{{ addInfoForm.parameters }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.parameters"
                    placeholder="请输入"
                    style="width: 100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="数量：" label-for="selectType" prop="quantity">
                  <span v-if="preview">{{ addInfoForm.quantity }}</span>
                  <w-input-number
                    v-else
                    v-model="addInfoForm.quantity"
                    :min="0"
                    style="width: 100%;"
                    placeholder="请输入"
                  />
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="单位：" label-for="selectType" prop="unit">
                  <span v-if="preview">{{ addInfoForm.unit }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.unit"
                    placeholder="请输入"
                    style="width:100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="工艺段：" label-for="selectType" prop="processSection">
                  <span v-if="preview">{{ addInfoForm.processSection }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.processSection"
                    placeholder="请输入"
                    style="width:100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="设备位号：" label-for="selectType" prop="equipmentCode">
                  <span v-if="preview">{{ addInfoForm.equipmentCode }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.equipmentCode"
                    placeholder="请输入"
                    style="width:100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="上级供电：" label-for="selectType" prop="powerSupply">
                  <span v-if="preview">{{ addInfoForm.powerSupply }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.powerSupply"
                    placeholder="请输入"
                    style="width:100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item
                  label="维保周期(天)："
                  label-for="selectType"
                  prop="maintenancePeriod"
                >
                  <span v-if="preview">{{ addInfoForm.maintenancePeriod }}</span>
                  <w-input-number
                    v-else
                    v-model="addInfoForm.maintenancePeriod"
                    :min="0"
                    style="width: 100%;"
                    placeholder="请输入"
                  />
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item
                  label="上一次维保时间："
                  label-for="selectType"
                  prop="lastMaintenanceTime"
                >
                  <span v-if="preview">{{ addInfoForm.lastMaintenanceTime }}</span>
                  <w-date-picker
                    v-else
                    v-model="addInfoForm.lastMaintenanceTime"
                    style="width:100%"
                    placeholder="请输入"
                    allowClear
                  />
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="购置时间：" label-for="selectType" prop="purchaseDate">
                  <span v-if="preview">{{ addInfoForm.purchaseDate }}</span>
                  <w-date-picker
                    v-else
                    v-model="addInfoForm.purchaseDate"
                    style="width:100%"
                    placeholder="请输入"
                    allowClear
                  />
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="供应商：" label-for="selectType" prop="supplier">
                  <span v-if="preview">{{ addInfoForm.supplier }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.supplier"
                    placeholder="请输入"
                    style="width:100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="其他参数：" label-for="selectType" prop="otherParameters">
                  <span v-if="preview">{{ addInfoForm.otherParameters }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.otherParameters"
                    placeholder="请输入"
                    style="width:100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="24">
                <w-form-model-item
                  label="说明书："
                  label-for="manual"
                  :labelCol="labelColWidth1"
                  :wrapperCol="wrapperCol"
                >
                  <file-list
                    fileCode="manual"
                    :fileList="addInfoForm.manual"
                    @deleteFile="deleteFile1"
                    @uploadFile="uploadFile1"
                  ></file-list>
                </w-form-model-item>
              </w-col>
              <w-col span="24">
                <w-form-model-item
                  label="合格证："
                  label-for="qualityCertificate"
                  :labelCol="labelColWidth1"
                  :wrapperCol="wrapperCol"
                >
                  <file-list
                    fileCode="qualityCertificate"
                    :fileList="addInfoForm.qualityCertificate"
                    @deleteFile="deleteFile1"
                    @uploadFile="uploadFile1"
                  ></file-list>
                </w-form-model-item>
              </w-col>
              <w-col span="24">
                <w-form-model-item
                  label="验收依据："
                  label-for="acceptanceCertificate"
                  :labelCol="labelColWidth1"
                  :wrapperCol="wrapperCol"
                >
                  <file-list
                    fileCode="acceptanceCertificate"
                    :fileList="addInfoForm.acceptanceCertificate"
                    @deleteFile="deleteFile1"
                    @uploadFile="uploadFile1"
                  ></file-list>
                </w-form-model-item>
              </w-col>
              <w-col span="24">
                <w-form-model-item
                  label="照片："
                  label-for="picUrl"
                  :labelCol="labelColWidth1"
                  :wrapperCol="wrapperCol"
                >
                  <img-slider
                    :imgList="addInfoForm.picUrl"
                    @deleteImg="deleteImg"
                    @uploadImg="uploadImg"
                  />
                </w-form-model-item>
              </w-col>
            </w-row>
          </w-form-model>
        </div>
      </div>
      <div v-show="contentType == 'extendInfo'" class="detail-content-left wbgc-card full-view">
        <div>
          <w-form-model
            ref="addInfoFormRule"
            :model="addInfoForm"
            :rules="addInfoFormRule"
            v-bind="layout"
            :labelCol="labelColWidth"
          >
            <w-row type="flex" justify="space-between">
              <w-col span="12">
                <w-form-model-item label="区域：" label-for="selectType" prop="area">
                  <span v-if="preview">{{ addInfoForm.area }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.area"
                    placeholder="请输入"
                    style="width: 100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="大类：" label-for="selectType" prop="bigCategory">
                  <span v-if="preview">{{ addInfoForm.bigCategory }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.bigCategory"
                    placeholder="请输入"
                    style="width: 100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="中类：" label-for="selectType" prop="mediumCategory">
                  <span v-if="preview">{{ addInfoForm.mediumCategory }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.mediumCategory"
                    placeholder="请输入"
                    style="width: 100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="小类：" label-for="selectType" prop="smallCategory">
                  <span v-if="preview">{{ addInfoForm.smallCategory }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.smallCategory"
                    placeholder="请输入"
                    style="width: 100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="类型：" label-for="selectType" prop="category">
                  <span v-if="preview">{{ addInfoForm.category }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.category"
                    placeholder="请输入"
                    style="width: 100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item
                  label="故障报修名称："
                  label-for="selectType"
                  prop="faultRepairName"
                >
                  <span v-if="preview">{{ addInfoForm.faultRepairName }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.faultRepairName"
                    placeholder="请输入"
                    style="width: 100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="生产厂家：" label-for="selectType" prop="manufacturer">
                  <span v-if="preview">{{ addInfoForm.manufacturer }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.manufacturer"
                    placeholder="请输入"
                    style="width: 100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item
                  label="投运时间："
                  label-for="selectType"
                  prop="commissioningDate"
                >
                  <span v-if="preview">{{ addInfoForm.commissioningDate }}</span>
                  <w-date-picker
                    v-else
                    v-model="addInfoForm.commissioningDate"
                    style="width: 100%"
                    placeholder="请输入"
                    allowClear
                  ></w-date-picker>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="电机功率：" label-for="selectType" prop="motorPower">
                  <span v-if="preview">{{ addInfoForm.motorPower }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.motorPower"
                    placeholder="请输入"
                    style="width: 100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="额定电流：" label-for="selectType" prop="le">
                  <span v-if="preview">{{ addInfoForm.le }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.le"
                    placeholder="请输入"
                    style="width: 100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item
                  label="处理量："
                  label-for="selectType"
                  prop="processingCapacity"
                >
                  <span v-if="preview">{{ addInfoForm.processingCapacity }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.processingCapacity"
                    placeholder="请输入"
                    style="width: 100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="流量：" label-for="selectType" prop="head">
                  <span v-if="preview">{{ addInfoForm.head }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.head"
                    placeholder="请输入"
                    style="width: 100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="功率：" label-for="selectType" prop="power">
                  <span v-if="preview">{{ addInfoForm.power }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.power"
                    placeholder="请输入"
                    style="width: 100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="风量：" label-for="selectType" prop="airVolume">
                  <span v-if="preview">{{ addInfoForm.airVolume }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.airVolume"
                    placeholder="请输入"
                    style="width: 100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="压力：" label-for="selectType" prop="pressure">
                  <span v-if="preview">{{ addInfoForm.pressure }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.pressure"
                    placeholder="请输入"
                    style="width: 100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="额定转速：" label-for="selectType" prop="ratedSpeed">
                  <span v-if="preview">{{ addInfoForm.ratedSpeed }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.ratedSpeed"
                    placeholder="请输入"
                    style="width: 100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="差转速：" label-for="selectType" prop="differentialSpeed">
                  <span v-if="preview">{{ addInfoForm.differentialSpeed }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.differentialSpeed"
                    placeholder="请输入"
                    style="width: 100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item
                  label="设备参数："
                  label-for="selectType"
                  prop="equipmentParameters"
                >
                  <span v-if="preview">{{ addInfoForm.equipmentParameters }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.equipmentParameters"
                    placeholder="请输入"
                    style="width: 100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="管径：" label-for="selectType" prop="pipeDiameter">
                  <span v-if="preview">{{ addInfoForm.pipeDiameter }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.pipeDiameter"
                    placeholder="请输入"
                    style="width: 100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="精度：" label-for="selectType" prop="accuracy">
                  <span v-if="preview">{{ addInfoForm.accuracy }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.accuracy"
                    placeholder="请输入"
                    style="width: 100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="量程：" label-for="selectType" prop="range">
                  <span v-if="preview">{{ addInfoForm.range }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.range"
                    placeholder="请输入"
                    style="width: 100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item
                  label="测定方式："
                  label-for="selectType"
                  prop="measurementMethod"
                >
                  <span v-if="preview">{{ addInfoForm.measurementMethod }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.measurementMethod"
                    placeholder="请输入"
                    style="width: 100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="分辨率：" label-for="selectType" prop="resolution">
                  <span v-if="preview">{{ addInfoForm.resolution }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.resolution"
                    placeholder="请输入"
                    style="width: 100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item
                  label="测量原理："
                  label-for="selectType"
                  prop="measurementPrinciple"
                >
                  <span v-if="preview">{{ addInfoForm.measurementPrinciple }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.measurementPrinciple"
                    placeholder="请输入"
                    style="width: 100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
              <w-col span="12">
                <w-form-model-item label="重复性：" label-for="selectType" prop="repeatability">
                  <span v-if="preview">{{ addInfoForm.repeatability }}</span>
                  <w-input
                    v-else
                    v-model="addInfoForm.repeatability"
                    placeholder="请输入"
                    style="width: 100%"
                  ></w-input>
                </w-form-model-item>
              </w-col>
            </w-row>
          </w-form-model>
        </div>
      </div>
      <div v-show="contentType == 'deviceLife'" class="detail-content-left wbgc-card full-view">
        <div class="steps">
          <step
            v-for="(item, index) in steps"
            :key="item.dictCode"
            :index="index"
            :data="steps"
            :currentStep="currentStep"
            @changeStep="changeStep"
          ></step>
        </div>
        <w-divider
          style="margin: 4px 0px 4px 24px;width:calc(100% - 24px) !important;min-width: 20px !important;"
        />
        <w-spin :spinning="spinning">
          <div class="form-body">
            <w-form-model
              v-show="showFile"
              ref="addInfoFormRule1"
              :model="formData"
              :rules="addInfoFormRule1"
              v-bind="layout"
              :labelCol="labelColWidth"
            >
              <w-row type="flex" justify="space-between">
                <w-col
                  :span="item.attributeType === 'FILE' ? 24 : 12"
                  v-for="item in formAttributes"
                  :key="item.attributeCode"
                >
                  <w-form-model-item
                    :label="item.attributeName"
                    label-for="selectType"
                    :prop="item.attributeCode"
                    :labelCol="item.attributeType === 'FILE' ? labelColWidth1 : labelColWidth"
                    :wrapperCol="item.attributeType === 'FILE' ? { span: 21 } : { span: 17 }"
                  >
                    <w-date-picker
                      v-if="item.attributeType === 'DATE'"
                      v-model="formData[item.attributeCode]"
                      style="width:100%"
                      placeholder="请输入"
                      allowClear
                    />
                    <file-list
                      v-else-if="item.attributeType === 'FILE'"
                      :fileCode="item.attributeCode"
                      :fileList="formData[item.attributeCode]"
                      @deleteFile="deleteFile"
                      @uploadFile="uploadFile"
                    ></file-list>
                    <w-input
                      v-else
                      v-model="formData[item.attributeCode]"
                      placeholder="请输入"
                      style="width: 100%"
                    ></w-input>
                  </w-form-model-item>
                </w-col>
              </w-row>
            </w-form-model>
          </div>
        </w-spin>
      </div>
      <div v-show="contentType == 'runAnalysis'" class="detail-content-left wbgc-card full-view">
        <w-form-model
          v-show="showFile"
          ref="addInfoFormRule"
          :model="addInfoForm"
          :rules="addInfoFormRule"
          v-bind="layout"
          :labelCol="labelColWidth"
        >
          <w-row type="flex" justify="space-between">
            <w-col span="12">
              <w-form-model-item
                label="运行时间配置："
                label-for="selectType"
                prop="operatingTimeConfig"
              >
                <span v-if="preview">{{ addInfoForm.operatingTimeConfig }}</span>
                <virtual-select
                  v-else
                  v-model="addInfoForm.operatingTimeConfig"
                  :options="renderedOptions"
                  placeholder="请选择监测量"
                  mode="multiple"
                  :virtual-scroll="true"
                  :visible-item-count="50"
                  :maxTagTextLength="10"
                  maxTagPlaceholder="..."
                  :maxTagCount="3"
                  @change="handleSelect"
                ></virtual-select>
              </w-form-model-item>
            </w-col>
            <w-col span="12">
              <w-form-model-item
                label="电流配置："
                label-for="selectType"
                prop="electricCurrentConfig"
              >
                <span v-if="preview">{{ addInfoForm.electricCurrentConfig }}</span>
                <virtual-select
                  v-else
                  v-model="addInfoForm.electricCurrentConfig"
                  :options="renderedOptions"
                  placeholder="请选择监测量"
                  mode="multiple"
                  :virtual-scroll="true"
                  :visible-item-count="50"
                  :maxTagTextLength="10"
                  maxTagPlaceholder="..."
                  :maxTagCount="3"
                  @change="handleSelect"
                ></virtual-select>
              </w-form-model-item>
            </w-col>
            <w-col span="12">
              <w-form-model-item label="模型code：" label-for="selectType" prop="modelCode">
                <span v-if="preview">{{ addInfoForm.modelCode }}</span>
                <w-input
                  v-else
                  v-model="addInfoForm.modelCode"
                  placeholder="请输入"
                  style="width: 100%"
                ></w-input>
              </w-form-model-item>
            </w-col>
            <w-col span="12">
              <w-form-model-item label="设备测点：" label-for="selectType" prop="devicePoints">
                <span v-if="preview">{{ addInfoForm.devicePoints }}</span>
                <virtual-select
                  v-else
                  v-model="addInfoForm.devicePoints"
                  :options="renderedOptions"
                  placeholder="请选择监测量"
                  mode="multiple"
                  :virtual-scroll="true"
                  :visible-item-count="50"
                  :maxTagTextLength="10"
                  maxTagPlaceholder="..."
                  :maxTagCount="3"
                  @change="handleSelect"
                ></virtual-select>
              </w-form-model-item>
            </w-col>
          </w-row>
        </w-form-model>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment';
import step from './components/step.vue';
import DeviceHeader from './components/DeviceHeader.vue';
import VirtualSelect from '@/components/VirtualSelect/index.vue';
import { queryDeviceData } from '@/api/dataBoard.js';
import {
  instrumentEquipmentDetail,
  instrumentEquipmentAdd,
  instrumentEquipmentEdit,
  electricalEquipmentDetail,
  electricalEquipmentAdd,
  electricalEquipmentEdit,
  mechanicalEquipmentDetail,
  mechanicalEquipmentAdd,
  mechanicalEquipmentEdit,
  controlEquipmentAdd,
  controlEquipmentEdit,
  controlEquipmentDetail,
  deviceStagesList,
  deviceStageAttributesList,
  deviceStageValuesAdd,
  deviceStageValuesEdit,
  deviceStageValuesByDevice
} from '@/api/deviceLedger';
import { deepClone } from '@/utils/util';
export default {
  name: 'DeviceDetail',
  components: {
    DeviceHeader,
    step,
    VirtualSelect,
    ImgSlider: () => import('@/views/pressureEquipments/ImgDeviceSlider.vue'),
    FileList: () => import('@/views/pressureEquipments/FileList.vue')
  },
  inject: ['closeTab'],
  data() {
    return {
      loading: false,
      showFile: true,
      deviceId: undefined,
      equipmentType: '',
      formAttributes: [],
      steps: [],
      labelColWidth1: {
        span: 3
      },
      spinning: false,
      currentStep: '',
      contentType: 'baseInfo',
      meths: [
        {
          deviceType: '机械设备',
          detailMeth: mechanicalEquipmentDetail,
          addMeth: mechanicalEquipmentAdd,
          editMeth: mechanicalEquipmentEdit
        },
        {
          deviceType: '仪表设备',
          detailMeth: instrumentEquipmentDetail,
          addMeth: instrumentEquipmentAdd,
          editMeth: instrumentEquipmentEdit
        },
        {
          deviceType: '自控设备',
          detailMeth: controlEquipmentDetail,
          addMeth: controlEquipmentAdd,
          editMeth: controlEquipmentEdit
        },
        {
          deviceType: '电气设备',
          detailMeth: electricalEquipmentDetail,
          addMeth: electricalEquipmentAdd,
          editMeth: electricalEquipmentEdit
        }
      ],
      deviceType: '',
      type: '',
      deviceDetail: {},
      addInfoForm: {},
      preview: false,
      formData: {},
      addInfoFormRule: {
        equipmentName: [{ required: true, message: '设备名称不能为空', trigger: 'change' }]
      },
      wrapperCol: {
        span: 21
      },
      waterPlantId: '',
      renderedOptions: [], //渲染的回路开关
      pointsList: [], //模型监测量列表
      devicePointArr: [],
      addInfoFormRule1: {},
      detailTitle: '',
      labelColWidth: {
        span: 7
      },
      layout: {
        colon: true, // 冒号
        span: 7,
        wrapperCol: { span: 17 },
        gutter: [12, 8] //栅格间隔[水平间距，垂直间距]
      }
    };
  },
  computed: {},
  watch: {},
  created() {
    this.getWaterPlant();
  },
  activated() {
    this.deviceDetail = {
      equipmentName: ''
    };
    this.contentType = 'baseInfo';
    this.deviceId = this.$route.query.id;
    this.equipmentType = this.$route.query.equipmentType;
    this.type = this.$route.query.type;
    this.deviceType = this.$route.query.deviceType ? Number(this.$route.query.deviceType) : 1;
    this.detailTitle =
      this.meths[this.deviceType - 1].deviceType +
      `${this.type === 'edit' ? '编辑' : '新增'}` +
      (this.deviceDetail?.equipmentName ? ` - ${this.deviceDetail?.equipmentName}` : '');
    this.getDeviceStagesList();
    if (this.deviceId) {
      this.getDeviceDetail();
    }
  },
  methods: {
    async getWaterPlant() {
      const { resultData } = await this.$http.post('waterPlantClient/getWaterPlants');
      this.waterPlantId = resultData?.[0]?.id || '';
      this.getForecastCodeList(this.waterPlantId);
    },
    /* 所有设备监测量 */
    getForecastCodeList(val) {
      if (!val) return;
      let params = {
        waterPlantId: val
      };
      queryDeviceData(params).then(res => {
        if (res.status === 'complete') {
          let tempArr = [];
          this.devicePointArr = res.resultData;
          res.resultData.forEach(item => {
            let deviceList = item.deviceDataList.map(point => {
              return {
                ...item,
                ...point,
                label: item.deviceName + '_' + point.pointMemoAlias,
                value: item.deviceId + '//' + point.pointName,
                key: item.deviceId + '//' + point.pointName
              };
            });
            tempArr.push(...deviceList);
          });
          this.pointsList = tempArr;
          this.renderedOptions = tempArr;
        }
      });
    },
    // 被选中时调用，参数为选中项的 value (或 key) 值
    handleSelect(val) {
      console.log('1111', val);
    },
    uploadImg(data) {
      data.url =
        (process.env.NODE_ENV === 'development'
          ? `${location.origin}/api`
          : `${location.origin}/main`) + `/userCenterApi/FileManager?url=${data.url}`;
      this.addInfoForm.picUrl.push(data);
    },
    deleteImg(id) {
      let index = this.addInfoForm.picUrl.findIndex(v => v.id === id);
      this.addInfoForm.picUrl.splice(index, 1);
    },
    deleteFile(id, code) {
      let index = this.formData[code].findIndex(v => v.id === id);
      this.formData[code].splice(index, 1);
    },
    uploadFile(data, code) {
      if (!this.formData[code]) this.formData[code] = [];
      this.formData[code].push(data);
      this.showFile = false;
      this.$nextTick(() => {
        this.showFile = true;
      });
    },
    deleteFile1(id, code) {
      let index = this.addInfoForm[code].findIndex(v => v.id === id);
      this.addInfoForm[code].splice(index, 1);
    },
    uploadFile1(data, code) {
      if (!this.addInfoForm[code]) this.addInfoForm[code] = [];
      this.addInfoForm[code].push(data);
      this.showFile = false;
      this.$nextTick(() => {
        this.showFile = true;
      });
    },
    handleRunAnalysis() {
      this.contentType = 'runAnalysis';
    },

    handleDeviceLife() {
      this.contentType = 'deviceLife';
    },
    handleBaseInfo() {
      this.contentType = 'baseInfo';
    },
    handleExtendInfo() {
      this.contentType = 'extendInfo';
    },
    // 获取设备详情
    async getDeviceStagesList() {
      const { resultData, status } = await deviceStagesList();
      if (status === 'complete') {
        this.steps = resultData.map(item => {
          return {
            value: String(item.id),
            label: item.stageName
          };
        });
        this.currentStep = this.steps[0].value || '';
        this.getDeviceStageDetail();
      }
    },
    async getDeviceStageDetail() {
      this.addInfoFormRule1 = {};
      const { resultData, status } = await deviceStageAttributesList(this.currentStep);
      if (status === 'complete') {
        this.formAttributes = resultData.map(item => {
          if (item.isNodeTime || item.isHandler) {
            this.addInfoFormRule1[item.attributeCode] = [
              { required: true, message: item.attributeName + '不能为空', trigger: 'change' }
            ];
          }
          if (item.attributeType === 'DATE') {
            item.attributeValue = '';
          } else if (item.attributeType === 'FILE') {
            item.attributeValue = [];
          } else {
            item.attributeValue = '';
          }
          return item;
        });
        this.getValues();
      }
    },
    async getValues() {
      let params = {
        deviceId: this.deviceId,
        deviceType: this.equipmentType,
        stageId: this.currentStep
      };
      const { resultData, status } = await deviceStageValuesByDevice(params);
      if (status === 'complete') {
        if (resultData.length) {
          this.deviceStageValuesType = 'edit';
          this.realData = resultData[0];
          this.formAttributes.map(item => {
            item.attributeValue =
              resultData[0].find(v => v.attributeId === item.id).attributeValue || '';
            return item;
          });
          this.formAttributes.forEach(v => {
            if (v.attributeType === 'FILE') {
              this.$set(
                this.formData,
                v.attributeCode,
                v.attributeValue ? JSON.parse(v.attributeValue) : []
              );
            } else {
              this.$set(this.formData, v.attributeCode, v.attributeValue);
            }
          });
        } else {
          this.deviceStageValuesType = 'add';
        }
      }
    },
    changeStep(data) {
      this.currentStep = data;
      this.getDeviceStageDetail();
      // this.getList()
    },
    // 获取设备详情
    async getDeviceDetail() {
      this.loading = true;
      let meth = this.meths[this.deviceType - 1].detailMeth;
      const { resultData } = await meth(this.deviceId);
      this.loading = false;
      this.deviceDetail = resultData;
      this.addInfoForm = resultData;
      this.addInfoForm.quantity = this.addInfoForm.quantity ? String(resultData.quantity) : '';
      this.addInfoForm.testReport = this.addInfoForm.testReport
        ? String(this.addInfoForm.testReport)
        : undefined;
      this.addInfoForm.redundancy = this.addInfoForm.redundancy
        ? String(this.addInfoForm.redundancy)
        : undefined;
      this.addInfoForm.manual = this.addInfoForm.manual ? JSON.parse(this.addInfoForm.manual) : [];
      this.addInfoForm.qualityCertificate = this.addInfoForm.qualityCertificate
        ? JSON.parse(this.addInfoForm.qualityCertificate)
        : [];
      this.addInfoForm.acceptanceCertificate = this.addInfoForm.acceptanceCertificate
        ? JSON.parse(this.addInfoForm.acceptanceCertificate)
        : [];
      this.addInfoForm.picUrl = this.addInfoForm.picUrl ? JSON.parse(this.addInfoForm.picUrl) : [];

      this.addInfoForm.operatingTimeConfig = this.addInfoForm.operatingTimeConfig
        ? String(this.addInfoForm.operatingTimeConfig).split(',')
        : [];
      this.addInfoForm.electricCurrentConfig = this.addInfoForm.electricCurrentConfig
        ? String(this.addInfoForm.electricCurrentConfig).split(',')
        : [];
      if (this.addInfoForm.devicePoints?.length) {
        let list = [];
        this.addInfoForm.devicePoints.forEach(device => {
          device?.devicePoints?.forEach(point => {
            list.push(device.deviceId + '//' + point);
          });
        });
        this.addInfoForm.devicePoints = list;
      } else {
        this.addInfoForm.devicePoints = [];
      }
    },

    // 返回
    handleCancel() {
      this.closeTab();
      this.goto('/Comprehensive/DeviceLedger');
    },
    handleSave() {
      if (
        this.contentType === 'baseInfo' ||
        this.contentType === 'runAnalysis' ||
        this.contentType === 'extendInfo'
      ) {
        this.handleSaveBaseInfo();
      } else {
        this.handleSaveDeviceLife();
      }
    },

    handleSaveDeviceLife() {
      this.$refs.addInfoFormRule1.validate(valid => {
        if (valid) {
          this.tableLoading = true;
          if (this.deviceStageValuesType == 'add') {
            let params = this.formAttributes.map(item => {
              let obj = {};

              if (item.attributeType === 'DATE') {
                obj.attributeValue = this.formData[item.attributeCode]
                  ? moment(this.formData[item.attributeCode]).format('YYYY-MM-DD')
                  : '';
              } else if (item.attributeType === 'FILE') {
                obj.attributeValue = JSON.stringify(this.formData[item.attributeCode]);
              } else {
                obj.attributeValue = this.formData[item.attributeCode];
              }
              obj.attributeId = item.id;
              obj.deviceType = this.equipmentType;
              obj.deviceId = this.deviceId;
              obj.stageId = item.stageId;
              return obj;
            });
            deviceStageValuesAdd(params).then(response => {
              this.tableLoading = false;
              if (response.status === 'complete') {
                this.$message.success('保存成功!');
              }
            });
          } else {
            let params = this.realData.map(item => {
              let attributeCode = this.formAttributes.find(v => v.id == item.attributeId)
                .attributeCode;
              item.attributeValue = this.formData[attributeCode];
              return item;
            });
            deviceStageValuesEdit(params).then(response => {
              if (response.status === 'complete') {
                this.tableLoading = false;
                this.$message.success('保存成功!');
              }
            });
          }
        }
      });
    },
    handleSaveBaseInfo() {
      this.$refs.addInfoFormRule.validate(valid => {
        if (!valid) return;

        this.tableLoading = true;
        const params = this.prepareParams();
        const method = this.getApiMethod();

        this.callApi(method, params)
          .then(response => {
            if (response.status === 'complete') {
              this.handleSuccessResponse();
            }
          })
          .finally(() => {
            this.tableLoading = false;
          });
      });
    },
    prepareParams() {
      let cloneForm = { ...this.addInfoForm };
      this.formatDateFields(cloneForm);
      cloneForm = deepClone(cloneForm);
      this.formatFileFields(cloneForm);
      return cloneForm;
    },
    formatDateFields(form) {
      const dateFields = [
        'lastMaintenanceTime',
        'lastCleaningTime',
        'lastCalibrationTime',
        'purchaseDate',
        'commissioningDate'
      ];
      dateFields.forEach(field => {
        form[field] = form[field] ? moment(form[field]).format('YYYY-MM-DD') : '';
      });
    },
    formatFileFields(form) {
      const fileFields = ['manual', 'qualityCertificate', 'acceptanceCertificate', 'picUrl'];
      fileFields.forEach(field => {
        form[field] = form[field] ? JSON.stringify(form[field]) : JSON.stringify([]);
      });
      // 运行分析
      const runFields = ['operatingTimeConfig', 'electricCurrentConfig'];
      runFields.forEach(field => {
        form[field] = form[field] ? form[field].join(',') : '';
      });
      if (form.devicePoints?.length) {
        let deviceMap = {};
        form.devicePoints.forEach(item => {
          let [deviceId, pointName] = item.split('//');
          if (deviceMap[deviceId]) {
            deviceMap[deviceId].devicePoints.push(pointName);
          } else {
            deviceMap[deviceId] = {
              deviceId,
              devicePoints: [pointName]
            };
          }
        });
        form.devicePoints = Object.values(deviceMap);
      } else {
        form.devicePoints = undefined;
      }
    },
    getApiMethod() {
      return this.type === 'add'
        ? this.meths[this.deviceType - 1].addMeth
        : this.meths[this.deviceType - 1].editMeth;
    },
    callApi(method, params) {
      return method(params);
    },
    handleSuccessResponse() {
      const message = this.type === 'add' ? '添加成功!' : '保存成功!';
      this.$message.success(message);
    }
  }
};
</script>

<style lang="less" scoped>
.device-detail-view {
  width: 100%;
  .detail-content {
    height: calc(100% - 77px);
    display: flex;
    flex-direction: row;
    position: relative;
    .detail-content-left {
      flex: 1;
      overflow: auto;
      padding-right: 32px;
      padding-top: 24px;
      .steps {
        padding-left: 30px;
        width: 100%;
        display: flex;
        justify-content: flex-start;
        flex-flow: row wrap;
      }
    }
    .detail-content-right {
      margin-left: 10px;
      width: 240px;
    }
  }
}
</style>
