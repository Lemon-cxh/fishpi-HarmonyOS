if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface ArticleListPage_Params {
    articles?: Article[];
    currentTab?: number;
    currentPage?: number;
    isLoading?: boolean;
    hasMore?: boolean;
    topRectHeight?: number;
    tabs?: TabConfig[];
}
import { HttpUtil } from "@bundle:com.example.fishpi/entry/ets/util/HttpUtil";
import { TimeUtil } from "@bundle:com.example.fishpi/entry/ets/util/TimeUtil";
import type { Article, ArticleListResponse } from '../model/Article';
/**
 * Tab配置接口
 */
interface TabConfig {
    title: string;
    path: string;
}
class ArticleListPage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__articles = new ObservedPropertyObjectPU([], this, "articles");
        this.__currentTab = new ObservedPropertySimplePU(0, this, "currentTab");
        this.__currentPage = new ObservedPropertySimplePU(1, this, "currentPage");
        this.__isLoading = new ObservedPropertySimplePU(false, this, "isLoading");
        this.__hasMore = new ObservedPropertySimplePU(true, this, "hasMore");
        this.__topRectHeight = this.createStorageProp('topRectHeight', 0, "topRectHeight");
        this.tabs = [
            { title: '最近', path: '/api/articles/recent' },
            { title: '热门', path: '/api/articles/recent/hot' },
            { title: '精华', path: '/api/articles/recent/good' },
            { title: '最近回复', path: '/api/articles/recent/reply' }
        ];
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: ArticleListPage_Params) {
        if (params.articles !== undefined) {
            this.articles = params.articles;
        }
        if (params.currentTab !== undefined) {
            this.currentTab = params.currentTab;
        }
        if (params.currentPage !== undefined) {
            this.currentPage = params.currentPage;
        }
        if (params.isLoading !== undefined) {
            this.isLoading = params.isLoading;
        }
        if (params.hasMore !== undefined) {
            this.hasMore = params.hasMore;
        }
        if (params.tabs !== undefined) {
            this.tabs = params.tabs;
        }
    }
    updateStateVars(params: ArticleListPage_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__articles.purgeDependencyOnElmtId(rmElmtId);
        this.__currentTab.purgeDependencyOnElmtId(rmElmtId);
        this.__currentPage.purgeDependencyOnElmtId(rmElmtId);
        this.__isLoading.purgeDependencyOnElmtId(rmElmtId);
        this.__hasMore.purgeDependencyOnElmtId(rmElmtId);
        this.__topRectHeight.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__articles.aboutToBeDeleted();
        this.__currentTab.aboutToBeDeleted();
        this.__currentPage.aboutToBeDeleted();
        this.__isLoading.aboutToBeDeleted();
        this.__hasMore.aboutToBeDeleted();
        this.__topRectHeight.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __articles: ObservedPropertyObjectPU<Article[]>;
    get articles() {
        return this.__articles.get();
    }
    set articles(newValue: Article[]) {
        this.__articles.set(newValue);
    }
    private __currentTab: ObservedPropertySimplePU<number>;
    get currentTab() {
        return this.__currentTab.get();
    }
    set currentTab(newValue: number) {
        this.__currentTab.set(newValue);
    }
    private __currentPage: ObservedPropertySimplePU<number>;
    get currentPage() {
        return this.__currentPage.get();
    }
    set currentPage(newValue: number) {
        this.__currentPage.set(newValue);
    }
    private __isLoading: ObservedPropertySimplePU<boolean>;
    get isLoading() {
        return this.__isLoading.get();
    }
    set isLoading(newValue: boolean) {
        this.__isLoading.set(newValue);
    }
    private __hasMore: ObservedPropertySimplePU<boolean>;
    get hasMore() {
        return this.__hasMore.get();
    }
    set hasMore(newValue: boolean) {
        this.__hasMore.set(newValue);
    }
    // 状态栏高度（用于避让）
    private __topRectHeight: ObservedPropertyAbstractPU<number>;
    get topRectHeight() {
        return this.__topRectHeight.get();
    }
    set topRectHeight(newValue: number) {
        this.__topRectHeight.set(newValue);
    }
    // Tab配置
    private tabs: TabConfig[];
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
        if (this.isLoading)
            return;
        this.isLoading = true;
        try {
            const path = this.tabs[this.currentTab].path;
            const params = new Map<string, number>();
            params.set('p', this.currentPage);
            const response = await HttpUtil.get<ArticleListResponse>(path, params);
            if (response.code === 0 && response.data && response.data.articles) {
                if (this.currentPage === 1) {
                    this.articles = response.data.articles;
                }
                else {
                    this.articles = [...this.articles, ...response.data.articles];
                }
                this.hasMore = response.data.articles.length >= 20;
            }
        }
        catch (err) {
            // 加载文章失败
        }
        finally {
            this.isLoading = false;
        }
    }
    /**
     * 切换Tab
     */
    private switchTab(index: number): void {
        if (this.currentTab === index)
            return;
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
        if (!this.hasMore || this.isLoading)
            return;
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
        }
        catch (err) {
            // 路由跳转失败
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
            Text.fontSize(20);
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
            // Tab栏
            Row.create();
            // Tab栏
            Row.width('100%');
            // Tab栏
            Row.backgroundColor('#FFFFFF');
            // Tab栏
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
                        this.switchTab(index);
                    });
                }, Column);
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create(tab.title);
                    Text.fontSize(14);
                    Text.fontColor(this.currentTab === index ? '#1890FF' : '#666666');
                    Text.fontWeight(this.currentTab === index ? FontWeight.Medium : FontWeight.Normal);
                }, Text);
                Text.pop();
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    If.create();
                    // 选中指示器
                    if (this.currentTab === index) {
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
            this.forEachUpdateFunction(elmtId, this.tabs, forEachItemGenFunction, (tab: TabConfig, index: number) => `${tab.title}_${index}`, true, true);
        }, ForEach);
        ForEach.pop();
        // Tab栏
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 文章列表
            List.create();
            // 文章列表
            List.layoutWeight(1);
            // 文章列表
            List.width('100%');
            // 文章列表
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
            if (this.hasMore) {
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
                                Text.create(this.isLoading ? '加载中...' : '加载更多');
                                Text.fontSize(14);
                                Text.fontColor('#1890FF');
                                Text.width('100%');
                                Text.textAlign(TextAlign.Center);
                                Text.padding(16);
                                Text.onClick(() => {
                                    this.loadMore();
                                });
                            }, Text);
                            Text.pop();
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
        // 文章列表
        List.pop();
        Column.pop();
    }
    /**
     * 文章卡片组件
     */
    ArticleCard(article: Article, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.padding(16);
            Column.backgroundColor('#FFFFFF');
            Column.margin({ bottom: 8 });
            Column.onClick(() => {
                this.goDetail(article.oId);
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
            // 浏览数
            Row.create();
            // 浏览数
            Row.margin({ right: 16 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('👁');
            Text.fontSize(12);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(article.articleViewCount.toString());
            Text.fontSize(12);
            Text.fontColor('#999999');
            Text.margin({ left: 4 });
        }, Text);
        Text.pop();
        // 浏览数
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 评论数
            Row.create();
            // 评论数
            Row.margin({ right: 16 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('💬');
            Text.fontSize(12);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(article.articleCommentCount.toString());
            Text.fontSize(12);
            Text.fontColor('#999999');
            Text.margin({ left: 4 });
        }, Text);
        Text.pop();
        // 评论数
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 点赞数
            Row.create();
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('👍');
            Text.fontSize(12);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(article.articleGoodCnt.toString());
            Text.fontSize(12);
            Text.fontColor('#999999');
            Text.margin({ left: 4 });
        }, Text);
        Text.pop();
        // 点赞数
        Row.pop();
        // 统计信息
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 时间
            Text.create(TimeUtil.formatTime(article.articleCreateTime));
            // 时间
            Text.fontSize(12);
            // 时间
            Text.fontColor('#CCCCCC');
            // 时间
            Text.margin({ left: 12 });
        }, Text);
        // 时间
        Text.pop();
        // 底部信息
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 标签
            if (article.articleTags) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.margin({ top: 8 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = _item => {
                            const tag = _item;
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                If.create();
                                if (tag.trim()) {
                                    this.ifElseBranchUpdateFunction(0, () => {
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Text.create(tag.trim());
                                            Text.fontSize(11);
                                            Text.fontColor('#1890FF');
                                            Text.backgroundColor('#E6F7FF');
                                            Text.padding({ left: 6, right: 6, top: 2, bottom: 2 });
                                            Text.borderRadius(4);
                                            Text.margin({ right: 6 });
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
                        this.forEachUpdateFunction(elmtId, article.articleTags.split(','), forEachItemGenFunction, (tag: string) => tag, false, false);
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
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "ArticleListPage";
    }
}
registerNamedRoute(() => new ArticleListPage(undefined, {}), "", { bundleName: "com.example.fishpi", moduleName: "entry", pagePath: "pages/ArticleListPage", pageFullPath: "entry/src/main/ets/pages/ArticleListPage", integratedHsp: "false", moduleType: "followWithHap" });
