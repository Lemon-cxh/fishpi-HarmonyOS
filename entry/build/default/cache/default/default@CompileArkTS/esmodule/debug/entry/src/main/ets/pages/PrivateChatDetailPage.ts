if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface PrivateChatDetailPage_Params {
    messages?: PrivateMessage[];
    inputText?: string;
    isLoading?: boolean;
    isSending?: boolean;
    chatUserName?: string;
    chatUserAvatar?: string;
    currentUserName?: string;
    isFirstLoad?: boolean;
    topRectHeight?: number;
    scroller?: Scroller;
    wsManager?: PrivateChatWebSocket;
}
import { HttpUtil } from "@bundle:com.example.fishpi/entry/ets/util/HttpUtil";
import type { ApiResponse } from "@bundle:com.example.fishpi/entry/ets/util/HttpUtil";
import { StorageUtil } from "@bundle:com.example.fishpi/entry/ets/util/StorageUtil";
import { TimeUtil } from "@bundle:com.example.fishpi/entry/ets/util/TimeUtil";
import type { PrivateMessage, PrivateMessageListResponse } from '../model/Notification';
import { PrivateChatWebSocket } from "@bundle:com.example.fishpi/entry/ets/websocket/PrivateChatWebSocket";
class PrivateChatDetailPage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__messages = new ObservedPropertyObjectPU([], this, "messages");
        this.__inputText = new ObservedPropertySimplePU('', this, "inputText");
        this.__isLoading = new ObservedPropertySimplePU(false, this, "isLoading");
        this.__isSending = new ObservedPropertySimplePU(false, this, "isSending");
        this.__chatUserName = new ObservedPropertySimplePU('', this, "chatUserName");
        this.__chatUserAvatar = new ObservedPropertySimplePU('', this, "chatUserAvatar");
        this.__currentUserName = new ObservedPropertySimplePU('', this, "currentUserName");
        this.__isFirstLoad = new ObservedPropertySimplePU(true, this, "isFirstLoad");
        this.__topRectHeight = this.createStorageProp('topRectHeight', 0, "topRectHeight");
        this.scroller = new Scroller();
        this.wsManager = PrivateChatWebSocket.getInstance();
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: PrivateChatDetailPage_Params) {
        if (params.messages !== undefined) {
            this.messages = params.messages;
        }
        if (params.inputText !== undefined) {
            this.inputText = params.inputText;
        }
        if (params.isLoading !== undefined) {
            this.isLoading = params.isLoading;
        }
        if (params.isSending !== undefined) {
            this.isSending = params.isSending;
        }
        if (params.chatUserName !== undefined) {
            this.chatUserName = params.chatUserName;
        }
        if (params.chatUserAvatar !== undefined) {
            this.chatUserAvatar = params.chatUserAvatar;
        }
        if (params.currentUserName !== undefined) {
            this.currentUserName = params.currentUserName;
        }
        if (params.isFirstLoad !== undefined) {
            this.isFirstLoad = params.isFirstLoad;
        }
        if (params.scroller !== undefined) {
            this.scroller = params.scroller;
        }
        if (params.wsManager !== undefined) {
            this.wsManager = params.wsManager;
        }
    }
    updateStateVars(params: PrivateChatDetailPage_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__messages.purgeDependencyOnElmtId(rmElmtId);
        this.__inputText.purgeDependencyOnElmtId(rmElmtId);
        this.__isLoading.purgeDependencyOnElmtId(rmElmtId);
        this.__isSending.purgeDependencyOnElmtId(rmElmtId);
        this.__chatUserName.purgeDependencyOnElmtId(rmElmtId);
        this.__chatUserAvatar.purgeDependencyOnElmtId(rmElmtId);
        this.__currentUserName.purgeDependencyOnElmtId(rmElmtId);
        this.__isFirstLoad.purgeDependencyOnElmtId(rmElmtId);
        this.__topRectHeight.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__messages.aboutToBeDeleted();
        this.__inputText.aboutToBeDeleted();
        this.__isLoading.aboutToBeDeleted();
        this.__isSending.aboutToBeDeleted();
        this.__chatUserName.aboutToBeDeleted();
        this.__chatUserAvatar.aboutToBeDeleted();
        this.__currentUserName.aboutToBeDeleted();
        this.__isFirstLoad.aboutToBeDeleted();
        this.__topRectHeight.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __messages: ObservedPropertyObjectPU<PrivateMessage[]>;
    get messages() {
        return this.__messages.get();
    }
    set messages(newValue: PrivateMessage[]) {
        this.__messages.set(newValue);
    }
    private __inputText: ObservedPropertySimplePU<string>;
    get inputText() {
        return this.__inputText.get();
    }
    set inputText(newValue: string) {
        this.__inputText.set(newValue);
    }
    private __isLoading: ObservedPropertySimplePU<boolean>;
    get isLoading() {
        return this.__isLoading.get();
    }
    set isLoading(newValue: boolean) {
        this.__isLoading.set(newValue);
    }
    private __isSending: ObservedPropertySimplePU<boolean>;
    get isSending() {
        return this.__isSending.get();
    }
    set isSending(newValue: boolean) {
        this.__isSending.set(newValue);
    }
    private __chatUserName: ObservedPropertySimplePU<string>;
    get chatUserName() {
        return this.__chatUserName.get();
    }
    set chatUserName(newValue: string) {
        this.__chatUserName.set(newValue);
    }
    private __chatUserAvatar: ObservedPropertySimplePU<string>;
    get chatUserAvatar() {
        return this.__chatUserAvatar.get();
    }
    set chatUserAvatar(newValue: string) {
        this.__chatUserAvatar.set(newValue);
    }
    private __currentUserName: ObservedPropertySimplePU<string>;
    get currentUserName() {
        return this.__currentUserName.get();
    }
    set currentUserName(newValue: string) {
        this.__currentUserName.set(newValue);
    }
    private __isFirstLoad: ObservedPropertySimplePU<boolean>;
    get isFirstLoad() {
        return this.__isFirstLoad.get();
    }
    set isFirstLoad(newValue: boolean) {
        this.__isFirstLoad.set(newValue);
    }
    // 状态栏高度（用于避让）
    private __topRectHeight: ObservedPropertyAbstractPU<number>;
    get topRectHeight() {
        return this.__topRectHeight.get();
    }
    set topRectHeight(newValue: number) {
        this.__topRectHeight.set(newValue);
    }
    private scroller: Scroller;
    private wsManager: PrivateChatWebSocket;
    /**
     * 从路由参数获取聊天对象信息
     */
    async aboutToAppear(): Promise<void> {
        try {
            const params = this.getUIContext().getRouter().getParams() as Record<string, string>;
            this.chatUserName = params?.userName || '';
            this.chatUserAvatar = params?.avatar || '';
            // 获取当前用户名
            this.currentUserName = await StorageUtil.get(StorageUtil.KEY_USER_NAME);
            if (this.chatUserName) {
                // 加载历史消息
                await this.loadMessages();
                // 标记已读
                await this.markAsRead();
                // 连接WebSocket
                this.setupWebSocket();
            }
        }
        catch (err) {
            // 获取路由参数失败
        }
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
        this.wsManager.onMessage((msg: PrivateMessage) => {
            // 只处理当前聊天对象的消息
            if (msg.senderUserName === this.chatUserName) {
                this.messages.push(msg);
                // 滚动到底部 - 使用更可靠的方式
                this.scroller.scrollEdge(Edge.Bottom);
                // 标记已读
                this.markAsRead();
            }
        });
        // 连接WebSocket
        this.wsManager.connect(this.chatUserName);
    }
    /**
     * 加载历史消息
     */
    private async loadMessages(): Promise<void> {
        if (this.isLoading)
            return;
        this.isLoading = true;
        try {
            const params = new Map<string, string | number>();
            params.set('toUser', this.chatUserName);
            params.set('page', 1);
            params.set('pageSize', 50);
            const response = await HttpUtil.get<PrivateMessageListResponse>('/chat/get-message', params);
            if (response.code === 0 && response.data) {
                this.messages = response.data.reverse();
                // 首次加载完成，延迟滚动到底部
                if (this.isFirstLoad) {
                    setTimeout(() => {
                        this.scroller.scrollEdge(Edge.Bottom);
                        this.isFirstLoad = false;
                    }, 100);
                }
            }
        }
        catch (err) {
            // 加载私聊消息失败
        }
        finally {
            this.isLoading = false;
        }
    }
    /**
     * 标记消息已读
     */
    private async markAsRead(): Promise<void> {
        try {
            const params = new Map<string, string>();
            params.set('fromUser', this.chatUserName);
            await HttpUtil.get<ApiResponse>('/chat/mark-as-read', params);
        }
        catch (err) {
            // 标记已读失败
        }
    }
    /**
     * 发送消息
     */
    private async sendMessage(): Promise<void> {
        const content = this.inputText.trim();
        if (!content || this.isSending)
            return;
        this.isSending = true;
        try {
            // 通过WebSocket发送消息
            this.wsManager.send(content);
            // 本地添加消息
            const newMsg: PrivateMessage = {
                oId: Date.now().toString(),
                senderUserName: this.currentUserName,
                senderAvatar: '',
                content: content,
                time: new Date().toISOString(),
                type: 'msg'
            };
            this.messages.push(newMsg);
            this.inputText = '';
            // 滚动到底部 - 使用更可靠的方式
            this.scroller.scrollEdge(Edge.Bottom);
        }
        catch (err) {
            // 发送消息失败
        }
        finally {
            this.isSending = false;
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
            Column.create();
            Column.margin({ left: 16 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.chatUserName);
            Text.fontSize(18);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#333333');
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 更多操作
            Text.create('···');
            // 更多操作
            Text.fontSize(20);
            // 更多操作
            Text.fontColor('#666666');
            // 更多操作
            Text.padding(8);
        }, Text);
        // 更多操作
        Text.pop();
        // 顶部导航栏
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.isLoading && this.messages.length === 0) {
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
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 消息列表
                        List.create({ scroller: this.scroller });
                        // 消息列表
                        List.layoutWeight(1);
                        // 消息列表
                        List.width('100%');
                        // 消息列表
                        List.backgroundColor('#F5F5F5');
                    }, List);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = _item => {
                            const msg = _item;
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
                                    this.MessageItem.bind(this)(msg);
                                    ListItem.pop();
                                };
                                this.observeComponentCreation2(itemCreation2, ListItem);
                                ListItem.pop();
                            }
                        };
                        this.forEachUpdateFunction(elmtId, this.messages, forEachItemGenFunction, (msg: PrivateMessage) => msg.oId, false, false);
                    }, ForEach);
                    ForEach.pop();
                    // 消息列表
                    List.pop();
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
                        TextInput.create({ placeholder: '输入消息...', text: this.inputText });
                        TextInput.type(InputType.Normal);
                        TextInput.layoutWeight(1);
                        TextInput.height(40);
                        TextInput.backgroundColor('#F5F5F5');
                        TextInput.borderRadius(20);
                        TextInput.padding({ left: 16, right: 16 });
                        TextInput.onChange((value: string) => {
                            this.inputText = value;
                        });
                        TextInput.onSubmit(() => {
                            this.sendMessage();
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
                        Button.enabled(!this.isSending && this.inputText.trim().length > 0);
                        Button.onClick(() => {
                            this.sendMessage();
                        });
                    }, Button);
                    Button.pop();
                    // 输入区域
                    Row.pop();
                });
            }
        }, If);
        If.pop();
        Column.pop();
    }
    /**
     * 消息项组件
     */
    MessageItem(msg: PrivateMessage, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 判断是否是自己发送的消息
            Row.create();
            // 判断是否是自己发送的消息
            Row.width('100%');
            // 判断是否是自己发送的消息
            Row.padding({ left: 16, right: 16, top: 8, bottom: 8 });
            // 判断是否是自己发送的消息
            Row.alignItems(VerticalAlign.Top);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (msg.senderUserName === this.currentUserName) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 自己发送的消息 - 右对齐
                        Blank.create();
                    }, Blank);
                    // 自己发送的消息 - 右对齐
                    Blank.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.alignItems(HorizontalAlign.End);
                        Column.margin({ left: 60 });
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(msg.content);
                        Text.fontSize(15);
                        Text.fontColor('#FFFFFF');
                        Text.backgroundColor('#1890FF');
                        Text.padding({ left: 12, right: 12, top: 10, bottom: 10 });
                        Text.borderRadius(8);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(TimeUtil.formatTime(msg.time));
                        Text.fontSize(11);
                        Text.fontColor('#CCCCCC');
                        Text.margin({ top: 4 });
                    }, Text);
                    Text.pop();
                    Column.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 对方发送的消息 - 左对齐
                        Image.create(msg.senderAvatar || this.chatUserAvatar || '');
                        // 对方发送的消息 - 左对齐
                        Image.width(36);
                        // 对方发送的消息 - 左对齐
                        Image.height(36);
                        // 对方发送的消息 - 左对齐
                        Image.borderRadius(18);
                        // 对方发送的消息 - 左对齐
                        Image.backgroundColor('#E8E8E8');
                    }, Image);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.alignItems(HorizontalAlign.Start);
                        Column.margin({ left: 10 });
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(msg.content);
                        Text.fontSize(15);
                        Text.fontColor('#333333');
                        Text.backgroundColor('#FFFFFF');
                        Text.padding({ left: 12, right: 12, top: 10, bottom: 10 });
                        Text.borderRadius(8);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(TimeUtil.formatTime(msg.time));
                        Text.fontSize(11);
                        Text.fontColor('#CCCCCC');
                        Text.margin({ top: 4 });
                    }, Text);
                    Text.pop();
                    Column.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Blank.create();
                    }, Blank);
                    Blank.pop();
                });
            }
        }, If);
        If.pop();
        // 判断是否是自己发送的消息
        Row.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "PrivateChatDetailPage";
    }
}
registerNamedRoute(() => new PrivateChatDetailPage(undefined, {}), "", { bundleName: "com.example.fishpi", moduleName: "entry", pagePath: "pages/PrivateChatDetailPage", pageFullPath: "entry/src/main/ets/pages/PrivateChatDetailPage", integratedHsp: "false", moduleType: "followWithHap" });
