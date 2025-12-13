/**
 * 链表节点类 — Linked list node class
 *
 * 表示链表中的一个节点，包含值和指向下一个节点的引用。
 * Represents a node in a linked list, containing a value and a reference to the next node.
 */
export class LinkedListNode<T> {
  value: T
  next?: LinkedListNode<T>

  /**
   * 创建链表节点 — Create a linked list node
   *
   * @param {T} value - 节点存储的值 / value stored in the node
   * @param {LinkedListNode} [next] - 下一个节点的引用（可选）/ reference to the next node (optional)
   */
  constructor(value: T, next?: LinkedListNode<T>) {
    this.value = value
    this.next = next
  }
}

/**
 * 链表类 / Linked List Class
 * 实现一个通用的单向链表数据结构 / Implements a generic linked list data structure
 * @template T 链表存储的元素类型 / Type of elements stored in the linked list
 */
export class LinkedList<T> {
  #head?: LinkedListNode<T>
  #tail?: LinkedListNode<T>
  #size: number = 0

  /**
   * 获取链表的长度 / Get the size of the linked list
   * @returns {number} 链表中元素的数量 / Number of elements in the linked list
   */
  get size() {
    return this.#size
  }

  /**
   * 检查链表是否为空 / Check if the linked list is empty
   * @returns {boolean} 如果链表为空返回true，否则返回false / Returns true if the linked list is empty, otherwise false
   */
  get isEmpty() {
    return this.#size === 0
  }

