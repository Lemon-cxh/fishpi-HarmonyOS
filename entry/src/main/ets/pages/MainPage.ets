import { HttpUtil } from '../util/HttpUtil';
import { StorageUtil } from '../util/StorageUtil';
import { ThemeUtil, LightColorScheme, DarkColorScheme } from '../util/ThemeUtil';
import { Spacing, BorderRadius, FontSize, ComponentSize } from '../constants/DesignTokens';
import { PrivateChatSession, PrivateChatListResponse } from '../model/Notification';
import { UserInfo, UserInfoResponse } from '../model/User';
import { ChatRoomComponent } from '../components/ChatRoomComponent';
import { ArticleListComponent } from '../components/ArticleListComponent';

/**
 * Tab项接口
 */
interface TabItem {
  title: string;
  icon: string;
}

/**
 * 主页面
 * 底部Tab导航容器，包含聊天室、文章、私聊、我的四个模块
 */
@Entry
@Component
struct MainPage {
  @State currentIndex: number = 0;
  @State sessions: PrivateChatSession[] = [];
  @State userInfo: UserInfo | null = null;

  // 状态栏和导航栏高度（用于避让）
  @StorageProp('topRectHeight') topRectHeight: number = 0;
  @StorageProp('bottomRectHeight') bottomRectHeight: number = 0;

  // Tab配置
  private tabItems: TabItem[] = [
    { title: '聊天室', icon: '💬' },
    { title: '文章', icon: '📝' },
    { title: '私聊', icon: '✉️' },
    { title: '我的', icon: '👤' }
  ];

  /**
   * 页面出现时初始化
   */
  async aboutToAppear(): Promise<void> {
    // 检查登录状态
    const apiKey = await HttpUtil.loadApiKey();
    
    if (!apiKey) {
      try {
        this.getUIContext().getRouter().replaceUrl({ url: 'pages/LoginPage' });
      } catch (err) {
        // 路由跳转失败
      }
      return;
    }

    // 加载初始数据
    await this.loadInitialData();
  }

  /**
   * 加载初始数据
   */
  private async loadInitialData(): Promise<void> {
    // 并行加载各模块数据
    await Promise.all([
      this.loadPrivateChatSessions(),
      this.loadUserInfo()
    ]);
  }

  /**
   * 加载私聊会话
   */
  private async loadPrivateChatSessions(): Promise<void> {
    try {
      const response = await HttpUtil.get<PrivateChatListResponse>('/chat/get-list');

      if (response.code === 0 && response.data && Array.isArray(response.data)) {
        this.sessions = response.data;
      } else {
        this.sessions = [];
      }
    } catch (err) {
      this.sessions = [];
    }
  }

  /**
   * 加载用户信息
   */
  private async loadUserInfo(): Promise<void> {
    try {
      const response = await HttpUtil.get<UserInfoResponse>('/api/user');

      if (response.code === 0 && response.data) {
        this.userInfo = response.data;
      }
    } catch (err) {
      // 加载用户信息失败
    }
  }

