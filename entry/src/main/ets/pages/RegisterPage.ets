import { HttpUtil, ApiResponse } from '../util/HttpUtil';
import { Logger } from '../util/Logger';

/**
 * 注册页面
 */
@Entry
@Component
struct RegisterPage {
  @State userName: string = '';
  @State userPass: string = '';
  @State confirmPass: string = '';
  @State isLoading: boolean = false;
  @State errorMsg: string = '';

  // 状态栏高度（用于避让）
  @StorageProp('topRectHeight') topRectHeight: number = 0;

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
        } catch (err) {
          Logger.error('RegisterPage', 'Router back failed: ' + String(err));
        }
      } else {
        this.errorMsg = response.msg || '注册失败';
      }
    } catch (err) {
      Logger.error('RegisterPage', '注册请求失败: ' + String(err));
      this.errorMsg = '网络错误，请重试';
    } finally {
      this.isLoading = false;
    }
  }

  build() {
    Column() {
      // 标题
      Text('注册账号')
        .fontSize(28)
        .fontWeight(FontWeight.Bold)
        .margin({ top: 80, bottom: 40 })

      // 用户名输入框
      TextInput({ placeholder: '用户名' })
        .width('80%')
        .height(50)
        .margin({ bottom: 20 })
        .onChange((value: string) => {
          this.userName = value;
        })

      // 密码输入框
      TextInput({ placeholder: '密码' })
        .width('80%')
        .height(50)
        .type(InputType.Password)
        .margin({ bottom: 20 })
        .onChange((value: string) => {
          this.userPass = value;
        })

      // 确认密码输入框
      TextInput({ placeholder: '确认密码' })
        .width('80%')
        .height(50)
        .type(InputType.Password)
        .margin({ bottom: 20 })
        .onChange((value: string) => {
          this.confirmPass = value;
        })

      // 错误提示
      if (this.errorMsg) {
        Text(this.errorMsg)
          .fontColor(Color.Red)
          .fontSize(14)
          .margin({ bottom: 20 })
      }

      // 注册按钮
      Button(this.isLoading ? '注册中...' : '注册')
        .width('80%')
        .height(50)
        .enabled(!this.isLoading)
        .onClick(() => {
          this.handleRegister();
        })
        .margin({ bottom: 20 })

      // 返回登录
      Text('已有账号？返回登录')
        .fontColor('#1890FF')
        .fontSize(14)
        .onClick(() => {
          try {
            this.getUIContext().getRouter().back();
          } catch (err) {
            Logger.error('RegisterPage', 'Router back failed: ' + String(err));
          }
        })
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F5F5F5')
    .padding({ top: this.getUIContext().px2vp(this.topRectHeight) })
  }
}
