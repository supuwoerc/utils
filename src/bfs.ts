import type { Tree, TreeNode } from '@/tree'

/**
 * 广度优先遍历树结构 / Breadth-first search traversal of tree structure
 * @param tree - 树形结构的根节点 / Root node of the tree structure
 * @param callback - 遍历每个节点时执行的回调函数，返回false可中断遍历 / Callback function executed for each node, return false to break traversal
 * @param childrenKey - 子节点属性名，默认为'children' / Child node property name, defaults to 'children'
 * @typeParam T - 树节点数据类型 / Tree node data type
 * @typeParam K - 子节点属性键类型 / Child node property key type
 *
 * @example
 * ```typescript
 * // 示例用法 / Example usage
 * const tree = {
 *   value: 1,
 *   children: [
 *     { value: 2, children: [] },
 *     { value: 3, children: [] }
 *   ]
 * };
 *
 * bfs(tree, (node) => {
 *   console.log(node.value);
 *   // 返回false可中断遍历 / Return false to break traversal
 *   if (node.value === 2) return false;
 * });
 * ```
 */
export function bfs<T = TreeNode, K extends string = 'children'>(
  tree: Tree<T, K>,
  callback: (node: Tree<T, K>) => boolean | void,
  childrenKey: K = 'children' as K,
) {
  if (!tree) {
    return
  }
  const queue: Array<Tree<T, K>> = [tree]
  // 使用WeakSet避免循环引用
  const visited = new WeakSet()
  // 使用索引指针避免数组unshift
  let index = 0
  while (index < queue.length) {
    const node = queue[index]
    index++
    if (visited.has(node)) {
      continue
    }
    visited.add(node)
    const ok = callback(node)
    if (ok === false) {
      break
    }
    const children = node[childrenKey]
    if (Array.isArray(children)) {
      for (const child of children) {
        if (child && !visited.has(child)) {
          queue.push(child)
        }
      }
    }
  }
}
