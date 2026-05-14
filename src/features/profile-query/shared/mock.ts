import type {
  AccountIdentifierType,
  ProfileLoginLogItem,
  ProfileQueryHistoryItem,
  ProfileQueryTab,
  ProfileQueryTarget,
  ProfileRelationNode,
  ProfileRiskListItem,
  ProfileSceneKey,
  ProfileTimelinePoint,
} from './types'

export const profileQueryHistoryItems: ProfileQueryHistoryItem[] = [
  { id: 'history-1', type: 'account', accountIdentifierType: 'accountName', value: 'user_zhangsan' },
  { id: 'history-2', type: 'account', accountIdentifierType: 'accountName', value: 'lisi@example.com' },
  { id: 'history-3', type: 'account', accountIdentifierType: 'accountName', value: '138****8888' },
  { id: 'history-4', type: 'device', value: 'device_8a7f3c1d' },
  { id: 'history-5', type: 'device', value: 'iPhone14_A12X9' },
  { id: 'history-6', type: 'ip', value: '192.168.1.100' },
  { id: 'history-7', type: 'ip', value: '10.23.8.56' },
]

export const profileRiskListItems: ProfileRiskListItem[] = [
  {
    key: 'risk-1',
    type: 'account',
    value: 'user_zhangsan',
    riskEventCount: 32,
    highestRiskScore: 92,
    averageRiskScore: 81,
    lastRiskAt: '2026-05-13 10:23:45',
  },
  {
    key: 'risk-2',
    type: 'account',
    value: 'lisi@example.com',
    riskEventCount: 18,
    highestRiskScore: 78,
    averageRiskScore: 65,
    lastRiskAt: '2026-05-12 14:12:33',
  },
  {
    key: 'risk-3',
    type: 'device',
    value: 'device_8a7f3c1d',
    riskEventCount: 15,
    highestRiskScore: 72,
    averageRiskScore: 58,
    lastRiskAt: '2026-05-12 09:11:22',
  },
  {
    key: 'risk-4',
    type: 'device',
    value: 'iPhone14_A12X9',
    riskEventCount: 12,
    highestRiskScore: 68,
    averageRiskScore: 55,
    lastRiskAt: '2026-05-11 16:45:10',
  },
  {
    key: 'risk-5',
    type: 'ip',
    value: '192.168.1.100',
    riskEventCount: 9,
    highestRiskScore: 54,
    averageRiskScore: 42,
    lastRiskAt: '2026-05-11 08:22:18',
  },
  {
    key: 'risk-6',
    type: 'ip',
    value: '10.23.8.56',
    riskEventCount: 6,
    highestRiskScore: 38,
    averageRiskScore: 28,
    lastRiskAt: '2026-05-10 08:33:17',
  },
  {
    key: 'risk-7',
    type: 'account',
    value: 'user_789',
    riskEventCount: 7,
    highestRiskScore: 92,
    averageRiskScore: 48,
    lastRiskAt: '2026-05-13 18:10:51',
  },
  {
    key: 'risk-8',
    type: 'device',
    value: 'DEV_412315',
    riskEventCount: 5,
    highestRiskScore: 66,
    averageRiskScore: 39,
    lastRiskAt: '2026-05-09 22:18:00',
  },
  {
    key: 'risk-9',
    type: 'ip',
    value: '182.12.44.102',
    riskEventCount: 4,
    highestRiskScore: 57,
    averageRiskScore: 34,
    lastRiskAt: '2026-05-09 18:10:51',
  },
  {
    key: 'risk-10',
    type: 'account',
    value: 'guest_202605',
    riskEventCount: 3,
    highestRiskScore: 49,
    averageRiskScore: 31,
    lastRiskAt: '2026-05-08 20:03:27',
  },
  {
    key: 'risk-11',
    type: 'device',
    value: 'Android_Pixel7_CN',
    riskEventCount: 2,
    highestRiskScore: 44,
    averageRiskScore: 29,
    lastRiskAt: '2026-05-07 17:41:05',
  },
  {
    key: 'risk-12',
    type: 'ip',
    value: '223.116.168.187',
    riskEventCount: 1,
    highestRiskScore: 36,
    averageRiskScore: 23,
    lastRiskAt: '2026-05-07 12:30:24',
  },
]

