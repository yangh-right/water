# 简单表格页模板

## 模块说明

页面包括头部（`header.vue`）、筛选区（`filter.vue`）、内容区（`content.vue`）以及弹窗（`dialog.vue`）这几个主要部分，搜索组件（`search.vue`）用于筛选区，标签组件（`tabs.vue`）和表格组件（`table.vue`）用于内容区。

如果有需要，这些组件也可以在其他页面中单独引入使用。

## 配置

整体配置位于`config`对象内，通过属性对应相应模块，如：

```js
{
  header:{},
  filter:{},
  content:{},
  dialogs:[{}]
}
```

### 头部

头部配置在`header`属性内，没有配置则不显示。

#### 配置项

| 属性    | 类型     | 默认值 | 描述     |
| ------- | -------- | ------ | -------- |
| `title` | `String` | 无     | 页面标题 |

#### 插槽

| 名称           | 类型     | 描述                                   |
| -------------- | -------- | -------------------------------------- |
| `header-left`  | 具名插槽 | 用于头部左侧（标题右侧）添加自定义内容 |
| `header-right` | 具名插槽 | 用于头部右侧添加自定义内容             |

### 筛选区

筛选区配置在`filter`属性内，没有配置则不显示。

#### 配置项

| 属性      | 类型     | 默认值 | 描述         |
| --------- | -------- | ------ | ------------ |
| `options` | `Object` | 无     | 搜索表单配置 |

##### `options`

```js
{
  // 全局配置
  global: {
    gutter: 'middle', // 表单项间隔，支持数值和字符串，详细参数见antdv的space组件size属性，默认middle
    fieldWidth: 180,  // 表单项控件宽度（不包括label），数值，默认180
    autoMode: false,  // 自动模式，开启后表单数据更新时自动触发查询，默认false
    searchHidden: false,  // 是否隐藏搜索按钮，默认显示
  },
  // 表单项列表
  fields: [
    {
      fieldType: 'input', // 控件类型，目前支持的控件：input、select、treeSelect、yearPicker；
      fieldName: 'name',  // 字段名称
      label: '名称',  // 标签
      placeholder: '请输入',  // 占位提示
      allowClear: true, // 是否允许清除，除非设置为false，否则都可清除
      options: [],  // select控件下拉配置
      treeData: [], // treeSelect控件数据
      disableFuture: false,  // yearPicker控件配置，开启则自动禁用未来日期
      attrs: {},  // 控件额外属性（见antdv对应控件）
      listeners: {},  // 控件事件
      layout: {
        fieldWidth: 200,  // 控件宽度，覆盖全局宽度设置
      }
    }
  ]
}
```

#### 事件

| 名称            | 参数               | 备注         |
| --------------- | ------------------ | ------------ |
| `filter:submit` | `formData<Object>` | 搜索表单提交 |

#### 插槽

| 名称           | 类型     | 描述                         |
| -------------- | -------- | ---------------------------- |
| `filter-right` | 具名插槽 | 用于筛选区右侧添加自定义内容 |

#### 其他

如果需要在外面重置筛选区表单，可以通过调用组件上的`filterReset`方法来处理。

### 内容区

内容区配置在`content`属性内，没有配置则不显示。

#### 配置项

| 属性             | 类型             | 默认值  | 描述                                                       |
| ---------------- | ---------------- | ------- | ---------------------------------------------------------- |
| `headerVisible`  | `Boolean`        | `false` | 内容区头部栏是否显示，头部栏包括里可展示头部标签和插槽内容 |
| `tabs`           | `Array`          | 无      | 头部标签，可用于切换表格，没有配置则不显示                 |
| `currentTab`     | `Number\|String` | 无      | 头部标签选中项                                             |
| `heightAutofill` | `Boolean`        | `false` | 内容区高度是否自动填充，开启后高度为页面剩余高度           |
| `table`          | `Object`         | 无      | 表格配置                                                   |

##### `tabs`

```js
[
  {
    label: '标签一', // 标签名称
    value: 1, // 标签键值
  },
];
```

##### `table`

