import { animator, curve } from '@kit.ArkUI';

/**
 * 动画选项接口
 * 定义动画参数的类型结构
 */
export interface AnimationOptions {
  scale?: { x: number; y: number };
  opacity?: number | number[];
  translate?: { x?: number | string; y?: number | string };
  rotate?: { z: number };
  duration?: number;
  delay?: number;
  curve?: object;
  iterations?: number;
}

/**
 * 动画工具类
 * 提供符合鸿蒙设计规范的动画效果
 */
export class AnimationUtil {
  // 动画时长常量 (毫秒)
  static readonly DURATION_FAST = 150;
  static readonly DURATION_STANDARD = 250;
  static readonly DURATION_SLOW = 350;

  // 缓动曲线
  static readonly CURVE_STANDARD = curve.cubicBezier(0.4, 0, 0.2, 1);
  static readonly CURVE_ENTER = curve.cubicBezier(0, 0, 0.2, 1);
  static readonly CURVE_EXIT = curve.cubicBezier(0.4, 0, 1, 1);
  static readonly CURVE_SPRING = curve.springMotion(0.2, 0.8);

  /**
   * 创建按压反馈动画参数
   * 用于按钮、卡片等可点击元素
   */
  static pressAnimation(): AnimationOptions {
    return {
      scale: { x: 0.95, y: 0.95 },
      opacity: 0.9,
      duration: AnimationUtil.DURATION_FAST,
      curve: AnimationUtil.CURVE_STANDARD
    };
  }

  /**
   * 创建释放动画参数
   */
  static releaseAnimation(): AnimationOptions {
    return {
      scale: { x: 1, y: 1 },
      opacity: 1,
      duration: AnimationUtil.DURATION_FAST,
      curve: AnimationUtil.CURVE_STANDARD
    };
  }

  /**
   * 创建淡入动画参数
   */
  static fadeInAnimation(): AnimationOptions {
    return {
      opacity: 1,
      duration: AnimationUtil.DURATION_STANDARD,
      curve: AnimationUtil.CURVE_ENTER
    };
  }

  /**
   * 创建淡出动画参数
   */
  static fadeOutAnimation(): AnimationOptions {
    return {
      opacity: 0,
      duration: AnimationUtil.DURATION_STANDARD,
      curve: AnimationUtil.CURVE_EXIT
    };
  }

  /**
   * 创建从底部滑入动画参数
   */
  static slideInFromBottom(): AnimationOptions {
    return {
      translate: { y: 0 },
      opacity: 1,
      duration: AnimationUtil.DURATION_STANDARD,
      curve: AnimationUtil.CURVE_ENTER
    };
  }

  /**
   * 创建滑出到底部动画参数
   */
  static slideOutToBottom(): AnimationOptions {
    return {
      translate: { y: '100%' },
      opacity: 0,
      duration: AnimationUtil.DURATION_STANDARD,
      curve: AnimationUtil.CURVE_EXIT
    };
  }

  /**
   * 创建从右侧滑入动画参数
   */
  static slideInFromRight(): AnimationOptions {
    return {
      translate: { x: 0 },
      opacity: 1,
      duration: AnimationUtil.DURATION_STANDARD,
      curve: AnimationUtil.CURVE_ENTER
    };
  }

  /**
   * 创建滑出到右侧动画参数
   */
  static slideOutToRight(): AnimationOptions {
    return {
      translate: { x: '100%' },
      opacity: 0,
      duration: AnimationUtil.DURATION_STANDARD,
      curve: AnimationUtil.CURVE_EXIT
    };
  }

  /**
   * 创建缩放动画参数
   */
  static scaleAnimation(scale: number): AnimationOptions {
    return {
      scale: { x: scale, y: scale },
      duration: AnimationUtil.DURATION_FAST,
      curve: AnimationUtil.CURVE_SPRING
    };
  }

  /**
   * 创建弹性动画参数
   */
  static springAnimation(): AnimationOptions {
    return {
      duration: AnimationUtil.DURATION_STANDARD,
      curve: AnimationUtil.CURVE_SPRING
    };
  }

  /**
   * 创建主题切换过渡动画参数
   */
  static themeTransition(): AnimationOptions {
    return {
      duration: AnimationUtil.DURATION_SLOW,
      curve: AnimationUtil.CURVE_STANDARD
    };
  }

  /**
   * 创建列表项出现动画参数
   * @param delay 延迟时间 (毫秒)
   */
  static listItemAppear(delay: number): AnimationOptions {
    return {
      opacity: 1,
      translate: { y: 0 },
      duration: AnimationUtil.DURATION_STANDARD,
      delay: delay,
      curve: AnimationUtil.CURVE_ENTER
    };
  }

  /**
   * 创建列表项初始状态
   */
  static listItemInitial(): AnimationOptions {
    return {
      opacity: 0,
      translate: { y: 20 }
    };
  }

  /**
   * 创建呼吸灯效果动画参数
   * 用于未读消息提示等
   */
  static breatheAnimation(): AnimationOptions {
    return {
      opacity: [1, 0.3, 1],
      duration: 2000,
      iterations: -1, // 无限循环
      curve: curve.linear
    };
  }

  /**
   * 创建旋转动画参数
   */
  static rotateAnimation(): AnimationOptions {
    return {
      rotate: { z: 360 },
      duration: 1000,
      iterations: -1,
      curve: curve.linear
    };
  }
}