export const profileTimelinePoints: ProfileTimelinePoint[] = [
  { id: 'p1', date: '05/07', time: '00:00:00', score: 35, deviceId: 'iPhone 13', ip: '120.229.203.11', isRisk: false },
  { id: 'p2', date: '05/07', time: '12:00:00', score: 52, deviceId: 'Android设备', ip: '59.78.123.65', isRisk: false },
  { id: 'p3', date: '05/08', time: '00:00:00', score: 82, deviceId: 'DEV_412315', ip: '182.12.44.102', isRisk: true },
  { id: 'p4', date: '05/08', time: '12:00:00', score: 31, deviceId: 'iPhone 13', ip: '192.168.0.12', isRisk: false },
  { id: 'p5', date: '05/09', time: '00:00:00', score: 43, deviceId: 'Android设备', ip: '223.116.168.187', isRisk: false },
  { id: 'p6', date: '05/09', time: '18:10:51', score: 92, deviceId: 'DEV_412315', ip: '182.12.44.102', isRisk: true },
  { id: 'p7', date: '05/10', time: '12:00:00', score: 58, deviceId: 'iPhone 13', ip: '10.27.0.45', isRisk: true },
  { id: 'p8', date: '05/11', time: '00:00:00', score: 26, deviceId: 'Android设备', ip: '192.168.1.1', isRisk: false },
  { id: 'p9', date: '05/11', time: '12:00:00', score: 74, deviceId: 'iPhone 13', ip: '10.27.0.45', isRisk: true },
  { id: 'p10', date: '05/12', time: '00:00:00', score: 37, deviceId: 'Android设备', ip: '39.156.66.23', isRisk: false },
  { id: 'p11', date: '05/12', time: '15:09:11', score: 66, deviceId: 'Android设备', ip: '223.116.168.187', isRisk: true },
  { id: 'p12', date: '05/13', time: '18:22:35', score: 48, deviceId: 'Android设备', ip: '192.168.0.12', isRisk: false },
]

export const profileRelationNodes: ProfileRelationNode[] = [
  { id: 'device-main', type: 'device', label: '常用设备', value: 'DEV_412315', tag: '常用设备', tone: 'normal' },
  { id: 'device-new', type: 'device', label: '新增设备', value: 'DEV_443', tag: '新增设备', tone: 'warning' },
  { id: 'ip-main', type: 'ip', label: '常用IP', value: '182.12.44.102', tag: '常用IP', tone: 'normal' },
  { id: 'ip-new', type: 'ip', label: '新增IP', value: '223.116.168.187', tag: '新增IP', tone: 'warning' },
]

export const profileLoginLogs: ProfileLoginLogItem[] = [
  { key: 'log-1', time: '2026-05-13 14:32:18', riskScore: 90, device: 'iPhone 13 (iOS 17.4)', ip: '10.27.0.45（高危IP）', result: '异地登录频繁，使用高危IP', isRisk: true },
  { key: 'log-2', time: '2026-05-12 09:18:54', riskScore: 55, device: 'Android设备（Pixel 7）', ip: '192.168.1.1（局域网IP）', result: '非常用设备登录', isRisk: true },
  { key: 'log-3', time: '2026-05-11 21:05:33', riskScore: 40, device: 'iPhone 13 (iOS 17.4)', ip: '223.116.168.187', result: '跨地区登录', isRisk: true },
  { key: 'log-4', time: '2026-05-10 22:58:00', riskScore: 35, device: 'Android设备（Pixel 7）', ip: '182.12.44.102（高危IP）', result: '频繁登录尝试', isRisk: true },
  { key: 'log-5', time: '2026-05-10 16:41:22', riskScore: 30, device: 'iPhone 13 (iOS 17.4)', ip: '10.27.0.45（高危IP）', result: '异地登录', isRisk: true },
  { key: 'log-6', time: '2026-05-09 11:02:07', riskScore: 28, device: 'Android设备（Pixel 7）', ip: '59.78.123.65', result: '非常用IP登录', isRisk: true },
  { key: 'log-7', time: '2026-05-08 20:33:49', riskScore: 25, device: 'iPhone 13 (iOS 17.4)', ip: '120.229.203.11', result: '短时间多次登录', isRisk: true },
  { key: 'log-8', time: '2026-05-08 18:22:35', riskScore: 20, device: 'Android设备（Pixel 7）', ip: '192.168.0.12（局域网IP）', result: '局域网登录', isRisk: false },
  { key: 'log-9', time: '2026-05-07 15:09:11', riskScore: 18, device: 'Android设备（Pixel 7）', ip: '39.156.66.23', result: '新IP登录', isRisk: false },
  { key: 'log-10', time: '2026-05-07 09:07:55', riskScore: 15, device: 'Android设备（Pixel 7）', ip: '223.116.168.187', result: '历史高风险IP', isRisk: false },
  { key: 'log-11', time: '2026-05-06 18:42:12', riskScore: 12, device: 'iPhone 13 (iOS 17.4)', ip: '182.12.44.102', result: '常用设备登录', isRisk: false },
  { key: 'log-12', time: '2026-05-06 08:12:27', riskScore: 8, device: 'Android设备（Pixel 7）', ip: '120.229.203.11', result: '正常登录', isRisk: false },
]

