/**
 * 消息内容渲染组件
 * 支持HTML、Markdown、图片
 */
@Component
export struct MessageContent {
  @Prop content: string = '';  // HTML内容
  @Prop md: string = '';       // Markdown内容
  @Prop maxImageWidth: number = 150;

  build() {
    Column() {
      if (this.md) {
        this.RenderContent(this.parseMarkdown(this.md))
      } else if (this.content) {
        this.RenderContent(this.parseHtml(this.content))
      }
    }
    .alignItems(HorizontalAlign.Start)
  }

  @Builder
  RenderContent(parts: ContentPart[]) {
    ForEach(parts, (part: ContentPart, index: number) => {
      if (part.type === 'image') {
        Image(part.content)
          .width(this.maxImageWidth)
          .objectFit(ImageFit.Contain)
          .borderRadius(8)
          .margin({ top: 4, bottom: 4 })
      } else if (part.type === 'link') {
        Text(part.text)
          .fontSize(14)
          .fontColor('#007AFF')
          .decoration({ type: TextDecorationType.Underline })
      } else if (part.type === 'code') {
        Text(part.text)
          .fontSize(13)
          .fontColor('#d63384')
          .backgroundColor('#f5f5f5')
          .padding({ left: 4, right: 4, top: 2, bottom: 2 })
          .borderRadius(4)
      } else {
        Text(part.text)
          .fontSize(14)
          .fontColor('#333333')
          .maxLines(20)
          .textOverflow({ overflow: TextOverflow.Ellipsis })
      }
    }, (part: ContentPart, index: number) => `${index}_${part.type}_${part.text || part.content}`)
  }

  // 解析Markdown
  parseMarkdown(md: string): ContentPart[] {
    const parts: ContentPart[] = [];
    let text = md;

    // 先提取图片 ![alt](url)
    const imgRegex = /!\[.*?\]\((.*?)\)/g;
    let imgMatch: RegExpExecArray | null = null;
    let lastIdx = 0;
    while ((imgMatch = imgRegex.exec(md)) !== null) {
      if (imgMatch.index > lastIdx) {
        parts.push(...this.parseInlineText(md.substring(lastIdx, imgMatch.index)));
      }
      parts.push({ type: 'image', content: imgMatch[1], text: '' });
      lastIdx = imgMatch.index + imgMatch[0].length;
    }
    if (lastIdx < md.length) {
      parts.push(...this.parseInlineText(md.substring(lastIdx)));
    }

    return parts.length > 0 ? parts : [{ type: 'text', text: md, content: '' }];
  }

  // 解析行内文本（链接、代码、加粗等）
  parseInlineText(text: string): ContentPart[] {
    const parts: ContentPart[] = [];
    let remaining = text;

    // 简单处理：按换行分割
    const lines = remaining.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (i > 0) {
        // 换行作为空格处理
      }
      const line = lines[i].trim();
      if (line) {
        // 检测链接 [text](url)
        const linkMatch = line.match(/\[(.*?)\]\((.*?)\)/);
        if (linkMatch) {
          parts.push({ type: 'link', text: linkMatch[1], content: linkMatch[2] });
        } else {
          parts.push({ type: 'text', text: line, content: '' });
        }
      }
    }

    return parts;
  }

  // 解析HTML
  parseHtml(html: string): ContentPart[] {
    const parts: ContentPart[] = [];
    let text = html;

    // 提取图片 <img src="url">
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    let imgMatch: RegExpExecArray | null = null;
    let lastIdx = 0;
    while ((imgMatch = imgRegex.exec(html)) !== null) {
      if (imgMatch.index > lastIdx) {
        const txt = this.stripHtmlTags(html.substring(lastIdx, imgMatch.index));
        if (txt.trim()) {
          parts.push({ type: 'text', text: txt.trim(), content: '' });
        }
      }
      parts.push({ type: 'image', content: imgMatch[1], text: '' });
      lastIdx = imgMatch.index + imgMatch[0].length;
    }
    if (lastIdx < html.length) {
      const txt = this.stripHtmlTags(html.substring(lastIdx));
      if (txt.trim()) {
        parts.push({ type: 'text', text: txt.trim(), content: '' });
      }
    }

    return parts.length > 0 ? parts : [{ type: 'text', text: this.stripHtmlTags(html), content: '' }];
  }

  // 移除HTML标签
  stripHtmlTags(html: string): string {
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&');
  }
}

interface ContentPart {
  type: 'text' | 'image' | 'link' | 'code';
  text: string;
  content: string;
}
