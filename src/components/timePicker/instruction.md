# timePicker 组件使用方法

## 1. 配置 timePickerOption 对象

- **defaultTimeType**
  - 可选值：'year', 'month', 'date'
  - 作用：设置默认选中的按钮 年 月 日
- **radioOptions**
  - 作用： 按需显示时间类型按钮
  - 可选值: 数组 如["year", "month", "date"] ，["year", "month"]...
- **disabledDate**
  - 自定义禁用时间
  - 如 禁用明天之后的日期
    ```HTML
      <TimePicker v-model="time" :timePickerOption="{ disabledDate: disabledDate }"></TimePicker>
    ```
    ```javascript
    disabledDate(current) {
    return current && current > moment().add(1, "day");
    }
    ```

## 2. 功能

- 如日期是本日 日期的回显框 显示则本日 去年则显示去年
- 会记录上次选择的时间
- 传入 time 为 undefined， 时间为默认为本年 本日 本月
- 支持初始化

## 3. 注意

1. 绑定的 time 是对象类型

- time: 字符串类型 初始化的 format 形式与 defaultTimeType 一致
  - 如默认的 defaultTimeType 是 "year" 传入的 time 值是“2022”
  - “month” 对应 “2022-02”
  - "date" 对应 "2022-02-22"
- startDate: 开始时间 format:YYYY-MM-DD 00:00:00
- endDate：结束时间 format:YYYY-MM-DD 23:59:59
- type: 所选时间类型 date month year

2. 初始化：
   timeObj:
   {
   time:"2022-03-15",

   }
   或
   timeObj:undefined
