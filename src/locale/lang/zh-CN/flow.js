export default {
  workspace: {
    flowName: '流程名称',
    version: '版本号',
    flowCode: '流程标识',
    remark: '描述说明',
    ticketType: '工单类型',
    createByName: '创建人',
    createTime: '创建日期',
    updateTime: '最后修改时间',
    action: '操作',

    goBack: '返回上级',
    preview: '预览',
    flowHisVersion: '流程历史版本',
    previewImg: '预览流程图',

    query: '查询',
    reset: '重置',
    addFlow: '新增流程',
    hasRelease: '已发布',
    noRelease: '未发布',
    importFlow: '流程导入',
    exportFlows: '流程导出',
    basicInfo: '基本信息',
    flowInfo: '流程信息',
    copy: '复制',
    delete: '删除',
    historyVersion: '历史版本',
    selectFlow: '请选择要导出的流程',
    continueEdit: '继续编辑',
    againEdit: '重新编辑',
    beHisVersion: '当前存在未发布的版本，请选择继续编辑或者重新编辑',
    deleteHisTip: '重新编辑将删除当前未发布的版本，进行重新编辑',
    deleteSuccess: '删除成功',
    deleteTitle: '是否删除',
    deleteTip:
      '如果该流程已绑定工单模板或外部调用，删除该流程将会导致工单无法正常运转，建议确定后删除。',

    flowEdit: '流程编辑',
    publish: '发布',
    save: '保存',
    export: '导出',
    import: '导入',
    saveSuccess: '保存成功！',
    publishSuccess: '发布成功！',
    publishTip:
      '保存编辑信息之后，流程会在当前已生成的版本号基础上加1，已绑定流程的模板，依旧保持当前流程版本，如果想要在模板中使用新的流程，请在模板管理中重新绑定流程。',
    cancelFlowEdit: '是否确定取消流程编辑？',
    cancelFlowEditTip: '取消之后当前编辑内容将不做保存',

    flowTemplateName: '流程模板名称',
    inputTemplateName: '请输入流程模板名称',
    selectBelongType: '请选择归属类型',
    flowRemark: '流程描述',
    inputFlowRemark: '请输入流程说明',
    inputFlowCode: '请输入流程标识',
    flowCodeTip: '流程标识必须包含字母',
    maxNumTip: '超过最大可输入字数！',
    copyForm: '确认复制表单',
    saveAndNext: '保存并下一步',

    flowImport: '导入流程',
    flowImportTip:
      '导入的流程信息将在已发布列表中展示，如果已发布信息中存在相同标识的流程，导入流程将置于未发布列表中',
    clickOrDrag: '点击或将文件拖拽到这里上传',
    supportType: '支持扩展名：.json',
    importSuccess: '导入成功',

    importResultTip:
      '导入流程时已存在以下相同标识的已发布流程，导入流程已保存至未发布的表单中，如想使用导入的流程，请在未发布流程中进行发布使用。',
    check: '查看',
    failImportList: '以下流程导入失败',

    serial: '序号',
    releaseTime: '发布日期',
    invalidTime: '失效日期',
    updateByName: '更新人',

    pleaseInput: '请输入',
    pleaseSelect: '请选择'
  }
};
