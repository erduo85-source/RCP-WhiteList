export type ProfileQueryTab = 'account' | 'device' | 'ip'

export type AccountIdentifierType = 'sdkid' | 'accountName'

export type ProfileSceneKey = 'login' | 'register' | 'payment'

export type ProfileQueryHistoryItem = {
  id: string
  type: ProfileQueryTab
  value: string
  accountIdentifierType?: AccountIdentifierType
}

export type ProfileRiskListItem = {
  key: string
  type: ProfileQueryTab
  value: string
  riskEventCount: number
  highestRiskScore: number
  averageRiskScore: number
  lastRiskAt: string
}

export type ProfileQueryTarget = {
  type: ProfileQueryTab
  value: string
  accountIdentifierType?: AccountIdentifierType
  title: string
  loginDistributionSummary: string
  basicInfo: Array<{
    label: string
    value: string
    status?: 'normal' | 'risk'
  }>
  expandedInfo: Array<{
    label: string
    value: string
  }>
  sceneSummary: {
    login: number
    register: number
    payment: number
  }
}

export type ProfileTimelinePoint = {
  id: string
  date: string
  time: string
  score: number
  deviceId: string
  ip: string
  isRisk: boolean
}

export type ProfileRelationNode = {
  id: string
  type: 'device' | 'ip'
  label: string
  value: string
  tag: string
  tone: 'normal' | 'warning'
}

export type ProfileLoginLogItem = {
  key: string
  time: string
  riskScore: number
  device: string
  ip: string
  result: string
  isRisk: boolean
}
