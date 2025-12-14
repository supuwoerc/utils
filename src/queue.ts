import { LinkedList } from '@/linked-list'

/**
 * 队列数据结构 — Queue data structure
 *
 * 基于单向链表的队列实现，支持先进先出（FIFO）操作。
 * Queue implementation based on singly linked list, supporting first-in-first-out (FIFO) operations.
 *
 */
export class Queue<T> {
  #linkedList = new LinkedList<T>()

  /**
   * 获取队列当前大小 — Get current queue size
   *
   * @returns {number} 队列中元素的数量 / number of elements in the queue
   */
  get size() {
    return this.#linkedList.size
  }

  /**
   * 清空队列 — Clear the queue
   *
   * 移除队列中的所有元素，将队列重置为空状态。
   * Removes all elements from the queue, resetting it to empty state.
   */
  clear() {
    this.#linkedList.clear()
    return this
  }

  /**
   * 入队操作 — Enqueue operation
   *
   * 将元素添加到队列的末尾。
   * Adds an element to the end of the queue.
   *
   * @param {any} value - 要添加到队列的值 / value to add to the queue
   */
  enqueue(value: any) {
    this.#linkedList.push(value)
    return this
  }

  /**
   * 出队操作 — Dequeue operation
   *
   * 移除并返回队列的第一个元素（队首）。
   * Removes and returns the first element (front) of the queue.
   *
   * @returns {any | undefined} 队列的第一个元素，如果队列为空则返回 undefined / the first element of the queue, or undefined if the queue is empty
   */
  dequeue(): any | undefined {
    return this.#linkedList.shift()
  }

  /**
   * 反转队列 — Reverse the queue
   *
   * 原地反转队列中元素的顺序。
   * Reverses the order of elements in the queue in-place.
   *
   * @example
   * const queue = new Queue()
   * queue.enqueue(1)
   * queue.enqueue(2)
   * queue.enqueue(3)
   * queue.reverse()
   * console.log([...queue]) // [3, 2, 1]
   * console.log(queue.dequeue()) // 3
   * console.log(queue.dequeue()) // 2
   * console.log(queue.dequeue()) // 1
   */
  reverse() {
    this.#linkedList.reverse()
    return this
  }

  /**
   * 查看队首元素 — Peek at front element
   *
   * 返回队列的第一个元素但不移除它。
   * Returns the first element of the queue without removing it.
   *
   * @returns {any | undefined} 队列的第一个元素，如果队列为空则返回 undefined / the first element of the queue, or undefined if the queue is empty
   */
  peek(): any | undefined {
    return this.#linkedList.front()
  }

  /**
   * 排空队列生成器 — Drain queue generator
   *
   * 一个生成器函数，逐步出队所有元素。
   * A generator function that gradually dequeues all elements.
   *
   * @yields {any | undefined} 队列中的每个元素（按出队顺序）/ each element in the queue (in dequeue order)
   *
   * @example
   * // 使用 drain 逐步处理队列 / Use drain to process queue gradually
   * for (const item of queue.drain()) {
   *   console.log(item)
   * }
   * // 循环结束后队列为空 / Queue is empty after the loop
   */
  *drain() {
    while (!this.#linkedList.isEmpty) {
      yield this.#linkedList.shift() as T
    }
  }

  /**
   * 队列迭代器 — Queue iterator
   *
   * 使队列可迭代，允许使用 for...of 循环遍历队列元素（不移除元素）。
   * Makes the queue iterable, allowing traversal of queue elements using for...of loop (without removing elements).
   *
   * @yields {any} 队列中的每个元素（按入队顺序）/ each element in the queue (in enqueue order)
   */
  *[Symbol.iterator]() {
    for (const item of this.#linkedList) {
      yield item
    }
  }
}
