import { DoublyLinkedList, DoublyLinkedListNode } from '@/doubly-linked-list'
import { isInteger } from '@/is'
import { CacheError, ValueWithTTL } from '@/lru'

/**
 * LFU缓存节点类，继承自双向链表节点
 * LFU Cache Node class, extends Doubly Linked List Node
 *
 * @template K - 键的类型，必须是对象键类型（string | number | symbol）
 *           Type of key, must be object key type (string | number | symbol)
 * @template V - 值的类型
 *           Type of value
 * @extends {DoublyLinkedListNode<V>}
 */
export class LFUCacheNode<K extends keyof any, V> extends DoublyLinkedListNode<V> {
  /**
   * 缓存节点的键
   * Key of the cache node
   * @type {K}
   */
  key: K

  /**
   * 节点的访问频率
   * Access frequency of the node
   * @type {number}
   */
  freq: number

  constructor(key: K, value: V, freq: number = 1) {
    super(value)
    this.key = key
    this.freq = freq
  }
}

/**
 * LFU (Least Frequently Used) 缓存类
 * LFU (Least Frequently Used) Cache Class
 *
 * 基于最少使用次数进行淘汰的缓存实现。
 * Cache implementation that evicts items with the lowest access frequency.
 *
 * @template K 缓存键的类型 / Type of cache keys
 * @template V 缓存值的类型 / Type of cache values
 */
export class LFUCache<K extends keyof any, V> {
  /**
   * 缓存映射表，用于快速通过键查找对应的双向链表节点
   * Cache map for quick lookup of doubly linked list nodes by key
   * @type {Record<K, LFUCacheNode<V>>}
   * @private
   */
  #cache = {} as Record<K, LFUCacheNode<K, V>>

  /**
   * 频次到对应节点列表的映射
   * Map from frequency to the corresponding node list
   * @type {Record<number, DoublyLinkedList<V>>}
   * @private
   */
  #freqMap = {} as Record<number, DoublyLinkedList<V>>
  /**
   * 私有属性，缓存的最大容量
   * Private property, maximum capacity of the cache
   */
  #capacity = 0
  /**
   * 当前缓存中最小的访问频次
   * Current minimum access frequency in the cache
   *
   * 用于快速定位需要淘汰的频次档位。
   * Used to quickly locate the frequency bucket to evict from.
   */
  #minFreq = 0
  /**
   * 当前缓存中已存储的元素数量
   * Current number of items stored in the cache
   */
  #size = 0

  /**
   * 创建 LFU 缓存实例
   * Create an LFU cache instance
   *
   * @param {number} capacity 缓存容量，必须是正整数 / Cache capacity, must be a positive integer
   * @throws {CacheError} 当容量不是正整数时抛出 / Thrown when capacity is not a positive integer
   */
  constructor(capacity: number) {
    if (!isInteger(capacity)) {
      throw new CacheError('cache capacity must be integer')
    }
    if (capacity <= 0) {
      throw new CacheError('cache capacity must be greater than 0')
    }
    this.#capacity = capacity
    this.#minFreq = 0
  }

  /**
   * 获取当前缓存中的元素数量
   * Get the number of items currently stored in the cache
   *
   * @returns {number} 当前缓存大小 / Current cache size
   */
  get size(): number {
    return this.#size
  }

  /**
   * 获取缓存的最大容量
   * Get the maximum capacity of the cache
   *
   * @returns {number} 缓存最大容量 / Maximum cache capacity
   */
  get capacity(): number {
    return this.#capacity
  }

