if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface MessageBubble_Params {
    message?: ChatMessage | null;
    isSelf?: boolean;
    bubbleStyle?: BubbleStyle | null;
    isRedPacket?: boolean;
}
import type { ChatMessage, BubbleStyle } from '../model/Message';
import { MessageContent } from "@bundle:com.example.fishpi/entry/ets/components/MessageContent";
export class MessageBubble extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__message = new SynchedPropertyObjectOneWayPU(params.message, this, "message");
        this.__isSelf = new SynchedPropertySimpleOneWayPU(params.isSelf, this, "isSelf");
        this.__bubbleStyle = new SynchedPropertyObjectOneWayPU(params.bubbleStyle, this, "bubbleStyle");
        this.__isRedPacket = new SynchedPropertySimpleOneWayPU(params.isRedPacket, this, "isRedPacket");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: MessageBubble_Params) {
        if (params.message === undefined) {
            this.__message.set(null);
        }
        if (params.isSelf === undefined) {
            this.__isSelf.set(false);
        }
        if (params.bubbleStyle === undefined) {
            this.__bubbleStyle.set(null);
        }
        if (params.isRedPacket === undefined) {
            this.__isRedPacket.set(false);
        }
    }
    updateStateVars(params: MessageBubble_Params) {
        this.__message.reset(params.message);
        this.__isSelf.reset(params.isSelf);
        this.__bubbleStyle.reset(params.bubbleStyle);
        this.__isRedPacket.reset(params.isRedPacket);
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__message.purgeDependencyOnElmtId(rmElmtId);
        this.__isSelf.purgeDependencyOnElmtId(rmElmtId);
        this.__bubbleStyle.purgeDependencyOnElmtId(rmElmtId);
        this.__isRedPacket.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__message.aboutToBeDeleted();
        this.__isSelf.aboutToBeDeleted();
        this.__bubbleStyle.aboutToBeDeleted();
        this.__isRedPacket.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __message: SynchedPropertySimpleOneWayPU<ChatMessage | null>;
    get message() {
        return this.__message.get();
    }
    set message(newValue: ChatMessage | null) {
        this.__message.set(newValue);
    }
    private __isSelf: SynchedPropertySimpleOneWayPU<boolean>;
    get isSelf() {
        return this.__isSelf.get();
    }
    set isSelf(newValue: boolean) {
        this.__isSelf.set(newValue);
    }
    private __bubbleStyle: SynchedPropertySimpleOneWayPU<BubbleStyle | null>;
    get bubbleStyle() {
        return this.__bubbleStyle.get();
    }
    set bubbleStyle(newValue: BubbleStyle | null) {
        this.__bubbleStyle.set(newValue);
    }
    private __isRedPacket: SynchedPropertySimpleOneWayPU<boolean>;
    get isRedPacket() {
        return this.__isRedPacket.get();
    }
    set isRedPacket(newValue: boolean) {
        this.__isRedPacket.set(newValue);
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.alignItems(this.isSelf ? HorizontalAlign.End : HorizontalAlign.Start);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.message === null || this.bubbleStyle === null) {
                this.ifElseBranchUpdateFunction(0, () => {
                });
            }
            else if (this.isRedPacket) {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 红包消息样式
                        Row.create();
                        // 红包消息样式
                        Row.width('100%');
                        // 红包消息样式
                        Row.padding(12);
                        // 红包消息样式
                        Row.backgroundColor('#FFF1F0');
                        // 红包消息样式
                        Row.border({ width: 1, color: '#FF4D4F' });
                        // 红包消息样式
                        Row.borderRadius({
                            topLeft: this.bubbleStyle.topLeft,
                            topRight: this.bubbleStyle.topRight,
                            bottomLeft: this.bubbleStyle.bottomLeft,
                            bottomRight: this.bubbleStyle.bottomRight
                        });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Image.create({ "id": 125832351, "type": 40000, params: [], "bundleName": "com.example.fishpi", "moduleName": "entry" });
                        Image.width(24);
                        Image.height(24);
                        Image.margin({ right: 8 });
                    }, Image);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.alignItems(HorizontalAlign.Start);
                        Column.layoutWeight(1);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('红包');
                        Text.fontSize(15);
                        Text.fontColor('#FF4D4F');
                        Text.fontWeight(FontWeight.Medium);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        if (this.message.content) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create(this.message.content);
                                    Text.fontSize(13);
                                    Text.fontColor('#FF4D4F');
                                    Text.maxLines(2);
                                    Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                                    Text.margin({ top: 4 });
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
                    // 红包消息样式
                    Row.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(2, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 普通消息样式
                        Column.create();
                        // 普通消息样式
                        Column.padding({ left: 12, right: 12, top: 8, bottom: 8 });
                        // 普通消息样式
                        Column.backgroundColor(this.isSelf ? '#E3F2FD' : '#F0F0F0');
                        // 普通消息样式
                        Column.borderRadius({
                            topLeft: this.bubbleStyle.topLeft,
                            topRight: this.bubbleStyle.topRight,
                            bottomLeft: this.bubbleStyle.bottomLeft,
                            bottomRight: this.bubbleStyle.bottomRight
                        });
                        // 普通消息样式
                        Column.constraintSize({ maxWidth: '70%' });
                    }, Column);
                    {
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            if (isInitialRender) {
                                let componentCall = new MessageContent(this, {
                                    content: this.message.content,
                                    md: this.message.md
                                }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/components/MessageBubble.ets", line: 59, col: 11 });
                                ViewPU.create(componentCall);
                                let paramsLambda = () => {
                                    return {
                                        content: this.message.content,
                                        md: this.message.md
                                    };
                                };
                                componentCall.paramsGenerator_ = paramsLambda;
                            }
                            else {
                                this.updateStateVarsOfChildByElmtId(elmtId, {
                                    content: this.message.content,
                                    md: this.message.md
                                });
                            }
                        }, { name: "MessageContent" });
                    }
                    // 普通消息样式
                    Column.pop();
                });
            }
        }, If);
        If.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
