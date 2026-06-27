import { HttpUtil, ApiResponse } from '../util/HttpUtil';
import { StorageUtil } from '../util/StorageUtil';
import { ChatMessage, MessageListResponse, WsMessage, MessageGroup } from '../model/Message';
import { ChatRoomWebSocket } from '../websocket/ChatRoomWebSocket';
import { MessageGroupComponent } from './MessageGroupComponent';
import { MessageGroupUtil } from '../util/MessageGroupUtil';
import { hilog } from '@kit.PerformanceAnalysisKit';

/**
 * 聊天室组件
 * 可嵌入到其他页面中使用
 */
@Component
export struct ChatRoomComponent {
  @State messages: ChatMessage[] = [];
  @State messageGroups: MessageGroup[] = [];
  @State inputText: string = '';
  @State onlineCount: number = 0;
  @State discuss: string = '';
  @State isLoadingMore: boolean = false;
  @State currentUserName: string = '';
  @State isNearBottom: boolean = true;
  @State isFirstLoad: boolean = true;
  @State hasMoreMessages: boolean = true; // 是否还有更多历史消息
  @State showScrollToBottom: boolean = false; // 是否显示"回到最新消息"按钮

  private scroller: Scroller = new Scroller();
  private wsManager: ChatRoomWebSocket = ChatRoomWebSocket.getInstance();
  private lastLoadTime: number = 0; // 上次加载时间，用于防抖

  /**
   * 组件出现时初始化
   */
  async aboutToAppear(): Promise<void> {
    // 获取当前用户名
    this.currentUserName = await StorageUtil.get(StorageUtil.KEY_USER_NAME);

    // 加载历史消息
    await this.loadMessages();

    // 连接WebSocket
    this.setupWebSocket();
  }

  /**
   * 更新消息分组
   */
  private updateMessageGroups(): void {
    this.messageGroups = MessageGroupUtil.groupMessages(this.messages, this.currentUserName);
  }

  /**
   * 组件消失时断开连接
   */
  aboutToDisappear(): void {
    this.wsManager.disconnect();
  }

  /**
   * 设置WebSocket回调
   */
  private setupWebSocket(): void {
    hilog.info(0x0000, 'ChatRoomComponent', 'Setting up WebSocket...');

    // 接收新消息
    this.wsManager.onMessage((msg: WsMessage) => {
      const newMsg: ChatMessage = {
        oId: msg.oId,
        userName: msg.userName,
        userAvatarURL: msg.userAvatarURL || '',
        content: msg.content || '',
        md: msg.md || '',
        time: msg.time || new Date().toISOString(),
        type: msg.type,
        client: ''
      };
      this.messages.push(newMsg);
      this.updateMessageGroups();
      // 自动滚动到底部
      if (this.isNearBottom) {
        this.scroller.scrollEdge(Edge.Bottom);
      }
    });

    // 在线人数更新
    this.wsManager.onOnline((count: number) => {
      this.onlineCount = count;
    });

    // 话题变更
    this.wsManager.onDiscuss((discuss: string) => {
      this.discuss = discuss;
    });

    // 撤回消息
    this.wsManager.onRevoke((oId: string) => {
      const index = this.messages.findIndex(m => m.oId === oId);
      if (index !== -1) {
        this.messages.splice(index, 1);
        this.updateMessageGroups();
      }
    });

    // 连接WebSocket
    this.wsManager.connect();
  }

  /**
   * 加载聊天消息
   */
  private async loadMessages(): Promise<void> {
    try {
      const params = new Map<string, number>();
      params.set('page', 1);
      
      const response = await HttpUtil.get<MessageListResponse>('/chat-room/more', params);

      if (response.code === 0 && response.data && Array.isArray(response.data)) {
        this.messages = response.data.reverse();
        this.updateMessageGroups();
        // 首次加载完成，延迟滚动到底部
        if (this.isFirstLoad) {
          setTimeout(() => {
            this.scroller.scrollEdge(Edge.Bottom);
            this.isFirstLoad = false;
          }, 100);
        }
      } else {
        this.messages = [];
        this.messageGroups = [];
      }
    } catch (err) {
      this.messages = [];
      this.messageGroups = [];
    }
  }