  build() {
    Column() {
      // 内容区域
      Stack() {
        // 聊天室页面
        ChatRoomComponent()
          .visibility(this.currentIndex === 0 ? Visibility.Visible : Visibility.None)

        // 文章页面
        ArticleListComponent({ showTitle: true })
          .visibility(this.currentIndex === 1 ? Visibility.Visible : Visibility.None)

        // 私聊页面
        Column() {
          this.PrivateChatContent()
        }
        .visibility(this.currentIndex === 2 ? Visibility.Visible : Visibility.None)
        .layoutWeight(1)
        .width('100%')

        // 我的页面
        Column() {
          this.ProfileContent()
        }
        .visibility(this.currentIndex === 3 ? Visibility.Visible : Visibility.None)
        .layoutWeight(1)
        .width('100%')
      }
      .layoutWeight(1)
      .width('100%')

      // 底部Tab栏
      Row() {
        ForEach(this.tabItems, (item: TabItem, index: number) => {
          Column() {
            Text(item.icon)
              .fontSize(24)
              .margin({ bottom: 4 })

            Text(item.title)
              .fontSize(12)
              .fontColor(this.currentIndex === index ? '#1890FF' : '#999999')
          }
          .layoutWeight(1)
          .justifyContent(FlexAlign.Center)
          .onClick(() => {
            this.currentIndex = index;
          })
        }, (item: TabItem, index: number) => `${item.title}_${index}`)
      }
      .width('100%')
      .height(60)
      .backgroundColor('#FFFFFF')
      .border({ width: { top: 0.5 }, color: '#E8E8E8' })
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F5F5F5')
    .padding({
      top: this.getUIContext().px2vp(this.topRectHeight),
      bottom: this.getUIContext().px2vp(this.bottomRectHeight)
    })
  }

  /**
   * 私聊内容
   */
  @Builder
  PrivateChatContent() {
    Column() {
      Row() {
        Text('私聊')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .fontColor('#333333')
        Blank()
      }
      .width('100%')
      .height(56)
      .padding({ left: 16, right: 16 })
      .backgroundColor('#FFFFFF')

      List() {
        ForEach(this.sessions, (session: PrivateChatSession) => {
          ListItem() {
            Row() {
              Image(session.receiverAvatar || '')
                .width(50)
                .height(50)
                .borderRadius(25)
                .backgroundColor('#E8E8E8')
                .margin({ right: 12 })

              Column() {
                Text(session.receiverUserName)
                  .fontSize(16)
                  .fontColor('#333333')
                  .fontWeight(FontWeight.Medium)

                Text(session.preview || '暂无消息')
                  .fontSize(14)
                  .fontColor('#999999')
                  .maxLines(1)
                  .margin({ top: 4 })
              }
              .alignItems(HorizontalAlign.Start)
              .layoutWeight(1)
            }
            .padding(16)
          }
        }, (session: PrivateChatSession) => session.oId)
      }
      .layoutWeight(1)
      .width('100%')
    }
    .width('100%')
    .height('100%')
  }

  /**
   * 我的内容
   */
  @Builder
  ProfileContent() {
    Column() {
      Row() {
        Text('我的')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .fontColor('#333333')
        Blank()
        Text('设置')
          .fontSize(14)
          .fontColor('#1890FF')
          .onClick(() => {
            try {
              this.getUIContext().getRouter().pushUrl({ url: 'pages/SettingsPage' });
            } catch (err) {
              // 路由跳转失败
            }
          })
      }
      .width('100%')
      .height(56)
      .padding({ left: 16, right: 16 })
      .backgroundColor('#FFFFFF')

      List() {
        ListItem() {
          Row() {
            Image(this.userInfo?.userAvatarURL || '')
              .width(64)
              .height(64)
              .borderRadius(32)
              .backgroundColor('#E8E8E8')

            Column() {
              Text(this.userInfo?.userName || '')
                .fontSize(18)
                .fontColor('#333333')
                .fontWeight(FontWeight.Bold)

              Text(`积分: ${this.userInfo?.point || 0}`)
                .fontSize(14)
                .fontColor('#1890FF')
                .margin({ top: 4 })
            }
            .margin({ left: 16 })
            .alignItems(HorizontalAlign.Start)
          }
          .padding(16)
        }

        ListItem() {
          Column() {
            this.ProfileMenuItem('🔔', '通知中心', () => {
              try {
                this.getUIContext().getRouter().pushUrl({ url: 'pages/NotificationPage' });
              } catch (err) {
                // 路由跳转失败
              }
            })
            this.ProfileMenuItem('🌙', '清风明月', () => {
              try {
                this.getUIContext().getRouter().pushUrl({ url: 'pages/BreezemoonPage' });
              } catch (err) {
                // 路由跳转失败
              }
            })
            this.ProfileMenuItem('💰', '积分转账', () => {
              try {
                this.getUIContext().getRouter().pushUrl({ url: 'pages/TransferPage' });
              } catch (err) {
                // 路由跳转失败
              }
            })
          }
          .backgroundColor('#FFFFFF')
        }
      }
      .layoutWeight(1)
      .width('100%')
    }
    .width('100%')
    .height('100%')
  }

  @Builder
  ProfileMenuItem(icon: string, title: string, onClick: () => void) {
    Row() {
      Text(icon)
        .fontSize(20)
        .margin({ right: 12 })

      Text(title)
        .fontSize(15)
        .fontColor('#333333')

      Blank()

      Text('>')
        .fontSize(14)
        .fontColor('#CCCCCC')
    }
    .height(56)
    .padding({ left: 16, right: 16 })
    .border({ width: { bottom: 0.5 }, color: '#F0F0F0' })
    .onClick(onClick)
  }
}
