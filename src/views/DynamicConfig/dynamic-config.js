import moment from 'moment';

const WithTotalUnitCalcConfig = new Set([
  // 🔒哥
  // '00000000000000000000000000000208',
  'inFlow', // 进水流量
  // '00000000000000000000000000000299',
  'outFlow', // 出水流量
  'outflow_dv',
  // '00000000000000000000000000000300',
  'outPh', // 出水ph
  // '00000000000000000000000000000301',
  'outTurbidity', // 出水浊度
  // '00000000000000000000000000000302',
  'outResidualChlorine', // 出水余氯
  // '00000000000000000000000000000303',
  'outPressure', // 出水压力值
  // 王思鹏
  // '00000000000000000000000000000014',
  'accumulatedOutflowWaterVolume', // 累计出水量
  'accumulatedOutflowWater',
  // '00000000000000000000000000000015',
  'accumulatedInjectedWaterVolume', // 累计进水量
  'accumulatedInjectedWater',
  // '00000000000000000000000000000016',
  'instantOutflowWaterVolume', // 当日瞬时出水量
  'instantOutflowWater',
  // '00000000000000000000000000000017',
  'instantInjectedWaterVolume', // 当日瞬时进水量
  // '00000000000000000000000000000211',
  'accumulatedProductionElectricity', // 累计生产用电
  // '00000000000000000000000000000212',
  'accumulatedTotalElectricity', // 累计总用电
  // '00000000000000000000000000000291',
  'energy_analysis_power', // 泵电耗
  // '00000000000000000000000000000292',
  'energy_analysis_water', // 泵供水量
  // '00000000000000000000000000000293',
  'energy_analysis_pressure', // 泵压力
  // '00000000000000000000000000000294',
  'electricity_total', // 总电量
  // '00000000000000000000000000000295',
  'electricity_production_total', // 生产用电总量
  // '00000000000000000000000000000296',
  'inflow_dv', // 原水进水量
  'water_inflow_total',
  // '00000000000000000000000000000297',
  'water_supply_total', // 供水总量
  '00000000000000000000000000000304',
  '00000000000000000000000000000305',
  // '00000000000000000000000000000306',
  'waterSupplyVolumeYesterday', // 昨日供水量
  '00000000000000000000000000000307',
  // '00000000000000000000000000000214',
  'accumulatedCoolingWaterVolume', // 冷却水累计量
  // '00000000000000000000000000000215',
  'accumulatedBackwashWaterVolume', // 反冲洗累计量
  '00000000000000000000000000000308',
  // '00000000000000000000000000000312',
  'outpump_electricity_total', // 送水泵房用电量
  // '00000000000000000000000000000313',
  'lowpress_electricity_total', // 低压用电量
  // '00000000000000000000000000000314',
  'outPump_Press', // 出水泵压力
  // '00000000000000000000000000000101',
  'powerConsumptionToday', // 今日电耗
  '00000000000000000000000000000209',
  '00000000000000000000000000000210'
]);

const WIthTotalUnitCalcSinlePointConfig = new Set([
  //-------------泵组模型
  // '00000000000000000000000000000800',
  'IntelligentPumpGroupModel', // 智能泵组优化运行模型
  // '00000000000000000000000000000801',
  'IntelligentChlorinationModel', // 智能加氯模型
  '00000000000000000000000000000802',
  '00000000000000000000000000000803',
  '00000000000000000000000000000804',
  '00000000000000000000000000000805',
  '00000000000000000000000000000806',
  '00000000000000000000000000000807',
  '00000000000000000000000000000808',
  '00000000000000000000000000000809',
  '000000000000000000000000000008010',
  '00000000000000000000000000000811',
  '00000000000000000000000000000812',
  '00000000000000000000000000000813',
  '00000000000000000000000000000814',
  '00000000000000000000000000000815',
  '00000000000000000000000000000816',
  '00000000000000000000000000000817',
  '00000000000000000000000000000818',
  '00000000000000000000000000000819',
  '00000000000000000000000000000820'
  //-------------
]);

const WithTotalUnitExtraCalcConfig = new Set([
  // 万冲
  '00000000000000000000000000000205'
]);

const WithExtraCalcConfig = new Set([
  // '00000000000000000000000000000204', '00000000000000000000000000000190'
  'outPump_DataInfo'
]);

const StationDevicePointConfig = new Set([
  // 章邦良
  // '00000000000000000000000000000008',
  'waterInletPressure', // 进水压力实时数据
  // '00000000000000000000000000000098'
  'waterOutletPressure' // 出水压力实时数值
]);

const StructureConfig = new Set([
  // 闫哥
  // '00000000000000000000000000000005'
  'importantProcessRealTimeData', // 重要工艺实时数据
  'realTimeData' // 重要工艺实时数据
]);

const StationConfig = new Set([
  // 闫哥
  // '00000000000000000000000000000001',
  'waterInfuent', // 水质趋势进水
  // '00000000000000000000000000000002',
  'waterEffuent', // 水质趋势出水
  // '00000000000000000000000000000191',
  'processWater', // 过程水
  // 章邦良
  '00000000000000000000000000000018'
]);

const StationDeviceConfig = new Set([
  // 王思鹏
  // '00000000000000000000000000000298'
  'energy_pump_list' // 供水泵展示列表
]);

