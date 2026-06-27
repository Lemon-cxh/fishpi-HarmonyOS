import { HttpUtil, ApiResponse } from '../util/HttpUtil';
import { TimeUtil } from '../util/TimeUtil';
import { Breezemoon, BreezemoonListResponse } from '../model/Notification';

/**
 * 清风明月页面
 * 展示和发布清风明月动态
 */
@Entry
@Component
struct BreezemoonPage {
  @State breezemoons: Breezemoon[] = [];
  @State isLoading: boolean = false;
  @State showPublishDialog: boolean = false;
  @State publishContent: string = '';
  @State isPublishing: boolean = false;

  // 状态栏高度（用于避让）
  @StorageProp('topRectHeight') topRectHeight: number = 0;

  /**
   * 页面出现时加载数据
   */
  async aboutToAppear(): Promise<void> {
    await this.loadBreezemoons();
  }

  /**
   * 加载清风明月列表
   */
  private async loadBreezemoons(): Promise<void> {
    if (this.isLoading) return;

    this.isLoading = true;

    try {
      const response = await HttpUtil.get<BreezemoonListResponse>('/api/breezemoons');

      if (response.code === 0 && response.data) {
        this.breezemoons = response.data;
      }
    } catch (err) {
      // 加载清风明月失败
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * 发布清风明月
   */
  private async publish(): Promise<void> {
    const content = this.publishContent.trim();
    if (!content || this.isPublishing) return;

    this.isPublishing = true;

    try {
      const params = new Map<string, string>();
      params.set('breezemoonContent', content);
      const response = await HttpUtil.post<ApiResponse>('/breezemoon', params);

      if (response.code === 0) {
        this.publishContent = '';
        this.showPublishDialog = false;
        // 重新加载列表
        await this.loadBreezemoons();
      }
    } catch (err) {
      // 发布清风明月失败
    } finally {
      this.isPublishing = false;
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

        Text('清风明月')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .fontColor('#333333')
          .margin({ left: 16 })

        Blank()

        Text('发布')
          .fontSize(14)
          .fontColor('#1890FF')
          .onClick(() => {
            this.showPublishDialog = true;
          })
      }
      .width('100%')
      .height(56)
      .padding({ left: 16, right: 16 })
      .backgroundColor('#FFFFFF')
      .border({ width: { bottom: 0.5 }, color: '#E8E8E8' })

      // 列表内容
      if (this.isLoading && this.breezemoons.length === 0) {
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
      } else if (this.breezemoons.length === 0) {
        Column() {
          Text('🌙')
            .fontSize(48)
          Text('暂无清风明月')
            .fontSize(16)
            .fontColor('#999999')
            .margin({ top: 12 })
          Text('快去发布一条吧')
            .fontSize(14)
            .fontColor('#CCCCCC')
            .margin({ top: 8 })
        }
        .layoutWeight(1)
        .justifyContent(FlexAlign.Center)
      } else {
        List() {
          ForEach(this.breezemoons, (item: Breezemoon) => {
            ListItem() {
              this.BreezemoonItem(item)
            }
          }, (item: Breezemoon) => item.oId)
        }
        .layoutWeight(1)
        .width('100%')
        .backgroundColor('#F5F5F5')
      }

      // 发布弹窗
      if (this.showPublishDialog) {
        Column() {
          Column() {
            Text('发布清风明月')
              .fontSize(18)
              .fontWeight(FontWeight.Bold)
              .fontColor('#333333')
              .margin({ bottom: 16 })

            TextInput({ placeholder: '写下你的想法...', text: this.publishContent })
              .type(InputType.Normal)
              .width('100%')
              .height(120)
              .backgroundColor('#F5F5F5')
              .borderRadius(8)
              .padding(12)
              .onChange((value: string) => {
                this.publishContent = value;
              })

            Row() {
              Button('取消')
                .type(ButtonType.Capsule)
                .layoutWeight(1)
                .height(40)
                .backgroundColor('#F5F5F5')
                .fontColor('#666666')
                .onClick(() => {
                  this.showPublishDialog = false;
                })

              Button(this.isPublishing ? '发布中...' : '发布')
                .type(ButtonType.Capsule)
                .layoutWeight(1)
                .height(40)
                .backgroundColor('#1890FF')
                .fontColor('#FFFFFF')
                .margin({ left: 12 })
                .enabled(!this.isPublishing && this.publishContent.trim().length > 0)
                .onClick(() => {
                  this.publish();
                })
            }
            .width('100%')
            .margin({ top: 16 })
          }
          .width('90%')
          .padding(20)
          .backgroundColor('#FFFFFF')
          .borderRadius(12)
        }
        .width('100%')
        .height('100%')
        .backgroundColor('#00000066')
        .justifyContent(FlexAlign.Center)
        .position({ x: 0, y: 0 })
      }
    }
    .width('100%')
    .height('100%')
    .padding({ top: this.getUIContext().px2vp(this.topRectHeight) })
  }

  /**
   * 清风明月项组件
   */
  @Builder
  BreezemoonItem(item: Breezemoon) {
    Column() {
      // 作者信息
      Row() {
        Image(item.breezemoonAuthorAvatarURL || '')
          .width(36)
          .height(36)
          .borderRadius(18)
          .backgroundColor('#E8E8E8')

        Column() {
          Text(item.breezemoonAuthorName)
            .fontSize(14)
            .fontWeight(FontWeight.Medium)
            .fontColor('#333333')

          Text(TimeUtil.formatTime(item.breezemoonCreateTime))
            .fontSize(12)
            .fontColor('#999999')
        }
        .alignItems(HorizontalAlign.Start)
        .margin({ left: 10 })
      }
      .width('100%')

      // 内容
      Text(item.breezemoonContent)
        .fontSize(15)
        .fontColor('#333333')
        .lineHeight(24)
        .margin({ top: 12 })
    }
    .width('100%')
    .padding(16)
    .backgroundColor('#FFFFFF')
    .margin({ bottom: 8 })
  }
}
