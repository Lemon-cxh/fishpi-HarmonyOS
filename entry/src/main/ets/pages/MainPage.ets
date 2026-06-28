import { HttpUtil } from '../util/HttpUtil';
import { StorageUtil } from '../util/StorageUtil';
import { ThemeUtil, LightColorScheme, DarkColorScheme } from '../util/ThemeUtil';
import { Spacing, BorderRadius, FontSize, ComponentSize } from '../constants/DesignTokens';
import { PrivateChatSession, PrivateChatListResponse } from '../model/Notification';
import { UserInfo, UserInfoResponse } from '../model/User';
import { ChatRoomComponent } from '../components/ChatRoomComponent';
import { ArticleListComponent } from '../components/ArticleListComponent';
import { HdsTabs, HdsTabsController, hdsMaterial, HdsBarStyle, HdsNavigation, HdsNavigationTitleMode, ScrollEffectType } from '@kit.UIDesignKit';

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

  // HdsTabs 控制器
  private hdsTabsController: HdsTabsController = new HdsTabsController();
  
  // 滚动控制器（用于标题栏滚动效果）
  private scroller: Scroller = new Scroller();

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
    // 使用 HdsNavigation 包裹整个应用，提供沉浸光感标题栏
    HdsNavigation() {
      // 沉浸式迷你栏底部导航
      HdsTabs({ controller: this.hdsTabsController }) {
        // 聊天室
        TabContent() {
          ChatRoomComponent({ 
            bottomPadding: 56 + (this.bottomRectHeight > 0 ? this.getUIContext().px2vp(this.bottomRectHeight) : 0)
          })
        }
        .tabBar(this.TabBarBuilder(0))

        // 文章
        TabContent() {
          ArticleListComponent({ showTitle: false })
        }
        .tabBar(this.TabBarBuilder(1))

        // 私聊
        TabContent() {
          Column() {
            this.PrivateChatContent()
          }
          .width('100%')
          .height('100%')
        }
        .tabBar(this.TabBarBuilder(2))

        // 我的
        TabContent() {
          Column() {
            this.ProfileContent()
          }
          .width('100%')
          .height('100%')
        }
        .tabBar(this.TabBarBuilder(3))
      }
      .barOverlap(true) // 页签栏悬浮于内容之上
      .vertical(false) // 水平排列
      .barPosition(BarPosition.End) // 页签栏置于容器底部
      .barFloatingStyle({
        barBottomMargin: this.bottomRectHeight > 0 ? this.getUIContext().px2vp(this.bottomRectHeight) : 28,
        barOpacity: 0.85, // 页签栏透明度，1表示不透明，0表示完全透明
        gradientMask: {
          maskHeight: 80, // 渐变遮罩高度
          maskColor: '#40F5F5F5' // 渐变遮罩颜色，带透明度
        },
        systemMaterialEffect: {
          materialType: hdsMaterial.MaterialType.IMMERSIVE, // 沉浸材质
          materialLevel: hdsMaterial.MaterialLevel.ADAPTIVE // 自适应级别，系统根据设备性能自动选择
        }
      })
      .onTabBarClick((index: number) => {
        this.currentIndex = index;
      })
      .width('100%')
      .height('100%')
      .padding({ top: this.topRectHeight > 0 ? this.getUIContext().px2vp(this.topRectHeight) : 0 })
    }
    .titleBar({
      style: {
        scrollEffectOpts: {
          enableScrollEffect: true,
          scrollEffectType: ScrollEffectType.GRADIENT_BLUR
        },
        systemMaterialEffect: {
          materialType: hdsMaterial.MaterialType.ADAPTIVE,
          materialLevel: hdsMaterial.MaterialLevel.ADAPTIVE
        }
      }
    })
    .hideBackButton(true)
    .hideTitleBar(true)
    .width('100%')
    .height('100%')
    .backgroundColor('#F5F5F5')
  }

  /**
   * TabBar 构建器
   */
  @Builder
  TabBarBuilder(index: number) {
    Column() {
      Text(this.tabItems[index].icon)
        .fontSize(24)
        .margin({ bottom: 4 })

      Text(this.tabItems[index].title)
        .fontSize(12)
        .fontColor(this.currentIndex === index ? '#1890FF' : '#000000')
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
  }

  /**
   * 私聊内容
   */
  @Builder
  PrivateChatContent() {
    Column() {
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
            this.ProfileMenuItem('⚙️', '设置', () => {
              try {
                this.getUIContext().getRouter().pushUrl({ url: 'pages/SettingsPage' });
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