  /**
   * 检查缓存中是否存在指定的键
   * Check if the specified key exists in the cache
   *
   * @param {K} key 要检查的键 / Key to check
   * @returns {boolean} 如果键存在返回 true，否则返回 false / Returns true if key exists, false otherwise
   */
  has(key: K) {
    return Object.hasOwn(this.#cache, key)
  }

  /**
   * 从缓存中获取指定键的值
   * Get the value associated with the specified key from the cache
   *
   * 获取操作会增加该键的访问频率（LFU 特性）。
   * The get operation increases the access frequency of this key (LFU behavior).
   *
   * @param {K} key 要获取的键 / Key to get
   * @returns {V | undefined} 如果键存在返回对应的值，否则返回 undefined / Returns the value if key exists, otherwise undefined
   */
  get(key: K): V | undefined {
    if (!this.has(key)) {
      return undefined
    }
    const node = this.#cache[key]
    this.#increaseFreq(node)
    return node.value
  }

  /**
   * 向缓存中添加或更新键值对
   * Add or update a key-value pair in the cache
   *
   * - 如果键已存在：更新其值并提升访问频率
   * - 如果键不存在：在容量不足时淘汰一个最少使用项后再插入新项
   * - If the key exists: update its value and increase its frequency
   * - If the key does not exist: evict one least frequently used item when full, then insert
   *
   * @param {K} key 要设置的键 / Key to set
   * @param {V} value 要设置的值 / Value to set
   * @returns {LFUCache<K, V>} 当前缓存实例（支持链式调用）/ Current cache instance (for chaining)
   */
  set(key: K, value: V) {
    if (this.has(key)) {
      const node = this.#cache[key]
      node.value = value
      this.#increaseFreq(node)
    } else {
      if (this.size >= this.#capacity) {
        this.#removeMinFreqNode()
      }
      const node = new LFUCacheNode(key, value)
      this.#cache[key] = node
      this.#addToFreqList(1, node)
      this.#minFreq = 1
      this.#size++
    }
    return this
  }

  /**
   * 清空缓存中的所有数据
   * Clear all data in the cache
   */
  clear(): void {
    this.#cache = {} as Record<K, LFUCacheNode<K, V>>
    this.#freqMap = {} as Record<number, DoublyLinkedList<V>>
    this.#minFreq = 0
    this.#size = 0
  }

  /**
   * 删除缓存中指定的键
   * Delete the specified key from the cache
   *
   * 删除成功时会从对应频次链表中移除节点，并在需要时更新最小频次。
   * When deletion succeeds, the node is removed from its frequency list and min frequency may be updated.
   *
   * @param {K} key 要删除的键 / Key to delete
   * @returns {boolean} 如果键存在并被删除返回 true，否则返回 false / Returns true if key existed and was deleted, false otherwise
   */
  delete(key: K): boolean {
    if (this.has(key)) {
      const node = this.#cache[key]
      const freq = node.freq
      delete this.#cache[key]
      this.#freqMap[freq].removeNode(node)
      if (this.#freqMap[freq].isEmpty) {
        delete this.#freqMap[freq]
        if (freq === this.#minFreq) {
          this.#minFreq = this.#findMinFreq()
        }
      }
      this.#size--
      return true
    }
    return false
  }

  /**
   * 提升节点的访问频率（私有方法）
   * Increase the access frequency of a node (private method)
   *
   * 会将节点从旧频次链表移除并加入到新频次对应的链表头部。
   * Removes the node from the old frequency list and adds it to the head of the new frequency list.
   *
   * @param node 要提升频率的节点 / Node whose frequency should be increased
   * @private
   */
  #increaseFreq(node: LFUCacheNode<K, V>) {
    const oldFreq = node.freq
    const freqList = this.#freqMap[oldFreq]
    freqList.removeNode(node)
    if (freqList.isEmpty && oldFreq === this.#minFreq) {
      this.#minFreq++
    }
    node.freq = oldFreq + 1
    this.#addToFreqList(node.freq, node)
  }

  /**
   * 将节点加入指定频次的链表（私有方法）
   * Add a node to the list of the specified frequency (private method)
   *
   * @param {number} freq 目标频次 / Target frequency
   * @param {LFUCacheNode<K, V>} node 要加入的节点 / Node to add
   * @private
   */
  #addToFreqList(freq: number, node: LFUCacheNode<K, V>) {
    if (!Object.hasOwn(this.#freqMap, freq)) {
      this.#freqMap[freq] = new DoublyLinkedList()
    }
    this.#freqMap[freq]!.addToHead(node)
  }

  /**
   * 查找当前频次映射中的最小频次（私有方法）
   * Find the minimum frequency in the frequency map (private method)
   *
   * @returns {number} 当前最小频次，如果没有元素则返回 0 / Current minimum frequency, or 0 if no items
   * @private
   */
  #findMinFreq() {
    const freqs = Object.keys(this.#freqMap).map(Number)
    return freqs.length > 0 ? Math.min(...freqs) : 0
  }

  /**
   * 移除当前最小频次中的一个节点（私有方法）
   * Remove one node from the current minimum frequency list (private method)
   *
   * 会从最小频次对应链表的尾部移除一个节点，并同步更新缓存映射和大小。
   * Removes a node from the tail of the min-frequency list and updates cache map and size.
   *
   * @private
   */
  #removeMinFreqNode() {
    const minFreqList = this.#freqMap[this.#minFreq]
    const node = minFreqList.removeTail() as LFUCacheNode<K, V>
    delete this.#cache[node.key!]
    if (minFreqList.isEmpty) {
      delete this.#freqMap[this.#minFreq]
      this.#minFreq = this.#findMinFreq()
    }
    this.#size--
  }
}

/**
 * 带有 TTL（生存时间）的 LFU 缓存类
 * LFU (Least Frequently Used) cache with TTL (Time To Live) support.
 *
 * 基于最少使用次数进行淘汰，并为每个元素设置生存时间。
 * Evicts items with the lowest access frequency, each item having a time-to-live.
 *
 * @template K 缓存键的类型 / Type of cache keys
 * @template V 缓存值的类型 / Type of cache values
 */
