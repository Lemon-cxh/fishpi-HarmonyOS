if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface ArticleDetailPage_Params {
    article?: Article | null;
    comments?: Comment[];
    commentText?: string;
    isLoading?: boolean;
    isSendingComment?: boolean;
    isLiked?: boolean;
    articleId?: string;
    topRectHeight?: number;
}
import { HttpUtil } from "@bundle:com.example.fishpi/entry/ets/util/HttpUtil";
import type { ApiResponse } from "@bundle:com.example.fishpi/entry/ets/util/HttpUtil";
import { TimeUtil } from "@bundle:com.example.fishpi/entry/ets/util/TimeUtil";
import type { Article, ArticleDetailResponse, Comment, CommentListResponse } from '../model/Article';
import hilog from "@ohos:hilog";
class ArticleDetailPage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__article = new ObservedPropertyObjectPU(null, this, "article");
        this.__comments = new ObservedPropertyObjectPU([], this, "comments");
        this.__commentText = new ObservedPropertySimplePU('', this, "commentText");
        this.__isLoading = new ObservedPropertySimplePU(false, this, "isLoading");
        this.__isSendingComment = new ObservedPropertySimplePU(false, this, "isSendingComment");
        this.__isLiked = new ObservedPropertySimplePU(false, this, "isLiked");
        this.__articleId = new ObservedPropertySimplePU('', this, "articleId");
        this.__topRectHeight = this.createStorageProp('topRectHeight', 0, "topRectHeight");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: ArticleDetailPage_Params) {
        if (params.article !== undefined) {
            this.article = params.article;
        }
        if (params.comments !== undefined) {
            this.comments = params.comments;
        }
        if (params.commentText !== undefined) {
            this.commentText = params.commentText;
        }
        if (params.isLoading !== undefined) {
            this.isLoading = params.isLoading;
        }
        if (params.isSendingComment !== undefined) {
            this.isSendingComment = params.isSendingComment;
        }
        if (params.isLiked !== undefined) {
            this.isLiked = params.isLiked;
        }
        if (params.articleId !== undefined) {
            this.articleId = params.articleId;
        }
    }
    updateStateVars(params: ArticleDetailPage_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__article.purgeDependencyOnElmtId(rmElmtId);
        this.__comments.purgeDependencyOnElmtId(rmElmtId);
        this.__commentText.purgeDependencyOnElmtId(rmElmtId);
        this.__isLoading.purgeDependencyOnElmtId(rmElmtId);
        this.__isSendingComment.purgeDependencyOnElmtId(rmElmtId);
        this.__isLiked.purgeDependencyOnElmtId(rmElmtId);
        this.__articleId.purgeDependencyOnElmtId(rmElmtId);
        this.__topRectHeight.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__article.aboutToBeDeleted();
        this.__comments.aboutToBeDeleted();
        this.__commentText.aboutToBeDeleted();
        this.__isLoading.aboutToBeDeleted();
        this.__isSendingComment.aboutToBeDeleted();
        this.__isLiked.aboutToBeDeleted();
        this.__articleId.aboutToBeDeleted();
        this.__topRectHeight.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __article: ObservedPropertyObjectPU<Article | null>;
    get article() {
        return this.__article.get();
    }
    set article(newValue: Article | null) {
        this.__article.set(newValue);
    }
    private __comments: ObservedPropertyObjectPU<Comment[]>;
    get comments() {
        return this.__comments.get();
    }
    set comments(newValue: Comment[]) {
        this.__comments.set(newValue);
    }
    private __commentText: ObservedPropertySimplePU<string>;
    get commentText() {
        return this.__commentText.get();
    }
    set commentText(newValue: string) {
        this.__commentText.set(newValue);
    }
    private __isLoading: ObservedPropertySimplePU<boolean>;
    get isLoading() {
        return this.__isLoading.get();
    }
    set isLoading(newValue: boolean) {
        this.__isLoading.set(newValue);
    }
    private __isSendingComment: ObservedPropertySimplePU<boolean>;
    get isSendingComment() {
        return this.__isSendingComment.get();
    }
    set isSendingComment(newValue: boolean) {
        this.__isSendingComment.set(newValue);
    }
    private __isLiked: ObservedPropertySimplePU<boolean>;
    get isLiked() {
        return this.__isLiked.get();
    }
    set isLiked(newValue: boolean) {
        this.__isLiked.set(newValue);
    }
    private __articleId: ObservedPropertySimplePU<string>;
    get articleId() {
        return this.__articleId.get();
    }
    set articleId(newValue: string) {
        this.__articleId.set(newValue);
    }
    // 状态栏高度（用于避让）
    private __topRectHeight: ObservedPropertyAbstractPU<number>;
    get topRectHeight() {
        return this.__topRectHeight.get();
    }
    set topRectHeight(newValue: number) {
        this.__topRectHeight.set(newValue);
    }
    /**
     * 处理HTML内容，添加基础样式
     */
    private processHtmlContent(html: string): string {
        if (!html) {
            return '<p style="color:#999;font-size:20px;">暂无内容</p>';
        }
        // 添加基础样式，优化移动端阅读体验
        const styledHtml = `
      <style>
        body { background-color: #FFFFFF; margin: 0; padding: 0; }
        .article-content { font-size: 20px; line-height: 1.8; color: #333333; word-wrap: break-word; background-color: #FFFFFF; }
        .article-content p { margin: 0 0 16px 0; font-size: 20px; }
        .article-content img { max-width: 100% !important; height: auto !important; display: block; margin: 16px 0; }
        .article-content a { color: #1890FF; text-decoration: none; }
        .article-content h1, .article-content h2, .article-content h3, .article-content h4, .article-content h5, .article-content h6 { margin: 20px 0 12px 0; font-weight: bold; }
        .article-content h1 { font-size: 28px; }
        .article-content h2 { font-size: 26px; }
        .article-content h3 { font-size: 24px; }
        .article-content h4 { font-size: 22px; }
        .article-content ul, .article-content ol { padding-left: 24px; margin: 12px 0; font-size: 20px; }
        .article-content li { margin: 8px 0; }
        .article-content blockquote { border-left: 4px solid #1890FF; padding-left: 16px; margin: 16px 0; color: #666666; font-size: 20px; }
        .article-content pre { background-color: #F5F5F5; padding: 12px; border-radius: 8px; overflow-x: auto; margin: 12px 0; font-size: 18px; }
        .article-content code { background-color: #F5F5F5; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 18px; }
        .article-content table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 18px; }
        .article-content th, .article-content td { border: 1px solid #E8E8E8; padding: 8px; text-align: left; }
      </style>
      <div class="article-content">
        ${html}
      </div>
    `;
        return styledHtml;
    }
    /**
     * 处理评论HTML内容
     */
    private processCommentHtml(html: string): string {
        if (!html) {
            return '<p style="color:#999;font-size:18px;">暂无内容</p>';
        }
        const styledHtml = `
      <style>
        body { background-color: #FFFFFF; margin: 0; padding: 0; }
        .comment-content { font-size: 18px; line-height: 1.6; color: #333333; word-wrap: break-word; background-color: #FFFFFF; }
        .comment-content p { font-size: 18px; margin: 0 0 8px 0; }
        .comment-content img { max-width: 100% !important; height: auto !important; display: block; margin: 8px 0; }
        .comment-content a { color: #1890FF; text-decoration: none; }
        .comment-content code { background-color: #F5F5F5; padding: 2px 6px; border-radius: 4px; font-size: 16px; }
      </style>
      <div class="comment-content">
        ${html}
      </div>
    `;
        return styledHtml;
    }
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
        }
        catch (err) {
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
                }
                else if (data.article && data.article.oId) {
                    // 嵌套结构 { article: {...} }
                    this.article = data.article;
                }
                hilog.info(0x0000, 'ArticleDetail', `Article loaded: ${this.article?.articleTitle}`);
            }
        }
        catch (err) {
            hilog.error(0x0000, 'ArticleDetail', `Error: ${JSON.stringify(err)}`);
        }
        finally {
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
                }
                else {
                    // 可能是嵌套结构 { comments: [...] }
                    const data = response.data as Record<string, Comment[]>;
                    if (data.comments && Array.isArray(data.comments)) {
                        this.comments = data.comments;
                    }
                    else {
                        this.comments = [];
                    }
                }
            }
            else {
                this.comments = [];
            }
        }
        catch (err) {
            this.comments = [];
        }
    }
    /**
     * 点赞文章
     */
    private async likeArticle(): Promise<void> {
        if (this.isLiked)
            return;
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
        }
        catch (err) {
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
        }
        catch (err) {
            // 感谢文章失败
        }
    }
    /**
     * 发表评论
     */
    private async postComment(): Promise<void> {
        const content = this.commentText.trim();
        if (!content || this.isSendingComment)
            return;
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
        }
        catch (err) {
            // 发表评论失败
        }
        finally {
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
        }
        catch (err) {
            // 点赞评论失败
        }
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
            Column.padding({ top: this.getUIContext().px2vp(this.topRectHeight) });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 顶部导航栏
            Row.create();
            // 顶部导航栏
            Row.width('100%');
            // 顶部导航栏
            Row.height(56);
            // 顶部导航栏
            Row.padding({ left: 16, right: 16 });
            // 顶部导航栏
            Row.backgroundColor('#FFFFFF');
            // 顶部导航栏
            Row.border({ width: { bottom: 0.5 }, color: '#E8E8E8' });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('返回');
            Text.fontSize(16);
            Text.fontColor('#1890FF');
            Text.onClick(() => {
                try {
                    this.getUIContext().getRouter().back();
                }
                catch (err) {
                    // 路由返回失败
                }
            });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('文章详情');
            Text.fontSize(18);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#333333');
            Text.margin({ left: 16 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        // 顶部导航栏
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.isLoading) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.layoutWeight(1);
                        Column.justifyContent(FlexAlign.Center);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        LoadingProgress.create();
                        LoadingProgress.width(40);
                        LoadingProgress.height(40);
                    }, LoadingProgress);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('加载中...');
                        Text.fontSize(14);
                        Text.fontColor('#999999');
                        Text.margin({ top: 12 });
                    }, Text);
                    Text.pop();
                    Column.pop();
                });
            }
            else if (this.article) {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 文章内容
                        List.create();
                        // 文章内容
                        List.layoutWeight(1);
                        // 文章内容
                        List.width('100%');
                        // 文章内容
                        List.backgroundColor('#FFFFFF');
                    }, List);
                    {
                        const itemCreation = (elmtId, isInitialRender) => {
                            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                            ListItem.create(deepRenderFunction, true);
                            if (!isInitialRender) {
                                // 文章信息
                                ListItem.pop();
                            }
                            ViewStackProcessor.StopGetAccessRecording();
                        };
                        const itemCreation2 = (elmtId, isInitialRender) => {
                            ListItem.create(deepRenderFunction, true);
                        };
                        const deepRenderFunction = (elmtId, isInitialRender) => {
                            itemCreation(elmtId, isInitialRender);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Column.create();
                                Column.width('100%');
                                Column.padding(16);
                            }, Column);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                // 标题
                                Text.create(this.article!.articleTitle);
                                // 标题
                                Text.fontSize(22);
                                // 标题
                                Text.fontWeight(FontWeight.Bold);
                                // 标题
                                Text.fontColor('#333333');
                            }, Text);
                            // 标题
                            Text.pop();
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                // 作者信息
                                Row.create();
                                // 作者信息
                                Row.width('100%');
                                // 作者信息
                                Row.margin({ top: 20 });
                            }, Row);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Image.create(this.article!.articleAuthorAvatarURL || '');
                                Image.width(36);
                                Image.height(36);
                                Image.borderRadius(18);
                                Image.backgroundColor('#E8E8E8');
                            }, Image);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Column.create();
                                Column.alignItems(HorizontalAlign.Start);
                                Column.margin({ left: 12 });
                            }, Column);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(this.article!.articleAuthorName);
                                Text.fontSize(14);
                                Text.fontWeight(FontWeight.Medium);
                                Text.fontColor('#333333');
                            }, Text);
                            Text.pop();
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(TimeUtil.formatTime(this.article!.articleCreateTime));
                                Text.fontSize(12);
                                Text.fontColor('#999999');
                            }, Text);
                            Text.pop();
                            Column.pop();
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Blank.create();
                            }, Blank);
                            Blank.pop();
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Button.createWithLabel('关注');
                                Button.type(ButtonType.Capsule);
                                Button.height(30);
                                Button.width(60);
                                Button.fontSize(12);
                                Button.backgroundColor('#1890FF');
                                Button.fontColor('#FFFFFF');
                            }, Button);
                            Button.pop();
                            // 作者信息
                            Row.pop();
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                // 统计信息
                                Row.create();
                                // 统计信息
                                Row.width('100%');
                                // 统计信息
                                Row.margin({ top: 16 });
                            }, Row);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(`${this.article!.articleViewCount} 浏览`);
                                Text.fontSize(12);
                                Text.fontColor('#999999');
                                Text.margin({ right: 16 });
                            }, Text);
                            Text.pop();
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(`${this.article!.articleCommentCount} 评论`);
                                Text.fontSize(12);
                                Text.fontColor('#999999');
                                Text.margin({ right: 16 });
                            }, Text);
                            Text.pop();
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(`${this.article!.articleGoodCnt} 点赞`);
                                Text.fontSize(12);
                                Text.fontColor('#999999');
                            }, Text);
                            Text.pop();
                            // 统计信息
                            Row.pop();
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                If.create();
                                // 标签
                                if (this.article!.articleTags && this.article!.articleTags.length > 0) {
                                    this.ifElseBranchUpdateFunction(0, () => {
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Row.create();
                                            Row.margin({ top: 12 });
                                        }, Row);
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            ForEach.create();
                                            const forEachItemGenFunction = _item => {
                                                const tag = _item;
                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                    If.create();
                                                    if (tag && tag.trim()) {
                                                        this.ifElseBranchUpdateFunction(0, () => {
                                                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                                Text.create(tag.trim());
                                                                Text.fontSize(12);
                                                                Text.fontColor('#1890FF');
                                                                Text.backgroundColor('#E6F7FF');
                                                                Text.padding({ left: 8, right: 8, top: 4, bottom: 4 });
                                                                Text.borderRadius(4);
                                                                Text.margin({ right: 8 });
                                                            }, Text);
                                                            Text.pop();
                                                        });
                                                    }
                                                    else {
                                                        this.ifElseBranchUpdateFunction(1, () => {
                                                        });
                                                    }
                                                }, If);
                                                If.pop();
                                            };
                                            this.forEachUpdateFunction(elmtId, this.article!.articleTags.split(','), forEachItemGenFunction, (tag: string, index: number) => `${index}-${tag}`, false, true);
                                        }, ForEach);
                                        ForEach.pop();
                                        Row.pop();
                                    });
                                }
                                else {
                                    this.ifElseBranchUpdateFunction(1, () => {
                                    });
                                }
                            }, If);
                            If.pop();
                            Column.pop();
                            // 文章信息
                            ListItem.pop();
                        };
                        this.observeComponentCreation2(itemCreation2, ListItem);
                        // 文章信息
                        ListItem.pop();
                    }
                    {
                        const itemCreation = (elmtId, isInitialRender) => {
                            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                            ListItem.create(deepRenderFunction, true);
                            if (!isInitialRender) {
                                // 文章内容
                                ListItem.pop();
                            }
                            ViewStackProcessor.StopGetAccessRecording();
                        };
                        const itemCreation2 = (elmtId, isInitialRender) => {
                            ListItem.create(deepRenderFunction, true);
                        };
                        const deepRenderFunction = (elmtId, isInitialRender) => {
                            itemCreation(elmtId, isInitialRender);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Column.create();
                                Column.width('100%');
                                Column.padding({ left: 16, right: 16, top: 8, bottom: 8 });
                                Column.backgroundColor('#FFFFFF');
                            }, Column);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                RichText.create(this.processHtmlContent(this.article!.articleContent));
                                RichText.width('100%');
                            }, RichText);
                            Column.pop();
                            // 文章内容
                            ListItem.pop();
                        };
                        this.observeComponentCreation2(itemCreation2, ListItem);
                        // 文章内容
                        ListItem.pop();
                    }
                    {
                        const itemCreation = (elmtId, isInitialRender) => {
                            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                            ListItem.create(deepRenderFunction, true);
                            if (!isInitialRender) {
                                // 互动栏
                                ListItem.pop();
                            }
                            ViewStackProcessor.StopGetAccessRecording();
                        };
                        const itemCreation2 = (elmtId, isInitialRender) => {
                            ListItem.create(deepRenderFunction, true);
                        };
                        const deepRenderFunction = (elmtId, isInitialRender) => {
                            itemCreation(elmtId, isInitialRender);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Row.create();
                                Row.width('100%');
                                Row.padding(16);
                                Row.backgroundColor('#FAFAFA');
                            }, Row);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                // 点赞
                                Button.createWithLabel(`👍 ${this.article!.articleGoodCnt}`);
                                // 点赞
                                Button.type(ButtonType.Capsule);
                                // 点赞
                                Button.height(36);
                                // 点赞
                                Button.fontSize(13);
                                // 点赞
                                Button.backgroundColor(this.isLiked ? '#E6F7FF' : '#F5F5F5');
                                // 点赞
                                Button.fontColor(this.isLiked ? '#1890FF' : '#666666');
                                // 点赞
                                Button.onClick(() => {
                                    this.likeArticle();
                                });
                            }, Button);
                            // 点赞
                            Button.pop();
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                // 感谢
                                Button.createWithLabel(`🙏 ${this.article!.articleThankCnt}`);
                                // 感谢
                                Button.type(ButtonType.Capsule);
                                // 感谢
                                Button.height(36);
                                // 感谢
                                Button.fontSize(13);
                                // 感谢
                                Button.backgroundColor('#F5F5F5');
                                // 感谢
                                Button.fontColor('#666666');
                                // 感谢
                                Button.margin({ left: 12 });
                                // 感谢
                                Button.onClick(() => {
                                    this.thankArticle();
                                });
                            }, Button);
                            // 感谢
                            Button.pop();
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Blank.create();
                            }, Blank);
                            Blank.pop();
                            Row.pop();
                            // 互动栏
                            ListItem.pop();
                        };
                        this.observeComponentCreation2(itemCreation2, ListItem);
                        // 互动栏
                        ListItem.pop();
                    }
                    {
                        const itemCreation = (elmtId, isInitialRender) => {
                            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                            ListItem.create(deepRenderFunction, true);
                            if (!isInitialRender) {
                                // 评论区标题
                                ListItem.pop();
                            }
                            ViewStackProcessor.StopGetAccessRecording();
                        };
                        const itemCreation2 = (elmtId, isInitialRender) => {
                            ListItem.create(deepRenderFunction, true);
                        };
                        const deepRenderFunction = (elmtId, isInitialRender) => {
                            itemCreation(elmtId, isInitialRender);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(`评论 (${this.comments.length})`);
                                Text.fontSize(16);
                                Text.fontWeight(FontWeight.Medium);
                                Text.fontColor('#333333');
                                Text.width('100%');
                                Text.padding(16);
                                Text.backgroundColor('#FFFFFF');
                            }, Text);
                            Text.pop();
                            // 评论区标题
                            ListItem.pop();
                        };
                        this.observeComponentCreation2(itemCreation2, ListItem);
                        // 评论区标题
                        ListItem.pop();
                    }
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 评论列表
                        ForEach.create();
                        const forEachItemGenFunction = _item => {
                            const comment = _item;
                            {
                                const itemCreation = (elmtId, isInitialRender) => {
                                    ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                                    ListItem.create(deepRenderFunction, true);
                                    if (!isInitialRender) {
                                        ListItem.pop();
                                    }
                                    ViewStackProcessor.StopGetAccessRecording();
                                };
                                const itemCreation2 = (elmtId, isInitialRender) => {
                                    ListItem.create(deepRenderFunction, true);
                                };
                                const deepRenderFunction = (elmtId, isInitialRender) => {
                                    itemCreation(elmtId, isInitialRender);
                                    this.CommentItem.bind(this)(comment);
                                    ListItem.pop();
                                };
                                this.observeComponentCreation2(itemCreation2, ListItem);
                                ListItem.pop();
                            }
                        };
                        this.forEachUpdateFunction(elmtId, this.comments, forEachItemGenFunction, (comment: Comment) => comment.oId || Math.random().toString(), false, false);
                    }, ForEach);
                    // 评论列表
                    ForEach.pop();
                    // 文章内容
                    List.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 评论输入框
                        Row.create();
                        // 评论输入框
                        Row.width('100%');
                        // 评论输入框
                        Row.padding({ left: 16, right: 16, top: 8, bottom: 8 });
                        // 评论输入框
                        Row.backgroundColor('#FFFFFF');
                        // 评论输入框
                        Row.border({ width: { top: 0.5 }, color: '#E8E8E8' });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        TextInput.create({ placeholder: '写下你的评论...', text: this.commentText });
                        TextInput.type(InputType.Normal);
                        TextInput.layoutWeight(1);
                        TextInput.height(40);
                        TextInput.backgroundColor('#F5F5F5');
                        TextInput.borderRadius(20);
                        TextInput.padding({ left: 16, right: 16 });
                        TextInput.onChange((value: string) => {
                            this.commentText = value;
                        });
                    }, TextInput);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('发送');
                        Button.type(ButtonType.Capsule);
                        Button.height(40);
                        Button.width(70);
                        Button.backgroundColor('#1890FF');
                        Button.fontColor('#FFFFFF');
                        Button.fontSize(14);
                        Button.margin({ left: 12 });
                        Button.enabled(!this.isSendingComment && this.commentText.trim().length > 0);
                        Button.onClick(() => {
                            this.postComment();
                        });
                    }, Button);
                    Button.pop();
                    // 评论输入框
                    Row.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(2, () => {
                });
            }
        }, If);
        If.pop();
        Column.pop();
    }
    /**
     * 评论项组件
     */
    CommentItem(comment: Comment, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.padding(16);
            Column.backgroundColor('#FFFFFF');
            Column.margin({ bottom: 1 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 评论头部
            Row.create();
            // 评论头部
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Image.create(comment.commentAuthorAvatarURL || '');
            Image.width(32);
            Image.height(32);
            Image.borderRadius(16);
            Image.backgroundColor('#E8E8E8');
        }, Image);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.alignItems(HorizontalAlign.Start);
            Column.margin({ left: 10 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(comment.commentAuthorName);
            Text.fontSize(14);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor('#333333');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(TimeUtil.formatTime(comment.commentCreateTime));
            Text.fontSize(12);
            Text.fontColor('#999999');
        }, Text);
        Text.pop();
        Column.pop();
        // 评论头部
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 评论内容
            RichText.create(this.processCommentHtml(comment.commentContent));
            // 评论内容
            RichText.width('100%');
            // 评论内容
            RichText.margin({ top: 10 });
        }, RichText);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 评论操作
            Row.create();
            // 评论操作
            Row.margin({ top: 10 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 点赞
            Row.create();
            // 点赞
            Row.onClick(() => {
                this.likeComment(comment.oId);
            });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('👍');
            Text.fontSize(14);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(comment.commentGoodCnt > 0 ? comment.commentGoodCnt.toString() : '');
            Text.fontSize(12);
            Text.fontColor('#999999');
            Text.margin({ left: 4 });
        }, Text);
        Text.pop();
        // 点赞
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 回复
            Text.create('回复');
            // 回复
            Text.fontSize(12);
            // 回复
            Text.fontColor('#999999');
            // 回复
            Text.margin({ left: 24 });
        }, Text);
        // 回复
        Text.pop();
        // 评论操作
        Row.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "ArticleDetailPage";
    }
}
registerNamedRoute(() => new ArticleDetailPage(undefined, {}), "", { bundleName: "com.example.fishpi", moduleName: "entry", pagePath: "pages/ArticleDetailPage", pageFullPath: "entry/src/main/ets/pages/ArticleDetailPage", integratedHsp: "false", moduleType: "followWithHap" });
