import { ThemeUtil, LightColorScheme, DarkColorScheme, ColorScheme } from '../util/ThemeUtil';
import { Spacing, BorderRadius, FontSize, ComponentSize, AnimationDuration, Shadow, Opacity } from '../constants/DesignTokens';

/**
 * 鸿蒙设计系统组件库
 * 提供符合 HarmonyOS Design 规范的通用组件
 */

/**
 * 获取当前色彩方案
 */
function getColors(): ColorScheme {
  return ThemeUtil.isDarkMode() ? DarkColorScheme : LightColorScheme;
}

/**
 * 主按钮组件
 * 填充背景，白色文字
 */
@Component
export struct PrimaryButton {
  @Prop label: string = '';
  @Prop isLoading: boolean = false;
  @Prop isDisabled: boolean = false;
  @State isPressed: boolean = false;
  onClick: () => void = () => {};

  build() {
    Button(this.isLoading ? '加载中...' : this.label)
      .type(ButtonType.Capsule)
      .width('100%')
      .height(ComponentSize.BUTTON_LG)
      .backgroundColor(getColors().primary)
      .fontColor(getColors().textInverse)
      .fontSize(FontSize.LG)
      .fontWeight(500)
      .enabled(!this.isDisabled && !this.isLoading)
      .opacity(this.isDisabled ? Opacity.DISABLED : (this.isPressed ? Opacity.PRESSED : 1))
      .scale({
        x: this.isPressed ? 0.98 : 1,
        y: this.isPressed ? 0.98 : 1
      })
      .animation({
        duration: AnimationDuration.FAST,
        curve: Curve.EaseInOut
      })
      .onTouch((event) => {
        if (event.type === TouchType.Down) {
          this.isPressed = true;
        } else if (event.type === TouchType.Up || event.type === TouchType.Cancel) {
          this.isPressed = false;
        }
      })
      .onClick(this.onClick)
  }
}

/**
 * 次按钮组件
 * 描边样式，主色文字
 */
@Component
export struct SecondaryButton {
  @Prop label: string = '';
  @Prop isDisabled: boolean = false;
  @State isPressed: boolean = false;
  onClick: () => void = () => {};

  build() {
    Button(this.label)
      .type(ButtonType.Capsule)
      .width('100%')
      .height(ComponentSize.BUTTON_MD)
      .backgroundColor('transparent')
      .borderWidth(1)
      .borderColor(getColors().primary)
      .fontColor(getColors().primary)
      .fontSize(FontSize.MD)
      .fontWeight(500)
      .enabled(!this.isDisabled)
      .opacity(this.isDisabled ? Opacity.DISABLED : (this.isPressed ? Opacity.PRESSED : 1))
      .scale({
        x: this.isPressed ? 0.98 : 1,
        y: this.isPressed ? 0.98 : 1
      })
      .animation({
        duration: AnimationDuration.FAST,
        curve: Curve.EaseInOut
      })
      .onTouch((event) => {
        if (event.type === TouchType.Down) {
          this.isPressed = true;
        } else if (event.type === TouchType.Up || event.type === TouchType.Cancel) {
          this.isPressed = false;
        }
      })
      .onClick(this.onClick)
  }
}

/**
 * 内容卡片组件
 * 白色背景，圆角，阴影
 * 使用 @Builder 装饰器实现插槽
 */
@Component
export struct ContentCard {
  @Builder
  defaultBuilder() {
    // 默认空内容
  }

  @State isPressed: boolean = false;
  content: () => void = this.defaultBuilder;
  onClick: () => void = () => {};

  build() {
    Column() {
      this.content()
    }
    .width('100%')
    .padding(Spacing.LG)
    .backgroundColor(getColors().surface)
    .borderRadius(BorderRadius.MD)
    .shadow(Shadow.SM)
    .scale({
      x: this.isPressed ? 0.99 : 1,
      y: this.isPressed ? 0.99 : 1
    })
    .animation({
      duration: AnimationDuration.FAST,
      curve: Curve.EaseInOut
    })
    .onTouch((event) => {
      if (event.type === TouchType.Down) {
        this.isPressed = true;
      } else if (event.type === TouchType.Up || event.type === TouchType.Cancel) {
        this.isPressed = false;
      }
    })
    .onClick(this.onClick)
  }
}

/**
 * 列表项组件
 * 标准列表项，带点击反馈
 */
