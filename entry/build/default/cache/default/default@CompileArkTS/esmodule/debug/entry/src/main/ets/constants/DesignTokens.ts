/**
 * 设计令牌 (Design Tokens)
 * 基于 HarmonyOS Design 规范定义的全局样式常量
 */
/**
 * 间距令牌
 */
export interface SpacingType {
    XS: number;
    SM: number;
    MD: number;
    LG: number;
    XL: number;
    XXL: number;
    XXXL: number;
}
export const Spacing: SpacingType = {
    /** 4vp */
    XS: 4,
    /** 8vp */
    SM: 8,
    /** 12vp */
    MD: 12,
    /** 16vp */
    LG: 16,
    /** 24vp */
    XL: 24,
    /** 32vp */
    XXL: 32,
    /** 48vp */
    XXXL: 48
};
/**
 * 圆角令牌
 */
export interface BorderRadiusType {
    SM: number;
    MD: number;
    LG: number;
    XL: number;
    CAPSULE: number;
    FULL: number;
}
export const BorderRadius: BorderRadiusType = {
    /** 4vp - 标签、小按钮 */
    SM: 4,
    /** 8vp - 卡片、输入框 */
    MD: 8,
    /** 12vp - 弹窗、底部面板 */
    LG: 12,
    /** 16vp - 大卡片 */
    XL: 16,
    /** 24vp - 胶囊按钮 */
    CAPSULE: 24,
    /** 999vp - 全圆角 (头像等) */
    FULL: 999
};
/**
 * 字体大小令牌
 */
export interface FontSizeType {
    XS: number;
    SM: number;
    MD: number;
    LG: number;
    XL: number;
    XXL: number;
    XXXL: number;
}
export const FontSize: FontSizeType = {
    /** 10fp */
    XS: 10,
    /** 12fp */
    SM: 12,
    /** 14fp */
    MD: 14,
    /** 16fp */
    LG: 16,
    /** 18fp */
    XL: 18,
    /** 22fp */
    XXL: 22,
    /** 28fp */
    XXXL: 28
};
/**
 * 字重令牌
 */
export interface FontWeightType {
    REGULAR: number;
    MEDIUM: number;
    BOLD: number;
}
export const FontWeight: FontWeightType = {
    /** 常规 */
    REGULAR: 400,
    /** 中等 */
    MEDIUM: 500,
    /** 粗体 */
    BOLD: 700
};
/**
 * 行高令牌
 */
export interface LineHeightType {
    TIGHT: number;
    NORMAL: number;
    RELAXED: number;
}
export const LineHeight: LineHeightType = {
    /** 紧凑行高 1.2 */
    TIGHT: 1.2,
    /** 常规行高 1.5 */
    NORMAL: 1.5,
    /** 宽松行高 1.8 */
    RELAXED: 1.8
};
/**
 * 组件尺寸令牌
 */
export interface ComponentSizeType {
    BUTTON_SM: number;
    BUTTON_MD: number;
    BUTTON_LG: number;
    INPUT_SM: number;
    INPUT_MD: number;
    INPUT_LG: number;
    LIST_ITEM: number;
    LIST_ITEM_LARGE: number;
    AVATAR_SM: number;
    AVATAR_MD: number;
    AVATAR_LG: number;
    AVATAR_XL: number;
    ICON: number;
    ICON_SM: number;
    NAV_BAR: number;
    TAB_BAR: number;
}
export const ComponentSize: ComponentSizeType = {
    /** 小按钮高度 32vp */
    BUTTON_SM: 32,
    /** 中按钮高度 40vp */
    BUTTON_MD: 40,
    /** 大按钮高度 48vp */
    BUTTON_LG: 48,
    /** 小输入框高度 36vp */
    INPUT_SM: 36,
    /** 中输入框高度 44vp */
    INPUT_MD: 44,
    /** 大输入框高度 48vp */
    INPUT_LG: 48,
    /** 列表项高度 56vp */
    LIST_ITEM: 56,
    /** 大列表项高度 72vp */
    LIST_ITEM_LARGE: 72,
    /** 小头像 32vp */
    AVATAR_SM: 32,
    /** 中头像 48vp */
    AVATAR_MD: 48,
    /** 大头像 64vp */
    AVATAR_LG: 64,
    /** 超大头像 96vp */
    AVATAR_XL: 96,
    /** 图标大小 24vp */
    ICON: 24,
    /** 小图标 16vp */
    ICON_SM: 16,
    /** 导航栏高度 56vp */
    NAV_BAR: 56,
    /** 底部Tab栏高度 60vp */
    TAB_BAR: 60
};
/**
 * 阴影配置
 */
