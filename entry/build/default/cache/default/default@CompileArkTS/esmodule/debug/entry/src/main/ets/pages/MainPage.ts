if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface MainPage_Params {
    currentIndex?: number;
    articles?: Article[];
    articleTab?: number;
    articlePage?: number;
    articleLoading?: boolean;
    articleHasMore?: boolean;
    sessions?: PrivateChatSession[];
    userInfo?: UserInfo | null;
    topRectHeight?: number;
    bottomRectHeight?: number;
    tabItems?: TabItem[];
    articleTabs?: TabItem[];
    articleApiPaths?: string[];
}
import { HttpUtil } from "@bundle:com.example.fishpi/entry/ets/util/HttpUtil";
import type { Article, ArticleListResponse } from '../model/Article';
import type { PrivateChatSession, PrivateChatListResponse } from '../model/Notification';
import type { UserInfo, UserInfoResponse } from '../model/User';
import { ChatRoomComponent } from "@bundle:com.example.fishpi/entry/ets/components/ChatRoomComponent";
import hilog from "@ohos:hilog";
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
class MainPage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__currentIndex = new ObservedPropertySimplePU(0, this, "currentIndex");
        this.__articles = new ObservedPropertyObjectPU([], this, "articles");
        this.__articleTab = new ObservedPropertySimplePU(0, this, "articleTab");
        this.__articlePage = new ObservedPropertySimplePU(1, this, "articlePage");
        this.__articleLoading = new ObservedPropertySimplePU(false, this, "articleLoading");
        this.__articleHasMore = new ObservedPropertySimplePU(true, this, "articleHasMore");
        this.__sessions = new ObservedPropertyObjectPU([], this, "sessions");
        this.__userInfo = new ObservedPropertyObjectPU(null, this, "userInfo");
        this.__topRectHeight = this.createStorageProp('topRectHeight', 0, "topRectHeight");
        this.__bottomRectHeight = this.createStorageProp('bottomRectHeight', 0, "bottomRectHeight");
        this.tabItems = [
            { title: '聊天室', icon: '💬' },
            { title: '文章', icon: '📝' },
            { title: '私聊', icon: '✉️' },
            { title: '我的', icon: '👤' }
        ];
        this.articleTabs = [
            { title: '最近', icon: '' },
            { title: '热门', icon: '' },
            { title: '精华', icon: '' },
            { title: '最近回复', icon: '' }
        ];
        this.articleApiPaths = [
            '/api/articles/recent',
            '/api/articles/recent/hot',
            '/api/articles/recent/good',
            '/api/articles/recent/reply'
        ];
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: MainPage_Params) {
        if (params.currentIndex !== undefined) {
            this.currentIndex = params.currentIndex;
        }
        if (params.articles !== undefined) {
            this.articles = params.articles;
        }
        if (params.articleTab !== undefined) {
            this.articleTab = params.articleTab;
        }
        if (params.articlePage !== undefined) {
            this.articlePage = params.articlePage;
        }
        if (params.articleLoading !== undefined) {
            this.articleLoading = params.articleLoading;
        }
        if (params.articleHasMore !== undefined) {
            this.articleHasMore = params.articleHasMore;
        }
        if (params.sessions !== undefined) {
            this.sessions = params.sessions;
        }
        if (params.userInfo !== undefined) {
            this.userInfo = params.userInfo;
        }
        if (params.tabItems !== undefined) {
            this.tabItems = params.tabItems;
        }
        if (params.articleTabs !== undefined) {
            this.articleTabs = params.articleTabs;
        }
        if (params.articleApiPaths !== undefined) {
            this.articleApiPaths = params.articleApiPaths;
        }
    }
    updateStateVars(params: MainPage_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__currentIndex.purgeDependencyOnElmtId(rmElmtId);
        this.__articles.purgeDependencyOnElmtId(rmElmtId);
        this.__articleTab.purgeDependencyOnElmtId(rmElmtId);
        this.__articlePage.purgeDependencyOnElmtId(rmElmtId);
        this.__articleLoading.purgeDependencyOnElmtId(rmElmtId);
        this.__articleHasMore.purgeDependencyOnElmtId(rmElmtId);
        this.__sessions.purgeDependencyOnElmtId(rmElmtId);
        this.__userInfo.purgeDependencyOnElmtId(rmElmtId);
        this.__topRectHeight.purgeDependencyOnElmtId(rmElmtId);
        this.__bottomRectHeight.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__currentIndex.aboutToBeDeleted();
        this.__articles.aboutToBeDeleted();
        this.__articleTab.aboutToBeDeleted();
        this.__articlePage.aboutToBeDeleted();
        this.__articleLoading.aboutToBeDeleted();
        this.__articleHasMore.aboutToBeDeleted();
        this.__sessions.aboutToBeDeleted();
        this.__userInfo.aboutToBeDeleted();
        this.__topRectHeight.aboutToBeDeleted();
        this.__bottomRectHeight.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __currentIndex: ObservedPropertySimplePU<number>;
    get currentIndex() {
        return this.__currentIndex.get();
    }
    set currentIndex(newValue: number) {
        this.__currentIndex.set(newValue);
    }
    private __articles: ObservedPropertyObjectPU<Article[]>;
    get articles() {
        return this.__articles.get();
    }
    set articles(newValue: Article[]) {
        this.__articles.set(newValue);
    }
    private __articleTab: ObservedPropertySimplePU<number>;
    get articleTab() {
        return this.__articleTab.get();
    }
    set articleTab(newValue: number) {
        this.__articleTab.set(newValue);
    }
    private __articlePage: ObservedPropertySimplePU<number>;
    get articlePage() {
        return this.__articlePage.get();
    }
    set articlePage(newValue: number) {
        this.__articlePage.set(newValue);
    }
    private __articleLoading: ObservedPropertySimplePU<boolean>;
    get articleLoading() {
        return this.__articleLoading.get();
    }
    set articleLoading(newValue: boolean) {
        this.__articleLoading.set(newValue);
    }
    private __articleHasMore: ObservedPropertySimplePU<boolean>;
    get articleHasMore() {
        return this.__articleHasMore.get();
    }
    set articleHasMore(newValue: boolean) {
        this.__articleHasMore.set(newValue);
    }
    private __sessions: ObservedPropertyObjectPU<PrivateChatSession[]>;
    get sessions() {
        return this.__sessions.get();
    }
    set sessions(newValue: PrivateChatSession[]) {
        this.__sessions.set(newValue);
    }
    private __userInfo: ObservedPropertyObjectPU<UserInfo | null>;
    get userInfo() {
        return this.__userInfo.get();
    }
    set userInfo(newValue: UserInfo | null) {
        this.__userInfo.set(newValue);
    }
    // 状态栏和导航栏高度（用于避让）
    private __topRectHeight: ObservedPropertyAbstractPU<number>;
    get topRectHeight() {
        return this.__topRectHeight.get();
    }
    set topRectHeight(newValue: number) {
        this.__topRectHeight.set(newValue);
    }
    private __bottomRectHeight: ObservedPropertyAbstractPU<number>;
    get bottomRectHeight() {
        return this.__bottomRectHeight.get();
    }
    set bottomRectHeight(newValue: number) {
        this.__bottomRectHeight.set(newValue);
    }
    // Tab配置
    private tabItems: TabItem[];
    // 文章Tab配置
    private articleTabs: TabItem[];
    // 文章API路径
    private articleApiPaths: string[];
    /**
     * 页面出现时初始化
     */
    async aboutToAppear(): Promise<void> {
        // 检查登录状态
        const apiKey = await HttpUtil.loadApiKey();
        if (!apiKey) {
            try {
                this.getUIContext().getRouter().replaceUrl({ url: 'pages/LoginPage' });
            }
            catch (err) {
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
        if (this.articleLoading)
            return;
        this.articleLoading = true;
        try {
            const path = this.articleApiPaths[this.articleTab];
            const params = new Map<string, number>();
            params.set('p', this.articlePage);
            const response = await HttpUtil.get<ArticleListResponse>(path, params);
            if (response.code === 0 && response.data && response.data.articles && Array.isArray(response.data.articles)) {
                if (this.articlePage === 1) {
                    this.articles = response.data.articles;
                }
                else {
                    this.articles = [...this.articles, ...response.data.articles];
                }
                this.articleHasMore = response.data.articles.length >= 20;
            }
            else {
                if (this.articlePage === 1) {
                    this.articles = [];
                }
            }
        }
        catch (err) {
            hilog.error(0x0000, 'MainPage', `Error loading articles: ${JSON.stringify(err)}`);
            if (this.articlePage === 1) {
                this.articles = [];
            }
        }
        finally {
            this.articleLoading = false;
        }
    }
    /**
     * 切换文章Tab
     */
    private switchArticleTab(index: number): void {
        if (this.articleTab === index)
            return;
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
        if (!this.articleHasMore || this.articleLoading)
            return;
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
            }
            else {
                this.sessions = [];
            }
        }
        catch (err) {
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
        }
        catch (err) {
            // 加载用户信息失败
        }
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor('#F5F5F5');
            Column.padding({
                top: this.getUIContext().px2vp(this.topRectHeight),
                bottom: this.getUIContext().px2vp(this.bottomRectHeight)
            });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 内容区域
            Stack.create();
            // 内容区域
            Stack.layoutWeight(1);
            // 内容区域
            Stack.width('100%');
        }, Stack);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            __Common__.create();
            __Common__.visibility(this.currentIndex === 0 ? Visibility.Visible : Visibility.None);
        }, __Common__);
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new 
                    // 聊天室页面
                    ChatRoomComponent(this, {}, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/MainPage.ets", line: 199, col: 9 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {};
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {});
                }
            }, { name: "ChatRoomComponent" });
        }
        __Common__.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 文章页面
            Column.create();
            // 文章页面
            Column.visibility(this.currentIndex === 1 ? Visibility.Visible : Visibility.None);
            // 文章页面
            Column.layoutWeight(1);
            // 文章页面
            Column.width('100%');
        }, Column);
        this.ArticleContent.bind(this)();
        // 文章页面
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 私聊页面
            Column.create();
            // 私聊页面
            Column.visibility(this.currentIndex === 2 ? Visibility.Visible : Visibility.None);
            // 私聊页面
            Column.layoutWeight(1);
            // 私聊页面
            Column.width('100%');
        }, Column);
        this.PrivateChatContent.bind(this)();
        // 私聊页面
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 我的页面
            Column.create();
            // 我的页面
            Column.visibility(this.currentIndex === 3 ? Visibility.Visible : Visibility.None);
            // 我的页面
            Column.layoutWeight(1);
            // 我的页面
            Column.width('100%');
        }, Column);
        this.ProfileContent.bind(this)();
        // 我的页面
        Column.pop();
        // 内容区域
        Stack.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 底部Tab栏
            Row.create();
            // 底部Tab栏
            Row.width('100%');
            // 底部Tab栏
            Row.height(60);
            // 底部Tab栏
            Row.backgroundColor('#FFFFFF');
            // 底部Tab栏
            Row.border({ width: { top: 0.5 }, color: '#E8E8E8' });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = (_item, index: number) => {
                const item = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Column.create();
                    Column.layoutWeight(1);
                    Column.justifyContent(FlexAlign.Center);
                    Column.onClick(() => {
                        this.currentIndex = index;
                    });
                }, Column);
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create(item.icon);
                    Text.fontSize(24);
                    Text.margin({ bottom: 4 });
                }, Text);
                Text.pop();
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create(item.title);
                    Text.fontSize(12);
                    Text.fontColor(this.currentIndex === index ? '#1890FF' : '#999999');
                }, Text);
                Text.pop();
                Column.pop();
            };
            this.forEachUpdateFunction(elmtId, this.tabItems, forEachItemGenFunction, (item: TabItem, index: number) => `${item.title}_${index}`, true, true);
        }, ForEach);
        ForEach.pop();
        // 底部Tab栏
        Row.pop();
        Column.pop();
    }
    /**
     * 文章内容
     */
    ArticleContent(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 顶部标题栏
            Row.create();
            // 顶部标题栏
            Row.width('100%');
            // 顶部标题栏
            Row.height(56);
            // 顶部标题栏
            Row.padding({ left: 16, right: 16 });
            // 顶部标题栏
            Row.backgroundColor('#FFFFFF');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('文章');
            Text.fontSize(18);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#333333');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        // 顶部标题栏
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 文章Tab栏
            Row.create();
            // 文章Tab栏
            Row.width('100%');
            // 文章Tab栏
            Row.backgroundColor('#FFFFFF');
            // 文章Tab栏
            Row.border({ width: { bottom: 0.5 }, color: '#E8E8E8' });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = (_item, index: number) => {
                const tab = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Column.create();
                    Column.layoutWeight(1);
                    Column.justifyContent(FlexAlign.Center);
                    Column.padding({ top: 12, bottom: 12 });
                    Column.onClick(() => {
                        this.switchArticleTab(index);
                    });
                }, Column);
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create(tab.title);
                    Text.fontSize(14);
                    Text.fontColor(this.articleTab === index ? '#1890FF' : '#666666');
                    Text.fontWeight(this.articleTab === index ? FontWeight.Medium : FontWeight.Normal);
                }, Text);
                Text.pop();
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    If.create();
                    // 选中指示器
                    if (this.articleTab === index) {
                        this.ifElseBranchUpdateFunction(0, () => {
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Divider.create();
                                Divider.strokeWidth(2);
                                Divider.color('#1890FF');
                                Divider.width(24);
                                Divider.margin({ top: 4 });
                            }, Divider);
                        });
                    }
                    else {
                        this.ifElseBranchUpdateFunction(1, () => {
                        });
                    }
                }, If);
                If.pop();
                Column.pop();
            };
            this.forEachUpdateFunction(elmtId, this.articleTabs, forEachItemGenFunction, (tab: TabItem, index: number) => `${tab.title}_${index}`, true, true);
        }, ForEach);
        ForEach.pop();
        // 文章Tab栏
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 文章列表
            if (this.articles.length === 0 && !this.articleLoading) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 空状态
                        Column.create();
                        // 空状态
                        Column.layoutWeight(1);
                        // 空状态
                        Column.width('100%');
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('暂无文章');
                        Text.fontSize(16);
                        Text.fontColor('#999999');
                        Text.margin({ top: 100 });
                    }, Text);
                    Text.pop();
                    // 空状态
                    Column.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        List.create();
                        List.layoutWeight(1);
                        List.width('100%');
                        List.backgroundColor('#F5F5F5');
                    }, List);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = _item => {
                            const article = _item;
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
                                    this.ArticleCard.bind(this)(article);
                                    ListItem.pop();
                                };
                                this.observeComponentCreation2(itemCreation2, ListItem);
                                ListItem.pop();
                            }
                        };
                        this.forEachUpdateFunction(elmtId, this.articles, forEachItemGenFunction, (article: Article) => article.oId, false, false);
                    }, ForEach);
                    ForEach.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        // 加载更多
                        if (this.articleHasMore) {
                            this.ifElseBranchUpdateFunction(0, () => {
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
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Row.create();
                                            Row.width('100%');
                                            Row.justifyContent(FlexAlign.Center);
                                            Row.padding(16);
                                            Row.onClick(() => {
                                                this.loadMoreArticles();
                                            });
                                        }, Row);
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            LoadingProgress.create();
                                            LoadingProgress.width(20);
                                            LoadingProgress.height(20);
                                            LoadingProgress.color('#1890FF');
                                            LoadingProgress.visibility(this.articleLoading ? Visibility.Visible : Visibility.None);
                                        }, LoadingProgress);
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Text.create(this.articleLoading ? '加载中...' : '加载更多');
                                            Text.fontSize(14);
                                            Text.fontColor('#1890FF');
                                            Text.margin({ left: 8 });
                                        }, Text);
                                        Text.pop();
                                        Row.pop();
                                        ListItem.pop();
                                    };
                                    this.observeComponentCreation2(itemCreation2, ListItem);
                                    ListItem.pop();
                                }
                            });
                        }
                        else {
                            this.ifElseBranchUpdateFunction(1, () => {
                            });
                        }
                    }, If);
                    If.pop();
                    List.pop();
                });
            }
        }, If);
        If.pop();
        Column.pop();
    }
    /**
     * 文章卡片
     */
    ArticleCard(article: Article, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.padding(16);
            Column.backgroundColor('#FFFFFF');
            Column.margin({ bottom: 8 });
            Column.onClick(() => {
                try {
                    this.getUIContext().getRouter().pushUrl({
                        url: 'pages/ArticleDetailPage',
                        params: { articleId: article.oId }
                    });
                }
                catch (err) {
                    // 路由跳转失败
                }
            });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 标题
            Text.create(article.articleTitle);
            // 标题
            Text.fontSize(16);
            // 标题
            Text.fontWeight(FontWeight.Medium);
            // 标题
            Text.fontColor('#333333');
            // 标题
            Text.maxLines(2);
            // 标题
            Text.textOverflow({ overflow: TextOverflow.Ellipsis });
        }, Text);
        // 标题
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 摘要
            if (article.articleAbstract) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(article.articleAbstract);
                        Text.fontSize(14);
                        Text.fontColor('#666666');
                        Text.maxLines(2);
                        Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                        Text.margin({ top: 8 });
                    }, Text);
                    Text.pop();
                });
            }
            // 底部信息
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 底部信息
            Row.create();
            // 底部信息
            Row.width('100%');
            // 底部信息
            Row.margin({ top: 12 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 作者信息
            Row.create();
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Image.create(article.articleAuthorAvatarURL || '');
            Image.width(20);
            Image.height(20);
            Image.borderRadius(10);
            Image.backgroundColor('#E8E8E8');
        }, Image);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(article.articleAuthorName);
            Text.fontSize(12);
            Text.fontColor('#999999');
            Text.margin({ left: 6 });
        }, Text);
        Text.pop();
        // 作者信息
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 统计信息
            Row.create();
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`${article.articleViewCount} 浏览`);
            Text.fontSize(12);
            Text.fontColor('#999999');
            Text.margin({ right: 12 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`${article.articleCommentCount} 评论`);
            Text.fontSize(12);
            Text.fontColor('#999999');
        }, Text);
        Text.pop();
        // 统计信息
        Row.pop();
        // 底部信息
        Row.pop();
        Column.pop();
    }
    /**
     * 私聊内容
     */
    PrivateChatContent(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.height(56);
            Row.padding({ left: 16, right: 16 });
            Row.backgroundColor('#FFFFFF');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('私聊');
            Text.fontSize(18);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#333333');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            List.create();
            List.layoutWeight(1);
            List.width('100%');
        }, List);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const session = _item;
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
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Row.create();
                            Row.padding(16);
                        }, Row);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Image.create(session.receiverAvatar || '');
                            Image.width(50);
                            Image.height(50);
                            Image.borderRadius(25);
                            Image.backgroundColor('#E8E8E8');
                            Image.margin({ right: 12 });
                        }, Image);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Column.create();
                            Column.alignItems(HorizontalAlign.Start);
                            Column.layoutWeight(1);
                        }, Column);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Text.create(session.receiverUserName);
                            Text.fontSize(16);
                            Text.fontColor('#333333');
                            Text.fontWeight(FontWeight.Medium);
                        }, Text);
                        Text.pop();
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Text.create(session.preview || '暂无消息');
                            Text.fontSize(14);
                            Text.fontColor('#999999');
                            Text.maxLines(1);
                            Text.margin({ top: 4 });
                        }, Text);
                        Text.pop();
                        Column.pop();
                        Row.pop();
                        ListItem.pop();
                    };
                    this.observeComponentCreation2(itemCreation2, ListItem);
                    ListItem.pop();
                }
            };
            this.forEachUpdateFunction(elmtId, this.sessions, forEachItemGenFunction, (session: PrivateChatSession) => session.oId, false, false);
        }, ForEach);
        ForEach.pop();
        List.pop();
        Column.pop();
    }
    /**
     * 我的内容
     */
    ProfileContent(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.height(56);
            Row.padding({ left: 16, right: 16 });
            Row.backgroundColor('#FFFFFF');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('我的');
            Text.fontSize(18);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#333333');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('设置');
            Text.fontSize(14);
            Text.fontColor('#1890FF');
            Text.onClick(() => {
                try {
                    this.getUIContext().getRouter().pushUrl({ url: 'pages/SettingsPage' });
                }
                catch (err) {
                    // 路由跳转失败
                }
            });
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            List.create();
            List.layoutWeight(1);
            List.width('100%');
        }, List);
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
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Row.create();
                    Row.padding(16);
                }, Row);
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Image.create(this.userInfo?.userAvatarURL || '');
                    Image.width(64);
                    Image.height(64);
                    Image.borderRadius(32);
                    Image.backgroundColor('#E8E8E8');
                }, Image);
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Column.create();
                    Column.margin({ left: 16 });
                    Column.alignItems(HorizontalAlign.Start);
                }, Column);
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create(this.userInfo?.userName || '');
                    Text.fontSize(18);
                    Text.fontColor('#333333');
                    Text.fontWeight(FontWeight.Bold);
                }, Text);
                Text.pop();
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create(`积分: ${this.userInfo?.point || 0}`);
                    Text.fontSize(14);
                    Text.fontColor('#1890FF');
                    Text.margin({ top: 4 });
                }, Text);
                Text.pop();
                Column.pop();
                Row.pop();
                ListItem.pop();
            };
            this.observeComponentCreation2(itemCreation2, ListItem);
            ListItem.pop();
        }
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
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Column.create();
                    Column.backgroundColor('#FFFFFF');
                }, Column);
                this.ProfileMenuItem.bind(this)('🔔', '通知中心', () => {
                    try {
                        this.getUIContext().getRouter().pushUrl({ url: 'pages/NotificationPage' });
                    }
                    catch (err) {
                        // 路由跳转失败
                    }
                });
                this.ProfileMenuItem.bind(this)('🌙', '清风明月', () => {
                    try {
                        this.getUIContext().getRouter().pushUrl({ url: 'pages/BreezemoonPage' });
                    }
                    catch (err) {
                        // 路由跳转失败
                    }
                });
                this.ProfileMenuItem.bind(this)('💰', '积分转账', () => {
                    try {
                        this.getUIContext().getRouter().pushUrl({ url: 'pages/TransferPage' });
                    }
                    catch (err) {
                        // 路由跳转失败
                    }
                });
                Column.pop();
                ListItem.pop();
            };
            this.observeComponentCreation2(itemCreation2, ListItem);
            ListItem.pop();
        }
        List.pop();
        Column.pop();
    }
    ProfileMenuItem(icon: string, title: string, onClick: () => void, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.height(56);
            Row.padding({ left: 16, right: 16 });
            Row.border({ width: { bottom: 0.5 }, color: '#F0F0F0' });
            Row.onClick(onClick);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(icon);
            Text.fontSize(20);
            Text.margin({ right: 12 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(title);
            Text.fontSize(15);
            Text.fontColor('#333333');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('>');
            Text.fontSize(14);
            Text.fontColor('#CCCCCC');
        }, Text);
        Text.pop();
        Row.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "MainPage";
    }
}
registerNamedRoute(() => new MainPage(undefined, {}), "", { bundleName: "com.example.fishpi", moduleName: "entry", pagePath: "pages/MainPage", pageFullPath: "entry/src/main/ets/pages/MainPage", integratedHsp: "false", moduleType: "followWithHap" });
