import { webSocket } from '@kit.NetworkKit';
import { WsMessage } from '../model/Message';
import { HttpUtil } from '../util/HttpUtil';
import { WebSocketConfig } from '../config/WebSocketConfig';
import { hilog } from '@kit.PerformanceAnalysisKit';

/**
 * WebSocket节点响应接口
 */
interface WsNodeResponse {
  code: number;
  data: string;
}

/**
 * 聊天室WebSocket管理类
 * 负责公聊WebSocket连接、心跳、重连
 */
export class ChatRoomWebSocket {
  private static instance: ChatRoomWebSocket;
  private ws: webSocket.WebSocket | null = null;
  private heartBeatTimer: number = -1;
  private reconnectTimer: number = -1;
  private isConnecting: boolean = false;
  private reconnectCount: number = 0; // 当前重连次数
  private onMessageCallback: ((msg: WsMessage) => void) | null = null;
  private onOnlineCallback: ((count: number) => void) | null = null;
  private onRevokeCallback: ((oId: string) => void) | null = null;
  private onDiscussCallback: ((discuss: string) => void) | null = null;

  /**
   * 获取单例实例
   */
  static getInstance(): ChatRoomWebSocket {
    if (!ChatRoomWebSocket.instance) {
      ChatRoomWebSocket.instance = new ChatRoomWebSocket();
    }
    return ChatRoomWebSocket.instance;
  }

  /**
   * 设置消息回调
   */
  onMessage(callback: (msg: WsMessage) => void): void {
    this.onMessageCallback = callback;
  }

  /**
   * 设置在线人数回调
   */
  onOnline(callback: (count: number) => void): void {
    this.onOnlineCallback = callback;
  }

  /**
   * 设置撤回消息回调
   */
  onRevoke(callback: (oId: string) => void): void {
    this.onRevokeCallback = callback;
  }

  /**
   * 设置话题变更回调
   */
  onDiscuss(callback: (discuss: string) => void): void {
    this.onDiscussCallback = callback;
  }

