import { cryptoFramework } from '@kit.CryptoArchitectureKit';
import { util } from '@kit.ArkTS';

/**
 * 加密工具类
 * 提供MD5等加密功能
 */
export class CryptoUtil {
  /**
   * MD5加密
   * @param input 输入字符串
   * @returns MD5加密后的十六进制字符串
   */
  static async md5(input: string): Promise<string> {
    try {
      // 创建MD5算法实例
      const md = cryptoFramework.createMd('MD5');
      
      // 将字符串转换为Uint8Array
      const encoder = new util.TextEncoder();
      const inputData = encoder.encodeInto(input);
      
      // 创建DataBlob对象
      const dataBlob: cryptoFramework.DataBlob = {
        data: inputData
      };
      
      // 更新数据
      await md.update(dataBlob);
      
      // 计算摘要
      const result = await md.digest();
      
      // 将结果转换为十六进制字符串
      const hexString = CryptoUtil.uint8ArrayToHex(result.data);
      
      return hexString;
    } catch (err) {
      if (err instanceof Error) {
        throw err;
      }
      throw new Error('MD5 encryption failed');
    }
  }

  /**
   * Uint8Array转十六进制字符串
   */
  private static uint8ArrayToHex(arr: Uint8Array): string {
    let hex = '';
    for (let i = 0; i < arr.length; i++) {
      const byte = arr[i];
      const hexByte = byte.toString(16).padStart(2, '0');
      hex += hexByte;
    }
    return hex;
  }
}
