if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface ChatRoomPage_Params {
    messages?: ChatMessage[];
    messageGroups?: MessageGroup[];
    inputText?: string;
    onlineCount?: number;
    discuss?: string;
    isLoadingMore?: boolean;
    currentUserName?: string;
    isNearBottom?: boolean;
    isFirstLoad?: boolean;
    hasMoreMessages?: boolean;
    showScrollToBottom?: boolean;
    topRectHeight?: number;
    bottomRectHeight?: number;
    scroller?: Scroller;
    wsManager?: ChatRoomWebSocket;
    lastLoadTime?: number;
}
import router from "@ohos:router";
import { HttpUtil } from "@bundle:com.example.fishpi/entry/ets/util/HttpUtil";
import type { ApiResponse } from "@bundle:com.example.fishpi/entry/ets/util/HttpUtil";
import { StorageUtil } from "@bundle:com.example.fishpi/entry/ets/util/StorageUtil";
import type { ChatMessage, MessageListResponse, WsMessage, MessageGroup } from '../model/Message';
import { ChatRoomWebSocket } from "@bundle:com.example.fishpi/entry/ets/websocket/ChatRoomWebSocket";
import { MessageGroupComponent } from "@bundle:com.example.fishpi/entry/ets/components/MessageGroupComponent";
import { MessageGroupUtil } from "@bundle:com.example.fishpi/entry/ets/util/MessageGroupUtil";
class ChatRoomPage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__messages = new ObservedPropertyObjectPU([], this, "messages");
        this.__messageGroups = new ObservedPropertyObjectPU([], this, "messageGroups");
        this.__inputText = new ObservedPropertySimplePU('', this, "inputText");
        this.__onlineCount = new ObservedPropertySimplePU(0, this, "onlineCount");
        this.__discuss = new ObservedPropertySimplePU('', this, "discuss");
        this.__isLoadingMore = new ObservedPropertySimplePU(false, this, "isLoadingMore");
        this.__currentUserName = new ObservedPropertySimplePU('', this, "currentUserName");
        this.__isNearBottom = new ObservedPropertySimplePU(true, this, "isNearBottom");
        this.__isFirstLoad = new ObservedPropertySimplePU(true, this, "isFirstLoad");
        this.__hasMoreMessages = new ObservedPropertySimplePU(true, this, "hasMoreMessages");
        this.__showScrollToBottom = new ObservedPropertySimplePU(false, this, "showScrollToBottom");
        this.__topRectHeight = this.createStorageProp('topRectHeight', 0, "topRectHeight");
        this.__bottomRectHeight = this.createStorageProp('bottomRectHeight', 0, "bottomRectHeight");
        this.scroller = new Scroller();
        this.wsManager = ChatRoomWebSocket.getInstance();
        this.lastLoadTime = 0;
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: ChatRoomPage_Params) {
        if (params.messages !== undefined) {
            this.messages = params.messages;
        }
        if (params.messageGroups !== undefined) {
            this.messageGroups = params.messageGroups;
        }
        if (params.inputText !== undefined) {
            this.inputText = params.inputText;
        }
        if (params.onlineCount !== undefined) {
            this.onlineCount = params.onlineCount;
        }
        if (params.discuss !== undefined) {
            this.discuss = params.discuss;
        }
        if (params.isLoadingMore !== undefined) {
            this.isLoadingMore = params.isLoadingMore;
        }
        if (params.currentUserName !== undefined) {
            this.currentUserName = params.currentUserName;
        }
        if (params.isNearBottom !== undefined) {
            this.isNearBottom = params.isNearBottom;
        }
        if (params.isFirstLoad !== undefined) {
            this.isFirstLoad = params.isFirstLoad;
        }
        if (params.hasMoreMessages !== undefined) {
            this.hasMoreMessages = params.hasMoreMessages;
        }
        if (params.showScrollToBottom !== undefined) {
            this.showScrollToBottom = params.showScrollToBottom;
        }
        if (params.scroller !== undefined) {
            this.scroller = params.scroller;
        }
        if (params.wsManager !== undefined) {
            this.wsManager = params.wsManager;
        }
        if (params.lastLoadTime !== undefined) {
            this.lastLoadTime = params.lastLoadTime;
        }
    }
    updateStateVars(params: ChatRoomPage_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__messages.purgeDependencyOnElmtId(rmElmtId);
        this.__messageGroups.purgeDependencyOnElmtId(rmElmtId);
        this.__inputText.purgeDependencyOnElmtId(rmElmtId);
        this.__onlineCount.purgeDependencyOnElmtId(rmElmtId);
        this.__discuss.purgeDependencyOnElmtId(rmElmtId);
        this.__isLoadingMore.purgeDependencyOnElmtId(rmElmtId);
        this.__currentUserName.purgeDependencyOnElmtId(rmElmtId);
        this.__isNearBottom.purgeDependencyOnElmtId(rmElmtId);
        this.__isFirstLoad.purgeDependencyOnElmtId(rmElmtId);
        this.__hasMoreMessages.purgeDependencyOnElmtId(rmElmtId);
        this.__showScrollToBottom.purgeDependencyOnElmtId(rmElmtId);
        this.__topRectHeight.purgeDependencyOnElmtId(rmElmtId);
        this.__bottomRectHeight.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__messages.aboutToBeDeleted();
        this.__messageGroups.aboutToBeDeleted();
        this.__inputText.aboutToBeDeleted();
        this.__onlineCount.aboutToBeDeleted();
        this.__discuss.aboutToBeDeleted();
        this.__isLoadingMore.aboutToBeDeleted();
        this.__currentUserName.aboutToBeDeleted();
        this.__isNearBottom.aboutToBeDeleted();
        this.__isFirstLoad.aboutToBeDeleted();
        this.__hasMoreMessages.aboutToBeDeleted();
        this.__showScrollToBottom.aboutToBeDeleted();
        this.__topRectHeight.aboutToBeDeleted();
        this.__bottomRectHeight.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __messages: ObservedPropertyObjectPU<ChatMessage[]>;
    get messages() {
        return this.__messages.get();
    }
    set messages(newValue: ChatMessage[]) {
        this.__messages.set(newValue);
    }
    private __messageGroups: ObservedPropertyObjectPU<MessageGroup[]>;
    get messageGroups() {
        return this.__messageGroups.get();
    }
    set messageGroups(newValue: MessageGroup[]) {
        this.__messageGroups.set(newValue);
    }
    private __inputText: ObservedPropertySimplePU<string>;
    get inputText() {
        return this.__inputText.get();
    }
    set inputText(newValue: string) {
        this.__inputText.set(newValue);
    }
    private __onlineCount: ObservedPropertySimplePU<number>;
    get onlineCount() {
        return this.__onlineCount.get();
    }
    set onlineCount(newValue: number) {
        this.__onlineCount.set(newValue);
    }
    private __discuss: ObservedPropertySimplePU<string>;
    get discuss() {
        return this.__discuss.get();
    }
    set discuss(newValue: string) {
        this.__discuss.set(newValue);
    }
    private __isLoadingMore: ObservedPropertySimplePU<boolean>;
    get isLoadingMore() {
        return this.__isLoadingMore.get();
    }
    set isLoadingMore(newValue: boolean) {
        this.__isLoadingMore.set(newValue);
    }
    private __currentUserName: ObservedPropertySimplePU<string>;
    get currentUserName() {
        return this.__currentUserName.get();
    }
    set currentUserName(newValue: string) {
        this.__currentUserName.set(newValue);
    }
    private __isNearBottom: ObservedPropertySimplePU<boolean>;
    get isNearBottom() {
        return this.__isNearBottom.get();
    }
    set isNearBottom(newValue: boolean) {
        this.__isNearBottom.set(newValue);
    }
    private __isFirstLoad: ObservedPropertySimplePU<boolean>;
    get isFirstLoad() {
        return this.__isFirstLoad.get();
    }
    set isFirstLoad(newValue: boolean) {
        this.__isFirstLoad.set(newValue);
    }
    private __hasMoreMessages: ObservedPropertySimplePU<boolean>; // 是否还有更多历史消息
    get hasMoreMessages() {
        return this.__hasMoreMessages.get();
    }
    set hasMoreMessages(newValue: boolean) {
        this.__hasMoreMessages.set(newValue);
    }
    private __showScrollToBottom: ObservedPropertySimplePU<boolean>; // 是否显示"回到最新消息"按钮
    get showScrollToBottom() {
        return this.__showScrollToBottom.get();
    }
    set showScrollToBottom(newValue: boolean) {
        this.__showScrollToBottom.set(newValue);
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
    private scroller: Scroller;
    private wsManager: ChatRoomWebSocket;
    private lastLoadTime: number; // 上次加载时间，用于防抖
    /**
     * 页面出现时初始化
     */
    async aboutToAppear(): Promise<void> {
        // 获取当前用户名
        this.currentUserName = await StorageUtil.get(StorageUtil.KEY_USER_NAME);
        // 加载历史消息
        await this.loadMessages();
        // 连接WebSocket
        this.setupWebSocket();
    }
    /**
     * 更新消息分组
     */
    private updateMessageGroups(): void {
        this.messageGroups = MessageGroupUtil.groupMessages(this.messages, this.currentUserName);
    }
    /**
     * 页面消失时断开连接
     */
    aboutToDisappear(): void {
        this.wsManager.disconnect();
    }
    /**
     * 设置WebSocket回调
     */
    private setupWebSocket(): void {
        // 接收新消息
        this.wsManager.onMessage((msg: WsMessage) => {
            const newMsg: ChatMessage = {
                oId: msg.oId,
                userName: msg.userName,
                userAvatarURL: msg.userAvatarURL || '',
                content: msg.content || '',
                md: msg.md || '',
                time: msg.time || new Date().toISOString(),
                type: msg.type,
                client: ''
            };
            this.messages.push(newMsg);
            this.updateMessageGroups();
            // 自动滚动到底部
            if (this.isNearBottom) {
                this.scroller.scrollEdge(Edge.Bottom);
            }
        });
        // 在线人数更新
        this.wsManager.onOnline((count: number) => {
            this.onlineCount = count;
        });
        // 话题变更
        this.wsManager.onDiscuss((discuss: string) => {
            this.discuss = discuss;
        });
        // 撤回消息
        this.wsManager.onRevoke((oId: string) => {
            const index = this.messages.findIndex(m => m.oId === oId);
            if (index !== -1) {
                this.messages.splice(index, 1);
                this.updateMessageGroups();
            }
        });
        // 连接WebSocket
        this.wsManager.connect();
    }
    /**
     * 加载聊天消息
     */
    private async loadMessages(): Promise<void> {
        try {
            const params = new Map<string, number>();
            params.set('page', 1);
            const response = await HttpUtil.get<MessageListResponse>('/chat-room/more', params);
            if (response.code === 0 && response.data && Array.isArray(response.data)) {
                this.messages = response.data.reverse();
                this.updateMessageGroups();
                // 首次加载完成，延迟滚动到底部
                if (this.isFirstLoad) {
                    setTimeout(() => {
                        this.scroller.scrollEdge(Edge.Bottom);
                        this.isFirstLoad = false;
                    }, 200);
                }
            }
            else {
                this.messages = [];
                this.messageGroups = [];
            }
        }
        catch (err) {
            this.messages = [];
            this.messageGroups = [];
        }
    }
    /**
     * 加载更多历史消息
     */
    private async loadMoreMessages(): Promise<void> {
        // 防抖：距离上次加载至少间隔1秒
        const now = Date.now();
        if (this.isLoadingMore || this.messages.length === 0 ||
            !this.hasMoreMessages || now - this.lastLoadTime < 1000) {
            return;
        }
        this.isLoadingMore = true;
        this.lastLoadTime = now;
        // 记录当前滚动偏移量，用于加载后恢复位置
        const oldScrollOffset = this.scroller.currentOffset().yOffset;
        const oldFirstMsgOId = this.messages[0].oId;
        try {
            const params = new Map<string, string | number>();
            params.set('oId', this.messages[0].oId);
            params.set('mode', 1); // mode=1: 显示本条及之前的消息
            params.set('size', 20); // 加载20条历史消息
            const response = await HttpUtil.get<MessageListResponse>('/chat-room/getMessage', params);
            if (response.code === 0 && response.data && Array.isArray(response.data)) {
                // API 返回的是 [本条消息, 之前的消息...]
                // 需要过滤掉本条消息（第一条），只保留之前的历史消息
                const allMessages = response.data;
                const newMessages = allMessages.filter((msg: ChatMessage) => msg.oId !== oldFirstMsgOId);
                if (newMessages.length > 0) {
                    // 在消息数组前面插入新消息（新消息是按时间倒序的，需要反转）
                    this.messages = [...newMessages.reverse(), ...this.messages];
                    this.updateMessageGroups();
                    // 保持当前可视位置：等待布局完成后恢复滚动位置
                    setTimeout(() => {
                        // 使用 scrollTo 恢复到原来的滚动位置
                        // 这样可以精确保持用户视角不变
                        this.scroller.scrollTo({
                            xOffset: 0,
                            yOffset: oldScrollOffset
                        });
                    }, 100);
                }
                else {
                    // 没有更多消息了
                    this.hasMoreMessages = false;
                }
            }
            else {
                this.hasMoreMessages = false;
            }
        }
        finally {
            this.isLoadingMore = false;
        }
    }
    /**
     * 发送消息
     */
    private async sendMessage(): Promise<void> {
        const content = this.inputText.trim();
        if (!content)
            return;
        try {
            const params = new Map<string, string>();
            params.set('content', content);
            const response = await HttpUtil.post<ApiResponse>('/chat-room/send', params);
            if (response.code === 0) {
                this.inputText = '';
                // 发送后强制滚动到底部
                this.isNearBottom = true;
                this.scroller.scrollEdge(Edge.Bottom);
            }
        }
        catch (err) {
            // 发送失败
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
            // 顶部栏
            Row.create();
            // 顶部栏
            Row.width('100%');
            // 顶部栏
            Row.height(56);
            // 顶部栏
            Row.padding({ left: 16, right: 16 });
            // 顶部栏
            Row.backgroundColor('#FFFFFF');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 返回按钮
            Image.create({ "id": 125832663, "type": 40000, params: [], "bundleName": "com.example.fishpi", "moduleName": "entry" });
            // 返回按钮
            Image.width(24);
            // 返回按钮
            Image.height(24);
            // 返回按钮
            Image.onClick(() => {
                router.back();
            });
        }, Image);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.alignItems(HorizontalAlign.Start);
            Column.margin({ left: 12 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('聊天室');
            Text.fontSize(18);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#333333');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.onlineCount > 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(`${this.onlineCount}人在线`);
                        Text.fontSize(12);
                        Text.fontColor('#999999');
                        Text.margin({ top: 2 });
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
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.discuss) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(`#${this.discuss}#`);
                        Text.fontSize(14);
                        Text.fontColor('#1890FF');
                        Text.backgroundColor('#E6F7FF');
                        Text.padding({ left: 8, right: 8, top: 4, bottom: 4 });
                        Text.borderRadius(4);
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
        // 顶部栏
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 消息列表
            if (this.messageGroups.length === 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.layoutWeight(1);
                        Column.width('100%');
                        Column.justifyContent(FlexAlign.Center);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('暂无消息');
                        Text.fontSize(16);
                        Text.fontColor('#999999');
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('正在加载...');
                        Text.fontSize(14);
                        Text.fontColor('#CCCCCC');
                        Text.margin({ top: 8 });
                    }, Text);
                    Text.pop();
                    Column.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Stack.create({ alignContent: Alignment.BottomEnd });
                    }, Stack);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        List.create({ space: 0, scroller: this.scroller });
                        List.layoutWeight(1);
                        List.width('100%');
                        List.backgroundColor('#F5F5F5');
                        List.scrollBar(BarState.Off);
                        List.onScroll(() => {
                            if (!this.isFirstLoad) {
                                this.isNearBottom = false;
                                // 滚动时显示"回到最新消息"按钮
                                this.showScrollToBottom = true;
                            }
                        });
                        List.onReachStart(() => {
                            // 滚动到顶部时自动加载更多历史消息
                            if (!this.isFirstLoad && !this.isLoadingMore && this.hasMoreMessages) {
                                this.loadMoreMessages();
                            }
                        });
                        List.onReachEnd(() => {
                            this.isNearBottom = true;
                            // 滚动到底部时隐藏"回到最新消息"按钮
                            this.showScrollToBottom = false;
                        });
                    }, List);
                    {
                        const itemCreation = (elmtId, isInitialRender) => {
                            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                            ListItem.create(deepRenderFunction, true);
                            if (!isInitialRender) {
                                // 顶部状态提示
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
                                Row.padding(12);
                                Row.height(this.isLoadingMore || !this.hasMoreMessages ? 44 : 0);
                                Row.opacity(this.isLoadingMore || !this.hasMoreMessages ? 1 : 0);
                            }, Row);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                If.create();
                                if (this.isLoadingMore) {
                                    this.ifElseBranchUpdateFunction(0, () => {
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            // 加载中状态
                                            LoadingProgress.create();
                                            // 加载中状态
                                            LoadingProgress.width(20);
                                            // 加载中状态
                                            LoadingProgress.height(20);
                                            // 加载中状态
                                            LoadingProgress.color('#1890FF');
                                        }, LoadingProgress);
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Text.create('加载中...');
                                            Text.fontSize(14);
                                            Text.fontColor('#999999');
                                            Text.margin({ left: 8 });
                                        }, Text);
                                        Text.pop();
                                    });
                                }
                                else if (!this.hasMoreMessages && this.messages.length > 0) {
                                    this.ifElseBranchUpdateFunction(1, () => {
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            // 没有更多消息提示
                                            Text.create('没有更多历史消息了');
                                            // 没有更多消息提示
                                            Text.fontSize(14);
                                            // 没有更多消息提示
                                            Text.fontColor('#CCCCCC');
                                        }, Text);
                                        // 没有更多消息提示
                                        Text.pop();
                                    });
                                }
                                else {
                                    this.ifElseBranchUpdateFunction(2, () => {
                                    });
                                }
                            }, If);
                            If.pop();
                            Row.pop();
                            // 顶部状态提示
                            ListItem.pop();
                        };
                        this.observeComponentCreation2(itemCreation2, ListItem);
                        // 顶部状态提示
                        ListItem.pop();
                    }
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 消息组列表
                        ForEach.create();
                        const forEachItemGenFunction = (_item, index: number) => {
                            const group = _item;
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
                                    {
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            if (isInitialRender) {
                                                let componentCall = new MessageGroupComponent(this, { group: group }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/ChatRoomPage.ets", line: 316, col: 15 });
                                                ViewPU.create(componentCall);
                                                let paramsLambda = () => {
                                                    return {
                                                        group: group
                                                    };
                                                };
                                                componentCall.paramsGenerator_ = paramsLambda;
                                            }
                                            else {
                                                this.updateStateVarsOfChildByElmtId(elmtId, {
                                                    group: group
                                                });
                                            }
                                        }, { name: "MessageGroupComponent" });
                                    }
                                    ListItem.pop();
                                };
                                this.observeComponentCreation2(itemCreation2, ListItem);
                                ListItem.pop();
                            }
                        };
                        this.forEachUpdateFunction(elmtId, this.messageGroups, forEachItemGenFunction, (group: MessageGroup, index: number) => `${group.userId}_${index}`, true, true);
                    }, ForEach);
                    // 消息组列表
                    ForEach.pop();
                    {
                        const itemCreation = (elmtId, isInitialRender) => {
                            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                            ListItem.create(deepRenderFunction, true);
                            if (!isInitialRender) {
                                // 底部占位符
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
                                Column.height(20);
                            }, Column);
                            Column.pop();
                            // 底部占位符
                            ListItem.pop();
                        };
                        this.observeComponentCreation2(itemCreation2, ListItem);
                        // 底部占位符
                        ListItem.pop();
                    }
                    List.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        // "回到最新消息"悬浮按钮
                        if (this.showScrollToBottom) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Button.createWithChild({ type: ButtonType.Normal });
                                    Button.height(32);
                                    Button.backgroundColor('#FFFFFF');
                                    Button.borderRadius(16);
                                    Button.shadow({
                                        radius: 8,
                                        color: 'rgba(0, 0, 0, 0.1)',
                                        offsetX: 0,
                                        offsetY: 2
                                    });
                                    Button.padding({ left: 12, right: 12 });
                                    Button.margin({ right: 16, bottom: 16 });
                                    Button.onClick(() => {
                                        this.scroller.scrollEdge(Edge.Bottom);
                                        this.showScrollToBottom = false;
                                        this.isNearBottom = true;
                                    });
                                }, Button);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Row.create({ space: 6 });
                                }, Row);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create('↓');
                                    Text.fontSize(14);
                                    Text.fontColor('#1890FF');
                                    Text.fontWeight(FontWeight.Medium);
                                }, Text);
                                Text.pop();
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create('回到底部');
                                    Text.fontSize(13);
                                    Text.fontColor('#1890FF');
                                }, Text);
                                Text.pop();
                                Row.pop();
                                Button.pop();
                            });
                        }
                        else {
                            this.ifElseBranchUpdateFunction(1, () => {
                            });
                        }
                    }, If);
                    If.pop();
                    Stack.pop();
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 输入区域
            Row.create();
            // 输入区域
            Row.width('100%');
            // 输入区域
            Row.padding({ left: 16, right: 16, top: 8, bottom: 8 });
            // 输入区域
            Row.backgroundColor('#FFFFFF');
            // 输入区域
            Row.border({ width: { top: 0.5 }, color: '#E8E8E8' });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ text: { value: this.inputText, changeEvent: newValue => { this.inputText = newValue; } }, placeholder: '说点什么...' });
            TextInput.layoutWeight(1);
            TextInput.height(40);
            TextInput.backgroundColor('#F5F5F5');
            TextInput.borderRadius(20);
            TextInput.padding({ left: 16, right: 16 });
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('发送');
            Button.type(ButtonType.Capsule);
            Button.height(40);
            Button.width(70);
            Button.backgroundColor('#1890FF');
            Button.fontColor('#FFFFFF');
            Button.margin({ left: 12 });
            Button.onClick(() => {
                this.sendMessage();
            });
        }, Button);
        Button.pop();
        // 输入区域
        Row.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "ChatRoomPage";
    }
}
registerNamedRoute(() => new ChatRoomPage(undefined, {}), "", { bundleName: "com.example.fishpi", moduleName: "entry", pagePath: "pages/ChatRoomPage", pageFullPath: "entry/src/main/ets/pages/ChatRoomPage", integratedHsp: "false", moduleType: "followWithHap" });