const WithExtraIndexCalcConfig = new Set([
  // 孙明语
  // '00000000000000000000000000000290'
  'dosingModel' // 加药模型
]);

const WithMDeviceMPointExtraCalcUnitNameConfig = new Set([
  // 万冲
  // '00000000000000000000000000000204'
  'outPump_DataInfo' // 出水泵房出水泵信息
]);

const WithTotalUnitExtraCalcNameConfig = new Set([]);

const WithExtraCalcNameUnitConfig = new Set([
  // 王思鹏
  // '00000000000000000000000000000315'
  'outPumpStation_Group' // 出水泵房工艺段实时数据
]);

const PointConfig = new Set([]);

const StructureWithExtraSvgnameConfig = new Set([
  // 万冲
  // '00000000000000000000000000000400',
  'CDC', // 沉淀池
  // '00000000000000000000000000000401'
  'JFJ' // 加矾间
]);

// 新 组态构筑物配置
const StructureWithSvgnameConfig = new Set([
  // '00000000000000000000000000000603'
  'graphPageStructures' // 组态页面配置构筑物
]);

const RoleConfigTicketTypeConfig = new Set([
  // '00000000000000000000000000000507'
  'roleConfigTicketType' // 角色与工单类型配置
]);

// 组态配置
const SvgConfigTicketTypeConfig = new Set([
  // '00000000000000000000000000000601',
  'graphPageConfig', // 组态页面配置
  // '00000000000000000000000000000602',
  'graphPageConfigDos', // 组态页面配置
  // '00000000000000000000000000000603',
  'graphPageStructures', // 组态页面配置构筑物
  // '00000000000000000000000000000604',
  'graphPageChlorineConfigDos', // 加氯组态页面配置
  // '00000000000000000000000000000605', // 泵组组态页面配置
  'graphPagePumpConfigDos', //
  // '00000000000000000000000000000606'
  'graphPageDispatchConfigDos', // 生产调度组态页面配置
  'produceOperation' //移动端组态配置
]);

const WaterPlantConfig = new Set([
  // '00000000000000000000000000000119'
  'waterPlantConfigure' // 水厂参数配置
]);

const TicketTemplateConfig = new Set([
  // '00000000000000000000000000009001',
  'announcementApplyCode', // 通知公告模板
  // '00000000000000000000000000009002',
  'medicamentTemplateCode', // 生产药剂申购模板
  // '00000000000000000000000000009003',
  'borrowTemplate', // 设备外借模板
  // '00000000000000000000000000009004',
  'allocateTemplate', // 设备调拨模板
  // '00000000000000000000000000009005',
  'scrapTemplate', // 设备报废模板
  // '00000000000000000000000000009006',
  'buyTemplate', // 设备申购模板
  // '00000000000000000000000000009007'
  'installTemplate', // 设备安装模板
  'medicamentAssayTemplateCode'
]);

const DeviceTemplateConfig = new Set([
  // '00000000000000000000000000009008'
  'industry' // 行业设备模板
]);

const WaterPiontConfig = new Set(['cabinWaterQuality']);

//消息模板
const MessageConfig = new Set(['messageConfig']);
const OAIndexConfig = new Set(['showIndex']);

export const columns = [
  {
    dataIndex: 'typeName',
    title: '配置项',
    ellipsis: true,
    width: 180
  },
  {
    dataIndex: 'id',
    title: '配置id',
    ellipsis: true
  },
  {
    dataIndex: 'typeCode',
    title: '配置码',
    ellipsis: true
  },
  {
    dataIndex: 'typeRemarks',
    title: '配置项备注',
    ellipsis: true
  },
  {
    dataIndex: 'createTime',
    ellipsis: true,
    title: '创建时间',
    customRender(text) {
      return text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '--';
    },
    width: 200
  },

  {
    title: '操作',
    dataIndex: 'action',
    type: 'action',
    showType: 'a',
    ellipsis: true,
    align: 'center',
    width: 150,
    events: [
      {
        name: '编辑详情',
        key: 'info'
      }
    ]
  }
];

const calcTypeOptions = [
  {
    label: '求和',
    value: 'sum'
  },
  {
    label: '平均',
    value: 'avg'
  },
  {
    label: '最大值',
    value: 'max'
  },
  {
    label: '最小值',
    value: 'min'
  },
  {
    label: '原始值',
    value: 'val'
  }
];

export {
  StationDevicePointConfig,
  StationDeviceConfig,
  WithTotalUnitCalcConfig,
  WIthTotalUnitCalcSinlePointConfig,
  WithExtraCalcConfig,
  StructureConfig,
  StationConfig,
  calcTypeOptions,
  WithExtraIndexCalcConfig,
  PointConfig,
  WithMDeviceMPointExtraCalcUnitNameConfig,
  StructureWithExtraSvgnameConfig,
  StructureWithSvgnameConfig,
  // WithTotalUnitCalcExtraNameConfig,
  WithTotalUnitExtraCalcConfig,
  RoleConfigTicketTypeConfig,
  WithTotalUnitExtraCalcNameConfig,
  SvgConfigTicketTypeConfig,
  WithExtraCalcNameUnitConfig,
  WaterPlantConfig,
  TicketTemplateConfig,
  DeviceTemplateConfig,
  WaterPiontConfig,
  MessageConfig,
  OAIndexConfig
};
