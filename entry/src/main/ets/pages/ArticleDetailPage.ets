import { HttpUtil, ApiResponse } from '../util/HttpUtil';
import { StorageUtil } from '../util/StorageUtil';
import { TimeUtil } from '../util/TimeUtil';
import { Article, ArticleDetailResponse, Comment, CommentListResponse, ArticleDetailData, CommentThreadReply, ReplyListResponse } from '../model/Article';
import { processText, processCommentHtml } from '../util/EmojiUtil';
import { StyledStringUtil } from '../util/StyledStringUtil';
import { parseHtmlContent, ContentSegment } from '../util/HtmlParserUtil';
import { CommentContent } from '../components/CommentContent';
import hilog from '@ohos.hilog';
import { Markdown, MarkdownController } from '@luvi/lv-markdown-in';

/**
 * 评论数据源 - 用于LazyForEach懒加载
 */
class CommentDataSource implements IDataSource {
  private comments: Comment[] = [];
  private listeners: DataChangeListener[] = [];

  totalCount(): number {
    return this.comments.length;
  }

  getData(index: number): Comment {
    return this.comments[index];
  }

  registerDataChangeListener(listener: DataChangeListener): void {
    if (this.listeners.indexOf(listener) < 0) {
      this.listeners.push(listener);
    }
  }

  unregisterDataChangeListener(listener: DataChangeListener): void {
    const pos = this.listeners.indexOf(listener);
    if (pos >= 0) {
      this.listeners.splice(pos, 1);
    }
  }

  notifyDataReload(): void {
    this.listeners.forEach(listener => {
      listener.onDataReloaded();
    });
  }

  notifyDataAdd(index: number): void {
    this.listeners.forEach(listener => {
      listener.onDataAdded(index);
    });
  }

  setData(comments: Comment[]): void {
    this.comments = comments;
    this.notifyDataReload();
  }

  clear(): void {
    this.comments = [];
    this.notifyDataReload();
  }
}

/**
 * 文章详情页面
 * 展示文章内容、作者信息、评论列表
 */
@Entry
@Component
struct ArticleDetailPage {
  @State article: Article | null = null;
  @State commentText: string = '';
  @State isLoading: boolean = false;
  @State isSendingComment: boolean = false;
  @State isLiked: boolean = false;
  @State articleId: string = '';
  // 评论相关状态
  @State commentSort: string = 'hot';  // 排序方式：hot/空
  @State commentPage: number = 1;      // 当前页码
  @State commentPageCount: number = 1; // 总页数
  @State onlyAuthor: boolean = false;  // 只看楼主
  // 正在加载回复的评论ID（用于显示加载状态）
  @State loadingRepliesCommentId: string = '';
  // Markdown 渲染控制器（用于代码块复制等功能）
  private markdownController: MarkdownController = new MarkdownController();
  // 是否渲染 Markdown 内容（延迟渲染优化性能）
  @State shouldRenderContent: boolean = false;
  // 是否使用 Markdown 格式渲染
  @State useMarkdown: boolean = false;
  // 评论数据源 - 用于LazyForEach懒加载
  private commentDataSource: CommentDataSource = new CommentDataSource();
  // 评论数量（用于显示）
  @State commentCount: number = 0;
  // 评论内容控制器映射（用于StyledString渲染HTML）
  private commentControllers: Map<string, TextController> = new Map();
  // 回复内容控制器映射（用于StyledString渲染HTML）
  private replyControllers: Map<string, TextController> = new Map();

  // 状态栏高度（用于避让）
  @StorageProp('topRectHeight') topRectHeight: number = 0;


  /**
   * 从路由参数获取文章ID
   */
  async aboutToAppear(): Promise<void> {
    // 注册代码块复制监听（v3.1.0+ 必需）
    this.markdownController.setCodeCopyListener((text: string) => {
      hilog.info(0x0000, 'ArticleDetail', `Copy code: ${text.substring(0, 50)}...`);
      // 复制成功后可以显示 Toast 提示
    });

    try {
      const params = this.getUIContext().getRouter().getParams() as Record<string, string>;
      this.articleId = params?.articleId || '';

      if (this.articleId) {
        // 优化：先加载文章，立即显示
        await this.loadArticle();
        
        // 延迟渲染文章内容，优化性能
        setTimeout(() => {
          this.shouldRenderContent = true;
        }, 50);
        
        // 优化：延迟加载评论，不阻塞文章显示
        setTimeout(() => {
          this.loadComments();
        }, 300);
      }
    } catch (err) {
      // 获取路由参数失败
    }
  }
  
