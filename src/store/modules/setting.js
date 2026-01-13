import { cloneDeep } from 'lodash-es';
// import { constantRouterMap } from '@/config/router.config';
// import { generatorDynamicRouter } from '@/router/generator-routers';
import { formatFullPath } from '@/utils/util';
import config from '@/config/setting.config';
import { flattenMenus } from '@/utils/js/tool/tools';
export default {
  namespaced: true,
  state: {
    isMobile: false,
    isIFrame: false,
    routers: [],
    menuTrees: [],
    addRouters: [],
    buttonCodes: {},
    menuBadge: [],
    activatedFirst: undefined,
    ...config,
    change_inspection: 0,
    searchKey: '',
    frameMapping: null // iframe映射表
  },
  getters: {
    menuTreeList: state => {
      return state.menuTrees;
    },
    menuList: state => {
      return flattenMenus(state.menuTrees);
    },
    menuData(state) {
      return state.addRouters;
    },
    firstMenu(state) {
      const { addRouters: menuData } = state;
      if (menuData.length > 0 && !menuData[0].fullPath) {
        formatFullPath(menuData);
      }
      return menuData.map(item => {
        const menuItem = { ...item };
        delete menuItem.children;
        return menuItem;
      });
    },
    subMenu(state) {
      const { addRouters: menuData, activatedFirst } = state;
        let [{ fullPath } = { fullPath: '' }] = menuData;
      if (!fullPath) {
        formatFullPath(menuData);
      }
      const current = menuData.find(menu => menu.fullPath === activatedFirst);
      return current && current.children ? current.children : [];
    },
    isInIframe(state) {
      if (window.parent !== window && state.isIFrame) {
        return true;
      }
      return false
    }
  },
  mutations: {
    setFullScreen(state, status) {
      state.isShowHeader = status;
      state.isShowMenu = status;
    },
    setSystemName(state, name) {
      state.systemName = name;
    },
    setDevice(state, isMobile) {
      state.isMobile = isMobile;
    },
    setIFrame(state, isIFrame) {
      state.isIFrame = isIFrame;
    },
    setTheme(state, theme) {
      state.theme = {
        ...theme
      };
    },
    setThemeBody(state) {
      document.body.className = `theme--${state.theme.mode} theme-side--${state.theme.sideMode} theme--${state.theme.name}`;
    },
    setLayout(state, layout) {
      state.layout = layout;
    },
    setMenuCollapsed(state, menuCollapsed) {
      state.menuCollapsed = menuCollapsed;
    },
    setMultipage(state, multipage) {
      state.multipage = multipage;
    },
    setFixedHeader(state, fixedHeader) {
      state.fixedHeader = fixedHeader;
    },
    setFixedSideBar(state, fixedSideBar) {
      state.fixedSideBar = fixedSideBar;
    },
    setLang(state, lang) {
      state.lang = lang;
    },
    setRouters: (state, routers) => {
      state.addRouters = routers;
      // state.routers = constantRouterMap.concat(routers);
    },
    setButtonCodes: (state, buttonCodes) => {
      buttonCodes.forEach((item)=>{
        state.buttonCodes[item] = true;
      });
    },
    setMenuTrees: (state, _menuTrees) => {
      state.menuTrees = _menuTrees;
    },
    setActiveedFirst: (state, fullPath) => {
      state.activatedFirst = fullPath;
    },
    setAllMenuBadge(state, menuBadge) {
      state.menuBadge = menuBadge;
    },
    setSearchKey(state, key) {
      state.searchKey = key;
    },
    setMenuBadge(state, badgeData) {
      const badgePath = badgeData.path;
      const badge = badgeData.badge;
      const menuBadge = cloneDeep(state.menuBadge);
      const badgeIndex = menuBadge.findIndex(badge => badge.path === badgePath);
      if (badgeIndex >= 0) {
        menuBadge[badgeIndex] = badge;
        state.menuBadge = menuBadge;
      } else {
        state.menuBadge.push(badge);
      }
    },
    removeMenuBadge(state, badgePath) {
      const badgeIndex = state.menuBadge.findIndex(badge => {
        return badge.path === badgePath;
      });

      if (badgeIndex >= 0) {
        state.menuBadge.splice(badgeIndex, 1);
      }
    },

    // 新建巡检或者修改巡检
    changeInspection: (state) => {
      state.change_inspection++
    },
    SET_FRAME_MAPPING(state, mapping) {
      state.frameMapping = mapping;
    }
  },
  actions: {
    GenerateRoutes({ commit }, { menuTrees, buttonCodes, routes }) {
      commit('setRouters', routes);
      commit('setButtonCodes', buttonCodes);
      commit('setMenuTrees', menuTrees);
    },

    UpdateTheme({ state, commit }, themeName) {
      return new Promise(resolve => {
        let theme = state.themeList.find(e => e.name === themeName);
        if (!theme) {
          theme = state.themeList[0];
        }

        commit('setTheme', theme);
        commit('setThemeBody');
      });
    }
  }
};