  /**
   * 连接WebSocket
   */
  async connect(): Promise<void> {
    if (this.isConnecting || this.ws) {
      hilog.info(0x0000, 'ChatRoomWS', 'Already connected or connecting');
      return;
    }

    this.isConnecting = true;
    hilog.info(0x0000, 'ChatRoomWS', 'Starting connection...');

    try {
      // 获取WebSocket节点地址
      let wsUrl = 'wss://fishpi.cn/chat-room-channel';

      try {
        const response = await HttpUtil.get<WsNodeResponse>('/chat-room/node/get');
        if (response.code === 0 && response.data) {
          wsUrl = response.data;
          hilog.info(0x0000, 'ChatRoomWS', `Got WS node: ${wsUrl}`);
        }
      } catch (err) {
        hilog.warn(0x0000, 'ChatRoomWS', `Failed to get WS node, using default: ${err}`);
      }

      // 创建WebSocket连接
      this.ws = webSocket.createWebSocket();
      hilog.info(0x0000, 'ChatRoomWS', `Connecting to: ${wsUrl}`);

      // 设置事件监听
      this.ws.on('open', () => {
        hilog.info(0x0000, 'ChatRoomWS', 'WebSocket connected!');
        this.isConnecting = false;
        this.reconnectCount = 0; // 连接成功，重置重连计数
        this.startHeartBeat();
      });

      this.ws.on('message', (err, data) => {
        if (err) {
          hilog.error(0x0000, 'ChatRoomWS', `Message error: ${err}`);
          return;
        }
        this.handleMessage(data as string);
      });

      this.ws.on('close', (err, value) => {
        hilog.info(0x0000, 'ChatRoomWS', `WebSocket closed: code=${value?.code}, reason=${value?.reason}`);
        this.stopHeartBeat();
        this.ws = null;
        this.isConnecting = false;

        // 非正常关闭，尝试重连
        if (value?.code !== 1000 && value?.code !== 1001) {
          hilog.info(0x0000, 'ChatRoomWS', 'Scheduling reconnect...');
          this.scheduleReconnect();
        }
      });

      this.ws.on('error', (err) => {
        hilog.error(0x0000, 'ChatRoomWS', `WebSocket error: ${err}`);
        this.isConnecting = false;
      });

      // 发起连接
      await this.ws.connect(wsUrl);
      hilog.info(0x0000, 'ChatRoomWS', 'Connect request sent');
    } catch (err) {
      hilog.error(0x0000, 'ChatRoomWS', `Connection failed: ${err}`);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  /**
   * 处理收到的消息
   */
  private handleMessage(data: string): void {
    // 忽略心跳响应
    if (data === 'pong') {
      return;
    }

    hilog.debug(0x0000, 'ChatRoomWS', `Received: ${data.substring(0, 100)}...`);

    try {
      const msg = JSON.parse(data) as WsMessage;
      hilog.info(0x0000, 'ChatRoomWS', `Message type: ${msg.type}`);

      switch (msg.type) {
        case 'msg':
        case 'barrage':
        case 'customMessage':
          hilog.info(0x0000, 'ChatRoomWS', `Calling message callback for ${msg.userName}`);
          this.onMessageCallback?.(msg);
          break;
        case 'online':
          hilog.info(0x0000, 'ChatRoomWS', `Online count: ${msg.onlineChatCnt}`);
          this.onOnlineCallback?.(msg.onlineChatCnt || 0);
          break;
        case 'revoke':
          hilog.info(0x0000, 'ChatRoomWS', `Revoke: ${msg.oId}`);
          this.onRevokeCallback?.(msg.oId);
          break;
        case 'discussChanged':
          hilog.info(0x0000, 'ChatRoomWS', `Discuss changed: ${msg.discuss}`);
          this.onDiscussCallback?.(msg.discuss || '');
          break;
        case 'redPacketStatus':
          // 红包状态更新
          this.onMessageCallback?.(msg);
          break;
      }
    } catch (err) {
      hilog.error(0x0000, 'ChatRoomWS', `Parse error: ${err}, data: ${data.substring(0, 50)}`);
    }
  }

  /**
   * 启动心跳
   */
  private startHeartBeat(): void {
    this.stopHeartBeat();
    this.heartBeatTimer = setInterval(() => {
      this.send('-hb-');
    }, WebSocketConfig.HEART_BEAT_INTERVAL);
  }

  /**
   * 停止心跳
   */
  private stopHeartBeat(): void {
    if (this.heartBeatTimer !== -1) {
      clearInterval(this.heartBeatTimer);
      this.heartBeatTimer = -1;
    }
  }

  /**
   * 安排重连
   */
  private scheduleReconnect(): void {
    // 清除旧的重连定时器
    if (this.reconnectTimer !== -1) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = -1;
    }

    // 检查是否超过最大重连次数
    if (this.reconnectCount >= WebSocketConfig.MAX_RECONNECT_TIMES) {
      hilog.warn(0x0000, 'ChatRoomWS', `Max reconnect times (${WebSocketConfig.MAX_RECONNECT_TIMES}) reached, stop reconnecting`);
      return;
    }

    this.reconnectCount++;
    hilog.info(0x0000, 'ChatRoomWS', `Scheduling reconnect (${this.reconnectCount}/${WebSocketConfig.MAX_RECONNECT_TIMES})...`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = -1;
      this.connect();
    }, WebSocketConfig.RECONNECT_INTERVAL);
  }

  /**
   * 发送消息
   */
  send(message: string): void {
    if (!this.ws) {
      return;
    }

    this.ws.send(message, (err) => {
      if (err) {
        // 发送消息失败
      }
    });
  }

  /**
   * 发送聊天消息
   */
  sendMessage(content: string): void {
    this.send(content);
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    this.stopHeartBeat();

    if (this.reconnectTimer !== -1) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = -1;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.isConnecting = false;
    this.reconnectCount = 0; // 重置重连计数
  }

  /**
   * 手动重连（重置重连计数后尝试连接）
   */
  async reconnect(): Promise<void> {
    this.disconnect();
    await this.connect();
  }

  /**
   * 是否已连接
   */
  isConnected(): boolean {
    return this.ws !== null && !this.isConnecting;
  }
}
