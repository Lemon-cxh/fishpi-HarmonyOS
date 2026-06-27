/**
 * 时间工具类
 * 处理时间格式化和转换
 */
export class TimeUtil {
    /**
     * 格式化时间为友好显示
     * @param timestamp 时间戳（秒或毫秒，可以是字符串或数字）
     * @returns 友好的时间字符串
     */
    static formatTime(timestamp: string | number): string {
        // 转换为数字
        let ts: number = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;
        // 如果是秒级时间戳，转换为毫秒
        if (ts < 10000000000) {
            ts = ts * 1000;
        }
        const now = Date.now();
        const diff = now - ts;
        const date = new Date(ts);
        // 1分钟内
        if (diff < 60 * 1000) {
            return '刚刚';
        }
        // 1小时内
        if (diff < 60 * 60 * 1000) {
            const minutes = Math.floor(diff / (60 * 1000));
            return `${minutes}分钟前`;
        }
        // 今天内
        const today = new Date();
        if (date.toDateString() === today.toDateString()) {
            return TimeUtil.formatHourMinute(date);
        }
        // 昨天
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) {
            return `昨天 ${TimeUtil.formatHourMinute(date)}`;
        }
        // 今年内
        if (date.getFullYear() === today.getFullYear()) {
            return `${date.getMonth() + 1}月${date.getDate()}日 ${TimeUtil.formatHourMinute(date)}`;
        }
        // 跨年
        return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${TimeUtil.formatHourMinute(date)}`;
    }
    /**
     * 格式化为时:分
     */
    static formatHourMinute(date: Date): string {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }
    /**
     * 格式化为完整日期时间
     */
    static formatDateTime(timestamp: string | number): string {
        let ts: number = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;
        if (ts < 10000000000) {
            ts = ts * 1000;
        }
        const date = new Date(ts);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    }
}
