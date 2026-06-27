import hilog from "@ohos:hilog";
/**
 * 日志工具类
 * 封装hilog，提供统一的日志输出接口
 */
export class Logger {
    private static readonly DOMAIN = 0xFF00;
    private static readonly PREFIX = 'FishPi';
    /**
     * 输出调试日志
     */
    static debug(tag: string, message: string): void {
        hilog.debug(Logger.DOMAIN, tag, '%{public}s: %{public}s', Logger.PREFIX, message);
    }
    /**
     * 输出信息日志
     */
    static info(tag: string, message: string): void {
        hilog.info(Logger.DOMAIN, tag, '%{public}s: %{public}s', Logger.PREFIX, message);
    }
    /**
     * 输出警告日志
     */
    static warn(tag: string, message: string): void {
        hilog.warn(Logger.DOMAIN, tag, '%{public}s: %{public}s', Logger.PREFIX, message);
    }
    /**
     * 输出错误日志
     */
    static error(tag: string, message: string): void {
        hilog.error(Logger.DOMAIN, tag, '%{public}s: %{public}s', Logger.PREFIX, message);
    }
}
