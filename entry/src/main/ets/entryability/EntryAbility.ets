import { AbilityConstant, UIAbility, Want, Configuration } from '@kit.AbilityKit';
import { ConfigurationConstant } from '@kit.AbilityKit';
import { window } from '@kit.ArkUI';
import { backgroundTaskManager } from '@kit.BackgroundTasksKit';
import { StorageUtil } from '../util/StorageUtil';
import { HttpUtil } from '../util/HttpUtil';
import { ThemeUtil } from '../util/ThemeUtil';
import { ResponsiveUtil } from '../util/ResponsiveUtil';
import { ImmersiveUtil } from '../util/ImmersiveUtil';

// 后台任务ID
let backgroundTaskId: number = -1;

/**
 * 应用入口Ability
 * 初始化应用核心服务：存储、网络、主题、响应式布局、沉浸式
 */
export default class EntryAbility extends UIAbility {
  async onCreate(want: Want, launchParam: AbilityConstant.LaunchParam): Promise<void> {

    // 初始化本地存储
    await StorageUtil.init(this.context);

    // 初始化主题系统
    await ThemeUtil.init();

    // 初始化响应式布局系统
    await ResponsiveUtil.init();

    // 加载用户登录状态
    await HttpUtil.loadApiKey();
  }

  onDestroy(): void {
  }

  async onWindowStageCreate(windowStage: window.WindowStage): Promise<void> {

    // 等待 StorageUtil 初始化完成（onCreate 中可能还没完成）
    while (!StorageUtil.isInitialized()) {
      await new Promise<void>(resolve => setTimeout(resolve, 10));
    }

    // 初始化沉浸式状态栏
    await ImmersiveUtil.init(windowStage);

    // 监听主题变化，更新状态栏样式
    ThemeUtil.addThemeChangeListener(async (isDark: boolean) => {
      await ImmersiveUtil.updateStatusBarStyle();
    });

    // 加载登录页面
    windowStage.loadContent('pages/LoginPage', (err) => {
      if (err.code) {
        return;
      }
    });
  }

  onWindowStageDestroy(): void {
  }

  onForeground(): void {

    // 取消后台长时任务
    if (backgroundTaskId !== -1) {
      backgroundTaskManager.cancelSuspendDelay(backgroundTaskId);
      backgroundTaskId = -1;
    }
  }

  onBackground(): void {

    // 申请后台短时任务，保持WebSocket连接
    if (backgroundTaskId === -1) {
      const delayInfo = backgroundTaskManager.requestSuspendDelay('ChatRoomWebSocket', () => {
        backgroundTaskId = -1;
      });
      backgroundTaskId = delayInfo.requestId;
    }
  }

  /**
   * 系统配置变化回调
   * 监听深色模式、语言等系统配置变化
   */
  onConfigurationUpdate(newConfig: Configuration): void {

    // 通知主题系统配置变化
    if (ThemeUtil.getThemeMode() === 'system') {
      const isDark = newConfig.colorMode === ConfigurationConstant.ColorMode.COLOR_MODE_DARK;
      // 触发主题更新
      ThemeUtil.onSystemConfigurationUpdate(isDark);
    }
  }
}