  /**
   * 加载更多历史消息
   */
  private async loadMoreMessages(): Promise<void> {
    // 防抖：距离上次加载至少间隔1秒
    const now = Date.now();
    hilog.info(0x0000, 'ChatRoomComponent', 'loadMoreMessages called: isLoadingMore=%{public}d, messages.length=%{public}d, hasMoreMessages=%{public}d, timeDiff=%{public}d', 
      this.isLoadingMore ? 1 : 0, this.messages.length, this.hasMoreMessages ? 1 : 0, now - this.lastLoadTime);
    
    if (this.isLoadingMore || this.messages.length === 0 || 
        !this.hasMoreMessages || now - this.lastLoadTime < 1000) {
      hilog.info(0x0000, 'ChatRoomComponent', 'loadMoreMessages skipped due to conditions');
      return;
    }

    this.isLoadingMore = true;
    this.lastLoadTime = now;
    
    // 记录当前第一个消息的索引，用于加载后保持位置
    const oldFirstMsgOId = this.messages[0].oId;
    const oldMessageCount = this.messages.length;
    hilog.info(0x0000, 'ChatRoomComponent', 'Loading more messages, firstMsgOId=%{public}s', oldFirstMsgOId);

    try {
      const params = new Map<string, string | number>();
      params.set('oId', this.messages[0].oId);
      params.set('mode', 1); // mode=1: 显示本条及之前的消息
      params.set('size', 20); // 加载20条历史消息
      
      hilog.info(0x0000, 'ChatRoomComponent', 'API params: oId=%{public}s, mode=1, size=20', this.messages[0].oId);
      
      const response = await HttpUtil.get<MessageListResponse>('/chat-room/getMessage', params);
      hilog.info(0x0000, 'ChatRoomComponent', 'API response: code=%{public}d, data.length=%{public}d', 
        response.code, response.data ? response.data.length : 0);

      if (response.code === 0 && response.data && Array.isArray(response.data)) {
        // API 返回的是 [本条消息, 之前的消息...]
        // 需要过滤掉本条消息（第一条），只保留之前的历史消息
        const allMessages = response.data;
        const newMessages = allMessages.filter((msg: ChatMessage) => msg.oId !== oldFirstMsgOId);
        
        hilog.info(0x0000, 'ChatRoomComponent', 'allMessages.length=%{public}d, newMessages.length=%{public}d', 
          allMessages.length, newMessages.length);
        
        if (newMessages.length > 0) {
          // 在消息数组前面插入新消息（新消息是按时间倒序的，需要反转）
          this.messages = [...newMessages.reverse(), ...this.messages];
          this.updateMessageGroups();
          
          hilog.info(0x0000, 'ChatRoomComponent', 'Added %{public}d messages, total=%{public}d', newMessages.length, this.messages.length);
          
          // 保持当前可视位置：滚动到原来的第一条消息位置
          setTimeout(() => {
            // 找到原来第一条消息的新索引位置
            const newFirstMsgIndex = this.messages.findIndex(m => m.oId === oldFirstMsgOId);
            hilog.info(0x0000, 'ChatRoomComponent', 'Scroll to index: %{public}d', newFirstMsgIndex);
            if (newFirstMsgIndex > 0) {
              // 滚动到该位置，保持用户视角不变
              this.scroller.scrollToIndex(newFirstMsgIndex);
            }
          }, 50);
        } else {
          // 没有更多消息了
          this.hasMoreMessages = false;
          hilog.info(0x0000, 'ChatRoomComponent', 'No more messages available');
        }
      } else {
        this.hasMoreMessages = false;
        hilog.error(0x0000, 'ChatRoomComponent', 'API response invalid: code=%{public}d', response.code);
      }
    } catch (err) {
      // 加载更多消息失败
      hilog.error(0x0000, 'ChatRoomComponent', 'Load more messages failed: %{public}s', JSON.stringify(err));
    } finally {
      this.isLoadingMore = false;
      hilog.info(0x0000, 'ChatRoomComponent', 'loadMoreMessages finished');
    }
  }

  /**
   * 发送消息
   */
  private async sendMessage(): Promise<void> {
    const content = this.inputText.trim();
    if (!content) return;

    try {
      const params = new Map<string, string>();
      params.set('content', content);
      const response = await HttpUtil.post<ApiResponse>('/chat-room/send', params);

      if (response.code === 0) {
        this.inputText = '';
        // 发送后强制滚动到底部
        this.isNearBottom = true;
        this.scroller.scrollEdge(Edge.Bottom);
      }
    } catch (err) {
      // 发送失败
    }
  }

