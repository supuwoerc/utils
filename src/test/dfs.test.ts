import type { Tree } from '@/tree'
import { describe, expect, it, vi } from 'vitest'
import { dfs } from '@/dfs'

// 定义测试用的树节点接口
interface TestNode {
  id: number
  name: string
  children?: TestNode[]
}

describe('dfs function', () => {
  // 测试1: 空树测试
  // Test 1: Empty tree test
  it('should handle empty tree', () => {
    const callback = vi.fn()
    dfs(null as any, callback)
    expect(callback).not.toHaveBeenCalled()
  })

  // 测试2: 单节点树
  // Test 2: Single node tree
  it('should traverse single node tree', () => {
    const tree: Tree<TestNode> = { id: 1, name: 'Root' }
    const visitedNodes: number[] = []

    dfs(tree, (node) => {
      visitedNodes.push(node.id)
    })

    expect(visitedNodes).toEqual([1])
  })

  // 测试3: 多层级树遍历
  // Test 3: Multi-level tree traversal
  it('should traverse multi-level tree in depth-first order', () => {
    const tree: Tree<TestNode> = {
      id: 1,
      name: 'Root',
      children: [
        {
          id: 2,
          name: 'Child 1',
          children: [
            { id: 4, name: 'Grandchild 1' },
            { id: 5, name: 'Grandchild 2' },
          ],
        },
        {
          id: 3,
          name: 'Child 2',
          children: [{ id: 6, name: 'Grandchild 3' }],
        },
      ],
    }

    const visitedOrder: number[] = []

    dfs(tree, (node) => {
      visitedOrder.push(node.id)
    })

    // 验证深度优先遍历顺序
    // Verify depth-first traversal order
    expect(visitedOrder).toEqual([1, 2, 4, 5, 3, 6])
  })

  // 测试4: 提前终止遍历
  // Test 4: Early termination of traversal
  it('should stop traversal when callback returns false', () => {
    const tree: Tree<TestNode> = {
      id: 1,
      name: 'Root',
      children: [
        { id: 2, name: 'Child 1' },
        { id: 3, name: 'Child 2' },
        { id: 4, name: 'Child 3' },
      ],
    }

    const visitedNodes: number[] = []

    dfs(tree, (node) => {
      visitedNodes.push(node.id)
      // 当遇到id为3的节点时停止遍历
      // Stop traversal when encountering node with id 3
      return node.id !== 3
    })

    expect(visitedNodes).toEqual([1, 2, 3])
  })

  // 测试5: 自定义子节点键名
  // Test 5: Custom children key name
  it('should work with custom children key', () => {
    interface CustomNode {
      id: number
      name: string
      subNodes?: CustomNode[]
    }

    const tree: CustomNode = {
      id: 1,
      name: 'Root',
      subNodes: [
        { id: 2, name: 'Child 1' },
        { id: 3, name: 'Child 2' },
      ],
    }

    const visitedNodes: number[] = []

    dfs(
      tree,
      (node) => {
        visitedNodes.push(node.id)
      },
      'subNodes' as const,
    )

    expect(visitedNodes).toEqual([1, 2, 3])
  })

  // 测试6: 循环引用检测
  // Test 6: Circular reference detection
  it('should handle circular references using WeakSet', () => {
    const tree: Tree<TestNode> = { id: 1, name: 'Root' }
    // 创建循环引用
    // Create circular reference
    tree.children = [tree]

    const visitedNodes: number[] = []

    // 不应陷入无限循环
    // Should not fall into infinite loop
    dfs(tree, (node) => {
      visitedNodes.push(node.id)
    })

    expect(visitedNodes).toEqual([1])
  })

  // 测试7: 回调函数返回值处理
  // Test 7: Callback return value handling
  it('should handle different callback return values', () => {
    const tree: Tree<TestNode> = {
      id: 1,
      name: 'Root',
      children: [
        { id: 2, name: 'Child 1' },
        { id: 3, name: 'Child 2' },
      ],
    }

    const visitedNodes: number[] = []

    // 测试void返回值
    // Test void return value
    dfs(tree, (node) => {
      visitedNodes.push(node.id)
      // 不返回任何值，应该继续遍历
      // Returns nothing, should continue traversal
    })

    expect(visitedNodes).toEqual([1, 2, 3])
  })

  // 测试8: 复杂树结构遍历
  // Test 8: Complex tree structure traversal
  it('should handle complex tree structures', () => {
    const tree: Tree<TestNode> = {
      id: 1,
      name: 'Root',
      children: [
        {
          id: 2,
          name: 'Child 1',
          children: [
            { id: 4, name: 'Grandchild 1' },
            {
              id: 5,
              name: 'Grandchild 2',
              children: [{ id: 7, name: 'Great-grandchild' }],
            },
          ],
        },
        { id: 3, name: 'Child 2' },
        {
          id: 6,
          name: 'Child 3',
          children: [],
        },
      ],
    }

    const visitedOrder: number[] = []

    dfs(tree, (node) => {
      visitedOrder.push(node.id)
    })

    expect(visitedOrder).toEqual([1, 2, 4, 5, 7, 3, 6])
  })
})
