import { genColumnKey, onStore, onRestore } from '../util';

export default {
  name: 'ColumnSetting',
  props: {
    columns: {
      type: Array,
      default: []
    },
    localColumnKey: {
      type: String,
      default: ''
    }
  },
  data() {
    let localColumns = null;
    if (this.localColumnKey) {
      localColumns = onRestore(this.localColumnKey);
    }
    let checkedList =
      localColumns ||
      this.columns.map(({ key, dataIndex }, index) => genColumnKey(key, dataIndex, index));

    this.initCheckList = [...checkedList];

    return {
      indeterminate: true,
      checkAll: false,
      checkedList: checkedList
    };
  },
  watch: {
    columns() {
      let localColumns = null;
      if (this.localColumnKey) {
        localColumns = onRestore(this.localColumnKey);
      }
      let checkedList =
        localColumns ||
        this.columns.map(({ key, dataIndex }, index) => genColumnKey(key, dataIndex, index));

      this.initCheckList = [...checkedList];
      this.checkedList = [...checkedList];
    }
  },
  methods: {
    setColumns(columnMap) {
      Object.assign(this, columnMap);
      if (this.localColumnKey) {
        onStore(this.localColumnKey, this.checkedList);
      }
      this.$emit('change', this.checkedList);
    },
    resetAllChange() {
      // 重置改为全选，原来是重置为进入页面选中列
      const checkedList = this.columns.map(({ key, dataIndex }, index) =>
        genColumnKey(key, dataIndex, index)
      );
      // const checkedList = this.initCheckList;
      this.setColumns({
        checkedList,
        indeterminate: false,
        checkAll: true
      });
    },
    onCheckAllChange(e) {
      let columns = [];
      if (e.target.checked) {
        columns = this.columns;
      } else {
        columns = this.columns.filter(({ defaultChecked }) => !!defaultChecked);
      }

      const checkedList = columns.map(({ key, dataIndex }, index) =>
        genColumnKey(key, dataIndex, index)
      );
      this.setColumns({
        checkedList: checkedList,
        indeterminate: false,
        checkAll: e.target.checked
      });
    },
    onChange(checkedList) {
      this.setColumns({
        indeterminate: !!checkedList.length && checkedList.length < this.columns.length,
        checkAll: checkedList.length === this.columns.length
      });
    }
  },
  render() {
    const className = 'supply-pro-table-column-setting';
    const options = this.columns.map(({ key, dataIndex, title, defaultChecked }, index) => {
      return {
        disabled: defaultChecked,
        label: title,
        value: genColumnKey(key, dataIndex, index)
      };
    });
    const { indeterminate, checkAll } = this;

    return (
      <w-popover
        overlayClassName={`${className}-overlay`}
        trigger="click"
        arrowPointAtCenter
        placement="bottomRight"
      >
        <span class="supply-pro-table-toolbar-item supply-text-secondary hover:supply-text-primary-hover">
          自定义列 <w-icon type="ic_expand_more" />
        </span>
        <div class={`${className}-container`} slot="content">
          <w-checkbox-group
            vModel={this.checkedList}
            options={options}
            class={`${className}`}
            onChange={this.onChange}
          />
          <div class={`${className}-title`}>
            <w-checkbox
              indeterminate={indeterminate}
              checked={checkAll}
              onChange={this.onCheckAllChange}
            >
              列展示
            </w-checkbox>
            <a onClick={this.resetAllChange}>重置</a>
          </div>
        </div>
      </w-popover>
    );
  }
};
