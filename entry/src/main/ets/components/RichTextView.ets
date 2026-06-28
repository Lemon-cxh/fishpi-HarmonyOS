/**
 * 富文本视图组件
 * 用于渲染HTML内容
 */

@Component
export struct RichTextView {
  @Prop htmlContent: string = '';
  @Prop fontSize: number = 14;
  @Prop fontColor: string = '#333333';
  @Prop containerWidth: number = 300;

  build() {
    // 简单实现：移除HTML标签，显示纯文本
    // TODO: 后续可以增强为支持更多HTML标签和样式
    Text(this.stripHtmlTags(this.htmlContent))
      .fontSize(this.fontSize)
      .fontColor(this.fontColor)
      .maxLines(20)
      .textOverflow({ overflow: TextOverflow.Ellipsis })
  }

  /**
   * 移除HTML标签
   */
  private stripHtmlTags(html: string): string {
    if (!html) return '';
    
    // 移除常见的HTML标签
    let text = html;
    text = text.replace(/<br\s*\/?>/gi, '\n');
    text = text.replace(/<\/p>/gi, '\n');
    text = text.replace(/<[^>]+>/g, '');
    
    // 解码HTML实体
    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&quot;/g, '"');
    text = text.replace(/&#39;/g, "'");
    
    return text.trim();
  }
}
