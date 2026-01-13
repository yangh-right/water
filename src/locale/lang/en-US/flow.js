export default {
  workspace: {
    flowName: 'process name',
    version: 'version number',
    flowCode: 'Process ID',
    remark: 'Description',
    ticketType: 'Ticket type',
    createByName: 'Creator',
    createTime: 'Creation Date',
    updateTime: 'Last modification time',
    action: 'operation',

    goBack: 'Return to the superior',
    preview: 'Preview',
    flowHisVersion: 'flow history version',
    previewImg: 'Preview flowchart',

    query: 'Query',
    reset: 'reset',
    addFlow: 'Add new flow',
    hasRelease: 'Released',
    noRelease: 'Not Released',
    importFlow: 'process import',
    exportFlows: 'Process export',
    basicInfo: 'Basic information',
    flowInfo: 'Process information',
    copy: 'Copy',
    delete: 'delete',
    historyVersion: 'historical version',
    selectFlow: 'Please select the flow to export',
    continueEdit: 'Continue editing',
    againEdit: 'Re-edit',
    beHisVersion:
      'Currently there is an unpublished version, please choose to continue editing or re-edit',
    deleteHisTip: 'Re-editing will delete the current unpublished version and re-edit',
    deleteSuccess: 'Delete successful',
    deleteTitle: 'Delete',
    deleteTip:
      'If the process has been bound to a work order template or an external call, deleting the process will cause the work order to fail to function properly. It is recommended to delete it after confirmation. ',

    flowEdit: 'Process Edit',
    publish: 'Publish',
    save: 'Save',
    export: 'export',
    import: 'import',
    saveSuccess: 'Save successfully! ',
    publishSuccess: 'Published successfully! ',
    publishTip:
      'After saving the editing information, the process will add 1 to the currently generated version number. The template bound to the process will still maintain the current process version. If you want to use a new process in the template, please restart the process in the template management Binding process. ',
    cancelFlowEdit: 'Are you sure to cancel flow editing? ',
    cancelFlowEditTip: 'The current editing content will not be saved after canceling',

    flowTemplateName: 'process template name',
    inputTemplateName: 'Please enter the process template name',
    selectBelongType: 'Please select the Belonging Type',
    flowRemark: 'process description',
    inputFlowRemark: 'Please enter a process description',
    inputFlowCode: 'Please enter the process ID',
    flowCodeTip: 'The process ID must contain letters',
    maxNumTip: 'Exceeded the maximum number of characters that can be entered! ',
    copyForm: 'Confirm copy form',
    saveAndNext: 'Save and Next',

    flowImport: 'Import flow',
    flowImportTip:
      'The imported process information will be displayed in the published list. If there is a process with the same identification in the published information, the imported process will be placed in the unpublished list',
    clickOrDrag: 'Click or drag the file here to upload',
    supportType: 'Support extension: .json',
    importSuccess: 'Import successful',

    importResultTip:
      'When importing a process, the following published process with the same identification already exists, and the imported process has been saved in an unpublished form. If you want to use the imported process, please publish it in the unpublished process. ',
    check: 'View',
    failImportList: 'The following processes failed to import',

    serial: 'serial number',
    releaseTime: 'release date',
    invalidTime: 'Expiration date',
    updateByName: 'Update by',

    pleaseInput: 'Please enter',
    pleaseSelect: 'Please select'
  }
};
