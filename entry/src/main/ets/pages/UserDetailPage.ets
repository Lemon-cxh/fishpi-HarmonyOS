import { HttpUtil, ApiResponse } from '../util/HttpUtil';
import { StorageUtil } from '../util/StorageUtil';
import { TimeUtil } from '../util/TimeUtil';
import { UserInfo } from '../model/User';
import { Breezemoon, BreezemoonListResponse } from '../model/Notification';

/**
 * 用户信息响应接口
 */
interface UserInfoDetailResponse {
  code: number;
  data: UserInfo;
}

/**
 * 用户详情页面
 * 展示用户信息、文章、清风明月
 */
@Entry
@Component
struct UserDetailPage {
  @State userInfo: UserInfo | null = null;
  @State breezemoons: Breezemoon[] = [];
  @State currentTab: number = 0;
  @State isLoading: boolean = false;
  @State isFollowing: boolean = false;
  @State userName: string = '';
  @State isSelf: boolean = false;

  // 状态栏高度（用于避让）
  @StorageProp('topRectHeight') topRectHeight: number = 0;

  // Tab配置
  private tabs = ['文章', '清风明月'];

  /**
   * 从路由参数获取用户名
   */
  async aboutToAppear(): Promise<void> {
    try {
      const params = this.getUIContext().getRouter().getParams() as Record<string, string>;
      this.userName = params?.userName || '';

      // 检查是否是自己
      const currentUserName = await StorageUtil.get(StorageUtil.KEY_USER_NAME);
      this.isSelf = this.userName === currentUserName;

      if (this.userName) {
        await this.loadUserInfo();
        await this.loadBreezemoons();
      }
    } catch (err) {
      // 获取路由参数失败
    }
  }

