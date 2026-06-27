/**
 * 聊天消息模型
 */
export interface ChatMessage {
  oId: string;              // 消息ID
  userName: string;         // 发送者用户名
  userAvatarURL: string;    // 发送者头像
  content: string;          // 消息内容（HTML）
  md: string;               // 消息内容（Markdown）
  time: string;             // 发送时间
  type: string;             // 消息类型
  client: string;           // 客户端标识
}

/**
 * 消息列表响应
 */
export interface MessageListResponse {
  code: number;
  msg: string;
  data: ChatMessage[];
}

/**
 * WebSocket消息类型
 */
export type WsMessageType = 'msg' | 'online' | 'revoke' | 'redPacketStatus' | 'discussChanged' | 'customMessage' | 'barrage';

/**
 * WebSocket消息结构
 */
export interface WsMessage {
  type: WsMessageType;
  oId: string;
  userName: string;
  userAvatarURL: string;
  md: string;
  content: string;
  time: string;
  onlineChatCnt?: number;   // 在线人数
  discuss?: string;         // 当前话题
  who?: string[];           // 红包领取人
  got?: string[];           // 红包获得者
}

/**
 * 红包详情
 */
export interface RedPacketDetail {
  type: string;           // random-随机, average-平均, specify-指定
  money: number;
  count: number;
  gotCount: number;
  who: string[];
  got: number[];
  msg: string;
}

/**
 * 红包信息
 */
export interface RedPacket {
  oId: string;
  userName: string;
  userAvatarURL: string;
  content: string;
  time: string;
  redPacket: RedPacketDetail;
}

/**
 * 红包领取数据
 */
export interface RedPacketData {
  who: string[];
  got: number[];
}

/**
 * 红包领取响应
 */
export interface OpenRedPacketResponse {
  code: number;
  data: RedPacketData;
}

/**
 * 消息组
 */
export interface MessageGroup {
  userId: string;           // 用户ID
  userName: string;         // 用户名
  userAvatarURL: string;    // 用户头像URL
  isSelf: boolean;          // 是否是自己发送的消息
  messages: ChatMessage[];  // 消息列表
  showTime: boolean;        // 是否显示时间分隔线
  timeLabel: string;        // 时间标签文本
}

/**
 * 气泡样式
 */
export interface BubbleStyle {
  topLeft: number;      // 左上圆角
  topRight: number;     // 右上圆角
  bottomLeft: number;   // 左下圆角
  bottomRight: number;  // 右下圆角
}