@Component
export struct ListItemRow {
  @Prop icon: string = '';
  @Prop title: string = '';
  @Prop value: string = '';
  @Prop showArrow: boolean = true;
  @State isPressed: boolean = false;
  onClick: () => void = () => {};

  build() {
    Row() {
      if (this.icon) {
        Text(this.icon)
          .fontSize(20)
          .margin({ right: Spacing.MD })
      }

      Text(this.title)
        .fontSize(FontSize.LG)
        .fontColor(getColors().textPrimary)
        .layoutWeight(1)

      if (this.value) {
        Text(this.value)
          .fontSize(FontSize.MD)
          .fontColor(getColors().textTertiary)
      }

      if (this.showArrow) {
        Text('>')
          .fontSize(FontSize.MD)
          .fontColor(getColors().textTertiary)
          .margin({ left: Spacing.SM })
      }
    }
    .width('100%')
    .height(ComponentSize.LIST_ITEM)
    .padding({ left: Spacing.LG, right: Spacing.LG })
    .backgroundColor(getColors().surface)
    .opacity(this.isPressed ? Opacity.PRESSED : 1)
    .animation({
      duration: AnimationDuration.FAST,
      curve: Curve.EaseInOut
    })
    .onTouch((event) => {
      if (event.type === TouchType.Down) {
        this.isPressed = true;
      } else if (event.type === TouchType.Up || event.type === TouchType.Cancel) {
        this.isPressed = false;
      }
    })
    .onClick(this.onClick)
  }
}

/**
 * 用户头像组件
 * 支持多种尺寸
 */
@Component
export struct UserAvatar {
  @Prop src: string = '';
  @Prop size: number = ComponentSize.AVATAR_MD;

  build() {
    Image(this.src || '')
      .width(this.size)
      .height(this.size)
      .borderRadius(this.size / 2)
      .backgroundColor(getColors().backgroundSecondary)
  }
}

/**
 * 标签组件
 */
@Component
export struct Tag {
  @Prop label: string = '';
  @Prop color: string = '#1890FF';

  build() {
    Text(this.label)
      .fontSize(FontSize.SM)
      .fontColor(this.color)
      .backgroundColor(this.color + '15')
      .padding({ left: Spacing.SM, right: Spacing.SM, top: Spacing.XS, bottom: Spacing.XS })
      .borderRadius(BorderRadius.SM)
  }
}

/**
 * 空状态组件
 */
@Component
export struct EmptyState {
  @Prop icon: string = '📭';
  @Prop title: string = '暂无数据';
  @Prop subtitle: string = '';

  build() {
    Column() {
      Text(this.icon)
        .fontSize(48)

      Text(this.title)
        .fontSize(FontSize.LG)
        .fontColor(getColors().textSecondary)
        .margin({ top: Spacing.MD })

      if (this.subtitle) {
        Text(this.subtitle)
          .fontSize(FontSize.MD)
          .fontColor(getColors().textTertiary)
          .margin({ top: Spacing.SM })
      }
    }
    .width('100%')
    .padding(Spacing.XXXL)
    .justifyContent(FlexAlign.Center)
  }
}

/**
 * 加载状态组件
 */
@Component
export struct LoadingState {
  @Prop text: string = '加载中...';

  build() {
    Column() {
      LoadingProgress()
        .width(40)
        .height(40)
        .color(getColors().primary)

      Text(this.text)
        .fontSize(FontSize.MD)
        .fontColor(getColors().textTertiary)
        .margin({ top: Spacing.MD })
    }
    .width('100%')
    .padding(Spacing.XXXL)
    .justifyContent(FlexAlign.Center)
  }
}

/**
 * 分割线组件
 */
@Component
export struct DividerLine {
  build() {
    Divider()
      .strokeWidth(0.5)
      .color(getColors().divider)
      .width('100%')
  }
}

/**
 * 区域标题组件
 */
@Component
export struct SectionTitle {
  @Prop title: string = '';
  @Prop action: string = '';
  onAction: () => void = () => {};

  build() {
    Row() {
      Text(this.title)
        .fontSize(FontSize.LG)
        .fontWeight(500)
        .fontColor(getColors().textPrimary)

      Blank()

      if (this.action) {
        Text(this.action)
          .fontSize(FontSize.MD)
          .fontColor(getColors().primary)
          .onClick(this.onAction)
      }
    }
    .width('100%')
    .padding({ left: Spacing.LG, right: Spacing.LG, top: Spacing.MD, bottom: Spacing.MD })
  }
}
