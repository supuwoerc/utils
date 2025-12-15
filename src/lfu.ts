import { DoublyLinkedList, DoublyLinkedListNode } from '@/doubly-linked-list'
import { isInteger } from '@/is'
import { CacheError } from '@/lru'

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

export class LFUCache<K extends keyof any, V> {
  /**
   * 缓存映射表，用于快速通过键查找对应的双向链表节点
   * Cache map for quick lookup of doubly linked list nodes by key
   * @type {Record<K, LFUCacheNode<V>>}
   * @private
   */
  #cache = {} as Record<K, LFUCacheNode<K, V>>
  #freqMap = {} as Record<number, DoublyLinkedList<V>>
  /**
   * 私有属性，缓存的最大容量
   * Private property, maximum capacity of the cache
   */
  #capacity = 0
  #minFreq = 0
  #size = 0

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

  get size(): number {
    return this.#size
  }

  get capacity(): number {
    return this.#capacity
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
    if (!this.has(key)) {
      return undefined
    }
    const node = this.#cache[key]
    this.#increaseFreq(node)
    return node.value
  }

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

  clear(): void {
    this.#cache = {} as Record<K, LFUCacheNode<K, V>>
    this.#freqMap = {} as Record<number, DoublyLinkedList<V>>
    this.#minFreq = 0
    this.#size = 0
  }

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

  #addToFreqList(freq: number, node: LFUCacheNode<K, V>) {
    if (!Object.hasOwn(this.#freqMap, freq)) {
      this.#freqMap[freq] = new DoublyLinkedList()
    }
    this.#freqMap[freq]!.addToHead(node)
  }

  #findMinFreq() {
    const freqs = Object.keys(this.#freqMap).map(Number)
    return freqs.length > 0 ? Math.min(...freqs) : 0
  }

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
