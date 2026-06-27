import { ChatMessage, MessageGroup, BubbleStyle } from '../model/Message';

/**
 * 消息分组工具类
 * 处理消息分组、时间格式化、气泡样式计算
 */
export class MessageGroupUtil {
  /**
   * 格式化时间标签
   * @param time ISO时间字符串
   * @returns 格式化后的时间标签
   */
  static formatTimeLabel(time: string): string {
    const date = new Date(time);
    const now = new Date();
    
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;
    
    // 今天
    if (date.toDateString() === now.toDateString()) {
      return `今天 ${timeStr}`;
    }
    
    // 昨天
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `昨天 ${timeStr}`;
    }
    
    // 今年
    if (date.getFullYear() === now.getFullYear()) {
      return `${date.getMonth() + 1}月${date.getDate()}日 ${timeStr}`;
    }
    
    // 跨年
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${timeStr}`;
  }

  /**
   * 判断是否需要显示时间分隔线
   * @param currentMsg 当前消息
   * @param prevMsg 前一条消息
   * @returns 是否需要显示时间分隔线
   */
  static shouldShowTimeDivider(currentMsg: ChatMessage, prevMsg: ChatMessage | null): boolean {
    if (!prevMsg) return true;
    
    const currentTime = new Date(currentMsg.time);
    const prevTime = new Date(prevMsg.time);
    const timeDiff = currentTime.getTime() - prevTime.getTime();
    
    return timeDiff > 5 * 60 * 1000; // 5分钟
  }

  /**
   * 判断消息是否应该合并到消息组
   * @param currentMsg 当前消息
   * @param group 消息组
   * @returns 是否应该合并
   */
  static shouldMergeToGroup(currentMsg: ChatMessage, group: MessageGroup): boolean {
    // 不同用户不合并
    if (currentMsg.userName !== group.userName) return false;
    
    // 时间间隔超过5分钟不合并
    const lastMsg = group.messages[group.messages.length - 1];
    const lastTime = new Date(lastMsg.time);
    const currentTime = new Date(currentMsg.time);
    const timeDiff = currentTime.getTime() - lastTime.getTime();
    
    return timeDiff <= 5 * 60 * 1000;
  }

  /**
   * 将消息列表分组
   * @param messages 消息列表
   * @param currentUserName 当前用户名
   * @returns 消息组列表
   */
  static groupMessages(messages: ChatMessage[], currentUserName: string): MessageGroup[] {
    if (messages.length === 0) return [];
    
    const groups: MessageGroup[] = [];
    
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      const prevMsg = i > 0 ? messages[i - 1] : null;
      
      // 判断是否需要显示时间分隔线
      const showTime = MessageGroupUtil.shouldShowTimeDivider(msg, prevMsg);
      
      // 判断是否可以合并到上一个组
      if (!showTime && groups.length > 0) {
        const lastGroup = groups[groups.length - 1];
        if (MessageGroupUtil.shouldMergeToGroup(msg, lastGroup)) {
          // 合并到现有组
          lastGroup.messages.push(msg);
          continue;
        }
      }
      
      // 创建新的消息组
      const group: MessageGroup = {
        userId: msg.userName,
        userName: msg.userName,
        userAvatarURL: msg.userAvatarURL,
        isSelf: msg.userName === currentUserName,
        messages: [msg],
        showTime: showTime,
        timeLabel: showTime ? MessageGroupUtil.formatTimeLabel(msg.time) : ''
      };
      
      groups.push(group);
    }
    
    return groups;
  }

  /**
   * 计算气泡圆角样式
   * @param index 消息在组中的索引
   * @param total 组内消息总数
   * @param isSelf 是否是自己发送的消息
   * @returns 气泡圆角样式
   */
  static getBubbleStyle(index: number, total: number, isSelf: boolean): BubbleStyle {
    const radius = 12;
    const sharp = 4;
    
    if (isSelf) {
      // 自己的消息：右上角直角
      if (total === 1) {
        return { topLeft: radius, topRight: sharp, bottomLeft: radius, bottomRight: radius };
      } else if (index === 0) {
        return { topLeft: radius, topRight: sharp, bottomLeft: radius, bottomRight: sharp };
      } else if (index === total - 1) {
        return { topLeft: sharp, topRight: sharp, bottomLeft: radius, bottomRight: radius };
      } else {
        return { topLeft: sharp, topRight: sharp, bottomLeft: sharp, bottomRight: sharp };
      }
    } else {
      // 他人的消息：左上角直角
      if (total === 1) {
        return { topLeft: sharp, topRight: radius, bottomLeft: radius, bottomRight: radius };
      } else if (index === 0) {
        return { topLeft: sharp, topRight: radius, bottomLeft: sharp, bottomRight: radius };
      } else if (index === total - 1) {
        return { topLeft: sharp, topRight: sharp, bottomLeft: radius, bottomRight: radius };
      } else {
        return { topLeft: sharp, topRight: sharp, bottomLeft: sharp, bottomRight: sharp };
      }
    }
  }

  /**
   * 判断消息是否为红包消息
   * @param msg 消息
   * @returns 是否为红包消息
   */
  static isRedPacketMessage(msg: ChatMessage): boolean {
    return msg.type === 'redPacketStatus';
  }
}
