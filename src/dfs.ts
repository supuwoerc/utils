import type { Tree, TreeNode } from '@/tree'

/**
 * 深度优先遍历树结构
 * Depth-first traversal of tree structure
 *
 * @template T 树节点类型 Tree node type
 * @template K 子节点属性键名类型 Children property key name type
 *
 * @param {Tree<T, K>} tree 要遍历的树根节点 Root node of the tree to traverse
 * @param {(node: T) => boolean | void} callback 遍历回调函数，返回false可中断遍历
 *                 Traversal callback function, return false to break the traversal
 * @param {K} [childrenKey='children'] 子节点属性键名，默认为'children'
 *                 Children property key name, defaults to 'children'
 *
 * @returns {void}
 *
 * @example
 * ```typescript
 * interface MyNode {
 *   id: number;
 *   name: string;
 *   children?: MyNode[];
 * }
 *
 * const tree: MyNode = {
 *   id: 1,
 *   name: 'root',
 *   children: [
 *     { id: 2, name: 'child1' },
 *     { id: 3, name: 'child2', children: [{ id: 4, name: 'grandchild' }] }
 *   ]
 * };
 *
 * dfs(tree, (node) => {
 *   console.log(node.name);
 *   // 返回false可中断遍历
 *   // Return false to break traversal
 *   // if (node.id === 3) return false;
 * }, 'children');
 * ```
 */
export function dfs<T = TreeNode, K extends string = 'children'>(
  tree: Tree<T, K>,
  callback: (node: Tree<T, K>) => boolean | void,
  childrenKey: K = 'children' as K,
) {
  if (!tree) {
    return
  }
  const stack: Array<Tree<T, K>> = [tree]
  // 使用WeakSet避免循环引用
  const visited = new WeakSet()
  while (stack.length !== 0) {
    const node = stack.pop()!
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
      for (let index = children.length - 1; index >= 0; index--) {
        stack.push(children[index])
      }
    }
  }
}
