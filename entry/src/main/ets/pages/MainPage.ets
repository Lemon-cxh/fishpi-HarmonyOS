import { HttpUtil } from '../util/HttpUtil';
import { StorageUtil } from '../util/StorageUtil';
import { ThemeUtil, LightColorScheme, DarkColorScheme } from '../util/ThemeUtil';
import { Spacing, BorderRadius, FontSize, ComponentSize } from '../constants/DesignTokens';
import { Article, ArticleListResponse } from '../model/Article';
import { PrivateChatSession, PrivateChatListResponse } from '../model/Notification';
import { UserInfo, UserInfoResponse } from '../model/User';
import { ChatRoomComponent } from '../components/ChatRoomComponent';
import { hilog } from '@kit.PerformanceAnalysisKit';

/**
 * 通用API响应接口
 */
interface ApiResponse {
  code: number;
  msg?: string;
}

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
  @State articles: Article[] = [];
  @State articleTab: number = 0;
  @State articlePage: number = 1;
  @State articleLoading: boolean = false;
  @State articleHasMore: boolean = true;
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

  // 文章Tab配置
  private articleTabs: TabItem[] = [
    { title: '最近', icon: '' },
    { title: '热门', icon: '' },
    { title: '精华', icon: '' },
    { title: '最近回复', icon: '' }
  ];

  // 文章API路径
  private articleApiPaths: string[] = [
    '/api/articles/recent',
    '/api/articles/recent/hot',
    '/api/articles/recent/good',
    '/api/articles/recent/reply'
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
      this.loadArticles(),
      this.loadPrivateChatSessions(),
      this.loadUserInfo()
    ]);
  }

  /**
   * 加载文章列表
   */
  private async loadArticles(): Promise<void> {
    if (this.articleLoading) return;

    this.articleLoading = true;

    try {
      const path = this.articleApiPaths[this.articleTab];
      const params = new Map<string, number>();
      params.set('p', this.articlePage);
      const response = await HttpUtil.get<ArticleListResponse>(path, params);

      if (response.code === 0 && response.data && response.data.articles && Array.isArray(response.data.articles)) {
        if (this.articlePage === 1) {
          this.articles = response.data.articles;
        } else {
          this.articles = [...this.articles, ...response.data.articles];
        }
        this.articleHasMore = response.data.articles.length >= 20;
      } else {
        if (this.articlePage === 1) {
          this.articles = [];
        }
      }
    } catch (err) {
      hilog.error(0x0000, 'MainPage', `Error loading articles: ${JSON.stringify(err)}`);
      if (this.articlePage === 1) {
        this.articles = [];
      }
    } finally {
      this.articleLoading = false;
    }
  }

  /**
   * 切换文章Tab
   */
  private switchArticleTab(index: number): void {
    if (this.articleTab === index) return;

    this.articleTab = index;
    this.articlePage = 1;
    this.articleHasMore = true;
    this.articles = [];
    this.loadArticles();
  }

  /**
   * 加载更多文章
   */
  private loadMoreArticles(): void {
    if (!this.articleHasMore || this.articleLoading) return;

    this.articlePage++;
    this.loadArticles();
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
        Column() {
          this.ArticleContent()
        }
        .visibility(this.currentIndex === 1 ? Visibility.Visible : Visibility.None)
        .layoutWeight(1)
        .width('100%')

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
   * 文章内容
   */
  @Builder
  ArticleContent() {
    Column() {
      // 顶部标题栏
      Row() {
        Text('文章')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .fontColor('#333333')
        Blank()
      }
      .width('100%')
      .height(56)
      .padding({ left: 16, right: 16 })
      .backgroundColor('#FFFFFF')

      // 文章Tab栏
      Row() {
        ForEach(this.articleTabs, (tab: TabItem, index: number) => {
          Column() {
            Text(tab.title)
              .fontSize(14)
              .fontColor(this.articleTab === index ? '#1890FF' : '#666666')
              .fontWeight(this.articleTab === index ? FontWeight.Medium : FontWeight.Normal)

            // 选中指示器
            if (this.articleTab === index) {
              Divider()
                .strokeWidth(2)
                .color('#1890FF')
                .width(24)
                .margin({ top: 4 })
            }
          }
          .layoutWeight(1)
          .justifyContent(FlexAlign.Center)
          .padding({ top: 12, bottom: 12 })
          .onClick(() => {
            this.switchArticleTab(index);
          })
        }, (tab: TabItem, index: number) => `${tab.title}_${index}`)
      }
      .width('100%')
      .backgroundColor('#FFFFFF')
      .border({ width: { bottom: 0.5 }, color: '#E8E8E8' })

      // 文章列表
      if (this.articles.length === 0 && !this.articleLoading) {
        // 空状态
        Column() {
          Text('暂无文章')
            .fontSize(16)
            .fontColor('#999999')
            .margin({ top: 100 })
        }
        .layoutWeight(1)
        .width('100%')
      } else {
        List() {
          ForEach(this.articles, (article: Article) => {
            ListItem() {
              this.ArticleCard(article)
            }
          }, (article: Article) => article.oId)

          // 加载更多
          if (this.articleHasMore) {
            ListItem() {
              Row() {
                LoadingProgress()
                  .width(20)
                  .height(20)
                  .color('#1890FF')
                  .visibility(this.articleLoading ? Visibility.Visible : Visibility.None)

                Text(this.articleLoading ? '加载中...' : '加载更多')
                  .fontSize(14)
                  .fontColor('#1890FF')
                  .margin({ left: 8 })
              }
              .width('100%')
              .justifyContent(FlexAlign.Center)
              .padding(16)
              .onClick(() => {
                this.loadMoreArticles();
              })
            }
          }
        }
        .layoutWeight(1)
        .width('100%')
        .backgroundColor('#F5F5F5')
      }
    }
    .width('100%')
    .height('100%')
  }

  /**
   * 文章卡片
   */
  @Builder
  ArticleCard(article: Article) {
    Column() {
      // 标题
      Text(article.articleTitle)
        .fontSize(16)
        .fontWeight(FontWeight.Medium)
        .fontColor('#333333')
        .maxLines(2)
        .textOverflow({ overflow: TextOverflow.Ellipsis })

      // 摘要
      if (article.articleAbstract) {
        Text(article.articleAbstract)
          .fontSize(14)
          .fontColor('#666666')
          .maxLines(2)
          .textOverflow({ overflow: TextOverflow.Ellipsis })
          .margin({ top: 8 })
      }

      // 底部信息
      Row() {
        // 作者信息
        Row() {
          Image(article.articleAuthorAvatarURL || '')
            .width(20)
            .height(20)
            .borderRadius(10)
            .backgroundColor('#E8E8E8')

          Text(article.articleAuthorName)
            .fontSize(12)
            .fontColor('#999999')
            .margin({ left: 6 })
        }

        Blank()

        // 统计信息
        Row() {
          Text(`${article.articleViewCount} 浏览`)
            .fontSize(12)
            .fontColor('#999999')
            .margin({ right: 12 })

          Text(`${article.articleCommentCount} 评论`)
            .fontSize(12)
            .fontColor('#999999')
        }
      }
      .width('100%')
      .margin({ top: 12 })
    }
    .width('100%')
    .padding(16)
    .backgroundColor('#FFFFFF')
    .margin({ bottom: 8 })
    .onClick(() => {
      try {
        this.getUIContext().getRouter().pushUrl({
          url: 'pages/ArticleDetailPage',
          params: { articleId: article.oId }
        });
      } catch (err) {
        // 路由跳转失败
      }
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
