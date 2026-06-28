/**
 * StyledString 工具类
 * 用于处理富文本内容，支持HTML、图片、链接等
 */

import { LengthMetrics } from '@kit.ArkUI';

/**
 * 自定义Span数据结构
 */
export interface CustomSpan {
  content: string;      // 文本内容
  url?: string;         // 链接地址
  imageUrl?: string;    // 图片地址
  isImage?: boolean;    // 是否为图片
}

/**
 * HTML元素类型
 */
interface HtmlElement {
  type: 'text' | 'link' | 'image';
  content: string;
  url?: string;
}

/**
 * HTML匹配项类型
 */
interface HtmlMatch {
  type: 'image' | 'link' | 'tag';
  start: number;
  end: number;
  url?: string;
  content?: string;
}

/**
 * StyledString 工具类
 * 提供HTML解析和StyledString生成功能
 */
export class StyledStringUtil {
  /**
   * 解析HTML内容，提取文本、链接、图片等元素
   * 
   * @param html HTML内容
   * @returns HTML元素数组
   */
  static parseHtml(html: string): HtmlElement[] {
    if (!html) {
      return [];
    }

    const elements: HtmlElement[] = [];
    let currentIndex = 0;
    const htmlLength = html.length;

    // 正则表达式匹配各种HTML标签
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi;
    const tagRegex = /<\/?[^>]+>/g;

    // 创建所有匹配项的数组
    const matches: HtmlMatch[] = [];

    // 匹配图片
    let match: RegExpExecArray | null = imgRegex.exec(html);
    while (match !== null) {
      matches.push({
        type: 'image',
        start: match.index,
        end: match.index + match[0].length,
        url: match[1]
      });
      match = imgRegex.exec(html);
    }

    // 匹配链接
    linkRegex.lastIndex = 0;
    match = linkRegex.exec(html);
    while (match !== null) {
      matches.push({
        type: 'link',
        start: match.index,
        end: match.index + match[0].length,
        url: match[1],
        content: match[2]
      });
      match = linkRegex.exec(html);
    }

    // 匹配其他标签
    tagRegex.lastIndex = 0;
    match = tagRegex.exec(html);
    while (match !== null) {
      // 检查是否已经被图片或链接匹配
      const isOverlap = matches.some(m => 
        match!.index >= m.start && match!.index < m.end
      );
      if (!isOverlap) {
        matches.push({
          type: 'tag',
          start: match.index,
          end: match.index + match[0].length
        });
      }
      match = tagRegex.exec(html);
    }

    // 按位置排序
    matches.sort((a, b) => a.start - b.start);

    // 构建元素数组
    let lastEnd = 0;
    for (const m of matches) {
      // 添加标签前的文本
      if (m.start > lastEnd) {
        const text = html.substring(lastEnd, m.start);
        if (text.trim()) {
          elements.push({
            type: 'text',
            content: StyledStringUtil.decodeHtmlEntities(text)
          });
        }
      }

      // 添加元素
      if (m.type === 'image') {
        elements.push({
          type: 'image',
          content: '',
          url: m.url
        });
      } else if (m.type === 'link') {
        elements.push({
          type: 'link',
          content: StyledStringUtil.decodeHtmlEntities(m.content || ''),
          url: m.url
        });
      }

      lastEnd = m.end;
    }

    // 添加最后的文本
    if (lastEnd < htmlLength) {
      const text = html.substring(lastEnd);
      if (text.trim()) {
        elements.push({
          type: 'text',
          content: StyledStringUtil.decodeHtmlEntities(text)
        });
      }
    }

    return elements;
  }

  /**
   * 解码HTML实体
   * 
   * @param text 包含HTML实体的文本
   * @returns 解码后的文本
   */
  static decodeHtmlEntities(text: string): string {
    if (!text) {
      return text;
    }

    let result = text;

    // 数字实体 &#123;
    result = result.replace(/&#(\d+);/g, (match: string, code: string) => {
      const charCode = parseInt(code, 10);
      if (charCode > 0 && charCode < 65536) {
        return String.fromCharCode(charCode);
      }
      return match;
    });

