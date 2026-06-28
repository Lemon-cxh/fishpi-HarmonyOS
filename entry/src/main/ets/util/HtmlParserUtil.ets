/**
 * HTML 解析工具
 * 将 HTML 内容解析为结构化的内容片段，用于自定义渲染
 */

/**
 * 内容片段类型
 */
export interface ContentSegment {
  type: 'text' | 'image';
  content?: string;        // 文本内容
  imageUrl?: string;       // 图片URL
}

/**
 * 解析 HTML 内容，提取文本和图片
 * 
 * @param html HTML 内容
 * @returns 内容片段数组
 */
export function parseHtmlContent(html: string): ContentSegment[] {
  if (!html) {
    return [];
  }

  const segments: ContentSegment[] = [];
  
  // 处理图片：提取图片URL，用占位符替换
  const imageUrls: string[] = [];
  let processed = html.replace(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi, (match: string, url: string): string => {
    imageUrls.push(url);
    return `[[IMAGE_${imageUrls.length - 1}]]`;
  });

  // 移除其他 HTML 标签，保留内容
  // 处理 <p> 标签：替换为换行
  processed = processed.replace(/<p[^>]*>/gi, '');
  processed = processed.replace(/<\/p>/gi, '\n');
  
  // 处理 <br> 标签
  processed = processed.replace(/<br\s*\/?>/gi, '\n');
  
  // 处理 <div> 标签
  processed = processed.replace(/<div[^>]*>/gi, '');
  processed = processed.replace(/<\/div>/gi, '\n');
  
  // 移除其他标签，保留内容
  processed = processed.replace(/<[^>]+>/g, '');
  
  // 解码 HTML 实体
  processed = decodeHtmlEntities(processed);
  
  // 处理表情符号
  processed = convertEmoji(processed);

  // 分割文本和图片占位符
  const parts = processed.split(/(\[\[IMAGE_\d+\]\])/);
  
  for (const part of parts) {
    if (!part || part.trim() === '') {
      continue;
    }
    
    // 检查是否是图片占位符
    const imageMatch = part.match(/\[\[IMAGE_(\d+)\]\]/);
    if (imageMatch) {
      const index = parseInt(imageMatch[1], 10);
      if (index < imageUrls.length) {
        segments.push({
          type: 'image',
          imageUrl: imageUrls[index]
        });
      }
    } else {
      // 文本内容
      segments.push({
        type: 'text',
        content: part
      });
    }
  }

  return segments;
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
 */
function decodeHtmlEntities(text: string): string {
  if (!text) {
    return text;
  }

  let result = text;

  // 处理数字实体 &#123; 格式
  result = result.replace(/&#(\d+);/g, (match: string, code: string) => {
    const charCode = parseInt(code, 10);
    if (charCode > 0 && charCode < 65536) {
      return String.fromCharCode(charCode);
    }
    return match;
  });

  // 处理十六进制实体 &#x1F600; 格式
  result = result.replace(/&#x([0-9a-fA-F]+);/g, (match: string, code: string) => {
    const charCode = parseInt(code, 16);
    if (charCode > 0 && charCode < 65536) {
      return String.fromCharCode(charCode);
    }
    return match;
  });

  // 处理命名实体
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
 * 表情符号映射表
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
 */
function convertEmoji(text: string): string {
  if (!text) {
    return text;
  }

  return text.replace(/:([a-zA-Z0-9_+\-]+):/g, (match: string, name: string) => {
    const emoji = EMOJI_MAP[name.toLowerCase()];
    return emoji || match;
  });
}
