 import { http } from '@kit.NetworkKit';
import { StorageUtil } from './StorageUtil';

/**
 * API响应基础结构
 */
export interface ApiResponse {
  code: number;
  msg: string;
  data?: object | null;
}

/**
 * 聊天API响应结构（字段名为result而非code）
 */
export interface ChatApiResponse {
  result: number;
  data?: object | null;
  cached?: boolean;
}

/**
 * HTTP请求头接口
 */
interface HttpHeaders {
  'Content-Type': string;
}

/**
 * HTTP GET请求选项接口
 */
interface HttpGetOptions {
  method: http.RequestMethod;
  header: HttpHeaders;
  readTimeout: number;
  connectTimeout: number;
}

/**
 * HTTP POST请求选项接口
 */
interface HttpPostOptions {
  method: http.RequestMethod;
  header: HttpHeaders;
  extraData: string;
  readTimeout: number;
  connectTimeout: number;
}

/**
 * HTTP DELETE请求选项接口
 */
interface HttpDeleteOptions {
  method: http.RequestMethod;
  header: HttpHeaders;
  readTimeout: number;
  connectTimeout: number;
}

/**
 * HTTP请求工具类
 * 封装摸鱼派API请求
 */
export class HttpUtil {
  private static readonly BASE_URL = 'https://fishpi.cn';
  private static apiKey: string = '';

  /**
   * 设置API Key
   */
  static setApiKey(key: string): void {
    HttpUtil.apiKey = key;
  }

  /**
   * 获取API Key
   */
  static getApiKey(): string {
    return HttpUtil.apiKey;
  }

  /**
   * 从本地存储加载API Key
   */
  static async loadApiKey(): Promise<string> {
    const key = await StorageUtil.get(StorageUtil.KEY_API_KEY);
    HttpUtil.apiKey = key;
    return key;
  }

  /**
   * 构建带参数的URL
   */
  private static buildUrl(path: string, params?: Map<string, string | number>): string {
    let url = `${HttpUtil.BASE_URL}${path}`;
    const queryParams: string[] = [];

    // 添加请求参数
    if (params) {
      params.forEach((value: string | number, key: string) => {
        queryParams.push(`${key}=${encodeURIComponent(String(value))}`);
      });
    }

    // 添加apiKey
    queryParams.push(`apiKey=${HttpUtil.apiKey}`);

    if (queryParams.length > 0) {
      url += '?' + queryParams.join('&');
    }
    return url;
  }

  /**
   * 发送GET请求
   */
  static async get<T>(path: string, params?: Map<string, string | number>): Promise<T> {
    const httpRequest = http.createHttp();
    const url = HttpUtil.buildUrl(path, params);

    try {
      const header: HttpHeaders = {
        'Content-Type': 'application/json'
      };
      const options: HttpGetOptions = {
        method: http.RequestMethod.GET,
        header: header,
        readTimeout: 15000,
        connectTimeout: 15000
      };
      const response = await httpRequest.request(url, options);

      httpRequest.destroy();

      if (response.responseCode === 200) {
        const result = JSON.parse(response.result as string) as T;
        return result;
      } else {
        throw new Error(`HTTP Error: ${response.responseCode}`);
      }
    } catch (err) {
      httpRequest.destroy();
      if (err instanceof Error) {
        throw err;
      }
      throw new Error(String(err));
    }
  }

  /**
   * Map转JSON字符串
   */
  private static mapToJson(map: Map<string, string | number>): string {
    const obj: Record<string, string | number> = {};
    map.forEach((value: string | number, key: string) => {
      obj[key] = value;
    });
    return JSON.stringify(obj);
  }

  /**
   * 发送POST请求
   */
  static async post<T>(path: string, data?: Map<string, string | number>): Promise<T> {
    const httpRequest = http.createHttp();
    const url = `${HttpUtil.BASE_URL}${path}`;

    // 构建请求体，自动注入apiKey
    const requestBody: Map<string, string | number> = new Map<string, string | number>();
    requestBody.set('apiKey', HttpUtil.apiKey);
    if (data) {
      data.forEach((value: string | number, key: string) => {
        requestBody.set(key, value);
      });
    }

    try {
      const header: HttpHeaders = {
        'Content-Type': 'application/json'
      };
      const options: HttpPostOptions = {
        method: http.RequestMethod.POST,
        header: header,
        extraData: HttpUtil.mapToJson(requestBody),
        readTimeout: 15000,
        connectTimeout: 15000
      };
      const response = await httpRequest.request(url, options);

      httpRequest.destroy();

      if (response.responseCode === 200) {
        const result = JSON.parse(response.result as string) as T;
        return result;
      } else {
        throw new Error(`HTTP Error: ${response.responseCode}`);
      }
    } catch (err) {
      httpRequest.destroy();
      if (err instanceof Error) {
        throw err;
      }
      throw new Error(String(err));
    }
  }

  /**
   * 发送DELETE请求
   */
  static async delete<T>(path: string): Promise<T> {
    const httpRequest = http.createHttp();
    const url = `${HttpUtil.BASE_URL}${path}?apiKey=${HttpUtil.apiKey}`;

    try {
      const header: HttpHeaders = {
        'Content-Type': 'application/json'
      };
      const options: HttpDeleteOptions = {
        method: http.RequestMethod.DELETE,
        header: header,
        readTimeout: 15000,
        connectTimeout: 15000
      };
      const response = await httpRequest.request(url, options);

      httpRequest.destroy();

      if (response.responseCode === 200) {
        const result = JSON.parse(response.result as string) as T;
        return result;
      } else {
        throw new Error(`HTTP Error: ${response.responseCode}`);
      }
    } catch (err) {
      httpRequest.destroy();
      if (err instanceof Error) {
        throw err;
      }
      throw new Error(String(err));
    }
  }

  /**
   * 上传文件
   */
  static async upload(filePath: string): Promise<ApiResponse> {
    const httpRequest = http.createHttp();
    const url = `${HttpUtil.BASE_URL}/upload`;

    try {
      const formDataList: http.MultiFormData[] = [
        {
          name: 'apiKey',
          contentType: 'text/plain',
          data: HttpUtil.apiKey
        },
        {
          name: 'file[]',
          contentType: 'application/octet-stream',
          filePath: filePath
        }
      ];
      const options: http.HttpRequestOptions = {
        method: http.RequestMethod.POST,
        header: {
          'Content-Type': 'multipart/form-data'
        },
        multiFormDataList: formDataList,
        readTimeout: 30000,
        connectTimeout: 15000
      };
      const response = await httpRequest.request(url, options);

      httpRequest.destroy();

      if (response.responseCode === 200) {
        return JSON.parse(response.result as string) as ApiResponse;
      } else {
        throw new Error(`HTTP Error: ${response.responseCode}`);
      }
    } catch (err) {
      httpRequest.destroy();
      if (err instanceof Error) {
        throw err;
      }
      throw new Error(String(err));
    }
  }

  /**
   * 检查响应是否成功
   */
  static isSuccess(response: ApiResponse | ChatApiResponse): boolean {
    // 检查是否有 code 属性
    if ((response as ApiResponse).code !== undefined) {
      return (response as ApiResponse).code === 0;
    }
    // 检查是否有 result 属性
    if ((response as ChatApiResponse).result !== undefined) {
      return (response as ChatApiResponse).result === 0;
    }
    return false;
  }
}
