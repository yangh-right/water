export default {
  workspace: {
    flowName: '流程名稱',
    version: '版本號',
    flowCode: '流程標識',
    remark: '描述說明',
    ticketType: '工單類型',
    createByName: '創建人',
    createTime: '創建日期',
    updateTime: '最後修改時間',
    action: '操作',

    goBack: '返回上級',
    preview: '預覽',
    flowHisVersion: '流程歷史版本',
    previewImg: '預覽流程圖',

    query: '查詢',
    reset: '重置',
    addFlow: '新增流程',
    hasRelease: '已發布',
    noRelease: '未發布',
    importFlow: '流程導入',
    exportFlows: '流程導出',
    basicInfo: '基本信息',
    flowInfo: '流程信息',
    copy: '複製',
    delete: '刪除',
    historyVersion: '歷史版本',
    selectFlow: '請選擇要導出的流程',
    continueEdit: '繼續編輯',
    againEdit: '重新編輯',
    beHisVersion: '當前存在未發布的版本，請選擇繼續編輯或者重新編輯',
    deleteHisTip: '重新編輯將刪除當前未發布的版本，進行重新編輯',
    deleteSuccess: '刪除成功',
    deleteTitle: '是否刪除',
    deleteTip:
      '如果該流程已綁定工單模板或外部調用，刪除該流程將會導致工單無法正常運轉，建議確定後刪除。 ',

    flowEdit: '流程編輯',
    publish: '發布',
    save: '保存',
    export: '導出',
    import: '導入',
    saveSuccess: '保存成功！ ',
    publishSuccess: '發布成功！ ',
    publishTip:
      '保存編輯信息之後，流程會在當前已生成的版本號基礎上加1，已綁定流程的模板，依舊保持當前流程版本，如果想要在模板中使用新的流程，請在模板管理中重新綁定流程。 ',
    cancelFlowEdit: '是否確定取消流程編輯？ ',
    cancelFlowEditTip: '取消之後當前編輯內容將不做保存',

    flowTemplateName: '流程模板名稱',
    inputTemplateName: '請輸入流程模板名稱',
    selectBelongType: '請選擇歸屬類型',
    flowRemark: '流程描述',
    inputFlowRemark: '請輸入流程說明',
    inputFlowCode: '請輸入流程標識',
    flowCodeTip: '流程標識必須包含字母',
    maxNumTip: '超過最大可輸入字數！ ',
    copyForm: '確認複製表單',
    saveAndNext: '保存並下一步',

    flowImport: '導入流程',
    flowImportTip:
      '導入的流程信息將在已發布列表中展示，如果已發布信息中存在相同標識的流程，導入流程將置於未發布列表中',
    clickOrDrag: '點擊或將文件拖拽到這裡上傳',
    supportType: '支持擴展名：.json',
    importSuccess: '導入成功',

    importResultTip:
      '導入流程時已存在以下相同標識的已發布流程，導入流程已保存至未發布的表單中，如想使用導入的流程，請在未發布流程中進行發布使用。 ',
    check: '查看',
    failImportList: '以下流程導入失敗',

    serial: '序號',
    releaseTime: '發布日期',
    invalidTime: '失效日期',
    updateByName: '更新人',

    pleaseInput: '請輸入',
    pleaseSelect: '請選擇'
  }
};
