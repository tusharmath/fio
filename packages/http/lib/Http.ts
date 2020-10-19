/* tslint:disable  no-unbound-method  */

import {QIO} from '@qio/core'
import Axios, {
  AxiosBasicCredentials,
  AxiosError,
  AxiosProxyConfig,
  AxiosResponse,
  Method,
  ResponseType,
} from 'axios'
import * as http from 'http'
import * as https from 'https'
export * from 'axios'

export interface IHttpRequestConfig {
  auth?: AxiosBasicCredentials
  data?: unknown
  headers?: {
    [k: string]: string
  }
  httpAgent?: http.Agent
  httpsAgent?: https.Agent
  maxContentLength?: number
  maxRedirects?: number
  method?: Method
  params?: {
    [k: string]: string | number
  }
  proxy?: AxiosProxyConfig | false
  responseType?: ResponseType
  url?: string
  withCredentials?: boolean
  xsrfCookieName?: string
  xsrfHeaderName?: string
}

export const request = (config: IHttpRequestConfig) =>
  QIO.accessM((_: IHttpEnv) => _.http.request(config))

export interface IHttpEnv {
  http: {
    request(config: IHttpRequestConfig): QIO<AxiosResponse, Error | AxiosError>
  }
}

export const httpEnv = {
  request: (config: IHttpRequestConfig) =>
    QIO.fromAsync<AxiosResponse, AxiosError>((res) => {
      let cancelRequest = () => {}
      Axios.request({
        ...config,
        cancelToken: new Axios.CancelToken(
          (cancel) => (cancelRequest = cancel)
        ),
      }).then(
        (val) => res(QIO.resolve(val)),
        (err) => res(QIO.reject(err))
      )

      return {
        cancel: () => {
          cancelRequest()
        },
      }
    }),
}
