import { MessageGroup as MsgGroup, BubbleStyle, ChatMessage } from '../model/Message';
import { TimeDivider } from './TimeDivider';
import { MessageBubble } from './MessageBubble';
import { MessageGroupUtil } from '../util/MessageGroupUtil';

/**
 * 消息组组件
 * 包含头像、用户名和多个消息气泡
 */
@Component
export struct MessageGroupComponent {
  @Prop group: MsgGroup | null = null;

  build() {
    Column() {
      if (this.group === null) {
        // 空状态
      } else {
        // 时间分隔线
        if (this.group.showTime) {
          TimeDivider({ timeLabel: this.group.timeLabel })
        }

        // 消息组内容
        if (this.group.isSelf) {
          // 自己的消息：消息和头像都在右侧
          Row() {
            // 左侧空白区域
            Blank()
              .layoutWeight(1)

            // 右侧消息区域
            Column() {
              // 用户名
              Text(this.group.userName)
                .fontSize(14)
                .fontWeight(FontWeight.Medium)
                .fontColor('#1890FF')
                .margin({ bottom: 4 })

              // 消息气泡组
              Column({ space: 4 }) {
                ForEach(this.group.messages, (msg: ChatMessage, index: number) => {
                  MessageBubble({
                    message: msg,
                    isSelf: true,
                    bubbleStyle: MessageGroupUtil.getBubbleStyle(
                      index as number,
                      this.group!.messages.length,
                      true
                    ),
                    isRedPacket: MessageGroupUtil.isRedPacketMessage(msg)
                  })
                }, (msg: ChatMessage) => msg.oId)
              }
              .alignItems(HorizontalAlign.End)
              .width('100%')
            }
            .alignItems(HorizontalAlign.End)
            .constraintSize({ minWidth: 100, maxWidth: 280 })
            .margin({ right: 12 })

            // 头像
            Image(this.group.userAvatarURL || '')
              .width(40)
              .height(40)
              .borderRadius(20)
              .backgroundColor('#E8E8E8')
          }
          .width('100%')
          .alignItems(VerticalAlign.Top)
          .padding({ left: 16, right: 16 })
        } else {
          // 他人的消息：头像在左，消息在右
          Row() {
            // 头像
            Image(this.group.userAvatarURL || '')
              .width(40)
              .height(40)
              .borderRadius(20)
              .backgroundColor('#E8E8E8')

            Column() {
              // 用户名
              Text(this.group.userName)
                .fontSize(14)
                .fontWeight(FontWeight.Medium)
                .fontColor('#333333')
                .margin({ bottom: 4 })

              // 消息气泡组
              Column({ space: 4 }) {
                ForEach(this.group.messages, (msg: ChatMessage, index: number) => {
                  MessageBubble({
                    message: msg,
                    isSelf: false,
                    bubbleStyle: MessageGroupUtil.getBubbleStyle(
                      index as number,
                      this.group!.messages.length,
                      false
                    ),
                    isRedPacket: MessageGroupUtil.isRedPacketMessage(msg)
                  })
                }, (msg: ChatMessage) => msg.oId)
              }
              .alignItems(HorizontalAlign.Start)
            }
            .layoutWeight(1)
            .alignItems(HorizontalAlign.Start)
            .margin({ left: 12 })
          }
          .width('100%')
          .alignItems(VerticalAlign.Top)
          .padding({ left: 16, right: 16 })
        }
      }
    }
    .width('100%')
    .margin({ bottom: 12 })
  }
}