const profileSceneLabelMap: Record<ProfileSceneKey, string> = {
  login: '登录',
  register: '注册',
  payment: '支付',
}

export const getProfileSceneLabel = (scene: ProfileSceneKey) => profileSceneLabelMap[scene]

export const getProfileQueryTypeLabel = (type: ProfileQueryTab) => {
  if (type === 'account') {
    return '账号'
  }
  if (type === 'device') {
    return '设备'
  }
  return 'IP'
}

export const createProfileQueryTarget = (params: {
  type: ProfileQueryTab
  value: string
  accountIdentifierType?: AccountIdentifierType
}): ProfileQueryTarget => {
  const { type, value, accountIdentifierType } = params

  if (type === 'device') {
    return {
      type,
      value,
      accountIdentifierType,
      title: value,
      loginDistributionSummary: '近7日风险概览：风险事件 10 · 最高风险分 95 · 平均风险分 40',
      basicInfo: [
        { label: 'device_id', value: 'DEV_443' },
        { label: 'sone_id', value: 'sdkjj1jvw31231023123' },
        { label: '设备状态', value: '设备封禁', status: 'risk' },
      ],
      expandedInfo: [
        { label: '设备品牌', value: '小米' },
        { label: '设备型号', value: 'mi 17 pro' },
        { label: '操作系统', value: 'Android 3.23' },
        { label: '最近活跃时间', value: '2026-05-13 18:10:51' },
        { label: '最近登录游戏', value: '三国杀移动版（10100001）' },
        { label: '最近登录账号（账号ID）', value: '31000_312313221321' },
        { label: '最近登录IP', value: '223.116.168.187' },
        { label: '封禁时间', value: '2026-02-05 19:55:11~2027-02-05 19:55:11' },
      ],
      sceneSummary: {
        login: 5,
        register: 1,
        payment: 0,
      },
    }
  }

  if (type === 'ip') {
    return {
      type,
      value,
      accountIdentifierType,
      title: value,
      loginDistributionSummary: '近7日风险概览：风险事件 10 · 最高风险分 95 · 平均风险分 40',
      basicInfo: [
        { label: 'IP地址', value },
        { label: 'IP状态', value: 'IP封禁', status: 'risk' },
        { label: 'IP归属地', value: '山东省 济南市' },
      ],
      expandedInfo: [
        { label: '网络运营商', value: '中国移动' },
        { label: '网络类型', value: '4G' },
        { label: '最近登录时间', value: '2026-02-05 19:55:11' },
        { label: '最近登录游戏', value: '三国杀移动版（10100001）' },
        { label: '最近登录账号（账号ID）', value: '31000_312313221321' },
        { label: '最近登录设备（deviceid）', value: '213102391301329123' },
        { label: '封禁时间', value: '2026-02-05 19:55:11~2027-02-05 19:55:11' },
      ],
      sceneSummary: {
        login: 4,
        register: 0,
        payment: 1,
      },
    }
  }

  return {
    type,
    value,
    accountIdentifierType,
    title: value,
    loginDistributionSummary: '近7日风险概览：风险事件 10 · 最高风险分 95 · 平均风险分 40',
    basicInfo: [
      { label: 'SDKID', value: accountIdentifierType === 'sdkid' ? value : '10001_213012032123' },
      { label: '账号名', value: accountIdentifierType === 'sdkid' ? 'user_789' : value },
      { label: '账号状态', value: '账号正常', status: 'normal' },
    ],
    expandedInfo: [
      { label: '实名认证', value: '已认证（成年）' },
      { label: '绑定手机', value: '138****8888' },
      { label: '绑定邮箱', value: 'e*****@gmail.com' },
      { label: '最近登录时间', value: '2026-02-05 19:55:11' },
      { label: '最近登录游戏', value: '三国杀移动版（10100001）' },
      { label: '最近登录设备（deviceid）', value: '213102391301329123' },
      { label: '最近登录IP', value: '223.116.168.187' },
      { label: '注册时间', value: '2023-10-12 14:22:01' },
      { label: '注册设备', value: 'DEV_412315' },
      { label: '注册IP', value: '182.12.44.102' },
      { label: '注册方式', value: '手机' },
    ],
    sceneSummary: {
      login: 7,
      register: 6,
      payment: 0,
    },
  }
}
