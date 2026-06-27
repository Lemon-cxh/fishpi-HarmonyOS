import { HttpUtil, ApiResponse } from '../util/HttpUtil';
import { StorageUtil } from '../util/StorageUtil';
import { TimeUtil } from '../util/TimeUtil';
import { PrivateMessage, PrivateMessageListResponse } from '../model/Notification';
import { PrivateChatWebSocket } from '../websocket/PrivateChatWebSocket';

/**
 * 私聊详情页面
 * 与指定用户的私聊对话
 */
@Entry
@Component
struct PrivateChatDetailPage {
  @State messages: PrivateMessage[] = [];
  @State inputText: string = '';
  @State isLoading: boolean = false;
  @State isSending: boolean = false;
  @State chatUserName: string = '';
  @State chatUserAvatar: string = '';
  @State currentUserName: string = '';
  @State isFirstLoad: boolean = true;

  // 状态栏高度（用于避让）
  @StorageProp('topRectHeight') topRectHeight: number = 0;

  private scroller: Scroller = new Scroller();
  private wsManager: PrivateChatWebSocket = PrivateChatWebSocket.getInstance();

  /**
   * 从路由参数获取聊天对象信息
   */
  async aboutToAppear(): Promise<void> {
    try {
      const params = this.getUIContext().getRouter().getParams() as Record<string, string>;
      this.chatUserName = params?.userName || '';
      this.chatUserAvatar = params?.avatar || '';

      // 获取当前用户名
      this.currentUserName = await StorageUtil.get(StorageUtil.KEY_USER_NAME);

      if (this.chatUserName) {
        // 加载历史消息
        await this.loadMessages();

        // 标记已读
        await this.markAsRead();

        // 连接WebSocket
        this.setupWebSocket();
      }
    } catch (err) {
      // 获取路由参数失败
    }
  }

  /**
   * 页面消失时断开连接
   */
  aboutToDisappear(): void {
    this.wsManager.disconnect();
  }

  /**
   * 设置WebSocket回调
   */
  private setupWebSocket(): void {
    // 接收新消息
    this.wsManager.onMessage((msg: PrivateMessage) => {
      // 只处理当前聊天对象的消息
      if (msg.senderUserName === this.chatUserName) {
        this.messages.push(msg);

        // 滚动到底部 - 使用更可靠的方式
        this.scroller.scrollEdge(Edge.Bottom);

        // 标记已读
        this.markAsRead();
      }
    });

    // 连接WebSocket
    this.wsManager.connect(this.chatUserName);
  }

