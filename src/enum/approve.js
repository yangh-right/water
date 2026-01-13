// 审批状态
export const APPROVE_STATUS = [
  { code: '0', name: '待审批' },
  { code: '1', name: '已通过' },
  { code: '2', name: '已撤销' },
  { code: '3', name: '已拒绝' }
];

export const APPLY_STATUS = {
  0: { name: '待审批', src: '@/assets/images/default/icons/ic_pend.png' },
  1: { name: '已通过', src: '@/assets/images/default/icons/ic_pass.png' },
  2: { name: '已撤销', src: '@/assets/images/default/icons/ic_cancel.png' },
  3: { name: '已拒绝', src: '@/assets/images/default/icons/ic_refuse.png' }
};

// 审批结果
// export const APPROVE_RESULT = [
//   { code: '0', name: '未通过' },
//   { code: '1', name: '通过' },
//   { code: '2', name: '自动通过' },
//   { code: '3', name: '直接提交' }
// ];
export const APPROVE_RESULT = { 0: '未通过', 1: '通过', 2: '自动通过', 3: '直接提交' };
