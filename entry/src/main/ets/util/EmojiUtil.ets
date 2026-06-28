/**
 * 表情符号处理工具
 * 1. 将文本形式的表情标记（如 :thinking:）转换为 Emoji 字符
 * 2. 解码 HTML 实体（如 &nbsp; &lt; &gt; 等）
 */

/**
 * 表情符号映射表
 * 支持常见的表情标记
 */
const EMOJI_MAP: Record<string, string> = {
  // 面部表情
  'smile': '😊',
  'smiley': '😃',
  'grin': '😀',
  'laugh': '😂',
  'rofl': '🤣',
  'wink': '😉',
  'blush': '😊',
  'neutral': '😐',
  'expressionless': '😑',
  'thinking': '🤔',
  'confused': '😕',
  'worried': '😟',
  'cry': '😢',
  'sob': '😭',
  'sunglasses': '😎',
  'sleeping': '😴',
  'dizzy': '😵',
  'astonished': '😲',
  'open_mouth': '😮',
  'grimacing': '😬',
  'relaxed': '☺️',
  'yum': '😋',
  'kissing': '😗',
  'kissing_heart': '😘',
  'stuck_out_tongue': '😛',
  'stuck_out_tongue_winking_eye': '😜',
  'stuck_out_tongue_closed_eyes': '😝',
  'disappointed': '😞',
  'angry': '😠',
  'rage': '😡',
  'frowning': '😦',
  'anguished': '😧',
  'fearful': '😨',
  'weary': '😩',
  'sleepy': '😪',
  'tired_face': '😫',
  'hushed': '😯',
  'no_mouth': '😶',
  'innocent': '😇',
  'smirk': '😏',
  'unamused': '😒',
  'roll_eyes': '🙄',
  'nerd': '🤓',
  'monkey_face': '🐵',
  'see_no_evil': '🙈',
  'hear_no_evil': '🙉',
  'speak_no_evil': '🙊',

  // 手势
  'thumbsup': '👍',
  'thumbsdown': '👎',
  'ok_hand': '👌',
  'v': '✌️',
  'raised_hands': '🙌',
  'clap': '👏',
  'wave': '👋',
  'fist': '✊',
  'hand': '✋',
  'muscle': '💪',
  'point_up': '☝️',
  'point_right': '👉',
  'point_left': '👈',
  'point_down': '👇',
  'point_up_2': '👆',

  // 心形
  'heart': '❤️',
  'yellow_heart': '💛',
  'green_heart': '💚',
  'blue_heart': '💙',
  'purple_heart': '💜',
  'broken_heart': '💔',
  'heart_eyes': '😍',
  'kissing_smiling_eyes': '😙',
  'fire': '🔥',
  'sparkles': '✨',
  'star': '⭐',
  'star2': '🌟',

  // 其他常用
  'sunny': '☀️',
  'cloud': '☁️',
  'umbrella': '☔',
  'snowflake': '❄️',
  'lightning': '⚡',
  'cyclone': '🌀',
  'rainbow': '🌈',
  'coffee': '☕',
  'beer': '🍺',
  'beers': '🍻',
  'wine_glass': '🍷',
  'cake': '🍰',
  'pizza': '🍕',
  'hamburger': '🍔',
  'fries': '🍟',
  'hotdog': '🌭',
  'icecream': '🍦',
  'donut': '🍩',
  'cookie': '🍪',
  'chocolate_bar': '🍫',
  'candy': '🍬',
  'lollipop': '🍭',
  'apple': '🍎',
  'banana': '🍌',
  'watermelon': '🍉',
  'grapes': '🍇',
  'strawberry': '🍓',
  'peach': '🍑',
  'cherries': '🍒',
  'pineapple': '🍍',

  // 符号
  '100': '💯',
  'ok': '🆗',
  'new': '🆕',
  'cool': '🆒',
  'free': '🆓',
  'sos': '🆘',
  'up': '🆙',
  'vs': '🆚',
  'id': '🆔',
  'arrow_up': '⬆️',
  'arrow_down': '⬇️',
  'arrow_left': '⬅️',
  'arrow_right': '➡️',
  'check_mark': '✅',
  'cross_mark': '❌',
  'question': '❓',
  'exclamation': '❗',
  'bangbang': '‼️',
  'interrobang': '⁉️',

  // 动物
  'dog': '🐕',
  'cat': '🐱',
  'mouse': '🐭',
  'hamster': '🐹',
  'rabbit': '🐰',
  'fox': '🦊',
  'bear': '🐻',
  'panda': '🐼',
  'koala': '🐨',
  'tiger': '🐯',
  'lion': '🦁',
  'cow': '🐮',
  'pig': '🐷',
  'frog': '🐸',
  'monkey': '🐒',
  'chicken': '🐔',
  'penguin': '🐧',
  'bird': '🐦',
  'duck': '🦆',
  'eagle': '🦅',
  'owl': '🦉',
  'bat': '🦇',
  'wolf': '🐺',
  'boar': '🐗',
  'horse': '🐴',
  'unicorn': '🦄',
  'bee': '🐝',
  'bug': '🐛',
  'butterfly': '🦋',
  'snail': '🐌',
  'shell': '🐚',
  'ladybug': '🐞',
  'ant': '🐜',
  'spider': '🕷️',
  'scorpion': '🦂',
  'crab': '🦀',
  'octopus': '🐙',
  'squid': '🦑',
  'shrimp': '🦐',
  'fish': '🐟',
  'tropical_fish': '🐠',
  'blowfish': '🐡',
  'dolphin': '🐬',
  'whale': '🐳',
  'whale2': '🐋',
  'crocodile': '🐊',
  'leopard': '🐆',
  'tiger2': '🐅',
  'water_buffalo': '🐃',
  'ox': '🐂',
  'cow2': '🐄',
  'dromedary_camel': '🐪',
  'camel': '🐫',
  'elephant': '🐘',
  'goat': '🐐',
  'ram': '🐏',
  'sheep': '🐑',
  'racehorse': '🐎',
  'pig2': '🐖',
  'rat': '🐀',
  'mouse2': '🐁',
  'rooster': '🐓',
  'turkey': '🦃',
  'dove': '🕊️',
  'dog2': '🐕',
  'poodle': '🐩',
  'cat2': '🐈',
  'rabbit2': '🐇',
  'chipmunk': '🐿️',
  'feet': '🐾',
  'dragon': '🐉',
  'dragon_face': '🐲',

  // 植物
  'bouquet': '💐',
  'cherry_blossom': '🌸',
  'white_flower': '💮',
  'rosette': '🏵️',
  'rose': '🌹',
  'wilted_flower': '🥀',
  'hibiscus': '🌺',
  'sunflower': '🌻',
  'blossom': '🌼',
  'tulip': '🌷',
  'seedling': '🌱',
  'evergreen_tree': '🌲',
  'deciduous_tree': '🌳',
  'palm_tree': '🌴',
  'cactus': '🌵',
  'ear_of_rice': '🌾',
  'herb': '🌿',
  'shamrock': '☘️',
  'four_leaf_clover': '🍀',
  'maple_leaf': '🍁',
  'fallen_leaf': '🍂',
  'leaves': '🍃'
};