  /**
   * 加载历史消息
   */
  private async loadMessages(): Promise<void> {
    if (this.isLoading) return;

    this.isLoading = true;

    try {
      const params = new Map<string, string | number>();
      params.set('toUser', this.chatUserName);
      params.set('page', 1);
      params.set('pageSize', 50);
      const response = await HttpUtil.get<PrivateMessageListResponse>('/chat/get-message', params);

      if (response.code === 0 && response.data) {
        this.messages = response.data.reverse();
        // 首次加载完成，延迟滚动到底部
        if (this.isFirstLoad) {
          setTimeout(() => {
            this.scroller.scrollEdge(Edge.Bottom);
            this.isFirstLoad = false;
          }, 100);
        }
      }
    } catch (err) {
      // 加载私聊消息失败
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * 标记消息已读
   */
  private async markAsRead(): Promise<void> {
    try {
      const params = new Map<string, string>();
      params.set('fromUser', this.chatUserName);
      await HttpUtil.get<ApiResponse>('/chat/mark-as-read', params);
    } catch (err) {
      // 标记已读失败
    }
  }

  /**
   * 发送消息
   */
  private async sendMessage(): Promise<void> {
    const content = this.inputText.trim();
    if (!content || this.isSending) return;

    this.isSending = true;

    try {
      // 通过WebSocket发送消息
      this.wsManager.send(content);

      // 本地添加消息
      const newMsg: PrivateMessage = {
        oId: Date.now().toString(),
        senderUserName: this.currentUserName,
        senderAvatar: '',
        content: content,
        time: new Date().toISOString(),
        type: 'msg'
      };
      this.messages.push(newMsg);
      this.inputText = '';

      // 滚动到底部 - 使用更可靠的方式
      this.scroller.scrollEdge(Edge.Bottom);
    } catch (err) {
      // 发送消息失败
    } finally {
      this.isSending = false;
    }
  }

  build() {
    Column() {
      // 顶部导航栏
      Row() {
        Text('返回')
          .fontSize(16)
          .fontColor('#1890FF')
          .onClick(() => {
            try {
              this.getUIContext().getRouter().back();
            } catch (err) {
              // 路由返回失败
            }
          })

        Column() {
          Text(this.chatUserName)
            .fontSize(18)
            .fontWeight(FontWeight.Bold)
            .fontColor('#333333')
        }
        .margin({ left: 16 })

        Blank()

        // 更多操作
        Text('···')
          .fontSize(20)
          .fontColor('#666666')
          .padding(8)
      }
      .width('100%')
      .height(56)
      .padding({ left: 16, right: 16 })
      .backgroundColor('#FFFFFF')
      .border({ width: { bottom: 0.5 }, color: '#E8E8E8' })

      if (this.isLoading && this.messages.length === 0) {
        // 加载中
        Column() {
          LoadingProgress()
            .width(40)
            .height(40)
          Text('加载中...')
            .fontSize(14)
            .fontColor('#999999')
            .margin({ top: 12 })
        }
        .layoutWeight(1)
        .justifyContent(FlexAlign.Center)
      } else {
        // 消息列表
        List({ scroller: this.scroller }) {
          ForEach(this.messages, (msg: PrivateMessage) => {
            ListItem() {
              this.MessageItem(msg)
            }
          }, (msg: PrivateMessage) => msg.oId)
        }
        .layoutWeight(1)
        .width('100%')
        .backgroundColor('#F5F5F5')

        // 输入区域
        Row() {
          TextInput({ placeholder: '输入消息...', text: this.inputText })
            .type(InputType.Normal)
            .layoutWeight(1)
            .height(40)
            .backgroundColor('#F5F5F5')
            .borderRadius(20)
            .padding({ left: 16, right: 16 })
            .onChange((value: string) => {
              this.inputText = value;
            })
            .onSubmit(() => {
              this.sendMessage();
            })

          Button('发送')
            .type(ButtonType.Capsule)
            .height(40)
            .width(70)
            .backgroundColor('#1890FF')
            .fontColor('#FFFFFF')
            .fontSize(14)
            .margin({ left: 12 })
            .enabled(!this.isSending && this.inputText.trim().length > 0)
            .onClick(() => {
              this.sendMessage();
            })
        }
        .width('100%')
        .padding({ left: 16, right: 16, top: 8, bottom: 8 })
        .backgroundColor('#FFFFFF')
        .border({ width: { top: 0.5 }, color: '#E8E8E8' })
      }
    }
    .width('100%')
    .height('100%')
    .padding({ top: this.getUIContext().px2vp(this.topRectHeight) })
  }

  /**
   * 消息项组件
   */
  @Builder
  MessageItem(msg: PrivateMessage) {
    // 判断是否是自己发送的消息
    Row() {
      if (msg.senderUserName === this.currentUserName) {
        // 自己发送的消息 - 右对齐
        Blank()

        Column() {
          Text(msg.content)
            .fontSize(15)
            .fontColor('#FFFFFF')
            .backgroundColor('#1890FF')
            .padding({ left: 12, right: 12, top: 10, bottom: 10 })
            .borderRadius(8)

          Text(TimeUtil.formatTime(msg.time))
            .fontSize(11)
            .fontColor('#CCCCCC')
            .margin({ top: 4 })
        }
        .alignItems(HorizontalAlign.End)
        .margin({ left: 60 })
      } else {
        // 对方发送的消息 - 左对齐
        Image(msg.senderAvatar || this.chatUserAvatar || '')
          .width(36)
          .height(36)
          .borderRadius(18)
          .backgroundColor('#E8E8E8')

        Column() {
          Text(msg.content)
            .fontSize(15)
            .fontColor('#333333')
            .backgroundColor('#FFFFFF')
            .padding({ left: 12, right: 12, top: 10, bottom: 10 })
            .borderRadius(8)

          Text(TimeUtil.formatTime(msg.time))
            .fontSize(11)
            .fontColor('#CCCCCC')
            .margin({ top: 4 })
        }
        .alignItems(HorizontalAlign.Start)
        .margin({ left: 10 })

        Blank()
      }
    }
    .width('100%')
    .padding({ left: 16, right: 16, top: 8, bottom: 8 })
    .alignItems(VerticalAlign.Top)
  }
}
