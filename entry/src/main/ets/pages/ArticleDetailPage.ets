import { HttpUtil, ApiResponse } from '../util/HttpUtil';
import { StorageUtil } from '../util/StorageUtil';
import { TimeUtil } from '../util/TimeUtil';
import { Article, ArticleDetailResponse, Comment, CommentListResponse, ArticleDetailData } from '../model/Article';
import hilog from '@ohos.hilog';
import { RichTextView } from '../components/RichTextView';

/**
 * 文章详情页面
 * 展示文章内容、作者信息、评论列表
 */
@Entry
@Component
struct ArticleDetailPage {
  @State article: Article | null = null;
  @State comments: Comment[] = [];
  @State commentText: string = '';
  @State isLoading: boolean = false;
  @State isSendingComment: boolean = false;
  @State isLiked: boolean = false;
  @State articleId: string = '';

  // 状态栏高度（用于避让）
  @StorageProp('topRectHeight') topRectHeight: number = 0;


  /**
   * 从路由参数获取文章ID
   */
  async aboutToAppear(): Promise<void> {
    try {
      const params = this.getUIContext().getRouter().getParams() as Record<string, string>;
      this.articleId = params?.articleId || '';

      if (this.articleId) {
        await Promise.all([
          this.loadArticle(),
          this.loadComments()
        ]);
      }
    } catch (err) {
      // 获取路由参数失败
    }
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
        
        // 处理可能的嵌套结构
        if (data.oId) {
          // 直接是文章对象
          this.article = {
            oId: data.oId,
            articleTitle: data.articleTitle || '',
            articleContent: data.articleContent || '',
            articleAbstract: data.articleAbstract || '',
            articleTags: data.articleTags || '',
            articleAuthorId: data.articleAuthorId || '',
            articleAuthorName: data.articleAuthorName || '',
            articleAuthorAvatarURL: data.articleAuthorAvatarURL || '',
            articleCreateTime: data.articleCreateTime || '',
            articleUpdateTime: data.articleUpdateTime || '',
            articleViewCount: data.articleViewCount || 0,
            articleCommentCount: data.articleCommentCount || 0,
            articleGoodCnt: data.articleGoodCnt || 0,
            articleThankCnt: data.articleThankCnt || 0,
            articleRewardPoint: data.articleRewardPoint || 0,
            articleStick: data.articleStick || false,
            articlePerfect: data.articlePerfect || false
          };
        } else if (data.article && data.article.oId) {
          // 嵌套结构 { article: {...} }
          this.article = data.article;
        }
        
        hilog.info(0x0000, 'ArticleDetail', `Article loaded: ${this.article?.articleTitle}`);
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
      const response = await HttpUtil.get<CommentListResponse>(`/api/comment/${this.articleId}`);

      if (response.code === 0 && response.data) {
        // 处理可能的嵌套结构
        if (Array.isArray(response.data)) {
          this.comments = response.data;
        } else {
          // 可能是嵌套结构 { comments: [...] }
          const data = response.data as Record<string, Comment[]>;
          if (data.comments && Array.isArray(data.comments)) {
            this.comments = data.comments;
          } else {
            this.comments = [];
          }
        }
      } else {
        this.comments = [];
      }
    } catch (err) {
      this.comments = [];
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
        // 更新评论点赞数
        const index = this.comments.findIndex(c => c.oId === commentId);
        if (index !== -1) {
          this.comments[index].commentGoodCnt++;
        }
      }
    } catch (err) {
      // 点赞评论失败
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
              Text(this.article!.articleTitle)
                .fontSize(22)
                .fontWeight(FontWeight.Bold)
                .fontColor('#333333')

              // 作者信息
              Row() {
                Image(this.article!.articleAuthorAvatarURL || '')
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
                .margin({ top: 12 })
              }
            }
            .width('100%')
            .padding(16)
          }

          // 文章内容
          ListItem() {
            Column() {
              RichTextView({
                htmlContent: this.article!.articleContent,
                fontSize: 16,
                fontColor: '#333333',
                containerWidth: 350
              })
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

          // 评论区标题
          ListItem() {
            Text(`评论 (${this.comments.length})`)
              .fontSize(16)
              .fontWeight(FontWeight.Medium)
              .fontColor('#333333')
              .width('100%')
              .padding(16)
              .backgroundColor('#FFFFFF')
          }

          // 评论列表
          ForEach(this.comments, (comment: Comment) => {
            ListItem() {
              this.CommentItem(comment)
            }
          }, (comment: Comment) => comment.oId || Math.random().toString())
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
        Image(comment.commentAuthorAvatarURL || '')
          .width(32)
          .height(32)
          .borderRadius(16)
          .backgroundColor('#E8E8E8')

        Column() {
          Text(comment.commentAuthorName)
            .fontSize(14)
            .fontWeight(FontWeight.Medium)
            .fontColor('#333333')

          Text(TimeUtil.formatTime(comment.commentCreateTime))
            .fontSize(12)
            .fontColor('#999999')
        }
        .alignItems(HorizontalAlign.Start)
        .margin({ left: 10 })
      }
      .width('100%')

      // 评论内容
      RichTextView({
        htmlContent: comment.commentContent,
        fontSize: 14,
        fontColor: '#333333',
        containerWidth: 300
      })
        .width('100%')
        .margin({ top: 10 })

      // 评论操作
      Row() {
        // 点赞
        Row() {
          Text('👍')
            .fontSize(14)
          Text(comment.commentGoodCnt > 0 ? comment.commentGoodCnt.toString() : '')
            .fontSize(12)
            .fontColor('#999999')
            .margin({ left: 4 })
        }
        .onClick(() => {
          this.likeComment(comment.oId);
        })

        // 回复
        Text('回复')
          .fontSize(12)
          .fontColor('#999999')
          .margin({ left: 24 })
      }
      .margin({ top: 10 })
    }
    .width('100%')
    .padding(16)
    .backgroundColor('#FFFFFF')
    .margin({ bottom: 1 })
  }
}
