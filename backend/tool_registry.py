"""
MCP 工具注册表：维护所有广发证券 MCP 工具的 schema 定义和路由映射。
将 MCP 工具转换为智谱 API 支持的 tools 格式。
"""

from config import GFZQ_TOKEN

# ============================================================
# MCP 服务端点配置
# ============================================================

MCP_SERVERS = {
    "gf_lhb": {
        "url": "https://mcp-api.gf.com.cn/server/mcp/lhb/mcp",
        "headers": {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {GFZQ_TOKEN}",
        },
    },
    "gf_quant": {
        "url": "https://mcp-api.gf.com.cn/server/mcp/quant/mcp",
        "headers": {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {GFZQ_TOKEN}",
        },
    },
    "gf_etfrank": {
        "url": "https://mcp-api.gf.com.cn/server/mcp/etf_rank/mcp",
        "headers": {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {GFZQ_TOKEN}",
        },
    },
    "gf_windmill": {
        "url": "https://mcp-api.gf.com.cn/server/mcp/windmill/mcp",
        "headers": {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {GFZQ_TOKEN}",
        },
    },
}


def route_tool_to_server(tool_name: str) -> tuple[str, dict]:
    """根据工具名路由到对应的 MCP 服务端点"""
    if tool_name.startswith("lhb_"):
        server = MCP_SERVERS["gf_lhb"]
        return server["url"], server["headers"]
    elif tool_name.startswith(("common", "majorIndicator", "analyze")):
        server = MCP_SERVERS["gf_quant"]
        return server["url"], server["headers"]
    elif tool_name == "finance-api_product_etf_rank_get":
        server = MCP_SERVERS["gf_etfrank"]
        return server["url"], server["headers"]
    elif tool_name == "valuation_windmill_get":
        server = MCP_SERVERS["gf_windmill"]
        return server["url"], server["headers"]
    else:
        raise ValueError(f"未知的工具名称: {tool_name}")


# ============================================================
# 智谱 API tools schema（完整工具列表）
# ============================================================

