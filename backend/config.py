import os
from dotenv import load_dotenv

# 加载根目录的 .env 文件
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"))

# 智谱 AI API Key
ZHIPU_API_KEY: str = os.getenv("ZHIPU_API_KEY", "")

# 广发证券 MCP Token
GFZQ_TOKEN: str = os.getenv("GFZQ_TOKEN", "")

# 模型配置
MODEL_NAME: str = "glm-4.7-flash"
MAX_TOKENS: int = 65536
TEMPERATURE: float = 1.0

# 服务配置
BACKEND_HOST: str = "0.0.0.0"
BACKEND_PORT: int = 8000
CORS_ORIGINS: list[str] = ["http://localhost:3000"]

# MCP 工具调用最大循环次数
MAX_TOOL_CALL_ROUNDS: int = 5
