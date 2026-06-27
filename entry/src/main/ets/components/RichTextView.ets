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

import { RichTextContentModel, RichTextModel } from '../utils/Models';
import { HtmlParser } from '../utils/HtmlParser';
import { text } from '@kit.ArkGraphics2D';

/**
 * 富文本展示组件
 * 基于 TextExpand 示例项目的实现，但不包含展开/收起功能
 */
@Component
export struct RichTextView {
  // HTML 内容
  @Prop htmlContent: string = '';
  // 默认字体大小
  @Prop fontSize: number = 16;
  // 默认字体颜色
  @Prop fontColor: string = '#000';
  // 容器宽度（用于图片自适应）
  @Prop containerWidth: number = 350;
  
  // 解析后的富文本模型
  @State richTextModel: RichTextModel = new RichTextModel();
  // 图片尺寸映射（URL -> {width, height}）
  @State imageSizes: Map<string, { width: number, height: number }> = new Map();
  
  aboutToAppear(): void {
    this.parseHtmlContent();
  }
  
  /**
   * 解析 HTML 内容
   */
  private parseHtmlContent(): void {
    if (!this.htmlContent) {
      return;
    }
    
    // 使用 HtmlParser 解析 HTML
    this.richTextModel = HtmlParser.parseHtml(this.htmlContent, this.fontSize, this.fontColor);
    
    // 预加载图片尺寸
    this.preloadImageSizes();
  }
  
  /**
   * 预加载图片尺寸
   */
  private preloadImageSizes(): void {
    for (let item of this.richTextModel.textArray) {
      if (item.type === 'images' && item.images.length > 0) {
        for (let imageUrl of item.images) {
          // 获取图片尺寸
          this.getImageSize(imageUrl);
        }
      }
    }
  }
  
  /**
   * 获取图片尺寸
   */
  private getImageSize(imageUrl: string): void {
    // 使用 Image 组件的 onComplete 回调获取图片尺寸
    // 这里先使用默认尺寸，实际尺寸会在 Image 组件加载完成后更新
    if (!this.imageSizes.has(imageUrl)) {
      this.imageSizes.set(imageUrl, {
        width: this.containerWidth,
        height: this.containerWidth * 0.6 // 默认宽高比 5:3
      });
    }
  }
  
  build() {
    Column() {
      if (this.richTextModel.textArray.length > 0) {
        // 使用 Column + ForEach 组合展示内容
        Column({ space: 0 }) {
          ForEach(this.richTextModel.textArray, (item: RichTextContentModel, index: number) => {
            if (item.type === 'text' || item.type === 'topic' || item.type === 'link') {
              // 文本内容
              Text(item.content)
                .fontSize(item.fontSize)
                .fontColor(item.fontColor)
                .width('100%')
                .wordBreak(WordBreak.BREAK_ALL)
            } else if (item.type === 'images') {
              // 图片内容
              Column() {
                ForEach(item.images, (imageUrl: string, imgIndex: number) => {
                  Image(imageUrl)
                    .width('100%')
                    .objectFit(ImageFit.Contain)
                    .borderRadius(8)
                    .margin({ top: 8, bottom: 8 })
                    .onComplete((msg) => {
                      // 图片加载完成，更新尺寸
                      if (msg && msg.width && msg.height) {
                        // 计算自适应尺寸
                        let displayWidth = this.containerWidth;
                        let displayHeight = displayWidth * (msg.height / msg.width);
                        
                        // 更新图片尺寸映射
                        this.imageSizes.set(imageUrl, {
                          width: displayWidth,
                          height: displayHeight
                        });
                      }
                    })
                    .onError(() => {
                      // 图片加载失败，显示占位图
                      console.error(`Image load failed: ${imageUrl}`);
                    })
                }, (imageUrl: string, imgIndex: number) => `${index}-${imgIndex}-${imageUrl}`)
              }
              .width('100%')
            }
          }, (item: RichTextContentModel, index: number) => `${index}-${item.type}-${item.content}`)
        }
        .width('100%')
      } else {
        // 无内容时显示占位文本
        Text('暂无内容')
          .fontSize(this.fontSize)
          .fontColor('#999999')
          .width('100%')
          .textAlign(TextAlign.Center)
          .padding(20)
      }
    }
    .width('100%')
  }
}