```js
{
  rowKey: 'id',  // 表格行唯一键，默认为序号
  columns: [],  // 表格列，详细见antdv的table配置
  dataSource: [], // 表格数据
  // 表格分页
  pagination: {
    current: 1,
    pageSize: 10,
    total: 10
  },
  extraAttrs: {}, // 表格额外属性添加
}
```

#### 事件

| 名称                | 参数                               | 备注     |
| ------------------- | ---------------------------------- | -------- |
| `tab:change`        | `tab<Number\|String>`              | 标签切换 |
| `table:page-change` | `page<Number>, size<Number>`       | 表格分页 |
| `table:sort`        | `columnKey<String>, order<String>` | 表格排序 |

#### 插槽

| 名称                   | 类型       | 描述                                                                                  |
| ---------------------- | ---------- | ------------------------------------------------------------------------------------- |
| `content-header`       | 具名插槽   | 用于内容区头部添加自定义内容                                                          |
| `content-header-left`  | 具名插槽   | 用于内容区头部左侧添加自定义内容                                                      |
| `content-header-right` | 具名插槽   | 用于内容区头部右侧添加自定义内容                                                      |
| `table-xxx`            | 作用域插槽 | 用于自定义表格内容，添加前缀`table-`，参数通过`{text, record, index, column}`形式获取 |
| `content-main`         | 具名插槽   | 用于内容区底部添加自定义内容                                                          |

##### `column`自定义插槽使用说明

列定义里添加配置如下：

```js
{
  _title: '工单总数', // 自定义数据
  _tip: '报告期内，创建的工单数量之和', // 自定义数据
  dataIndex: 'createTicket',
  key: 'createTicket',
  width: '10%',
  sorter: true,
  slots: { title: 'gdzs', customTitle },  // 添加插槽配置，title用于插槽名，customTitle为自定义组件，该插槽会传递column（该列配置）给自定义组件，所以可以在列配置里添加相关数据用于自定义组件
},
```

### 弹窗

弹窗配置在`dialogs`属性内，没有配置则不显示。该属性值为数组，可配置任意多个弹窗。弹窗只适用于配置纯表单弹窗，复杂弹窗需要自定义，不可配置。

#### 配置项

| 属性                   | 类型             | 默认值 | 描述                                             |
| ---------------------- | ---------------- | ------ | ------------------------------------------------ |
| `name`                 | `String`         | 无     | 弹窗名称，用于 ref 操作 dom                      |
| `scenes`               | `Array`          | 无     | 弹窗场景，如新增、修改                           |
| `formType`             | `Number\|String` | 无     | 当前场景类型                                     |
| `formData`             | `Object`         | 无     | 表单数据                                         |
| `formOptions`          | `Object`         | 无     | 表单配置，为`customForm`组件配置                 |
| `submitOptionsHandler` | `Function`       | 无     | 提交参数处理，如编辑需要添加`id`等参数可在此处理 |
| `successCallback`      | `Function`       | 无     | 提交成功回调，如更新列表                         |

##### `scenes`

```js
[
  {
    name: '新增', // 场景名称，用于弹窗标题
    type: 1, // 场景类型，与formType对应，标识当前场景
    submitApi: () => {}, // 场景提交api接口
    successTip: '新增成功', // 场景提交成功提示，默认为 [场景名]+成功
  },
];
```

#### 事件

| 名称            | 参数           | 备注                       |
| --------------- | -------------- | -------------------------- |
| `dialog:loaded` | `refs<Object>` | 弹窗句柄暴露，以便操作弹窗 |

##### `refs`

```js
{
  editDialog: {
    open(){}, // 打开弹窗
    close(){},  // 关闭弹窗
    vm:{} // 弹窗实例，以应对更多的弹窗操作，比如操作弹窗内的form，可通过vm.getForm()获取form实例然后进行相关操作
  }
}
```

#### 插槽

| 名称                      | 类型       | 描述                                              |
| ------------------------- | ---------- | ------------------------------------------------- |
| `{dialogName}-{slotName}` | 作用域插槽 | 弹窗内部自定义表单插槽，使用时添加前缀`{弹窗名}-` |
| `default`                 | 匿名插槽   | 用于放置自定义弹窗等内容                          |