/**
 * 将文本中的表情标记转换为 Emoji 字符
 * 支持格式：:emoji_name:
 * 
 * @param text 原始文本
 * @returns 转换后的文本
 */
export function convertEmoji(text: string): string {
  if (!text) {
    return text;
  }

  // 匹配 :emoji_name: 格式的表情标记（支持更多字符）
  return text.replace(/:([a-zA-Z0-9_+\-]+):/g, (match: string, name: string) => {
    const emoji = EMOJI_MAP[name.toLowerCase()];
    return emoji || match; // 如果找不到对应的 emoji，保留原文
  });
}

/**
 * 批量转换文本中的表情标记
 * 
 * @param texts 文本数组
 * @returns 转换后的文本数组
 */
export function convertEmojiBatch(texts: string[]): string[] {
  return texts.map(text => convertEmoji(text));
}

/**
 * 检查文本中是否包含表情标记
 * 
 * @param text 文本
 * @returns 是否包含表情标记
 */
export function hasEmojiMark(text: string): boolean {
  if (!text) {
    return false;
  }
  return /:[a-zA-Z0-9_+-]+:/.test(text);
}

/**
 * HTML 实体映射表
 */
const HTML_ENTITY_MAP: Record<string, string> = {
  '&nbsp;': ' ',
  '&lt;': '<',
  '&gt;': '>',
  '&amp;': '&',
  '&quot;': '"',
  '&apos;': "'",
  '&#39;': "'",
  '&copy;': '©',
  '&reg;': '®',
  '&trade;': '™',
  '&times;': '×',
  '&divide;': '÷',
  '&plusmn;': '±',
  '&deg;': '°',
  '&para;': '¶',
  '&sect;': '§',
  '&bull;': '•',
  '&hellip;': '…',
  '&mdash;': '—',
  '&ndash;': '–',
  '&lsquo;': '\u2018',
  '&rsquo;': '\u2019',
  '&ldquo;': '"',
  '&rdquo;': '"',
  '&euro;': '€',
  '&pound;': '£',
  '&yen;': '¥',
  '&cent;': '¢',
  '&frac12;': '½',
  '&frac14;': '¼',
  '&frac34;': '¾'
};

