/**
 * Doubly Linked List Node
 * 双向链表节点
 *
 * @template V - The type of value stored in the node
 *            - 节点存储的值的类型
 */
export class DoublyLinkedListNode<V> {
  /** Value stored in the node */
  /** 节点存储的值 */
  value: V

  /** Reference to the previous node in the list */
  /** 指向链表中前一个节点的引用 */
  prev?: DoublyLinkedListNode<V>

  /** Reference to the next node in the list */
  /** 指向链表中后一个节点的引用 */
  next?: DoublyLinkedListNode<V>

  /**
   * Creates a new doubly linked list node
   * 创建一个新的双向链表节点
   *
   * @param value - The value to store in the node
   *              - 要存储在节点中的值
   * @param prev - Optional reference to the previous node
   *             - 指向前一个节点的可选引用
   * @param next - Optional reference to the next node
   *             - 指向后一个节点的可选引用
   */
  constructor(value: V, prev?: DoublyLinkedListNode<V>, next?: DoublyLinkedListNode<V>) {
    this.value = value
    this.prev = prev
    this.next = next
  }
}

/**
 * 双向链表实现
 * Doubly Linked List Implementation
 *
 * @template V 链表元素类型 / Type of list elements
 *
 */
export class DoublyLinkedList<V> {
  /**
   * 头节点（可选）
   * Head node (optional)
   * @type {DoublyLinkedListNode<V> | undefined}
   */
  #head?: DoublyLinkedListNode<V>

  /**
   * 尾节点（可选）
   * Tail node (optional)
   * @type {DoublyLinkedListNode<V> | undefined}
   */
  #tail?: DoublyLinkedListNode<V>

  /**
   * 链表当前大小（节点数量）
   * Current size of the linked list (number of nodes)
   * @type {number}
   * @default 0
   */
  #size: number = 0

  /**
   * 获取链表长度
   * Get the size of the list
   *
   * @returns 链表中的元素数量 / Number of elements in the list
   */
  get size() {
    return this.#size
  }

  /**
   * 检查链表是否为空
   * Check if the list is empty
   *
   * @returns 如果链表为空返回 true，否则返回 false / Returns true if list is empty, false otherwise
   */
  get isEmpty() {
    return this.#size === 0
  }

