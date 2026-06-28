/**
 * 时间工具类
 * 处理时间格式化和转换
 */
export class TimeUtil {
  /**
   * 格式化时间为友好显示
   * @param timestamp 时间戳（秒或毫秒，可以是字符串或数字）或日期字符串
   * @returns 友好的时间字符串
   */
  static formatTime(timestamp: string | number): string {
    // 如果是空值，返回空字符串
    if (!timestamp) {
      return '';
    }
    
    let ts: number;
    
    // 尝试解析各种格式的时间
    if (typeof timestamp === 'string') {
      const str = timestamp.trim();
      
      // 尝试解析为数字时间戳
      const num = parseInt(str, 10);
      if (!isNaN(num) && str === num.toString()) {
        ts = num;
      } else {
        // 尝试解析日期字符串
        // 格式1: "2021-11-10 11:55:52"
        // 格式2: "Wed Nov 10 11:55:52 CST 2021"
        const date = TimeUtil.parseDateString(str);
        if (date) {
          return TimeUtil.formatFromDate(date);
        }
        return str; // 无法解析，返回原字符串
      }
    } else {
      ts = timestamp;
    }
    
    // 检查是否为有效数字
    if (isNaN(ts)) {
      return String(timestamp);
    }
    
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
   * 解析日期字符串
   * 支持格式: "2021-11-10 11:55:52", "Wed Nov 10 11:55:52 CST 2021"
   */
  static parseDateString(str: string): Date | null {
    // 格式1: "2021-11-10 11:55:52"
    const match1 = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})\s+(\d{1,2}):(\d{1,2}):(\d{1,2})$/);
    if (match1) {
      return new Date(
        parseInt(match1[1]),
        parseInt(match1[2]) - 1,
        parseInt(match1[3]),
        parseInt(match1[4]),
        parseInt(match1[5]),
        parseInt(match1[6])
      );
    }
    
    // 格式2: "Wed Nov 10 11:55:52 CST 2021"
    const months: Record<string, number> = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    const match2 = str.match(/^\w{3}\s+(\w{3})\s+(\d{1,2})\s+(\d{1,2}):(\d{1,2}):(\d{1,2})\s+\w+\s+(\d{4})$/);
    if (match2) {
      const month = months[match2[1]];
      if (month !== undefined) {
        return new Date(
          parseInt(match2[6]),
          month,
          parseInt(match2[2]),
          parseInt(match2[3]),
          parseInt(match2[4]),
          parseInt(match2[5])
        );
      }
    }
    
    // 尝试使用 Date 构造函数
    const date = new Date(str);
    if (!isNaN(date.getTime())) {
      return date;
    }
    
    return null;
  }

  /**
   * 从 Date 对象格式化为友好显示
   */
  static formatFromDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();

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
    if (date.toDateString() === now.toDateString()) {
      return TimeUtil.formatHourMinute(date);
    }

    // 昨天
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `昨天 ${TimeUtil.formatHourMinute(date)}`;
    }

    // 今年内
    if (date.getFullYear() === now.getFullYear()) {
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
