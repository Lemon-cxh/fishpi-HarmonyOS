import { HttpUtil, ApiResponse } from '../util/HttpUtil';
import { TimeUtil } from '../util/TimeUtil';
import { Article, ArticleListResponse } from '../model/Article';
import { processText } from '../util/EmojiUtil';

/**
 * Tab配置接口
 */
interface TabConfig {
  title: string;
  path: string;
}

/**
 * 文章列表组件
 * 可嵌入到其他页面中使用
 */
@Component
export struct ArticleListComponent {
  @State articles: Article[] = [];
  @State currentTab: number = 0;
  @State currentPage: number = 1;
  @State isLoading: boolean = false;
  @State hasMore: boolean = true;

  // 是否显示标题栏
  @Prop showTitle: boolean = true;

  // Tab配置
  private tabs: TabConfig[] = [
    { title: '最近', path: '/api/articles/recent' },
    { title: '热门', path: '/api/articles/recent/hot' },
    { title: '点赞', path: '/api/articles/recent/good' },
    { title: '最近回复', path: '/api/articles/recent/reply' }
  ];

  /**
   * 组件出现时加载数据
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
      // 顶部标题栏（可选）
      if (this.showTitle) {
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
      }

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
  }

  /**
   * 文章卡片组件
   */
  @Builder
  ArticleCard(article: Article) {
    Column() {
      // 标题（左对齐）
      Text(processText(article.articleTitleEmoj || article.articleTitle))
        .fontSize(16)
        .fontWeight(FontWeight.Medium)
        .fontColor('#333333')
        .maxLines(2)
        .textOverflow({ overflow: TextOverflow.Ellipsis })
        .width('100%')
        .textAlign(TextAlign.Start)

      // 文章摘要
      if (article.articleAbstract || article.articlePreviewContent) {
        Text(processText(article.articleAbstract || article.articlePreviewContent || ''))
          .fontSize(14)
          .fontColor('#666666')
          .maxLines(2)
          .textOverflow({ overflow: TextOverflow.Ellipsis })
          .width('100%')
          .margin({ top: 8 })
          .textAlign(TextAlign.Start)
      }

      // 文章缩略图
      if (article.articleThumbnailURL) {
        Image(article.articleThumbnailURL)
          .width('100%')
          .height(180)
          .objectFit(ImageFit.Cover)
          .borderRadius(8)
          .margin({ top: 12 })
      }

      // 标签
      if (article.articleTags) {
        Row() {
          ForEach(article.articleTags.split(','), (tag: string) => {
            if (tag.trim()) {
              Text(tag.trim())
                .fontSize(11)
                .fontColor('#1890FF')
                .backgroundColor('#E6F7FF')
                .padding({ left: 8, right: 8, top: 3, bottom: 3 })
                .borderRadius(4)
                .margin({ right: 6 })
            }
          }, (tag: string) => tag)
        }
        .width('100%')
        .margin({ top: 10 })
        .justifyContent(FlexAlign.Start)
      }

      // 底部信息
      Column() {
        // 第一行：头像+用户名 | 统计信息
        Row() {
          // 左侧：头像+用户名
          Row() {
            Image(article.articleAuthorThumbnailURL48 || article.articleAuthorAvatarURL || '')
              .width(24)
              .height(24)
              .borderRadius(12)
              .backgroundColor('#F0F0F0')

            Text(article.articleAuthorName)
              .fontSize(13)
              .fontColor('#666666')
              .margin({ left: 8 })
          }

          Blank()

          // 右侧：统计信息
          Row() {
            Text(`阅读 ${article.articleViewCntDisplayFormat || article.articleViewCount}`)
              .fontSize(12)
              .fontColor('#999999')
              .margin({ right: 12 })

            Text(`评论 ${article.articleCommentCount}`)
              .fontSize(12)
              .fontColor('#999999')
              .margin({ right: 12 })

            Text(`点赞 ${article.articleGoodCnt}`)
              .fontSize(12)
              .fontColor('#999999')
          }
        }
        .width('100%')

        // 第二行：时间
        Row() {
          Blank()
          Text(article.timeAgo || TimeUtil.formatTime(article.articleCreateTime))
            .fontSize(11)
            .fontColor('#CCCCCC')
        }
        .width('100%')
        .margin({ top: 4 })
      }
      .width('100%')
      .margin({ top: 12 })
    }
    .width('100%')
    .padding(16)
    .backgroundColor('#FFFFFF')
    .borderRadius(8)
    .margin({ bottom: 8 })
    .onClick(() => {
      this.goDetail(article.oId);
    })
  }
}
