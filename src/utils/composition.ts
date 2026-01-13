import {
  inject,
  onMounted,
  onUnmounted,
  provide,
  reactive,
  toRefs,
  ComponentInstance,
  getCurrentInstance,
  watch,
  UnwrapRef,
  onDeactivated,
  onActivated
} from '@vue/composition-api';
import { uniqId } from '@/utils/tools';

import store from '../store';
// import { appContext } from "@/context";
import { Route } from 'vue-router';
import { VNode } from 'vue';
import { Notification } from '@wpg/design-vue/types/notification';
import { APP_PREFIX } from '@/constants';
import { appContext } from '@/context';

/**
 * 获取this
 *
 * @deprecated 用useThis代替
 */
export function getThis() {
  const instance = getCurrentInstance();
  if (!instance) {
    throw new Error('this was not found');
  }
  return instance.proxy as ComponentInstance & { $route: any; $router: any };
}

export function useThis<T>() {
  const instance = getCurrentInstance();
  if (!instance) {
    throw new Error('this was not found');
  }
  return instance.proxy as ComponentInstance & { $route: any; $router: any } & {
    goto: (...res: any[]) => void;
  } & T;
}

export function useRoute() {
  const _this = useThis();
  return _this.$route;
}

/**
 *
 * @export
 * @returns
 * @deprecated 用useStore代替
 */
export function useVuex() {
  return store;
}

export function useStore() {
  return store;
}

interface Path {
  path: string;
  meta: { [key: string]: string };
  params: { [key: string]: string };
  query: { [key: string]: string };
}

export function useCachedRoute(cachedPath: string | string[], root: { $route: Route }) {
  const cachedRoute = reactive<Path>({
    path: '',
    meta: {},
    params: {},
    query: {}
  });

  function getPath(cachedPath) {
    console.log("cachedPath = " + cachedPath);
    const appService = appContext.inject();
    const isMicroApp = appService?.isMicroApp;
    console.log("isMicroApp = " + isMicroApp);
    let pathInDiffSystem: string[] = [];
    let pathInDiffSystem_inMicroApp: string[] = [];
    let pathInDiffSystem_singleApp: string[] = [];
    if (cachedPath instanceof Array) {
      pathInDiffSystem_inMicroApp = cachedPath.map(item => `/${APP_PREFIX}${item}`);
      pathInDiffSystem_singleApp = cachedPath;
    } else {
      pathInDiffSystem_inMicroApp = [`/${APP_PREFIX}${cachedPath}`];
      pathInDiffSystem_singleApp = [cachedPath];
    }
    console.log("pathInDiffSystem_inMicroApp = " + pathInDiffSystem_inMicroApp);
    console.log("pathInDiffSystem_singleApp = " + pathInDiffSystem_singleApp);
    pathInDiffSystem = isMicroApp ? pathInDiffSystem_inMicroApp : pathInDiffSystem_singleApp;
    return pathInDiffSystem;
  }

  watch(
    () => root.$route,
    v => {
      const { path, query, meta, params } = v;
      const pathInDiffSystem = getPath(cachedPath)
      console.log('path = ' + path);
      console.log('pathInDiffSystem= ' + pathInDiffSystem)
      if (pathInDiffSystem.includes(path) || path.includes(pathInDiffSystem[0])) {
        cachedRoute.path = path;
        cachedRoute.meta = { ...meta };
        cachedRoute.params = { ...params };
        cachedRoute.query = { ...query } as any;
      }
    },
    { immediate: true }
  );

  return cachedRoute;
}

export function useRouter() {
  const _this = useThis();

  return _this.$router;
}

export function useMount(fn: () => () => void) {
  let unmountedFn: () => void;
  onMounted(() => {
    unmountedFn = fn();
  });
  onUnmounted(() => unmountedFn && typeof unmountedFn !== 'object' && unmountedFn());
}

export function useActivated(fn: () => () => void) {
  let deactivatedFn: () => void;
  onActivated(() => {
    deactivatedFn = fn();
  });
  onDeactivated(() => deactivatedFn && typeof deactivatedFn !== 'object' && deactivatedFn());
}

type Inject<T> = {
  (): T | undefined;
  (defaultValue: T): T;
};