export class LFUCacheWithTTL<K extends keyof any, V> {
  /**
   * 缓存映射表，用于快速通过键查找对应的节点
   * Cache map for quick lookup of nodes by key
   * @type {Record<K, LFUCacheNode<K, ValueWithTTL<V>>>}
   * @private
   */
  #cache = {} as Record<K, LFUCacheNode<K, ValueWithTTL<V>>>

  /**
   * 频次到对应节点列表的映射
   * Map from frequency to the corresponding node list
   * @type {Record<number, DoublyLinkedList<ValueWithTTL<V>>>}
   * @private
   */
  #freqMap = {} as Record<number, DoublyLinkedList<ValueWithTTL<V>>>

  /**
   * 缓存的最大容量
   * Maximum capacity of the cache
   * @private
   */
  #capacity = 0

  /**
   * 每个缓存项的 TTL（毫秒）
   * Time to live for each cache item in milliseconds
   * @private
   */
  #ttl: number

  /**
   * 当前缓存中最小的访问频次
   * Current minimum access frequency in the cache
   * @private
   */
  #minFreq = 0

  /**
   * 当前缓存中已存储的元素数量
   * Current number of items stored in the cache
   * @private
   */
  #size = 0

  /**
   * 创建带 TTL 的 LFU 缓存实例
   * Create an LFU cache instance with TTL support
   *
   * @param {number} capacity 缓存容量，必须是正整数 / Cache capacity, must be a positive integer
   * @param {number} ttl 生存时间（毫秒），必须是正整数 / Time-to-live in milliseconds, must be a positive integer
   * @throws {CacheError} 当 capacity 或 ttl 不是正整数时抛出 / Thrown when capacity or ttl is not a positive integer
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
    this.#minFreq = 0
  }

  /**
   * 获取当前缓存中的元素数量
   * Get the number of items currently stored in the cache
   *
   * @returns {number} 当前缓存大小 / Current cache size
   */
  get size(): number {
    return this.#size
  }

  /**
   * 获取缓存的最大容量
   * Get the maximum capacity of the cache
   *
   * @returns {number} 缓存最大容量 / Maximum cache capacity
   */
  get capacity(): number {
    return this.#capacity
  }

