import { StorageUtil } from "@bundle:com.example.fishpi/entry/ets/util/StorageUtil";
/**
 * 主题模式枚举
 */
export enum ThemeMode {
    LIGHT = "light",
    DARK = "dark",
    SYSTEM = "system"
}
/**
 * 色彩方案接口
 */
export interface ColorScheme {
    // 主色调
    primary: string;
    primaryLight: string;
    primaryDark: string;
    // 背景色
    background: string;
    backgroundSecondary: string;
    surface: string;
    surfaceSecondary: string;
    // 文字色
    textPrimary: string;
    textSecondary: string;
    textTertiary: string;
    textInverse: string;
    // 功能色
    success: string;
    warning: string;
    error: string;
    info: string;
    // 分割线
    divider: string;
    // 遮罩层
    mask: string;
    // 状态栏
    statusBarContent: string;
}
/**
 * 浅色主题色彩方案
 */
export const LightColorScheme: ColorScheme = {
    primary: '#1890FF',
    primaryLight: '#E6F7FF',
    primaryDark: '#096DD9',
    background: '#F5F5F5',
    backgroundSecondary: '#EBEBEB',
    surface: '#FFFFFF',
    surfaceSecondary: '#FAFAFA',
    textPrimary: '#1A1A1A',
    textSecondary: '#666666',
    textTertiary: '#999999',
    textInverse: '#FFFFFF',
    success: '#52C41A',
    warning: '#FAAD14',
    error: '#FF4D4F',
    info: '#1890FF',
    divider: '#E8E8E8',
    mask: 'rgba(0, 0, 0, 0.45)',
    statusBarContent: '#000000'
};
/**
 * 深色主题色彩方案
 */
export const DarkColorScheme: ColorScheme = {
    primary: '#3091FF',
    primaryLight: '#1A3A5C',
    primaryDark: '#6CB3FF',
    background: '#000000',
    backgroundSecondary: '#1C1C1E',
    surface: '#1C1C1E',
    surfaceSecondary: '#2C2C2E',
    textPrimary: '#FFFFFF',
    textSecondary: '#EBEBEB',
    textTertiary: '#8A8A8C',
    textInverse: '#000000',
    success: '#6CD32E',
    warning: '#FFB842',
    error: '#FF6B6B',
    info: '#3091FF',
    divider: '#38383A',
    mask: 'rgba(0, 0, 0, 0.65)',
    statusBarContent: '#FFFFFF'
};
/**
 * 主题管理工具类
 * 处理深色/浅色模式切换，监听系统主题变化
 */
export class ThemeUtil {
    private static currentMode: ThemeMode = ThemeMode.SYSTEM;
    private static isDark: boolean = false;
    private static listeners: Array<(isDark: boolean) => void> = [];
    /**
     * 初始化主题
     * 从本地存储加载用户设置
     */
    static async init(): Promise<void> {
        const savedMode = await StorageUtil.get('theme_mode', ThemeMode.SYSTEM);
        ThemeUtil.currentMode = savedMode as ThemeMode;
        ThemeUtil.updateTheme();
    }
    /**
     * 系统配置变化回调
     * 由EntryAbility的onConfigurationUpdate调用
     */
    static onSystemConfigurationUpdate(isDark: boolean): void {
        if (ThemeUtil.currentMode === ThemeMode.SYSTEM) {
            if (ThemeUtil.isDark !== isDark) {
                ThemeUtil.isDark = isDark;
                ThemeUtil.notifyListeners();
            }
        }
    }
    /**
     * 设置主题模式
     */
    static async setThemeMode(mode: ThemeMode): Promise<void> {
        ThemeUtil.currentMode = mode;
        await StorageUtil.set('theme_mode', mode);
        ThemeUtil.updateTheme();
    }
    /**
     * 获取当前主题模式
     */
    static getThemeMode(): ThemeMode {
        return ThemeUtil.currentMode;
    }
    /**
     * 更新主题状态
     */
    private static updateTheme(): void {
        switch (ThemeUtil.currentMode) {
            case ThemeMode.LIGHT:
                ThemeUtil.isDark = false;
                break;
            case ThemeMode.DARK:
                ThemeUtil.isDark = true;
                break;
            case ThemeMode.SYSTEM:
                // 跟随系统，需要从系统配置获取
                // 这里先使用默认值，实际需要监听系统配置
                break;
        }
        ThemeUtil.notifyListeners();
    }
    /**
     * 是否为深色模式
     */
    static isDarkMode(): boolean {
        return ThemeUtil.isDark;
    }
    /**
     * 获取当前色彩方案
     */
    static getColorScheme(): ColorScheme {
        return ThemeUtil.isDark ? DarkColorScheme : LightColorScheme;
    }
    /**
     * 获取指定颜色
     */
    static getColor(colorKey: keyof ColorScheme): string {
        const scheme = ThemeUtil.getColorScheme();
        // 使用switch避免索引访问
        switch (colorKey) {
            case 'primary':
                return scheme.primary;
            case 'primaryLight':
                return scheme.primaryLight;
            case 'primaryDark':
                return scheme.primaryDark;
            case 'background':
                return scheme.background;
            case 'backgroundSecondary':
                return scheme.backgroundSecondary;
            case 'surface':
                return scheme.surface;
            case 'surfaceSecondary':
                return scheme.surfaceSecondary;
            case 'textPrimary':
                return scheme.textPrimary;
            case 'textSecondary':
                return scheme.textSecondary;
            case 'textTertiary':
                return scheme.textTertiary;
            case 'textInverse':
                return scheme.textInverse;
            case 'success':
                return scheme.success;
            case 'warning':
                return scheme.warning;
            case 'error':
                return scheme.error;
            case 'info':
                return scheme.info;
            case 'divider':
                return scheme.divider;
            case 'mask':
                return scheme.mask;
            case 'statusBarContent':
                return scheme.statusBarContent;
            default:
                return '';
        }
    }
    /**
     * 添加主题变化监听器
     */
    static addThemeChangeListener(listener: (isDark: boolean) => void): void {
        ThemeUtil.listeners.push(listener);
    }
    /**
     * 移除主题变化监听器
     */
    static removeThemeChangeListener(listener: (isDark: boolean) => void): void {
        const index = ThemeUtil.listeners.indexOf(listener);
        if (index > -1) {
            ThemeUtil.listeners.splice(index, 1);
        }
    }
    /**
     * 通知所有监听器
     */
    private static notifyListeners(): void {
        ThemeUtil.listeners.forEach(listener => {
            listener(ThemeUtil.isDark);
        });
    }
    /**
     * 切换深色/浅色模式
     */
    static async toggleDarkMode(): Promise<void> {
        const newMode = ThemeUtil.isDark ? ThemeMode.LIGHT : ThemeMode.DARK;
        await ThemeUtil.setThemeMode(newMode);
    }
}
