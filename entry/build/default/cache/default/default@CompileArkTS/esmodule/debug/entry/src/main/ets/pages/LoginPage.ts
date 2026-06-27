if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface LoginPage_Params {
    username?: string;
    password?: string;
    isLoading?: boolean;
    errorMessage?: string;
    isPressed?: boolean;
    isDark?: boolean;
    colors?: ColorScheme;
    topRectHeight?: number;
}
import { HttpUtil } from "@bundle:com.example.fishpi/entry/ets/util/HttpUtil";
import { StorageUtil } from "@bundle:com.example.fishpi/entry/ets/util/StorageUtil";
import { ThemeUtil, LightColorScheme, DarkColorScheme } from "@bundle:com.example.fishpi/entry/ets/util/ThemeUtil";
import type { ColorScheme } from "@bundle:com.example.fishpi/entry/ets/util/ThemeUtil";
import { CryptoUtil } from "@bundle:com.example.fishpi/entry/ets/util/CryptoUtil";
import type { LoginResponse, UserInfoResponse } from '../model/User';
import { Spacing, BorderRadius, FontSize, ComponentSize, AnimationDuration } from "@bundle:com.example.fishpi/entry/ets/constants/DesignTokens";
import hilog from "@ohos:hilog";
class LoginPage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__username = new ObservedPropertySimplePU('', this, "username");
        this.__password = new ObservedPropertySimplePU('', this, "password");
        this.__isLoading = new ObservedPropertySimplePU(false, this, "isLoading");
        this.__errorMessage = new ObservedPropertySimplePU('', this, "errorMessage");
        this.__isPressed = new ObservedPropertySimplePU(false, this, "isPressed");
        this.__isDark = new ObservedPropertySimplePU(false, this, "isDark");
        this.__colors = new ObservedPropertyObjectPU(LightColorScheme, this, "colors");
        this.__topRectHeight = this.createStorageProp('topRectHeight', 0, "topRectHeight");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: LoginPage_Params) {
        if (params.username !== undefined) {
            this.username = params.username;
        }
        if (params.password !== undefined) {
            this.password = params.password;
        }
        if (params.isLoading !== undefined) {
            this.isLoading = params.isLoading;
        }
        if (params.errorMessage !== undefined) {
            this.errorMessage = params.errorMessage;
        }
        if (params.isPressed !== undefined) {
            this.isPressed = params.isPressed;
        }
        if (params.isDark !== undefined) {
            this.isDark = params.isDark;
        }
        if (params.colors !== undefined) {
            this.colors = params.colors;
        }
    }
    updateStateVars(params: LoginPage_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__username.purgeDependencyOnElmtId(rmElmtId);
        this.__password.purgeDependencyOnElmtId(rmElmtId);
        this.__isLoading.purgeDependencyOnElmtId(rmElmtId);
        this.__errorMessage.purgeDependencyOnElmtId(rmElmtId);
        this.__isPressed.purgeDependencyOnElmtId(rmElmtId);
        this.__isDark.purgeDependencyOnElmtId(rmElmtId);
        this.__colors.purgeDependencyOnElmtId(rmElmtId);
        this.__topRectHeight.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__username.aboutToBeDeleted();
        this.__password.aboutToBeDeleted();
        this.__isLoading.aboutToBeDeleted();
        this.__errorMessage.aboutToBeDeleted();
        this.__isPressed.aboutToBeDeleted();
        this.__isDark.aboutToBeDeleted();
        this.__colors.aboutToBeDeleted();
        this.__topRectHeight.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __username: ObservedPropertySimplePU<string>;
    get username() {
        return this.__username.get();
    }
    set username(newValue: string) {
        this.__username.set(newValue);
    }
    private __password: ObservedPropertySimplePU<string>;
    get password() {
        return this.__password.get();
    }
    set password(newValue: string) {
        this.__password.set(newValue);
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
    private __isPressed: ObservedPropertySimplePU<boolean>;
    get isPressed() {
        return this.__isPressed.get();
    }
    set isPressed(newValue: boolean) {
        this.__isPressed.set(newValue);
    }
    private __isDark: ObservedPropertySimplePU<boolean>;
    get isDark() {
        return this.__isDark.get();
    }
    set isDark(newValue: boolean) {
        this.__isDark.set(newValue);
    }
    private __colors: ObservedPropertyObjectPU<ColorScheme>; // 初始化为浅色主题
    get colors() {
        return this.__colors.get();
    }
    set colors(newValue: ColorScheme) {
        this.__colors.set(newValue);
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
     * 更新颜色方案
     */
    private updateColors(): void {
        this.colors = this.isDark ? DarkColorScheme : LightColorScheme;
    }
    /**
     * 组件出现时初始化
     */
    async aboutToAppear(): Promise<void> {
        this.isDark = ThemeUtil.isDarkMode();
        this.updateColors();
        ThemeUtil.addThemeChangeListener((isDark: boolean) => {
            this.isDark = isDark;
            this.updateColors();
        });
        // 等待加载apiKey后再检查登录状态
        hilog.info(0x0000, 'LoginPage', 'Loading apiKey...');
        const apiKey = await HttpUtil.loadApiKey();
        hilog.info(0x0000, 'LoginPage', `apiKey loaded: ${apiKey ? apiKey.substring(0, 10) + '...' : 'empty'}`);
        if (apiKey) {
            hilog.info(0x0000, 'LoginPage', 'Redirecting to MainPage...');
            try {
                this.getUIContext().getRouter().replaceUrl({ url: 'pages/MainPage' });
            }
            catch (err) {
                hilog.error(0x0000, 'LoginPage', `Router error: ${err}`);
            }
        }
        else {
            hilog.info(0x0000, 'LoginPage', 'No apiKey, showing login form');
        }
    }
    /**
     * 执行登录操作
     */
    async handleLogin(): Promise<void> {
        // 验证输入
        if (!this.username.trim()) {
            this.errorMessage = '请输入用户名';
            return;
        }
        if (!this.password.trim()) {
            this.errorMessage = '请输入密码';
            return;
        }
        this.isLoading = true;
        this.errorMessage = '';
        try {
            // 对密码进行MD5加密
            const encryptedPassword = await CryptoUtil.md5(this.password.trim());
            // 调用登录API
            const loginData = new Map<string, string>();
            loginData.set('nameOrEmail', this.username.trim());
            loginData.set('userPassword', encryptedPassword);
            const response = await HttpUtil.post<LoginResponse>('/api/getKey', loginData);
            if (response.code === 0 && response.Key) {
                // 保存apiKey
                hilog.info(0x0000, 'LoginPage', `Login success, apiKey: ${response.Key.substring(0, 10)}...`);
                HttpUtil.setApiKey(response.Key);
                await StorageUtil.set(StorageUtil.KEY_API_KEY, response.Key);
                // 获取用户信息并保存真实的用户名
                try {
                    const userResponse = await HttpUtil.get<UserInfoResponse>('/api/user');
                    if (userResponse.code === 0 && userResponse.data) {
                        await StorageUtil.set(StorageUtil.KEY_USER_NAME, userResponse.data.userName);
                        await StorageUtil.set(StorageUtil.KEY_USER_AVATAR, userResponse.data.userAvatarURL);
                        hilog.info(0x0000, 'LoginPage', `User info saved: ${userResponse.data.userName}`);
                    }
                    else {
                        // 如果获取用户信息失败，使用登录时输入的用户名
                        await StorageUtil.set(StorageUtil.KEY_USER_NAME, this.username.trim());
                    }
                }
                catch (err) {
                    // 如果获取用户信息失败，使用登录时输入的用户名
                    await StorageUtil.set(StorageUtil.KEY_USER_NAME, this.username.trim());
                }
                hilog.info(0x0000, 'LoginPage', 'apiKey saved to storage');
                // 跳转到主页
                try {
                    this.getUIContext().getRouter().replaceUrl({ url: 'pages/MainPage' });
                }
                catch (err) {
                    // 路由跳转失败
                }
            }
            else {
                this.errorMessage = response.msg || '登录失败，请检查账号密码';
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
            Column.backgroundColor(this.colors.background);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 状态栏占位
            Row.create();
            // 状态栏占位
            Row.width('100%');
            // 状态栏占位
            Row.height(this.getUIContext().px2vp(this.topRectHeight));
        }, Row);
        // 状态栏占位
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 顶部Logo区域
            Column.create();
            // 顶部Logo区域
            Column.margin({ top: 60, bottom: 48 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 应用图标 - 使用沉浸光感效果
            Stack.create();
            // 应用图标 - 使用沉浸光感效果
            Stack.width(120);
            // 应用图标 - 使用沉浸光感效果
            Stack.height(120);
        }, Stack);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 光晕背景
            Circle.create();
            // 光晕背景
            Circle.width(120);
            // 光晕背景
            Circle.height(120);
            // 光晕背景
            Circle.fill(this.colors.primary);
            // 光晕背景
            Circle.opacity(0.1);
        }, Circle);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 图标
            Image.create({ "id": 16777228, "type": 20000, params: [], "bundleName": "com.example.fishpi", "moduleName": "entry" });
            // 图标
            Image.width(80);
            // 图标
            Image.height(80);
            // 图标
            Image.borderRadius(BorderRadius.XL);
        }, Image);
        // 应用图标 - 使用沉浸光感效果
        Stack.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('摸鱼派');
            Text.fontSize(FontSize.XXXL);
            Text.fontWeight(700);
            Text.fontColor(this.colors.textPrimary);
            Text.margin({ top: Spacing.LG });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('记录你的摸鱼生活');
            Text.fontSize(FontSize.MD);
            Text.fontColor(this.colors.textTertiary);
            Text.margin({ top: Spacing.SM });
        }, Text);
        Text.pop();
        // 顶部Logo区域
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 输入区域
            Column.create();
            // 输入区域
            Column.padding({ left: Spacing.XL, right: Spacing.XL });
            // 输入区域
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 用户名输入框
            Column.create();
            // 用户名输入框
            Column.width('100%');
            // 用户名输入框
            Column.margin({ bottom: Spacing.LG });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('用户名');
            Text.fontSize(FontSize.SM);
            Text.fontColor(this.colors.textSecondary);
            Text.margin({ bottom: Spacing.SM });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ placeholder: '请输入用户名', text: this.username });
            TextInput.type(InputType.Normal);
            TextInput.height(ComponentSize.INPUT_LG);
            TextInput.width('100%');
            TextInput.backgroundColor(this.colors.surfaceSecondary);
            TextInput.borderRadius(BorderRadius.MD);
            TextInput.padding({ left: Spacing.LG, right: Spacing.LG });
            TextInput.fontColor(this.colors.textPrimary);
            TextInput.placeholderColor(this.colors.textTertiary);
            TextInput.onChange((value: string) => {
                this.username = value;
            });
        }, TextInput);
        // 用户名输入框
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 密码输入框
            Column.create();
            // 密码输入框
            Column.width('100%');
            // 密码输入框
            Column.margin({ bottom: Spacing.LG });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('密码');
            Text.fontSize(FontSize.SM);
            Text.fontColor(this.colors.textSecondary);
            Text.margin({ bottom: Spacing.SM });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ placeholder: '请输入密码', text: this.password });
            TextInput.type(InputType.Password);
            TextInput.height(ComponentSize.INPUT_LG);
            TextInput.width('100%');
            TextInput.backgroundColor(this.colors.surfaceSecondary);
            TextInput.borderRadius(BorderRadius.MD);
            TextInput.padding({ left: Spacing.LG, right: Spacing.LG });
            TextInput.fontColor(this.colors.textPrimary);
            TextInput.placeholderColor(this.colors.textTertiary);
            TextInput.onChange((value: string) => {
                this.password = value;
            });
        }, TextInput);
        // 密码输入框
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 错误提示
            if (this.errorMessage) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.width('100%');
                        Row.padding(Spacing.MD);
                        Row.backgroundColor(this.colors.error + '15');
                        Row.borderRadius(BorderRadius.SM);
                        Row.margin({ bottom: Spacing.LG });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('⚠️');
                        Text.fontSize(FontSize.SM);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.errorMessage);
                        Text.fontSize(FontSize.SM);
                        Text.fontColor(this.colors.error);
                        Text.margin({ left: Spacing.XS });
                    }, Text);
                    Text.pop();
                    Row.pop();
                });
            }
            // 登录按钮 - 智感握姿：根据握持模式调整位置
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 登录按钮 - 智感握姿：根据握持模式调整位置
            Button.createWithLabel(this.isLoading ? '登录中...' : '登录');
            globalThis.Context.animation({
                duration: AnimationDuration.FAST,
                curve: Curve.EaseInOut
            });
            // 登录按钮 - 智感握姿：根据握持模式调整位置
            Button.type(ButtonType.Capsule);
            // 登录按钮 - 智感握姿：根据握持模式调整位置
            Button.width('100%');
            // 登录按钮 - 智感握姿：根据握持模式调整位置
            Button.height(ComponentSize.BUTTON_LG);
            // 登录按钮 - 智感握姿：根据握持模式调整位置
            Button.backgroundColor(this.colors.primary);
            // 登录按钮 - 智感握姿：根据握持模式调整位置
            Button.fontColor(this.colors.textInverse);
            // 登录按钮 - 智感握姿：根据握持模式调整位置
            Button.fontSize(FontSize.LG);
            // 登录按钮 - 智感握姿：根据握持模式调整位置
            Button.fontWeight(500);
            // 登录按钮 - 智感握姿：根据握持模式调整位置
            Button.enabled(!this.isLoading);
            // 登录按钮 - 智感握姿：根据握持模式调整位置
            Button.opacity(this.isLoading ? 0.7 : 1);
            // 登录按钮 - 智感握姿：根据握持模式调整位置
            Button.scale({
                x: this.isPressed ? 0.98 : 1,
                y: this.isPressed ? 0.98 : 1
            });
            globalThis.Context.animation(null);
            // 登录按钮 - 智感握姿：根据握持模式调整位置
            Button.onTouch((event) => {
                if (event.type === TouchType.Down) {
                    this.isPressed = true;
                }
                else if (event.type === TouchType.Up || event.type === TouchType.Cancel) {
                    this.isPressed = false;
                }
            });
            // 登录按钮 - 智感握姿：根据握持模式调整位置
            Button.onClick(() => {
                this.handleLogin();
            });
        }, Button);
        // 登录按钮 - 智感握姿：根据握持模式调整位置
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 注册入口
            Row.create();
            // 注册入口
            Row.margin({ top: Spacing.XL });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('还没有账号？');
            Text.fontSize(FontSize.MD);
            Text.fontColor(this.colors.textTertiary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('去注册');
            Text.fontSize(FontSize.MD);
            Text.fontColor(this.colors.primary);
            Text.margin({ left: Spacing.XS });
            Text.onClick(() => {
                // 跳转到注册页面或打开网页
                try {
                    this.getUIContext().getRouter().pushUrl({ url: 'pages/RegisterPage' });
                }
                catch (err) {
                    // 路由跳转失败
                }
            });
        }, Text);
        Text.pop();
        // 注册入口
        Row.pop();
        // 输入区域
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "LoginPage";
    }
}
registerNamedRoute(() => new LoginPage(undefined, {}), "", { bundleName: "com.example.fishpi", moduleName: "entry", pagePath: "pages/LoginPage", pageFullPath: "entry/src/main/ets/pages/LoginPage", integratedHsp: "false", moduleType: "followWithHap" });
