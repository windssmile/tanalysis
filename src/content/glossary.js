// 术语速查：高频技术分析用语的简明定义 + 延伸条目。related 必须指向真实 topic id。
// 立场：技术分析的盈利信号价值有限，定义诚实克制、不夸大有效性。
export const glossary = [
  {
    term: '金叉',
    aliases: ['黄金交叉'],
    def: '短期均线（或快线）由下向上穿过长期均线（或慢线），常被解读为偏多信号；但属滞后信号，震荡市频繁金叉死叉极易反复失效。',
    related: ['ma', 'macd'],
  },
  {
    term: '死叉',
    aliases: ['死亡交叉'],
    def: '短期均线（或快线）由上向下穿过长期均线（或慢线），常被解读为偏空信号；同样滞后，且在震荡区间内胜率很低。',
    related: ['ma', 'macd'],
  },
  {
    term: '背离',
    aliases: ['顶背离', '底背离'],
    def: '价格创新高（低）而指标未同步创新高（低），被视作动能减弱的提示；只是概率线索，背离后继续单边走的情况并不少见。',
    related: ['volume-divergence', 'macd'],
  },
  {
    term: '放量',
    def: '成交量明显高于近期均量，反映分歧或参与度上升；放量本身不分方向，需结合价格与位置判断，且易被对倒资金制造。',
    related: ['volume-price', 'volume-breakout'],
  },
  {
    term: '缩量',
    def: '成交量明显低于近期均量，常对应观望或惜售；缩量只是状态描述，并不能可靠预测后续涨跌方向。',
    related: ['volume-price', 'volume-divergence'],
  },
  {
    term: '颈线',
    def: '头肩、双顶/双底等形态中连接关键高低点的趋势线，被当作形态确认与否的分界；实战中常出现假突破颈线后反向。',
    related: ['head-shoulders-top', 'double-top'],
  },
  {
    term: '支撑位',
    def: '价格下方曾多次止跌的区域，理论上买盘较强；本质是心理与历史成交的参考价带，并非必然有效，跌破后常反转为压力。',
    related: ['support-resistance'],
  },
  {
    term: '压力位',
    aliases: ['阻力位'],
    def: '价格上方曾多次受阻的区域，理论上卖盘较强；同为参考价带而非铁律，有效突破后常反转为支撑。',
    related: ['support-resistance'],
  },
  {
    term: '均价线(VWAP)',
    aliases: ['分时均价线', 'VWAP'],
    def: '分时图中按成交额加权的当日平均成本线，反映当日多空平均持仓成本；可作日内强弱参考，但不构成买卖依据。',
    related: ['intraday-avgline', 'intraday-basics'],
  },
  {
    term: '期望值',
    aliases: ['数学期望'],
    def: '一笔交易长期重复后的平均盈亏 = 胜率×平均盈利 − 败率×平均亏损；期望为正才有长期意义，单次结果无法说明系统优劣。',
    related: ['drawdown-ruin', 'position-risk'],
  },
  {
    term: '盈亏比',
    aliases: ['赔率', '风险报酬比'],
    def: '单笔平均盈利与平均亏损的比值；与胜率共同决定期望值，高盈亏比可在低胜率下仍然正期望，但需严格执行止损才成立。',
    related: ['position-risk', 'drawdown-ruin'],
  },
  {
    term: '止损',
    def: '预先设定的离场价位，用于在判断错误时控制单笔亏损；它是纪律与风险管理的核心，比任何买入信号都更决定长期生存。',
    related: ['position-risk', 'drawdown-ruin'],
  },
  {
    term: '筹码分布',
    def: '按价格统计的持仓成本结构，用于观察套牢盘与获利盘分布；数据源自估算模型，存在误差，不宜作为精确预测工具。',
    related: ['chip-distribution', 'volume-price'],
  },
  {
    term: '假突破',
    aliases: ['诱多', '诱空'],
    def: '价格突破关键价位后迅速反向、未能站稳的走势，常令追突破者被套；是技术信号失效的典型形态，需用止损防范。',
    related: ['false-breakout', 'volume-breakout'],
  },
  {
    term: '超买超卖',
    def: 'KDJ、RSI 等摆动指标进入极值区，提示短期涨跌过度；但强趋势中指标可长期钝化于极值，据此逆势操作风险很高。',
    related: ['kdj', 'rsi'],
  },
  {
    term: 'T+1',
    def: 'A股现行交易制度：当日买入的股票需次一交易日才能卖出。它限制了日内纠错能力，是A股特有风险与日内策略的重要约束。',
    related: ['a-share-risks', 'order-book'],
  },
]