    // 十六进制实体 &#x1F600;
    result = result.replace(/&#x([0-9a-fA-F]+);/g, (match: string, code: string) => {
      const charCode = parseInt(code, 16);
      if (charCode > 0 && charCode < 65536) {
        return String.fromCharCode(charCode);
      }
      return match;
    });

    // 常用命名实体
    const entities: Record<string, string> = {
      '&nbsp;': ' ',
      '&lt;': '<',
      '&gt;': '>',
      '&amp;': '&',
      '&quot;': '"',
      '&apos;': "'",
      '&#39;': "'"
    };

    // 替换命名实体
    const entityKeys: string[] = ['&nbsp;', '&lt;', '&gt;', '&amp;', '&quot;', '&apos;', '&#39;'];
    for (let i = 0; i < entityKeys.length; i++) {
      const entity = entityKeys[i];
      result = result.split(entity).join(entities[entity]);
    }

    return result;
  }

  /**
   * 生成点击样式（用于链接）
   * 
   * @param url 链接地址
   * @param onClick 点击回调
   * @returns GestureStyle对象
   */
  static generateClickStyle(url: string, onClick?: (url: string) => void): GestureStyle {
    return new GestureStyle({
      onClick: () => {
        if (onClick) {
          onClick(url);
        }
      }
    });
  }

  /**
   * 生成文本样式
   * 
   * @param fontColor 字体颜色
   * @param fontSize 字体大小
   * @returns TextStyle对象
   */
  static generateTextStyle(fontColor: string | Resource, fontSize: number): TextStyle {
    return new TextStyle({
      fontColor: fontColor,
      fontSize: LengthMetrics.fp(fontSize)
    });
  }

  /**
   * 处理HTML内容，生成StyledString数组
   * 
   * @param html HTML内容
   * @param onLinkClick 链接点击回调
   * @param linkColor 链接颜色
   * @param linkFontSize 链接字体大小
   * @returns MutableStyledString数组
   */
  static handleHtml(
    html: string,
    onLinkClick?: (url: string) => void,
    linkColor: string | Resource = '#1890FF',
    linkFontSize: number = 14
  ): MutableStyledString[] {
    const styledStrings: MutableStyledString[] = [];
    const elements = StyledStringUtil.parseHtml(html);

    for (const element of elements) {
      if (element.type === 'image' && element.url) {
        // 处理图片
        styledStrings.push(new MutableStyledString(new ImageAttachment({
          resourceValue: element.url,
          size: {
            width: 200,
            height: 150
          },
          verticalAlign: ImageSpanAlignment.CENTER,
          objectFit: ImageFit.Contain
        })));
      } else if (element.type === 'link' && element.url) {
        // 处理链接
        const linkText = element.content || element.url;
        styledStrings.push(new MutableStyledString(linkText, [{
          start: 0,
          length: linkText.length,
          styledKey: StyledStringKey.GESTURE,
          styledValue: StyledStringUtil.generateClickStyle(element.url, onLinkClick)
        }, {
          start: 0,
          length: linkText.length,
          styledKey: StyledStringKey.FONT,
          styledValue: StyledStringUtil.generateTextStyle(linkColor, linkFontSize)
        }]));
      } else if (element.type === 'text' && element.content) {
        // 处理普通文本
        styledStrings.push(new MutableStyledString(element.content, []));
      }
    }

    return styledStrings;
  }

  /**
   * 将StyledString数组拼接成完整的属性字符串
   * 
   * @param styledStrings MutableStyledString数组
   * @returns TextController
   */
  static buildTextController(styledStrings: MutableStyledString[]): TextController {
    const controller = new TextController();
    const paragraphStyledString = new MutableStyledString('', []);

    for (const styledString of styledStrings) {
      paragraphStyledString.appendStyledString(styledString);
    }

    controller.setStyledString(paragraphStyledString);
    return controller;
  }

  /**
   * 处理评论HTML内容（简化版，直接使用StyledString.fromHtml）
   * 
   * @param html HTML内容
   * @returns Promise<StyledString>
   */
  static async fromHtml(html: string): Promise<StyledString> {
    return await StyledString.fromHtml(html);
  }
}
