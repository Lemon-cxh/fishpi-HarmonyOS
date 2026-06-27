if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface RegisterPage_Params {
    userName?: string;
    userPass?: string;
    confirmPass?: string;
    isLoading?: boolean;
    errorMsg?: string;
    topRectHeight?: number;
}
import { HttpUtil } from "@bundle:com.example.fishpi/entry/ets/util/HttpUtil";
import type { ApiResponse } from "@bundle:com.example.fishpi/entry/ets/util/HttpUtil";
import { Logger } from "@bundle:com.example.fishpi/entry/ets/util/Logger";
class RegisterPage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__userName = new ObservedPropertySimplePU('', this, "userName");
        this.__userPass = new ObservedPropertySimplePU('', this, "userPass");
        this.__confirmPass = new ObservedPropertySimplePU('', this, "confirmPass");
        this.__isLoading = new ObservedPropertySimplePU(false, this, "isLoading");
        this.__errorMsg = new ObservedPropertySimplePU('', this, "errorMsg");
        this.__topRectHeight = this.createStorageProp('topRectHeight', 0, "topRectHeight");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: RegisterPage_Params) {
        if (params.userName !== undefined) {
            this.userName = params.userName;
        }
        if (params.userPass !== undefined) {
            this.userPass = params.userPass;
        }
        if (params.confirmPass !== undefined) {
            this.confirmPass = params.confirmPass;
        }
        if (params.isLoading !== undefined) {
            this.isLoading = params.isLoading;
        }
        if (params.errorMsg !== undefined) {
            this.errorMsg = params.errorMsg;
        }
    }
    updateStateVars(params: RegisterPage_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__userName.purgeDependencyOnElmtId(rmElmtId);
        this.__userPass.purgeDependencyOnElmtId(rmElmtId);
        this.__confirmPass.purgeDependencyOnElmtId(rmElmtId);
        this.__isLoading.purgeDependencyOnElmtId(rmElmtId);
        this.__errorMsg.purgeDependencyOnElmtId(rmElmtId);
        this.__topRectHeight.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__userName.aboutToBeDeleted();
        this.__userPass.aboutToBeDeleted();
        this.__confirmPass.aboutToBeDeleted();
        this.__isLoading.aboutToBeDeleted();
        this.__errorMsg.aboutToBeDeleted();
        this.__topRectHeight.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __userName: ObservedPropertySimplePU<string>;
    get userName() {
        return this.__userName.get();
    }
    set userName(newValue: string) {
        this.__userName.set(newValue);
    }
    private __userPass: ObservedPropertySimplePU<string>;
    get userPass() {
        return this.__userPass.get();
    }
    set userPass(newValue: string) {
        this.__userPass.set(newValue);
    }
    private __confirmPass: ObservedPropertySimplePU<string>;
    get confirmPass() {
        return this.__confirmPass.get();
    }
    set confirmPass(newValue: string) {
        this.__confirmPass.set(newValue);
    }
    private __isLoading: ObservedPropertySimplePU<boolean>;
    get isLoading() {
        return this.__isLoading.get();
    }
    set isLoading(newValue: boolean) {
        this.__isLoading.set(newValue);
    }
    private __errorMsg: ObservedPropertySimplePU<string>;
    get errorMsg() {
        return this.__errorMsg.get();
    }
    set errorMsg(newValue: string) {
        this.__errorMsg.set(newValue);
    }
    // 状态栏高度（用于避让）
    private __topRectHeight: ObservedPropertyAbstractPU<number>;
    get topRectHeight() {
        return this.__topRectHeight.get();
    }
    set topRectHeight(newValue: number) {
        this.__topRectHeight.set(newValue);
    }
    async handleRegister(): Promise<void> {
        if (!this.userName || !this.userPass || !this.confirmPass) {
            this.errorMsg = '请填写完整信息';
            return;
        }
        if (this.userPass !== this.confirmPass) {
            this.errorMsg = '两次密码不一致';
            return;
        }
        this.isLoading = true;
        this.errorMsg = '';
        try {
            const registerData = new Map<string, string>();
            registerData.set('userName', this.userName);
            registerData.set('userPass', this.userPass);
            const response = await HttpUtil.post<ApiResponse>('/api/register', registerData);
            if (HttpUtil.isSuccess(response)) {
                Logger.info('RegisterPage', '注册成功');
                try {
                    this.getUIContext().getRouter().back();
                }
                catch (err) {
                    Logger.error('RegisterPage', 'Router back failed: ' + String(err));
                }
            }
            else {
                this.errorMsg = response.msg || '注册失败';
            }
        }
        catch (err) {
            Logger.error('RegisterPage', '注册请求失败: ' + String(err));
            this.errorMsg = '网络错误，请重试';
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
            Column.backgroundColor('#F5F5F5');
            Column.padding({ top: this.getUIContext().px2vp(this.topRectHeight) });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 标题
            Text.create('注册账号');
            // 标题
            Text.fontSize(28);
            // 标题
            Text.fontWeight(FontWeight.Bold);
            // 标题
            Text.margin({ top: 80, bottom: 40 });
        }, Text);
        // 标题
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 用户名输入框
            TextInput.create({ placeholder: '用户名' });
            // 用户名输入框
            TextInput.width('80%');
            // 用户名输入框
            TextInput.height(50);
            // 用户名输入框
            TextInput.margin({ bottom: 20 });
            // 用户名输入框
            TextInput.onChange((value: string) => {
                this.userName = value;
            });
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 密码输入框
            TextInput.create({ placeholder: '密码' });
            // 密码输入框
            TextInput.width('80%');
            // 密码输入框
            TextInput.height(50);
            // 密码输入框
            TextInput.type(InputType.Password);
            // 密码输入框
            TextInput.margin({ bottom: 20 });
            // 密码输入框
            TextInput.onChange((value: string) => {
                this.userPass = value;
            });
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 确认密码输入框
            TextInput.create({ placeholder: '确认密码' });
            // 确认密码输入框
            TextInput.width('80%');
            // 确认密码输入框
            TextInput.height(50);
            // 确认密码输入框
            TextInput.type(InputType.Password);
            // 确认密码输入框
            TextInput.margin({ bottom: 20 });
            // 确认密码输入框
            TextInput.onChange((value: string) => {
                this.confirmPass = value;
            });
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 错误提示
            if (this.errorMsg) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.errorMsg);
                        Text.fontColor(Color.Red);
                        Text.fontSize(14);
                        Text.margin({ bottom: 20 });
                    }, Text);
                    Text.pop();
                });
            }
            // 注册按钮
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 注册按钮
            Button.createWithLabel(this.isLoading ? '注册中...' : '注册');
            // 注册按钮
            Button.width('80%');
            // 注册按钮
            Button.height(50);
            // 注册按钮
            Button.enabled(!this.isLoading);
            // 注册按钮
            Button.onClick(() => {
                this.handleRegister();
            });
            // 注册按钮
            Button.margin({ bottom: 20 });
        }, Button);
        // 注册按钮
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 返回登录
            Text.create('已有账号？返回登录');
            // 返回登录
            Text.fontColor('#1890FF');
            // 返回登录
            Text.fontSize(14);
            // 返回登录
            Text.onClick(() => {
                try {
                    this.getUIContext().getRouter().back();
                }
                catch (err) {
                    Logger.error('RegisterPage', 'Router back failed: ' + String(err));
                }
            });
        }, Text);
        // 返回登录
        Text.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "RegisterPage";
    }
}
registerNamedRoute(() => new RegisterPage(undefined, {}), "", { bundleName: "com.example.fishpi", moduleName: "entry", pagePath: "pages/RegisterPage", pageFullPath: "entry/src/main/ets/pages/RegisterPage", integratedHsp: "false", moduleType: "followWithHap" });
