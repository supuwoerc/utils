import { DoublyLinkedList, DoublyLinkedListNode } from '@/doubly-linked-list'
import { isInteger } from '@/is'

/**
 * 自定义缓存错误类
 * Custom cache error class
 *
 * @extends Error
 *
 * @example
 * // 抛出缓存错误
 * // Throw cache error
 * throw new CacheError('缓存读取失败')
 *
 * @param {string} message - 错误信息 / Error message
 */
export class CacheError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CacheError'
  }
}

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
export class LRUCache<K extends keyof any, V> {
  #cache = {} as Record<K, DoublyLinkedListNode<V, K>>

  #doublyLinkedList = new DoublyLinkedList<V, K>()

  /**
   * 私有属性，缓存的最大容量
   * Private property, maximum capacity of the cache
   */
  #capacity = 0

  /**
   * 构造函数，初始化 LRU 缓存
   * Constructor, initializes LRU cache
   *
   * @param capacity - 缓存的最大容量，必须是正整数
   *                Maximum capacity of the cache, must be a positive integer
   *
   * @throws {string} 如果 capacity 不是整数，抛出 'cache capacity must be integer'
   *         If capacity is not an integer, throws 'cache capacity must be integer'
   *
   * @throws {string} 如果 capacity <= 0，抛出 'cache capacity must be greater than 0'
   *         If capacity <= 0, throws 'cache capacity must be greater than 0'
   */
  constructor(capacity: number) {
    if (!isInteger(capacity)) {
      throw new CacheError('cache capacity must be integer')
    }
    if (capacity <= 0) {
      throw new CacheError('cache capacity must be greater than 0')
    }
    this.#capacity = capacity
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
  has(key: K) {
    return Object.hasOwn(this.#cache, key)
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
  set(key: K, value: V) {
    if (this.has(key)) {
      this.#cache[key].value = value
      this.#doublyLinkedList.removeNode(this.#cache[key])
      this.#doublyLinkedList.addToHead(this.#cache[key])
    } else {
      const node = new DoublyLinkedListNode(value, key)
      this.#cache[key] = node
      this.#doublyLinkedList.addToHead(node)
      if (this.#doublyLinkedList.size > this.#capacity) {
        const tail = this.#doublyLinkedList.removeTail()
        if (tail && tail.key) {
          delete this.#cache[tail.key]
        }
      }
    }
    return this
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
  get(key: K): V | undefined {
    if (this.has(key)) {
      const node = this.#cache[key]
      this.#doublyLinkedList.removeNode(node)
      this.#doublyLinkedList.addToHead(node)
      return node.value
    }
    return undefined
  }

  /**
   * 获取当前缓存的大小（已存储的项数）
   * Get the current size of the cache (number of stored items)
   *
   * @returns {number} 缓存中当前存储的项数
   *          Number of items currently stored in the cache
   */
  get size(): number {
    return this.#doublyLinkedList.size
  }

  /**
   * 获取缓存的容量限制
   * Get the capacity limit of the cache
   *
   * @returns {number} 缓存的最大容量
   *          Maximum capacity of the cache
   */
  get capacity(): number {
    return this.#capacity
  }

  /**
   * 清空缓存中的所有项
   * Clear all items from the cache
   */
  clear(): void {
    this.#cache = {} as Record<K, DoublyLinkedListNode<V>>
    this.#doublyLinkedList.clear()
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
  delete(key: K): boolean {
    if (this.has(key)) {
      const node = this.#cache[key]
      delete this.#cache[key]
      return this.#doublyLinkedList.removeNode(node)
    }
    return false
  }
}

/**
 * 带有生存时间（TTL）的值包装类
 * A value wrapper class with Time-To-Live (TTL) support
 *
 * @template T 存储值的类型 / Type of the stored value
 */
export class ValueWithTTL<T> {
  /** 存储的实际值 / The actual stored value */
  value: T
  /** 过期时间戳（毫秒） / Expiration timestamp in milliseconds */
  expiry: number
  /** 私有TTL值（毫秒） / Private TTL value in milliseconds */
  #ttl: number

  /**
   * 创建带有TTL的值实例
   * Creates a value instance with TTL
   *
   * @param value 要存储的值 / The value to store
   * @param ttl 生存时间（毫秒） / Time-to-live in milliseconds
   * @throws {CacheError} 当ttl不是整数或小于等于0时抛出 / Throws when ttl is not integer or <= 0
   */
  constructor(value: T, ttl: number) {
    if (!isInteger(ttl)) {
      throw new CacheError('value ttl must be integer')
    }
    if (ttl <= 0) {
      throw new CacheError('value ttl must be greater than 0')
    }
    this.value = value
    this.#ttl = ttl
    this.expiry = Date.now() + ttl
  }

  /**
   * 检查值是否已过期
   * Checks if the value has expired
   *
   * @returns {boolean} true表示已过期，false表示未过期 / true if expired, false otherwise
   */
  isExpired() {
    return this.expiry <= Date.now()
  }

  /**
   * 重置TTL，将过期时间延长一个TTL周期
   * Resets TTL, extending expiration by one TTL period
   */
  resetTTL() {
    this.expiry = Date.now() + this.#ttl
  }
}

/**
 * LRU (Least Recently Used) cache with TTL (Time To Live) support.
 * 支持TTL（生存时间）的LRU（最近最少使用）缓存。
 *
 * @template K - The type of keys in the cache. 缓存键的类型。
 * @template V - The type of values in the cache. 缓存值的类型。
 */
export class LRUCacheWithTTL<K extends keyof any, V> {
  #cache = {} as Record<K, DoublyLinkedListNode<ValueWithTTL<V>, K>>

  #doublyLinkedList = new DoublyLinkedList<ValueWithTTL<V>, K>()

  /** Maximum number of items the cache can hold. 缓存可容纳的最大项目数。 */
  #capacity = 0

  /** Time to live for cache items in milliseconds. 缓存项的生存时间（毫秒）。 */
  #ttl: number

  /**
   * Creates an instance of LRUCacheWithTTL.
   * 创建LRUCacheWithTTL的实例。
   *
   * @param {number} capacity - Maximum number of items the cache can hold. Must be a positive integer.
   *                            缓存可容纳的最大项目数。必须为正整数。
   * @param {number} ttl - Time to live for cache items in milliseconds. Must be a positive integer.
   *                       缓存项的生存时间（毫秒）。必须为正整数。
   * @throws {CacheError} If capacity or ttl is not a positive integer.
   *                      如果capacity或ttl不是正整数。
   */
  constructor(capacity: number, ttl: number) {
    if (!isInteger(capacity)) {
      throw new CacheError('cache capacity must be integer')
    }
    if (capacity <= 0) {
      throw new CacheError('cache capacity must be greater than 0')
    }
    if (!isInteger(ttl)) {
      throw new CacheError('cache ttl must be integer')
    }
    if (ttl <= 0) {
      throw new CacheError('cache ttl must be greater than 0')
    }
    this.#capacity = capacity
    this.#ttl = ttl
  }

  /**
   * Checks if a key exists in the cache and is not expired.
   * 检查键是否存在于缓存中且未过期。
   *
   * @param {K} key - The key to check. 要检查的键。
   * @returns {boolean} True if the key exists and is not expired, false otherwise.
   *                    如果键存在且未过期则返回true，否则返回false。
   */
  has(key: K) {
    if (Object.hasOwn(this.#cache, key)) {
      const node = this.#cache[key]
      if (node.value.isExpired()) {
        delete this.#cache[key]
        this.#doublyLinkedList.removeNode(node)
        return false
      }
      return true
    }
    return false
  }

  /**
   * Sets a key-value pair in the cache.
   * 在缓存中设置键值对。
   *
   * @param {K} key - The key to set. 要设置的键。
   * @param {V} value - The value to associate with the key. 与键关联的值。
   */
  set(key: K, value: V) {
    if (this.has(key)) {
      this.#cache[key].value = new ValueWithTTL(value, this.#ttl)
      this.#doublyLinkedList.removeNode(this.#cache[key])
      this.#doublyLinkedList.addToHead(this.#cache[key])
    } else {
      const node = new DoublyLinkedListNode(new ValueWithTTL(value, this.#ttl), key)
      this.#cache[key] = node
      this.#doublyLinkedList.addToHead(node)
      if (this.#doublyLinkedList.size > this.#capacity) {
        const tail = this.#doublyLinkedList.removeTail()
        if (tail && tail.key) {
          delete this.#cache[tail.key]
        }
      }
    }
    return this
  }

  /**
   * Gets the value associated with a key, updating its access time.
   * 获取与键关联的值，并更新其访问时间。
   *
   * @param {K} key - The key to retrieve. 要检索的键。
   * @returns {V | undefined} The value if found and not expired, undefined otherwise.
   *                          如果找到且未过期则返回值，否则返回undefined。
   */
  get(key: K): V | undefined {
    if (this.has(key)) {
      const node = this.#cache[key]
      node.value.resetTTL()
      this.#doublyLinkedList.removeNode(node)
      this.#doublyLinkedList.addToHead(node)
      return node.value.value
    }
    return undefined
  }

  /**
   * Removes all expired items from the cache.
   * 从缓存中移除所有过期的项目。
   *
   * @returns {number} The number of items removed. 移除的项目数量。
   */
  cleanupExpired(): number {
    let deletedCount = 0
    for (const k in this.#cache) {
      if (this.#cache[k].value.isExpired()) {
        this.#doublyLinkedList.removeNode(this.#cache[k])
        delete this.#cache[k]
        deletedCount++
      }
    }
    return deletedCount
  }

  /**
   * Gets the current number of items in the cache.
   * 获取缓存中当前的项目数量。
   *
   * @returns {number} The number of items in the cache. 缓存中的项目数量。
   */
  get size(): number {
    return this.#doublyLinkedList.size
  }

  /**
   * Gets the maximum capacity of the cache.
   * 获取缓存的最大容量。
   *
   * @returns {number} The cache capacity. 缓存容量。
   */
  get capacity(): number {
    return this.#capacity
  }

  /**
   * Clears all items from the cache.
   * 清除缓存中的所有项目。
   */
  clear(): void {
    this.#cache = {} as Record<K, DoublyLinkedListNode<ValueWithTTL<V>, K>>
    this.#doublyLinkedList.clear()
  }

  /**
   * Deletes a specific key from the cache.
   * 从缓存中删除特定的键。
   *
   * @param {K} key - The key to delete. 要删除的键。
   * @returns {boolean} True if the key was deleted, false if it didn't exist.
   *                    如果键被删除则返回true，如果键不存在则返回false。
   */
  delete(key: K): boolean {
    if (this.has(key)) {
      const node = this.#cache[key]
      delete this.#cache[key]
      return this.#doublyLinkedList.removeNode(node)
    }
    return false
  }
}