/**
 * 解码 HTML 实体
 * 支持：&nbsp; &lt; &gt; &amp; &quot; 等命名实体
 * 支持：&#123; 数字实体
 * 
 * @param text 包含 HTML 实体的文本
 * @returns 解码后的文本
 */
export function decodeHtmlEntities(text: string): string {
  if (!text) {
    return text;
  }

  let result = text;

  // 1. 处理数字实体 &#123; 格式
  result = result.replace(/&#(\d+);/g, (match: string, code: string) => {
    const charCode = parseInt(code, 10);
    if (charCode > 0 && charCode < 65536) {
      return String.fromCharCode(charCode);
    }
    return match;
  });

  // 2. 处理十六进制实体 &#x1F600; 格式
  result = result.replace(/&#x([0-9a-fA-F]+);/g, (match: string, code: string) => {
    const charCode = parseInt(code, 16);
    if (charCode > 0 && charCode < 65536) {
      return String.fromCharCode(charCode);
    }
    return match;
  });

  // 3. 处理命名实体
  const entities: string[] = [
    '&nbsp;', '&lt;', '&gt;', '&amp;', '&quot;', '&apos;', '&#39;',
    '&copy;', '&reg;', '&trade;', '&times;', '&divide;', '&plusmn;', '&deg;',
    '&para;', '&sect;', '&bull;', '&hellip;', '&mdash;', '&ndash;',
    '&lsquo;', '&rsquo;', '&ldquo;', '&rdquo;',
    '&euro;', '&pound;', '&yen;', '&cent;', '&frac12;', '&frac14;', '&frac34;'
  ];
  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i];
    result = result.split(entity).join(HTML_ENTITY_MAP[entity]);
  }

  return result;
}

/**
 * 处理文本：同时转换表情符号和解码 HTML 实体
 * 
 * @param text 原始文本
 * @returns 处理后的文本
 */
export function processText(text: string): string {
  if (!text) {
    return text;
  }
  // 先解码 HTML 实体，再转换表情符号
  return convertEmoji(decodeHtmlEntities(text));
}

/**
 * 处理评论 HTML 内容，添加默认样式
 * 解决 RichText 组件文字太小的问题
 * 
 * @param html 原始 HTML 内容
 * @returns 带样式的 HTML 内容
 */
export function processCommentHtml(html: string): string {
  if (!html) {
    return html;
  }
  
  // 处理表情和 HTML 实体
  let processed = processText(html);
  
  // 限制图片大小：最大宽度200px，最大高度150px，保持比例
  processed = processed.replace(/<img/gi, '<img style="max-width: 200px; max-height: 150px; object-fit: contain; cursor: pointer;"');
  
  // 减少段落间距：添加样式使段落更紧凑
  processed = processed.replace(/<p>/gi, '<p style="margin: 0 0 4px 0; padding: 0;">');
  processed = processed.replace(/<div>/gi, '<div style="margin: 0; padding: 0;">');
  
  // 在外层包裹带样式的 div
  // 设置字体大小为 14px，行高 1.4（更紧凑），颜色 #333
  const styledHtml = `<div style="font-size: 14px; line-height: 1.4; color: #333333;">${processed}</div>`;
  
  return styledHtml;
}
