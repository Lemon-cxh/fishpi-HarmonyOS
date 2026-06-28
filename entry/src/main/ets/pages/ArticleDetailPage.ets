import { HttpUtil, ApiResponse } from '../util/HttpUtil';
import { StorageUtil } from '../util/StorageUtil';
import { TimeUtil } from '../util/TimeUtil';
import { Article, ArticleDetailResponse, Comment, CommentListResponse, ArticleDetailData, CommentThreadReply } from '../model/Article';
import hilog from '@ohos.hilog';
import { RichTextView } from '../components/RichTextView';

/**
 * 回复列表响应
 */
interface ReplyListResponse {
  code: number;
  msg?: string;
  commentThreadReplies?: CommentThreadReply[];
  pagination?: PaginationInfo;
}

/**
 * 分页信息
 */
interface PaginationInfo {
  paginationPageCount: number;
  paginationRecordCount: number;
}

/**
 * 回复评论响应
 */
interface ReplyResponse {
  code: number;
  msg?: string;
  oId?: string;  // 新回复的ID
}

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

  // ========== 新增功能状态 ==========
  // 回复相关
  @State replyingToComment: Comment | null = null;  // 正在回复的评论
  @State replyText: string = '';  // 回复内容
  @State isSendingReply: boolean = false;  // 正在发送回复
  
  // 删除确认
  @State showDeleteDialog: boolean = false;  // 显示删除确认弹窗
  @State deletingCommentId: string = '';  // 正在删除的评论ID
  
  // 感谢确认
  @State showThankDialog: boolean = false;  // 显示感谢确认弹窗
  @State thankLabel: string = '';  // 感谢确认文案
  @State thankingCommentId: string = '';  // 正在感谢的评论ID
  
  // 评论选项
  @State isAnonymous: boolean = false;  // 匿名评论
  @State isPrivate: boolean = false;  // 仅楼主可见

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
      
      // 添加匿名和私密选项
      if (this.isAnonymous) {
        params.set('commentAnonymous', '1');
      }
      if (this.isPrivate) {
        params.set('commentVisibleOnlyToAuthor', '1');
      }
      
      const response = await HttpUtil.post<ApiResponse>('/comment', params);

      if (response.code === 0) {
        this.commentText = '';
        this.isAnonymous = false;
        this.isPrivate = false;
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
   * 点赞评论（支持取消）
   */
  private async likeComment(commentId: string): Promise<void> {
    try {
      // 找到评论，判断当前点赞状态
      const index = this.comments.findIndex(c => c.oId === commentId);
      if (index === -1) return;
      
      const comment = this.comments[index];
      if (!comment) return;
      
      const isLiked = comment.commentVote === 1;
      
      const params = new Map<string, string>();
      params.set('dataId', commentId);
      
      // 根据当前状态决定是点赞还是取消
      const endpoint = isLiked ? '/vote/down/comment' : '/vote/up/comment';
      const response = await HttpUtil.post<ApiResponse>(endpoint, params);

      if (response.code === 0) {
        // 更新评论点赞状态
        const targetComment = this.comments[index];
        if (targetComment) {
          if (isLiked) {
            // 取消点赞
            targetComment.commentVote = 0;
            if (targetComment.commentGoodCnt !== undefined) {
              targetComment.commentGoodCnt--;
            }
          } else {
            // 点赞
            targetComment.commentVote = 1;
            if (targetComment.commentGoodCnt !== undefined) {
              targetComment.commentGoodCnt++;
            } else {
              targetComment.commentGoodCnt = 1;
            }
          }
        }
      }
    } catch (err) {
      hilog.error(0x0000, 'ArticleDetail', `Like comment error: ${JSON.stringify(err)}`);
    }
  }

  /**
   * 回复评论
   */
  private async replyComment(): Promise<void> {
    if (!this.replyingToComment || !this.replyText.trim()) return;
    
    this.isSendingReply = true;
    
    try {
      const params = new Map<string, string>();
      params.set('articleId', this.articleId);
      params.set('commentContent', this.replyText.trim());
      params.set('commentParentCommentId', this.replyingToComment.oId);
      
      const response = await HttpUtil.post<ReplyResponse>('/comment', params);
      
      if (response.code === 0) {
        hilog.info(0x0000, 'ArticleDetail', 'Reply sent successfully');
        this.replyText = '';
        this.replyingToComment = null;
        // 重新加载评论
        await this.loadComments();
      } else {
        hilog.error(0x0000, 'ArticleDetail', `Reply failed: ${response.msg}`);
      }
    } catch (err) {
      hilog.error(0x0000, 'ArticleDetail', `Reply error: ${JSON.stringify(err)}`);
    } finally {
      this.isSendingReply = false;
    }
  }

  /**
   * 删除评论
   */
  private async deleteComment(commentId: string): Promise<void> {
    try {
      const params = new Map<string, string>();
      params.set('oId', commentId);
      
      const response = await HttpUtil.post<ApiResponse>('/comment/remove', params);
      
      if (response.code === 0) {
        hilog.info(0x0000, 'ArticleDetail', 'Comment deleted successfully');
        this.showDeleteDialog = false;
        this.deletingCommentId = '';
        // 重新加载评论
        await this.loadComments();
      } else {
        hilog.error(0x0000, 'ArticleDetail', `Delete failed: ${response.msg}`);
      }
    } catch (err) {
      hilog.error(0x0000, 'ArticleDetail', `Delete error: ${JSON.stringify(err)}`);
    }
  }

  /**
   * 感谢评论
   */
  private async thankComment(commentId: string): Promise<void> {
    try {
      const params = new Map<string, string>();
      params.set('dataId', commentId);
      
      const response = await HttpUtil.post<ApiResponse>('/comment/thank', params);
      
      if (response.code === 0) {
        hilog.info(0x0000, 'ArticleDetail', 'Thank sent successfully');
        // 更新感谢数
        const index = this.comments.findIndex(c => c.oId === commentId);
        if (index !== -1) {
          this.comments[index].commentThankCnt++;
        }
      } else {
        hilog.error(0x0000, 'ArticleDetail', `Thank failed: ${response.msg}`);
      }
    } catch (err) {
      hilog.error(0x0000, 'ArticleDetail', `Thank error: ${JSON.stringify(err)}`);
    }
  }

  /**
   * 取消回复
   */
  private cancelReply(): void {
    this.replyingToComment = null;
    this.replyText = '';
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
        Column() {
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
          
          // 匿名和私密选项
          Row() {
            Row() {
              Toggle({ type: ToggleType.Checkbox, isOn: this.isAnonymous })
                .onChange((isOn: boolean) => {
                  this.isAnonymous = isOn;
                })
                .width(16)
                .height(16)
              
              Text('匿名')
                .fontSize(12)
                .fontColor('#666666')
                .margin({ left: 4 })
            }
            .margin({ right: 16 })
            
            Row() {
              Toggle({ type: ToggleType.Checkbox, isOn: this.isPrivate })
                .onChange((isOn: boolean) => {
                  this.isPrivate = isOn;
                })
                .width(16)
                .height(16)
              
              Text('仅楼主可见')
                .fontSize(12)
                .fontColor('#666666')
                .margin({ left: 4 })
            }
          }
          .width('100%')
          .margin({ top: 8 })
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
    .bindSheet($$this.showDeleteDialog, this.DeleteDialog(), {
      height: 200,
      backgroundColor: Color.White,
      dragBar: false
    })
    .bindSheet($$this.showThankDialog, this.ThankDialog(), {
      height: 200,
      backgroundColor: Color.White,
      dragBar: false
    })
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

          Text(TimeUtil.formatTime(comment.commentCreateTime || ''))
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
        // 点赞（根据commentVote判断状态）
        Row() {
          Text(comment.commentVote === 1 ? '👍' : '👍')
            .fontSize(14)
            .fontColor(comment.commentVote === 1 ? '#1890FF' : '#666666')
          if (comment.commentGoodCnt && comment.commentGoodCnt > 0) {
            Text(comment.commentGoodCnt.toString())
              .fontSize(12)
              .fontColor(comment.commentVote === 1 ? '#1890FF' : '#999999')
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
        .margin({ left: 16 })
        .onClick(() => {
          // 显示感谢确认弹窗
          if (comment.commentThankLabel) {
            this.thankLabel = comment.commentThankLabel;
            this.thankingCommentId = comment.oId;
            this.showThankDialog = true;
          } else {
            this.thankComment(comment.oId);
          }
        })

        // 回复
        Row() {
          Text('💬')
            .fontSize(14)
          Text('回复')
            .fontSize(12)
            .fontColor('#666666')
            .margin({ left: 4 })
        }
        .margin({ left: 16 })
        .onClick(() => {
          this.replyingToComment = comment;
        })

        // 删除（仅自己的评论）
        if (comment.commentIsCurrentUser) {
          Row() {
            Text('🗑️')
              .fontSize(14)
          }
          .margin({ left: 16 })
          .onClick(() => {
            this.deletingCommentId = comment.oId;
            this.showDeleteDialog = true;
          })
        }
      }
      .width('100%')
      .margin({ top: 10 })

      // 回复输入框（当正在回复此评论时显示）
      if (this.replyingToComment && this.replyingToComment.oId === comment.oId) {
        Column() {
          Row() {
            Text(`回复 @${comment.commentAuthorName}`)
              .fontSize(12)
              .fontColor('#666666')
            
            Blank()
            
            Text('取消')
              .fontSize(12)
              .fontColor('#999999')
              .onClick(() => {
                this.cancelReply();
              })
          }
          .width('100%')
          .margin({ bottom: 8 })

          Row() {
            TextInput({ placeholder: '写下你的回复...', text: this.replyText })
              .type(InputType.Normal)
              .layoutWeight(1)
              .height(36)
              .backgroundColor('#F5F5F5')
              .borderRadius(18)
              .padding({ left: 12, right: 12 })
              .onChange((value: string) => {
                this.replyText = value;
              })

            Button('发送')
              .type(ButtonType.Capsule)
              .height(36)
              .width(60)
              .backgroundColor('#1890FF')
              .fontColor('#FFFFFF')
              .fontSize(13)
              .margin({ left: 8 })
              .enabled(!this.isSendingReply && this.replyText.trim().length > 0)
              .onClick(() => {
                this.replyComment();
              })
          }
          .width('100%')
        }
        .width('100%')
        .padding({ left: 16, right: 16, top: 12, bottom: 12 })
        .backgroundColor('#F0F7FF')
        .borderRadius(8)
        .margin({ top: 12 })
      }
    }
    .width('100%')
    .padding(16)
    .backgroundColor('#FFFFFF')
    .margin({ bottom: 1 })
  }

  /**
   * 删除确认弹窗
   */
  @Builder
  DeleteDialog() {
    Column() {
      Text('确认删除')
        .fontSize(18)
        .fontWeight(FontWeight.Bold)
        .fontColor('#333333')
        .margin({ top: 20 })

      Text('删除后无法恢复，确定要删除这条评论吗？')
        .fontSize(14)
        .fontColor('#666666')
        .margin({ top: 16 })

      Row() {
        Button('取消')
          .type(ButtonType.Capsule)
          .height(40)
          .layoutWeight(1)
          .backgroundColor('#F5F5F5')
          .fontColor('#666666')
          .onClick(() => {
            this.showDeleteDialog = false;
            this.deletingCommentId = '';
          })

        Button('删除')
          .type(ButtonType.Capsule)
          .height(40)
          .layoutWeight(1)
          .backgroundColor('#FF4D4F')
          .fontColor('#FFFFFF')
          .margin({ left: 12 })
          .onClick(() => {
            if (this.deletingCommentId) {
              this.deleteComment(this.deletingCommentId);
            }
          })
      }
      .width('100%')
      .padding({ left: 24, right: 24 })
      .margin({ top: 24 })
    }
    .width('100%')
    .height(200)
    .backgroundColor('#FFFFFF')
    .borderRadius({ topLeft: 16, topRight: 16 })
  }

  /**
   * 感谢确认弹窗
   */
  @Builder
  ThankDialog() {
    Column() {
      Text('确认感谢')
        .fontSize(18)
        .fontWeight(FontWeight.Bold)
        .fontColor('#333333')
        .margin({ top: 20 })

      Text(this.thankLabel || '确定要感谢这条评论吗？将赠送15积分给对方。')
        .fontSize(14)
        .fontColor('#666666')
        .margin({ top: 16, left: 24, right: 24 })
        .textAlign(TextAlign.Center)

      Row() {
        Button('取消')
          .type(ButtonType.Capsule)
          .height(40)
          .layoutWeight(1)
          .backgroundColor('#F5F5F5')
          .fontColor('#666666')
          .onClick(() => {
            this.showThankDialog = false;
            this.thankingCommentId = '';
          })

        Button('确认')
          .type(ButtonType.Capsule)
          .height(40)
          .layoutWeight(1)
          .backgroundColor('#1890FF')
          .fontColor('#FFFFFF')
          .margin({ left: 12 })
          .onClick(() => {
            if (this.thankingCommentId) {
              this.thankComment(this.thankingCommentId);
              this.showThankDialog = false;
              this.thankingCommentId = '';
            }
          })
      }
      .width('100%')
      .padding({ left: 24, right: 24 })
      .margin({ top: 24 })
    }
    .width('100%')
    .height(200)
    .backgroundColor('#FFFFFF')
    .borderRadius({ topLeft: 16, topRight: 16 })
  }
}