export interface ShadowConfig {
    radius: number;
    color: string;
    offsetX: number;
    offsetY: number;
}
export interface ShadowType {
    SM: ShadowConfig;
    MD: ShadowConfig;
    LG: ShadowConfig;
}
export const Shadow: ShadowType = {
    /** Level 1 - 卡片 */
    SM: {
        radius: 8,
        color: 'rgba(0, 0, 0, 0.08)',
        offsetX: 0,
        offsetY: 2
    },
    /** Level 2 - 浮动按钮 */
    MD: {
        radius: 16,
        color: 'rgba(0, 0, 0, 0.12)',
        offsetX: 0,
        offsetY: 4
    },
    /** Level 3 - 弹窗 */
    LG: {
        radius: 24,
        color: 'rgba(0, 0, 0, 0.16)',
        offsetX: 0,
        offsetY: 8
    }
};
/**
 * 动画时长令牌
 */
export interface AnimationDurationType {
    FAST: number;
    STANDARD: number;
    SLOW: number;
}
export const AnimationDuration: AnimationDurationType = {
    /** 快速 150ms - 按钮反馈 */
    FAST: 150,
    /** 标准 250ms - 页面切换 */
    STANDARD: 250,
    /** 缓慢 350ms - 复杂动画 */
    SLOW: 350
};
/**
 * 层级令牌
 */
export interface ElevationType {
    BASE: number;
    CARD: number;
    FLOATING: number;
    MODAL: number;
    TOAST: number;
    TOP: number;
}
export const Elevation: ElevationType = {
    /** 基础层 - 背景 */
    BASE: 0,
    /** 卡片层 */
    CARD: 1,
    /** 浮动层 */
    FLOATING: 2,
    /** 弹窗层 */
    MODAL: 3,
    /** 吐司层 */
    TOAST: 4,
    /** 最高层 */
    TOP: 5
};
/**
 * 透明度令牌
 */
export interface OpacityType {
    DISABLED: number;
    PRESSED: number;
    HOVER: number;
    MASK: number;
}
export const Opacity: OpacityType = {
    /** 禁用状态 */
    DISABLED: 0.4,
    /** 按压状态 */
    PRESSED: 0.7,
    /** 悬浮状态 */
    HOVER: 0.9,
    /** 遮罩层 */
    MASK: 0.45
};
/**
 * 断点令牌
 */
export interface BreakpointType {
    SM: number;
    MD: number;
    LG: number;
}
export const Breakpoint: BreakpointType = {
    /** 小屏 < 600vp */
    SM: 600,
    /** 中屏 600vp - 840vp */
    MD: 840,
    /** 大屏 > 840vp */
    LG: 1200
};
/**
 * 栅格系统令牌
 */
export interface GridType {
    SM_COLUMNS: number;
    MD_COLUMNS: number;
    LG_COLUMNS: number;
    GUTTER: number;
}
export const Grid: GridType = {
    /** 小屏列数 */
    SM_COLUMNS: 4,
    /** 中屏列数 */
    MD_COLUMNS: 8,
    /** 大屏列数 */
    LG_COLUMNS: 12,
    /** 间距 */
    GUTTER: 16
};
