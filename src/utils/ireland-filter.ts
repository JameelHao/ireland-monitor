/**
 * 爱尔兰相关性过滤器
 * 用于判断新闻/标记点是否与爱尔兰相关
 */

export interface FilterableItem {
  lat?: number;
  lng?: number;
  country?: string;
  title?: string;
  content?: string;
  source?: string;
}

// 爱尔兰边界框（简化版）
const IRELAND_BOUNDS = {
  minLat: 51.0,
  maxLat: 56.0,
  minLng: -11.0,
  maxLng: -5.0,
};

// 爱尔兰相关关键词
const IRELAND_KEYWORDS = [
  'ireland', 'irish', 'dublin', 'cork', 'galway', 'limerick', 'belfast',
  'waterford', 'drogheda', 'dundalk', 'sligo', 'kilkenny', 'wexford',
  'tcd', 'ucd', 'dcu', 'ucc', 'nuig', 'ul', 'maynooth',
  'sfi', 'enterprise ireland', 'ida ireland', 'science foundation',
  'silicon docks', 'grand canal', 'web summit', 'dublin tech summit',
];

// 爱尔兰媒体源
const IRELAND_SOURCES = [
  'silicon republic', 'tech central', 'tcd news', 'ucd news',
  'irish times', 'irish independent', 'rte', 'business plus',
  'irish tech news', 'sfi announcements', 'enterprise ireland',
];

/**
 * 判断坐标是否在爱尔兰境内
 */
export function isInIreland(lat?: number, lng?: number): boolean {
  if (lat == null || lng == null) return false;
  return (
    lat >= IRELAND_BOUNDS.minLat &&
    lat <= IRELAND_BOUNDS.maxLat &&
    lng >= IRELAND_BOUNDS.minLng &&
    lng <= IRELAND_BOUNDS.maxLng
  );
}

/**
 * 判断文本是否包含爱尔兰关键词
 */
export function containsIrelandKeywords(title?: string, content?: string): boolean {
  const text = `${title ?? ''} ${content ?? ''}`.toLowerCase();
  return IRELAND_KEYWORDS.some(kw => text.includes(kw));
}

/**
 * 判断数据源是否是爱尔兰媒体
 */
export function isIrelandSource(source?: string): boolean {
  if (!source) return false;
  const lowerSource = source.toLowerCase();
  return IRELAND_SOURCES.some(s => lowerSource.includes(s));
}

/**
 * 判断项目是否与爱尔兰相关
 */
export function isIrelandRelated(item: FilterableItem): boolean {
  // 1. 地理位置在爱尔兰
  if (isInIreland(item.lat, item.lng)) return true;
  
  // 2. 国家字段是爱尔兰
  if (item.country === 'Ireland' || item.country === 'IE') return true;
  
  // 3. 内容包含爱尔兰关键词
  if (containsIrelandKeywords(item.title, item.content)) return true;
  
  // 4. 数据源是爱尔兰媒体
  if (isIrelandSource(item.source)) return true;
  
  return false;
}

/**
 * 过滤并排序标记点，爱尔兰相关的排在前面
 */
export function sortByIrelandRelevance<T extends FilterableItem>(items: T[]): T[] {
  const irelandItems: T[] = [];
  const otherItems: T[] = [];
  
  for (const item of items) {
    if (isIrelandRelated(item)) {
      irelandItems.push(item);
    } else {
      otherItems.push(item);
    }
  }
  
  // 爱尔兰相关的在前面
  return [...irelandItems, ...otherItems];
}
