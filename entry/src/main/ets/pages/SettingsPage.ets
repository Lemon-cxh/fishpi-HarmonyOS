import { StorageUtil } from '../util/StorageUtil';
import { HttpUtil } from '../util/HttpUtil';
import { ThemeUtil, ThemeMode, LightColorScheme, DarkColorScheme } from '../util/ThemeUtil';
import { Spacing, BorderRadius, FontSize, ComponentSize } from '../constants/DesignTokens';

/**
 * 设置页面
 * 支持深色模式切换、消息通知设置
 */
@Entry
@Component
struct SettingsPage {
  @State isDarkMode: boolean = false;
  @State themeMode: ThemeMode = ThemeMode.SYSTEM;
  @State isNotificationEnabled: boolean = true;
  @State userName: string = '';

  // 状态栏高度（用于避让）
  @StorageProp('topRectHeight') topRectHeight: number = 0;

  // 色彩方案
  private get colors() {
    return this.isDarkMode ? DarkColorScheme : LightColorScheme;
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
    } catch (err) {
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

  build() {
    Column() {
      // 顶部导航栏
      Row() {
        Text('返回')
          .fontSize(FontSize.LG)
          .fontColor(this.colors.primary)
          .onClick(() => {
            try {
              this.getUIContext().getRouter().back();
            } catch (err) {
              // 路由返回失败
            }
          })

        Text('设置')
          .fontSize(FontSize.XL)
          .fontWeight(700)
          .fontColor(this.colors.textPrimary)
          .margin({ left: Spacing.LG })

        Blank()
      }
      .width('100%')
      .height(ComponentSize.LIST_ITEM)
      .padding({ left: Spacing.LG, right: Spacing.LG })
      .backgroundColor(this.colors.surface)

      // 设置列表
      List() {
        // 账号信息
        ListItem() {
          this.SettingItem('账号', this.userName)
        }

        // 主题模式选择
        ListItem() {
          this.ThemeModeSelector()
        }

        // 消息通知
        ListItem() {
          Row() {
            Text('消息通知')
              .fontSize(FontSize.LG)
              .fontColor(this.colors.textPrimary)

            Blank()

            Toggle({ type: ToggleType.Switch, isOn: this.isNotificationEnabled })
              .selectedColor(this.colors.primary)
              .onChange((value: boolean) => {
                this.toggleNotification(value);
              })
          }
          .width('100%')
          .height(ComponentSize.LIST_ITEM)
          .padding({ left: Spacing.LG, right: Spacing.LG })
          .backgroundColor(this.colors.surface)
        }

        // 清除缓存
        ListItem() {
          this.SettingItem('清除缓存', '', () => {
            this.clearCache();
          })
        }

        // 关于
        ListItem() {
          this.SettingItem('关于摸鱼派', 'v1.0.0')
        }

        // 退出登录
        ListItem() {
          Button('退出登录')
            .type(ButtonType.Capsule)
            .width('90%')
            .height(ComponentSize.BUTTON_LG)
            .backgroundColor(this.colors.error)
            .fontColor('#FFFFFF')
            .fontSize(FontSize.LG)
            .margin({ top: Spacing.XL, left: '5%' })
            .onClick(() => {
              this.logout();
            })
        }
      }
      .layoutWeight(1)
      .width('100%')
      .backgroundColor(this.colors.backgroundSecondary)
    }
    .width('100%')
    .height('100%')
    .backgroundColor(this.colors.background)
    .padding({ top: this.getUIContext().px2vp(this.topRectHeight) })
  }

  /**
   * 设置项组件
   */
  @Builder
  SettingItem(title: string, value: string, onClick?: () => void) {
    Row() {
      Text(title)
        .fontSize(FontSize.LG)
        .fontColor(this.colors.textPrimary)

      Blank()

      if (value) {
        Text(value)
          .fontSize(FontSize.MD)
          .fontColor(this.colors.textTertiary)
      }

      Text('>')
        .fontSize(FontSize.MD)
        .fontColor(this.colors.textTertiary)
        .margin({ left: Spacing.SM })
    }
    .width('100%')
    .height(ComponentSize.LIST_ITEM)
    .padding({ left: Spacing.LG, right: Spacing.LG })
    .backgroundColor(this.colors.surface)
    .onClick(onClick)
  }

  /**
   * 主题模式选择器
   */
  @Builder
  ThemeModeSelector() {
    Column() {
      Row() {
        Text('深色模式')
          .fontSize(FontSize.LG)
          .fontColor(this.colors.textPrimary)

        Blank()

        Text(this.getThemeModeText(this.themeMode))
          .fontSize(FontSize.MD)
          .fontColor(this.colors.textTertiary)
      }
      .width('100%')

      // 主题模式选项
      Row() {
        this.ThemeModeOption('浅色', ThemeMode.LIGHT)
        this.ThemeModeOption('深色', ThemeMode.DARK)
        this.ThemeModeOption('跟随系统', ThemeMode.SYSTEM)
      }
      .width('100%')
      .justifyContent(FlexAlign.SpaceBetween)
      .margin({ top: Spacing.MD })
    }
    .width('100%')
    .padding({ left: Spacing.LG, right: Spacing.LG, top: Spacing.MD, bottom: Spacing.MD })
    .backgroundColor(this.colors.surface)
  }

  /**
   * 主题模式选项
   */
  @Builder
  ThemeModeOption(label: string, mode: ThemeMode) {
    Column() {
      // 图标
      Text(mode === ThemeMode.LIGHT ? '☀️' : mode === ThemeMode.DARK ? '🌙' : '⚙️')
        .fontSize(24)

      Text(label)
        .fontSize(FontSize.SM)
        .fontColor(this.themeMode === mode ? this.colors.primary : this.colors.textSecondary)
        .margin({ top: Spacing.XS })
    }
    .width('30%')
    .padding(Spacing.MD)
    .borderRadius(BorderRadius.MD)
    .backgroundColor(this.themeMode === mode ? this.colors.primaryLight : 'transparent')
    .onClick(() => {
      this.setThemeMode(mode);
    })
  }
}