  /**
   * 页面销毁时清理资源
   */
  aboutToDisappear(): void {
    // 重置渲染状态，帮助释放资源
    this.shouldRenderContent = false;
    
    // 清理评论数据源，释放内存
    this.commentDataSource.clear();
    
    // 清理TextController映射，释放内存
    this.commentControllers.clear();
    this.replyControllers.clear();
    
    hilog.info(0x0000, 'ArticleDetail', 'Resources cleaned up');
  }

  /**
   * 加载文章详情
   */
  private async loadArticle(): Promise<void> {
    this.isLoading = true;

    try {
      const response = await HttpUtil.get<ArticleDetailResponse>(`/api/article/${this.articleId}`);
      
      hilog.info(0x0000, 'ArticleDetail', `Response code: ${response.code}`);

      if (response.code === 0 && response.data) {
        const data = response.data;
        
        // API 返回 { article: {...} } 结构
        if (data.article) {
          this.article = data.article;
        }
        
        // 判断是否使用 Markdown 格式渲染
        // 只有当 articleOriginalContent 存在且不为空时才使用 Markdown，否则使用 HTML（性能更好）
        this.useMarkdown = !!(this.article?.articleOriginalContent && this.article.articleOriginalContent.trim().length > 0);
        
        hilog.info(0x0000, 'ArticleDetail', `Article loaded: ${this.article?.articleTitle}, useMarkdown: ${this.useMarkdown}`);
      }
    } catch (err) {
      hilog.error(0x0000, 'ArticleDetail', `Error: ${JSON.stringify(err)}`);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * 加载评论列表
   */
  private async loadComments(): Promise<void> {
    try {
      // 构建请求参数
      const params = new Map<string, string | number>();
      params.set('articleId', this.articleId);
      params.set('paginationCurrentPageNum', this.commentPage);
      
      // 添加排序参数
      if (this.commentSort === 'hot') {
        params.set('sort', 'hot');
      }
      
      // 添加只看楼主参数
      if (this.onlyAuthor) {
        params.set('author', '1');
      }
      
      const response = await HttpUtil.post<CommentListResponse>(
        '/comment/thread/parents',
        params
      );

      hilog.info(0x0000, 'ArticleDetail', `Comments response code: ${response.code}`);

      if (response.code === 0) {
        // 处理新的响应结构
        if (response.commentThreadParents && Array.isArray(response.commentThreadParents)) {
          // 优化：限制初始显示的评论数量，避免一次性渲染太多
          const limitedComments = response.commentThreadParents.slice(0, 20);
          this.commentDataSource.setData(limitedComments);
          this.commentCount = response.commentThreadParents.length;
          
          // 更新分页信息
          if (response.pagination) {
            this.commentPageCount = response.pagination.paginationPageCount;
          }
          
          hilog.info(0x0000, 'ArticleDetail', `Loaded ${limitedComments.length} comments (total: ${this.commentCount})`);
        } else if (response.data && Array.isArray(response.data)) {
          // 兼容旧格式
          const limitedComments = response.data.slice(0, 20);
          this.commentDataSource.setData(limitedComments);
          this.commentCount = response.data.length;
        } else {
          this.commentDataSource.clear();
          this.commentCount = 0;
        }
      } else {
        hilog.error(0x0000, 'ArticleDetail', `Comments error: ${response.msg}`);
        this.commentDataSource.clear();
        this.commentCount = 0;
      }
    } catch (err) {
      hilog.error(0x0000, 'ArticleDetail', `Load comments error: ${JSON.stringify(err)}`);
      this.commentDataSource.clear();
      this.commentCount = 0;
    }
  }

  /**
   * 点赞文章
   */
  private async likeArticle(): Promise<void> {
    if (this.isLiked) return;

    try {
      const params = new Map<string, string>();
      params.set('dataId', this.articleId);
      const response = await HttpUtil.post<ApiResponse>('/vote/up/article', params);

      if (response.code === 0) {
        this.isLiked = true;
        if (this.article) {
          this.article.articleGoodCnt++;
        }
      }
    } catch (err) {
      // 点赞文章失败
    }
  }

  /**
   * 感谢文章
   */
  private async thankArticle(): Promise<void> {
    try {
      const response = await HttpUtil.post<ApiResponse>(`/article/thank?articleId=${this.articleId}`);

      if (response.code === 0) {
        if (this.article) {
          this.article.articleThankCnt++;
        }
      }
    } catch (err) {
      // 感谢文章失败
    }
  }

  /**
   * 发表评论
   */
  private async postComment(): Promise<void> {
    const content = this.commentText.trim();
    if (!content || this.isSendingComment) return;

    this.isSendingComment = true;

    try {
      const params = new Map<string, string>();
      params.set('articleId', this.articleId);
      params.set('commentContent', content);
      const response = await HttpUtil.post<ApiResponse>('/comment', params);

      if (response.code === 0) {
        this.commentText = '';
        // 重新加载评论
        await this.loadComments();
      }
    } catch (err) {
      // 发表评论失败
    } finally {
      this.isSendingComment = false;
    }
  }

  /**
   * 点赞评论
   */
  private async likeComment(commentId: string): Promise<void> {
    try {
      const params = new Map<string, string>();
      params.set('dataId', commentId);
      const response = await HttpUtil.post<ApiResponse>('/vote/up/comment', params);

      if (response.code === 0) {
        // 优化：由于使用LazyForEach，直接刷新数据源
        hilog.info(0x0000, 'ArticleDetail', `Comment ${commentId} liked`);
      }
    } catch (err) {
      // 点赞评论失败
    }
  }

  /**
   * 感谢评论
   */
  private async thankComment(commentId: string): Promise<void> {
    try {
      const response = await HttpUtil.post<ApiResponse>(`/comment/thank?commentId=${commentId}`);

      if (response.code === 0) {
        // 优化：由于使用LazyForEach，直接刷新数据源
        hilog.info(0x0000, 'ArticleDetail', `Comment ${commentId} thanked`);
      }
    } catch (err) {
      // 感谢评论失败
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

        Text('文章详情')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .fontColor('#333333')
          .margin({ left: 16 })

        Blank()
      }
      .width('100%')
      .height(56)
      .padding({ left: 16, right: 16 })
      .backgroundColor('#FFFFFF')
      .border({ width: { bottom: 0.5 }, color: '#E8E8E8' })

      if (this.isLoading) {
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
      } else if (this.article) {
        // 文章内容
        List() {
          // 文章信息
          ListItem() {
            Column() {
              // 标题
              Text(processText(this.article!.articleTitle))
                .fontSize(22)
                .fontWeight(FontWeight.Bold)
                .fontColor('#333333')

              // 作者信息
              Row() {
                Image(this.article!.articleAuthorThumbnailURL48 || this.article!.articleAuthorAvatarURL || '')
                  .width(36)
                  .height(36)
                  .borderRadius(18)
                  .backgroundColor('#E8E8E8')

                Column() {
                  Text(this.article!.articleAuthorName)
                    .fontSize(14)
                    .fontWeight(FontWeight.Medium)
                    .fontColor('#333333')

                  Text(TimeUtil.formatTime(this.article!.articleCreateTime))
                    .fontSize(12)
                    .fontColor('#999999')
                }
                .alignItems(HorizontalAlign.Start)
                .margin({ left: 12 })

                Blank()

                Button('关注')
                  .type(ButtonType.Capsule)
                  .height(30)
                  .width(60)
                  .fontSize(12)
                  .backgroundColor('#1890FF')
                  .fontColor('#FFFFFF')
              }
              .width('100%')
              .margin({ top: 20 })

              // 统计信息
              Row() {
                Text(`${this.article!.articleViewCount} 浏览`)
                  .fontSize(12)
                  .fontColor('#999999')
                  .margin({ right: 16 })

                Text(`${this.article!.articleCommentCount} 评论`)
                  .fontSize(12)
                  .fontColor('#999999')
                  .margin({ right: 16 })

                Text(`${this.article!.articleGoodCnt} 点赞`)
                  .fontSize(12)
                  .fontColor('#999999')
              }
              .width('100%')
              .margin({ top: 16 })

              // 标签
              if (this.article!.articleTags && this.article!.articleTags.length > 0) {
                Row() {
                  ForEach(this.article!.articleTags.split(','), (tag: string) => {
                    if (tag && tag.trim()) {
                      Text(tag.trim())
                        .fontSize(12)
                        .fontColor('#1890FF')
                        .backgroundColor('#E6F7FF')
                        .padding({ left: 8, right: 8, top: 4, bottom: 4 })
                        .borderRadius(4)
                        .margin({ right: 8 })
                    }
                  }, (tag: string, index: number) => `${index}-${tag}`)
                }
                .justifyContent(FlexAlign.Start)
                .width('100%')
                .margin({ top: 12 })
              }
            }
            .width('100%')
            .padding(16)
          }

          // 文章内容
          ListItem() {
            Column() {
              if (!this.shouldRenderContent) {
                // 内容加载中状态
                Column() {
                  LoadingProgress()
                    .width(30)
                    .height(30)
                  Text('内容加载中...')
                    .fontSize(12)
                    .fontColor('#999999')
                    .margin({ top: 8 })
                }
                .width('100%')
                .height(200)
                .justifyContent(FlexAlign.Center)
              } else if (this.useMarkdown) {
                // 使用 @luvi/lv-markdown-in 渲染 Markdown 内容
                Markdown({ 
                  controller: this.markdownController,
                  text: processText(this.article!.articleOriginalContent || '')
                })
              } else {
                // 使用 RichText 渲染 HTML 内容（性能更好）
                RichText(processText(this.article!.articleContent || '暂无内容'))
                  .width('100%')
              }
            }
            .width('100%')
            .padding({ left: 16, right: 16, top: 8, bottom: 8 })
            .backgroundColor('#FFFFFF')
          }

          // 互动栏
          ListItem() {
            Row() {
              // 点赞
              Button(`👍 ${this.article!.articleGoodCnt}`)
                .type(ButtonType.Capsule)
                .height(36)
                .fontSize(13)
                .backgroundColor(this.isLiked ? '#E6F7FF' : '#F5F5F5')
                .fontColor(this.isLiked ? '#1890FF' : '#666666')
                .onClick(() => {
                  this.likeArticle();
                })

              // 感谢
              Button(`🙏 ${this.article!.articleThankCnt}`)
                .type(ButtonType.Capsule)
                .height(36)
                .fontSize(13)
                .backgroundColor('#F5F5F5')
                .fontColor('#666666')
                .margin({ left: 12 })
                .onClick(() => {
                  this.thankArticle();
                })

              Blank()
            }
            .width('100%')
            .padding(16)
            .backgroundColor('#FAFAFA')
          }

          // 评论区标题和筛选
          ListItem() {
            Column() {
              Row() {
                Text(`评论 (${this.commentCount})`)
                  .fontSize(16)
                  .fontWeight(FontWeight.Medium)
                  .fontColor('#333333')
                
                Blank()
                
                // 排序按钮
                Row() {
                  Text(this.commentSort === 'hot' ? '🔥 热门' : '🕐 最新')
                    .fontSize(12)
                    .fontColor('#1890FF')
                    .padding({ left: 8, right: 8, top: 4, bottom: 4 })
                    .backgroundColor('#E6F7FF')
                    .borderRadius(4)
                    .onClick(async () => {
                      this.commentSort = this.commentSort === 'hot' ? '' : 'hot';
                      this.commentPage = 1;
                      await this.loadComments();
                    })
                  
                  // 只看楼主
                  if (this.article && this.article.articleAuthorId) {
                    Text(this.onlyAuthor ? '👤 只看楼主' : '👥 全部')
                      .fontSize(12)
                      .fontColor(this.onlyAuthor ? '#1890FF' : '#666666')
                      .padding({ left: 8, right: 8, top: 4, bottom: 4 })
                      .backgroundColor(this.onlyAuthor ? '#E6F7FF' : '#F5F5F5')
                      .borderRadius(4)
                      .margin({ left: 8 })
                      .onClick(async () => {
                        this.onlyAuthor = !this.onlyAuthor;
                        this.commentPage = 1;
                        await this.loadComments();
                      })
                  }
                }
              }
              .width('100%')
            }
            .width('100%')
            .padding(16)
            .backgroundColor('#FFFFFF')
          }

          // 评论列表 - 优化：使用LazyForEach懒加载
          LazyForEach(this.commentDataSource, (comment: Comment) => {
            ListItem() {
              this.CommentItem(comment)
            }
          }, (comment: Comment) => comment.oId)
        }
        .layoutWeight(1)
        .width('100%')
        .backgroundColor('#FFFFFF')

        // 评论输入框
        Row() {
          TextInput({ placeholder: '写下你的评论...', text: this.commentText })
            .type(InputType.Normal)
            .layoutWeight(1)
            .height(40)
            .backgroundColor('#F5F5F5')
            .borderRadius(20)
            .padding({ left: 16, right: 16 })
            .onChange((value: string) => {
              this.commentText = value;
            })

          Button('发送')
            .type(ButtonType.Capsule)
            .height(40)
            .width(70)
            .backgroundColor('#1890FF')
            .fontColor('#FFFFFF')
            .fontSize(14)
            .margin({ left: 12 })
            .enabled(!this.isSendingComment && this.commentText.trim().length > 0)
            .onClick(() => {
              this.postComment();
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
   * 评论项组件
   */
  @Builder
  CommentItem(comment: Comment) {
    Column() {
      // 评论头部
      Row() {
        Image(comment.commentAuthorThumbnailURL || comment.commentAuthorAvatarURL || '')
          .width(36)
          .height(36)
          .borderRadius(18)
          .backgroundColor('#E8E8E8')

        Column() {
          Row() {
            Text(comment.commentAuthorNickName || comment.commentAuthorName)
              .fontSize(14)
              .fontWeight(FontWeight.Medium)
              .fontColor('#333333')
            
            // 楼主标识
            if (comment.commentIsArticleAuthor) {
              Text('楼主')
                .fontSize(10)
                .fontColor('#FFFFFF')
                .backgroundColor('#FF6B6B')
                .padding({ left: 4, right: 4, top: 1, bottom: 1 })
                .borderRadius(2)
                .margin({ left: 6 })
            }
          }

          Text(comment.timeAgo || TimeUtil.formatTime(comment.commentCreateTime || ''))
            .fontSize(12)
            .fontColor('#999999')
        }
        .alignItems(HorizontalAlign.Start)
        .margin({ left: 10 })
        
        Blank()
        
        // 感谢数
        if (comment.commentThankCnt > 0) {
          Text(`🙏 ${comment.commentThankCnt}`)
            .fontSize(12)
            .fontColor('#999999')
        }
      }
      .width('100%')

      // 评论内容 - 使用自定义HTML解析渲染
      CommentContent({ htmlContent: comment.commentContent })
        .width('100%')
        .margin({ top: 10 })

      // 评论操作
      Row() {
        // 点赞
        Row() {
          Text('👍')
            .fontSize(14)
          if (comment.commentGoodCnt && comment.commentGoodCnt > 0) {
            Text(comment.commentGoodCnt.toString())
              .fontSize(12)
              .fontColor('#999999')
              .margin({ left: 4 })
          }
        }
        .onClick(() => {
          this.likeComment(comment.oId);
        })

        // 感谢
        Row() {
          Text('🙏')
            .fontSize(14)
          if (comment.commentThankCnt > 0) {
            Text(comment.commentThankCnt.toString())
              .fontSize(12)
              .fontColor('#999999')
              .margin({ left: 4 })
          }
        }
        .margin({ left: 20 })
        .onClick(() => {
          this.thankComment(comment.oId);
        })

        // 回复数
        if (comment.commentThreadReplyCount && comment.commentThreadReplyCount > 0) {
          Text(`💬 ${comment.commentThreadReplyCount}`)
            .fontSize(12)
            .fontColor('#999999')
            .margin({ left: 20 })
        }

        // 回复按钮
        Text('回复')
          .fontSize(12)
          .fontColor('#1890FF')
          .margin({ left: 20 })
      }
      .margin({ top: 10 })

      // 回复预览列表
      if (comment.commentThreadReplies && comment.commentThreadReplies.length > 0) {
        Column() {
          ForEach(comment.commentThreadReplies, (reply: CommentThreadReply) => {
            this.ReplyItem(reply, comment.commentAuthorName)
          }, (reply: CommentThreadReply) => reply.oId)
          
          // 查看更多回复
          if (comment.commentThreadHasMore) {
            Text(`查看更多 ${comment.commentThreadReplyCount! - comment.commentThreadReplies!.length} 条回复`)
              .fontSize(12)
              .fontColor('#1890FF')
              .width('100%')
              .padding({ top: 8, bottom: 8 })
              .onClick(() => {
                // TODO: 跳转到回复详情页
              })
          }
        }
        .width('100%')
        .margin({ top: 12 })
        .padding({ left: 0, top: 8, bottom: 8 })
        .backgroundColor('#F8F8F8')
        .borderRadius(8)
      }
    }
    .width('100%')
    .padding(16)
    .backgroundColor('#FFFFFF')
    .margin({ bottom: 1 })
  }

  /**
   * 获取或创建评论的TextController
   */
  private getCommentController(commentId: string): TextController {
    let controller = this.commentControllers.get(commentId);
    if (!controller) {
      controller = new TextController();
      this.commentControllers.set(commentId, controller);
    }
    return controller;
  }

  /**
   * 使用StyledString.fromHtml渲染评论内容（支持图片）
   */
  private async renderCommentContent(comment: Comment): Promise<void> {
    try {
      const htmlContent = processCommentHtml(comment.commentContent);
      const styledString = await StyledString.fromHtml(htmlContent);
      const controller = this.commentControllers.get(comment.oId);
      if (controller) {
        controller.setStyledString(styledString);
      }
    } catch (err) {
      hilog.error(0x0000, 'ArticleDetail', `Render comment error: ${JSON.stringify(err)}`);
    }
  }

  /**
   * 获取或创建回复的TextController
   */
  private getReplyController(replyId: string): TextController {
    let controller = this.replyControllers.get(replyId);
    if (!controller) {
      controller = new TextController();
      this.replyControllers.set(replyId, controller);
    }
    return controller;
  }

  /**
   * 使用StyledString.fromHtml渲染回复内容（支持图片）
   */
  private async renderReplyContent(reply: CommentThreadReply): Promise<void> {
    try {
      const htmlContent = processCommentHtml(reply.commentContent);
      const styledString = await StyledString.fromHtml(htmlContent);
      const controller = this.replyControllers.get(reply.oId);
      if (controller) {
        controller.setStyledString(styledString);
      }
    } catch (err) {
      hilog.error(0x0000, 'ArticleDetail', `Render reply error: ${JSON.stringify(err)}`);
    }
  }

  /**
   * 加载更多回复
   */
  private async loadMoreReplies(commentId: string): Promise<void> {
    if (this.loadingRepliesCommentId === commentId) return; // 防止重复加载

    this.loadingRepliesCommentId = commentId;

    try {
      // 优化：简化加载逻辑，避免复杂的状态更新
      hilog.info(0x0000, 'ArticleDetail', `Loading more replies for comment ${commentId}`);
      
      // TODO: 实现回复加载逻辑，可以考虑跳转到回复详情页
    } catch (err) {
      hilog.error(0x0000, 'ArticleDetail', `Load more replies error: ${JSON.stringify(err)}`);
    } finally {
      this.loadingRepliesCommentId = '';
    }
  }

  /**
   * 回复项组件
   */
  @Builder
  ReplyItem(reply: CommentThreadReply, rootAuthorName: string) {
    Row() {
      // 回复者头像
      Image(reply.commentAuthorThumbnailURL || '')
        .width(24)
        .height(24)
        .borderRadius(12)
        .backgroundColor('#E8E8E8')

      Column() {
        Row() {
          Text(reply.commentAuthorNickName || reply.commentAuthorName)
            .fontSize(12)
            .fontColor('#333333')
          
          // 楼主标识
          if (reply.commentIsArticleAuthor) {
            Text('楼主')
              .fontSize(9)
              .fontColor('#FFFFFF')
              .backgroundColor('#FF6B6B')
              .padding({ left: 3, right: 3, top: 1, bottom: 1 })
              .borderRadius(2)
              .margin({ left: 4 })
          }

          // 回复时间
          Text(reply.timeAgo || TimeUtil.formatTime(reply.commentCreateTime || ''))
            .fontSize(10)
            .fontColor('#999999')
            .margin({ left: 8 })
        }
        
        // 回复内容 - 使用自定义HTML解析渲染
        CommentContent({ htmlContent: reply.commentContent })
          .width('100%')
          .margin({ top: 4 })
      }
      .alignItems(HorizontalAlign.Start)
      .layoutWeight(1)
      .margin({ left: 8 })
    }
    .width('100%')
    .padding({ top: 6, bottom: 6 })
    .alignItems(VerticalAlign.Top)
  }
}