  build() {
    Column() {
      // 顶部栏
      Row() {
        Column() {
          Text('聊天室')
            .fontSize(18)
            .fontWeight(FontWeight.Bold)
            .fontColor('#333333')

          if (this.onlineCount > 0) {
            Text(`${this.onlineCount}人在线`)
              .fontSize(12)
              .fontColor('#999999')
              .margin({ top: 2 })
          }
        }
        .alignItems(HorizontalAlign.Start)

        Blank()

        if (this.discuss) {
          Text(`#${this.discuss}#`)
            .fontSize(14)
            .fontColor('#1890FF')
            .backgroundColor('#E6F7FF')
            .padding({ left: 8, right: 8, top: 4, bottom: 4 })
            .borderRadius(4)
        }
      }
      .width('100%')
      .height(56)
      .padding({ left: 16, right: 16 })
      .backgroundColor('#FFFFFF')

      // 消息列表
      if (this.messageGroups.length === 0) {
        Column() {
          Text('暂无消息')
            .fontSize(16)
            .fontColor('#999999')
          Text('正在加载...')
            .fontSize(14)
            .fontColor('#CCCCCC')
            .margin({ top: 8 })
        }
        .layoutWeight(1)
        .width('100%')
        .justifyContent(FlexAlign.Center)
      } else {
        Stack({ alignContent: Alignment.BottomEnd }) {
          List({ space: 0, scroller: this.scroller }) {
            // 顶部状态提示
            ListItem() {
              Row() {
                if (this.isLoadingMore) {
                  // 加载中状态
                  LoadingProgress()
                    .width(20)
                    .height(20)
                    .color('#1890FF')
                  
                  Text('加载中...')
                    .fontSize(14)
                    .fontColor('#999999')
                    .margin({ left: 8 })
                } else if (!this.hasMoreMessages && this.messages.length > 0) {
                  // 没有更多消息提示
                  Text('没有更多历史消息了')
                    .fontSize(14)
                    .fontColor('#CCCCCC')
                }
              }
              .width('100%')
              .justifyContent(FlexAlign.Center)
              .padding(12)
              .height(this.isLoadingMore || !this.hasMoreMessages ? 44 : 0)
              .opacity(this.isLoadingMore || !this.hasMoreMessages ? 1 : 0)
            }

            // 消息组列表
            ForEach(this.messageGroups, (group: MessageGroup, index: number) => {
              ListItem() {
                MessageGroupComponent({ group: group })
              }
            }, (group: MessageGroup, index: number) => `${group.userId}_${index}`)

            // 底部占位符
            ListItem() {
              Column()
                .height(20)
            }
          }
          .layoutWeight(1)
          .width('100%')
          .backgroundColor('#F5F5F5')
          .scrollBar(BarState.Off)
          .onScroll(() => {
            if (!this.isFirstLoad) {
              this.isNearBottom = false;
              // 滚动时显示"回到最新消息"按钮
              this.showScrollToBottom = true;
            }
          })
          .onReachStart(() => {
            // 滚动到顶部时自动加载更多历史消息
            if (!this.isFirstLoad && !this.isLoadingMore && this.hasMoreMessages) {
              hilog.info(0x0000, 'ChatRoomComponent', 'onReachStart triggered, calling loadMoreMessages');
              this.loadMoreMessages();
            } else {
              hilog.info(0x0000, 'ChatRoomComponent', 'onReachStart skipped: isFirstLoad=%{public}d, isLoadingMore=%{public}d, hasMoreMessages=%{public}d',
                this.isFirstLoad ? 1 : 0, this.isLoadingMore ? 1 : 0, this.hasMoreMessages ? 1 : 0);
            }
          })
          .onReachEnd(() => {
            this.isNearBottom = true;
            // 滚动到底部时隐藏"回到最新消息"按钮
            this.showScrollToBottom = false;
          })
          
          // "回到最新消息"悬浮按钮
          if (this.showScrollToBottom) {
            Button({ type: ButtonType.Normal }) {
              Row({ space: 6 }) {
                Text('↓')
                  .fontSize(14)
                  .fontColor('#1890FF')
                  .fontWeight(FontWeight.Medium)
                Text('回到底部')
                  .fontSize(13)
                  .fontColor('#1890FF')
              }
            }
            .height(32)
            .backgroundColor('#FFFFFF')
            .borderRadius(16)
            .shadow({
              radius: 8,
              color: 'rgba(0, 0, 0, 0.1)',
              offsetX: 0,
              offsetY: 2
            })
            .padding({ left: 12, right: 12 })
            .margin({ right: 16, bottom: 16 })
            .onClick(() => {
              this.scroller.scrollEdge(Edge.Bottom);
              this.showScrollToBottom = false;
              this.isNearBottom = true;
            })
          }
        }
        .layoutWeight(1)
        .width('100%')
      }

      // 输入区域
      Row() {
        TextInput({ text: $$this.inputText, placeholder: '说点什么...' })
          .layoutWeight(1)
          .height(40)
          .backgroundColor('#F5F5F5')
          .borderRadius(20)
          .padding({ left: 16, right: 16 })

        Button('发送')
          .type(ButtonType.Capsule)
          .height(40)
          .width(70)
          .backgroundColor('#1890FF')
          .fontColor('#FFFFFF')
          .margin({ left: 12 })
          .onClick(() => {
            this.sendMessage();
          })
      }
      .width('100%')
      .padding({ left: 16, right: 16, top: 8, bottom: 8 })
      .backgroundColor('#FFFFFF')
      .border({ width: { top: 0.5 }, color: '#E8E8E8' })
    }
    .width('100%')
    .height('100%')
  }
}
