/*
 * @Description: 请输入....
 * @Author: huhaiou
 * @Date: 2022-02-25 15:16:39
 * @LastEditTime: 2023-06-17 16:52:12
 * @LastEditors: Do not edit
 */
import { APP_PREFIX } from '@/constants';

// 此配置为系统默认设置
export default {
  lang: 'CN', // 语言，可选 CN(简体)、HK(繁体)、US(英语)，也可扩展其它语言
  name: 'pro-layout',
  companyName: '上海威派格智慧水务', // 公司名称
  systemName: '二次供水管理系统', // 系统名称
  systemCode: APP_PREFIX,
  versionTime: '202007',
  version: 'V4.1',
  versionType: 'release',
  platform: 'V2.0',
  buildTag: 'WPGSecondaryWaterSupply.202103191350.release',
  isShowTheme: false, // 是否显示多主题
  isShowMenu: true, // 是否显示菜单
  isTopClickMenu: true, // 顶级菜单是否可以点击
  isShowHeader: true, // 是否显示顶部
  isHeaderColor: true, // 多主题时头部是否启用背景
  theme: {
    name: 'emerald',
    sideMode: 'dark', // 左边菜单栏主题
    // 主题
    mode: 'light' // 主题模式 可选 dark、 light
  },
  layout: 'side', // 导航布局，可选 side 和 head，分别为侧边导航和顶部导航
  fixedHeader: true, // 固定头部状态栏，true:固定，false:不固定
  fixedSideBar: true, // 固定侧边栏，true:固定，false:不固定
  pageWidth: 'fixed', // 内容区域宽度，fixed:固定宽度，fluid:流式宽度
  multiPage: true, // 多页签模式，true:开启，false:不开启
  hideSetting: false, // 隐藏设置抽屉，true:隐藏，false:不隐藏
  copyright: '版权所有©上海威派格智慧水务股份有限公司', // copyright
  asyncRoutes: true, // 异步加载路由，true:开启，false:不开启
  showPageTitle: true, // 是否显示页面标题（PageLayout 布局中的页面标题），true:显示，false:不显示
  filterMenu: true, // 根据权限过滤菜单，true:过滤，false:不过滤
  footerLinks: [],
  ticketAppCode: 'moduleWater',
  darkThemeMap:
    'https://api.map.baidu.com/customimage/tile?&x={x}&y={y}&z={z}&udt=20180711&scale=1&ak=0F7691e465f5d7d161a4771f48ee38ff&styles=t%3Aland%7Ce%3Aall%7Cc%3A%231f2d3eff%2Ct%3Aall%7Ce%3Al.t.s%7Cc%3A%232a3135ff%2Ct%3Aall%7Ce%3Al.t.f%7Cc%3A%239c9a9aff%2Ct%3Aroad%7Ce%3Ag.f%7Cc%3A%231a1d20ff%2Ct%3Aroad%7Ce%3Ag.s%7Cc%3A%2313181bff%2Ct%3Apoi%7Ce%3Al.i%7Cv%3Aoff%2Ct%3Aboundary%7Ce%3Aall%7Cv%3Aon%7Cc%3A%230b0c0dff%2Ct%3Awater%7Ce%3Aall%7Cc%3A%232a4465ff%2Ct%3Agreen%7Ce%3Aall%7Cc%3A%23192232ff%2Ct%3Abuilding%7Ce%3Aall%7Cv%3Aoff%2Ct%3Aroad%7Ce%3Al.i%7Cv%3Aoff%2Ct%3Aadministrative%7Ce%3Al.i%7Cv%3Aoff%2Ct%3Amanmade%7Ce%3Ag.f%7Cc%3A%23192231ff%2Ct%3Aeducationlabel%7Ce%3Al%7Cv%3Aoff%2Ct%3Amedicallabel%7Ce%3Al%7Cv%3Aoff%2Ct%3Ascenicspotslabel%7Ce%3Al%7Cv%3Aoff%2Ct%3Aairportlabel%7Ce%3Al%7Cv%3Aoff%2Ct%3Amanmade%7Ce%3Al%7Cv%3Aoff%2Ct%3Acontinent%7Ce%3Al%7Cv%3Aoff',
  lightThemeMap:
    'https://api.map.baidu.com/customimage/tile?&x={x}&y={y}&z={z}&udt=20210326&scale=1&ak=0F7691e465f5d7d161a4771f48ee38ff&styles=t%3Aland%7Ce%3Aall%7Cc%3A%23edf3f3ff%2Ct%3Awater%7Ce%3Aall%7Cc%3A%23bdd5dbff%2Ct%3Agreen%7Ce%3Aall%7Cc%3A%23dee5e5ff%2Ct%3Aall%7Ce%3Al.i%7Cv%3Aoff%2Ct%3Aroad%7Ce%3Ag.s%7Cc%3A%23dbdbdbff%2Ct%3Aall%7Ce%3Al.t.f%7Cc%3A%237b7a7cff%2Ct%3Aall%7Ce%3Al.t.s%7Cc%3A%23fbfffeff%2Ct%3Aroad%7Ce%3Ag.f%7Cc%3A%23e6eaeaff%2Ct%3Amanmade%7Ce%3Ag.f%7Cc%3A%23dee5e5ff%2Ct%3Amanmade%7Ce%3Al%7Cv%3Aoff%2Ct%3Aeducationlabel%7Ce%3Al%7Cv%3Aoff%2Ct%3Amedicallabel%7Ce%3Al%7Cv%3Aoff%2Ct%3Abuilding%7Ce%3Aall%7Cv%3Aoff%7Cc%3A%23dee5e5ff%2Ct%3Ascenicspotslabel%7Ce%3Al%7Cv%3Aoff',
  levelShowPop: 18, // 地图放大到这一层级显示弹框数据
  productCode: 'water_purification', // 产品code
  productCodeAndroid: 'supply_water_android',
  productCodeIos: 'supply_water_ios'
};

export const themes = [
  {
    label: '雾羽黑',
    value: 'foggy-dark'
  },
  {
    label: '骑士黑',
    value: 'knight-dark'
  },
  {
    label: '星空黑',
    value: 'dark'
  },
  {
    label: '松霜绿',
    value: 'green'
  },
  {
    label: '科技蓝',
    value: 'tech-blue'
  },
  {
    label: '赤烨红',
    value: 'red'
  }
];
