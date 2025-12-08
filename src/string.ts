/**
 * 确保字符串以指定前缀开始；若未以该前缀开始则添加之。
 *
 * Ensure a string starts with the specified prefix; if not, prepend it.
 *
 * @param {string} prefix - 要确保的前缀 / prefix to ensure
 * @param {string} str - 待处理的字符串 / input string
 * @returns {string} 如果 `str` 已以 `prefix` 开头则返回原字符串，否则返回加上前缀后的新字符串 / original string if it already starts with prefix, otherwise the string with prefix prepended
 *
 * @example
 * // ensurePrefix('pre-', 'fix') -> 'pre-fix'
 */
export function ensurePrefix(prefix: string, str: string) {
  if (!str.startsWith(prefix)) {
    return `${prefix}${str}`
  }
  return str
}

/**
 * 确保字符串以指定后缀结束；若未以该后缀结束则添加之。
 *
 * Ensure a string ends with the specified suffix; if not, append it.
 *
 * @param {string} suffix - 要确保的后缀 / suffix to ensure
 * @param {string} str - 待处理的字符串 / input string
 * @returns {string} 如果 `str` 已以 `suffix` 结尾则返回原字符串，否则返回加上后缀后的新字符串 / original string if it already ends with suffix, otherwise the string with suffix appended
 *
 * @example
 * // ensureSuffix('.js', 'file') -> 'file.js'
 */
export function ensureSuffix(suffix: string, str: string) {
  if (!str.endsWith(suffix)) {
    return `${str}${suffix}`
  }
  return str
}

/**
 * 截断字符串并在超长时添加省略号
 *
 * Truncate a string and append an ellipsis when it exceeds the specified maximum length.
 *
 * 规则：
 * - 若 `str.length` 小于或等于 `maxLength` 则返回原字符串。
 * - 若 `maxLength` 小于或等于 0 则返回空字符串。
 * - 若 `maxLength` 小于等于 `ellipsis` 的长度，则返回 `ellipsis` 的前 `maxLength` 个字符（保证结果长度不超过 maxLength）。
 * - 否则返回 `str` 的前 (maxLength - ellipsis.length) 个字符 + `ellipsis`。
 *
 * Rules:
 * - If `str.length` <= `maxLength`, return original string.
 * - If `maxLength` <= 0, return an empty string.
 * - If `maxLength` <= `ellipsis.length`, return the first `maxLength` characters of `ellipsis`.
 * - Otherwise return the first (maxLength - ellipsis.length) characters of `str` plus `ellipsis`.
 *
 * @param {string} str - 待处理的字符串 / input string
 * @param {number} maxLength - 最大长度（包含省略号）/ maximum length including ellipsis
 * @param {string} [ellipsis='...'] - 省略符，默认为 '...' / ellipsis string, default '...'
 * @returns {string} 截断并可能包含省略号的字符串 / truncated string possibly with ellipsis
 *
 * @example
 * // truncate('abcdef', 4) -> 'a...'
 * // truncate('hello', 10) -> 'hello'
 */
export function truncate(str: string, maxLength: number, ellipsis = '...'): string {
  if (maxLength <= 0) {
    return ''
  }
  if (str.length <= maxLength) {
    return str
  }
  const eLen = ellipsis.length
  if (maxLength <= eLen) {
    return ellipsis.slice(0, maxLength)
  }
  const keep = maxLength - eLen
  return `${str.slice(0, keep)}${ellipsis}`
}

/**
 * 单位提取正则表达式
 * 匹配格式: 可选符号/空格/e + 数字 + 可选小数部分 + 单位符号或百分比
 * 示例: "10px", "-2.5em", "100%", "1.5e3rem"
 */
const _unitExp = /^[+\-=e\s]*\d+(?:\.\d+)?(?:e[+\-]?\d+)?([a-z]*|%)\s*$/i

/**
 * 从字符串值中提取CSS单位
 * Extracts CSS unit from string value
 *
 * @param value - 要检查的值，可能是字符串或其他类型
 *               The value to check, could be string or other types
 * @returns 提取的单位字符串，如果不是有效格式则返回空字符串
 *          Extracted unit string, returns empty string if not valid format
 */
export function getUnit(value: unknown): string {
  if (typeof value !== 'string') {
    return ''
  }
  const match = _unitExp.exec(value)
  if (!match || !match[1]) {
    return ''
  }
  return match[1]
}
