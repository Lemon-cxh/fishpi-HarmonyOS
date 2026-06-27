/**
 * WebSocket配置常量
 * 集中管理WebSocket相关配置，便于维护和调整
 */
export class WebSocketConfig {
    /**
     * 心跳间隔（毫秒）
     * 每20秒发送一次心跳包保持连接
     */
    static readonly HEART_BEAT_INTERVAL: number = 20000;
    /**
     * 重连间隔（毫秒）
     * 连接断开后5秒尝试重连
     */
    static readonly RECONNECT_INTERVAL: number = 5000;
    /**
     * 最大重连次数
     * 超过此次数后停止重连
     */
    static readonly MAX_RECONNECT_TIMES: number = 5;
    /**
     * WebSocket连接超时时间（毫秒）
     */
    static readonly CONNECT_TIMEOUT: number = 10000;
}
