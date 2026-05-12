## 广发证券MCP
| 服务名称 | 功能描述 |
| :--- | :--- |
| 🔥 龙虎榜分析 | 沪深股市龙虎榜实时数据分析，包括上榜统计、营业部排名、资金流向等 | 
| 📊 财务分析 | 上市公司财务数据对比分析，覆盖估值、盈利、现金流等五大维度 | 
| ⭐ 热门ETF榜单 | 沪深市场ETF热点排行，支持涨跌榜、资金榜、特色榜等多维度统计 | 
| 📈 沪深指数估值分析 | 主流宽基、行业、主题指数估值分位与ETF联动分析 | 

### 1、龙虎榜


#### 相关工具使用示例

1. 获取指定日期和市场上榜的个股列表```lhb_aborttrade_market_date_get```用途: 获取指定日期和市场上榜的个股列表。示例:
```
{
  "date": 20250528,
  "market": "sh"
}
```

2. 获取指定日期和个股上榜的明细```lhb_aborttrade_market_code_date_get```用途: 获取指定日期和个股上榜的明细。示例:
```
{
  "code": "600000",
  "date": 20230906,
  "market": "sh"
}
```

3. 获取指定个股上榜列表```lhb_aborttrade_stock_market_code_get```用途: 获取指定个股上榜列表。示例:
```
{
  "code": "600000",
  "market": "sh"
}
```

4. 获取指定时间区间内上榜个股排行列表```lhb_stat_stock_months_get```用途: 获取指定时间区间内上榜个股排行列表。示例:
```
{
  "months": "m3",
  "page": 1,
  "pageSize": 10
}
```

5. 获取指定个股在指定时间区间内的统计数据```lhb_stat_stock_market_code_months_get```用途: 获取指定个股在指定时间区间内的统计数据。示例:
```
{
  "code": "600000",
  "market": "sh",
  "months": "m6"
}
```

6. 获取指定营业部在指定时间区间内的统计数据```lhb_stat_dept_id_months_get```用途: 获取指定营业部在指定时间区间内的统计数据。示例:
```
{
  "id": "T000244751",
  "months": "m12"
}
```
7. 获取龙虎榜、评级概括```lhb_outline_plate_get```用途: 获取龙虎榜、评级概括。示例:
```
{
  "plate": "lhb"
}
```
8. 获取龙虎榜日历```lhb_calendar_market_month_get```用途: 获取龙虎榜日历。示例:
```
{
  "market": "sh",
  "month": 202505
}
```
9. 获取个股列表上龙虎榜情况```lhb_aborttrade_batchstock_post```用途: 获取个股列表上龙虎榜情况。示例:
```
{
  "date": 20250526,
  "months": "m1",
  "page": 1,
  "pageSize": 10
}
```
### 2、财务分析

