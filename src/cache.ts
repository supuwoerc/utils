import { isInteger } from './is'

/**
 * LRU (Least Recently Used) 缓存类
 * LRU (Least Recently Used) Cache Class
 *
 * 基于最近最少使用原则的缓存实现，当缓存达到容量上限时，
 * 会自动移除最久未被访问的项。
 *
 * Implementation of cache based on Least Recently Used principle.
 * When the cache reaches its capacity limit, it automatically removes
 * the least recently accessed item.
 */
export class LRUCache {
  /**
   * 私有 Map 对象，用于存储键值对
   * Private Map object for storing key-value pairs
   *
   * Map 能够记住键的原始插入顺序，这对于实现 LRU 算法很重要
   * Map can remember the original insertion order of keys,
   * which is important for implementing LRU algorithm
   */
  #cache = new Map()

  /**
   * 私有属性，缓存的最大容量
   * Private property, maximum capacity of the cache
   */
  #length = 0

  /**
   * 构造函数，初始化 LRU 缓存
   * Constructor, initializes LRU cache
   *
   * @param length - 缓存的最大容量，必须是正整数
   *                Maximum capacity of the cache, must be a positive integer
   *
   * @throws {string} 如果 length 不是整数，抛出 'cache size must be integer'
   *         If length is not an integer, throws 'cache size must be integer'
   *
   * @throws {string} 如果 length <= 0，抛出 'cache size must be greater then 0'
   *         If length <= 0, throws 'cache size must be greater then 0'
   */
  constructor(length: number) {
    if (!isInteger(length)) {
      // eslint-disable-next-line no-throw-literal
      throw 'cache size must be integer '
    }
    if (length <= 0) {
      // eslint-disable-next-line no-throw-literal
      throw 'cache size must be greater then 0'
    }
    this.#length = length
  }

  /**
   * 检查缓存中是否存在指定的键
   * Check if the specified key exists in the cache
   *
   * @param key - 要检查的键
   *             Key to check
   *
   * @returns {boolean} 如果键存在返回 true，否则返回 false
   *          Returns true if key exists, false otherwise
   */
  has(key: any) {
    return this.#cache.has(key)
  }

  /**
   * 向缓存中添加或更新键值对
   * Add or update a key-value pair in the cache
   *
   * 如果键已存在，会先删除旧记录再添加新记录，
   * 这样能确保该键成为最近使用的项。
   *
   * If the key already exists, it will delete the old record
   * before adding the new one, ensuring this key becomes
   * the most recently used item.
   *
   * 如果添加后缓存大小超过容量限制，会自动移除最久未使用的项。
   *
   * If the cache size exceeds capacity after adding,
   * it automatically removes the least recently used item.
   *
   * @param key - 要设置的键
   *             Key to set
   * @param value - 要设置的值
   *               Value to set
   */
  set(key: any, value: any) {
    if (this.has(key)) {
      this.#cache.delete(key)
    }
    this.#cache.set(key, value)
    if (this.#cache.size > this.#length) {
      this.#cache.delete(this.#cache.keys().next().value)
    }
  }

  /**
   * 从缓存中获取指定键的值
   * Get the value of the specified key from the cache
   *
   * 获取操作会使该键成为最近使用的项（LRU 特性）。
   *
   * The get operation makes this key the most recently used item (LRU feature).
   *
   * @param key - 要获取的键
   *             Key to get
   *
   * @returns {any | undefined} 如果键存在返回对应的值，否则返回 undefined
   *          Returns the corresponding value if key exists, undefined otherwise
   */
  get(key: any) {
    if (this.has(key)) {
      const res = this.#cache.get(key)
      this.#cache.delete(key)
      this.#cache.set(key, res)
      return res
    }
  }

  /**
   * 获取当前缓存的大小（已存储的项数）
   * Get the current size of the cache (number of stored items)
   *
   * @returns {number} 缓存中当前存储的项数
   *          Number of items currently stored in the cache
   */
  get size(): number {
    return this.#cache.size
  }

  /**
   * 获取缓存的容量限制
   * Get the capacity limit of the cache
   *
   * @returns {number} 缓存的最大容量
   *          Maximum capacity of the cache
   */
  get capacity(): number {
    return this.#length
  }

  /**
   * 清空缓存中的所有项
   * Clear all items from the cache
   */
  clear(): void {
    this.#cache.clear()
  }

  /**
   * 删除缓存中指定的键
   * Delete the specified key from the cache
   *
   * @param key - 要删除的键
   *             Key to delete
   *
   * @returns {boolean} 如果键存在并被删除返回 true，否则返回 false
   *          Returns true if key existed and was deleted, false otherwise
   */
  delete(key: any): boolean {
    return this.#cache.delete(key)
  }
}
