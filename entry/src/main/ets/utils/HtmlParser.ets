/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { RichTextContentModel, RichTextModel } from './Models';

/**
 * HTML 解析器
 * 将 HTML 内容转换为 RichTextContentModel 数组
 */
export class HtmlParser {
  /**
   * 解析 HTML 内容
   * @param html HTML 字符串
   * @param defaultFontSize 默认字体大小
   * @param defaultFontColor 默认字体颜色
   * @returns RichTextModel 富文本模型
   */
  public static parseHtml(html: string, defaultFontSize: number = 16, defaultFontColor: string = '#000'): RichTextModel {
    let richTextModel = new RichTextModel();
    richTextModel.fontSize = defaultFontSize;
    richTextModel.text = html;
    
    // 解析 HTML 内容
    richTextModel.textArray = HtmlParser.parseHtmlContent(html, defaultFontSize, defaultFontColor);
    
    return richTextModel;
  }

  /**
   * 解析 HTML 内容为 RichTextContentModel 数组
   */
  private static parseHtmlContent(html: string, defaultFontSize: number, defaultFontColor: string): RichTextContentModel[] {
    let contentArray: RichTextContentModel[] = [];
    let currentIndex = 0;

    // 简单的 HTML 解析逻辑
    // 处理常见标签：p, img, a, strong, em, h1-h6, ul, ol, li, blockquote, code, br
    let processedHtml = html;
    
    // 移除 style 标签和 script 标签
    processedHtml = processedHtml.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    processedHtml = processedHtml.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    
    // 处理换行符
    processedHtml = processedHtml.replace(/\n/g, '');
    processedHtml = processedHtml.replace(/\r/g, '');
    
    // 将 HTML 分解为标签和文本
    let parts = processedHtml.match(/<[^>]+>|[^<]+/g) || [];
    
    let currentText = '';
    let currentFontSize = defaultFontSize;
    let currentFontColor = defaultFontColor;
    let isBold = false;
    let isItalic = false;
    let isLink = false;
    let linkUrl = '';
    
    for (let part of parts) {
      if (part.startsWith('<')) {
        // 这是一个标签
        let tag = part.toLowerCase();
        
        if (tag.startsWith('</')) {
          // 结束标签
          if (tag === '</p>' || tag === '</div>') {
            // 段落结束，添加换行
            if (currentText.trim()) {
              contentArray.push(HtmlParser.createTextModel(
                currentText.trim(),
                currentIndex++,
                currentFontSize,
                currentFontColor,
                isBold,
                isItalic,
                isLink,
                linkUrl
              ));
              currentText = '';
            }
            // 添加换行
            contentArray.push(HtmlParser.createTextModel('\n', currentIndex++, currentFontSize, currentFontColor, false, false, false, ''));
          } else if (tag === '</strong>' || tag === '</b>') {
            isBold = false;
          } else if (tag === '</em>' || tag === '</i>') {
            isItalic = false;
          } else if (tag === '</a>') {
            isLink = false;
            linkUrl = '';
          } else if (tag === '</h1>') {
            currentFontSize = defaultFontSize;
            if (currentText.trim()) {
              contentArray.push(HtmlParser.createTextModel(
                currentText.trim(),
                currentIndex++,
                defaultFontSize * 1.75,
                currentFontColor,
                true,
                isItalic,
                isLink,
                linkUrl
              ));
              currentText = '';
            }
            contentArray.push(HtmlParser.createTextModel('\n', currentIndex++, defaultFontSize, currentFontColor, false, false, false, ''));
          } else if (tag === '</h2>') {
            currentFontSize = defaultFontSize;
            if (currentText.trim()) {
              contentArray.push(HtmlParser.createTextModel(
                currentText.trim(),
                currentIndex++,
                defaultFontSize * 1.5,
                currentFontColor,
                true,
                isItalic,
                isLink,
                linkUrl
              ));
              currentText = '';
            }
            contentArray.push(HtmlParser.createTextModel('\n', currentIndex++, defaultFontSize, currentFontColor, false, false, false, ''));
          } else if (tag === '</h3>') {
            currentFontSize = defaultFontSize;
            if (currentText.trim()) {
              contentArray.push(HtmlParser.createTextModel(
                currentText.trim(),
                currentIndex++,
                defaultFontSize * 1.25,
                currentFontColor,
                true,
                isItalic,
                isLink,
                linkUrl
              ));
              currentText = '';
            }
            contentArray.push(HtmlParser.createTextModel('\n', currentIndex++, defaultFontSize, currentFontColor, false, false, false, ''));
          } else if (tag === '</h4>' || tag === '</h5>' || tag === '</h6>') {
            currentFontSize = defaultFontSize;
            if (currentText.trim()) {
              contentArray.push(HtmlParser.createTextModel(
                currentText.trim(),
                currentIndex++,
                defaultFontSize * 1.1,
                currentFontColor,
                true,
                isItalic,
                isLink,
                linkUrl
              ));
              currentText = '';
            }
            contentArray.push(HtmlParser.createTextModel('\n', currentIndex++, defaultFontSize, currentFontColor, false, false, false, ''));
          }
        } else {
          // 开始标签
          if (tag === '<br>' || tag === '<br/>') {
            // 换行
            if (currentText.trim()) {
              contentArray.push(HtmlParser.createTextModel(
                currentText.trim(),
                currentIndex++,
                currentFontSize,
                currentFontColor,
                isBold,
                isItalic,
                isLink,
                linkUrl
              ));
              currentText = '';
            }
            contentArray.push(HtmlParser.createTextModel('\n', currentIndex++, currentFontSize, currentFontColor, false, false, false, ''));
          } else if (tag.startsWith('<img')) {
            // 图片标签
            let srcMatch = part.match(/src=["']([^"']+)["']/i);
            if (srcMatch && srcMatch[1]) {
              let imageUrl = srcMatch[1];
              // 添加之前的文本
              if (currentText.trim()) {
                contentArray.push(HtmlParser.createTextModel(
                  currentText.trim(),
                  currentIndex++,
                  currentFontSize,
                  currentFontColor,
                  isBold,
                  isItalic,
                  isLink,
                  linkUrl
                ));
                currentText = '';
              }
              // 添加图片
              contentArray.push(HtmlParser.createImageModel(imageUrl, currentIndex++));
              // 图片后添加换行
              contentArray.push(HtmlParser.createTextModel('\n', currentIndex++, currentFontSize, currentFontColor, false, false, false, ''));
            }
          } else if (tag.startsWith('<a')) {
            // 链接标签
            let hrefMatch = part.match(/href=["']([^"']+)["']/i);
            if (hrefMatch && hrefMatch[1]) {
              isLink = true;
              linkUrl = hrefMatch[1];
            }
          } else if (tag === '<strong>' || tag === '<b>') {
            isBold = true;
          } else if (tag === '<em>' || tag === '<i>') {
            isItalic = true;
          } else if (tag === '<h1>') {
            currentFontSize = defaultFontSize * 1.75;
          } else if (tag === '<h2>') {
            currentFontSize = defaultFontSize * 1.5;
          } else if (tag === '<h3>') {
            currentFontSize = defaultFontSize * 1.25;
          } else if (tag === '<h4>' || tag === '<h5>' || tag === '<h6>') {
            currentFontSize = defaultFontSize * 1.1;
          } else if (tag === '<blockquote>') {
            // 引用块，添加特殊样式
            if (currentText.trim()) {
              contentArray.push(HtmlParser.createTextModel(
                currentText.trim(),
                currentIndex++,
                currentFontSize,
                currentFontColor,
                isBold,
                isItalic,
                isLink,
                linkUrl
              ));
              currentText = '';
            }
            contentArray.push(HtmlParser.createTextModel('│ ', currentIndex++, currentFontSize, '#666', false, false, false, ''));
          }
        }
      } else {
        // 这是文本内容
        currentText += part;
      }
    }
    
    // 添加剩余的文本
    if (currentText.trim()) {
      contentArray.push(HtmlParser.createTextModel(
        currentText.trim(),
        currentIndex++,
        currentFontSize,
        currentFontColor,
        isBold,
        isItalic,
        isLink,
        linkUrl
      ));
    }
    
    return contentArray;
  }

  /**
   * 创建文本模型
   */
  private static createTextModel(
    content: string,
    index: number,
    fontSize: number,
    fontColor: string,
    isBold: boolean,
    isItalic: boolean,
    isLink: boolean,
    linkUrl: string
  ): RichTextContentModel {
    let model = new RichTextContentModel();
    model.type = isLink ? 'link' : 'text';
    model.content = content;
    model.index = index;
    model.length = content.length;
    model.fontSize = fontSize;
    model.fontColor = fontColor;
    model.link = linkUrl;
    return model;
  }

  /**
   * 创建图片模型
   */
  private static createImageModel(imageUrl: string, index: number): RichTextContentModel {
    let model = new RichTextContentModel();
    model.type = 'images';
    model.index = index;
    model.length = 1;
    model.images = [imageUrl];
    // 图片尺寸会在渲染时动态计算
    model.imgWidth = 300;
    model.imgHeight = 200;
    return model;
  }
}