#### 可用工具使用说明
1. 基本指标对比（单个或多个股票）```commonBasic```用途: 获取单个或多个股票的基本指标，如市值与估值。示例:
```
{
  "stock_codes": ["SH600000", "SZ000776"]
}
```
2. 两个股票对比指标```commonIndicator```用途: 对比两个股票的盈利、资本、现金等指标。示例:
```
{
  "report_type": 12,  // 12表示年报，可以使用最新报告期
  "stock_codes": ["SH600000", "SZ000776"],
  "year": "2022"  // 使用最新年份
}
```
3. 股票行业信息```commonIndustryInfo```用途: 获取股票的行业信息，包括行业代码、名称、龙头、相近等。示例:
```
{
  "stock_codes": ["SH600000", "SZ000776"]
}
```
4. 股票所在行业所有指标前二```commonIndustryTop2```用途: 获取股票所在行业所有指标前二的股票。示例:
```
{
  "stock_code": "SZ000776"
}
```
5. 获取两个股票公共最近的报告期```commonReportType```用途: 获取两个股票公共最近的报告期。示例:
```
{
  "stock_codes": ["SH600000", "SZ000776"]
}
```
6. 单个股票PB/PE走势图```commonTrend```用途: 获取单个股票的PB/PE走势图。示例:
```
{
  "cycle": "1y",  // 1y表示1年周期
  "stock_code": "SZ000776"
}
```
7. 聚合查询```majorIndicatorAggregation```用途: 聚合查询股票的多个财务指标。示例:
```
{
  "stock_code": "SZ000776"
}
```
8. 银行专项指标
工具名称: majorIndicatorBank 用途: 获取银行的专项财务指标。示例:
```
{
  "report_type": 12,  // 12表示年报，可以使用最新报告期
  "stock_code": "SZ000776"
}
```
9. 现金流量表```majorIndicatorCashflow```用途: 获取股票的现金流量表。示例:
```
{
  "report_type": 12,  // 12表示年报，可以使用最新报告期
  "stock_code": "SZ000776"
}
```
10. 保险专项指标```majorIndicatorInsurance```用途: 获取保险公司的专项财务指标。示例:
```
{
  "report_type": 12,  // 12表示年报，可以使用最新报告期
  "stock_code": "SZ000776"
}
```
11. 资产负债表```majorIndicatorLiabilty```用途: 获取股票的资产负债表。示例:
```
{
  "report_type": 12,  // 12表示年报，可以使用最新报告期
  "stock_code": "SZ000776"
}
```
12. 主营业务构成饼图```majorIndicatorMainBusiness```用途: 获取股票的主营业务构成饼图。示例:
```
{
  "stock_code": "SZ000776"
}
```
13. 利润表```majorIndicatorProfit```用途: 获取股票的利润表。示例:
```
{
  "report_type": 12,  // 12表示年报，可以使用最新报告期
  "stock_code": "SZ000776"
}
```
14. 证券专项指标```majorIndicatorSecurities```用途: 获取证券公司的专项财务指标。示例:
```
{
  "report_type": 12,  // 12表示年报，可以使用最新报告期
  "stock_code": "SZ000776"
}
```
15. 盈利能力分析```analyzeProfitAbility```用途: 分析股票的盈利能力。示例:
```
{
  "report_type": 12,  // 12表示年报，可以使用最新报告期
  "stock_code": "SZ000776"
}
```
16. 资本结构分析analyzeCapitalStructure```用途: 分析股票的资本结构。示例:
```
{
  "report_type": 12,  // 12表示年报，可以使用最新报告期
  "stock_code": "SZ000776"
}
```
17. 现金流量分析```analyzeCrashflow```用途: 分析股票的现金流量。示例:
```
{
  "report_type": 12,  // 12表示年报，可以使用最新报告期
  "stock_code": "SZ000776"
}
```
### 3、热门ETF

#### 可用工具```finance-api_product_etf_rank_get```
获取ETF各类榜单数据

#### 可用参数说明
| 参数名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| type | string | 是 | 榜单类型（见下表） | "1" |
| size | integer | 否 | 条数，默认10 | 10 |
| page | integer | 否 | 页数，默认0，从0开始 | 0 |
| sameIndexFilter | integer | 否 | 相同跟踪指数ETF仅显示1只，1：打开，0：关闭 | 1 |
| continueRiseLimit | integer | 否 | 过滤连涨连跌天数，默认为0不过滤 | 3 |

#### 相关工具使用示例
1. 获取ETF涨幅榜（默认参数）
```
{
  "type": "1"
}
```
2. 获取ETF跌幅榜，返回20条，显示全部同指数ETF
```
{
  "type": "2",
  "size": 20,
  "sameIndexFilter": 0
}
```
3. 获取ETF换手榜，第2页
```
{
  "type": "3",
  "page": 1
}
```
4. 获取5日涨幅榜，过滤连涨3天的ETF
```
{
  "type": "7",
  "continueRiseLimit": 3
}
```
5. 获取主力资金榜，返回5条
```
{
  "type": "4",
  "size": 5
}
```

### 4、指数估值

#### 工具名称：```valuation_windmill_get```
用途：获取指数估值&顺风车榜单数据
相关工具使用示例
1. 获取第一页（默认）
2. 获取第2页，每页5条
```
{
  "page": 1,
  "perPage": 5
}
```
#### 可用工具
| 参数名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| page | integer | 否 | 页码，默认0 | 0 |
| perPage | integer | 否 | 每页数量，默认10 | 10 |
