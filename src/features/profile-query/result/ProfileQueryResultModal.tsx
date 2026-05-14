import {
  ArrowsAltOutlined,
  DownOutlined,
  DownloadOutlined,
  GlobalOutlined,
  MobileOutlined,
  UpOutlined,
  UserOutlined,
} from '@ant-design/icons'
import type { TableColumnsType, TabsProps } from 'antd'
import { Badge, Button, Card, Empty, Modal, Segmented, Space, Table, Tabs, Typography } from 'antd'
import { useMemo, useState } from 'react'
import { profileLoginLogs, profileRelationNodes, profileTimelinePoints } from '../shared/mock'
import type { ProfileLoginLogItem, ProfileQueryTarget, ProfileSceneKey } from '../shared/types'

const { Text } = Typography

type ProfileQueryResultModalProps = {
  open: boolean
  target: ProfileQueryTarget | null
  onClose: () => void
}

export function ProfileQueryResultModal({ open, target, onClose }: ProfileQueryResultModalProps) {
  const [activeScene, setActiveScene] = useState<ProfileSceneKey>('login')
  const [logView, setLogView] = useState<'risk' | 'all'>('risk')
  const [isBasicExpanded, setIsBasicExpanded] = useState(false)

  const logRows = useMemo(
    () => (logView === 'risk' ? profileLoginLogs.filter((item) => item.isRisk) : profileLoginLogs),
    [logView],
  )

  const columns: TableColumnsType<ProfileLoginLogItem> = [
    { title: '时间', dataIndex: 'time', key: 'time', width: 136, ellipsis: true },
    {
      title: '风险分',
      dataIndex: 'riskScore',
      key: 'riskScore',
      width: 68,
      render: (score: number) => (
        <Text
          className={
            score >= 80
              ? 'profile-score-danger'
              : score >= 60
                ? 'profile-score-warning'
                : 'profile-score-normal'
          }
        >
          {score}
        </Text>
      ),
    },
    { title: '设备', dataIndex: 'device', key: 'device', width: 126, ellipsis: true },
    { title: 'IP', dataIndex: 'ip', key: 'ip', width: 126, ellipsis: true },
    { title: '结果', dataIndex: 'result', key: 'result', ellipsis: true },
    {
      title: '操作',
      key: 'action',
      width: 76,
      align: 'right',
      render: () => <Button type="link">查看详情</Button>,
    },
  ]

  if (!target) {
    return null
  }

  const currentTarget = target
  const expandedRows = groupExpandedInfo(currentTarget.expandedInfo, 3)

  const tabItems: TabsProps['items'] = [
    {
      key: 'login',
      label: (
        <Space size={6}>
          <Badge color="#ff3b30" />
          登录
          <span className="profile-tab-count">{currentTarget.sceneSummary.login}</span>
        </Space>
      ),
      children: renderLoginScene(),
    },
    {
      key: 'register',
      label: (
        <Space size={6}>
          <Badge color={currentTarget.sceneSummary.register > 0 ? '#ff3b30' : '#d9dfe9'} />
          注册
          <span className="profile-tab-count">{currentTarget.sceneSummary.register}</span>
        </Space>
      ),
      children: <ScenePlaceholder scene="注册" />,
    },
    {
      key: 'payment',
      label: (
        <Space size={6}>
          <Badge color={currentTarget.sceneSummary.payment > 0 ? '#ff3b30' : '#d9dfe9'} />
          支付
          <span className="profile-tab-count">{currentTarget.sceneSummary.payment}</span>
        </Space>
      ),
      children: <ScenePlaceholder scene="支付" />,
    },
  ]

  return (
    <Modal
      open={open}
      onCancel={onClose}
      afterOpenChange={(visible) => {
        if (visible) {
          setIsBasicExpanded(false)
          setActiveScene('login')
          setLogView('risk')
        }
      }}
      footer={
        <Space>
          <Button onClick={onClose}>关闭</Button>
          <Button type="primary" icon={<DownloadOutlined />}>
            导出日志
          </Button>
        </Space>
      }
      width={944}
      style={{ top: 48 }}
      className="profile-result-modal"
      title={<div className="profile-result-title">多维画像查询 · {currentTarget.title}</div>}
    >
      <div className="profile-result-content">
        <section className={`profile-basic-panel ${isBasicExpanded ? 'profile-basic-panel-expanded' : ''}`}>
          <div className="profile-basic-table">
            <div className="profile-basic-summary-row">
              {currentTarget.basicInfo.map((item) => (
                <div className="profile-basic-summary-cell" key={item.label}>
                  <Text type="secondary">{item.label}</Text>
                  <Text
                    strong
                    className={
                      item.status === 'risk'
                        ? 'profile-basic-risk'
                        : item.status === 'normal'
                          ? 'profile-basic-normal'
                          : undefined
                    }
                  >
                    {item.value}
                  </Text>
                </div>
              ))}
            </div>

            {isBasicExpanded ? (
              <div className="profile-basic-detail-table">
                {expandedRows.map((row, rowIndex) => (
                  <div className="profile-basic-detail-row" key={`row-${rowIndex}`}>
                    {row.map((item, colIndex) => (
                      <div
                        className={`profile-basic-detail-cell ${item ? '' : 'profile-basic-detail-cell-empty'}`}
                        key={item ? item.label : `empty-${rowIndex}-${colIndex}`}
                      >
                        {item ? (
                          <>
                            <Text type="secondary" className="profile-basic-detail-label">
                              {item.label}
                            </Text>
                            <Text className="profile-basic-detail-value">{item.value}</Text>
                          </>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <Button
            type="default"
            className="profile-basic-toggle"
            onClick={() => setIsBasicExpanded((prev) => !prev)}
          >
            <span>{isBasicExpanded ? '收起' : '展开'}</span>
            {isBasicExpanded ? <UpOutlined /> : <DownOutlined />}
          </Button>
        </section>

        <Tabs
          activeKey={activeScene}
          items={tabItems}
          onChange={(key) => setActiveScene(key as ProfileSceneKey)}
          className="profile-scene-tabs"
        />
      </div>
    </Modal>
  )

  function renderLoginScene() {
    const relationSummary = getRelationSummary(currentTarget)

    return (
      <div className="profile-login-scene">
        <Card className="profile-result-section-card profile-chart-card" title={<SectionTitle title="登录分布" />} variant="outlined">
          <Text className="profile-chart-summary">{currentTarget.loginDistributionSummary}</Text>
          <div className="profile-timeline-chart">
            <div className="profile-y-axis">
              <span className="profile-y-axis-title">风险分</span>
              <span>100</span>
              <span>75</span>
              <span>50</span>
              <span>25</span>
              <span>0</span>
            </div>

            <div className="profile-chart-body">
              <div className="profile-chart-grid" />
              {profileTimelinePoints.map((point, index) => {
                const left = `${(index / (profileTimelinePoints.length - 1)) * 100}%`
                const bottom = `${point.score}%`
                return (
                  <div
                    key={point.id}
                    className={`profile-chart-point ${point.isRisk ? 'profile-chart-point-risk' : ''}`}
                    style={{ left, bottom }}
                    title={`时间：${point.date} ${point.time}\n风险分：${point.score}\n设备ID：${point.deviceId}\nIP地址：${point.ip}`}
                  />
                )
              })}
              <div className="profile-chart-line" />
              <div className="profile-chart-popover">
                <Text type="secondary">时间：</Text>
                <Text>05/09 18:10:51</Text>
                <Text type="secondary">风险分：</Text>
                <Text className="profile-score-danger">92</Text>
                <Text type="secondary">设备ID：</Text>
                <Text>DEV_412315</Text>
                <Text type="secondary">IP地址：</Text>
                <Text>182.12.44.102</Text>
              </div>
              <div className="profile-x-axis">
                {profileTimelinePoints.map((point) => (
                  <span key={`${point.id}-axis`}>
                    {point.date}
                    <small>{point.time}</small>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card
          className="profile-result-section-card"
          title={<SectionTitle title="关联分析" />}
          extra={
            <Button icon={<ArrowsAltOutlined />} className="profile-relation-expand" size="small">
              一键展开
            </Button>
          }
          variant="outlined"
        >
          <Text className="profile-relation-summary">{relationSummary}</Text>
          <div className="profile-relation-map-wrap">
            <div className="profile-relation-map">
              <div className="profile-relation-lines" aria-hidden="true">
                <span className="profile-relation-line profile-relation-line-left-top" />
                <span className="profile-relation-line profile-relation-line-left-bottom" />
                <span className="profile-relation-line profile-relation-line-right-top" />
                <span className="profile-relation-line profile-relation-line-right-bottom" />
              </div>
              <div className="profile-relation-side">
                {profileRelationNodes.slice(0, 2).map((node) => (
                  <RelationNode key={node.id} node={node} />
                ))}
              </div>
              <div className="profile-relation-center">
                <div className="profile-relation-avatar">
                  <UserOutlined />
                </div>
                <Text strong className="profile-relation-center-name">
                  {currentTarget.title}
                </Text>
                <span className="profile-relation-center-tag">{getTargetTypeLabel(currentTarget.type)}</span>
              </div>
              <div className="profile-relation-side">
                {profileRelationNodes.slice(2).map((node) => (
                  <RelationNode key={node.id} node={node} />
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card
          className="profile-result-section-card profile-log-card"
          title={<SectionTitle title="登录日志" />}
          extra={
            <Button icon={<DownloadOutlined />} className="profile-log-export">
              导出日志
            </Button>
          }
          variant="outlined"
        >
          <div className="profile-log-toolbar">
            <Segmented
              value={logView}
              onChange={(value) => setLogView(value as 'risk' | 'all')}
              options={[
                { label: '风险记录', value: 'risk' },
                { label: '全部记录', value: 'all' },
              ]}
              className="profile-log-segmented"
            />
          </div>
          <Table
            rowKey="key"
            columns={columns}
            dataSource={logRows}
            className="profile-log-table"
            tableLayout="fixed"
            size="small"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ['10'],
              showTotal: (total) => `共 ${total} 条记录`,
            }}
          />
        </Card>
      </div>
    )
  }
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="profile-section-title">
      <div className="profile-section-title-main">
        <span className="section-accent" />
        <Text strong>{title}</Text>
      </div>
    </div>
  )
}

function ScenePlaceholder({ scene }: { scene: string }) {
  return (
    <Card className="profile-scene-placeholder" variant="outlined">
      <Empty description={`${scene}场景首期暂未展开，后续补充该场景核实内容`} />
    </Card>
  )
}

function RelationNode({
  node,
}: {
  node: { type: 'device' | 'ip'; label: string; value: string; tag: string; tone: 'normal' | 'warning' }
}) {
  return (
    <div className={`profile-relation-node profile-relation-node-${node.tone}`} title={node.value}>
      <span className="profile-relation-icon">
        {node.type === 'device' ? <MobileOutlined /> : <GlobalOutlined />}
      </span>
      <div>
        <Text strong className={`profile-relation-label profile-relation-label-${node.tone}`}>
          {node.tag}
        </Text>
        <Text ellipsis>{node.value}</Text>
      </div>
    </div>
  )
}

function getRelationSummary(target: ProfileQueryTarget) {
  if (target.type === 'device') {
    return `设备 ${target.title} 关联了 2 个账号，关联了 2 个 IP`
  }

  if (target.type === 'ip') {
    return `IP ${target.title} 关联了 2 个账号，关联了 2 个设备`
  }

  return `账号 ${target.title} 关联了 2 个设备，关联了 2 个 IP`
}

function getTargetTypeLabel(type: ProfileQueryTarget['type']) {
  if (type === 'device') {
    return '设备'
  }

  if (type === 'ip') {
    return 'IP'
  }

  return '账号'
}

function groupExpandedInfo(items: ProfileQueryTarget['expandedInfo'], columns: number) {
  const rows: Array<Array<ProfileQueryTarget['expandedInfo'][number] | null>> = []

  for (let index = 0; index < items.length; index += columns) {
    const row: Array<ProfileQueryTarget['expandedInfo'][number] | null> = items.slice(index, index + columns)
    while (row.length < columns) {
      row.push(null)
    }
    rows.push(row)
  }

  return rows
}
