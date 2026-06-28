/**
 * 文章模型
 */
export interface Article {
  oId: string;                              // 文章ID
  articleTitle: string;                     // 标题
  articleTitleEmoj?: string;                // 标题（带emoji）
  articleContent: string;                   // 内容（HTML）
  articleOriginalContent: string;           // 内容（Markdown 原始格式）
  articleAbstract: string;                  // 摘要
  articlePreviewContent?: string;           // 预览内容
  articleTags: string;                      // 标签，逗号分隔
  articleAuthorId: string;                  // 作者ID
  articleAuthorName: string;                // 作者名
  articleAuthorAvatarURL: string;           // 作者头像（兼容旧字段）
  articleAuthorThumbnailURL48?: string;     // 作者头像48px
  articleAuthorThumbnailURL210?: string;    // 作者头像210px
  articleCreateTime: string;                // 创建时间
  articleCreateTimeStr?: string;            // 创建时间字符串
  articleUpdateTime: string;                // 更新时间
  timeAgo?: string;                         // 发布时间简写
  articleViewCount: number;                 // 浏览数
  articleViewCntDisplayFormat?: string;     // 浏览量简写
  articleCommentCount: number;              // 评论数
  articleGoodCnt: number;                   // 点赞数
  articleThankCnt: number;                  // 感谢数
  articleRewardPoint: number;               // 打赏积分
  articleStick: boolean;                    // 是否置顶
  articlePerfect: boolean;                  // 是否精华
  articleImg1URL?: string;                  // 第一张图片地址
  articleThumbnailURL?: string;             // 文章缩略图
}

/**
 * 文章列表数据
 */
export interface ArticleListData {
  articles: Article[];
}

/**
 * 文章列表响应
 */
export interface ArticleListResponse {
  code: number;
  msg?: string;
  data: ArticleListData;
}

/**
 * 文章作者信息
 */
export interface ArticleAuthor {
  oId?: string;
  userName?: string;
  userAvatarURL?: string;
  userThumbnailURL48?: string;
  userThumbnailURL210?: string;
}

/**
 * 文章详情数据（可能嵌套）
 */
export interface ArticleDetailData {
  oId?: string;
  articleTitle?: string;
  articleContent?: string;
  articleOriginalContent?: string;
  articleAbstract?: string;
  articleTags?: string;
  articleAuthorId?: string;
  articleAuthorName?: string;
  articleAuthorAvatarURL?: string;
  articleAuthorThumbnailURL48?: string;   // 作者头像48px
  articleAuthorThumbnailURL210?: string;   // 作者头像210px
  articleAuthor?: ArticleAuthor;           // 作者信息对象
  articleCreateTime?: string;
  articleUpdateTime?: string;
  articleViewCount?: number;
  articleCommentCount?: number;
  articleGoodCnt?: number;
  articleThankCnt?: number;
  articleRewardPoint?: number;
  articleStick?: boolean;
  articlePerfect?: boolean;
  article?: Article;  // 嵌套的文章对象
}

/**
 * 文章详情响应
 */
export interface ArticleDetailResponse {
  code: number;
  data: ArticleDetailData;
}

/**
 * 表情反应汇总
 */
export interface ReactionSummary {
  reactionType: string;  // 表情类型
  count: number;         // 数量
}

/**
 * 评论者公开信息
 */
export interface CommenterInfo {
  userName: string;       // 用户名
  userNickname?: string;  // 昵称
  userUAStatus?: number;  // UA状态
}

/**
 * 回复预览
 */
export interface CommentThreadReply {
  oId: string;                           // 回复ID
  commentId: string;                     // 回复ID
  commentContent: string;                // 回复内容（HTML）
  commentAuthorName: string;             // 回复作者用户名
  commentAuthorId: string;               // 回复作者ID
  commentAuthorNickName?: string;        // 回复作者昵称
  commentAuthorThumbnailURL?: string;    // 回复作者头像
  commentCreateTime?: string;            // 创建时间
  timeAgo?: string;                      // 时间简写
  commentIsArticleAuthor?: boolean;      // 是否为楼主
  commentThankCnt?: number;              // 感谢数
  commentVote?: number;                  // 投票状态
}

/**
 * 评论模型
 */
export interface Comment {
  oId: string;                           // 评论ID
  commentId?: string;                    // 评论ID
  commentContent: string;                // 评论内容（HTML）
  commentAuthorId: string;               // 评论者ID
  commentAuthorName: string;             // 评论者用户名
  commentAuthorNickName?: string;        // 评论者昵称
  commentAuthorThumbnailURL?: string;    // 评论者头像
  commentAuthorAvatarURL?: string;       // 评论者头像（兼容旧字段）
  commentCreateTime?: string;            // 创建时间
  timeAgo?: string;                      // 时间简写
  commentGoodCnt?: number;               // 点赞数
  commentThankCnt: number;               // 感谢数
  rewardedCnt?: number;                  // 感谢数
  rewarded?: boolean;                    // 是否已感谢
  commentReplyCnt?: number;              // 回复数
  commentOriginalCommentId?: string;     // 父评论ID
  commenter?: CommenterInfo;             // 评论者公开信息
  commentIsArticleAuthor?: boolean;      // 是否为楼主
  commentIsCurrentUser?: boolean;        // 是否为当前用户
  commentVisible?: number;               // 可见范围
  commentVote?: number;                  // 投票状态
  commentThankLabel?: string;            // 感谢确认文案
  // 线程回复相关
  commentThreadReplies?: CommentThreadReply[];  // 回复预览列表
  commentThreadReplyCount?: number;             // 该线程回复总数
  commentThreadHasMore?: boolean;               // 是否还有更多回复
  // 表情反应
  reactionSummary?: ReactionSummary[];   // 表情汇总
  currentUserReaction?: string;          // 当前用户表情
}

/**
 * 评论分页信息
 */
export interface CommentPagination {
  paginationCurrentPageNum: number;  // 当前页码
  paginationPageCount: number;       // 总页数
  paginationPageSize: number;        // 每页数量
  paginationRecordCount: number;     // 总记录数
}

/**
 * 评论列表响应
 */
export interface CommentListResponse {
  code: number;
  msg?: string;
  commentThreadParents?: Comment[];  // 线程根评论列表
  pagination?: CommentPagination;    // 分页信息
  data?: Comment[];                  // 兼容旧格式
}

/**
 * 回复列表响应
 */
export interface ReplyListResponse {
  code: number;
  msg?: string;
  commentThreadReplies?: CommentThreadReply[];  // 回复列表
  pagination?: CommentPagination;               // 分页信息
}

/**
 * 发布评论请求
 */
export interface PostCommentRequest {
  articleId: string;
  commentContent: string;
  commentOriginalCommentId?: string;
}
