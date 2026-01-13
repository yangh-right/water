// 通用的数据查找函数
const findPointValue = (resultData, name, defaultValue = '-', includeUnit = true) => {
  if (!resultData) return defaultValue;
  const point = resultData.find(p => p.pointName.includes(name));
  if (!point) return defaultValue;

  return includeUnit && point.pointUnit
    ? `${point.pointValue} ${point.pointUnit}`.trim()
    : point.pointValue || defaultValue;
};

// 创建数据处理器
const createDataProcessor = (valueKeys, options = {}) => {
  const { defaultValue = '-', includeUnit = true } = options;

  return dataList => {
    return dataList.map(item => {
      const processedData = { ...item };

      valueKeys.forEach(key => {
        processedData[key] = findPointValue(item.resultData, key, defaultValue, includeUnit);
      });

      return processedData;
    });
  };
};

// 处理监测量数据
export const processPointsData = createDataProcessor([
  'DO_act',
  'DO_set',
  'Air_Flow',
  'Stroke_Act'
]);

// 处理总管压力数据
export const processPressureData = createDataProcessor(['manual_set', 'pressure_act'], {
  includeUnit: false
});

// 处理控制系统数据
export const processControlData = createDataProcessor(['NH4_act', 'NO3_act']);

// 处理鼓风机组数据
export const processMcpData = createDataProcessor(
  ['Blower_current_4', 'Blower_current_3', 'Blower_current_2', 'Blower_current_1'],
  { includeUnit: false }
);

// 处理状态类数据的通用函数
const createStateProcessor = stateKeys => {
  return createDataProcessor(stateKeys, {
    defaultValue: '0',
    includeUnit: false
  });
};

// 处理鼓风机运行状态数据
export const processRunStateData = createStateProcessor([
  'JQBQ_I_11',
  'JQBQ_I_10',
  'JQBQ_I_9',
  'JQBQ_I_8'
]);

// 处理鼓风机组计算状态数据
export const processGfjStateData = createStateProcessor(['JQBQ_I_12']);

// 处理北池溶解氧手自动状态
export const processDoStateData = createStateProcessor(['JQBQ_I_0']);

// 处理南池溶解氧手自动状态
export const processDoStateSData = createStateProcessor(['JQBQ_I_2']);
