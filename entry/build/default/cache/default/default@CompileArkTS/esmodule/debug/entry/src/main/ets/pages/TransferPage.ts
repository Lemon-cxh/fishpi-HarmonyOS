if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface TransferPage_Params {
    toUser?: string;
    amount?: string;
    memo?: string;
    isLoading?: boolean;
    errorMessage?: string;
    successMessage?: string;
    topRectHeight?: number;
}
import { HttpUtil } from "@bundle:com.example.fishpi/entry/ets/util/HttpUtil";
import type { ApiResponse } from "@bundle:com.example.fishpi/entry/ets/util/HttpUtil";
class TransferPage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__toUser = new ObservedPropertySimplePU('', this, "toUser");
        this.__amount = new ObservedPropertySimplePU('', this, "amount");
        this.__memo = new ObservedPropertySimplePU('', this, "memo");
        this.__isLoading = new ObservedPropertySimplePU(false, this, "isLoading");
        this.__errorMessage = new ObservedPropertySimplePU('', this, "errorMessage");
        this.__successMessage = new ObservedPropertySimplePU('', this, "successMessage");
        this.__topRectHeight = this.createStorageProp('topRectHeight', 0, "topRectHeight");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: TransferPage_Params) {
        if (params.toUser !== undefined) {
            this.toUser = params.toUser;
        }
        if (params.amount !== undefined) {
            this.amount = params.amount;
        }
        if (params.memo !== undefined) {
            this.memo = params.memo;
        }
        if (params.isLoading !== undefined) {
            this.isLoading = params.isLoading;
        }
        if (params.errorMessage !== undefined) {
            this.errorMessage = params.errorMessage;
        }
        if (params.successMessage !== undefined) {
            this.successMessage = params.successMessage;
        }
    }
    updateStateVars(params: TransferPage_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__toUser.purgeDependencyOnElmtId(rmElmtId);
        this.__amount.purgeDependencyOnElmtId(rmElmtId);
        this.__memo.purgeDependencyOnElmtId(rmElmtId);
        this.__isLoading.purgeDependencyOnElmtId(rmElmtId);
        this.__errorMessage.purgeDependencyOnElmtId(rmElmtId);
        this.__successMessage.purgeDependencyOnElmtId(rmElmtId);
        this.__topRectHeight.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__toUser.aboutToBeDeleted();
        this.__amount.aboutToBeDeleted();
        this.__memo.aboutToBeDeleted();
        this.__isLoading.aboutToBeDeleted();
        this.__errorMessage.aboutToBeDeleted();
        this.__successMessage.aboutToBeDeleted();
        this.__topRectHeight.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __toUser: ObservedPropertySimplePU<string>;
    get toUser() {
        return this.__toUser.get();
    }
    set toUser(newValue: string) {
        this.__toUser.set(newValue);
    }
    private __amount: ObservedPropertySimplePU<string>;
    get amount() {
        return this.__amount.get();
    }
    set amount(newValue: string) {
        this.__amount.set(newValue);
    }
    private __memo: ObservedPropertySimplePU<string>;
    get memo() {
        return this.__memo.get();
    }
    set memo(newValue: string) {
        this.__memo.set(newValue);
    }
    private __isLoading: ObservedPropertySimplePU<boolean>;
    get isLoading() {
        return this.__isLoading.get();
    }
    set isLoading(newValue: boolean) {
        this.__isLoading.set(newValue);
    }
    private __errorMessage: ObservedPropertySimplePU<string>;
    get errorMessage() {
        return this.__errorMessage.get();
    }
    set errorMessage(newValue: string) {
        this.__errorMessage.set(newValue);
    }
    private __successMessage: ObservedPropertySimplePU<string>;
    get successMessage() {
        return this.__successMessage.get();
    }
    set successMessage(newValue: string) {
        this.__successMessage.set(newValue);
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
     * 执行转账
     */
    private async transfer(): Promise<void> {
        // 验证输入
        if (!this.toUser.trim()) {
            this.errorMessage = '请输入接收方用户名';
            return;
        }
        const amountNum = Number(this.amount);
        if (!amountNum || amountNum <= 0) {
            this.errorMessage = '请输入有效的转账金额';
            return;
        }
        this.isLoading = true;
        this.errorMessage = '';
        this.successMessage = '';
        try {
            const params = new Map<string, string | number>();
            params.set('toUser', this.toUser.trim());
            params.set('amount', amountNum);
            params.set('memo', this.memo.trim());
            const response = await HttpUtil.post<ApiResponse>('/point/transfer', params);
            if (response.code === 0) {
                this.successMessage = '转账成功！';
                this.toUser = '';
                this.amount = '';
                this.memo = '';
            }
            else {
                this.errorMessage = response.msg || '转账失败';
            }
        }
        catch (err) {
            this.errorMessage = '网络错误，请稍后重试';
        }
        finally {
            this.isLoading = false;
        }
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor('#FFFFFF');
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
                    // 返回失败
                }
            });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('积分转账');
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
            // 表单内容
            Column.create();
            // 表单内容
            Column.width('100%');
            // 表单内容
            Column.padding(16);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 接收方
            Column.create();
            // 接收方
            Column.width('100%');
            // 接收方
            Column.margin({ bottom: 20 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('接收方用户名');
            Text.fontSize(14);
            Text.fontColor('#666666');
            Text.margin({ bottom: 8 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ placeholder: '请输入用户名', text: this.toUser });
            TextInput.type(InputType.Normal);
            TextInput.height(44);
            TextInput.width('100%');
            TextInput.backgroundColor('#F5F5F5');
            TextInput.borderRadius(8);
            TextInput.padding({ left: 12, right: 12 });
            TextInput.onChange((value: string) => {
                this.toUser = value;
            });
        }, TextInput);
        // 接收方
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 转账金额
            Column.create();
            // 转账金额
            Column.width('100%');
            // 转账金额
            Column.margin({ bottom: 20 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('转账金额');
            Text.fontSize(14);
            Text.fontColor('#666666');
            Text.margin({ bottom: 8 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ placeholder: '请输入积分数量', text: this.amount });
            TextInput.type(InputType.Number);
            TextInput.height(44);
            TextInput.width('100%');
            TextInput.backgroundColor('#F5F5F5');
            TextInput.borderRadius(8);
            TextInput.padding({ left: 12, right: 12 });
            TextInput.onChange((value: string) => {
                this.amount = value;
            });
        }, TextInput);
        // 转账金额
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 备注
            Column.create();
            // 备注
            Column.width('100%');
            // 备注
            Column.margin({ bottom: 20 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('备注（可选）');
            Text.fontSize(14);
            Text.fontColor('#666666');
            Text.margin({ bottom: 8 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ placeholder: '请输入转账备注', text: this.memo });
            TextInput.type(InputType.Normal);
            TextInput.height(44);
            TextInput.width('100%');
            TextInput.backgroundColor('#F5F5F5');
            TextInput.borderRadius(8);
            TextInput.padding({ left: 12, right: 12 });
            TextInput.onChange((value: string) => {
                this.memo = value;
            });
        }, TextInput);
        // 备注
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 错误提示
            if (this.errorMessage) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.errorMessage);
                        Text.fontSize(14);
                        Text.fontColor('#FF4D4F');
                        Text.margin({ bottom: 16 });
                    }, Text);
                    Text.pop();
                });
            }
            // 成功提示
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 成功提示
            if (this.successMessage) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.successMessage);
                        Text.fontSize(14);
                        Text.fontColor('#52C41A');
                        Text.margin({ bottom: 16 });
                    }, Text);
                    Text.pop();
                });
            }
            // 转账按钮
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 转账按钮
            Button.createWithLabel(this.isLoading ? '转账中...' : '确认转账');
            // 转账按钮
            Button.type(ButtonType.Capsule);
            // 转账按钮
            Button.width('100%');
            // 转账按钮
            Button.height(48);
            // 转账按钮
            Button.backgroundColor('#1890FF');
            // 转账按钮
            Button.fontColor('#FFFFFF');
            // 转账按钮
            Button.fontSize(16);
            // 转账按钮
            Button.enabled(!this.isLoading);
            // 转账按钮
            Button.onClick(() => {
                this.transfer();
            });
        }, Button);
        // 转账按钮
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 提示信息
            Text.create('转账操作不可撤销，请确认信息无误后再进行转账');
            // 提示信息
            Text.fontSize(12);
            // 提示信息
            Text.fontColor('#999999');
            // 提示信息
            Text.margin({ top: 16 });
        }, Text);
        // 提示信息
        Text.pop();
        // 表单内容
        Column.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "TransferPage";
    }
}
registerNamedRoute(() => new TransferPage(undefined, {}), "", { bundleName: "com.example.fishpi", moduleName: "entry", pagePath: "pages/TransferPage", pageFullPath: "entry/src/main/ets/pages/TransferPage", integratedHsp: "false", moduleType: "followWithHap" });