  /**
   * 根据索引获取节点（私有方法）
   * Get node by index (private method)
   * @param index 要获取的节点索引 / Index of the node to get
   * @returns 找到的节点或 undefined / Found node or undefined
   */
  #getNode(index: number): DoublyLinkedListNode<V> | undefined {
    if (index < 0 || index >= this.#size) {
      return undefined
    }
    if (index < this.#size / 2) {
      let node = this.#head
      for (let i = 0; i < index; i++) {
        node = node!.next
      }
      return node
    } else {
      let node = this.#tail
      for (let i = this.#size - 1; i > index; i--) {
        node = node!.prev
      }
      return node
    }
  }

  /**
   * 检查节点是否属于当前链表（私有方法）
   * Check if a node belongs to the current list (private method)
   *
   * @param node 要检查的节点 / The node to check
   * @returns 如果节点属于当前链表返回 true，否则返回 false / Returns true if the node belongs to the current list, false otherwise
   *
   * @remarks
   * 通过遍历链表来验证节点的所有权
   * Validates node ownership by traversing the list
   */
  #isNodeInList(node: DoublyLinkedListNode<V>): boolean {
    let current = this.#head
    while (current) {
      if (current === node) {
        return true
      }
      current = current.next
    }
    return false
  }

  /**
   * 清空链表
   * Clear the list
   *
   * @remarks
   * 移除所有节点，重置链表状态
   * Remove all nodes and reset list state
   */
  clear() {
    this.#head = undefined
    this.#tail = undefined
    this.#size = 0
  }

  /**
   * 获取链表第一个元素的值
   * Get the value of the first element
   *
   * @returns 第一个元素的值或 undefined / Value of first element or undefined
   */
  front() {
    return this.#head?.value
  }

  /**
   * 获取链表最后一个元素的值
   * Get the value of the last element
   *
   * @returns 最后一个元素的值或 undefined / Value of last element or undefined
   */
  back() {
    return this.#tail?.value
  }

  /**
   * 在链表尾部添加元素
   * Add element at the end of the list
   *
   * @param value 要添加的值 / Value to add
   * @returns 链表自身（支持链式调用） / The list itself (supports method chaining)
   *
   * @example
   * list.push(1).push(2).push(3)
   */
  push(value: V): this {
    const node = new DoublyLinkedListNode(value)
    if (this.isEmpty) {
      this.#head = node
      this.#tail = node
    } else {
      this.#tail!.next = node
      node.prev = this.#tail
      this.#tail = node
    }
    this.#size++
    return this
  }

  /**
   * Removes and returns the tail node of the doubly linked list.
   * If the list is empty, returns undefined.
   *
   * 移除并返回双向链表的尾节点。
   * 如果链表为空，返回 undefined。
   *
   * @returns {DoublyLinkedListNode<V> | undefined} The removed tail node, or undefined if the list is empty.
   * 被移除的尾节点，如果链表为空则返回 undefined。
   */
  removeTail(): DoublyLinkedListNode<V> | undefined {
    if (this.isEmpty) {
      return undefined
    }
    if (this.#head === this.#tail) {
      const node = this.#head
      this.clear()
      return node
    }
    const node = this.#tail
    const prev = this.#tail!.prev
    node!.prev = undefined
    prev!.next = undefined
    this.#tail = prev
    this.#size--
    return node
  }

  /**
   * 移除并返回链表最后一个元素
   * Remove and return the last element
   *
   * @returns 被移除的元素值或 undefined / Removed element value or undefined
   */
  pop() {
    const node = this.removeTail()
    return node?.value
  }

  /**
   * Adds a node to the head (beginning) of the doubly linked list.
   *
   * 将节点添加到双向链表的头部（开头）。
   *
   * @param {DoublyLinkedListNode<V>} node - The node to add to the head of the list.
   * 要添加到链表头部的节点。
   *
   * @returns {DoublyLinkedList<V>} The current list instance for method chaining.
   * 当前链表实例，支持方法链式调用。
   */
  addToHead(node: DoublyLinkedListNode<V>) {
    if (node.prev !== undefined || node.next !== undefined) {
      throw new Error('node is already part of a list')
    }
    if (this.isEmpty) {
      this.#head = node
      this.#tail = node
    } else {
      this.#head!.prev = node
      node.next = this.#head
      this.#head = node
    }
    this.#size++
    return this
  }

  /**
   * 在链表头部添加元素
   * Add element at the beginning of the list
   *
   * @param value 要添加的值 / Value to add
   * @returns 链表自身（支持链式调用） / The list itself (supports method chaining)
   *
   * @example
   * list.unshift(1).unshift(2).unshift(3)
   */
  unshift(value: V) {
    return this.addToHead(new DoublyLinkedListNode(value))
  }

  /**
   * 移除并返回链表第一个元素
   * Remove and return the first element
   *
   * @returns 被移除的元素值或 undefined / Removed element value or undefined
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
    } else {
      this.#head!.prev = undefined // remove reference
    }
    oldHead.next = undefined // remove reference
    return oldHead.value
  }

  /**
   * 获取指定索引位置的元素值
   * Get element value at specified index
   *
   * @param index 要获取的索引位置 / Index position to get
   * @returns 索引位置的元素值或 undefined / Element value at index or undefined
   */
  get(index: number) {
    const node = this.#getNode(index)
    return node?.value
  }

  /**
   * 设置指定索引位置的元素值
   * Set element value at specified index
   *
   * @param index 要设置的索引位置 / Index position to set
   * @param value 要设置的新值 / New value to set
   * @returns 如果设置成功返回 true，否则返回 false / Returns true if successful, false otherwise
   */
  set(index: number, value: V): boolean {
    const node = this.#getNode(index)
    if (!node) {
      return false
    }
    node.value = value
    return true
  }

  /**
   * 在指定索引位置插入元素
   * Insert element at specified index
   *
   * @param index 要插入的索引位置 / Index position to insert at
   * @param value 要插入的值 / Value to insert
   * @returns 如果插入成功返回 true，否则返回 false / Returns true if successful, false otherwise
   *
   * @remarks
   * 支持在头部、尾部和中间位置插入
   * Supports insertion at head, tail, and middle positions
   */
  insert(index: number, value: V): boolean {
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
    const node = new DoublyLinkedListNode(value)
    const prev = this.#getNode(index - 1)
    if (!prev?.next) {
      return false
    }
    node.next = prev.next
    node.prev = prev
    prev.next.prev = node
    prev.next = node
    this.#size++
    return true
  }

  /**
   * 从双向链表中移除指定的节点
   * Removes a specific node from the doubly linked list
   *
   * @param node 要从链表中移除的节点 / The node to remove from the list
   * @returns 如果节点被找到并移除返回 true，否则返回 false / True if the node was found and removed, false otherwise
   */
  removeNode(node: DoublyLinkedListNode<V>): boolean {
    if (!node || this.isEmpty || !this.#isNodeInList(node)) {
      return false
    }
    if (node.prev) {
      node.prev.next = node.next
    } else {
      this.#head = node.next
    }
    if (node.next) {
      node.next.prev = node.prev
    } else {
      this.#tail = node.prev
    }
    node.prev = undefined
    node.next = undefined
    this.#size--
    return true
  }

  /**
   * 移除指定索引位置的元素
   * Remove element at specified index
   *
   * @param index 要移除的索引位置 / Index position to remove
   * @returns 如果移除成功返回 true，否则返回 false / Returns true if successful, false otherwise
   *
   * @remarks
   * 支持移除头部、尾部和中间位置的元素
   * Supports removal of elements at head, tail, and middle positions
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
    const prev = this.#getNode(index - 1)
    const removeTarget = prev!.next!
    prev!.next = removeTarget.next
    removeTarget.next!.prev = prev
    removeTarget.prev = undefined // remove reference
    removeTarget.next = undefined // remove reference
    this.#size--
    return true
  }

  /**
   * 反转链表
   * Reverse the list
   *
   * @returns 反转后的链表自身（支持链式调用） / The reversed list itself (supports method chaining)
   *
   * @remarks
   * 原地反转，不创建新链表
   * In-place reversal, does not create new list
   *
   * @example
   * list.push(1).push(2).push(3)  // 1 ⇄ 2 ⇄ 3
   * list.reverse()                // 3 ⇄ 2 ⇄ 1
   */
  reverse(): this {
    if (this.#size <= 1) {
      return this
    }
    let prev: DoublyLinkedListNode<V> | undefined
    let current: DoublyLinkedListNode<V> | undefined = this.#head
    let next: DoublyLinkedListNode<V> | undefined
    while (current) {
      next = current.next
      current.next = prev
      current.prev = next
      prev = current
      current = next
    }
    const oldHead = this.#head
    this.#head = this.#tail
    this.#tail = oldHead
    return this
  }

  /**
   * 默认迭代器，支持 for...of 循环
   * Default iterator, supports for...of loop
   *
   * @yields 链表中的每个元素值 / Each element value in the list
   *
   * @example
   * for (const value of list) {
   *   console.log(value)
   * }
   */
  *[Symbol.iterator]() {
    let current = this.#head
    while (current) {
      yield current.value
      current = current.next
    }
  }

  /**
   * 清空并遍历链表
   * Drain and traverse the list
   *
   * @yields 每次移除的链表头部元素值 / Head element value removed each time
   *
   * @remarks
   * 遍历过程中会清空链表
   * The list will be cleared during traversal
   *
   * @example
   * for (const value of list.drain()) {
   *   console.log(value) // 链表逐渐被清空 / List is gradually cleared
   * }
   */
  *drain() {
    while (this.#head) {
      yield this.shift() as V
    }
  }
}