  /**
   * 获取指定索引的节点（私有方法）/ Get node at specified index (private method)
   * @private
   * @param {number} index 要获取的节点索引 / Index of the node to get
   * @returns {LinkedListNode<T> | undefined} 如果索引有效返回节点，否则返回undefined / Returns the node if index is valid, otherwise undefined
   */
  #getNode(index: number): LinkedListNode<T> | undefined {
    if (index < 0 || index >= this.#size) {
      return undefined
    }
    let node = this.#head
    for (let i = 0; i < index; i++) {
      node = node!.next
    }
    return node
  }

  /**
   * 清空链表 / Clear the linked list
   * @returns {void}
   */
  clear() {
    this.#head = undefined
    this.#tail = undefined
    this.#size = 0
  }

  /**
   * 获取链表第一个元素的值 / Get the value of the first element in the linked list
   * @returns {T | undefined} 如果链表不为空返回第一个元素的值，否则返回undefined / Returns the value of the first element if list is not empty, otherwise undefined
   */
  front() {
    return this.#head?.value
  }

  /**
   * 获取链表最后一个元素的值 / Get the value of the last element in the linked list
   * @returns {T | undefined} 如果链表不为空返回最后一个元素的值，否则返回undefined / Returns the value of the last element if list is not empty, otherwise undefined
   */
  back() {
    return this.#tail?.value
  }

  /**
   * 在链表尾部添加元素 / Add an element to the end of the linked list
   * @param {T} value 要添加的值 / Value to add
   * @returns {this} 返回链表实例以支持链式调用 / Returns the linked list instance for method chaining
   */
  push(value: T): this {
    const node = new LinkedListNode(value)
    if (this.isEmpty) {
      this.#head = node
      this.#tail = node
    } else {
      this.#tail!.next = node
      this.#tail = node
    }
    this.#size++
    return this
  }

  /**
   * 移除并返回链表最后一个元素 / Remove and return the last element of the linked list
   * @returns {T | undefined} 如果链表不为空返回被移除的元素值，否则返回undefined / Returns the removed element value if list is not empty, otherwise undefined
   */
  pop() {
    if (this.isEmpty) {
      return undefined
    }
    if (this.#head === this.#tail) {
      const value = this.#head!.value
      this.clear()
      return value
    }
    let current = this.#head
    while (current!.next !== this.#tail) {
      current = current!.next
    }
    const value = this.#tail!.value
    this.#tail = current
    this.#tail!.next = undefined
    this.#size--
    return value
  }

  /**
   * 在链表头部添加元素 / Add an element to the beginning of the linked list
   * @param {T} value 要添加的值 / Value to add
   * @returns {this} 返回链表实例以支持链式调用 / Returns the linked list instance for method chaining
   */
  unshift(value: T) {
    const node = new LinkedListNode(value)
    if (!this.isEmpty) {
      node.next = this.#head
      this.#head = node
    } else {
      this.#head = node
      this.#tail = node
    }
    this.#size++
    return this
  }

  /**
   * 移除并返回链表第一个元素 / Remove and return the first element of the linked list
   * @returns {T | undefined} 如果链表不为空返回被移除的元素值，否则返回undefined / Returns the removed element value if list is not empty, otherwise undefined
   */
  shift() {
    if (this.isEmpty) {
      return undefined
    }
    const oldHead = this.#head!
    this.#head = this.#head!.next
    this.#size--
    if (this.isEmpty) {
      this.#tail = undefined
    }
    oldHead.next = undefined // remove reference
    return oldHead.value
  }

  /**
   * 获取指定索引的元素值 / Get the element value at specified index
   * @param {number} index 要获取的索引位置 / Index position to get
   * @returns {T | undefined} 如果索引有效返回元素值，否则返回undefined / Returns the element value if index is valid, otherwise undefined
   */
  get(index: number) {
    const node = this.#getNode(index)
    return node?.value
  }

  /**
   * 设置指定索引的元素值 / Set the element value at specified index
   * @param {number} index 要设置的索引位置 / Index position to set
   * @param {T} value 要设置的新值 / New value to set
   * @returns {boolean} 如果设置成功返回true，否则返回false / Returns true if set successfully, otherwise false
   */
  set(index: number, value: T): boolean {
    const node = this.#getNode(index)
    if (!node) {
      return false
    }
    node.value = value
    return true
  }

  /**
   * 在指定索引位置插入元素 / Insert an element at specified index position
   * @param {number} index 要插入的索引位置 / Index position to insert
   * @param {T} value 要插入的值 / Value to insert
   * @returns {boolean} 如果插入成功返回true，否则返回false / Returns true if inserted successfully, otherwise false
   */
  insert(index: number, value: T): boolean {
    if (index < 0 || index > this.#size) {
      return false
    }
    if (index === this.#size) {
      this.push(value)
      return true
    }
    if (index === 0) {
      this.unshift(value)
      return true
    }
    const node = new LinkedListNode(value)
    const pre = this.#getNode(index - 1)!
    node.next = pre!.next
    pre!.next = node
    this.#size++
    return true
  }

  /**
   * 移除指定索引位置的元素 / Remove the element at specified index position
   * @param {number} index 要移除的索引位置 / Index position to remove
   * @returns {boolean} 如果移除成功返回true，否则返回false / Returns true if removed successfully, otherwise false
   */
  remove(index: number): boolean {
    if (index < 0 || index >= this.#size) {
      return false
    }
    if (index === 0) {
      this.shift()
      return true
    }
    if (index === this.#size - 1) {
      this.pop()
      return true
    }
    const pre = this.#getNode(index - 1)
    const removeTarget = pre!.next!
    pre!.next = removeTarget.next
    removeTarget.next = undefined // remove reference
    this.#size--
    return true
  }

  /**
   * 反转链表 / Reverse the linked list
   * @returns {this} 返回反转后的链表实例 / Returns the reversed linked list instance
   */
  reverse() {
    if (this.#size <= 1) {
      return this
    }
    let prev: LinkedListNode<T> | undefined
    let current: LinkedListNode<T> | undefined = this.#head
    let next: LinkedListNode<T> | undefined
    while (current) {
      next = current.next
      current.next = prev
      prev = current
      current = next
    }
    const oldHead = this.#head
    this.#head = this.#tail
    this.#tail = oldHead
    return this
  }

  /**
   * 迭代器方法，支持for...of循环 / Iterator method, supports for...of loop
   * @yields {T} 链表中的每个元素值 / Each element value in the linked list
   */
  *[Symbol.iterator]() {
    let current = this.#head
    while (current) {
      yield current.value
      current = current.next
    }
  }

  /**
   * 清空链表并依次产出所有节点值
   * Empties the linked list and yields all node values in sequence
   *
   * @yields {T} 链表节点的值 - The value of the linked list node
   * @example
   * // 清空链表并处理所有值
   * // Empty the list and process all values
   * for (const value of list.drain()) {
   *   console.log(value)
   * }
   */
  *drain() {
    while (this.#head) {
      yield this.shift()
    }
  }
}
