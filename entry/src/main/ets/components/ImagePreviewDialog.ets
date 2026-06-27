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

/**
 * 图片预览弹窗组件
 * 用于全屏显示图片，支持手势缩放和点击关闭
 */
@CustomDialog
export struct ImagePreviewDialog {
  // 图片URL
  @Prop imageUrl: string = '';
  // 控制弹窗显示
  controller: CustomDialogController;
  
  // 缩放状态
  @State scale: number = 1;
  @State offsetX: number = 0;
  @State offsetY: number = 0;
  
  build() {
    Column() {
      // 关闭按钮
      Row() {
        Blank()
        
        Button({ type: ButtonType.Circle }) {
          Text('×')
            .fontSize(24)
            .fontColor('#FFFFFF')
        }
        .width(40)
        .height(40)
        .backgroundColor('rgba(0, 0, 0, 0.5)')
        .onClick(() => {
          this.controller.close();
        })
      }
      .width('100%')
      .padding({ top: 40, right: 20 })
      
      Blank()
      
      // 图片显示区域
      Stack() {
        Image(this.imageUrl)
          .width('100%')
          .objectFit(ImageFit.Contain)
          .scale({ x: this.scale, y: this.scale })
          .translate({ x: this.offsetX, y: this.offsetY })
          .onError(() => {
            console.error(`Image preview load failed: ${this.imageUrl}`);
          })
      }
      .width('100%')
      .layoutWeight(1)
      .gesture(
        // 手势组合：单击关闭 + 双指缩放 + 拖动
        GestureGroup(GestureMode.Parallel,
          // 单击手势：关闭预览
          TapGesture({ count: 1 })
            .onAction(() => {
              this.controller.close();
            }),
          
          // 双指缩放手势
          PinchGesture()
            .onActionUpdate((event: GestureEvent) => {
              this.scale = event.scale;
            })
            .onActionEnd(() => {
              // 缩放结束后，如果缩放比例小于1，恢复为1
              if (this.scale < 1) {
                this.scale = 1;
                this.offsetX = 0;
                this.offsetY = 0;
              }
            }),
          
          // 拖动手势（仅在缩放时生效）
          PanGesture()
            .onActionUpdate((event: GestureEvent) => {
              if (this.scale > 1) {
                this.offsetX += event.offsetX;
                this.offsetY += event.offsetY;
              }
            })
        )
      )
      
      Blank()
    }
    .width('100%')
    .height('100%')
    .backgroundColor('rgba(0, 0, 0, 0.9)')
    .onClick(() => {
      // 点击空白处关闭
      this.controller.close();
    })
  }
}
