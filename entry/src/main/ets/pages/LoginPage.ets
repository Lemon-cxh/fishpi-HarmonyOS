import { HttpUtil, ApiResponse } from '../util/HttpUtil';
import { StorageUtil } from '../util/StorageUtil';
import { ThemeUtil, LightColorScheme, DarkColorScheme, ColorScheme } from '../util/ThemeUtil';
import { CryptoUtil } from '../util/CryptoUtil';
import { LoginResponse, UserInfo, UserInfoResponse } from '../model/User';
import { Spacing, BorderRadius, FontSize, ComponentSize, AnimationDuration } from '../constants/DesignTokens';
import { hilog } from '@kit.PerformanceAnalysisKit';

/**
 * 登录页面
 * 符合鸿蒙设计规范的登录界面
 */
@Entry
@Component
struct LoginPage {
  @State username: string = '';
  @State password: string = '';
  @State isLoading: boolean = false;
  @State errorMessage: string = '';
  @State isPressed: boolean = false;
  @State isDark: boolean = false;
  @State colors: ColorScheme = LightColorScheme; // 初始化为浅色主题

  // 状态栏高度（用于避让）
  @StorageProp('topRectHeight') topRectHeight: number = 0;

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
      } catch (err) {
        hilog.error(0x0000, 'LoginPage', `Router error: ${err}`);
      }
    } else {
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
          } else {
            // 如果获取用户信息失败，使用登录时输入的用户名
            await StorageUtil.set(StorageUtil.KEY_USER_NAME, this.username.trim());
          }
        } catch (err) {
          // 如果获取用户信息失败，使用登录时输入的用户名
          await StorageUtil.set(StorageUtil.KEY_USER_NAME, this.username.trim());
        }
        
        hilog.info(0x0000, 'LoginPage', 'apiKey saved to storage');

        // 跳转到主页
        try {
          this.getUIContext().getRouter().replaceUrl({ url: 'pages/MainPage' });
        } catch (err) {
          // 路由跳转失败
        }
      } else {
        this.errorMessage = response.msg || '登录失败，请检查账号密码';
      }
    } catch (err) {
      this.errorMessage = '网络错误，请稍后重试';
    } finally {
      this.isLoading = false;
    }
  }

  build() {
    Column() {
      // 状态栏占位
      Row()
        .width('100%')
        .height(this.getUIContext().px2vp(this.topRectHeight))

      // 顶部Logo区域
      Column() {
        // 应用图标 - 使用沉浸光感效果
        Stack() {
          // 光晕背景
          Circle()
            .width(120)
            .height(120)
            .fill(this.colors.primary)
            .opacity(0.1)

          // 图标
          Image($r('app.media.icon'))
            .width(80)
            .height(80)
            .borderRadius(BorderRadius.XL)
        }
        .width(120)
        .height(120)

        Text('摸鱼派')
          .fontSize(FontSize.XXXL)
          .fontWeight(700)
          .fontColor(this.colors.textPrimary)
          .margin({ top: Spacing.LG })

        Text('记录你的摸鱼生活')
          .fontSize(FontSize.MD)
          .fontColor(this.colors.textTertiary)
          .margin({ top: Spacing.SM })
      }
      .margin({ top: 60, bottom: 48 })

      // 输入区域
      Column() {
        // 用户名输入框
        Column() {
          Text('用户名')
            .fontSize(FontSize.SM)
            .fontColor(this.colors.textSecondary)
            .margin({ bottom: Spacing.SM })

          TextInput({ placeholder: '请输入用户名', text: this.username })
            .type(InputType.Normal)
            .height(ComponentSize.INPUT_LG)
            .width('100%')
            .backgroundColor(this.colors.surfaceSecondary)
            .borderRadius(BorderRadius.MD)
            .padding({ left: Spacing.LG, right: Spacing.LG })
            .fontColor(this.colors.textPrimary)
            .placeholderColor(this.colors.textTertiary)
            .onChange((value: string) => {
              this.username = value;
            })
        }
        .width('100%')
        .margin({ bottom: Spacing.LG })

        // 密码输入框
        Column() {
          Text('密码')
            .fontSize(FontSize.SM)
            .fontColor(this.colors.textSecondary)
            .margin({ bottom: Spacing.SM })

          TextInput({ placeholder: '请输入密码', text: this.password })
            .type(InputType.Password)
            .height(ComponentSize.INPUT_LG)
            .width('100%')
            .backgroundColor(this.colors.surfaceSecondary)
            .borderRadius(BorderRadius.MD)
            .padding({ left: Spacing.LG, right: Spacing.LG })
            .fontColor(this.colors.textPrimary)
            .placeholderColor(this.colors.textTertiary)
            .onChange((value: string) => {
              this.password = value;
            })
        }
        .width('100%')
        .margin({ bottom: Spacing.LG })

        // 错误提示
        if (this.errorMessage) {
          Row() {
            Text('⚠️')
              .fontSize(FontSize.SM)
            Text(this.errorMessage)
              .fontSize(FontSize.SM)
              .fontColor(this.colors.error)
              .margin({ left: Spacing.XS })
          }
          .width('100%')
          .padding(Spacing.MD)
          .backgroundColor(this.colors.error + '15')
          .borderRadius(BorderRadius.SM)
          .margin({ bottom: Spacing.LG })
        }

        // 登录按钮 - 智感握姿：根据握持模式调整位置
        Button(this.isLoading ? '登录中...' : '登录')
          .type(ButtonType.Capsule)
          .width('100%')
          .height(ComponentSize.BUTTON_LG)
          .backgroundColor(this.colors.primary)
          .fontColor(this.colors.textInverse)
          .fontSize(FontSize.LG)
          .fontWeight(500)
          .enabled(!this.isLoading)
          .opacity(this.isLoading ? 0.7 : 1)
          .scale({
            x: this.isPressed ? 0.98 : 1,
            y: this.isPressed ? 0.98 : 1
          })
          .animation({
            duration: AnimationDuration.FAST,
            curve: Curve.EaseInOut
          })
          .onTouch((event) => {
            if (event.type === TouchType.Down) {
              this.isPressed = true;
            } else if (event.type === TouchType.Up || event.type === TouchType.Cancel) {
              this.isPressed = false;
            }
          })
          .onClick(() => {
            this.handleLogin();
          })

        // 注册入口
        Row() {
          Text('还没有账号？')
            .fontSize(FontSize.MD)
            .fontColor(this.colors.textTertiary)
          Text('去注册')
            .fontSize(FontSize.MD)
            .fontColor(this.colors.primary)
            .margin({ left: Spacing.XS })
            .onClick(() => {
              // 跳转到注册页面或打开网页
              try {
                this.getUIContext().getRouter().pushUrl({ url: 'pages/RegisterPage' });
              } catch (err) {
                // 路由跳转失败
              }
            })
        }
        .margin({ top: Spacing.XL })
      }
      .padding({ left: Spacing.XL, right: Spacing.XL })
      .width('100%')

      Blank()
    }
    .width('100%')
    .height('100%')
    .backgroundColor(this.colors.background)
  }
}
