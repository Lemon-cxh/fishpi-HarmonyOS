import webSocket from "@ohos:net.webSocket";
import type { PrivateMessage } from '../model/Notification';
import { HttpUtil } from "@bundle:com.example.fishpi/entry/ets/util/HttpUtil";
import { WebSocketConfig } from "@bundle:com.example.fishpi/entry/ets/config/WebSocketConfig";
import hilog from "@ohos:hilog";
/**
 * 私聊WebSocket管理类
 * 负责私聊WebSocket连接、消息收发
 */
export class PrivateChatWebSocket {
    private static instance: PrivateChatWebSocket;
    private ws: webSocket.WebSocket | null = null;
    private isConnecting: boolean = false;
    private currentChatUser: string = '';
    private onMessageCallback: ((msg: PrivateMessage) => void) | null = null;
    /**
     * 获取单例实例
     */
    static getInstance(): PrivateChatWebSocket {
        if (!PrivateChatWebSocket.instance) {
            PrivateChatWebSocket.instance = new PrivateChatWebSocket();
        }
        return PrivateChatWebSocket.instance;
    }
    /**
     * 设置消息回调
     */
    onMessage(callback: (msg: PrivateMessage) => void): void {
        this.onMessageCallback = callback;
    }
    /**
     * 连接私聊WebSocket
     * @param toUser 聊天对象用户名
     */
    async connect(toUser: string): Promise<void> {
        // 如果已连接同一个用户，不重复连接
        if (this.currentChatUser === toUser && this.ws) {
            hilog.info(0x0000, 'PrivateChatWS', `Already connected to ${toUser}`);
            return;
        }
        // 先断开现有连接
        this.disconnect();
        this.isConnecting = true;
        this.currentChatUser = toUser;
        hilog.info(0x0000, 'PrivateChatWS', `Starting connection to ${toUser}...`);
        try {
            const apiKey = HttpUtil.getApiKey();
            const wsUrl = `wss://fishpi.cn/chat-channel?apiKey=${apiKey}&toUser=${toUser}`;
            hilog.info(0x0000, 'PrivateChatWS', `Connecting to: ${wsUrl.substring(0, 50)}...`);
            this.ws = webSocket.createWebSocket();
            // 设置事件监听
            this.ws.on('open', () => {
                hilog.info(0x0000, 'PrivateChatWS', 'WebSocket connected!');
                this.isConnecting = false;
            });
            this.ws.on('message', (err, data) => {
                if (err) {
                    hilog.error(0x0000, 'PrivateChatWS', `Message error: ${err}`);
                    return;
                }
                this.handleMessage(data as string);
            });
            this.ws.on('close', (err, value) => {
                hilog.info(0x0000, 'PrivateChatWS', `WebSocket closed: code=${value?.code}`);
                this.ws = null;
                this.isConnecting = false;
                // 非正常关闭，尝试重连
                if (value?.code !== 1000 && value?.code !== 1001) {
                    hilog.info(0x0000, 'PrivateChatWS', 'Scheduling reconnect...');
                    setTimeout(() => {
                        if (this.currentChatUser === toUser) {
                            this.connect(toUser);
                        }
                    }, WebSocketConfig.RECONNECT_INTERVAL);
                }
            });
            this.ws.on('error', (err) => {
                hilog.error(0x0000, 'PrivateChatWS', `WebSocket error: ${err}`);
                this.isConnecting = false;
            });
            // 发起连接
            await this.ws.connect(wsUrl);
            hilog.info(0x0000, 'PrivateChatWS', 'Connect request sent');
        }
        catch (err) {
            hilog.error(0x0000, 'PrivateChatWS', `Connection failed: ${err}`);
            this.isConnecting = false;
        }
    }
    /**
     * 处理收到的消息
     */
    private handleMessage(data: string): void {
        try {
            const msg = JSON.parse(data) as PrivateMessage;
            this.onMessageCallback?.(msg);
        }
        catch (err) {
            // 解析消息失败
        }
    }
    /**
     * 发送私聊消息
     * @param content 消息内容
     */
    send(content: string): void {
        if (!this.ws) {
            return;
        }
        this.ws.send(content, (err) => {
            if (err) {
                // 发送消息失败
            }
        });
    }
    /**
     * 断开连接
     */
    disconnect(): void {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.currentChatUser = '';
        this.isConnecting = false;
    }
    /**
     * 获取当前聊天对象
     */
    getCurrentChatUser(): string {
        return this.currentChatUser;
    }
    /**
     * 是否已连接
     */
    isConnected(): boolean {
        return this.ws !== null && !this.isConnecting;
    }
}
