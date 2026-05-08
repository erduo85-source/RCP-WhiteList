import {
  BellOutlined,
  CopyOutlined,
  DeleteOutlined,
  DownloadOutlined,
  DownOutlined,
  EditOutlined,
  FileTextOutlined,
  ReloadOutlined,
  SearchOutlined,
  UploadOutlined,
  UserOutlined,
} from '@ant-design/icons'
import {
  Avatar,
  Button,
  Card,
  Dropdown,
  Input,
  Layout,
  Menu,
  Select,
  Space,
  Table,
  Tabs,
  Typography,
} from 'antd'
import type { MenuProps, TableColumnsType } from 'antd'
import './App.css'

const { Header, Sider, Content } = Layout
const { Title, Paragraph, Text } = Typography

type WhiteListRow = {
  key: string
  sdkid: string
  accountName: string
  status: string
  activeAt: string
  expireAt: string
  reason: string
  operator: string
  updatedAt: string
}

const platformMenuItems: MenuProps['items'] = [
  { key: 'platform', label: '游卡用户平台' },
  { key: 'console', label: '平台服务控制台' },
]

const sideMenuItems: MenuProps['items'] = [
  {
    key: 'risk-user',
    icon: <UserOutlined />,
    label: '用户风控引擎',
    children: [{ key: 'risk-user-overview', label: '风险概览' }],
  },
  {
    key: 'risk-payment',
    icon: <FileTextOutlined />,
    label: '支付风控引擎',
    children: [{ key: 'risk-payment-overview', label: '交易监控' }],
  },
  {
    key: 'risk-profile',
    icon: <BellOutlined />,
    label: '用户画像中心',
    children: [{ key: 'risk-profile-overview', label: '画像分析' }],
  },
  {
    key: 'whitelist',
    icon: <UserOutlined />,
    label: '白名单管理',
  },
]

const tabItems = [
  { key: 'account', label: '账号' },
  { key: 'device', label: '设备' },
  { key: 'ip', label: 'IP' },
]

const dataSource: WhiteListRow[] = [
  {
    key: '1',
    sdkid: '310003_128318239811',
    accountName: 'sgs123123123123123',
    status: '生效中',
    activeAt: '2026-05-04 11:11:00',
    expireAt: '2026-07-07 11:11:00',
    reason: '内部测试号',
    operator: 'wangjian02',
    updatedAt: '2026-05-04 11:11:00',
  },
  {
    key: '2',
    sdkid: '310003_1283182391231',
    accountName: '暂未设置账号名',
    status: '生效中',
    activeAt: '2026-05-04 11:11:00',
    expireAt: '2026-05-04 11:11:00',
    reason: '内部测试号',
    operator: 'wangjian02',
    updatedAt: '2026-05-04 11:11:00',
  },
]

const columns: TableColumnsType<WhiteListRow> = [
  {
    title: 'SDKID',
    dataIndex: 'sdkid',
    key: 'sdkid',
    width: 180,
    render: (value: string) => (
      <Space size={6}>
        <span>{value}</span>
        <CopyOutlined className="table-copy" />
      </Space>
    ),
  },
  {
    title: '账号名',
    dataIndex: 'accountName',
    key: 'accountName',
    width: 210,
    render: (value: string) => (
      <Space size={6}>
        <span>{value}</span>
        <CopyOutlined className="table-copy" />
      </Space>
    ),
  },
  { title: '生效状态', dataIndex: 'status', key: 'status', width: 110 },
  { title: '生效时间', dataIndex: 'activeAt', key: 'activeAt', width: 160 },
  { title: '失效时间', dataIndex: 'expireAt', key: 'expireAt', width: 160 },
  { title: '添加原因', dataIndex: 'reason', key: 'reason', width: 140 },
  { title: '最近操作人', dataIndex: 'operator', key: 'operator', width: 130 },
  { title: '最近操作时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 160 },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    render: () => (
      <Space size={12}>
        <Button color="primary" variant="link" icon={<EditOutlined />} className="action-link">
          编辑
        </Button>
        <Button color="primary" variant="link" icon={<DeleteOutlined />} className="action-link danger-link">
          删除
        </Button>
      </Space>
    ),
  },
]

function App() {
  return (
    <Layout className="page-shell">
      <Header className="top-header">
        <div className="brand">
          <div className="brand-mark">k</div>
          <span className="brand-text">平台服务中心</span>
        </div>
        <div className="top-nav">
          <a className="top-nav-item" href="/">
            项目管理
          </a>
          <a className="top-nav-item active" href="/">
            风控管理
            <DownOutlined className="nav-arrow" />
          </a>
        </div>
        <div className="top-actions">
          <Dropdown menu={{ items: platformMenuItems }} trigger={['click']}>
            <button className="platform-switcher" type="button">
              游卡用户平台
              <DownOutlined />
            </button>
          </Dropdown>
          <Space size={18} className="icon-actions">
            <FileTextOutlined />
            <UploadOutlined />
            <BellOutlined />
          </Space>
          <div className="user-box">
            <Avatar size={32} icon={<UserOutlined />} />
            <span>王蛟</span>
            <DownOutlined />
          </div>
        </div>
      </Header>
      <Layout>
        <Sider width={224} theme="light" className="left-sider">
          <Menu
            mode="inline"
            selectedKeys={['whitelist']}
            defaultOpenKeys={['risk-user', 'risk-payment', 'risk-profile']}
            items={sideMenuItems}
            className="side-menu"
          />
        </Sider>
        <Content className="page-content">
          <section className="page-head">
            <div>
              <Title level={3}>白名单管理</Title>
              <Paragraph>
                可针对账号、设备或IP设置风控白名单，加入白名单的对象不再触发风控
              </Paragraph>
            </div>
            <Tabs items={tabItems} activeKey="account" className="page-tabs" />
          </section>

          <Card className="filter-card" bordered={false}>
            <div className="filter-grid">
              <div className="filter-field">
                <Text className="field-label">账号</Text>
                <Input placeholder="请输入账号名或SDKID" size="large" />
              </div>
              <div className="filter-field">
                <Text className="field-label">生效状态</Text>
                <Select
                  size="large"
                  placeholder="请选择生效状态"
                  options={[
                    { value: 'active', label: '生效中' },
                    { value: 'inactive', label: '已失效' },
                  ]}
                />
              </div>
              <Space size={16} className="filter-actions">
                <Button size="large" icon={<ReloadOutlined />}>
                  重置
                </Button>
                <Button size="large" type="primary" icon={<SearchOutlined />}>
                  查询
                </Button>
              </Space>
            </div>
          </Card>

          <Card
            className="table-card"
            title={
              <Space size={10}>
                <span className="section-accent" />
                <span>账号白名单</span>
              </Space>
            }
            extra={
              <Space size={12}>
                <Button type="primary">+ 新增白名单</Button>
                <Button icon={<DownloadOutlined />}>批量导入</Button>
              </Space>
            }
          >
            <Table
              rowKey="key"
              columns={columns}
              dataSource={dataSource}
              pagination={false}
              className="whitelist-table"
            />
          </Card>
        </Content>
      </Layout>
    </Layout>
  )
}

export default App
