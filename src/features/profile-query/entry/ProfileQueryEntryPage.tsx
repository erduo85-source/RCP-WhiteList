import {
  DeleteOutlined,
  GlobalOutlined,
  MobileOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons'
import type { TableColumnsType } from 'antd'
import { Button, Card, Empty, Input, Select, Space, Table, Tabs, Tag, Typography, message } from 'antd'
import { useMemo, useState } from 'react'
import '../profile-query.css'
import { ProfileQueryResultModal } from '../result/ProfileQueryResultModal'
import {
  createProfileQueryTarget,
  profileQueryHistoryItems,
  profileRiskListItems,
} from '../shared/mock'
import type {
  AccountIdentifierType,
  ProfileQueryHistoryItem,
  ProfileQueryTab,
  ProfileQueryTarget,
  ProfileRiskListItem,
} from '../shared/types'

const { Title, Text } = Typography

const accountIdentifierOptions = [
  { label: 'SDKID', value: 'sdkid' },
  { label: '账号名', value: 'accountName' },
]

const queryTabItems = [
  { key: 'account', label: '按账号查询' },
  { key: 'device', label: '按设备查询' },
  { key: 'ip', label: '按IP查询' },
]

const typeIconMap = {
  account: <UserOutlined />,
  device: <MobileOutlined />,
  ip: <GlobalOutlined />,
}

type RiskRange = '7' | '30'

const riskRangeOptions = [
  { label: '近7天', value: '7' },
  { label: '近30天', value: '30' },
]

const getPlaceholder = (type: ProfileQueryTab, accountIdentifierType: AccountIdentifierType) => {
  if (type === 'device') {
    return '请输入设备ID'
  }
  if (type === 'ip') {
    return '请输入IP地址'
  }
  return accountIdentifierType === 'sdkid' ? '请输入SDKID' : '请输入账号名'
}

export function ProfileQueryEntryPage() {
  const [activeTab, setActiveTab] = useState<ProfileQueryTab>('account')
  const [accountIdentifierType, setAccountIdentifierType] = useState<AccountIdentifierType>('sdkid')
  const [queryValues, setQueryValues] = useState<Record<ProfileQueryTab, string>>({
    account: '',
    device: '',
    ip: '',
  })
  const [historyItems, setHistoryItems] = useState(profileQueryHistoryItems)
  const [target, setTarget] = useState<ProfileQueryTarget | null>(null)
  const [isResultOpen, setIsResultOpen] = useState(false)
  const [riskRange, setRiskRange] = useState<RiskRange>('7')

  const sortedRiskItems = useMemo(
    () => [...profileRiskListItems].sort((a, b) => b.riskEventCount - a.riskEventCount),
    [],
  )

  const rangeLabel = riskRange === '7' ? '近7日' : '近30日'

  const openResult = (nextTarget: ProfileQueryTarget) => {
    setTarget(nextTarget)
    setIsResultOpen(true)
  }

  const handleQuery = (type: ProfileQueryTab = activeTab, value = queryValues[type]) => {
    const keyword = value.trim()
    if (!keyword) {
      message.warning('请输入查询内容')
      return
    }

    openResult(
      createProfileQueryTarget({
        type,
        value: keyword,
        accountIdentifierType: type === 'account' ? accountIdentifierType : undefined,
      }),
    )
  }

  const handleHistoryClick = (item: ProfileQueryHistoryItem) => {
    setActiveTab(item.type)
    if (item.accountIdentifierType) {
      setAccountIdentifierType(item.accountIdentifierType)
    }
    setQueryValues((prev) => ({ ...prev, [item.type]: item.value }))
    openResult(
      createProfileQueryTarget({
        type: item.type,
        value: item.value,
        accountIdentifierType: item.accountIdentifierType,
      }),
    )
  }

  const columns = useMemo<TableColumnsType<ProfileRiskListItem>>(() => [
    {
      title: '用户',
      dataIndex: 'value',
      key: 'value',
      width: 280,
      render: (value: string, record) => (
        <Space size={10} className="profile-object-cell">
          <span className={`profile-object-icon profile-object-icon-${record.type}`}>
            {typeIconMap[record.type]}
          </span>
          <div>
            <Text strong>{value}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: `${rangeLabel}风险事件数`,
      dataIndex: 'riskEventCount',
      key: 'riskEventCount',
      width: 170,
      sorter: (a, b) => a.riskEventCount - b.riskEventCount,
      defaultSortOrder: 'descend',
    },
    {
      title: `${rangeLabel}最高风险分`,
      dataIndex: 'highestRiskScore',
      key: 'highestRiskScore',
      width: 170,
      sorter: (a, b) => a.highestRiskScore - b.highestRiskScore,
    },
    {
      title: `${rangeLabel}平均风险分`,
      dataIndex: 'averageRiskScore',
      key: 'averageRiskScore',
      width: 170,
      sorter: (a, b) => a.averageRiskScore - b.averageRiskScore,
    },
    { title: '最近风险时间', dataIndex: 'lastRiskAt', key: 'lastRiskAt', width: 190 },
    {
      title: '操作',
      key: 'action',
      width: 130,
      render: (_value, record) => (
        <Button
          type="link"
          icon={<SearchOutlined />}
          onClick={() => openResult(createProfileQueryTarget({ type: record.type, value: record.value }))}
        >
          立即查询
        </Button>
      ),
    },
  ], [rangeLabel])

  const renderQueryControl = () => {
    if (activeTab === 'account') {
      return (
        <Space.Compact className="profile-query-compact">
          <Select
            value={accountIdentifierType}
            options={accountIdentifierOptions}
            onChange={setAccountIdentifierType}
            className="profile-account-select"
          />
          <Input
            value={queryValues.account}
            placeholder={getPlaceholder('account', accountIdentifierType)}
            onChange={(event) => setQueryValues((prev) => ({ ...prev, account: event.target.value }))}
            onPressEnter={() => handleQuery('account')}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={() => handleQuery('account')}>
            查询
          </Button>
        </Space.Compact>
      )
    }

    return (
      <Space.Compact className="profile-query-compact">
        <Input
          value={queryValues[activeTab]}
          placeholder={getPlaceholder(activeTab, accountIdentifierType)}
          onChange={(event) => setQueryValues((prev) => ({ ...prev, [activeTab]: event.target.value }))}
          onPressEnter={() => handleQuery(activeTab)}
        />
        <Button type="primary" icon={<SearchOutlined />} onClick={() => handleQuery(activeTab)}>
          查询
        </Button>
      </Space.Compact>
    )
  }

  return (
    <div className="profile-query-page">
      <Card className="profile-entry-head" variant="borderless">
        <Title level={3}>多维画像查询</Title>
        <Text>支持从账号、设备、IP维度进行用户洞察，快速定位登录、注册、支付的风险</Text>
      </Card>

      <Card className="profile-search-card" variant="borderless">
        <Tabs
          activeKey={activeTab}
          items={queryTabItems}
          onChange={(key) => setActiveTab(key as ProfileQueryTab)}
        />
        <div className="profile-query-row">{renderQueryControl()}</div>
        <div className="profile-history-row">
          <Text strong>历史查询记录</Text>
          <Space size={[8, 8]} wrap className="profile-history-tags">
            {historyItems.length > 0 ? (
              historyItems.slice(0, 8).map((item) => (
                <Tag
                  key={item.id}
                  icon={item.type === 'account' ? <UserOutlined /> : item.type === 'device' ? <MobileOutlined /> : <GlobalOutlined />}
                  className="profile-history-tag"
                  onClick={() => handleHistoryClick(item)}
                >
                  {item.value}
                </Tag>
              ))
            ) : (
              <Text type="secondary">暂无历史查询记录</Text>
            )}
          </Space>
          <Button
            type="text"
            icon={<DeleteOutlined />}
            className="profile-clear-history"
            onClick={() => setHistoryItems([])}
          >
            清空记录
          </Button>
        </div>
      </Card>

      <Card
        className="profile-risk-card"
        variant="borderless"
        title={
          <Space size={10}>
            <span className="section-accent" />
            <Text strong>高风险用户Top100</Text>
          </Space>
        }
        extra={
          <Select
            value={riskRange}
            options={riskRangeOptions}
            onChange={setRiskRange}
            className="profile-risk-range-select"
          />
        }
      >
        <Table
          rowKey="key"
          columns={columns}
          dataSource={sortedRiskItems}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条 / 共 ${total} 条`,
          }}
          locale={{
            emptyText: <Empty description="暂无高风险对象，建议通过上方条件发起查询" />,
          }}
          scroll={{ x: 1120 }}
        />
      </Card>

      <ProfileQueryResultModal
        open={isResultOpen}
        target={target}
        onClose={() => setIsResultOpen(false)}
      />
    </div>
  )
}
