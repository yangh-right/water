<h1 align="center">智慧供水</h1>

<div align="center">
 智慧水务标杆产品
</div>

- 项目地址：https://gitlab.cloud4water.com/WPG_SRC_WEB/wisdom-water.git

## 浏览器支持

现代浏览器及 IE10

## 使用

### clone

```bash
$ git clone https://gitlab.cloud4water.com/WPG_SRC_WEB/wisdom-water.git
```

### yarn

```bash
$ yarn install
$ yarn start
```

更多信息参考 [使用文档](https://gitlab.cloud4water.com/WPG_SRC_WEB/pro-layout/docs)

### git
```bash
yarn global add commitizen @galenjiang/cz-format-extension

git add
git cz # 没有对应的项目就选无

```

### bug
页面不能同时在有key和active钩子时同时工作，需要主动调用刷新方法

### 样式

### component
```
path: /mapNav, component: home/mapNav #首页 地图
path: /cockpit, component: home/cockpit #驾驶舱
path: /inspectList, component: home/inspectList #巡检列表
path: /inspect, component: home/inspect #线上巡检


path: /addRule, component: /alarm/addRule #规则引擎
path: /appList, component: /alarm/appList #业务配置 报警配置
path: /batchAddRegulation, component: /alarm/batchAddRegulation #批量新增
path: /editRegulation, component: /alarm/editRegulation #报警规则
path: /addSeniorRegulation, component: /alarm/addSeniorRegulation #创建高级规则
path: /addRegulation, component: /alarm/addRegulation #创建普通规则
path: /editSeniorRegulation, component: /alarm/editSeniorRegulation #高级规则


path: /analysis/energyData, component: analysis/energyData #系统配置 基础配置类 能耗数据清洗
path: /analysis/systemParam, component: analysis/systemParam #系统配置 基础配置类 系统参数


path: /devOps, component: baseInfo/devOps  # 卡片菜单
path: /business, component: baseInfo/business# 卡片菜单
path: /system, component: baseInfo/system   # 卡片式菜单
path: /baseInfo/noticeList, component: baseInfo/noticeList  # 通知 通告
path: /baseInfo/checkNotice, component: baseInfo/noticeList/checkNotice # 通知 通告详情
path: /baseInfo/creatNoticeList, component: baseInfo/noticeList/noticeCreat  # 通知 新建通告
path: /baseInfo/useLog, component: baseInfo/useLog # 业务 日志
path: /baseInfo/waterWorksConfig, component: baseInfo/waterWorksConfig # 业务配置，水厂配置


path: /config/inspectConfig, component: config/inspectConfig #业务配置  巡检配置
path: /config/superviseGroup, component: config/superviseGroup #系统配置  基础配置类  监测量分组
path: /config/superviseSet, component: config/superviseSet #系统配置  基础配置类  监测量配置
path: /config/setPoints, component: config/setPoints #系统配置 基础配置类 监测量配置 配置操作 配置监测量


path: /configuration/add, component: configuration/ConfigurationEdit #业务配置 组态管理 添加组态
path: /configuration, component: configuration/ConfigurationList #业务配置 组态管理
path: /configuration/edit, component: configuration/ConfigurationEdit #业务配置 组态管理 编辑组态
path: /site/configuration, component: configuration/SiteConfiguration #系统配置 泵房管理 更多操作 组态管理


path: /diagnosis/alarmCenter, component: diagnosis/alarmCenter #报警中心


path: /navPartition/index, component: navPartition/index #系统配置 基础配置类 泵房分区
path: /navPartition/area, component: navPartition/map #系统配置 基础配置类 泵房分区 绘制分区操作


path: /runMonitor/pumpView, component: runMonitor/pumpView #全局搜索框 泵房 泵房数据页
path: /runMonitor/videoPage, component: runMonitor/videoPage #全局搜索框 视频 视频监控页
path: /runMonitor/doorManage, component: runMonitor/doorManage/Index #全局搜索框 门禁 门禁管理页
path: /runMonitor/pumpScore, component: runMonitor/pumpScore #业务配置 泵房评分
path: /lifeControl, component: runMonitor/lifeControl #业务配置 寿命预估配置
path: /runMonitor/pumpDetail, component: runMonitor/pumpDetail #泵房详情


path: /reportCenter, component: report/reportCenter #报表中心
path: /report/pressure, component: report/pressure #报表中心 压力报表
path: /report/waterElec, component: report/waterElec #报表中心 水电量报表
path: /report/energy, component: report/energy #报表中心 能效报表
path: /report/waterQuality, component: report/waterQuality #报表中心 水质报表


path: /manage/pumpConfig, component: pumpCfg/index #系统配置 泵房配置


path: /manage/assets, component: manage/assetsManage #报表中心 资产管理
path: /manage/assetsDetail, component: manage/assetsDetail #报表中心 资产管理 资产详情页 
path: /manage/orderManage, component: manage/wpgOrderList #运维中心 工单列表wpg
path: /manage/orderDetail, component: manage/wpgOrderDetail #运维中心 工单列表wpg 工单详情页
path: /manage/partsManage, component: manage/partsManage #全局搜索框 设备  配件管理页
path: /manage/project, component: manage/projectManage #系统配置  泵房管理类  小区管理
path: /manage/pump, component: manage/pumpManage #系统配置  泵房管理类  泵房管理
path: /manage/pump/other, component: manage/otherDevice #系统配置  泵房管理类  泵房管理  更多操作  其他设备
path: /manage/iot, component: manage/iotManage #iot设备管理
path: /manage/iot/add, component: manage/addIoTDevice #iot设备管理 新增IoT设备
path: /manage/iot/monitor, component: manage/IoTMonitorInfo #iot设备管理 IoT监测量
path: /manage/device, component: manage/devManage #系统配置 泵房管理类 设备管理
path: /manage/waterPump, component: manage/pumpInfo #系统配置 泵房管理类 设备管理 更多操作 水泵信息
path: /manage/componen, component: manage/partsInfo #系统配置 泵房管理类 设备管理 更多操作 配件信息
path: /manage/device/monitor, component: manage/monitorInfo  #系统配置 泵房管理类 设备管理 监测量操作 设备监测量页
path: /manage/device/add, component: manage/addDevice #系统配置 泵房管理类 设备管理 新增设备
path: /manage/tank, component: manage/tankManage #系统配置 泵房管理类 水箱管理


path: /order/devOps, component: order/devOps  #全局搜索框 水箱 水箱运维页
path: /order/knowledge, component: order/knowledge #全局搜索框 知识 运维知识页
path: /order/KnowCollect, component: order/KnowCollect#全局搜索框 知识 运维知识页 知识收藏详情页
path: /order/KnowDetail, component: order/KnowDetail#全局搜索框 知识 运维知识页 知识详情页
path: /order/planManage/inspectPlanManage, component: order/inspectPlanManage #运维中心 运维计划
path: /order/planManage/washPlanManage, component: order/washPlanManage  #运维中心 水箱清洗计划
path: /order/planManage/washTankPlanPreview, component: order/washTankPlanPreview #运维中心 水箱清洗计划 查看操作 清洗详情页 
path: /order/planManage/washTankPlanDetails, component: order/washTankPlanDetails #运维中心 水箱清洗计划 创建 新增清洗计划页


path: /docManage, component: docManage/index ##全局搜索框 文档 文档管理页


# 未知
path: /system-common, component: /system-common 
path: /system-pumpManage, component: /system-pumpManage 
path: /system-baseConfig, component: /system-baseConfig
path: /globalSearch, component: home/globalSearch
```
