# 角色
你是一个全栈架构专家和高级前端/后端开发工程师，精通 Python (FastAPI)、Next.js (App Router)、TailwindCSS、shadcn/ui 以及大语言模型（LLM）的流式应用开发。

# 任务
请帮我从零构建一个**产品级的金融 AI 对话网页**。该应用通过接入智谱 GLM-4.7-Flash 模型，并利用广发证券提供的 MCP (Model Context Protocol) 服务，为用户提供深度的A股市场分析（龙虎榜、财务分析、ETF榜单、指数估值）。

# 技术栈要求
- **前端**：Next.js 14+ (App Router), React, CSS, shadcn/ui, Framer Motion, ECharts (用于金融图表渲染)
- **后端**：Python 3.10+, FastAPI, uvicorn, httpx (异步请求), pydantic
- **LLM SDK**：智谱官方 Python SDK (`zhipuai` 或 `zai-sdk`)
- **通信协议**：前端与后端之间使用 SSE (Server-Sent Events) 进行流式通信。

# 核心业务逻辑（极其重要）
本应用的核心是“大模型驱动 MCP 工具调用”，完整工作流如下：
1. 前端发送用户提问（如：“分析一下浦发银行SH600000的财务和龙虎榜”）到后端 `/api/chat` 接口。
2. 后端将提问转化为智谱 API 请求，**必须开启深度思考模式 (`thinking: {"type": "enabled"}`)** 和 `stream: true`，并将广发证券的 MCP 工具列表转换为智谱支持的 `tools` 格式注入请求。
3. 后端接收智谱的流式响应：
   - 如果返回 `reasoning_content`：作为“思考过程”推送到前端。
   - 如果触发 `tool_call`：后端**必须拦截**，根据函数名路由到对应的广发 MCP API 发起真实请求，获取数据后，将结果作为 `tool` 角色的消息追加到上下文，**再次发起流式请求给智谱**进行总结。
   - 如果返回普通 `content`：作为“正式回答”推送到前端。
4. 前端负责解析 SSE 流，实时渲染思考过程、文本内容，并将结构化数据渲染为表格或图表。

# 广发证券 MCP 服务定义（后端需实现的路由映射）
后端需要实现一个 MCP 客户端管理器，当模型触发 tool_call 时，根据以下映射关系发起 HTTP 请求（注意：需在请求头注入 `Authorization: Bearer <GFZQ_TOKEN>`）：

1. **龙虎榜服务 (gf_lhb)**
   - 端点: `https://mcp-api.gf.com.cn/server/mcp/lhb/mcp`
   - 工具前缀: `lhb_` (如: `lhb_aborttrade_market_date_get`, `lhb_stat_stock_months_get` 等)
2. **财务分析服务 (gf_quant)**
   - 端点: `https://mcp-api.gf.com.cn/server/mcp/quant/mcp`
   - 工具前缀: `common` 或 `majorIndicator` 或 `analyze` (如: `commonBasic`, `majorIndicatorProfit`, `analyzeProfitAbility` 等)
3. **热门ETF服务 (gf_etfrank)**
   - 端点: `https://mcp-api.gf.com.cn/server/mcp/etf_rank/mcp`
   - 工具名: `finance-api_product_etf_rank_get`
4. **指数估值服务 (gf_windmill)**
   - 端点: `https://mcp-api.gf.com.cn/server/mcp/windmill/mcp`
   - 工具名: `valuation_windmill_get`

*(注：具体的工具参数结构，请在代码中以常量形式维护智谱 API 需要的 tools schema，确保大模型能准确传参)*

# 产品级 UI/UX 设计要求
1. **整体风格**：深色金融专业风（类似 Bloomberg Terminal 的现代 Web 版），主色调深蓝/深灰，强调色使用金色/绿色/红色（涨跌）。
2. **对话界面**：
   - 左侧为历史会话列表，右侧为主对话区。
   - 消息气泡需支持完整的 Markdown 渲染。
3. **深度思考渲染**：当后端传来 `reasoning_content` 时，前端以折叠面板“💡 深度分析中...”实时流式显示思考过程，思考结束后自动折叠，随后展示正式回答。
4. **数据可视化渲染（难点）**：当大模型返回包含金融数据（如财报对比、ETF榜单）的特定 JSON 标记时，前端需拦截并渲染为 shadcn/ui 的 Data Table 或 ECharts 图表（如 PE/PB 走势图、主营业务饼图），而不是纯文本。
5. **加载与错误状态**：网络超时、MCP 接口报错时，需有优雅的 UI 提示，不能直接白屏。

# 工程规范
1. **环境变量**：智谱 API Key (`ZHIPU_API_KEY`) 和广发 MCP Token (`GFZQ_TOKEN`) 必须存放在 `.env` 文件中，严禁暴露给前端。
2. **目录结构**：前后端分离。根目录包含 `frontend/` (Next.js) 和 `backend/` (FastAPI)。
3. **类型提示**：Python 后端必须使用 Pydantic 定义请求/响应模型；前端必须使用 TypeScript 定义 Props 和 State。
4. **流式解析**：前端需封装自定义 Hook (`useChatStream`) 来处理复杂的 SSE 解析逻辑，区分思考过程、工具调用状态和最终文本。

# 第一步执行指令
请先规划并输出完整的项目目录结构，然后依次生成：
1. 后端的核心入口 `main.py` 和智谱流式调用+MCP路由拦截的核心逻辑文件 `llm_service.py`。
2. 前端的核心页面 `page.tsx` 和流式请求 Hook `useChatStream.ts`。
3. 环境变量模板 `.env.example`。

请确认你理解了以上所有要求，特别是 Tool Call 的拦截与二次请求逻辑，然后开始编写代码。
