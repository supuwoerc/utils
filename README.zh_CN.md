<p align="center">
  <a href="https://supuwoerc.github.io/utils/"><img src="./utils.png" width='360' style='border-radius:20px;'></a>
  <br/>
  <br/>
  <a href="./README.md"><img alt="README in English" src="https://img.shields.io/badge/English-d9d9d9"></a>
  <a href="./README.zh_CN.md"><img alt="简体中文文档" src="https://img.shields.io/badge/简体中文-d9d9d9"></a>
  <img src="https://github.com/supuwoerc/utils/actions/workflows/tests.yml/badge.svg">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg">
  <img src="https://img.shields.io/npm/v/@supuwoerc/utils">
  <img src="https://img.shields.io/badge/docs-github_pages-blue">
</p>

# @supuwoerc/utils

一个 JavaScript/TypeScript 实用函数集合，包含数组、对象、字符串、数学和 Promise 辅助工具。

## 特性

- **树操作**：数组与树结构相互转换、查找父节点等。
- **数组工具**：洗牌、抽样、自定义去重等。
- **对象工具**：选取、排除、判空等。
- **字符串工具**：确保前缀/后缀、截断、获取单位等。
- **数学工具**：归一化、范围映射等。
- **Promise 工具**：休眠、超时、重试、Promise 化、带结果的 allSettled 等。
- **TypeScript 支持**：完整的泛型类型。
- **零依赖**（除了少数对等依赖如 `fast-deep-equal` 和 `throttle-debounce`）。
- **经过测试**：使用 Vitest 的全面测试套件。
- **文档齐全**：通过 TypeDoc 自动生成的 API 文档。

## 安装

```bash
npm install @supuwoerc/utils
```

或使用 pnpm：

```bash
pnpm add @supuwoerc/utils
```

或使用 yarn：

```bash
yarn add @supuwoerc/utils
```

## 使用

### ES 模块 / TypeScript

```ts
import { array2Tree, pick, shuffle, sleep, tree2Array, withTimeout } from '@supuwoerc/utils'

// 将扁平数组转换为树
const flat = [
  { id: 1, parentId: null },
  { id: 2, parentId: 1 },
  { id: 3, parentId: 1 },
]
const tree = array2Tree(flat, { idKey: 'id', parentKey: 'parentId' })
console.log(tree)

// 洗牌数组
const arr = [1, 2, 3, 4, 5]
const shuffled = shuffle(arr)
console.log(shuffled)

// 从对象中选取属性
const obj = { a: 1, b: 2, c: 3 }
const picked = pick(obj, ['a', 'c']) // { a: 1, c: 3 }

// 休眠 1 秒
await sleep(1000)

// 为 Promise 设置超时
try {
  const result = await withTimeout(fetch('https://example.com'), 5000)
} catch (err) {
  console.log('超时或错误', err)
}
```

### CommonJS

```js
const { shuffle } = require('@supuwoerc/utils')
```

## API 文档

完整的 API 文档请访问 [https://supuwoerc.github.io/utils/](https://supuwoerc.github.io/utils/)。

你也可以在本地生成文档：

```bash
pnpm run doc
```

然后在浏览器中打开 `docs/index.html`。

## 开发

### 环境要求

- Node.js >= 18
- pnpm（推荐）或 npm

### 设置

```bash
git clone https://github.com/supuwoerc/utils.git
cd utils
pnpm install
```

### 构建

```bash
pnpm run build
```

### 测试

```bash
pnpm test           # 运行一次测试
pnpm test:watch     # 监听模式运行测试
pnpm test:ui        # 打开 Vitest UI
pnpm test:coverage  # 生成覆盖率报告
```

### 代码检查

```bash
pnpm run lint
```

### 发布

发布通过 [changelogen](https://github.com/unjs/changelogen) 自动化。要创建新版本：

```bash
pnpm run release
```

这将运行测试、构建、更新变更日志、打标签并发布到 npm。

## 贡献

欢迎贡献！请提交 issue 或 pull request。

1. Fork 本仓库。
2. 创建功能分支。
3. 进行更改。
4. 为更改添加测试。
5. 确保代码检查通过。
6. 提交 pull request。

## 许可证

MIT © [Idris](https://github.com/supuwoerc)。详见 [LICENSE](./LICENSE)。
