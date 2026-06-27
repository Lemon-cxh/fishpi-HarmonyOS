if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface MessageGroupComponent_Params {
    group?: MsgGroup | null;
}
import type { MessageGroup as MsgGroup, ChatMessage } from '../model/Message';
import { TimeDivider } from "@bundle:com.example.fishpi/entry/ets/components/TimeDivider";
import { MessageBubble } from "@bundle:com.example.fishpi/entry/ets/components/MessageBubble";
import { MessageGroupUtil } from "@bundle:com.example.fishpi/entry/ets/util/MessageGroupUtil";
export class MessageGroupComponent extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__group = new SynchedPropertyObjectOneWayPU(params.group, this, "group");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: MessageGroupComponent_Params) {
        if (params.group === undefined) {
            this.__group.set(null);
        }
    }
    updateStateVars(params: MessageGroupComponent_Params) {
        this.__group.reset(params.group);
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__group.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__group.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __group: SynchedPropertySimpleOneWayPU<MsgGroup | null>;
    get group() {
        return this.__group.get();
    }
    set group(newValue: MsgGroup | null) {
        this.__group.set(newValue);
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.margin({ bottom: 12 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.group === null) {
                this.ifElseBranchUpdateFunction(0, () => {
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        // 时间分隔线
                        if (this.group.showTime) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                {
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        if (isInitialRender) {
                                            let componentCall = new TimeDivider(this, { timeLabel: this.group.timeLabel }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/components/MessageGroupComponent.ets", line: 21, col: 11 });
                                            ViewPU.create(componentCall);
                                            let paramsLambda = () => {
                                                return {
                                                    timeLabel: this.group.timeLabel
                                                };
                                            };
                                            componentCall.paramsGenerator_ = paramsLambda;
                                        }
                                        else {
                                            this.updateStateVarsOfChildByElmtId(elmtId, {
                                                timeLabel: this.group.timeLabel
                                            });
                                        }
                                    }, { name: "TimeDivider" });
                                }
                            });
                        }
                        // 消息组内容
                        else {
                            this.ifElseBranchUpdateFunction(1, () => {
                            });
                        }
                    }, If);
                    If.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        // 消息组内容
                        if (this.group.isSelf) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    // 自己的消息：消息和头像都在右侧
                                    Row.create();
                                    // 自己的消息：消息和头像都在右侧
                                    Row.width('100%');
                                    // 自己的消息：消息和头像都在右侧
                                    Row.alignItems(VerticalAlign.Top);
                                    // 自己的消息：消息和头像都在右侧
                                    Row.padding({ left: 16, right: 16 });
                                }, Row);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    // 左侧空白区域
                                    Blank.create();
                                    // 左侧空白区域
                                    Blank.layoutWeight(1);
                                }, Blank);
                                // 左侧空白区域
                                Blank.pop();
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    // 右侧消息区域
                                    Column.create();
                                    // 右侧消息区域
                                    Column.alignItems(HorizontalAlign.End);
                                    // 右侧消息区域
                                    Column.constraintSize({ minWidth: 100, maxWidth: 280 });
                                    // 右侧消息区域
                                    Column.margin({ right: 12 });
                                }, Column);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    // 用户名
                                    Text.create(this.group.userName);
                                    // 用户名
                                    Text.fontSize(14);
                                    // 用户名
                                    Text.fontWeight(FontWeight.Medium);
                                    // 用户名
                                    Text.fontColor('#1890FF');
                                    // 用户名
                                    Text.margin({ bottom: 4 });
                                }, Text);
                                // 用户名
                                Text.pop();
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    // 消息气泡组
                                    Column.create({ space: 4 });
                                    // 消息气泡组
                                    Column.alignItems(HorizontalAlign.End);
                                    // 消息气泡组
                                    Column.width('100%');
                                }, Column);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    ForEach.create();
                                    const forEachItemGenFunction = (_item, index: number) => {
                                        const msg = _item;
                                        {
                                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                if (isInitialRender) {
                                                    let componentCall = new MessageBubble(this, {
                                                        message: msg,
                                                        isSelf: true,
                                                        bubbleStyle: MessageGroupUtil.getBubbleStyle(index as number, this.group!.messages.length, true),
                                                        isRedPacket: MessageGroupUtil.isRedPacketMessage(msg)
                                                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/components/MessageGroupComponent.ets", line: 44, col: 19 });
                                                    ViewPU.create(componentCall);
                                                    let paramsLambda = () => {
                                                        return {
                                                            message: msg,
                                                            isSelf: true,
                                                            bubbleStyle: MessageGroupUtil.getBubbleStyle(index as number, this.group!.messages.length, true),
                                                            isRedPacket: MessageGroupUtil.isRedPacketMessage(msg)
                                                        };
                                                    };
                                                    componentCall.paramsGenerator_ = paramsLambda;
                                                }
                                                else {
                                                    this.updateStateVarsOfChildByElmtId(elmtId, {
                                                        message: msg,
                                                        isSelf: true,
                                                        bubbleStyle: MessageGroupUtil.getBubbleStyle(index as number, this.group!.messages.length, true),
                                                        isRedPacket: MessageGroupUtil.isRedPacketMessage(msg)
                                                    });
                                                }
                                            }, { name: "MessageBubble" });
                                        }
                                    };
                                    this.forEachUpdateFunction(elmtId, this.group.messages, forEachItemGenFunction, (msg: ChatMessage) => msg.oId, true, false);
                                }, ForEach);
                                ForEach.pop();
                                // 消息气泡组
                                Column.pop();
                                // 右侧消息区域
                                Column.pop();
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    // 头像
                                    Image.create(this.group.userAvatarURL || '');
                                    // 头像
                                    Image.width(40);
                                    // 头像
                                    Image.height(40);
                                    // 头像
                                    Image.borderRadius(20);
                                    // 头像
                                    Image.backgroundColor('#E8E8E8');
                                }, Image);
                                // 自己的消息：消息和头像都在右侧
                                Row.pop();
                            });
                        }
                        else {
                            this.ifElseBranchUpdateFunction(1, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    // 他人的消息：头像在左，消息在右
                                    Row.create();
                                    // 他人的消息：头像在左，消息在右
                                    Row.width('100%');
                                    // 他人的消息：头像在左，消息在右
                                    Row.alignItems(VerticalAlign.Top);
                                    // 他人的消息：头像在左，消息在右
                                    Row.padding({ left: 16, right: 16 });
                                }, Row);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    // 头像
                                    Image.create(this.group.userAvatarURL || '');
                                    // 头像
                                    Image.width(40);
                                    // 头像
                                    Image.height(40);
                                    // 头像
                                    Image.borderRadius(20);
                                    // 头像
                                    Image.backgroundColor('#E8E8E8');
                                }, Image);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Column.create();
                                    Column.layoutWeight(1);
                                    Column.alignItems(HorizontalAlign.Start);
                                    Column.margin({ left: 12 });
                                }, Column);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    // 用户名
                                    Text.create(this.group.userName);
                                    // 用户名
                                    Text.fontSize(14);
                                    // 用户名
                                    Text.fontWeight(FontWeight.Medium);
                                    // 用户名
                                    Text.fontColor('#333333');
                                    // 用户名
                                    Text.margin({ bottom: 4 });
                                }, Text);
                                // 用户名
                                Text.pop();
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    // 消息气泡组
                                    Column.create({ space: 4 });
                                    // 消息气泡组
                                    Column.alignItems(HorizontalAlign.Start);
                                }, Column);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    ForEach.create();
                                    const forEachItemGenFunction = (_item, index: number) => {
                                        const msg = _item;
                                        {
                                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                if (isInitialRender) {
                                                    let componentCall = new MessageBubble(this, {
                                                        message: msg,
                                                        isSelf: false,
                                                        bubbleStyle: MessageGroupUtil.getBubbleStyle(index as number, this.group!.messages.length, false),
                                                        isRedPacket: MessageGroupUtil.isRedPacketMessage(msg)
                                                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/components/MessageGroupComponent.ets", line: 94, col: 19 });
                                                    ViewPU.create(componentCall);
                                                    let paramsLambda = () => {
                                                        return {
                                                            message: msg,
                                                            isSelf: false,
                                                            bubbleStyle: MessageGroupUtil.getBubbleStyle(index as number, this.group!.messages.length, false),
                                                            isRedPacket: MessageGroupUtil.isRedPacketMessage(msg)
                                                        };
                                                    };
                                                    componentCall.paramsGenerator_ = paramsLambda;
                                                }
                                                else {
                                                    this.updateStateVarsOfChildByElmtId(elmtId, {
                                                        message: msg,
                                                        isSelf: false,
                                                        bubbleStyle: MessageGroupUtil.getBubbleStyle(index as number, this.group!.messages.length, false),
                                                        isRedPacket: MessageGroupUtil.isRedPacketMessage(msg)
                                                    });
                                                }
                                            }, { name: "MessageBubble" });
                                        }
                                    };
                                    this.forEachUpdateFunction(elmtId, this.group.messages, forEachItemGenFunction, (msg: ChatMessage) => msg.oId, true, false);
                                }, ForEach);
                                ForEach.pop();
                                // 消息气泡组
                                Column.pop();
                                Column.pop();
                                // 他人的消息：头像在左，消息在右
                                Row.pop();
                            });
                        }
                    }, If);
                    If.pop();
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
