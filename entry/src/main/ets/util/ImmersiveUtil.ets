import { window } from '@kit.ArkUI';
import { ThemeUtil } from './ThemeUtil';

/**
 * 沉浸式工具类
 * 处理沉浸式状态栏、导航栏、沉浸光感效果
 */
export class ImmersiveUtil {
  private static windowStage: window.WindowStage | null = null;

  /**
   * 初始化沉浸式配置
   */
  static async init(windowStage: window.WindowStage): Promise<void> {
    ImmersiveUtil.windowStage = windowStage;
    await ImmersiveUtil.setupImmersive();
  }

  /**
   * 设置沉浸式状态栏和导航栏
   */
  static async setupImmersive(): Promise<void> {
    if (!ImmersiveUtil.windowStage) return;

    try {
      const windowObj = await ImmersiveUtil.windowStage.getMainWindow();

      // 设置沉浸式布局
      await windowObj.setWindowLayoutFullScreen(true);

      // 获取并保存状态栏高度到 AppStorage
      const systemArea = windowObj.getWindowAvoidArea(window.AvoidAreaType.TYPE_SYSTEM);
      const topRectHeight = systemArea.topRect.height;
      AppStorage.setOrCreate('topRectHeight', topRectHeight);

      // 获取并保存导航栏高度到 AppStorage
      const navArea = windowObj.getWindowAvoidArea(window.AvoidAreaType.TYPE_NAVIGATION_INDICATOR);
      const bottomRectHeight = navArea.bottomRect.height;
      AppStorage.setOrCreate('bottomRectHeight', bottomRectHeight);

      // 监听避让区域变化（横竖屏切换、折叠屏展开等场景）
      windowObj.on('avoidAreaChange', (data) => {
        if (data.type === window.AvoidAreaType.TYPE_SYSTEM) {
          AppStorage.setOrCreate('topRectHeight', data.area.topRect.height);
        } else if (data.type === window.AvoidAreaType.TYPE_NAVIGATION_INDICATOR) {
          AppStorage.setOrCreate('bottomRectHeight', data.area.bottomRect.height);
        }
      });

      // 根据当前主题设置状态栏样式
      await ImmersiveUtil.updateStatusBarStyle();
    } catch (err) {
      // 设置沉浸式失败
    }
  }

  /**
   * 更新状态栏样式
   * 根据深色/浅色模式切换状态栏图标颜色
   */
  static async updateStatusBarStyle(): Promise<void> {
    if (!ImmersiveUtil.windowStage) return;

    try {
      const windowObj = await ImmersiveUtil.windowStage.getMainWindow();
      const isDark = ThemeUtil.isDarkMode();

      // 设置状态栏属性
      await windowObj.setWindowSystemBarProperties({
        statusBarContentColor: isDark ? '#FFFFFF' : '#000000',
        navigationBarContentColor: isDark ? '#FFFFFF' : '#000000',
        statusBarColor: '#00000000', // 透明状态栏
        navigationBarColor: isDark ? '#000000' : '#FFFFFF'
      });
    } catch (err) {
      // 更新状态栏样式失败
    }
  }

  /**
   * 获取状态栏高度
   */
  static async getStatusBarHeight(): Promise<number> {
    if (!ImmersiveUtil.windowStage) return 0;

    try {
      const windowObj = await ImmersiveUtil.windowStage.getMainWindow();
      const properties = await windowObj.getWindowAvoidArea(window.AvoidAreaType.TYPE_SYSTEM);
      return properties.topRect.height;
    } catch (err) {
      return 0;
    }
  }

  /**
   * 获取导航栏高度
   */
  static async getNavigationBarHeight(): Promise<number> {
    if (!ImmersiveUtil.windowStage) return 0;

    try {
      const windowObj = await ImmersiveUtil.windowStage.getMainWindow();
      const properties = await windowObj.getWindowAvoidArea(window.AvoidAreaType.TYPE_NAVIGATION_INDICATOR);
      return properties.bottomRect.height;
    } catch (err) {
      return 0;
    }
  }

  /**
   * 设置全屏模式 (视频播放等场景)
   */
  static async setFullScreen(fullScreen: boolean): Promise<void> {
    if (!ImmersiveUtil.windowStage) return;

    try {
      const windowObj = await ImmersiveUtil.windowStage.getMainWindow();

      if (fullScreen) {
        // 隐藏状态栏和导航栏
        await windowObj.setSpecificSystemBarEnabled('status', false);
        await windowObj.setSpecificSystemBarEnabled('navigation', false);
      } else {
        // 显示状态栏和导航栏
        await windowObj.setSpecificSystemBarEnabled('status', true);
        await windowObj.setSpecificSystemBarEnabled('navigation', true);
      }
    } catch (err) {
      // 设置全屏失败
    }
  }

  /**
   * 设置状态栏亮色模式 (浅色背景用深色图标)
   */
  static async setStatusBarLight(): Promise<void> {
    if (!ImmersiveUtil.windowStage) return;

    try {
      const windowObj = await ImmersiveUtil.windowStage.getMainWindow();
      await windowObj.setWindowSystemBarProperties({
        statusBarContentColor: '#000000'
      });
    } catch (err) {
      // 设置状态栏亮色失败
    }
  }

  /**
   * 设置状态栏暗色模式 (深色背景用浅色图标)
   */
  static async setStatusBarDark(): Promise<void> {
    if (!ImmersiveUtil.windowStage) return;

    try {
      const windowObj = await ImmersiveUtil.windowStage.getMainWindow();
      await windowObj.setWindowSystemBarProperties({
        statusBarContentColor: '#FFFFFF'
      });
    } catch (err) {
      // 设置状态栏暗色失败
    }
  }
}
