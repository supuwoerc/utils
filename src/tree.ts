/**
 * 树节点接口（通用） — Tree node interface (generic)
 *
 * 表示树结构中的单个节点，至少包含 `id` 字段，可选 `pid`（父 id），
 * 并允许任意其它键/值对以便扩展。
 *
 * Represents a single node in a tree structure. It contains at least an `id`,
 * optionally a `pid` (parent id), and allows arbitrary additional properties.
 */
export interface TreeNode {
  id: keyof any
  pid?: keyof any
  [key: keyof any]: any
}

/**
 * 树类型 — Tree type
 *
 * 将节点类型拓展为包含可选子节点数组（默认 key 为 'children'）。
 *
 * Extends a node type to include an optional children array (default key: 'children').
 *
 * @template T - 节点类型 / node type
 * @template K - children 字段名，默认为 'children' / children key name, default 'children'
 */
export type Tree<T = TreeNode, K extends string = 'children'> = T & { [P in K]?: Tree<T, K>[] }

/**
 * 相等判断函数类型 — Equality function type
 *
 * 用于比较两个值是否相等，返回 boolean。
 *
 * Used to compare two values for equality, returns a boolean.
 *
 * @template T - 值的类型 / value type
 */
export type EqualFunc<T> = (a: T, b: T) => boolean

/**
 * 将树结构扁平化为数组
 *
 * Flatten a tree structure into an array.
 *
 * @template T - 节点类型 / node type
 * @param {Tree<T>[]} tree - 输入的树数组 / input tree array
 * @param {keyof T} [childrenKey='children' as keyof T] - 子节点字段名 / children field name
 * @returns {T[]} 扁平化后的数组 / flattened array
 *
 * @example
 * // tree2Array(tree)
 */
export function tree2Array<T = TreeNode>(
  tree: Tree<T>[],
  childrenKey = 'children' as keyof T,
): T[] {
  return tree.reduce((prev, cur) => {
    const children = cur[childrenKey] as Tree<T>[]
    return prev.concat(cur, tree2Array((children ?? []) as Tree<T>[], childrenKey))
  }, [] as T[])
}

/**
 * 根据匹配函数过滤树节点，并修剪不匹配的分支
 * Filter tree nodes by match function and prune unmatched branches
 *
 * @template T - 节点类型 / node type
 * @template K - children 字段名，默认为 'children' / children key name, default 'children'
 * @param {Tree<T, K>[]} tree - 树数组 / tree array
 * @param {(node: T) => boolean} match - 匹配函数，返回 true 表示保留节点 / match function, returns true to keep node
 * @param {K} [childrenKey='children' as K] - 子节点字段名 / children field name
 * @returns {Tree<T, K>[]} 过滤后的树数组 / filtered tree array
 *
 * @example
 * // 根据标题搜索
 * // Search by title
 * const result = filterTree(tree, (node) => node.title.includes('query'))
 */
export function filterTree<T = TreeNode, K extends string = 'children'>(
  tree: Tree<T, K>[],
  match: (node: T) => boolean,
  childrenKey: K = 'children' as K,
): Tree<T, K>[] {
  const filterAndPrune = (node: Tree<T, K>): Tree<T, K> | null => {
    const children = node[childrenKey] as Tree<T, K>[] | undefined
    let filteredChildren: Tree<T, K>[] = []
    if (children && Array.isArray(children)) {
      filteredChildren = children.map(filterAndPrune).filter((n): n is Tree<T, K> => n !== null)
    }
    if (match(node)) {
      return { ...node, [childrenKey]: filteredChildren }
    }
    if (filteredChildren.length > 0) {
      return { ...node, [childrenKey]: filteredChildren }
    }
    return null
  }
  const prunedTree = tree.map(filterAndPrune).filter((n): n is Tree<T, K> => n !== null)
  return prunedTree
}

