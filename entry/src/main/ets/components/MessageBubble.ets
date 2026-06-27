import { ChatMessage, BubbleStyle } from '../model/Message';
import { MessageContent } from './MessageContent';
import { MessageGroupUtil } from '../util/MessageGroupUtil';

/**
 * 消息气泡组件
 * 支持普通消息和红包消息
 */
@Component
export struct MessageBubble {
  @Prop message: ChatMessage | null = null;
  @Prop isSelf: boolean = false;
  @Prop bubbleStyle: BubbleStyle | null = null;
  @Prop isRedPacket: boolean = false;

  build() {
    Column() {
      if (this.message === null || this.bubbleStyle === null) {
        // 空状态
      } else if (this.isRedPacket) {
        // 红包消息样式
        Row() {
          Image($r('sys.symbol.gift'))
            .width(24)
            .height(24)
            .margin({ right: 8 })

          Column() {
            Text('红包')
              .fontSize(15)
              .fontColor('#FF4D4F')
              .fontWeight(FontWeight.Medium)

            if (this.message.content) {
              Text(this.message.content)
                .fontSize(13)
                .fontColor('#FF4D4F')
                .maxLines(2)
                .textOverflow({ overflow: TextOverflow.Ellipsis })
                .margin({ top: 4 })
            }
          }
          .alignItems(HorizontalAlign.Start)
          .layoutWeight(1)
        }
        .width('100%')
        .padding(12)
        .backgroundColor('#FFF1F0')
        .border({ width: 1, color: '#FF4D4F' })
        .borderRadius({
          topLeft: this.bubbleStyle.topLeft,
          topRight: this.bubbleStyle.topRight,
          bottomLeft: this.bubbleStyle.bottomLeft,
          bottomRight: this.bubbleStyle.bottomRight
        })
      } else {
        // 普通消息样式
        Column() {
          MessageContent({ 
            content: this.message.content, 
            md: this.message.md 
          })
        }
        .padding({ left: 12, right: 12, top: 8, bottom: 8 })
        .backgroundColor(this.isSelf ? '#E3F2FD' : '#F0F0F0')
        .borderRadius({
          topLeft: this.bubbleStyle.topLeft,
          topRight: this.bubbleStyle.topRight,
          bottomLeft: this.bubbleStyle.bottomLeft,
          bottomRight: this.bubbleStyle.bottomRight
        })
        .constraintSize({ maxWidth: '70%' })
      }
    }
    .alignItems(this.isSelf ? HorizontalAlign.End : HorizontalAlign.Start)
  }
}
