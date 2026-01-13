/*
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2024-10-09 14:59:38
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2024-10-09 15:59:19
 * @Description:
 */
import { handleConfig } from '@/components/SearchTable/util';
export const fillTypeList = [
  { value: 1, label: '操作内容' },
  { value: 2, label: '操作位置' }
];
export function getConfig(_this) {
  const config = {
    searchFields: [
      {
        name: 'fillType',
        type: 'select',
        label: '操作类型'
      }
    ],
    initColumns: [
      {
        title: '序号',
        dataIndex: 'num',
        key: 'num',
        width: 80,
        customRender: (text, row, index) => {
          return index + 1;
        }
      },
      {
        title: '操作类型',
        width: 120,
        ellipsis: true,
        dataIndex: 'fillType'
      },
      {
        title: '内容',
        width: 80,
        ellipsis: true,
        dataIndex: 'contentValue'
      },
      {
        title: '操作',
        type: 'action',
        fixed: 'right',
        width: 120,
        events: [
          {
            name: '详情',
            key: 'detail'
          },
          {
            name: '删除',
            key: 'delete'
          }
        ]
      }
    ],
    detailFields: [
      {
        name: 'fillType',
        type: 'select',
        label: '操作类型',
        rules: [{ required: true, message: '该字段不能为空' }]
      },
      {
        name: 'contentValue',
        type: 'input',
        label: '内容',
        rules: [{ required: true, message: '该字段不能为空' }]
      }
    ]
  };
  handleConfig(config);
  return config;
}
export const typeList = [
  { label: '组', value: '1' },
  { label: '项目', value: '2' }
];
