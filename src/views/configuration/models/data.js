/*
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2024-09-03 16:11:30
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2024-11-07 10:36:09
 * @Description:
 */
// 多维数组扁平化----> 类似flat
import { handleDetailFields } from '@/components/SearchTable/util';
import { computeFontSize } from '@/utils/util';
export const SvgStyleConfig = {
  'point': {
    bodyCustomWidth: 302,
    bodyWidth: 251,
    bodyHeight: 44,
    bodyBg: 'rgba(0,0,0,0.4)',
    nameSize: '16px',
    nameFamily: 'PingFangSC-Regular',
    nameColor: '#fff',
    valueSize: '24px',
    valueColor: '#58D0D3',
    valueFamily: 'HelveticaNeue',
    unitSize: '18px',
    unitWidth: 42,
    unitColor: '#fff',
    splitHeight: 16,
    controlHeight: 26,
    unitFamily: 'PingFangSC-Regular'
  }
}
const deviation = 4
SvgStyleConfig.point.nameTop = getSvgTextTop(SvgStyleConfig.point.bodyHeight, '名称', SvgStyleConfig.point.nameSize, SvgStyleConfig.point.nameFamily)
SvgStyleConfig.point.valueTop = getSvgTextTop(SvgStyleConfig.point.bodyHeight, '0', SvgStyleConfig.point.valueSize, SvgStyleConfig.point.valueFamily) - 2.5
SvgStyleConfig.point.unitTop = getSvgTextTop(SvgStyleConfig.point.bodyHeight, '单位', SvgStyleConfig.point.unitSize, SvgStyleConfig.point.unitFamily) + 0.5
SvgStyleConfig.point.splitTop = (SvgStyleConfig.point.bodyHeight - SvgStyleConfig.point.splitHeight)/2 + 0.5
SvgStyleConfig.point.controlTop = (SvgStyleConfig.point.bodyHeight - SvgStyleConfig.point.controlHeight)/2

export function getSvgTextTop(height, ...text) {
  const textHeight = computeFontSize(...text).height;
  return (height - textHeight) / 2 - deviation
}
export function flatten(arr) {
  return arr.reduce((pre, cur) => {
    return pre.concat(Array.isArray(cur) ? flatten(cur) : cur);
  }, []);
}
export const DEVLIST = [
  {
    deviceId: '1',
    deviceName: '1#设备'
  },
  {
    deviceId: '2',
    deviceName: '2#设备'
  },
  {
    deviceId: '3',
    deviceName: '3#设备'
  },
  {
    deviceId: '4',
    deviceName: '4#设备'
  },
  {
    deviceId: '5',
    deviceName: '5#设备'
  },
  {
    deviceId: '6',
    deviceName: '6#设备'
  },
  {
    deviceId: '7',
    deviceName: '7#设备'
  },
  {
    deviceId: '8',
    deviceName: '8#设备'
  }
];
export const VIDEOLIST = [
  {
    videoId: '1',
    videoName: '1#摄像头'
  },
  {
    videoId: '2',
    videoName: '2#摄像头'
  },
  {
    videoId: '3',
    videoName: '3#摄像头'
  },
  {
    videoId: '4',
    videoName: '4#摄像头'
  },
  {
    videoId: '5',
    videoName: '5#摄像头'
  },
  {
    videoId: '6',
    videoName: '6#摄像头'
  },
  {
    videoId: '7',
    videoName: '7#摄像头'
  },
  {
    videoId: '8',
    videoName: '8#摄像头'
  }
];

export const addPointNum = 10;
export const componentFields = [
  {
    name: 'name',
    type: 'input',
    label: '组件名称',
    placeholder: '请输入组件名称',
    attrs: {
      maxLength: 20
    },
    rules: [
      {
        required: true,
        message: '该字段不能为空!'
      }
    ]
  },
  {
    name: 'iconUrl',
    type: 'input',
    label: '组件图标',
    placeholder: '请输入组件图标'
  }
];
handleDetailFields(componentFields);
export function handleSvgElement(data) {
  if (!data.pointStatusList) {
    data.pointStatusList = [];
  }
  if (!data.controlPoints) {
    data.controlPoints = [];
  }
  if (!data.infoPoints) {
    data.infoPoints = [];
  }
  return data;
}
export const objectTypeList = [
  {
    label: '水泵',
    value: 'pump',
    options: [
      {
        label: '0辅泵',
        value: '0'
      },
      {
        label: '1#泵',
        value: '1'
      },
      {
        label: '2#泵',
        value: '2'
      },
      {
        label: '3#泵',
        value: '3'
      },
      {
        label: '4#泵',
        value: '4'
      },
      {
        label: '5#泵',
        value: '5'
      },
      {
        label: '6#泵',
        value: '6'
      }
    ]
  },
  {
    label: '电动阀',
    value: 'valve',
    options: [
      {
        label: '1#电动阀',
        value: '1'
      },
      {
        label: '2#电动阀',
        value: '2'
      },
      {
        label: '3#电动阀',
        value: '3'
      },
      {
        label: '4#电动阀',
        value: '4'
      }
    ]
  },
  {
    label: '排污泵',
    value: 'sewagePump',
    options: [
      {
        label: '1#排污泵',
        value: '1'
      },
      {
        label: '2#排污泵',
        value: '2'
      },
      {
        label: '3#排污泵',
        value: '3'
      },
      {
        label: '4#排污泵',
        value: '4'
      }
    ]
  },
  {
    label: '门禁',
    value: 'access',
    options: [
      {
        label: '1#门禁',
        value: '1'
      },
      {
        label: '2#门禁',
        value: '2'
      },
      {
        label: '3#门禁',
        value: '3'
      }
    ]
  }
];
export function getElementTypeOptions(list, typeCode) {
  let child = list.find(objectType => objectType.value === typeCode)?.child || [];
  return child.map(item => ({ label: item.name, value: item.value }));
}
