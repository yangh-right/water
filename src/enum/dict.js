/*
 * @Author: chenzh
 * @Date: 2021-01-12 14:39:38
 * @LastEditTime: 2021-01-15 14:35:05
 * @LastEditors: chenzh
 * @Description:
 * @FilePath: /wisdomwatervue/src/enum/dict.js
 */
export const operation_type = [
  { code: '1', name: '报警知识' },
  { code: '2', name: '巡检知识' },
  { code: '3', name: '保养知识' },
  { code: '4', name: '水箱清洗知识' },
  { code: '5', name: '维修知识' },
  { code: '6', name: '其他知识' }
];

export const plan_status = [
  { code: 0, name: '停用' },
  { code: 1, name: '启用' }
];

export const life_day = [
  { code: '1', name: '7天内' },
  { code: '2', name: '15天内' },
  { code: '3', name: '30天内' },
  { code: '4', name: '30天以上' }
];