  /**
   * 加载用户信息
   */
  private async loadUserInfo(): Promise<void> {
    this.isLoading = true;

    try {
      const response = await HttpUtil.get<UserInfoDetailResponse>(`/user/${this.userName}`);

      if (response.code === 0 && response.data) {
        this.userInfo = response.data;
      }
    } catch (err) {
      // 加载用户信息失败
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * 加载清风明月
   */
  private async loadBreezemoons(): Promise<void> {
    try {
      const response = await HttpUtil.get<BreezemoonListResponse>(`/api/user/${this.userName}/breezemoons`);

      if (response.code === 0 && response.data) {
        this.breezemoons = response.data;
      }
    } catch (err) {
      // 加载清风明月失败
    }
  }

  /**
   * 关注/取消关注
   */
  private async toggleFollow(): Promise<void> {
    try {
      const path = this.isFollowing ? '/unfollow/user' : '/follow/user';
      const params = new Map<string, string>();
      params.set('userName', this.userName);
      const response = await HttpUtil.post<ApiResponse>(path, params);

      if (response.code === 0) {
        this.isFollowing = !this.isFollowing;
      }
    } catch (err) {
      // 关注/取消关注失败
    }
  }

  /**
   * 打开私聊
   */
  private openPrivateChat(): void {
    try {
      this.getUIContext().getRouter().pushUrl({
        url: 'pages/PrivateChatDetailPage',
        params: {
          userName: this.userName,
          avatar: this.userInfo?.userAvatarURL || ''
        }
      });
    } catch (err) {
      // 路由跳转失败
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
              // 路由返回失败
            }
          })

        Text(this.userName)
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

      if (this.isLoading) {
        Column() {
          LoadingProgress()
            .width(40)
            .height(40)
          Text('加载中...')
            .fontSize(14)
            .fontColor('#999999')
            .margin({ top: 12 })
        }
        .layoutWeight(1)
        .justifyContent(FlexAlign.Center)
      } else {
        List() {
          // 用户信息卡片
          ListItem() {
            this.UserCard()
          }

          // Tab栏
          ListItem() {
            Row() {
              ForEach(this.tabs, (tab: string, index: number) => {
                Column() {
                  Text(tab)
                    .fontSize(14)
                    .fontColor(this.currentTab === index ? '#1890FF' : '#666666')
                    .fontWeight(this.currentTab === index ? FontWeight.Medium : FontWeight.Normal)

                  if (this.currentTab === index) {
                    Divider()
                      .strokeWidth(2)
                      .color('#1890FF')
                      .width(24)
                      .margin({ top: 4 })
                  }
                }
                .layoutWeight(1)
                .justifyContent(FlexAlign.Center)
                .padding({ top: 12, bottom: 12 })
                .onClick(() => {
                  this.currentTab = index;
                })
              }, (tab: string, index: number) => `${tab}_${index}`)
            }
            .width('100%')
            .backgroundColor('#FFFFFF')
            .border({ width: { bottom: 0.5 }, color: '#E8E8E8' })
          }

          // 内容列表
          if (this.currentTab === 0) {
            // 文章列表（简化展示）
            ListItem() {
              Column() {
                Text('暂无文章')
                  .fontSize(14)
                  .fontColor('#999999')
                  .padding(40)
              }
              .width('100%')
              .justifyContent(FlexAlign.Center)
            }
          } else {
            // 清风明月列表
            ForEach(this.breezemoons, (item: Breezemoon) => {
              ListItem() {
                this.BreezemoonItem(item)
              }
            }, (item: Breezemoon) => item.oId)

            if (this.breezemoons.length === 0) {
              ListItem() {
                Column() {
                  Text('暂无清风明月')
                    .fontSize(14)
                    .fontColor('#999999')
                    .padding(40)
                }
                .width('100%')
                .justifyContent(FlexAlign.Center)
              }
            }
          }
        }
        .layoutWeight(1)
        .width('100%')
        .backgroundColor('#F5F5F5')
      }
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
    Column() {
      Row() {
        // 头像
        Image(this.userInfo?.userAvatarURL || '')
          .width(72)
          .height(72)
          .borderRadius(36)
          .backgroundColor('#E8E8E8')

        Column() {
          // 用户名
          Text(this.userInfo?.userName || '')
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

          // 个人简介
          if (this.userInfo?.userIntro) {
            Text(this.userInfo.userIntro)
              .fontSize(13)
              .fontColor('#666666')
              .maxLines(2)
              .textOverflow({ overflow: TextOverflow.Ellipsis })
              .margin({ top: 8 })
          }
        }
        .alignItems(HorizontalAlign.Start)
        .margin({ left: 16 })
        .layoutWeight(1)
      }
      .width('100%')

      // 统计信息
      Row() {
        Column() {
          Text((this.userInfo?.followingCount || 0).toString())
            .fontSize(16)
            .fontWeight(FontWeight.Medium)
            .fontColor('#333333')
          Text('关注')
            .fontSize(12)
            .fontColor('#999999')
        }
        .layoutWeight(1)

        Column() {
          Text((this.userInfo?.followerCount || 0).toString())
            .fontSize(16)
            .fontWeight(FontWeight.Medium)
            .fontColor('#333333')
          Text('粉丝')
            .fontSize(12)
            .fontColor('#999999')
        }
        .layoutWeight(1)

        Column() {
          Text((this.userInfo?.point || 0).toString())
            .fontSize(16)
            .fontWeight(FontWeight.Medium)
            .fontColor('#333333')
          Text('积分')
            .fontSize(12)
            .fontColor('#999999')
        }
        .layoutWeight(1)
      }
      .width('100%')
      .margin({ top: 20 })

      // 操作按钮
      if (!this.isSelf) {
        Row() {
          Button(this.isFollowing ? '已关注' : '关注')
            .type(ButtonType.Capsule)
            .layoutWeight(1)
            .height(36)
            .backgroundColor(this.isFollowing ? '#F5F5F5' : '#1890FF')
            .fontColor(this.isFollowing ? '#666666' : '#FFFFFF')
            .fontSize(14)
            .onClick(() => {
              this.toggleFollow();
            })

          Button('私聊')
            .type(ButtonType.Capsule)
            .layoutWeight(1)
            .height(36)
            .backgroundColor('#F5F5F5')
            .fontColor('#666666')
            .fontSize(14)
            .margin({ left: 12 })
            .onClick(() => {
              this.openPrivateChat();
            })
        }
        .width('100%')
        .margin({ top: 16 })
      }
    }
    .width('100%')
    .padding(16)
    .backgroundColor('#FFFFFF')
  }

  /**
   * 清风明月项组件
   */
  @Builder
  BreezemoonItem(item: Breezemoon) {
    Column() {
      Text(item.breezemoonContent)
        .fontSize(15)
        .fontColor('#333333')
        .lineHeight(24)

      Text(TimeUtil.formatTime(item.breezemoonCreateTime))
        .fontSize(12)
        .fontColor('#CCCCCC')
        .margin({ top: 8 })
    }
    .width('100%')
    .padding(16)
    .backgroundColor('#FFFFFF')
    .margin({ bottom: 1 })
  }
}
