# 24K-AI 金融智能分析平台

AI 驱动的 A 股**实时行情**与市场深度分析平台，通过智谱模型 + 证券公司 MCP 服务，为用户提供龙虎榜、财务分析、ETF 榜单、指数估值等专业数据解读。

## 功能特性

- **龙虎榜分析**：沪深股市龙虎榜实时数据分析，包括上榜统计、营业部排名、资金流向等;可以查询当日和历史数据；
- **财务分析**：单个分析、对比分析。覆盖：上市日期、估值、盈利、现金流量表、利润表、资产负债表、资本结构、行业信息、行业均值、行业龙头、行业内市值相近的股票、行业内PE相近的股票、行业前二、申万行业名称等
- **热门 ETF 榜单**：沪深市场 ETF 热点排行，涨跌榜、搜索榜、关注榜、换手榜、主力资金榜、净申购榜、溢价率榜、特色榜等多维度统计
- **指数估值分析**：主流宽基、行业、主题指数估值分位与 ETF 联动分析
- **深度思考模式**：AI 推理过程可视化，透明展示分析逻辑
- **亮色/暗色主题**：一键切换，自动保存偏好

## 项目概览

### 后端 (Python FastAPI) — `backend/`
| 文件 | 功能 |
|------|------|
| `main.py` | FastAPI 入口，SSE 流式端点 `/api/chat` |
| `llm_service.py` | 核心逻辑：LLM 流式调用 + 深度思考 + Tool Call 拦截 + MCP 二次请求循环 |
| `mcp_client.py` | MCP JSON-RPC 客户端 |
| `tool_registry.py` | **26+ MCP 工具** schema 定义 + 路由映射（龙虎榜/财务/ETF/估值） |
| `system_prompt.py` | 金融分析专家系统提示词 |
| `config.py` / `schemas.py` | 配置与数据模型 |

### 前端 (Next.js 16 + TypeScript) — `frontend/`
| 文件 | 功能 |
|------|------|
| `page.tsx` | 主页面，左右分栏布局 |
| `Sidebar.tsx` | 会话列表，新建/删除/切换，Framer Motion 动画 |
| `ChatArea.tsx` | 对话区，欢迎页，工具调用状态指示 |
| `MessageBubble.tsx` | Markdown 渲染 + 工具结果自动渲染为表格 |
| `ThinkingPanel.tsx` | 深度思考折叠面板，流式渐入 |
| `ChatInput.tsx` | 多行输入框，Enter 发送，停止按钮 |
| `DataTable.tsx` | **金融数据表格**（排序/分页/涨跌色） |
| `FinanceChart.tsx` | **ECharts 图表**（折线/饼图/柱状） |
| `useChatStream.ts` | SSE 流式解析核心 Hook |
| `useChatHistory.ts` | 会话历史 localStorage 持久化 |

### 启动方式
- **后端**：`cd backend && python main.py` → `http://localhost:8000`
- **前端**：`cd frontend && npm run dev` → `http://localhost:3000`

### ⚠️ 注意事项
请在 `.env` 文件中填入实际的广发证券MCP Token和智谱 API Key 。

## 项目结构

```
24K-AI/
├── backend/                 # Python FastAPI 后端
│   ├── main.py              # 入口文件
│   ├── llm_service.py       # LLM流式调用 + Tool Call 拦截
│   ├── mcp_client.py        # MCP 客户端
│   ├── tool_registry.py     # MCP 工具注册表
│   ├── system_prompt.py     # 系统提示词
│   ├── schemas.py           # Pydantic 数据模型
│   ├── config.py            # 配置管理
│   └── requirements.txt     # Python 依赖
│
├── frontend/                # Next.js 前端
│   ├── src/
│   │   ├── app/             # 页面路由
│   │   ├── components/      # React 组件
│   │   ├── hooks/           # 自定义 Hooks
│   │   └── lib/             # 工具函数
│   ├── package.json
│   └── ...
│
├── .env.example             # 环境变量模板
└── .gitignore
```

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/qhxn009/24K-AI.git
cd 24K-AI
```

### 2. 配置环境变量

```bash
# 复制模板
cp .env.example .env

# 编辑 .env 文件，填入真实的 API Key/MCP Token
```

### 3. 启动后端

```bash
cd backend

# 创建虚拟环境（推荐）
python -m venv venv
source venv/bin/activate  # Linux/macOS
# venv\Scripts\activate   # Windows

# 安装依赖
pip install -r requirements.txt

# 启动服务
python main.py
# 或
uvicorn main:app --reload --port 8000
```

后端运行在 `http://localhost:8000`

### 4. 启动前端

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端运行在 `http://localhost:3000`

## 环境变量说明

| 变量名 | 说明 | 获取方式 |
|--------|------|----------|
| `ZHIPU_API_KEY` | 智谱 AI API 密钥 | 智谱开放平台|
| `GFZQ_TOKEN` | 广发证券 MCP Token | 广发证券|

## API 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/chat` | POST | SSE 流式对话接口 |
| `/api/health` | GET | 健康检查 |

## 核心工作流

1. 用户发送问题到 `/api/chat`
2. 后端将问题转为 API 请求，开启深度思考 + 工具调用
3. 流式处理响应：
   - `reasoning_content` → 推送思考过程
   - `tool_call` → 拦截并调用广发 MCP API
   - `content` → 推送正式回答
4. 前端实时渲染思考过程、Markdown 内容、数据表格/图表

## 关于我们

**24KRMB.COM** 由王成先生于 2012 年 2 月创立，期间历经两次停站，于 2019 年重新恢复运营。网站始终秉持初心：打造一个干净、专注的实战交流社区，坚持不投放广告，摒弃空谈，致力于成为交易爱好者的一方净土。

目前，24KRMB.COM 已汇聚了来自银行、证券、期货公司的专业人士，以及众多职业投资者和对交易充满热忱的普通投资者。在这里，每一位成员都是共同成长的伙伴，每一次对话都可能点燃财富增长的灵感火花。作为实战技术及案例交流的高质量社区，我们汇聚财经智慧，共享成长历程，只与实战派同行。

## 致谢

- [智谱 AI](https://chat.z.ai/) - 提供免费满血版模型
- [广发证券](https://www.gf.com.cn/web/home) - 提供 MCP 金融数据服务

---

**免责声明**：本平台分析结果仅供参考，不构成投资建议。投资有风险，入市需谨慎。
