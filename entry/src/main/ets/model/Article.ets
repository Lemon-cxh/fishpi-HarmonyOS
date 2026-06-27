/**
 * 文章模型
 */
export interface Article {
  oId: string;                    // 文章ID
  articleTitle: string;           // 标题
  articleContent: string;         // 内容（HTML）
  articleAbstract: string;        // 摘要
  articleTags: string;            // 标签，逗号分隔
  articleAuthorId: string;        // 作者ID
  articleAuthorName: string;      // 作者名
  articleAuthorAvatarURL: string; // 作者头像
  articleCreateTime: string;      // 创建时间
  articleUpdateTime: string;      // 更新时间
  articleViewCount: number;       // 浏览数
  articleCommentCount: number;    // 评论数
  articleGoodCnt: number;         // 点赞数
  articleThankCnt: number;        // 感谢数
  articleRewardPoint: number;     // 打赏积分
  articleStick: boolean;          // 是否置顶
  articlePerfect: boolean;        // 是否精华
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
 * 文章详情数据（可能嵌套）
 */
export interface ArticleDetailData {
  oId?: string;
  articleTitle?: string;
  articleContent?: string;
  articleAbstract?: string;
  articleTags?: string;
  articleAuthorId?: string;
  articleAuthorName?: string;
  articleAuthorAvatarURL?: string;
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
 * 评论模型
 */
export interface Comment {
  oId: string;                    // 评论ID
  commentContent: string;         // 评论内容（HTML）
  commentAuthorId: string;        // 评论者ID
  commentAuthorName: string;      // 评论者用户名
  commentAuthorAvatarURL: string; // 评论者头像
  commentCreateTime: string;      // 创建时间
  commentGoodCnt: number;         // 点赞数
  commentThankCnt: number;        // 感谢数
  commentReplyCnt: number;        // 回复数
  commentOriginalCommentId: string; // 父评论ID
}

/**
 * 评论列表响应
 */
export interface CommentListResponse {
  code: number;
  data: Comment[];
}

/**
 * 发布评论请求
 */
export interface PostCommentRequest {
  articleId: string;
  commentContent: string;
  commentOriginalCommentId?: string;
}
