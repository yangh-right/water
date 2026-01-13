<!--
 * @version: 1.0.1
 * @Author: kk
 * @Date: 2021-11-03 14:53:33
 * @LastEditors: kk
 * @LastEditTime: 2021-11-03 15:05:03
 * @Description: 内容描述
 * @Update: 更新内容
-->
## Props
| props       | Description |
| ----------- | ----------- |
| title       | 标题         |
| extraText   | 右侧文字     |


## 简单使用
```
<simple-module title="标题">
  <template #extra>
    <span @click="func">自定义右侧内容</span>
  </template>
  <!-- 默认插槽 -- 内容 -->
  <span>内容部分</span>
</simple-module>
```

## 头部默认文字
### title优先级 -- props > slot插槽
```
<simple-module title="标题" extraText="右侧内容">
  <template #title>
    <span>左侧标题</span>
  </template>
  <!-- 默认插槽 -- 内容 -->
  <span>内容部分</span>
</simple-module>
```

## 头部默认文字
### extra优先级 -- slot插槽 > props
```
<simple-module title="标题" extraText="右侧内容">
  <template #extra>
    <span @click="func">自定义右侧内容</span>
  </template>
  <!-- 默认插槽 -- 内容 -->
  <span>内容部分</span>
</simple-module>
```