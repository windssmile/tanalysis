// 适用性矩阵：技术工具在不同市场状态下的“定性经验有效性”。
// 评级为经验判断、非统计结论；真实有效性需用真实行情回测验证。
export const effectivenessMatrix = {
  columns: [
    { id: 'trend', label: '趋势市（单边）' },
    { id: 'range', label: '震荡市（箱体）' },
    { id: 'reversal', label: '反转/拐点' },
  ],
  rows: [
    {
      id: 'ma',
      label: '均线系统',
      ratings: { trend: 'high', range: 'low', reversal: 'low' },
      notes: {
        trend: '单边趋势中顺势持有、回踩均线加仓最能发挥；滞后反而过滤噪音',
        range: '箱体里均线缠绕、金叉死叉反复，whipsaw 重灾区',
        reversal: '滞后特性决定它确认拐点很慢，常在反转走完一半才发信号',
      },
    },
    {
      id: 'macd',
      label: 'MACD',
      ratings: { trend: 'high', range: 'low', reversal: 'mid' },
      notes: {
        trend: '趋势延续中柱状线放大、快慢线发散，能跟住主升/主跌段',
        range: '震荡区零轴附近反复纠缠，金叉死叉信号密集且多为假信号',
        reversal: '顶背离/底背离对拐点有提示，但 A股常背离多次才转向，需谨慎',
      },
    },
    {
      id: 'oscillator',
      label: '摆动指标(KDJ/RSI)',
      ratings: { trend: 'low', range: 'high', reversal: 'mid' },
      notes: {
        trend: '强趋势中长期钝化（高位继续涨、低位继续跌），超买超卖形同虚设',
        range: '箱体内高抛低吸最对路，超买卖区间往返给出清晰的进出节奏',
        reversal: '背离可作拐点预警，但钝化期背离会失灵，只能当辅助证据',
      },
    },
    {
      id: 'boll',
      label: '布林带(BOLL)',
      ratings: { trend: 'mid', range: 'high', reversal: 'low' },
      notes: {
        trend: '趋势中价格贴上轨/下轨运行，开口张大可确认动能但易误判到顶',
        range: '震荡时上下轨即压力支撑，触轨回落、收口预示方向选择，最实用',
        reversal: '本身不识别反转，突破带外多为趋势延续而非拐点信号',
      },
    },
    {
      id: 'trendline',
      label: '趋势线与通道',
      ratings: { trend: 'high', range: 'mid', reversal: 'low' },
      notes: {
        trend: '连接高低点画出的趋势线与通道，能清晰界定趋势斜率与回踩买点',
        range: '箱体上下沿也算水平通道，但区间窄时假突破频繁，需配合量能',
        reversal: '有效跌破上升趋势线只是警示，A股惯用假跌破诱空，确认滞后',
      },
    },
    {
      id: 'support-resistance',
      label: '支撑压力位',
      ratings: { trend: 'low', range: 'high', reversal: 'mid' },
      notes: {
        trend: '趋势力量强时关键位常被一举突破，守支撑压力容易踏空或套牢',
        range: '箱体顶底就是天然压力支撑，低吸高抛依据明确，胜率相对高',
        reversal: '重要前高前低/缺口附近易出现转折，但能否守住要看量能与情绪',
      },
    },
    {
      id: 'reversal-pattern',
      label: '反转形态(头肩/双顶底)',
      ratings: { trend: 'low', range: 'mid', reversal: 'high' },
      notes: {
        trend: '趋势中段出现的小级别反转形态多被证伪，逆势接刀风险大',
        range: '箱体边缘有时演化为双顶双底，但区间内形态级别小、可靠性一般',
        reversal: '正是为识别趋势终结而生，颈线放量突破是较强的拐点确认信号',
      },
    },
    {
      id: 'continuation-pattern',
      label: '持续形态(三角/旗形)',
      ratings: { trend: 'high', range: 'low', reversal: 'low' },
      notes: {
        trend: '上涨/下跌途中的中继整理，顺原方向突破成功率高，是加仓良机',
        range: '与无方向的箱体震荡难以区分，未突破前不宜当持续形态用',
        reversal: '其多空假设本就是趋势延续，对反转拐点几乎没有指示意义',
      },
    },
    {
      id: 'volume',
      label: '量价配合',
      ratings: { trend: 'mid', range: 'mid', reversal: 'mid' },
      notes: {
        trend: '趋势中量增价涨/缩量回调可验证健康度，但放量见顶也常见，需结合位置',
        range: '震荡时缩量是常态，突破箱体需放量印证，否则多为假突破',
        reversal: '顶部放量滞涨、底部地量地价是拐点旁证，但A股对倒做量会干扰判断',
      },
    },
    {
      id: 'chip',
      label: '筹码分布',
      ratings: { trend: 'mid', range: 'mid', reversal: 'mid' },
      notes: {
        trend: '趋势中筹码沿价格上移、上方无套牢盘助涨，但单峰密集后也可能加速赶顶',
        range: '震荡时筹码在区间内充分换手，密集峰即支撑压力的成本依据',
        reversal: '低位筹码由分散转单峰密集预示拐点临近，但分布是结果、滞后于价格',
      },
    },
  ],
}
