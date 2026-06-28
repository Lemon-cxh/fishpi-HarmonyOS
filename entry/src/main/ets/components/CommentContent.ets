/**
 * 评论内容渲染组件
 * 使用自定义 HTML 解析，支持文本和图片混合渲染
 */

import { parseHtmlContent, ContentSegment } from '../util/HtmlParserUtil';

@Component
export struct CommentContent {
  @Prop htmlContent: string = '';
  @State segments: ContentSegment[] = [];

  aboutToAppear(): void {
    if (this.htmlContent) {
      this.segments = parseHtmlContent(this.htmlContent);
    }
  }

  build() {
    Column() {
      ForEach(this.segments, (segment: ContentSegment, index: number) => {
        if (segment.type === 'text') {
          Text(segment.content || '')
            .fontSize(14)
            .fontColor('#333333')
            .lineHeight(20)
            .width('100%')
        } else if (segment.type === 'image') {
          Image(segment.imageUrl || '')
            .width('100%')
            .constraintSize({ maxHeight: 150 })
            .objectFit(ImageFit.Contain)
            .margin({ top: 4, bottom: 4 })
        }
      }, (segment: ContentSegment, index: number) => `${index}_${segment.type}`)
    }
    .width('100%')
    .alignItems(HorizontalAlign.Start)
  }
}
