if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface PrivateChatListPage_Params {
    sessions?: PrivateChatSession[];
    isLoading?: boolean;
    topRectHeight?: number;
}
import { HttpUtil } from "@bundle:com.example.fishpi/entry/ets/util/HttpUtil";
import { TimeUtil } from "@bundle:com.example.fishpi/entry/ets/util/TimeUtil";
import type { PrivateChatSession, PrivateChatListResponse } from '../model/Notification';
class PrivateChatListPage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__sessions = new ObservedPropertyObjectPU([], this, "sessions");
        this.__isLoading = new ObservedPropertySimplePU(false, this, "isLoading");
        this.__topRectHeight = this.createStorageProp('topRectHeight', 0, "topRectHeight");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: PrivateChatListPage_Params) {
        if (params.sessions !== undefined) {
            this.sessions = params.sessions;
        }
        if (params.isLoading !== undefined) {
            this.isLoading = params.isLoading;
        }
    }
    updateStateVars(params: PrivateChatListPage_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__sessions.purgeDependencyOnElmtId(rmElmtId);
        this.__isLoading.purgeDependencyOnElmtId(rmElmtId);
        this.__topRectHeight.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__sessions.aboutToBeDeleted();
        this.__isLoading.aboutToBeDeleted();
        this.__topRectHeight.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __sessions: ObservedPropertyObjectPU<PrivateChatSession[]>;
    get sessions() {
        return this.__sessions.get();
    }
    set sessions(newValue: PrivateChatSession[]) {
        this.__sessions.set(newValue);
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
        await this.loadSessions();
    }
    /**
     * 加载私聊会话列表
     */
    private async loadSessions(): Promise<void> {
        if (this.isLoading)
            return;
        this.isLoading = true;
        try {
            const response = await HttpUtil.get<PrivateChatListResponse>('/chat/get-list');
            if (response.code === 0 && response.data) {
                this.sessions = response.data;
            }
        }
        catch (err) {
            // 加载私聊会话失败
        }
        finally {
            this.isLoading = false;
        }
    }
    /**
     * 跳转私聊详情
     */
    private goChat(session: PrivateChatSession): void {
        try {
            this.getUIContext().getRouter().pushUrl({
                url: 'pages/PrivateChatDetailPage',
                params: {
                    userName: session.receiverUserName,
                    avatar: session.receiverAvatar
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
            // 顶部标题栏
            Row.border({ width: { bottom: 0.5 }, color: '#E8E8E8' });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('私聊');
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
            If.create();
            if (this.isLoading && this.sessions.length === 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 加载中
                        Column.create();
                        // 加载中
                        Column.layoutWeight(1);
                        // 加载中
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
                    // 加载中
                    Column.pop();
                });
            }
            else if (this.sessions.length === 0) {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 空状态
                        Column.create();
                        // 空状态
                        Column.layoutWeight(1);
                        // 空状态
                        Column.justifyContent(FlexAlign.Center);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('✉️');
                        Text.fontSize(48);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('暂无私聊消息');
                        Text.fontSize(16);
                        Text.fontColor('#999999');
                        Text.margin({ top: 12 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('快去找人聊聊吧');
                        Text.fontSize(14);
                        Text.fontColor('#CCCCCC');
                        Text.margin({ top: 8 });
                    }, Text);
                    Text.pop();
                    // 空状态
                    Column.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(2, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 会话列表
                        List.create();
                        // 会话列表
                        List.layoutWeight(1);
                        // 会话列表
                        List.width('100%');
                        // 会话列表
                        List.backgroundColor('#F5F5F5');
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
                                    this.SessionItem.bind(this)(session);
                                    ListItem.pop();
                                };
                                this.observeComponentCreation2(itemCreation2, ListItem);
                                ListItem.pop();
                            }
                        };
                        this.forEachUpdateFunction(elmtId, this.sessions, forEachItemGenFunction, (session: PrivateChatSession) => session.oId, false, false);
                    }, ForEach);
                    ForEach.pop();
                    // 会话列表
                    List.pop();
                });
            }
        }, If);
        If.pop();
        Column.pop();
    }
    /**
     * 会话项组件
     */
    SessionItem(session: PrivateChatSession, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.padding({ left: 16, right: 16, top: 12, bottom: 12 });
            Row.backgroundColor('#FFFFFF');
            Row.margin({ bottom: 1 });
            Row.onClick(() => {
                this.goChat(session);
            });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 头像
            Stack.create();
            // 头像
            Stack.width(50);
            // 头像
            Stack.height(50);
        }, Stack);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Image.create(session.receiverAvatar || '');
            Image.width(50);
            Image.height(50);
            Image.borderRadius(25);
            Image.backgroundColor('#E8E8E8');
        }, Image);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 未读消息红点
            if (session.unread && session.unread > 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(session.unread > 99 ? '99+' : session.unread.toString());
                        Text.fontSize(10);
                        Text.fontColor('#FFFFFF');
                        Text.backgroundColor('#FF4D4F');
                        Text.borderRadius(10);
                        Text.padding({ left: 6, right: 6, top: 2, bottom: 2 });
                        Text.position({ x: 35, y: 0 });
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
        // 头像
        Stack.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 会话信息
            Column.create();
            // 会话信息
            Column.layoutWeight(1);
            // 会话信息
            Column.margin({ left: 12 });
            // 会话信息
            Column.alignItems(HorizontalAlign.Start);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(session.receiverUserName);
            Text.fontSize(16);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor('#333333');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(TimeUtil.formatTime(session.time));
            Text.fontSize(12);
            Text.fontColor('#CCCCCC');
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(session.preview || '暂无消息');
            Text.fontSize(14);
            Text.fontColor('#999999');
            Text.maxLines(1);
            Text.textOverflow({ overflow: TextOverflow.Ellipsis });
            Text.margin({ top: 6 });
        }, Text);
        Text.pop();
        // 会话信息
        Column.pop();
        Row.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "PrivateChatListPage";
    }
}
registerNamedRoute(() => new PrivateChatListPage(undefined, {}), "", { bundleName: "com.example.fishpi", moduleName: "entry", pagePath: "pages/PrivateChatListPage", pageFullPath: "entry/src/main/ets/pages/PrivateChatListPage", integratedHsp: "false", moduleType: "followWithHap" });