type Context<T, Args extends any[] = []> = {
  provide: (...args: Args) => void;
  inject: Inject<T>;
};

export function createContext<T, Args extends any[]>(fn: (...args: Args) => T): Context<T, Args>;
export function createContext<T>(value: T): Context<T>;
export function createContext<T, Args extends any[]>(arg: any) {
  const ns = uniqId('context');

  function innerProvide(...args: Args) {
    let providedValue;
    if (typeof arg === 'function') {
      providedValue = arg(...args);
      provide<T>(ns, providedValue);
    } else {
      providedValue = arg;
      provide<T>(ns, providedValue);
    }
  }

  function innerInject(): T | undefined;
  function innerInject(defaultValue: T): T;
  function innerInject(defaultValue?: any) {
    if (!defaultValue) {
      return inject<T>(ns);
    }
    return inject<T>(ns, defaultValue);
  }

  return {
    provide: innerProvide,
    inject: innerInject
  };
}

export function useFetch<Args extends unknown[], Result>(fn: (...args: Args) => Promise<Result>) {
  const state = reactive({
    loading: false,
    data: (undefined as unknown) as Result,
    errorMessage: ''
  });

  async function innerFetch(...args: Args) {
    state.loading = true;
    if (typeof fn !== 'function') {
      throw new Error('参数必须为函数');
    }
    try {
      const res = await fn(...args);
      state.loading = false;
      state.data = res as any;
      state.errorMessage = '';
    } catch (error) {
      state.loading = false;
      state.data = undefined as any;
      if (error instanceof Error) {
        state.errorMessage = error.message || '请求错误';
      } else {
        state.errorMessage = '请求错误';
      }
    }
  }

  return reactive({
    fetch: innerFetch,
    ...toRefs(state)
  });
}

export function useFetchList(fn: (...args: any[]) => any) {
  const state = reactive({
    page: 0,
    size: 0,
    loading: false,
    data: [],
    total: 0,
    errorMessage: ''
  });

  async function innerFetch({ page = 1, size = 20, ...args } = {}) {
    if (page != undefined) {
      state.page = page;
    }
    if (size != undefined) {
      state.size = size;
    }
    state.loading = true;
    if (typeof fn !== 'function') {
      throw new Error('参数必须为函数');
    }
    try {
      /* res 必须固定格式 data, total */
      /* page, size需不要同步？！antd pagination会自动同步到最后一页 */
      const res = await fn({
        ...args,
        page: state.page,
        size: state.size
      });
      state.loading = false;
      state.data = res.data;
      state.total = res.total;
      state.errorMessage = '';
    } catch (error) {
      state.loading = false;
      state.data = []; // ?! 重置为[]， total不变
      if (error instanceof Error) {
        state.errorMessage = error.message || '请求错误';
      } else {
        state.errorMessage = '请求错误';
      }
    }
  }

  return reactive({
    fetch: innerFetch,
    ...toRefs(state)
  });
}

/**
 * 参考element-ui
 *
 * @export
 * @param {object} apis
 */
export function useExpose(apis: object) {
  const instance = getCurrentInstance();

  if (instance) {
    Object.assign(instance.proxy, apis);
  }
}

export function useDebug(apis: object) {
  if (process.env.NODE_ENV === 'production') return;
  const instance = getCurrentInstance();

  onMounted(() => {
    if (instance) {
      Object.assign(instance.data, apis);
    }
  });
}

export function useNotification() {
  const _this = useThis();
  const key = `open${Date.now()}`;

  function open({
    message,
    type,
    description
  }: {
    message: string;
    description: (params: { notification: Notification; key: string; h: any }) => VNode;
    type?: 'success' | 'info' | 'warning' | 'error';
  }) {
    if (type) {
      _this.$notification[type!]({
        message,
        description: (h: any) =>
          description({
            notification: _this.$notification,
            key,
            h
          }),
        key,
        duration: 0
      });
    } else {
      _this.$notification.open({
        message,
        description: (h: any) =>
          description({
            notification: _this.$notification,
            key,
            h
          }),
        key,
        duration: 0
      });
    }
  }
  return open;

  // function close() {}
}