/**
 * 根据最大深度获取子树 / Get subtree by maximum depth
 *
 * 该函数递归遍历树形结构，返回一个不超过指定深度的新树。 / This function recursively traverses a tree structure and returns a new tree with depth not exceeding the specified maximum.
 *
 * @template T - 树节点的类型，必须是一个对象 / The type of tree node, must be an object
 * @param {T[]} tree - 树形结构的数组 / Array of tree structure
 * @param {number} maxDepth - 最大深度（从0开始计数） / Maximum depth (counting from 0)
 * @param {string} [childrenKey='children'] - 子节点属性名 / Children property name
 * @param {number} [currentDepth=0] - 当前深度（内部递归使用） / Current depth (used internally for recursion)
 * @returns {T[]} - 处理后的子树数组 / Processed subtree array
 *
 * @example
 * // 示例树结构 / Example tree structure
 * const tree = [
 *   {
 *     id: 1,
 *     children: [
 *       { id: 2, children: [{ id: 3 }] }
 *     ]
 *   }
 * ];
 *
 * // 获取深度为1的子树 / Get subtree with depth 1
 * const result = getSubtreeByDepth(tree, 1);
 * // 结果: [{ id: 1, children: [{ id: 2 }] }]
 */
export function getSubtreeByDepth<T extends Record<string, any>, K extends string = 'children'>(
  tree: T[],
  maxDepth: number,
  childrenKey: K = 'children' as K,
  currentDepth: number = 0,
): T[] {
  if (currentDepth > maxDepth) {
    return []
  }
  return tree.map((node) => {
    const children = node[childrenKey] as T[] | undefined
    if (currentDepth === maxDepth) {
      return {
        ...node,
        [childrenKey]: [],
      }
    }
    if (children && children.length > 0) {
      const processedChildren = getSubtreeByDepth(children, maxDepth, childrenKey, currentDepth + 1)
      return {
        ...node,
        [childrenKey]: processedChildren,
      }
    }
    return node
  })
}

/**
 * 获取目标节点所有父节点（从根到目标的路径）
 *
 * Get all parent nodes of a target (path from root to target).
 *
 * @template T - 节点类型 / node type
 * @param {T[]} tree - 树数组 / tree array
 * @param {any} target - 目标值，用于与节点 id 进行比较 / target value to compare with node id
 * @param {keyof T} [idKey='id'] - 表示节点 id 的字段名 / field name for node id (default: 'id')
 * @param {keyof T} [childrenKey='children'] - 子节点字段名 / children field name (default: 'children')
 * @param {EqualFunc<any>} [equalFunc] - 自定义相等比较函数 / custom equality function (default: (val, tarVal) => val === tarVal)
 * @returns {T[]} 从根到目标的节点数组（包含目标节点）/ array of nodes from root to target (includes target)
 *
 * @example
 * // getParents(tree, 5)
 */
export function getParents<T = Partial<TreeNode>>(
  tree: T[],
  target: any,
  idKey: keyof T = 'id' as keyof T,
  childrenKey: keyof T = 'children' as keyof T,
  equalFunc: EqualFunc<any> = (val, tarVal) => val === tarVal,
): T[] {
  const stack: T[] = []
  const dfs = (node: T): boolean => {
    if (equalFunc(node[idKey], target)) {
      stack.push(node)
      return true
    }
    const children = node[childrenKey] as T[]
    if (children && Array.isArray(children)) {
      for (const child of children) {
        if (dfs(child)) {
          stack.push(node)
          return true
        }
      }
    }
    return false
  }
  for (const node of tree) {
    if (dfs(node)) {
      return stack.reverse()
    }
  }
  return []
}

/**
 * 在树中查找目标节点（深度优先）
 *
 * Find a target node in the tree (depth-first).
 *
 * @template T - 节点类型 / node type
 * @param {T[]} tree - 树数组 / tree array
 * @param {any} target - 目标值，用于与节点 id 进行比较 / target value to compare with node id
 * @param {keyof T} [idKey='id' as keyof T] - 表示节点 id 的字段名 / field name for node id
 * @param {EqualFunc<any>} [equalFunc] - 自定义相等比较函数 / custom equality function
 * @param {keyof T} [childrenKey='children' as keyof T] - 子节点字段名 / children field name
 * @returns {T | null} 找到的节点或 null / found node or null
 *
 * @example
 * // getTargetFromTree(tree, 5)
 */
export function getTargetFromTree<T = Partial<TreeNode>>(
  tree: T[],
  target: any,
  idKey: keyof T = 'id' as keyof T,
  equalFunc: EqualFunc<any> = (a, b) => a === b,
  childrenKey: keyof T = 'children' as keyof T,
): T | null {
  if (!Array.isArray(tree)) {
    return null
  }
  for (const item of tree) {
    if (equalFunc(item[idKey], target)) {
      return item
    }
    if (item[childrenKey]) {
      const value = getTargetFromTree(item[childrenKey] as T[], target, idKey, equalFunc)
      if (value) {
        return value as T
      }
    }
  }
  return null
}
