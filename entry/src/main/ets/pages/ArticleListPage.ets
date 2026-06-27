import { HttpUtil, ApiResponse } from '../util/HttpUtil';
import { TimeUtil } from '../util/TimeUtil';
import { Article, ArticleListResponse } from '../model/Article';

/**
 * Tab配置接口
 */
interface TabConfig {
  title: string;
  path: string;
}

/**
 * 文章列表页面
 * 展示最近、热门、精华、最近回复四类文章
 */
@Entry
@Component
struct ArticleListPage {
  @State articles: Article[] = [];
  @State currentTab: number = 0;
  @State currentPage: number = 1;
  @State isLoading: boolean = false;
  @State hasMore: boolean = true;

  // 状态栏高度（用于避让）
  @StorageProp('topRectHeight') topRectHeight: number = 0;

  // Tab配置
  private tabs: TabConfig[] = [
    { title: '最近', path: '/api/articles/recent' },
    { title: '热门', path: '/api/articles/recent/hot' },
    { title: '精华', path: '/api/articles/recent/good' },
    { title: '最近回复', path: '/api/articles/recent/reply' }
  ];

  /**
   * 页面出现时加载数据
   */
  async aboutToAppear(): Promise<void> {
    await this.loadArticles();
  }

  /**
   * 加载文章列表
   */
  private async loadArticles(): Promise<void> {
    if (this.isLoading) return;

    this.isLoading = true;

    try {
      const path = this.tabs[this.currentTab].path;
      const params = new Map<string, number>();
      params.set('p', this.currentPage);
      const response = await HttpUtil.get<ArticleListResponse>(path, params);

      if (response.code === 0 && response.data && response.data.articles) {
        if (this.currentPage === 1) {
          this.articles = response.data.articles;
        } else {
          this.articles = [...this.articles, ...response.data.articles];
        }
        this.hasMore = response.data.articles.length >= 20;
      }
    } catch (err) {
      // 加载文章失败
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * 切换Tab
   */
  private switchTab(index: number): void {
    if (this.currentTab === index) return;

    this.currentTab = index;
    this.currentPage = 1;
    this.hasMore = true;
    this.articles = [];
    this.loadArticles();
  }

  /**
   * 加载更多
   */
  private loadMore(): void {
    if (!this.hasMore || this.isLoading) return;

    this.currentPage++;
    this.loadArticles();
  }

  /**
   * 跳转文章详情
   */
  private goDetail(articleId: string): void {
    try {
      this.getUIContext().getRouter().pushUrl({
        url: 'pages/ArticleDetailPage',
        params: { articleId: articleId }
      });
    } catch (err) {
      // 路由跳转失败
    }
  }

  build() {
    Column() {
      // 顶部标题栏
      Row() {
        Text('文章')
          .fontSize(20)
          .fontWeight(FontWeight.Bold)
          .fontColor('#333333')

        Blank()
      }
      .width('100%')
      .height(56)
      .padding({ left: 16, right: 16 })
      .backgroundColor('#FFFFFF')

      // Tab栏
      Row() {
        ForEach(this.tabs, (tab: TabConfig, index: number) => {
          Column() {
            Text(tab.title)
              .fontSize(14)
              .fontColor(this.currentTab === index ? '#1890FF' : '#666666')
              .fontWeight(this.currentTab === index ? FontWeight.Medium : FontWeight.Normal)

            // 选中指示器
            if (this.currentTab === index) {
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
            this.switchTab(index);
          })
        }, (tab: TabConfig, index: number) => `${tab.title}_${index}`)
      }
      .width('100%')
      .backgroundColor('#FFFFFF')
      .border({ width: { bottom: 0.5 }, color: '#E8E8E8' })

      // 文章列表
      List() {
        ForEach(this.articles, (article: Article) => {
          ListItem() {
            this.ArticleCard(article)
          }
        }, (article: Article) => article.oId)

        // 加载更多
        if (this.hasMore) {
          ListItem() {
            Text(this.isLoading ? '加载中...' : '加载更多')
              .fontSize(14)
              .fontColor('#1890FF')
              .width('100%')
              .textAlign(TextAlign.Center)
              .padding(16)
              .onClick(() => {
                this.loadMore();
              })
          }
        }
      }
      .layoutWeight(1)
      .width('100%')
      .backgroundColor('#F5F5F5')
    }
    .width('100%')
    .height('100%')
    .padding({ top: this.getUIContext().px2vp(this.topRectHeight) })
  }

  /**
   * 文章卡片组件
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
          // 浏览数
          Row() {
            Text('👁')
              .fontSize(12)
            Text(article.articleViewCount.toString())
              .fontSize(12)
              .fontColor('#999999')
              .margin({ left: 4 })
          }
          .margin({ right: 16 })

          // 评论数
          Row() {
            Text('💬')
              .fontSize(12)
            Text(article.articleCommentCount.toString())
              .fontSize(12)
              .fontColor('#999999')
              .margin({ left: 4 })
          }
          .margin({ right: 16 })

          // 点赞数
          Row() {
            Text('👍')
              .fontSize(12)
            Text(article.articleGoodCnt.toString())
              .fontSize(12)
              .fontColor('#999999')
              .margin({ left: 4 })
          }
        }

        // 时间
        Text(TimeUtil.formatTime(article.articleCreateTime))
          .fontSize(12)
          .fontColor('#CCCCCC')
          .margin({ left: 12 })
      }
      .width('100%')
      .margin({ top: 12 })

      // 标签
      if (article.articleTags) {
        Row() {
          ForEach(article.articleTags.split(','), (tag: string) => {
            if (tag.trim()) {
              Text(tag.trim())
                .fontSize(11)
                .fontColor('#1890FF')
                .backgroundColor('#E6F7FF')
                .padding({ left: 6, right: 6, top: 2, bottom: 2 })
                .borderRadius(4)
                .margin({ right: 6 })
            }
          }, (tag: string) => tag)
        }
        .margin({ top: 8 })
      }
    }
    .width('100%')
    .padding(16)
    .backgroundColor('#FFFFFF')
    .margin({ bottom: 8 })
    .onClick(() => {
      this.goDetail(article.oId);
    })
  }
}