  /**
   * 检查缓存中是否存在指定的键且未过期
   * Check if the specified key exists in the cache and is not expired
   *
   * @param {K} key 要检查的键 / Key to check
   * @returns {boolean} 如果键存在且未过期返回 true，否则返回 false / Returns true if key exists and is not expired, false otherwise
   */
  has(key: K): boolean {
    if (!Object.hasOwn(this.#cache, key)) {
      return false
    }
    const node = this.#cache[key]
    // 过期则删除
    if (node.value.isExpired()) {
      this.#removeNodeCompletely(node)
      return false
    }
    return true
  }

  /**
   * 从缓存中获取指定键的值
   * Get the value associated with the specified key from the cache
   *
   * 获取操作会增加该键的访问频率并重置其 TTL。
   * The get operation increases the access frequency and resets the TTL of this key.
   *
   * @param {K} key 要获取的键 / Key to get
   * @returns {V | undefined} 如果键存在且未过期返回对应的值，否则返回 undefined / Returns the value if key exists and is not expired, otherwise undefined
   */
  get(key: K): V | undefined {
    if (!this.has(key)) {
      return undefined
    }
    const node = this.#cache[key]
    // 重置 TTL
    node.value.resetTTL()
    // 提升频次
    this.#increaseFreq(node)
    return node.value.value
  }

  /**
   * 向缓存中添加或更新键值对
   * Add or update a key-value pair in the cache
   *
   * - 如果键已存在：更新其值（连同 TTL）并提升访问频率
   * - 如果键不存在：在容量不足时淘汰一个最少使用项后再插入新项
   * - If the key exists: update its value (with TTL) and increase its frequency
   * - If the key does not exist: evict one least frequently used item when full, then insert
   *
   * @param {K} key 要设置的键 / Key to set
   * @param {V} value 要设置的值 / Value to set
   * @returns {LFUCacheWithTTL<K, V>} 当前缓存实例（支持链式调用）/ Current cache instance (for chaining)
   */
  set(key: K, value: V) {
    if (this.has(key)) {
      const node = this.#cache[key]
      node.value = new ValueWithTTL(value, this.#ttl)
      this.#increaseFreq(node)
    } else {
      if (this.#size >= this.#capacity) {
        this.#removeMinFreqNode()
      }
      const node = new LFUCacheNode<K, ValueWithTTL<V>>(key, new ValueWithTTL(value, this.#ttl))
      this.#cache[key] = node
      this.#addToFreqList(1, node)
      this.#minFreq = 1
      this.#size++
    }
    return this
  }

  /**
   * 清空缓存中的所有数据
   * Clear all data in the cache
   */
  clear(): void {
    this.#cache = {} as Record<K, LFUCacheNode<K, ValueWithTTL<V>>>
    this.#freqMap = {} as Record<number, DoublyLinkedList<ValueWithTTL<V>>>
    this.#minFreq = 0
    this.#size = 0
  }

  /**
   * 删除缓存中指定的键
   * Delete the specified key from the cache
   *
   * 删除成功时会从对应频次链表中移除节点，并在需要时更新最小频次。
   * When deletion succeeds, the node is removed from its frequency list and min frequency may be updated.
   *
   * @param {K} key 要删除的键 / Key to delete
   * @returns {boolean} 如果键存在并被删除返回 true，否则返回 false / Returns true if key existed and was deleted, false otherwise
   */
  delete(key: K): boolean {
    if (!this.has(key)) {
      return false
    }
    const node = this.#cache[key]
    this.#removeNodeCompletely(node)
    return true
  }

  /**
   * 提升节点的访问频率（私有方法）
   * Increase the access frequency of a node (private method)
   *
   * 会将节点从旧频次链表移除并加入到新频次对应的链表头部。
   * Removes the node from the old frequency list and adds it to the head of the new frequency list.
   *
   * @param node 要提升频率的节点 / Node whose frequency should be increased
   * @private
   */
  #increaseFreq(node: LFUCacheNode<K, ValueWithTTL<V>>) {
    const oldFreq = node.freq
    const freqList = this.#freqMap[oldFreq]
    if (freqList) {
      freqList.removeNode(node)
      if (freqList.isEmpty && oldFreq === this.#minFreq) {
        this.#minFreq++
      }
    }
    node.freq = oldFreq + 1
    this.#addToFreqList(node.freq, node)
  }

  /**
   * 将节点加入指定频次的链表（私有方法）
   * Add a node to the list of the specified frequency (private method)
   *
   * @param {number} freq 目标频次 / Target frequency
   * @param {LFUCacheNode<K, ValueWithTTL<V>>} node 要加入的节点 / Node to add
   * @private
   */
  #addToFreqList(freq: number, node: LFUCacheNode<K, ValueWithTTL<V>>) {
    if (!Object.hasOwn(this.#freqMap, freq)) {
      this.#freqMap[freq] = new DoublyLinkedList<ValueWithTTL<V>>()
    }
    this.#freqMap[freq]!.addToHead(node)
  }

  /**
   * 查找当前频次映射中的最小频次（私有方法）
   * Find the minimum frequency in the frequency map (private method)
   *
   * @returns {number} 当前最小频次，如果没有元素则返回 0 / Current minimum frequency, or 0 if no items
   * @private
   */
  #findMinFreq() {
    const freqs = Object.keys(this.#freqMap).map(Number)
    return freqs.length > 0 ? Math.min(...freqs) : 0
  }

  /**
   * 完整移除一个节点（从 freqMap 与 cache 中移除，并维护 size/minFreq）（私有方法）
   * Completely remove a node (from freqMap and cache, maintaining size/minFreq) (private method)
   *
   * @param node 要移除的节点 / Node to remove
   * @private
   */
  #removeNodeCompletely(node: LFUCacheNode<K, ValueWithTTL<V>>) {
    const freq = node.freq
    const freqList = this.#freqMap[freq]
    if (freqList) {
      freqList.removeNode(node)
      if (freqList.isEmpty) {
        delete this.#freqMap[freq]
        if (freq === this.#minFreq) {
          this.#minFreq = this.#findMinFreq()
        }
      }
    }
    delete this.#cache[node.key]
    if (this.#size > 0) {
      this.#size--
    }
  }

  /**
   * 移除当前最小频次中的一个节点（私有方法）
   * Remove one node from the current minimum frequency list (private method)
   *
   * 会从最小频次对应链表的尾部移除一个节点，并同步更新缓存映射和大小。
   * Removes a node from the tail of the min-frequency list and updates cache map and size.
   *
   * @private
   */
  #removeMinFreqNode() {
    const minFreqList = this.#freqMap[this.#minFreq]
    if (!minFreqList || minFreqList.isEmpty) {
      return
    }
    const node = minFreqList.removeTail() as LFUCacheNode<K, ValueWithTTL<V>> | undefined
    if (!node) {
      return
    }
    delete this.#cache[node.key]
    if (minFreqList.isEmpty) {
      delete this.#freqMap[this.#minFreq]
      this.#minFreq = this.#findMinFreq()
    }
    if (this.#size > 0) {
      this.#size--
    }
  }
}
