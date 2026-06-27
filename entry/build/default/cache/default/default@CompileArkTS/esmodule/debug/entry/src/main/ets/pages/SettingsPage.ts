if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface SettingsPage_Params {
    isDarkMode?: boolean;
    themeMode?: ThemeMode;
    isNotificationEnabled?: boolean;
    userName?: string;
    topRectHeight?: number;
}
import { StorageUtil } from "@bundle:com.example.fishpi/entry/ets/util/StorageUtil";
import { HttpUtil } from "@bundle:com.example.fishpi/entry/ets/util/HttpUtil";
import { ThemeUtil, ThemeMode, LightColorScheme, DarkColorScheme } from "@bundle:com.example.fishpi/entry/ets/util/ThemeUtil";
import { Spacing, BorderRadius, FontSize, ComponentSize } from "@bundle:com.example.fishpi/entry/ets/constants/DesignTokens";
class SettingsPage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__isDarkMode = new ObservedPropertySimplePU(false, this, "isDarkMode");
        this.__themeMode = new ObservedPropertySimplePU(ThemeMode.SYSTEM, this, "themeMode");
        this.__isNotificationEnabled = new ObservedPropertySimplePU(true, this, "isNotificationEnabled");
        this.__userName = new ObservedPropertySimplePU('', this, "userName");
        this.__topRectHeight = this.createStorageProp('topRectHeight', 0, "topRectHeight");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: SettingsPage_Params) {
        if (params.isDarkMode !== undefined) {
            this.isDarkMode = params.isDarkMode;
        }
        if (params.themeMode !== undefined) {
            this.themeMode = params.themeMode;
        }
        if (params.isNotificationEnabled !== undefined) {
            this.isNotificationEnabled = params.isNotificationEnabled;
        }
        if (params.userName !== undefined) {
            this.userName = params.userName;
        }
    }
    updateStateVars(params: SettingsPage_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__isDarkMode.purgeDependencyOnElmtId(rmElmtId);
        this.__themeMode.purgeDependencyOnElmtId(rmElmtId);
        this.__isNotificationEnabled.purgeDependencyOnElmtId(rmElmtId);
        this.__userName.purgeDependencyOnElmtId(rmElmtId);
        this.__topRectHeight.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__isDarkMode.aboutToBeDeleted();
        this.__themeMode.aboutToBeDeleted();
        this.__isNotificationEnabled.aboutToBeDeleted();
        this.__userName.aboutToBeDeleted();
        this.__topRectHeight.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __isDarkMode: ObservedPropertySimplePU<boolean>;
    get isDarkMode() {
        return this.__isDarkMode.get();
    }
    set isDarkMode(newValue: boolean) {
        this.__isDarkMode.set(newValue);
    }
    private __themeMode: ObservedPropertySimplePU<ThemeMode>;
    get themeMode() {
        return this.__themeMode.get();
    }
    set themeMode(newValue: ThemeMode) {
        this.__themeMode.set(newValue);
    }
    private __isNotificationEnabled: ObservedPropertySimplePU<boolean>;
    get isNotificationEnabled() {
        return this.__isNotificationEnabled.get();
    }
    set isNotificationEnabled(newValue: boolean) {
        this.__isNotificationEnabled.set(newValue);
    }
    private __userName: ObservedPropertySimplePU<string>;
    get userName() {
        return this.__userName.get();
    }
    set userName(newValue: string) {
        this.__userName.set(newValue);
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
     * 页面出现时加载设置
     */
    async aboutToAppear(): Promise<void> {
        this.userName = await StorageUtil.get(StorageUtil.KEY_USER_NAME);
        this.isDarkMode = ThemeUtil.isDarkMode();
        this.themeMode = ThemeUtil.getThemeMode();
        this.isNotificationEnabled = await StorageUtil.getBool(StorageUtil.KEY_NOTIFICATION_ENABLED, true);
        // 监听主题变化
        ThemeUtil.addThemeChangeListener((isDark: boolean) => {
            this.isDarkMode = isDark;
        });
    }
    /**
     * 设置主题模式
     */
    private async setThemeMode(mode: ThemeMode): Promise<void> {
        this.themeMode = mode;
        await ThemeUtil.setThemeMode(mode);
        this.isDarkMode = ThemeUtil.isDarkMode();
    }
    /**
     * 切换通知
     */
    private async toggleNotification(value: boolean): Promise<void> {
        this.isNotificationEnabled = value;
        await StorageUtil.setBool(StorageUtil.KEY_NOTIFICATION_ENABLED, value);
    }
    /**
     * 清除缓存
     */
    private async clearCache(): Promise<void> {
        // 保留apiKey和用户名
        const apiKey = await StorageUtil.get(StorageUtil.KEY_API_KEY);
        const userName = await StorageUtil.get(StorageUtil.KEY_USER_NAME);
        await StorageUtil.clear();
        // 恢复重要数据
        await StorageUtil.set(StorageUtil.KEY_API_KEY, apiKey);
        await StorageUtil.set(StorageUtil.KEY_USER_NAME, userName);
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
    /**
     * 获取主题模式显示文本
     */
    private getThemeModeText(mode: ThemeMode): string {
        switch (mode) {
            case ThemeMode.LIGHT:
                return '浅色模式';
            case ThemeMode.DARK:
                return '深色模式';
            case ThemeMode.SYSTEM:
                return '跟随系统';
        }
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor(this.colors.background);
            Column.padding({ top: this.getUIContext().px2vp(this.topRectHeight) });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 顶部导航栏
            Row.create();
            // 顶部导航栏
            Row.width('100%');
            // 顶部导航栏
            Row.height(ComponentSize.LIST_ITEM);
            // 顶部导航栏
            Row.padding({ left: Spacing.LG, right: Spacing.LG });
            // 顶部导航栏
            Row.backgroundColor(this.colors.surface);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('返回');
            Text.fontSize(FontSize.LG);
            Text.fontColor(this.colors.primary);
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
            Text.create('设置');
            Text.fontSize(FontSize.XL);
            Text.fontWeight(700);
            Text.fontColor(this.colors.textPrimary);
            Text.margin({ left: Spacing.LG });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        // 顶部导航栏
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 设置列表
            List.create();
            // 设置列表
            List.layoutWeight(1);
            // 设置列表
            List.width('100%');
            // 设置列表
            List.backgroundColor(this.colors.backgroundSecondary);
        }, List);
        {
            const itemCreation = (elmtId, isInitialRender) => {
                ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                ListItem.create(deepRenderFunction, true);
                if (!isInitialRender) {
                    // 账号信息
                    ListItem.pop();
                }
                ViewStackProcessor.StopGetAccessRecording();
            };
            const itemCreation2 = (elmtId, isInitialRender) => {
                ListItem.create(deepRenderFunction, true);
            };
            const deepRenderFunction = (elmtId, isInitialRender) => {
                itemCreation(elmtId, isInitialRender);
                this.SettingItem.bind(this)('账号', this.userName);
                // 账号信息
                ListItem.pop();
            };
            this.observeComponentCreation2(itemCreation2, ListItem);
            // 账号信息
            ListItem.pop();
        }
        {
            const itemCreation = (elmtId, isInitialRender) => {
                ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                ListItem.create(deepRenderFunction, true);
                if (!isInitialRender) {
                    // 主题模式选择
                    ListItem.pop();
                }
                ViewStackProcessor.StopGetAccessRecording();
            };
            const itemCreation2 = (elmtId, isInitialRender) => {
                ListItem.create(deepRenderFunction, true);
            };
            const deepRenderFunction = (elmtId, isInitialRender) => {
                itemCreation(elmtId, isInitialRender);
                this.ThemeModeSelector.bind(this)();
                // 主题模式选择
                ListItem.pop();
            };
            this.observeComponentCreation2(itemCreation2, ListItem);
            // 主题模式选择
            ListItem.pop();
        }
        {
            const itemCreation = (elmtId, isInitialRender) => {
                ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                ListItem.create(deepRenderFunction, true);
                if (!isInitialRender) {
                    // 消息通知
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
                    Row.height(ComponentSize.LIST_ITEM);
                    Row.padding({ left: Spacing.LG, right: Spacing.LG });
                    Row.backgroundColor(this.colors.surface);
                }, Row);
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create('消息通知');
                    Text.fontSize(FontSize.LG);
                    Text.fontColor(this.colors.textPrimary);
                }, Text);
                Text.pop();
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Blank.create();
                }, Blank);
                Blank.pop();
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Toggle.create({ type: ToggleType.Switch, isOn: this.isNotificationEnabled });
                    Toggle.selectedColor(this.colors.primary);
                    Toggle.onChange((value: boolean) => {
                        this.toggleNotification(value);
                    });
                }, Toggle);
                Toggle.pop();
                Row.pop();
                // 消息通知
                ListItem.pop();
            };
            this.observeComponentCreation2(itemCreation2, ListItem);
            // 消息通知
            ListItem.pop();
        }
        {
            const itemCreation = (elmtId, isInitialRender) => {
                ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                ListItem.create(deepRenderFunction, true);
                if (!isInitialRender) {
                    // 清除缓存
                    ListItem.pop();
                }
                ViewStackProcessor.StopGetAccessRecording();
            };
            const itemCreation2 = (elmtId, isInitialRender) => {
                ListItem.create(deepRenderFunction, true);
            };
            const deepRenderFunction = (elmtId, isInitialRender) => {
                itemCreation(elmtId, isInitialRender);
                this.SettingItem.bind(this)('清除缓存', '', () => {
                    this.clearCache();
                });
                // 清除缓存
                ListItem.pop();
            };
            this.observeComponentCreation2(itemCreation2, ListItem);
            // 清除缓存
            ListItem.pop();
        }
        {
            const itemCreation = (elmtId, isInitialRender) => {
                ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                ListItem.create(deepRenderFunction, true);
                if (!isInitialRender) {
                    // 关于
                    ListItem.pop();
                }
                ViewStackProcessor.StopGetAccessRecording();
            };
            const itemCreation2 = (elmtId, isInitialRender) => {
                ListItem.create(deepRenderFunction, true);
            };
            const deepRenderFunction = (elmtId, isInitialRender) => {
                itemCreation(elmtId, isInitialRender);
                this.SettingItem.bind(this)('关于摸鱼派', 'v1.0.0');
                // 关于
                ListItem.pop();
            };
            this.observeComponentCreation2(itemCreation2, ListItem);
            // 关于
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
                    Button.height(ComponentSize.BUTTON_LG);
                    Button.backgroundColor(this.colors.error);
                    Button.fontColor('#FFFFFF');
                    Button.fontSize(FontSize.LG);
                    Button.margin({ top: Spacing.XL, left: '5%' });
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
        // 设置列表
        List.pop();
        Column.pop();
    }
    /**
     * 设置项组件
     */
    SettingItem(title: string, value: string, onClick?: () => void, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.height(ComponentSize.LIST_ITEM);
            Row.padding({ left: Spacing.LG, right: Spacing.LG });
            Row.backgroundColor(this.colors.surface);
            Row.onClick(onClick);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(title);
            Text.fontSize(FontSize.LG);
            Text.fontColor(this.colors.textPrimary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (value) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(value);
                        Text.fontSize(FontSize.MD);
                        Text.fontColor(this.colors.textTertiary);
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
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('>');
            Text.fontSize(FontSize.MD);
            Text.fontColor(this.colors.textTertiary);
            Text.margin({ left: Spacing.SM });
        }, Text);
        Text.pop();
        Row.pop();
    }
    /**
     * 主题模式选择器
     */
    ThemeModeSelector(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.padding({ left: Spacing.LG, right: Spacing.LG, top: Spacing.MD, bottom: Spacing.MD });
            Column.backgroundColor(this.colors.surface);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('深色模式');
            Text.fontSize(FontSize.LG);
            Text.fontColor(this.colors.textPrimary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.getThemeModeText(this.themeMode));
            Text.fontSize(FontSize.MD);
            Text.fontColor(this.colors.textTertiary);
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 主题模式选项
            Row.create();
            // 主题模式选项
            Row.width('100%');
            // 主题模式选项
            Row.justifyContent(FlexAlign.SpaceBetween);
            // 主题模式选项
            Row.margin({ top: Spacing.MD });
        }, Row);
        this.ThemeModeOption.bind(this)('浅色', ThemeMode.LIGHT);
        this.ThemeModeOption.bind(this)('深色', ThemeMode.DARK);
        this.ThemeModeOption.bind(this)('跟随系统', ThemeMode.SYSTEM);
        // 主题模式选项
        Row.pop();
        Column.pop();
    }
    /**
     * 主题模式选项
     */
    ThemeModeOption(label: string, mode: ThemeMode, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('30%');
            Column.padding(Spacing.MD);
            Column.borderRadius(BorderRadius.MD);
            Column.backgroundColor(this.themeMode === mode ? this.colors.primaryLight : 'transparent');
            Column.onClick(() => {
                this.setThemeMode(mode);
            });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 图标
            Text.create(mode === ThemeMode.LIGHT ? '☀️' : mode === ThemeMode.DARK ? '🌙' : '⚙️');
            // 图标
            Text.fontSize(24);
        }, Text);
        // 图标
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(label);
            Text.fontSize(FontSize.SM);
            Text.fontColor(this.themeMode === mode ? this.colors.primary : this.colors.textSecondary);
            Text.margin({ top: Spacing.XS });
        }, Text);
        Text.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "SettingsPage";
    }
}
registerNamedRoute(() => new SettingsPage(undefined, {}), "", { bundleName: "com.example.fishpi", moduleName: "entry", pagePath: "pages/SettingsPage", pageFullPath: "entry/src/main/ets/pages/SettingsPage", integratedHsp: "false", moduleType: "followWithHap" });
