if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface UserDetailPage_Params {
    userInfo?: UserInfo | null;
    breezemoons?: Breezemoon[];
    currentTab?: number;
    isLoading?: boolean;
    isFollowing?: boolean;
    userName?: string;
    isSelf?: boolean;
    topRectHeight?: number;
    tabs?;
}
import { HttpUtil } from "@bundle:com.example.fishpi/entry/ets/util/HttpUtil";
import type { ApiResponse } from "@bundle:com.example.fishpi/entry/ets/util/HttpUtil";
import { StorageUtil } from "@bundle:com.example.fishpi/entry/ets/util/StorageUtil";
import { TimeUtil } from "@bundle:com.example.fishpi/entry/ets/util/TimeUtil";
import type { UserInfo } from '../model/User';
import type { Breezemoon, BreezemoonListResponse } from '../model/Notification';
/**
 * 用户信息响应接口
 */
interface UserInfoDetailResponse {
    code: number;
    data: UserInfo;
}
class UserDetailPage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__userInfo = new ObservedPropertyObjectPU(null, this, "userInfo");
        this.__breezemoons = new ObservedPropertyObjectPU([], this, "breezemoons");
        this.__currentTab = new ObservedPropertySimplePU(0, this, "currentTab");
        this.__isLoading = new ObservedPropertySimplePU(false, this, "isLoading");
        this.__isFollowing = new ObservedPropertySimplePU(false, this, "isFollowing");
        this.__userName = new ObservedPropertySimplePU('', this, "userName");
        this.__isSelf = new ObservedPropertySimplePU(false, this, "isSelf");
        this.__topRectHeight = this.createStorageProp('topRectHeight', 0, "topRectHeight");
        this.tabs = ['文章', '清风明月'];
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: UserDetailPage_Params) {
        if (params.userInfo !== undefined) {
            this.userInfo = params.userInfo;
        }
        if (params.breezemoons !== undefined) {
            this.breezemoons = params.breezemoons;
        }
        if (params.currentTab !== undefined) {
            this.currentTab = params.currentTab;
        }
        if (params.isLoading !== undefined) {
            this.isLoading = params.isLoading;
        }
        if (params.isFollowing !== undefined) {
            this.isFollowing = params.isFollowing;
        }
        if (params.userName !== undefined) {
            this.userName = params.userName;
        }
        if (params.isSelf !== undefined) {
            this.isSelf = params.isSelf;
        }
        if (params.tabs !== undefined) {
            this.tabs = params.tabs;
        }
    }
    updateStateVars(params: UserDetailPage_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__userInfo.purgeDependencyOnElmtId(rmElmtId);
        this.__breezemoons.purgeDependencyOnElmtId(rmElmtId);
        this.__currentTab.purgeDependencyOnElmtId(rmElmtId);
        this.__isLoading.purgeDependencyOnElmtId(rmElmtId);
        this.__isFollowing.purgeDependencyOnElmtId(rmElmtId);
        this.__userName.purgeDependencyOnElmtId(rmElmtId);
        this.__isSelf.purgeDependencyOnElmtId(rmElmtId);
        this.__topRectHeight.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__userInfo.aboutToBeDeleted();
        this.__breezemoons.aboutToBeDeleted();
        this.__currentTab.aboutToBeDeleted();
        this.__isLoading.aboutToBeDeleted();
        this.__isFollowing.aboutToBeDeleted();
        this.__userName.aboutToBeDeleted();
        this.__isSelf.aboutToBeDeleted();
        this.__topRectHeight.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __userInfo: ObservedPropertyObjectPU<UserInfo | null>;
    get userInfo() {
        return this.__userInfo.get();
    }
    set userInfo(newValue: UserInfo | null) {
        this.__userInfo.set(newValue);
    }
    private __breezemoons: ObservedPropertyObjectPU<Breezemoon[]>;
    get breezemoons() {
        return this.__breezemoons.get();
    }
    set breezemoons(newValue: Breezemoon[]) {
        this.__breezemoons.set(newValue);
    }
    private __currentTab: ObservedPropertySimplePU<number>;
    get currentTab() {
        return this.__currentTab.get();
    }
    set currentTab(newValue: number) {
        this.__currentTab.set(newValue);
    }
    private __isLoading: ObservedPropertySimplePU<boolean>;
    get isLoading() {
        return this.__isLoading.get();
    }
    set isLoading(newValue: boolean) {
        this.__isLoading.set(newValue);
    }
    private __isFollowing: ObservedPropertySimplePU<boolean>;
    get isFollowing() {
        return this.__isFollowing.get();
    }
    set isFollowing(newValue: boolean) {
        this.__isFollowing.set(newValue);
    }
    private __userName: ObservedPropertySimplePU<string>;
    get userName() {
        return this.__userName.get();
    }
    set userName(newValue: string) {
        this.__userName.set(newValue);
    }
    private __isSelf: ObservedPropertySimplePU<boolean>;
    get isSelf() {
        return this.__isSelf.get();
    }
    set isSelf(newValue: boolean) {
        this.__isSelf.set(newValue);
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
    private tabs;
    /**
     * 从路由参数获取用户名
     */
    async aboutToAppear(): Promise<void> {
        try {
            const params = this.getUIContext().getRouter().getParams() as Record<string, string>;
            this.userName = params?.userName || '';
            // 检查是否是自己
            const currentUserName = await StorageUtil.get(StorageUtil.KEY_USER_NAME);
            this.isSelf = this.userName === currentUserName;
            if (this.userName) {
                await this.loadUserInfo();
                await this.loadBreezemoons();
            }
        }
        catch (err) {
            // 获取路由参数失败
        }
    }
    /**
     * 加载用户信息
     */
    private async loadUserInfo(): Promise<void> {
        this.isLoading = true;
        try {
            const response = await HttpUtil.get<UserInfoDetailResponse>(`/user/${this.userName}`);
            if (response.code === 0 && response.data) {
                this.userInfo = response.data;
            }
        }
        catch (err) {
            // 加载用户信息失败
        }
        finally {
            this.isLoading = false;
        }
    }
    /**
     * 加载清风明月
     */
    private async loadBreezemoons(): Promise<void> {
        try {
            const response = await HttpUtil.get<BreezemoonListResponse>(`/api/user/${this.userName}/breezemoons`);
            if (response.code === 0 && response.data) {
                this.breezemoons = response.data;
            }
        }
        catch (err) {
            // 加载清风明月失败
        }
    }
    /**
     * 关注/取消关注
     */
    private async toggleFollow(): Promise<void> {
        try {
            const path = this.isFollowing ? '/unfollow/user' : '/follow/user';
            const params = new Map<string, string>();
            params.set('userName', this.userName);
            const response = await HttpUtil.post<ApiResponse>(path, params);
            if (response.code === 0) {
                this.isFollowing = !this.isFollowing;
            }
        }
        catch (err) {
            // 关注/取消关注失败
        }
    }
    /**
     * 打开私聊
     */
    private openPrivateChat(): void {
        try {
            this.getUIContext().getRouter().pushUrl({
                url: 'pages/PrivateChatDetailPage',
                params: {
                    userName: this.userName,
                    avatar: this.userInfo?.userAvatarURL || ''
                }
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
            Text.create(this.userName);
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
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        List.create();
                        List.layoutWeight(1);
                        List.width('100%');
                        List.backgroundColor('#F5F5F5');
                    }, List);
                    {
                        const itemCreation = (elmtId, isInitialRender) => {
                            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                            ListItem.create(deepRenderFunction, true);
                            if (!isInitialRender) {
                                // 用户信息卡片
                                ListItem.pop();
                            }
                            ViewStackProcessor.StopGetAccessRecording();
                        };
                        const itemCreation2 = (elmtId, isInitialRender) => {
                            ListItem.create(deepRenderFunction, true);
                        };
                        const deepRenderFunction = (elmtId, isInitialRender) => {
                            itemCreation(elmtId, isInitialRender);
                            this.UserCard.bind(this)();
                            // 用户信息卡片
                            ListItem.pop();
                        };
                        this.observeComponentCreation2(itemCreation2, ListItem);
                        // 用户信息卡片
                        ListItem.pop();
                    }
                    {
                        const itemCreation = (elmtId, isInitialRender) => {
                            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                            ListItem.create(deepRenderFunction, true);
                            if (!isInitialRender) {
                                // Tab栏
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
                                Row.backgroundColor('#FFFFFF');
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
                                            this.currentTab = index;
                                        });
                                    }, Column);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(tab);
                                        Text.fontSize(14);
                                        Text.fontColor(this.currentTab === index ? '#1890FF' : '#666666');
                                        Text.fontWeight(this.currentTab === index ? FontWeight.Medium : FontWeight.Normal);
                                    }, Text);
                                    Text.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        If.create();
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
                                this.forEachUpdateFunction(elmtId, this.tabs, forEachItemGenFunction, (tab: string, index: number) => `${tab}_${index}`, true, true);
                            }, ForEach);
                            ForEach.pop();
                            Row.pop();
                            // Tab栏
                            ListItem.pop();
                        };
                        this.observeComponentCreation2(itemCreation2, ListItem);
                        // Tab栏
                        ListItem.pop();
                    }
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        // 内容列表
                        if (this.currentTab === 0) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                {
                                    const itemCreation = (elmtId, isInitialRender) => {
                                        ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                                        ListItem.create(deepRenderFunction, true);
                                        if (!isInitialRender) {
                                            // 文章列表（简化展示）
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
                                            Column.justifyContent(FlexAlign.Center);
                                        }, Column);
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Text.create('暂无文章');
                                            Text.fontSize(14);
                                            Text.fontColor('#999999');
                                            Text.padding(40);
                                        }, Text);
                                        Text.pop();
                                        Column.pop();
                                        // 文章列表（简化展示）
                                        ListItem.pop();
                                    };
                                    this.observeComponentCreation2(itemCreation2, ListItem);
                                    // 文章列表（简化展示）
                                    ListItem.pop();
                                }
                            });
                        }
                        else {
                            this.ifElseBranchUpdateFunction(1, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    // 清风明月列表
                                    ForEach.create();
                                    const forEachItemGenFunction = _item => {
                                        const item = _item;
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
                                                this.BreezemoonItem.bind(this)(item);
                                                ListItem.pop();
                                            };
                                            this.observeComponentCreation2(itemCreation2, ListItem);
                                            ListItem.pop();
                                        }
                                    };
                                    this.forEachUpdateFunction(elmtId, this.breezemoons, forEachItemGenFunction, (item: Breezemoon) => item.oId, false, false);
                                }, ForEach);
                                // 清风明月列表
                                ForEach.pop();
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    If.create();
                                    if (this.breezemoons.length === 0) {
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
                                                        Column.create();
                                                        Column.width('100%');
                                                        Column.justifyContent(FlexAlign.Center);
                                                    }, Column);
                                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                        Text.create('暂无清风明月');
                                                        Text.fontSize(14);
                                                        Text.fontColor('#999999');
                                                        Text.padding(40);
                                                    }, Text);
                                                    Text.pop();
                                                    Column.pop();
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
     * 用户信息卡片
     */
    UserCard(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.padding(16);
            Column.backgroundColor('#FFFFFF');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 头像
            Image.create(this.userInfo?.userAvatarURL || '');
            // 头像
            Image.width(72);
            // 头像
            Image.height(72);
            // 头像
            Image.borderRadius(36);
            // 头像
            Image.backgroundColor('#E8E8E8');
        }, Image);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.alignItems(HorizontalAlign.Start);
            Column.margin({ left: 16 });
            Column.layoutWeight(1);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 用户名
            Text.create(this.userInfo?.userName || '');
            // 用户名
            Text.fontSize(18);
            // 用户名
            Text.fontWeight(FontWeight.Bold);
            // 用户名
            Text.fontColor('#333333');
        }, Text);
        // 用户名
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 昵称
            if (this.userInfo?.userNickname) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.userInfo.userNickname);
                        Text.fontSize(14);
                        Text.fontColor('#999999');
                        Text.margin({ top: 4 });
                    }, Text);
                    Text.pop();
                });
            }
            // 个人简介
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 个人简介
            if (this.userInfo?.userIntro) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.userInfo.userIntro);
                        Text.fontSize(13);
                        Text.fontColor('#666666');
                        Text.maxLines(2);
                        Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                        Text.margin({ top: 8 });
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
        Column.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 统计信息
            Row.create();
            // 统计信息
            Row.width('100%');
            // 统计信息
            Row.margin({ top: 20 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.layoutWeight(1);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create((this.userInfo?.followingCount || 0).toString());
            Text.fontSize(16);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor('#333333');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('关注');
            Text.fontSize(12);
            Text.fontColor('#999999');
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.layoutWeight(1);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create((this.userInfo?.followerCount || 0).toString());
            Text.fontSize(16);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor('#333333');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('粉丝');
            Text.fontSize(12);
            Text.fontColor('#999999');
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.layoutWeight(1);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create((this.userInfo?.point || 0).toString());
            Text.fontSize(16);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor('#333333');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('积分');
            Text.fontSize(12);
            Text.fontColor('#999999');
        }, Text);
        Text.pop();
        Column.pop();
        // 统计信息
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 操作按钮
            if (!this.isSelf) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.width('100%');
                        Row.margin({ top: 16 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel(this.isFollowing ? '已关注' : '关注');
                        Button.type(ButtonType.Capsule);
                        Button.layoutWeight(1);
                        Button.height(36);
                        Button.backgroundColor(this.isFollowing ? '#F5F5F5' : '#1890FF');
                        Button.fontColor(this.isFollowing ? '#666666' : '#FFFFFF');
                        Button.fontSize(14);
                        Button.onClick(() => {
                            this.toggleFollow();
                        });
                    }, Button);
                    Button.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('私聊');
                        Button.type(ButtonType.Capsule);
                        Button.layoutWeight(1);
                        Button.height(36);
                        Button.backgroundColor('#F5F5F5');
                        Button.fontColor('#666666');
                        Button.fontSize(14);
                        Button.margin({ left: 12 });
                        Button.onClick(() => {
                            this.openPrivateChat();
                        });
                    }, Button);
                    Button.pop();
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
    /**
     * 清风明月项组件
     */
    BreezemoonItem(item: Breezemoon, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.padding(16);
            Column.backgroundColor('#FFFFFF');
            Column.margin({ bottom: 1 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(item.breezemoonContent);
            Text.fontSize(15);
            Text.fontColor('#333333');
            Text.lineHeight(24);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(TimeUtil.formatTime(item.breezemoonCreateTime));
            Text.fontSize(12);
            Text.fontColor('#CCCCCC');
            Text.margin({ top: 8 });
        }, Text);
        Text.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "UserDetailPage";
    }
}
registerNamedRoute(() => new UserDetailPage(undefined, {}), "", { bundleName: "com.example.fishpi", moduleName: "entry", pagePath: "pages/UserDetailPage", pageFullPath: "entry/src/main/ets/pages/UserDetailPage", integratedHsp: "false", moduleType: "followWithHap" });