TOOLS_SCHEMA = [
    # ==================== 龙虎榜工具 (gf_lhb) ====================
    {
        "type": "function",
        "function": {
            "name": "lhb_aborttrade_market_date_get",
            "description": "获取指定日期和市场上榜的个股列表。参数: date(整数,如20250528), market(字符串,'sh'上海或'sz'深圳)",
            "parameters": {
                "type": "object",
                "properties": {
                    "date": {"type": "integer", "description": "日期，格式如 20250528"},
                    "market": {"type": "string", "enum": ["sh", "sz"], "description": "市场：sh=上海, sz=深圳"},
                },
                "required": ["date", "market"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "lhb_aborttrade_market_code_date_get",
            "description": "获取指定日期和个股上榜的明细。参数: code(股票代码如'600000'), date(整数日期), market(市场)",
            "parameters": {
                "type": "object",
                "properties": {
                    "code": {"type": "string", "description": "股票代码，如 '600000'"},
                    "date": {"type": "integer", "description": "日期，格式如 20230906"},
                    "market": {"type": "string", "enum": ["sh", "sz"], "description": "市场：sh=上海, sz=深圳"},
                },
                "required": ["code", "date", "market"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "lhb_aborttrade_stock_market_code_get",
            "description": "获取指定个股上榜列表。参数: code(股票代码), market(市场)",
            "parameters": {
                "type": "object",
                "properties": {
                    "code": {"type": "string", "description": "股票代码，如 '600000'"},
                    "market": {"type": "string", "enum": ["sh", "sz"], "description": "市场：sh=上海, sz=深圳"},
                },
                "required": ["code", "market"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "lhb_stat_stock_months_get",
            "description": "获取指定时间区间内上榜个股排行列表。参数: months(时间区间如'm3','m6','m12'), page(页码), pageSize(每页条数)",
            "parameters": {
                "type": "object",
                "properties": {
                    "months": {"type": "string", "enum": ["m1", "m3", "m6", "m12"], "description": "时间区间"},
                    "page": {"type": "integer", "description": "页码，从1开始", "default": 1},
                    "pageSize": {"type": "integer", "description": "每页条数", "default": 10},
                },
                "required": ["months"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "lhb_stat_stock_market_code_months_get",
            "description": "获取指定个股在指定时间区间内的统计数据。参数: code(股票代码), market(市场), months(时间区间)",
            "parameters": {
                "type": "object",
                "properties": {
                    "code": {"type": "string", "description": "股票代码，如 '600000'"},
                    "market": {"type": "string", "enum": ["sh", "sz"], "description": "市场"},
                    "months": {"type": "string", "enum": ["m1", "m3", "m6", "m12"], "description": "时间区间"},
                },
                "required": ["code", "market", "months"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "lhb_stat_dept_id_months_get",
            "description": "获取指定营业部在指定时间区间内的统计数据。参数: id(营业部ID如'T000244751'), months(时间区间)",
            "parameters": {
                "type": "object",
                "properties": {
                    "id": {"type": "string", "description": "营业部ID，如 'T000244751'"},
                    "months": {"type": "string", "enum": ["m1", "m3", "m6", "m12"], "description": "时间区间"},
                },
                "required": ["id", "months"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "lhb_outline_plate_get",
            "description": "获取龙虎榜、评级概括。参数: plate(板块类型，'lhb'表示龙虎榜)",
            "parameters": {
                "type": "object",
                "properties": {
                    "plate": {"type": "string", "description": "板块类型，'lhb'表示龙虎榜", "default": "lhb"},
                },
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "lhb_calendar_market_month_get",
            "description": "获取龙虎榜日历。参数: market(市场), month(月份如202505)",
            "parameters": {
                "type": "object",
                "properties": {
                    "market": {"type": "string", "enum": ["sh", "sz"], "description": "市场"},
                    "month": {"type": "integer", "description": "月份，格式如 202505"},
                },
                "required": ["market", "month"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "lhb_aborttrade_batchstock_post",
            "description": "获取个股列表上龙虎榜情况。参数: date(日期), months(时间区间), page(页码), pageSize(每页条数)",
            "parameters": {
                "type": "object",
                "properties": {
                    "date": {"type": "integer", "description": "日期，格式如 20250526"},
                    "months": {"type": "string", "enum": ["m1", "m3", "m6", "m12"], "description": "时间区间", "default": "m1"},
                    "page": {"type": "integer", "description": "页码，从1开始", "default": 1},
                    "pageSize": {"type": "integer", "description": "每页条数", "default": 10},
                },
                "required": ["date"],
            },
        },
    },

    # ==================== 财务分析工具 (gf_quant) ====================
    {
        "type": "function",
        "function": {
            "name": "commonBasic",
            "description": "获取单个或多个股票的基本指标，如市值与估值。参数: stock_codes(股票代码数组，如['SH600000','SZ000776'])",
            "parameters": {
                "type": "object",
                "properties": {
                    "stock_codes": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "股票代码列表，如 ['SH600000', 'SZ000776']",
                    },
                },
                "required": ["stock_codes"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "commonIndicator",
            "description": "对比两个股票的盈利、资本、现金等指标。参数: stock_codes(两个股票代码), report_type(报告类型,12=年报), year(年份)",
            "parameters": {
                "type": "object",
                "properties": {
                    "stock_codes": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "两个股票代码，如 ['SH600000', 'SZ000776']",
                    },
                    "report_type": {"type": "integer", "description": "报告类型：12=年报", "default": 12},
                    "year": {"type": "string", "description": "年份，如 '2022'"},
                },
                "required": ["stock_codes"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "commonIndustryInfo",
            "description": "获取股票的行业信息，包括行业代码、名称、龙头、相近等。参数: stock_codes(股票代码数组)",
            "parameters": {
                "type": "object",
                "properties": {
                    "stock_codes": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "股票代码列表",
                    },
                },
                "required": ["stock_codes"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "commonIndustryTop2",
            "description": "获取股票所在行业所有指标前二的股票。参数: stock_code(单个股票代码)",
            "parameters": {
                "type": "object",
                "properties": {
                    "stock_code": {"type": "string", "description": "股票代码，如 'SZ000776'"},
                },
                "required": ["stock_code"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "commonReportType",
            "description": "获取两个股票公共最近的报告期。参数: stock_codes(两个股票代码)",
            "parameters": {
                "type": "object",
                "properties": {
                    "stock_codes": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "两个股票代码",
                    },
                },
                "required": ["stock_codes"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "commonTrend",
            "description": "获取单个股票的PB/PE走势图数据。参数: stock_code(股票代码), cycle(周期，如'1y'表示1年,'3y'表示3年)",
            "parameters": {
                "type": "object",
                "properties": {
                    "stock_code": {"type": "string", "description": "股票代码，如 'SZ000776'"},
                    "cycle": {"type": "string", "enum": ["1y", "3y", "5y"], "description": "时间周期", "default": "1y"},
                },
                "required": ["stock_code"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "majorIndicatorAggregation",
            "description": "聚合查询股票的多个财务指标。参数: stock_code(股票代码)",
            "parameters": {
                "type": "object",
                "properties": {
                    "stock_code": {"type": "string", "description": "股票代码，如 'SZ000776'"},
                },
                "required": ["stock_code"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "majorIndicatorBank",
            "description": "获取银行的专项财务指标。参数: stock_code(股票代码), report_type(报告类型,12=年报)",
            "parameters": {
                "type": "object",
                "properties": {
                    "stock_code": {"type": "string", "description": "股票代码"},
                    "report_type": {"type": "integer", "description": "报告类型：12=年报", "default": 12},
                },
                "required": ["stock_code"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "majorIndicatorCashflow",
            "description": "获取股票的现金流量表。参数: stock_code(股票代码), report_type(报告类型,12=年报)",
            "parameters": {
                "type": "object",
                "properties": {
                    "stock_code": {"type": "string", "description": "股票代码"},
                    "report_type": {"type": "integer", "description": "报告类型：12=年报", "default": 12},
                },
                "required": ["stock_code"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "majorIndicatorInsurance",
            "description": "获取保险公司的专项财务指标。参数: stock_code(股票代码), report_type(报告类型,12=年报)",
            "parameters": {
                "type": "object",
                "properties": {
                    "stock_code": {"type": "string", "description": "股票代码"},
                    "report_type": {"type": "integer", "description": "报告类型：12=年报", "default": 12},
                },
                "required": ["stock_code"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "majorIndicatorLiabilty",
            "description": "获取股票的资产负债表。参数: stock_code(股票代码), report_type(报告类型,12=年报)",
            "parameters": {
                "type": "object",
                "properties": {
                    "stock_code": {"type": "string", "description": "股票代码"},
                    "report_type": {"type": "integer", "description": "报告类型：12=年报", "default": 12},
                },
                "required": ["stock_code"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "majorIndicatorMainBusiness",
            "description": "获取股票的主营业务构成饼图数据。参数: stock_code(股票代码)",
            "parameters": {
                "type": "object",
                "properties": {
                    "stock_code": {"type": "string", "description": "股票代码，如 'SZ000776'"},
                },
                "required": ["stock_code"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "majorIndicatorProfit",
            "description": "获取股票的利润表。参数: stock_code(股票代码), report_type(报告类型,12=年报)",
            "parameters": {
                "type": "object",
                "properties": {
                    "stock_code": {"type": "string", "description": "股票代码"},
                    "report_type": {"type": "integer", "description": "报告类型：12=年报", "default": 12},
                },
                "required": ["stock_code"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "majorIndicatorSecurities",
            "description": "获取证券公司的专项财务指标。参数: stock_code(股票代码), report_type(报告类型,12=年报)",
            "parameters": {
                "type": "object",
                "properties": {
                    "stock_code": {"type": "string", "description": "股票代码"},
                    "report_type": {"type": "integer", "description": "报告类型：12=年报", "default": 12},
                },
                "required": ["stock_code"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "analyzeProfitAbility",
            "description": "分析股票的盈利能力。参数: stock_code(股票代码), report_type(报告类型,12=年报)",
            "parameters": {
                "type": "object",
                "properties": {
                    "stock_code": {"type": "string", "description": "股票代码"},
                    "report_type": {"type": "integer", "description": "报告类型：12=年报", "default": 12},
                },
                "required": ["stock_code"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "analyzeCapitalStructure",
            "description": "分析股票的资本结构。参数: stock_code(股票代码), report_type(报告类型,12=年报)",
            "parameters": {
                "type": "object",
                "properties": {
                    "stock_code": {"type": "string", "description": "股票代码"},
                    "report_type": {"type": "integer", "description": "报告类型：12=年报", "default": 12},
                },
                "required": ["stock_code"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "analyzeCrashflow",
            "description": "分析股票的现金流量。参数: stock_code(股票代码), report_type(报告类型,12=年报)",
            "parameters": {
                "type": "object",
                "properties": {
                    "stock_code": {"type": "string", "description": "股票代码"},
                    "report_type": {"type": "integer", "description": "报告类型：12=年报", "default": 12},
                },
                "required": ["stock_code"],
            },
        },
    },

    # ==================== 热门ETF工具 (gf_etfrank) ====================
    {
        "type": "function",
        "function": {
            "name": "finance-api_product_etf_rank_get",
            "description": "获取ETF各类榜单数据。参数: type(榜单类型: 1=涨幅榜,2=跌幅榜,3=换手榜,4=主力资金榜,5=规模榜,6=份额变化榜,7=5日涨幅榜), size(条数,默认10), page(页码,默认0), sameIndexFilter(相同跟踪指数ETF仅显示1只,1=打开,0=关闭), continueRiseLimit(过滤连涨连跌天数)",
            "parameters": {
                "type": "object",
                "properties": {
                    "type": {"type": "string", "description": "榜单类型：1=涨幅榜, 2=跌幅榜, 3=换手榜, 4=主力资金榜, 5=规模榜, 6=份额变化榜, 7=5日涨幅榜"},
                    "size": {"type": "integer", "description": "返回条数，默认10", "default": 10},
                    "page": {"type": "integer", "description": "页码，从0开始", "default": 0},
                    "sameIndexFilter": {"type": "integer", "description": "相同跟踪指数ETF仅显示1只：1=打开, 0=关闭", "default": 1},
                    "continueRiseLimit": {"type": "integer", "description": "过滤连涨连跌天数，默认0不过滤", "default": 0},
                },
                "required": ["type"],
            },
        },
    },

    # ==================== 指数估值工具 (gf_windmill) ====================
    {
        "type": "function",
        "function": {
            "name": "valuation_windmill_get",
            "description": "获取指数估值和顺风车榜单数据。参数: page(页码,默认0), perPage(每页数量,默认10)",
            "parameters": {
                "type": "object",
                "properties": {
                    "page": {"type": "integer", "description": "页码，默认0", "default": 0},
                    "perPage": {"type": "integer", "description": "每页数量，默认10", "default": 10},
                },
                "required": [],
            },
        },
    },
]
