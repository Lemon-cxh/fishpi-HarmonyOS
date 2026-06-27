import { HttpUtil, ApiResponse } from '../util/HttpUtil';
import { TimeUtil } from '../util/TimeUtil';
import { Notification, NotificationListResponse, NotificationType } from '../model/Notification';

/**
 * Tab配置接口
 */
interface NotificationTabConfig {
  title: string;
  type: NotificationType;
}

/**
 * 通知页面
 * 展示@我、评论、系统通知
 */
@Entry
@Component
struct NotificationPage {
  @State notifications: Notification[] = [];
  @State currentTab: number = 0;
  @State isLoading: boolean = false;

  // 状态栏高度（用于避让）
  @StorageProp('topRectHeight') topRectHeight: number = 0;

  // Tab配置
  private tabs: NotificationTabConfig[] = [
    { title: '@我', type: 'at' as NotificationType },
    { title: '评论', type: 'comment' as NotificationType },
    { title: '系统', type: 'sys' as NotificationType }
  ];

  /**
   * 页面出现时加载数据
   */
  async aboutToAppear(): Promise<void> {
    await this.loadNotifications();
  }

  /**
   * 加载通知列表
   */
  private async loadNotifications(): Promise<void> {
    if (this.isLoading) return;

    this.isLoading = true;

    try {
      const response = await HttpUtil.get<NotificationListResponse>('/api/getNotifications');

      if (response.code === 0 && response.data) {
        // 根据当前Tab筛选
        const type = this.tabs[this.currentTab].type;
        this.notifications = response.data.filter(n => n.type === type);
      }
    } catch (err) {
      // 加载通知失败
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * 切换Tab
   */
  private switchTab(index: number): void {
    if (this.currentTab === index) return;

    this.currentTab = index;
    this.notifications = [];
    this.loadNotifications();
  }

  /**
   * 标记已读
   */
  private async markAsRead(type: NotificationType): Promise<void> {
    try {
      await HttpUtil.get<ApiResponse>(`/notifications/make-read/${type}`);
    } catch (err) {
      // 标记已读失败
    }
  }

  /**
   * 获取通知图标
   */
  private getNotificationIcon(type: NotificationType): string {
    switch (type) {
      case 'at': return '@';
      case 'comment': return '💬';
      case 'point': return '💰';
      case 'sys': return '🔔';
      case 'following': return '👥';
      default: return '📢';
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

        Text('通知中心')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .fontColor('#333333')
          .margin({ left: 16 })

        Blank()

        Text('全部已读')
          .fontSize(14)
          .fontColor('#1890FF')
          .onClick(() => {
            const type = this.tabs[this.currentTab].type;
            this.markAsRead(type);
          })
      }
      .width('100%')
      .height(56)
      .padding({ left: 16, right: 16 })
      .backgroundColor('#FFFFFF')

      // Tab栏
      Row() {
        ForEach(this.tabs, (tab: NotificationTabConfig, index: number) => {
          Column() {
            Text(tab.title)
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
            this.switchTab(index);
          })
        }, (tab: NotificationTabConfig, index: number) => `${tab.title}_${index}`)
      }
      .width('100%')
      .backgroundColor('#FFFFFF')
      .border({ width: { bottom: 0.5 }, color: '#E8E8E8' })

      // 通知列表
      if (this.isLoading && this.notifications.length === 0) {
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
      } else if (this.notifications.length === 0) {
        Column() {
          Text('🔔')
            .fontSize(48)
          Text('暂无通知')
            .fontSize(16)
            .fontColor('#999999')
            .margin({ top: 12 })
        }
        .layoutWeight(1)
        .justifyContent(FlexAlign.Center)
      } else {
        List() {
          ForEach(this.notifications, (notification: Notification) => {
            ListItem() {
              this.NotificationItem(notification)
            }
          }, (notification: Notification) => notification.oId)
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
   * 通知项组件
   */
  @Builder
  NotificationItem(notification: Notification) {
    Row() {
      // 图标
      Text(this.getNotificationIcon(notification.type))
        .fontSize(20)
        .width(40)
        .height(40)
        .textAlign(TextAlign.Center)
        .backgroundColor('#F5F5F5')
        .borderRadius(20)

      Column() {
        // 内容
        Text(notification.content)
          .fontSize(14)
          .fontColor('#333333')
          .maxLines(2)
          .textOverflow({ overflow: TextOverflow.Ellipsis })

        // 时间
        Text(TimeUtil.formatTime(notification.time))
          .fontSize(12)
          .fontColor('#CCCCCC')
          .margin({ top: 6 })
      }
      .layoutWeight(1)
      .margin({ left: 12 })
      .alignItems(HorizontalAlign.Start)

      // 未读标记
      if (!notification.read) {
        Circle()
          .width(8)
          .height(8)
          .fill('#FF4D4F')
      }
    }
    .width('100%')
    .padding(16)
    .backgroundColor('#FFFFFF')
    .margin({ bottom: 1 })
  }
}
