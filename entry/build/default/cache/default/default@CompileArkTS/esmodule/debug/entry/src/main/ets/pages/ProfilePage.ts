if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface ProfilePage_Params {
    userInfo?: UserInfo | null;
    liveness?: number;
    isLivenessCollected?: boolean;
    isLoading?: boolean;
    topRectHeight?: number;
}
import { HttpUtil } from "@bundle:com.example.fishpi/entry/ets/util/HttpUtil";
import type { ApiResponse } from "@bundle:com.example.fishpi/entry/ets/util/HttpUtil";
import { StorageUtil } from "@bundle:com.example.fishpi/entry/ets/util/StorageUtil";
import type { UserInfo } from '../model/User';
/**
 * 用户信息响应接口
 */
interface UserInfoResponse {
    code: number;
    data: UserInfo;
}
/**
 * 活跃度响应接口
 */
interface LivenessResponse {
    code: number;
    data: number;
}
/**
 * 活跃度领取状态响应接口
 */
interface LivenessCollectResponse {
    code: number;
    data: boolean;
}
class ProfilePage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__userInfo = new ObservedPropertyObjectPU(null, this, "userInfo");
        this.__liveness = new ObservedPropertySimplePU(0, this, "liveness");
        this.__isLivenessCollected = new ObservedPropertySimplePU(false, this, "isLivenessCollected");
        this.__isLoading = new ObservedPropertySimplePU(false, this, "isLoading");
        this.__topRectHeight = this.createStorageProp('topRectHeight', 0, "topRectHeight");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: ProfilePage_Params) {
        if (params.userInfo !== undefined) {
            this.userInfo = params.userInfo;
        }
        if (params.liveness !== undefined) {
            this.liveness = params.liveness;
        }
        if (params.isLivenessCollected !== undefined) {
            this.isLivenessCollected = params.isLivenessCollected;
        }
        if (params.isLoading !== undefined) {
            this.isLoading = params.isLoading;
        }
    }
    updateStateVars(params: ProfilePage_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__userInfo.purgeDependencyOnElmtId(rmElmtId);
        this.__liveness.purgeDependencyOnElmtId(rmElmtId);
        this.__isLivenessCollected.purgeDependencyOnElmtId(rmElmtId);
        this.__isLoading.purgeDependencyOnElmtId(rmElmtId);
        this.__topRectHeight.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__userInfo.aboutToBeDeleted();
        this.__liveness.aboutToBeDeleted();
        this.__isLivenessCollected.aboutToBeDeleted();
        this.__isLoading.aboutToBeDeleted();
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
    private __liveness: ObservedPropertySimplePU<number>;
    get liveness() {
        return this.__liveness.get();
    }
    set liveness(newValue: number) {
        this.__liveness.set(newValue);
    }
    private __isLivenessCollected: ObservedPropertySimplePU<boolean>;
    get isLivenessCollected() {
        return this.__isLivenessCollected.get();
    }
    set isLivenessCollected(newValue: boolean) {
        this.__isLivenessCollected.set(newValue);
    }
    private __isLoading: ObservedPropertySimplePU<boolean>;
    get isLoading() {
        return this.__isLoading.get();
    }
    set isLoading(newValue: boolean) {
        this.__isLoading.set(newValue);
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
     * 页面出现时加载数据
     */
    async aboutToAppear(): Promise<void> {
        await this.loadUserInfo();
        await this.loadLiveness();
    }
    /**
     * 加载用户信息
     */
    private async loadUserInfo(): Promise<void> {
        this.isLoading = true;
        try {
            const response = await HttpUtil.get<UserInfoResponse>('/api/user');
            if (response.code === 0 && response.data) {
                this.userInfo = response.data;
                // 保存用户信息
                await StorageUtil.set(StorageUtil.KEY_USER_NAME, response.data.userName);
                await StorageUtil.set(StorageUtil.KEY_USER_AVATAR, response.data.userAvatarURL);
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
     * 加载活跃度
     */
    private async loadLiveness(): Promise<void> {
        try {
            const response = await HttpUtil.get<LivenessResponse>('/user/liveness');
            if (response.code === 0) {
                this.liveness = response.data;
            }
            // 检查是否已领取
            const collectResponse = await HttpUtil.get<LivenessCollectResponse>('/api/activity/is-collected-liveness');
            if (collectResponse.code === 0) {
                this.isLivenessCollected = collectResponse.data;
            }
        }
        catch (err) {
            // 加载活跃度失败
        }
    }
    /**
     * 领取昨日活跃度奖励
     */
    private async collectLiveness(): Promise<void> {
        if (this.isLivenessCollected)
            return;
        try {
            const response = await HttpUtil.get<ApiResponse>('/activity/yesterday-liveness-reward-api');
            if (response.code === 0) {
                this.isLivenessCollected = true;
            }
        }
        catch (err) {
            // 领取活跃度失败
        }
    }
    /**
     * 退出登录
     */
    private async logout(): Promise<void> {
        await StorageUtil.clear();
        HttpUtil.setApiKey('');
        try {
            this.getUIContext().getRouter().replaceUrl({ url: 'pages/LoginPage' });
        }
        catch (err) {
            // 路由替换失败
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
            Text.create('我的');
            Text.fontSize(20);
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
        // 顶部标题栏
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 内容区域
            List.create();
            // 内容区域
            List.layoutWeight(1);
            // 内容区域
            List.width('100%');
            // 内容区域
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
                    // 活跃度卡片
                    ListItem.pop();
                }
                ViewStackProcessor.StopGetAccessRecording();
            };
            const itemCreation2 = (elmtId, isInitialRender) => {
                ListItem.create(deepRenderFunction, true);
            };
            const deepRenderFunction = (elmtId, isInitialRender) => {
                itemCreation(elmtId, isInitialRender);
                this.LivenessCard.bind(this)();
                // 活跃度卡片
                ListItem.pop();
            };
            this.observeComponentCreation2(itemCreation2, ListItem);
            // 活跃度卡片
            ListItem.pop();
        }
        {
            const itemCreation = (elmtId, isInitialRender) => {
                ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                ListItem.create(deepRenderFunction, true);
                if (!isInitialRender) {
                    // 功能菜单
                    ListItem.pop();
                }
                ViewStackProcessor.StopGetAccessRecording();
            };
            const itemCreation2 = (elmtId, isInitialRender) => {
                ListItem.create(deepRenderFunction, true);
            };
            const deepRenderFunction = (elmtId, isInitialRender) => {
                itemCreation(elmtId, isInitialRender);
                this.MenuList.bind(this)();
                // 功能菜单
                ListItem.pop();
            };
            this.observeComponentCreation2(itemCreation2, ListItem);
            // 功能菜单
            ListItem.pop();
        }
        {
            const itemCreation = (elmtId, isInitialRender) => {
                ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                ListItem.create(deepRenderFunction, true);
                if (!isInitialRender) {
                    // 退出登录
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
                    Button.createWithLabel('退出登录');
                    Button.type(ButtonType.Capsule);
                    Button.width('90%');
                    Button.height(44);
                    Button.backgroundColor('#FF4D4F');
                    Button.fontColor('#FFFFFF');
                    Button.fontSize(16);
                    Button.margin({ top: 20, left: '5%' });
                    Button.onClick(() => {
                        this.logout();
                    });
                }, Button);
                Button.pop();
                // 退出登录
                ListItem.pop();
            };
            this.observeComponentCreation2(itemCreation2, ListItem);
            // 退出登录
            ListItem.pop();
        }
        // 内容区域
        List.pop();
        Column.pop();
    }
    /**
     * 用户信息卡片
     */
    UserCard(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.padding(16);
            Row.backgroundColor('#FFFFFF');
            Row.onClick(() => {
                try {
                    this.getUIContext().getRouter().pushUrl({ url: 'pages/UserDetailPage', params: { userName: this.userInfo?.userName } });
                }
                catch (err) {
                    // 路由跳转失败
                }
            });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 头像
            Image.create(this.userInfo?.userAvatarURL || '');
            // 头像
            Image.width(64);
            // 头像
            Image.height(64);
            // 头像
            Image.borderRadius(32);
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
            Text.create(this.userInfo?.userName || '加载中...');
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
            // 积分
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 积分
            Row.create();
            // 积分
            Row.margin({ top: 8 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('积分: ');
            Text.fontSize(14);
            Text.fontColor('#666666');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create((this.userInfo?.point || 0).toString());
            Text.fontSize(14);
            Text.fontColor('#1890FF');
            Text.fontWeight(FontWeight.Medium);
        }, Text);
        Text.pop();
        // 积分
        Row.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 箭头
            Text.create('>');
            // 箭头
            Text.fontSize(16);
            // 箭头
            Text.fontColor('#CCCCCC');
        }, Text);
        // 箭头
        Text.pop();
        Row.pop();
    }
    /**
     * 活跃度卡片
     */
    LivenessCard(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.padding(16);
            Column.backgroundColor('#FFFFFF');
            Column.margin({ top: 12 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('今日活跃度');
            Text.fontSize(14);
            Text.fontColor('#666666');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.isLivenessCollected) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('已领取 ✓');
                        Text.fontSize(12);
                        Text.fontColor('#52C41A');
                    }, Text);
                    Text.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('领取奖励');
                        Button.type(ButtonType.Capsule);
                        Button.height(28);
                        Button.fontSize(12);
                        Button.backgroundColor('#1890FF');
                        Button.fontColor('#FFFFFF');
                        Button.onClick(() => {
                            this.collectLiveness();
                        });
                    }, Button);
                    Button.pop();
                });
            }
        }, If);
        If.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 进度条
            Row.create();
            // 进度条
            Row.width('100%');
            // 进度条
            Row.margin({ top: 12 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Progress.create({ value: this.liveness, total: 100, type: ProgressType.Linear });
            Progress.width('100%');
            Progress.height(8);
            Progress.color('#1890FF');
            Progress.backgroundColor('#E8E8E8');
        }, Progress);
        // 进度条
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`${this.liveness}%`);
            Text.fontSize(12);
            Text.fontColor('#999999');
            Text.margin({ top: 8 });
            Text.alignSelf(ItemAlign.End);
        }, Text);
        Text.pop();
        Column.pop();
    }
    /**
     * 功能菜单列表
     */
    MenuList(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.backgroundColor('#FFFFFF');
            Column.margin({ top: 12 });
        }, Column);
        this.MenuItem.bind(this)('📝', '我的文章', () => {
            // TODO: 跳转我的文章
        });
        this.MenuItem.bind(this)('🌙', '我的清风明月', () => {
            try {
                this.getUIContext().getRouter().pushUrl({ url: 'pages/BreezemoonPage' });
            }
            catch (err) {
                // 路由跳转失败
            }
        });
        this.MenuItem.bind(this)('👥', '我的关注', () => {
            // TODO: 跳转关注列表
        });
        this.MenuItem.bind(this)('💰', '积分转账', () => {
            try {
                this.getUIContext().getRouter().pushUrl({ url: 'pages/TransferPage' });
            }
            catch (err) {
                // 路由跳转失败
            }
        });
        this.MenuItem.bind(this)('🔔', '通知中心', () => {
            try {
                this.getUIContext().getRouter().pushUrl({ url: 'pages/NotificationPage' });
            }
            catch (err) {
                // 路由跳转失败
            }
        });
        this.MenuItem.bind(this)('⚙️', '设置', () => {
            try {
                this.getUIContext().getRouter().pushUrl({ url: 'pages/SettingsPage' });
            }
            catch (err) {
                // 路由跳转失败
            }
        });
        Column.pop();
    }
    /**
     * 菜单项组件
     */
    MenuItem(icon: string, title: string, onClick: () => void, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
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
            Text.layoutWeight(1);
        }, Text);
        Text.pop();
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
        return "ProfilePage";
    }
}
registerNamedRoute(() => new ProfilePage(undefined, {}), "", { bundleName: "com.example.fishpi", moduleName: "entry", pagePath: "pages/ProfilePage", pageFullPath: "entry/src/main/ets/pages/ProfilePage", integratedHsp: "false", moduleType: "followWithHap" });
