/*
 * @Description: 请输入....
 * @Author: huhaiou
 * @Date: 2022-02-25 15:16:39
 * @LastEditTime: 2024-09-12 14:17:24
 * @LastEditors: yuan wenyu
 */
import { mapState } from 'vuex';
import { themeColors } from '@/core/chartConfig';
import mapConfig from '@/config/map.config';
import L from 'leaflet';
export const goto = {
  inject: { closeTab: { from: 'closeTab', default: null } },
  methods: {
    goto(this: any, route) {
      const isInIframe = window.parent !== window;
      if (isInIframe) {
        // keep
      } else {
        if (typeof route === 'string') {
          this.$router.push(route);
        } else {
          this.$router.push({ path: route.path, query: route.query });
        }
      }
    },
    drillDown
  }
};

export function drillDown(this: any, location) {
  if (typeof location === 'string') {
    this.goto({
      path: location,
      query: {
        drillDownTime: new Date().getTime(),
        drillDown: true,
        backPath: this.$router.history.current.fullPath
      }
    });
  } else {
    this.goto({
      ...location,
      query: {
        ...(location?.query ?? {}),
        drillDownTime: new Date().getTime(),
        drillDown: true,
        backPath: this.$router.history.current.fullPath
      }
    });
  }
}

export const assetsRequire = {
  inject: ['state'],
  computed: {
    themeFolder(this: any) {
      // 默认default
      const themeFolderMap = {
        dark: 'dark',
        red: 'red',
        green: 'green'
      };
      return themeFolderMap[this.state.theme] ?? 'default';
    }
  },
  methods: {
    /**
     * require`xxx${'theme'}yyyy` or require('xxxx{{theme}}yyyy')
     *
     * @param {*} this
     * @param {(string[] | string)} stringArr
     * @param {...string[]} values
     * @return {*}
     */
    $require(this: any, stringOrArr: string[] | string, ...values: string[]) {
      // eslint-disable-next-line no-unused-expressions
      const url = this.getUrl(stringOrArr, values);
      if (url.startsWith('@/assets')) {
        try {
          return require(`@/assets${url.replace('@/assets', '')}`);
        } catch (error) {
          const url = this.getUrl(stringOrArr, values, 'default');
          return require(`@/assets${url.replace('@/assets', '')}`);
        }
      }
      return '';
    },

    getUrl(this: any, stringOrArr: string[] | string, values: string[], folder = this.themeFolder) {
      if (typeof stringOrArr === 'string') {
        return this.treatString(stringOrArr, folder);
      } else {
        return this.treatArr(stringOrArr, values, folder);
      }
    },
    treatString(this: any, str: string, folder = this.themeFolder) {
      return str.replace(/{{theme}}/, folder);
    },
    treatArr(this: any, stringArr, values, folder = this.themeFolder) {
      const url = stringArr.reduce((total, cur, index) => {
        const value = values[index] ?? '';
        if (value === 'theme') {
          // 如果不能注入state的话， 用外部注入的魔法字符串`theme.${state.theme}`代替， str.startsWith('theme.'）判断
          return `${total}${cur}${folder}`;
        }
        return `${total}${cur}${value ?? ''}`;
      }, '');
      return url;
    }
  }
};

export const toggleBaseMap = {
  inject: ['state'],
  computed: {
    ...mapState('configure', ['typeMap']), // 地图类型
    /**
     * 根据地图配置信息得到底图的样式ID
     */
    themeId(this: any) {
      const mapId = this.$refs?.wpgMap?.getBasemaps().map(item => item.id);
      // GIS地图方案中至少要配置一个地图底图
      if (this.state.theme === 'dark') {
        return mapId[1] || mapId[0];
      } else {
        return mapId[0];
      }
    }
  },
  watch: {
    /**
     * 监听主题状态
     */
    'state.theme': {
      handler(this: any) {
        this.changeMapTheme();
      }
    }
  },
  methods: {
    /**
     * 地图根据样式ID切换底图
     */
    changeMapTheme(this: any) {
      // 处理gis地图
      if (this.typeMap === 'gis') {
        this.$refs?.wpgMap?.changeBasemap?.(this.themeId);
      } else {
        // 处理非gis地图
        const { vecLayers, imgLayers, config } = mapConfig.onlineMap[this.typeMap];
        // 清空分区
        this.tileLayerGroup && this.tileLayerGroup.clearLayers();
        (this.state.theme === 'dark' ? imgLayers : vecLayers).forEach(layer => {
          L.tileLayer(layer, {
            ...config
          }).addTo(this.tileLayerGroup);
        });
      }
    }
  }
};

export const themeMixin = {
  inject: ['state'],
  data() {
    return {
      themeConfigMap: {}
    };
  },
  computed: {
    theme(this: any) {
      return this.state.theme;
    },
    themeConfig(this: any) {
      const theme = this.state.theme;
      return this.themeConfigMap?.[theme]
        ? this.themeConfigMap[theme]
        : this.themeConfigMap?.default;
    }
  },
  watch: {
    /**
     * 监听主题状态
     */
    'state.theme': {
      handler(this: any) {
        this.themeChange();
      }
    }
  },
  methods: {
    themeChange() {},
    getThemeConfig(this: any, configMap) {
      if (!configMap) {
        configMap = themeColors;
      }
      return configMap?.[this.theme] ? configMap[this.theme] : configMap?.default;
    }
  }
};
