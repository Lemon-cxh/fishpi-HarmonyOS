import { HttpUtil, ApiResponse } from '../util/HttpUtil';
import { StorageUtil } from '../util/StorageUtil';
import { UserInfo } from '../model/User';

/**
 * 用户信息响应接口
 */
interface UserInfoResponse {
  code: number;
  data: UserInfo;
}

/**
 * 活跃度响应接口
 */
interface LivenessResponse {
  code: number;
  data: number;
}

/**
 * 活跃度领取状态响应接口
 */
interface LivenessCollectResponse {
  code: number;
  data: boolean;
}

/**
 * 个人中心页面
 * 展示用户信息、活跃度、功能菜单
 */
@Entry
@Component
struct ProfilePage {
  @State userInfo: UserInfo | null = null;
  @State liveness: number = 0;
  @State isLivenessCollected: boolean = false;
  @State isLoading: boolean = false;

  // 状态栏高度（用于避让）
  @StorageProp('topRectHeight') topRectHeight: number = 0;

  /**
   * 页面出现时加载数据
   */
  async aboutToAppear(): Promise<void> {
    await this.loadUserInfo();
    await this.loadLiveness();
  }

  /**
   * 加载用户信息
   */
  private async loadUserInfo(): Promise<void> {
    this.isLoading = true;

    try {
      const response = await HttpUtil.get<UserInfoResponse>('/api/user');

      if (response.code === 0 && response.data) {
        this.userInfo = response.data;
        // 保存用户信息
        await StorageUtil.set(StorageUtil.KEY_USER_NAME, response.data.userName);
        await StorageUtil.set(StorageUtil.KEY_USER_AVATAR, response.data.userAvatarURL);
      }
    } catch (err) {
      // 加载用户信息失败
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * 加载活跃度
   */
  private async loadLiveness(): Promise<void> {
    try {
      const response = await HttpUtil.get<LivenessResponse>('/user/liveness');

      if (response.code === 0) {
        this.liveness = response.data;
      }

      // 检查是否已领取
      const collectResponse = await HttpUtil.get<LivenessCollectResponse>('/api/activity/is-collected-liveness');
      if (collectResponse.code === 0) {
        this.isLivenessCollected = collectResponse.data;
      }
    } catch (err) {
      // 加载活跃度失败
    }
  }

  /**
   * 领取昨日活跃度奖励
   */
  private async collectLiveness(): Promise<void> {
    if (this.isLivenessCollected) return;

    try {
      const response = await HttpUtil.get<ApiResponse>('/activity/yesterday-liveness-reward-api');

      if (response.code === 0) {
        this.isLivenessCollected = true;
      }
    } catch (err) {
      // 领取活跃度失败
    }
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

  build() {
    Column() {
      // 顶部标题栏
      Row() {
        Text('我的')
          .fontSize(20)
          .fontWeight(FontWeight.Bold)
          .fontColor('#333333')

        Blank()

        Text('设置')
          .fontSize(14)
          .fontColor('#1890FF')
          .onClick(() => {
            try {
              this.getUIContext().getRouter().pushUrl({ url: 'pages/SettingsPage' });
            } catch (err) {
              // 路由跳转失败
            }
          })
      }
      .width('100%')
      .height(56)
      .padding({ left: 16, right: 16 })
      .backgroundColor('#FFFFFF')

      // 内容区域
      List() {
        // 用户信息卡片
        ListItem() {
          this.UserCard()
        }

        // 活跃度卡片
        ListItem() {
          this.LivenessCard()
        }

        // 功能菜单
        ListItem() {
          this.MenuList()
        }

        // 退出登录
        ListItem() {
          Button('退出登录')
            .type(ButtonType.Capsule)
            .width('90%')
            .height(44)
            .backgroundColor('#FF4D4F')
            .fontColor('#FFFFFF')
            .fontSize(16)
            .margin({ top: 20, left: '5%' })
            .onClick(() => {
              this.logout();
            })
        }
      }
      .layoutWeight(1)
      .width('100%')
      .backgroundColor('#F5F5F5')
    }
    .width('100%')
    .height('100%')
    .padding({ top: this.getUIContext().px2vp(this.topRectHeight) })
  }

  /**
   * 用户信息卡片
   */
  @Builder
  UserCard() {
    Row() {
      // 头像
      Image(this.userInfo?.userAvatarURL || '')
        .width(64)
        .height(64)
        .borderRadius(32)
        .backgroundColor('#E8E8E8')

      Column() {
        // 用户名
        Text(this.userInfo?.userName || '加载中...')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .fontColor('#333333')

        // 昵称
        if (this.userInfo?.userNickname) {
          Text(this.userInfo.userNickname)
            .fontSize(14)
            .fontColor('#999999')
            .margin({ top: 4 })
        }

        // 积分
        Row() {
          Text('积分: ')
            .fontSize(14)
            .fontColor('#666666')
          Text((this.userInfo?.point || 0).toString())
            .fontSize(14)
            .fontColor('#1890FF')
            .fontWeight(FontWeight.Medium)
        }
        .margin({ top: 8 })
      }
      .alignItems(HorizontalAlign.Start)
      .margin({ left: 16 })
      .layoutWeight(1)

      // 箭头
      Text('>')
        .fontSize(16)
        .fontColor('#CCCCCC')
    }
    .width('100%')
    .padding(16)
    .backgroundColor('#FFFFFF')
    .onClick(() => {
      try {
        this.getUIContext().getRouter().pushUrl({ url: 'pages/UserDetailPage', params: { userName: this.userInfo?.userName } });
      } catch (err) {
        // 路由跳转失败
      }
    })
  }

  /**
   * 活跃度卡片
   */
  @Builder
  LivenessCard() {
    Column() {
      Row() {
        Text('今日活跃度')
          .fontSize(14)
          .fontColor('#666666')

        Blank()

        if (this.isLivenessCollected) {
          Text('已领取 ✓')
            .fontSize(12)
            .fontColor('#52C41A')
        } else {
          Button('领取奖励')
            .type(ButtonType.Capsule)
            .height(28)
            .fontSize(12)
            .backgroundColor('#1890FF')
            .fontColor('#FFFFFF')
            .onClick(() => {
              this.collectLiveness();
            })
        }
      }
      .width('100%')

      // 进度条
      Row() {
        Progress({ value: this.liveness, total: 100, type: ProgressType.Linear })
          .width('100%')
          .height(8)
          .color('#1890FF')
          .backgroundColor('#E8E8E8')
      }
      .width('100%')
      .margin({ top: 12 })

      Text(`${this.liveness}%`)
        .fontSize(12)
        .fontColor('#999999')
        .margin({ top: 8 })
        .alignSelf(ItemAlign.End)
    }
    .width('100%')
    .padding(16)
    .backgroundColor('#FFFFFF')
    .margin({ top: 12 })
  }

  /**
   * 功能菜单列表
   */
  @Builder
  MenuList() {
    Column() {
      this.MenuItem('📝', '我的文章', () => {
        // TODO: 跳转我的文章
      })

      this.MenuItem('🌙', '我的清风明月', () => {
        try {
          this.getUIContext().getRouter().pushUrl({ url: 'pages/BreezemoonPage' });
        } catch (err) {
          // 路由跳转失败
        }
      })

      this.MenuItem('👥', '我的关注', () => {
        // TODO: 跳转关注列表
      })

      this.MenuItem('💰', '积分转账', () => {
        try {
          this.getUIContext().getRouter().pushUrl({ url: 'pages/TransferPage' });
        } catch (err) {
          // 路由跳转失败
        }
      })

      this.MenuItem('🔔', '通知中心', () => {
        try {
          this.getUIContext().getRouter().pushUrl({ url: 'pages/NotificationPage' });
        } catch (err) {
          // 路由跳转失败
        }
      })

      this.MenuItem('⚙️', '设置', () => {
        try {
          this.getUIContext().getRouter().pushUrl({ url: 'pages/SettingsPage' });
        } catch (err) {
          // 路由跳转失败
        }
      })
    }
    .width('100%')
    .backgroundColor('#FFFFFF')
    .margin({ top: 12 })
  }

  /**
   * 菜单项组件
   */
  @Builder
  MenuItem(icon: string, title: string, onClick: () => void) {
    Row() {
      Text(icon)
        .fontSize(20)
        .margin({ right: 12 })

      Text(title)
        .fontSize(15)
        .fontColor('#333333')
        .layoutWeight(1)

      Text('>')
        .fontSize(14)
        .fontColor('#CCCCCC')
    }
    .width('100%')
    .height(56)
    .padding({ left: 16, right: 16 })
    .border({ width: { bottom: 0.5 }, color: '#F0F0F0' })
    .onClick(onClick)
  }
}
