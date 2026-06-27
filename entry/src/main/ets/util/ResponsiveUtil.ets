import { display } from '@kit.ArkUI';

/**
 * 屏幕断点枚举
 */
export enum Breakpoint {
  SM = 'sm',   // 小屏: < 600vp (手机竖屏)
  MD = 'md',   // 中屏: 600vp - 840vp (手机横屏、折叠屏)
  LG = 'lg'    // 大屏: > 840vp (平板)
}

/**
 * 屏幕方向枚举
 */
export enum Orientation {
  PORTRAIT = 'portrait',
  LANDSCAPE = 'landscape'
}

/**
 * 握持模式枚举
 * 智感握姿：根据用户握持方式调整布局
 */
export enum GripMode {
  SINGLE_HAND = 'single_hand',   // 单手握持
  TWO_HAND = 'two_hand',         // 双手握持
  DESKTOP = 'desktop'            // 桌面模式
}

/**
 * 断点选项接口
 */
export interface BreakpointOptions<T> {
  sm?: T;
  md?: T;
  lg: T;
}

/**
 * 响应式布局工具类
 * 处理屏幕适配、断点、握持模式
 */
export class ResponsiveUtil {
  private static screenWidth: number = 0;
  private static screenHeight: number = 0;
  private static currentBreakpoint: Breakpoint = Breakpoint.SM;
  private static currentOrientation: Orientation = Orientation.PORTRAIT;
  private static currentGripMode: GripMode = GripMode.TWO_HAND;
  private static listeners: Array<(breakpoint: Breakpoint) => void> = [];

  /**
   * 初始化响应式系统
   */
  static async init(): Promise<void> {
    try {
      const displayInfo = display.getDefaultDisplaySync();
      ResponsiveUtil.screenWidth = displayInfo.width / displayInfo.densityPixels;
      ResponsiveUtil.screenHeight = displayInfo.height / displayInfo.densityPixels;
      ResponsiveUtil.updateBreakpoint();
      ResponsiveUtil.updateOrientation();

      // 监听屏幕变化
      display.on('change', async (displayId: number) => {
        try {
          const data = display.getDefaultDisplaySync();
          ResponsiveUtil.screenWidth = data.width / data.densityPixels;
          ResponsiveUtil.screenHeight = data.height / data.densityPixels;
          ResponsiveUtil.updateBreakpoint();
          ResponsiveUtil.updateOrientation();
        } catch (err) {
          // 显示变化处理失败
        }
      });
    } catch (err) {
      // 响应式初始化失败
    }
  }

  /**
   * 更新断点
   */
  private static updateBreakpoint(): void {
    const width = ResponsiveUtil.screenWidth;
    let newBreakpoint: Breakpoint;

    if (width < 600) {
      newBreakpoint = Breakpoint.SM;
    } else if (width < 840) {
      newBreakpoint = Breakpoint.MD;
    } else {
      newBreakpoint = Breakpoint.LG;
    }

    if (ResponsiveUtil.currentBreakpoint !== newBreakpoint) {
      ResponsiveUtil.currentBreakpoint = newBreakpoint;
      ResponsiveUtil.notifyListeners();
    }
  }

  /**
   * 更新屏幕方向
   */
  private static updateOrientation(): void {
    ResponsiveUtil.currentOrientation =
      ResponsiveUtil.screenWidth > ResponsiveUtil.screenHeight
        ? Orientation.LANDSCAPE
        : Orientation.PORTRAIT;
  }

  /**
   * 获取当前断点
   */
  static getBreakpoint(): Breakpoint {
    return ResponsiveUtil.currentBreakpoint;
  }

  /**
   * 获取屏幕方向
   */
  static getOrientation(): Orientation {
    return ResponsiveUtil.currentOrientation;
  }

  /**
   * 获取屏幕宽度 (vp)
   */
  static getScreenWidth(): number {
    return ResponsiveUtil.screenWidth;
  }

  /**
   * 获取屏幕高度 (vp)
   */
  static getScreenHeight(): number {
    return ResponsiveUtil.screenHeight;
  }

  /**
   * 设置握持模式
   */
  static setGripMode(mode: GripMode): void {
    ResponsiveUtil.currentGripMode = mode;
  }

  /**
   * 获取握持模式
   */
  static getGripMode(): GripMode {
    return ResponsiveUtil.currentGripMode;
  }

  /**
   * 是否为小屏
   */
  static isSmallScreen(): boolean {
    return ResponsiveUtil.currentBreakpoint === Breakpoint.SM;
  }

  /**
   * 是否为中屏
   */
  static isMediumScreen(): boolean {
    return ResponsiveUtil.currentBreakpoint === Breakpoint.MD;
  }

  /**
   * 是否为大屏
   */
  static isLargeScreen(): boolean {
    return ResponsiveUtil.currentBreakpoint === Breakpoint.LG;
  }

  /**
   * 是否为横屏
   */
  static isLandscape(): boolean {
    return ResponsiveUtil.currentOrientation === Orientation.LANDSCAPE;
  }

  /**
   * 根据断点返回不同值
   */
  static select<T>(options: BreakpointOptions<T>): T {
    switch (ResponsiveUtil.currentBreakpoint) {
      case Breakpoint.SM:
        return options.sm ?? options.lg;
      case Breakpoint.MD:
        return options.md ?? options.lg;
      case Breakpoint.LG:
        return options.lg;
    }
  }

  /**
   * 获取响应式列数 (栅格系统)
   */
  static getGridColumns(): number {
    return ResponsiveUtil.select({
      sm: 4,
      md: 8,
      lg: 12
    });
  }

  /**
   * 获取响应式间距
   */
  static getGutter(): number {
    return ResponsiveUtil.select({
      sm: 12,
      md: 16,
      lg: 24
    });
  }

  /**
   * 获取页面水平内边距
   */
  static getPagePadding(): number {
    return ResponsiveUtil.select({
      sm: 16,
      md: 24,
      lg: 32
    });
  }

  /**
   * 根据握持模式获取操作区域高度偏移
   * 单手握持时，重要操作按钮下移
   */
  static getGripOffset(): number {
    switch (ResponsiveUtil.currentGripMode) {
      case GripMode.SINGLE_HAND:
        return 80; // 下移80vp
      case GripMode.TWO_HAND:
        return 0;
      case GripMode.DESKTOP:
        return 0;
    }
  }

  /**
   * 添加断点变化监听器
   */
  static addBreakpointListener(listener: (breakpoint: Breakpoint) => void): void {
    ResponsiveUtil.listeners.push(listener);
  }

  /**
   * 移除断点变化监听器
   */
  static removeBreakpointListener(listener: (breakpoint: Breakpoint) => void): void {
    const index = ResponsiveUtil.listeners.indexOf(listener);
    if (index > -1) {
      ResponsiveUtil.listeners.splice(index, 1);
    }
  }

  /**
   * 通知所有监听器
   */
  private static notifyListeners(): void {
    ResponsiveUtil.listeners.forEach(listener => {
      listener(ResponsiveUtil.currentBreakpoint);
    });
  }
}
