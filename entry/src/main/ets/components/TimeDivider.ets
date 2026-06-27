/**
 * 时间分隔线组件
 * 显示消息时间分组标签
 */
@Component
export struct TimeDivider {
  @Prop timeLabel: string = '';

  build() {
    Row() {
      Text(this.timeLabel)
        .fontSize(12)
        .fontColor('#999999')
        .textAlign(TextAlign.Center)
    }
    .width('100%')
    .justifyContent(FlexAlign.Center)
    .margin({ top: 16, bottom: 16 })
  }
}
