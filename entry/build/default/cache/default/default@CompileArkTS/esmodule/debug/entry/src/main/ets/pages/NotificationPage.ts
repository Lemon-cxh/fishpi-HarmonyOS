if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface NotificationPage_Params {
    notifications?: Notification[];
    currentTab?: number;
    isLoading?: boolean;
    topRectHeight?: number;
    tabs?: NotificationTabConfig[];
}
import { HttpUtil } from "@bundle:com.example.fishpi/entry/ets/util/HttpUtil";
import type { ApiResponse } from "@bundle:com.example.fishpi/entry/ets/util/HttpUtil";
import { TimeUtil } from "@bundle:com.example.fishpi/entry/ets/util/TimeUtil";
import type { Notification, NotificationListResponse, NotificationType } from '../model/Notification';
/**
 * Tab配置接口
 */
interface NotificationTabConfig {
    title: string;
    type: NotificationType;
}
class NotificationPage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__notifications = new ObservedPropertyObjectPU([], this, "notifications");
        this.__currentTab = new ObservedPropertySimplePU(0, this, "currentTab");
        this.__isLoading = new ObservedPropertySimplePU(false, this, "isLoading");
        this.__topRectHeight = this.createStorageProp('topRectHeight', 0, "topRectHeight");
        this.tabs = [
            { title: '@我', type: 'at' as NotificationType },
            { title: '评论', type: 'comment' as NotificationType },
            { title: '系统', type: 'sys' as NotificationType }
        ];
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: NotificationPage_Params) {
        if (params.notifications !== undefined) {
            this.notifications = params.notifications;
        }
        if (params.currentTab !== undefined) {
            this.currentTab = params.currentTab;
        }
        if (params.isLoading !== undefined) {
            this.isLoading = params.isLoading;
        }
        if (params.tabs !== undefined) {
            this.tabs = params.tabs;
        }
    }
    updateStateVars(params: NotificationPage_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__notifications.purgeDependencyOnElmtId(rmElmtId);
        this.__currentTab.purgeDependencyOnElmtId(rmElmtId);
        this.__isLoading.purgeDependencyOnElmtId(rmElmtId);
        this.__topRectHeight.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__notifications.aboutToBeDeleted();
        this.__currentTab.aboutToBeDeleted();
        this.__isLoading.aboutToBeDeleted();
        this.__topRectHeight.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __notifications: ObservedPropertyObjectPU<Notification[]>;
    get notifications() {
        return this.__notifications.get();
    }
    set notifications(newValue: Notification[]) {
        this.__notifications.set(newValue);
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
    // 状态栏高度（用于避让）
    private __topRectHeight: ObservedPropertyAbstractPU<number>;
    get topRectHeight() {
        return this.__topRectHeight.get();
    }
    set topRectHeight(newValue: number) {
        this.__topRectHeight.set(newValue);
    }
    // Tab配置
    private tabs: NotificationTabConfig[];
    /**
     * 页面出现时加载数据
     */
    async aboutToAppear(): Promise<void> {
        await this.loadNotifications();
    }
    /**
     * 加载通知列表
     */
    private async loadNotifications(): Promise<void> {
        if (this.isLoading)
            return;
        this.isLoading = true;
        try {
            const response = await HttpUtil.get<NotificationListResponse>('/api/getNotifications');
            if (response.code === 0 && response.data) {
                // 根据当前Tab筛选
                const type = this.tabs[this.currentTab].type;
                this.notifications = response.data.filter(n => n.type === type);
            }
        }
        catch (err) {
            // 加载通知失败
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
        this.notifications = [];
        this.loadNotifications();
    }
    /**
     * 标记已读
     */
    private async markAsRead(type: NotificationType): Promise<void> {
        try {
            await HttpUtil.get<ApiResponse>(`/notifications/make-read/${type}`);
        }
        catch (err) {
            // 标记已读失败
        }
    }
    /**
     * 获取通知图标
     */
    private getNotificationIcon(type: NotificationType): string {
        switch (type) {
            case 'at': return '@';
            case 'comment': return '💬';
            case 'point': return '💰';
            case 'sys': return '🔔';
            case 'following': return '👥';
            default: return '📢';
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
            Text.create('通知中心');
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
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('全部已读');
            Text.fontSize(14);
            Text.fontColor('#1890FF');
            Text.onClick(() => {
                const type = this.tabs[this.currentTab].type;
                this.markAsRead(type);
            });
        }, Text);
        Text.pop();
        // 顶部导航栏
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
            this.forEachUpdateFunction(elmtId, this.tabs, forEachItemGenFunction, (tab: NotificationTabConfig, index: number) => `${tab.title}_${index}`, true, true);
        }, ForEach);
        ForEach.pop();
        // Tab栏
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 通知列表
            if (this.isLoading && this.notifications.length === 0) {
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
            else if (this.notifications.length === 0) {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.layoutWeight(1);
                        Column.justifyContent(FlexAlign.Center);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('🔔');
                        Text.fontSize(48);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('暂无通知');
                        Text.fontSize(16);
                        Text.fontColor('#999999');
                        Text.margin({ top: 12 });
                    }, Text);
                    Text.pop();
                    Column.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(2, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        List.create();
                        List.layoutWeight(1);
                        List.width('100%');
                        List.backgroundColor('#F5F5F5');
                    }, List);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = _item => {
                            const notification = _item;
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
                                    this.NotificationItem.bind(this)(notification);
                                    ListItem.pop();
                                };
                                this.observeComponentCreation2(itemCreation2, ListItem);
                                ListItem.pop();
                            }
                        };
                        this.forEachUpdateFunction(elmtId, this.notifications, forEachItemGenFunction, (notification: Notification) => notification.oId, false, false);
                    }, ForEach);
                    ForEach.pop();
                    List.pop();
                });
            }
        }, If);
        If.pop();
        Column.pop();
    }
    /**
     * 通知项组件
     */
    NotificationItem(notification: Notification, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.padding(16);
            Row.backgroundColor('#FFFFFF');
            Row.margin({ bottom: 1 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 图标
            Text.create(this.getNotificationIcon(notification.type));
            // 图标
            Text.fontSize(20);
            // 图标
            Text.width(40);
            // 图标
            Text.height(40);
            // 图标
            Text.textAlign(TextAlign.Center);
            // 图标
            Text.backgroundColor('#F5F5F5');
            // 图标
            Text.borderRadius(20);
        }, Text);
        // 图标
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.layoutWeight(1);
            Column.margin({ left: 12 });
            Column.alignItems(HorizontalAlign.Start);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 内容
            Text.create(notification.content);
            // 内容
            Text.fontSize(14);
            // 内容
            Text.fontColor('#333333');
            // 内容
            Text.maxLines(2);
            // 内容
            Text.textOverflow({ overflow: TextOverflow.Ellipsis });
        }, Text);
        // 内容
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 时间
            Text.create(TimeUtil.formatTime(notification.time));
            // 时间
            Text.fontSize(12);
            // 时间
            Text.fontColor('#CCCCCC');
            // 时间
            Text.margin({ top: 6 });
        }, Text);
        // 时间
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 未读标记
            if (!notification.read) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Circle.create();
                        Circle.width(8);
                        Circle.height(8);
                        Circle.fill('#FF4D4F');
                    }, Circle);
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        Row.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "NotificationPage";
    }
}
registerNamedRoute(() => new NotificationPage(undefined, {}), "", { bundleName: "com.example.fishpi", moduleName: "entry", pagePath: "pages/NotificationPage", pageFullPath: "entry/src/main/ets/pages/NotificationPage", integratedHsp: "false", moduleType: "followWithHap" });
