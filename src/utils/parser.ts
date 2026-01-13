import Vue from 'vue';
import { message } from "@wpg/design-vue";
import { AxiosResponse } from 'axios';


/**
 * 提示错误，并抛错, 不返回结果
 *
 * @export
 * @param {*} error
 */
 export function resultCatchMessage(error: any) {
  message.error(error.message || '接口异常');
  throw error
}

/**
 * 获取resultData，只抛错
 *
 * @export
 * @param {*} res
 * @returns
 */
export function resultParseNoMessage(res: any) {
    if (res.data && res.data.status === 'complete') {
        return res.data.resultData;
    } else {
        throw new Error(res && res.data && res.data.errorMessage || '接口异常')
    }
}

/**
 * 获取resultData, 提示错误并抛错
 *
 * @export
 * @template T
 * @param {T} res
 * @returns {T['data']['resultData']}
 */
export function resultParse<T extends {data: { status?: string; resultData?: unknown; errorMessage?: string }}>(res: T): T['data']['resultData'] {
    if (res.data && res.data.status === 'complete') {
        return res.data.resultData
    } else {
      const errorMessage = res && res.data && res.data.errorMessage || '接口异常'
      message.error(errorMessage);
      throw new Error(errorMessage)
    }
}


/**
 * 获取data，用于列表, 只抛错
 *
 * @export
 * @template T
 * @param {AxiosResponse<T>} res
 * @returns {T}
 */
 export function resultParseListNoMessage<T extends { status?: string; errorMessage?: string }>(res: AxiosResponse<T>): T {
  if (res.data && res.data.status === 'complete') {
      return res.data;
  } else {
    const errorMessage = res?.data?.errorMessage ?? '接口异常'
    throw new Error(errorMessage)
  }
}


/**
 * 获取data，用于列表，提示错误并抛错
 *
 * @export
 * @template T
 * @param {AxiosResponse<T>} res
 * @returns {T}
 */
export function resultParseList<T extends { status?: string; errorMessage?: string; resultData?: unknown }>(res: AxiosResponse<T>): T {
    if (res.data && res.data.status === 'complete') {
        return res.data
    } else {
      const errorMessage = res && res.data && res.data.errorMessage || '接口异常'
      message.error(errorMessage);
      throw new Error(errorMessage)
    }
}


/**
 * 用于导出文件
 *
 * @export
 * @param {AxiosResponse} res
 * @returns
 */
export function resultParseBlob(res: AxiosResponse) {
    if (res.data.type === 'application/json') {
        return res.data.text().then((text: string) => {
          try {
            const res = JSON.parse(JSON.parse(text))
            if (res.errorMessage) {
              throw new Error(res.errorMessage)
            }
            throw new Error('excel文件导出失败')
          } catch (error) {
            throw new Error('excel文件导出失败')
          }
        })
    } else {
        return res.data
    }
}
