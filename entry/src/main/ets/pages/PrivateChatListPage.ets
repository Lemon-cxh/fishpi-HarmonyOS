import { HttpUtil, ApiResponse } from '../util/HttpUtil';
import { TimeUtil } from '../util/TimeUtil';
import { PrivateChatSession, PrivateChatListResponse } from '../model/Notification';

/**
 * 私聊列表页面
 * 展示最近的私聊会话列表
 */
@Entry
@Component
struct PrivateChatListPage {
  @State sessions: PrivateChatSession[] = [];
  @State isLoading: boolean = false;

  // 状态栏高度（用于避让）
  @StorageProp('topRectHeight') topRectHeight: number = 0;

  /**
   * 页面出现时加载数据
   */
  async aboutToAppear(): Promise<void> {
    await this.loadSessions();
  }

  /**
   * 加载私聊会话列表
   */
  private async loadSessions(): Promise<void> {
    if (this.isLoading) return;

    this.isLoading = true;

    try {
      const response = await HttpUtil.get<PrivateChatListResponse>('/chat/get-list');

      if (response.code === 0 && response.data) {
        this.sessions = response.data;
      }
    } catch (err) {
      // 加载私聊会话失败
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * 跳转私聊详情
   */
  private goChat(session: PrivateChatSession): void {
    try {
      this.getUIContext().getRouter().pushUrl({
        url: 'pages/PrivateChatDetailPage',
        params: {
          userName: session.receiverUserName,
          avatar: session.receiverAvatar
        }
      });
    } catch (err) {
      // 路由跳转失败
    }
  }

  build() {
    Column() {
      // 顶部标题栏
      Row() {
        Text('私聊')
          .fontSize(20)
          .fontWeight(FontWeight.Bold)
          .fontColor('#333333')

        Blank()
      }
      .width('100%')
      .height(56)
      .padding({ left: 16, right: 16 })
      .backgroundColor('#FFFFFF')
      .border({ width: { bottom: 0.5 }, color: '#E8E8E8' })

      if (this.isLoading && this.sessions.length === 0) {
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
      } else if (this.sessions.length === 0) {
        // 空状态
        Column() {
          Text('✉️')
            .fontSize(48)
          Text('暂无私聊消息')
            .fontSize(16)
            .fontColor('#999999')
            .margin({ top: 12 })
          Text('快去找人聊聊吧')
            .fontSize(14)
            .fontColor('#CCCCCC')
            .margin({ top: 8 })
        }
        .layoutWeight(1)
        .justifyContent(FlexAlign.Center)
      } else {
        // 会话列表
        List() {
          ForEach(this.sessions, (session: PrivateChatSession) => {
            ListItem() {
              this.SessionItem(session)
            }
          }, (session: PrivateChatSession) => session.oId)
        }
        .layoutWeight(1)
        .width('100%')
        .backgroundColor('#F5F5F5')
      }
    }
    .width('100%')
    .height('100%')
    .padding({ top: this.getUIContext().px2vp(this.topRectHeight) })
  }

  /**
   * 会话项组件
   */
  @Builder
  SessionItem(session: PrivateChatSession) {
    Row() {
      // 头像
      Stack() {
        Image(session.receiverAvatar || '')
          .width(50)
          .height(50)
          .borderRadius(25)
          .backgroundColor('#E8E8E8')

        // 未读消息红点
        if (session.unread && session.unread > 0) {
          Text(session.unread > 99 ? '99+' : session.unread.toString())
            .fontSize(10)
            .fontColor('#FFFFFF')
            .backgroundColor('#FF4D4F')
            .borderRadius(10)
            .padding({ left: 6, right: 6, top: 2, bottom: 2 })
            .position({ x: 35, y: 0 })
        }
      }
      .width(50)
      .height(50)

      // 会话信息
      Column() {
        Row() {
          Text(session.receiverUserName)
            .fontSize(16)
            .fontWeight(FontWeight.Medium)
            .fontColor('#333333')

          Blank()

          Text(TimeUtil.formatTime(session.time))
            .fontSize(12)
            .fontColor('#CCCCCC')
        }
        .width('100%')

        Text(session.preview || '暂无消息')
          .fontSize(14)
          .fontColor('#999999')
          .maxLines(1)
          .textOverflow({ overflow: TextOverflow.Ellipsis })
          .margin({ top: 6 })
      }
      .layoutWeight(1)
      .margin({ left: 12 })
      .alignItems(HorizontalAlign.Start)
    }
    .width('100%')
    .padding({ left: 16, right: 16, top: 12, bottom: 12 })
    .backgroundColor('#FFFFFF')
    .margin({ bottom: 1 })
    .onClick(() => {
      this.goChat(session);
    })
  }
}
