import type { Tree, TreeNode } from '@/tree'

/**
 * 将扁平数组转换为树结构
 *
 * Convert a flat array into a tree structure.
 *
 * @template T - 数组项类型 / item type
 * @param {T[]} data - 原始扁平数据数组 / original flat data array
 * @param {string} [childrenKey='children'] - 子节点字段名 / children field name
 * @param {keyof T} [idKey='id' as keyof T] - 表示节点 id 的字段名 / field name for node id
 * @param {keyof T} [pidKey='pid' as keyof T] - 表示父节点 id 的字段名 / field name for parent id
 * @param {any} [rootPid=''] - 根节点的父 id 值（用于识别顶层节点）/ parent id value of root nodes
 * @returns {Tree<T>[]} 转换后的树数组 / tree array after conversion
 *
 * @example
 * // array2Tree(data)
 */
export function array2Tree<T extends Record<keyof any, any> = TreeNode>(
  data: T[],
  childrenKey = 'children',
  idKey = 'id' as keyof T,
  pidKey = 'pid' as keyof T,
  rootPid: string | number | null | undefined = '',
): Tree<T>[] {
  const map = new Map<keyof any, T>()
  const res: Tree<T>[] = []
  data.forEach((item) => {
    const id = item[idKey]
    const pid = item[pidKey]
    const wrapItem = { ...item, [childrenKey]: map.get(id)?.[childrenKey] ?? [] }
    map.set(id, wrapItem)
    if (pid === rootPid || !pid) {
      res.push(wrapItem)
    } else {
      if (!map.get(pid)) {
        map.set(pid, { [childrenKey]: [] } as T)
      }
      const parent = map.get(pid)
      if (parent) {
        parent[childrenKey].push(wrapItem)
      }
    }
  })
  return res
}

/**
 * Fisher-Yates 洗牌算法（原地洗牌）
 * Fisher-Yates shuffle algorithm (in-place)
 *
 * @param array - 需要洗牌的数组 / Array to shuffle
 * @returns 洗牌后的数组（原地修改） / Shuffled array (modified in-place)
 *
 * @example
 * // 原地洗牌
 * const arr = [1, 2, 3, 4, 5]
 * shuffle(arr) // arr 已被洗牌
 */
export function shuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

/**
 * Fisher-Yates 洗牌算法（不修改原数组）
 * Fisher-Yates shuffle algorithm (non-mutating)
 *
 * @param array - 需要洗牌的数组 / Array to shuffle
 * @returns 洗牌后的新数组 / New shuffled array
 *
 * @example
 * // 不修改原数组
 * const original = [1, 2, 3, 4, 5]
 * const shuffled = shuffleImmutable(original) // original 保持不变
 */
export function shuffleImmutable<T>(array: readonly T[]): T[] {
  const copy = [...array]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/**
 * 根据自定义相等函数对数组进行去重 / Deduplicate array by custom equality function
 * @param {readonly T[]} array - 需要去重的数组 / The array to deduplicate
 * @param {(a: any, b: any) => boolean} equalFn - 判断两个元素是否相等的函数 / Function to determine if two elements are equal
 * @returns {T[]} 去重后的新数组 / New array with duplicates removed
 * @template T - 数组元素类型 / Array element type
 * @example
 * const arr = [{id: 1}, {id: 2}, {id: 1}]
 * const result = uniqueBy(arr, (a, b) => a.id === b.id)
 * // result: [{id: 1}, {id: 2}]
 */
export function uniqueBy<T>(array: readonly T[], equalFn: (a: any, b: any) => boolean): T[] {
  return array.reduce((prev: T[], cur: any) => {
    const index = prev.findIndex((item: any) => equalFn(cur, item))
    if (index === -1) {
      prev.push(cur)
    }
    return prev
  }, [])
}

/**
 * 从数组中随机抽取指定数量的元素（允许重复）
 * Randomly selects a specified number of elements from an array (with replacement)
 *
 * @param array - 源数组 / Source array
 * @param quantity - 需要抽取的元素数量 / Number of elements to sample
 * @returns 包含随机抽取元素的数组 / Array containing randomly sampled elements
 * @example
 * // 返回可能包含重复元素的3个随机元素
 * // Returns 3 random elements that may contain duplicates
 * sampleWithReplacement([1, 2, 3, 4, 5], 3)
 */
export function sampleWithReplacement<T>(array: T[], quantity: number): T[] {
  return Array.from({ length: quantity }, () => array[Math.floor(Math.random() * array.length)])
}

/**
 * 从数组中随机抽取指定数量的不重复元素
 * Randomly selects a specified number of unique elements from an array (without replacement)
 *
 * @param array - 源数组 / Source array
 * @param quantity - 需要抽取的元素数量 / Number of elements to sample
 * @returns 包含随机抽取不重复元素的数组 / Array containing randomly sampled unique elements
 * @throws {Error} 当请求数量超过数组长度时抛出错误 / Throws error when requested quantity exceeds array length
 * @example
 * // 返回3个不重复的随机元素
 * // Returns 3 unique random elements
 * sampleWithoutReplacement([1, 2, 3, 4, 5], 3)
 */
export function sampleWithoutReplacement<T>(array: T[], quantity: number): T[] {
  if (quantity > array.length) {
    throw new Error(`Requested quantity (${quantity}) exceeds array length (${array.length})`)
  }

  if (quantity === array.length) {
    // 如果请求数量等于数组长度，直接返回洗牌后的数组
    // If requested quantity equals array length, return shuffled array directly
    return shuffle([...array])
  }

  // 使用 Fisher-Yates 洗牌算法的部分实现进行高效抽样
  // Use partial Fisher-Yates shuffle algorithm for efficient sampling
  const result: T[] = []
  const copy = [...array]

  for (let i = 0; i < quantity; i++) {
    // 在剩余元素中随机选择一个
    // Randomly select one from remaining elements
    const randomIndex = Math.floor(Math.random() * (copy.length - i))

    // 交换到当前位置
    // Swap to current position
    const temp = copy[randomIndex]
    copy[randomIndex] = copy[copy.length - 1 - i]
    copy[copy.length - 1 - i] = temp

    result.push(temp)
  }
  return result
}

/**
 * 从数组中随机抽取指定数量的元素（可以选择是否允许重复）
 * Randomly selects a specified number of elements from an array (chooses with/without replacement)
 *
 * @param array - 源数组 / Source array
 * @param quantity - 需要抽取的元素数量 / Number of elements to sample
 * @param allowReplacement - 是否允许重复抽取，默认为false / Whether to allow replacement, defaults to false
 * @returns 包含随机抽取元素的数组 / Array containing randomly sampled elements
 * @example
 * // 默认不允许重复
 * // No replacement by default
 * sample([1, 2, 3, 4, 5], 3)
 *
 * // 显式指定允许重复
 * // Explicitly allow replacement
 * sample([1, 2, 3, 4, 5], 3, true)
 */
export function sample<T>(array: T[], quantity: number, allowReplacement: boolean = false): T[] {
  if (allowReplacement) {
    return sampleWithReplacement(array, quantity)
  } else {
    return sampleWithoutReplacement(array, quantity)
  }
}
