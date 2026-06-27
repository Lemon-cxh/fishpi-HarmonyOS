import { HttpUtil, ApiResponse } from '../util/HttpUtil';

/**
 * 积分转账页面
 * 向其他用户转账积分
 */
@Entry
@Component
struct TransferPage {
  @State toUser: string = '';
  @State amount: string = '';
  @State memo: string = '';
  @State isLoading: boolean = false;
  @State errorMessage: string = '';
  @State successMessage: string = '';

  // 状态栏高度（用于避让）
  @StorageProp('topRectHeight') topRectHeight: number = 0;

  /**
   * 执行转账
   */
  private async transfer(): Promise<void> {
    // 验证输入
    if (!this.toUser.trim()) {
      this.errorMessage = '请输入接收方用户名';
      return;
    }

    const amountNum = Number(this.amount);
    if (!amountNum || amountNum <= 0) {
      this.errorMessage = '请输入有效的转账金额';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const params = new Map<string, string | number>();
      params.set('toUser', this.toUser.trim());
      params.set('amount', amountNum);
      params.set('memo', this.memo.trim());
      const response = await HttpUtil.post<ApiResponse>('/point/transfer', params);

      if (response.code === 0) {
        this.successMessage = '转账成功！';
        this.toUser = '';
        this.amount = '';
        this.memo = '';
      } else {
        this.errorMessage = response.msg || '转账失败';
      }
    } catch (err) {
      this.errorMessage = '网络错误，请稍后重试';
    } finally {
      this.isLoading = false;
    }
  }

  build() {
    Column() {
      // 顶部导航栏
      Row() {
        Text('返回')
          .fontSize(16)
          .fontColor('#1890FF')
          .onClick(() => {
            try {
              this.getUIContext().getRouter().back();
            } catch (err) {
              // 返回失败
            }
          })

        Text('积分转账')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .fontColor('#333333')
          .margin({ left: 16 })

        Blank()
      }
      .width('100%')
      .height(56)
      .padding({ left: 16, right: 16 })
      .backgroundColor('#FFFFFF')
      .border({ width: { bottom: 0.5 }, color: '#E8E8E8' })

      // 表单内容
      Column() {
        // 接收方
        Column() {
          Text('接收方用户名')
            .fontSize(14)
            .fontColor('#666666')
            .margin({ bottom: 8 })

          TextInput({ placeholder: '请输入用户名', text: this.toUser })
            .type(InputType.Normal)
            .height(44)
            .width('100%')
            .backgroundColor('#F5F5F5')
            .borderRadius(8)
            .padding({ left: 12, right: 12 })
            .onChange((value: string) => {
              this.toUser = value;
            })
        }
        .width('100%')
        .margin({ bottom: 20 })

        // 转账金额
        Column() {
          Text('转账金额')
            .fontSize(14)
            .fontColor('#666666')
            .margin({ bottom: 8 })

          TextInput({ placeholder: '请输入积分数量', text: this.amount })
            .type(InputType.Number)
            .height(44)
            .width('100%')
            .backgroundColor('#F5F5F5')
            .borderRadius(8)
            .padding({ left: 12, right: 12 })
            .onChange((value: string) => {
              this.amount = value;
            })
        }
        .width('100%')
        .margin({ bottom: 20 })

        // 备注
        Column() {
          Text('备注（可选）')
            .fontSize(14)
            .fontColor('#666666')
            .margin({ bottom: 8 })

          TextInput({ placeholder: '请输入转账备注', text: this.memo })
            .type(InputType.Normal)
            .height(44)
            .width('100%')
            .backgroundColor('#F5F5F5')
            .borderRadius(8)
            .padding({ left: 12, right: 12 })
            .onChange((value: string) => {
              this.memo = value;
            })
        }
        .width('100%')
        .margin({ bottom: 20 })

        // 错误提示
        if (this.errorMessage) {
          Text(this.errorMessage)
            .fontSize(14)
            .fontColor('#FF4D4F')
            .margin({ bottom: 16 })
        }

        // 成功提示
        if (this.successMessage) {
          Text(this.successMessage)
            .fontSize(14)
            .fontColor('#52C41A')
            .margin({ bottom: 16 })
        }

        // 转账按钮
        Button(this.isLoading ? '转账中...' : '确认转账')
          .type(ButtonType.Capsule)
          .width('100%')
          .height(48)
          .backgroundColor('#1890FF')
          .fontColor('#FFFFFF')
          .fontSize(16)
          .enabled(!this.isLoading)
          .onClick(() => {
            this.transfer();
          })

        // 提示信息
        Text('转账操作不可撤销，请确认信息无误后再进行转账')
          .fontSize(12)
          .fontColor('#999999')
          .margin({ top: 16 })
      }
      .width('100%')
      .padding(16)
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#FFFFFF')
    .padding({ top: this.getUIContext().px2vp(this.topRectHeight) })
  }
}
