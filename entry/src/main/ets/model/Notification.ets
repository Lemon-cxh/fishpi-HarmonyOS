/**
 * 通知类型
 */
export type NotificationType = 'comment' | 'at' | 'point' | 'sys' | 'following';

/**
 * 通知模型
 */
export interface Notification {
  oId: string;
  type: NotificationType;
  content: string;
  fromUser: string;
  fromUserAvatar: string;
  time: string;
  read: boolean;
}

/**
 * 通知列表响应
 */
export interface NotificationListResponse {
  code: number;
  data: Notification[];
}

/**
 * 未读通知数响应
 */
export interface UnreadCountResponse {
  code: number;
  data: number;
}

/**
 * 私聊会话模型
 */
export interface PrivateChatSession {
  oId: string;
  receiverUserName: string;
  receiverAvatar: string;
  preview: string;          // 最后消息预览
  time: string;
  user_session: string;
  unread?: number;          // 未读数
}

/**
 * 私聊会话列表响应
 */
export interface PrivateChatListResponse {
  code: number;
  data: PrivateChatSession[];
}

/**
 * 私聊消息模型
 */
export interface PrivateMessage {
  oId: string;
  senderUserName: string;
  senderAvatar: string;
  content: string;          // 消息内容（HTML）
  time: string;
  type: string;
}

/**
 * 私聊消息列表响应
 */
export interface PrivateMessageListResponse {
  code: number;
  data: PrivateMessage[];
}

/**
 * 清风明月模型
 */
export interface Breezemoon {
  oId: string;
  breezemoonContent: string;
  breezemoonAuthorName: string;
  breezemoonAuthorAvatarURL: string;
  breezemoonCreateTime: string;
}

/**
 * 清风明月列表响应
 */
export interface BreezemoonListResponse {
  code: number;
  data: Breezemoon[];
}
