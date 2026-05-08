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
import type { MenuProps, TableColumnsType } from 'antd'
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  DatePicker,
  Descriptions,
  Drawer,
  Dropdown,
  Empty,
  Form,
  Input,
  Layout,
  Menu,
  Modal,
  Segmented,
  Select,
  Spin,
  Space,
  Table,
  Typography,
  Upload,
  message,
} from 'antd'
import type { UploadProps } from 'antd'
import dayjs from 'dayjs'
import { useCallback, useMemo, useRef, useState } from 'react'
import './App.css'

const { Header, Sider, Content } = Layout
const { Title, Paragraph, Text } = Typography

type WhitelistType = 'account' | 'device' | 'ip'

type BaseRow = {
  key: string
  status: string
  activeAt: string
  expireAt: string
  reason: string
  operator: string
  updatedAt: string
}

type AccountRow = BaseRow & {
  sdkid: string
  accountName: string
}

type DeviceRow = BaseRow & {
  deviceId: string
}

type IpRow = BaseRow & {
  ipAddress: string
}

type DisplayRow = BaseRow & {
  primaryValue: string
  secondaryValue?: string
}

type FilterValues = {
  keyword?: string
  status?: 'active' | 'inactive' | 'disabled'
}

type MenuContent = {
  title: string
  description: string
  sectionTitle: string
}

type CreateWhitelistValues = {
  accountType?: 'accountName' | 'sdkid'
  sdkid?: string
  accountName?: string
  deviceId?: string
  ipAddress?: string
  activeRange?: [dayjs.Dayjs, dayjs.Dayjs]
  reason?: string
}

type EditWhitelistValues = {
  activeRange?: [dayjs.Dayjs, dayjs.Dayjs]
}

type ImportPreviewFile = {
  name: string
  sizeLabel: string
}

type ImportParseStatus = 'idle' | 'parsing' | 'parsed'

const platformMenuItems: MenuProps['items'] = [
  { key: 'platform', label: '游卡用户平台' },
  { key: 'console', label: '平台服务控制台' },
]

const menuContentMap: Record<string, MenuContent> = {
  'payment-overview': {
    title: '支付安全概览',
    description: '展示支付风控的安全概览、关键指标与近期风险趋势。',
    sectionTitle: '支付安全概览',
  },
  'payment-log': {
    title: '支付风控日志',
    description: '查看支付风控相关操作记录、命中日志与处理轨迹。',
    sectionTitle: '支付风控日志',
  },
  'user-overview': {
    title: '用户安全概览',
    description: '查看用户风控总体概览、风险分布与近期异常情况。',
    sectionTitle: '用户安全概览',
  },
  'user-log': {
    title: '用户风控日志',
    description: '查看用户风控处置记录、风险事件明细与审计信息。',
    sectionTitle: '用户风控日志',
  },
  'tag-management': {
    title: '用户标签管理',
    description: '维护用户标签、标签分类与风险画像的配置关系。',
    sectionTitle: '用户标签管理',
  },
  'behavior-management': {
    title: '风险行为管理',
    description: '维护风险行为规则、识别维度与行为分级策略。',
    sectionTitle: '风险行为管理',
  },
  whitelist: {
    title: '白名单管理',
    description: '可针对账号、设备或IP设置风控白名单，加入白名单的对象不再触发风控。',
    sectionTitle: '白名单管理',
  },
  'operation-log': {
    title: '操作日志',
    description: '查看平台关键操作记录、责任人信息与时间线追踪。',
    sectionTitle: '操作日志',
  },
}

const sideMenuItems: MenuProps['items'] = [
  {
    key: 'risk-payment',
    icon: <FileTextOutlined />,
    label: '支付风控',
    children: [
      { key: 'payment-overview', label: '支付安全概览', disabled: true },
      { key: 'payment-log', label: '支付风控日志', disabled: true },
    ],
  },
  {
    key: 'risk-user',
    icon: <UserOutlined />,
    label: '用户风控',
    children: [
      { key: 'user-overview', label: '用户安全概览', disabled: true },
      { key: 'user-log', label: '用户风控日志', disabled: true },
    ],
  },
  {
    key: 'risk-profile',
    icon: <BellOutlined />,
    label: '画像中心',
    children: [
      { key: 'tag-management', label: '用户标签管理', disabled: true },
      { key: 'behavior-management', label: '风险行为管理', disabled: true },
    ],
  },
  {
    key: 'whitelist',
    icon: <UserOutlined />,
    label: '白名单管理',
  },
  {
    key: 'operation-log',
    icon: <FileTextOutlined />,
    label: '操作日志',
    disabled: true,
  },
]

const whitelistTypeOptions = [
  { label: '账号', value: 'account' },
  { label: '设备', value: 'device' },
  { label: 'IP', value: 'ip' },
]

const importTips = [
  '上传模板：请先下载导入模板文件，按照格式填写后再上传。',
  '上传数量：每份文件最多支持上传 500 条数据。',
  '冲突校验：系统将根据 SDKID/设备ID/IP 进行冲突检测，重复条目将略过。',
  '有效时长：白名单生效时长最大不超过 1 年，请在文件中明确截止日期。',
]

const templateFileMap: Record<WhitelistType, { fileName: string; label: string }> = {
  account: {
    fileName: '风控-账号白名单模板.xlsx',
    label: '下载账号白名单导入模板.xlsx',
  },
  device: {
    fileName: '风控-设备白名单模板.xlsx',
    label: '下载设备白名单导入模板.xlsx',
  },
  ip: {
    fileName: '风控-IP白名单模板.xlsx',
    label: '下载IP白名单导入模板.xlsx',
  },
}

const accountSeedRows: AccountRow[] = [
  {
    key: 'account-1',
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
    key: 'account-2',
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

const deviceSeedRows: DeviceRow[] = [
  {
    key: 'device-1',
    deviceId: 'device_a18f927ac3',
    status: '生效中',
    activeAt: '2026-05-05 09:30:00',
    expireAt: '2026-08-08 18:00:00',
    reason: '渠道联调设备',
    operator: 'wangjian02',
    updatedAt: '2026-05-05 09:30:00',
  },
  {
    key: 'device-2',
    deviceId: 'device_0024_test_cn',
    status: '生效中',
    activeAt: '2026-05-05 14:21:00',
    expireAt: '2026-06-20 23:59:59',
    reason: '压测机豁免',
    operator: 'wangjian02',
    updatedAt: '2026-05-05 14:21:00',
  },
]

const ipSeedRows: IpRow[] = [
  {
    key: 'ip-1',
    ipAddress: '10.10.12.33',
    status: '生效中',
    activeAt: '2026-05-06 10:08:00',
    expireAt: '2026-07-01 00:00:00',
    reason: '办公网络出口',
    operator: 'wangjian02',
    updatedAt: '2026-05-06 10:08:00',
  },
  {
    key: 'ip-2',
    ipAddress: '192.168.31.88',
    status: '生效中',
    activeAt: '2026-05-06 16:42:00',
    expireAt: '2026-05-28 20:00:00',
    reason: '测试环境访问白名单',
    operator: 'wangjian02',
    updatedAt: '2026-05-06 16:42:00',
  },
]

const whitelistCopy = (value: string) => (
  <Space size={6}>
    <span>{value}</span>
    <CopyOutlined className="table-copy" />
  </Space>
)

const toStatusValue = (status?: 'active' | 'inactive' | 'disabled') => {
  if (status === 'active') {
    return '生效中'
  }
  if (status === 'inactive') {
    return '已失效'
  }
  if (status === 'disabled') {
    return '未开启'
  }
  return undefined
}

const formatDateTime = (value: Date) => {
  const year = value.getFullYear()
  const month = `${value.getMonth() + 1}`.padStart(2, '0')
  const day = `${value.getDate()}`.padStart(2, '0')
  const hours = `${value.getHours()}`.padStart(2, '0')
  const minutes = `${value.getMinutes()}`.padStart(2, '0')
  const seconds = `${value.getSeconds()}`.padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const commonColumns = <T extends BaseRow>(
  onEdit: (record: T) => void,
  onDelete: (record: T) => void,
): TableColumnsType<T> => [
  {
    title: '生效状态',
    dataIndex: 'status',
    key: 'status',
    width: 120,
    render: (value: string) => <Badge status="success" text={value} />,
  },
  { title: '生效时间', dataIndex: 'activeAt', key: 'activeAt', width: 180 },
  { title: '失效时间', dataIndex: 'expireAt', key: 'expireAt', width: 180 },
  { title: '加入原因', dataIndex: 'reason', key: 'reason', width: 180 },
  { title: '最近操作人', dataIndex: 'operator', key: 'operator', width: 140 },
  { title: '最近操作时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 180 },
  {
    title: '操作',
    key: 'actions',
    width: 140,
    render: (_value: unknown, record: T) => (
      <Space size={12}>
        <Button
          color="primary"
          variant="link"
          icon={<EditOutlined />}
          className="action-link"
          onClick={() => onEdit(record)}
        >
          编辑
        </Button>
        <Button
          color="primary"
          variant="link"
          icon={<DeleteOutlined />}
          className="action-link danger-link"
          onClick={() => onDelete(record)}
        >
          删除
        </Button>
      </Space>
    ),
  },
]

const getWhitelistMeta = (type: WhitelistType) => {
  switch (type) {
    case 'account':
      return {
        tableTitle: '账号白名单',
        modalTitle: '新增账号白名单',
        queryLabel: '账号',
        queryPlaceholder: '请输入账号名或SDKID',
        descriptionTarget: '账号',
      }
    case 'device':
      return {
        tableTitle: '设备白名单',
        modalTitle: '新增设备白名单',
        queryLabel: '设备',
        queryPlaceholder: '请输入设备ID',
        descriptionTarget: '设备',
      }
    case 'ip':
      return {
        tableTitle: 'IP白名单',
        modalTitle: '新增IP白名单',
        queryLabel: 'IP',
        queryPlaceholder: '请输入IP地址',
        descriptionTarget: 'IP',
      }
  }
}

function App() {
  const [selectedMenuKey, setSelectedMenuKey] = useState('whitelist')
  const [openMenuKeys, setOpenMenuKeys] = useState(['risk-payment', 'risk-user', 'risk-profile'])
  const [whitelistType, setWhitelistType] = useState<WhitelistType>('account')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [filterValues, setFilterValues] = useState<Record<WhitelistType, FilterValues>>({
    account: {},
    device: {},
    ip: {},
  })
  const [accountRows, setAccountRows] = useState(accountSeedRows)
  const [deviceRows, setDeviceRows] = useState(deviceSeedRows)
  const [ipRows, setIpRows] = useState(ipSeedRows)
  const [filterForm] = Form.useForm<FilterValues>()
  const [createForm] = Form.useForm<CreateWhitelistValues>()
  const [editForm] = Form.useForm<EditWhitelistValues>()
  const selectedAccountType = Form.useWatch('accountType', createForm) ?? 'accountName'
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<DisplayRow | null>(null)
  const [isImportDrawerOpen, setIsImportDrawerOpen] = useState(false)
  const [importPreviewFile, setImportPreviewFile] = useState<ImportPreviewFile | null>(null)
  const [importRows, setImportRows] = useState<DisplayRow[]>([])
  const [importParseStatus, setImportParseStatus] = useState<ImportParseStatus>('idle')
  const importTimerRef = useRef<number | null>(null)

  const currentSection = menuContentMap[selectedMenuKey]
  const whitelistMeta = getWhitelistMeta(whitelistType)
  const isWhitelistView = selectedMenuKey === 'whitelist'
  const currentTemplateMeta = templateFileMap[whitelistType]

  const filteredAccountRows = useMemo(() => {
    const filters = filterValues.account
    const keyword = filters.keyword?.trim().toLowerCase()
    const status = toStatusValue(filters.status)

    return accountRows.filter((row) => {
      const keywordMatch = keyword
        ? row.sdkid.toLowerCase().includes(keyword) || row.accountName.toLowerCase().includes(keyword)
        : true
      const statusMatch = status ? row.status === status : true
      return keywordMatch && statusMatch
    })
  }, [accountRows, filterValues.account])

  const filteredDeviceRows = useMemo(() => {
    const filters = filterValues.device
    const keyword = filters.keyword?.trim().toLowerCase()
    const status = toStatusValue(filters.status)

    return deviceRows.filter((row) => {
      const keywordMatch = keyword ? row.deviceId.toLowerCase().includes(keyword) : true
      const statusMatch = status ? row.status === status : true
      return keywordMatch && statusMatch
    })
  }, [deviceRows, filterValues.device])

  const filteredIpRows = useMemo(() => {
    const filters = filterValues.ip
    const keyword = filters.keyword?.trim().toLowerCase()
    const status = toStatusValue(filters.status)

    return ipRows.filter((row) => {
      const keywordMatch = keyword ? row.ipAddress.toLowerCase().includes(keyword) : true
      const statusMatch = status ? row.status === status : true
      return keywordMatch && statusMatch
    })
  }, [ipRows, filterValues.ip])

  const currentRows = useMemo(() => {
    switch (whitelistType) {
      case 'account':
        return filteredAccountRows.map<DisplayRow>((row) => ({
          ...row,
          primaryValue: row.sdkid,
          secondaryValue: row.accountName,
        }))
      case 'device':
        return filteredDeviceRows.map<DisplayRow>((row) => ({
          ...row,
          primaryValue: row.deviceId,
        }))
      case 'ip':
        return filteredIpRows.map<DisplayRow>((row) => ({
          ...row,
          primaryValue: row.ipAddress,
        }))
    }
  }, [filteredAccountRows, filteredDeviceRows, filteredIpRows, whitelistType])

  const renderCreateFields = () => {
    if (whitelistType === 'account') {
      return (
        <Form.Item
          label="账号信息"
          required
          className="compact-form-item"
          validateStatus={
            createForm.getFieldError('accountType').length > 0 ||
            createForm.getFieldError(selectedAccountType === 'sdkid' ? 'sdkid' : 'accountName').length > 0
              ? 'error'
              : undefined
          }
          help={
            createForm.getFieldError('accountType')[0] ??
            createForm.getFieldError(selectedAccountType === 'sdkid' ? 'sdkid' : 'accountName')[0]
          }
        >
          <Space.Compact block>
            <Form.Item
              name="accountType"
              initialValue="accountName"
              noStyle
              rules={[{ required: true, message: '请选择账号类型' }]}
            >
              <Select
                className="account-type-select"
                options={[
                  { label: '账号名', value: 'accountName' },
                  { label: 'SDKID', value: 'sdkid' },
                ]}
              />
            </Form.Item>
            <Form.Item
              name={selectedAccountType === 'sdkid' ? 'sdkid' : 'accountName'}
              noStyle
              rules={[
                {
                  required: true,
                  message: selectedAccountType === 'sdkid' ? '请输入SDKID' : '请输入账号名',
                },
              ]}
            >
              <Input
                placeholder={selectedAccountType === 'sdkid' ? '请输入SDKID' : '请输入账号名'}
                maxLength={100}
                showCount
              />
            </Form.Item>
          </Space.Compact>
        </Form.Item>
      )
    }

    if (whitelistType === 'device') {
      return (
        <Form.Item
          label="设备ID"
          name="deviceId"
          rules={[{ required: true, message: '请输入设备ID' }]}
        >
          <Input placeholder="请输入设备ID" maxLength={100} showCount />
        </Form.Item>
      )
    }

    return (
      <Form.Item
        label="IP地址"
        name="ipAddress"
        rules={[{ required: true, message: '请输入IP地址' }]}
      >
        <Input placeholder="请输入IP地址" maxLength={100} showCount />
      </Form.Item>
    )
  }

  const validateActiveRange = async (_: unknown, value?: [dayjs.Dayjs, dayjs.Dayjs]) => {
    if (!value || value.length !== 2) {
      throw new Error('请选择生效时间和失效时间')
    }

    const [start, end] = value
    const now = dayjs()

    if (start.isBefore(now) || end.isBefore(now)) {
      throw new Error('不允许选择过去时间')
    }

    if (end.isBefore(start)) {
      throw new Error('失效时间不能早于生效时间')
    }

    if (end.diff(start, 'day', true) > 365) {
      throw new Error('生效时间与失效时间间隔不能超过1年')
    }
  }

  const handleMenuSelect: MenuProps['onSelect'] = ({ key }) => {
    setSelectedMenuKey(key)
  }

  const handleFilterSubmit = (values: FilterValues) => {
    setFilterValues((prev) => ({
      ...prev,
      [whitelistType]: values,
    }))
  }

  const handleFilterReset = () => {
    filterForm.resetFields()
    setFilterValues((prev) => ({
      ...prev,
      [whitelistType]: {},
    }))
  }

  const handleTypeChange = (value: string | number) => {
    const nextType = value as WhitelistType
    setWhitelistType(nextType)
    filterForm.setFieldsValue(filterValues[nextType])
    createForm.resetFields()
  }

  const handleCreateModalOpen = () => {
    createForm.resetFields()
    if (whitelistType === 'account') {
      createForm.setFieldValue('accountType', 'accountName')
    }
    setIsCreateModalOpen(true)
  }

  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false)
    createForm.resetFields()
  }

  const closeImportDrawer = () => {
    if (importTimerRef.current) {
      window.clearTimeout(importTimerRef.current)
      importTimerRef.current = null
    }
    setIsImportDrawerOpen(false)
    setImportPreviewFile(null)
    setImportRows([])
    setImportParseStatus('idle')
  }

  const handleTemplateDownload = () => {
    try {
      const href = `${import.meta.env.BASE_URL}templates/${encodeURIComponent(currentTemplateMeta.fileName)}`
      const link = document.createElement('a')
      link.href = href
      link.download = currentTemplateMeta.fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch {
      void message.error('模板下载失败，请稍后重试')
    }
  }

  const handleEditModalClose = () => {
    setIsEditModalOpen(false)
    setEditingRecord(null)
    editForm.resetFields()
  }

  const handleEdit = useCallback((record: DisplayRow) => {
    setEditingRecord(record)
    editForm.setFieldsValue({
      activeRange: [dayjs(record.activeAt), dayjs(record.expireAt)],
    })
    setIsEditModalOpen(true)
  }, [editForm])

  const handleDelete = useCallback((record: DisplayRow) => {
    Modal.confirm({
      title: `删除${whitelistMeta.tableTitle}`,
      content: '删除后该白名单对象将不再生效，是否确认删除？',
      okText: '确认删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      centered: true,
      onOk: () => {
        if (whitelistType === 'account') {
          setAccountRows((prev) => prev.filter((row) => row.key !== record.key))
        } else if (whitelistType === 'device') {
          setDeviceRows((prev) => prev.filter((row) => row.key !== record.key))
        } else {
          setIpRows((prev) => prev.filter((row) => row.key !== record.key))
        }
        void message.success('删除成功')
      },
    })
  }, [whitelistMeta.tableTitle, whitelistType])

  const handleCreateSubmit = async () => {
    const values = await createForm.validateFields()
    const now = formatDateTime(new Date())
    const activeAt = values.activeRange?.[0]?.format('YYYY-MM-DD HH:mm:ss') ?? now
    const expireAt = values.activeRange?.[1]?.format('YYYY-MM-DD HH:mm:ss') ?? now
    const baseRow: BaseRow = {
      key: `${whitelistType}-${Date.now()}`,
      status: '生效中',
      activeAt,
      expireAt,
      reason: values.reason?.trim() ?? '',
      operator: 'wangjian02',
      updatedAt: now,
    }

    if (whitelistType === 'account') {
      const nextRow: AccountRow = {
        ...baseRow,
        sdkid:
          values.accountType === 'sdkid'
            ? values.sdkid?.trim() ?? ''
            : `mock_${Date.now().toString().slice(-8)}`,
        accountName:
          values.accountType === 'accountName'
            ? values.accountName?.trim() ?? ''
            : 'SDKID白名单对象',
      }
      setAccountRows((prev) => [nextRow, ...prev])
    } else if (whitelistType === 'device') {
      const nextRow: DeviceRow = {
        ...baseRow,
        deviceId: values.deviceId?.trim() ?? '',
      }
      setDeviceRows((prev) => [nextRow, ...prev])
    } else {
      const nextRow: IpRow = {
        ...baseRow,
        ipAddress: values.ipAddress?.trim() ?? '',
      }
      setIpRows((prev) => [nextRow, ...prev])
    }

    message.success(`${whitelistMeta.tableTitle}新增成功`)
    handleCreateModalClose()
  }

  const handleEditSubmit = async () => {
    if (!editingRecord) {
      return
    }

    const values = await editForm.validateFields()
    const activeAt = values.activeRange?.[0]?.format('YYYY-MM-DD HH:mm:ss') ?? editingRecord.activeAt
    const expireAt = values.activeRange?.[1]?.format('YYYY-MM-DD HH:mm:ss') ?? editingRecord.expireAt
    const updatedAt = formatDateTime(new Date())

    if (whitelistType === 'account') {
      setAccountRows((prev) =>
        prev.map((row) =>
          row.key === editingRecord.key
            ? {
                ...row,
                activeAt,
                expireAt,
                updatedAt,
              }
            : row,
        ),
      )
    } else if (whitelistType === 'device') {
      setDeviceRows((prev) =>
        prev.map((row) =>
          row.key === editingRecord.key
            ? {
                ...row,
                activeAt,
                expireAt,
                updatedAt,
              }
            : row,
        ),
      )
    } else {
      setIpRows((prev) =>
        prev.map((row) =>
          row.key === editingRecord.key
            ? {
                ...row,
                activeAt,
                expireAt,
                updatedAt,
              }
            : row,
        ),
      )
    }

    void message.success('生效时间已更新')
    handleEditModalClose()
  }

  const buildMockImportRows = (type: WhitelistType): DisplayRow[] => {
    const importTime = formatDateTime(new Date())

    if (type === 'account') {
      return [
        {
          key: `import-account-${Date.now()}-1`,
          primaryValue: '310003_128318239811',
          secondaryValue: 'sgs123123123123123',
          status: '生效中',
          activeAt: '2026-05-10 10:00:00',
          expireAt: '2026-06-10 10:00:00',
          reason: '批量导入测试账号',
          operator: 'wangjian02',
          updatedAt: importTime,
        },
        {
          key: `import-account-${Date.now()}-2`,
          primaryValue: '310003_1283182399999',
          secondaryValue: 'import_mock_user',
          status: '生效中',
          activeAt: '2026-05-12 09:00:00',
          expireAt: '2026-08-12 09:00:00',
          reason: '活动灰度白名单',
          operator: 'wangjian02',
          updatedAt: importTime,
        },
      ]
    }

    if (type === 'device') {
      return [
        {
          key: `import-device-${Date.now()}-1`,
          primaryValue: 'device_a18f927ac3',
          status: '生效中',
          activeAt: '2026-05-10 10:00:00',
          expireAt: '2026-06-10 10:00:00',
          reason: '批量导入设备测试',
          operator: 'wangjian02',
          updatedAt: importTime,
        },
        {
          key: `import-device-${Date.now()}-2`,
          primaryValue: 'device_import_batch_009',
          status: '生效中',
          activeAt: '2026-05-12 09:00:00',
          expireAt: '2026-08-12 09:00:00',
          reason: '渠道设备白名单',
          operator: 'wangjian02',
          updatedAt: importTime,
        },
      ]
    }

    return [
      {
        key: `import-ip-${Date.now()}-1`,
        primaryValue: '10.10.12.33',
        status: '生效中',
        activeAt: '2026-05-10 10:00:00',
        expireAt: '2026-06-10 10:00:00',
        reason: '批量导入办公出口',
        operator: 'wangjian02',
        updatedAt: importTime,
      },
      {
        key: `import-ip-${Date.now()}-2`,
        primaryValue: '172.16.20.88',
        status: '生效中',
        activeAt: '2026-05-12 09:00:00',
        expireAt: '2026-08-12 09:00:00',
        reason: '活动来源IP',
        operator: 'wangjian02',
        updatedAt: importTime,
      },
    ]
  }

  const handleMockUpload = (file: File) => {
    const sizeLabel = `${(file.size / 1024).toFixed(1)} KB`
    if (importTimerRef.current) {
      window.clearTimeout(importTimerRef.current)
      importTimerRef.current = null
    }
    setImportPreviewFile({
      name: file.name,
      sizeLabel,
    })
    setImportRows([])
    setImportParseStatus('parsing')
    importTimerRef.current = window.setTimeout(() => {
      setImportRows(buildMockImportRows(whitelistType))
      setImportParseStatus('parsed')
      importTimerRef.current = null
      void message.success('文件上传成功，已生成解析结果')
    }, 1000)
    return false
  }

  const importUploadProps: UploadProps = {
    accept: '.xls,.xlsx',
    maxCount: 1,
    showUploadList: false,
    beforeUpload: (file) => handleMockUpload(file as File),
  }

  const handleImportCommit = () => {
    if (importRows.length === 0) {
      return
    }

    let imported = 0
    let skipped = 0

    if (whitelistType === 'account') {
      setAccountRows((prev) => {
        const existing = new Set(prev.map((row) => row.sdkid))
        const nextRows: AccountRow[] = []

        importRows.forEach((row) => {
          if (existing.has(row.primaryValue)) {
            skipped += 1
            return
          }

          existing.add(row.primaryValue)
          nextRows.push({
            key: row.key,
            sdkid: row.primaryValue,
            accountName: row.secondaryValue ?? '批量导入账号',
            status: '生效中',
            activeAt: row.activeAt,
            expireAt: row.expireAt,
            reason: row.reason,
            operator: 'wangjian02',
            updatedAt: formatDateTime(new Date()),
          })
          imported += 1
        })

        return [...nextRows, ...prev]
      })
    } else if (whitelistType === 'device') {
      setDeviceRows((prev) => {
        const existing = new Set(prev.map((row) => row.deviceId))
        const nextRows: DeviceRow[] = []

        importRows.forEach((row) => {
          if (existing.has(row.primaryValue)) {
            skipped += 1
            return
          }

          existing.add(row.primaryValue)
          nextRows.push({
            key: row.key,
            deviceId: row.primaryValue,
            status: '生效中',
            activeAt: row.activeAt,
            expireAt: row.expireAt,
            reason: row.reason,
            operator: 'wangjian02',
            updatedAt: formatDateTime(new Date()),
          })
          imported += 1
        })

        return [...nextRows, ...prev]
      })
    } else {
      setIpRows((prev) => {
        const existing = new Set(prev.map((row) => row.ipAddress))
        const nextRows: IpRow[] = []

        importRows.forEach((row) => {
          if (existing.has(row.primaryValue)) {
            skipped += 1
            return
          }

          existing.add(row.primaryValue)
          nextRows.push({
            key: row.key,
            ipAddress: row.primaryValue,
            status: '生效中',
            activeAt: row.activeAt,
            expireAt: row.expireAt,
            reason: row.reason,
            operator: 'wangjian02',
            updatedAt: formatDateTime(new Date()),
          })
          imported += 1
        })

        return [...nextRows, ...prev]
      })
    }

    message.success(`继续导入完成：成功 ${imported} 条，跳过 ${skipped} 条`)
    closeImportDrawer()
  }

  const currentImportColumns = useMemo(() => {
    const baseColumns: TableColumnsType<DisplayRow> = [
      { title: '生效时间', dataIndex: 'activeAt', key: 'activeAt', width: 180 },
      { title: '失效时间', dataIndex: 'expireAt', key: 'expireAt', width: 180 },
      { title: '加入原因', dataIndex: 'reason', key: 'reason', width: 180 },
    ]

    if (whitelistType === 'account') {
      return [
        {
          title: 'SDKID',
          dataIndex: 'primaryValue',
          key: 'primaryValue',
          width: 180,
          render: (value: string) => whitelistCopy(value),
        },
        {
          title: '账号名',
          dataIndex: 'secondaryValue',
          key: 'secondaryValue',
          width: 220,
          render: (value: string) => whitelistCopy(value),
        },
        ...baseColumns,
      ]
    }

    if (whitelistType === 'device') {
      return [
        {
          title: '设备ID',
          dataIndex: 'primaryValue',
          key: 'primaryValue',
          width: 240,
          render: (value: string) => whitelistCopy(value),
        },
        ...baseColumns,
      ]
    }

    return [
      {
        title: 'IP地址',
        dataIndex: 'primaryValue',
        key: 'primaryValue',
        width: 220,
        render: (value: string) => whitelistCopy(value),
      },
      ...baseColumns,
    ]
  }, [whitelistType])

  const currentColumns = useMemo(() => {
    if (whitelistType === 'account') {
      return [
        {
          title: 'SDKID',
          dataIndex: 'primaryValue',
          key: 'primaryValue',
          width: 180,
          render: (value: string) => whitelistCopy(value),
        },
        {
          title: '账号名',
          dataIndex: 'secondaryValue',
          key: 'secondaryValue',
          width: 220,
          render: (value: string) => whitelistCopy(value),
        },
        ...commonColumns<DisplayRow>(handleEdit, handleDelete),
      ]
    }

    if (whitelistType === 'device') {
      return [
        {
          title: '设备ID',
          dataIndex: 'primaryValue',
          key: 'primaryValue',
          width: 240,
          render: (value: string) => whitelistCopy(value),
        },
        ...commonColumns<DisplayRow>(handleEdit, handleDelete),
      ]
    }

    return [
      {
        title: 'IP地址',
        dataIndex: 'primaryValue',
        key: 'primaryValue',
        width: 220,
        render: (value: string) => whitelistCopy(value),
      },
      ...commonColumns<DisplayRow>(handleEdit, handleDelete),
    ]
  }, [handleDelete, handleEdit, whitelistType])

  const renderPlaceholderPanel = () => (
    <Card className="placeholder-card" bordered={false}>
      <div className="placeholder-icon-wrap">
        <FileTextOutlined className="placeholder-icon" />
      </div>
      <Title level={4}>{currentSection.sectionTitle}</Title>
      <Paragraph>{currentSection.description}</Paragraph>
      <div className="placeholder-metrics">
        <div className="metric-card">
          <span className="metric-label">待补齐模块</span>
          <strong>2</strong>
        </div>
        <div className="metric-card">
          <span className="metric-label">原型状态</span>
          <strong>规划中</strong>
        </div>
        <div className="metric-card">
          <span className="metric-label">展示模式</span>
          <strong>单页联动</strong>
        </div>
      </div>
      <Empty
        description="当前菜单仅实现结构与占位内容联动，后续可继续扩展真实列表与详情流程。"
      />
    </Card>
  )

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
            selectedKeys={[selectedMenuKey]}
            openKeys={openMenuKeys}
            onOpenChange={(keys) => setOpenMenuKeys(keys as string[])}
            onSelect={handleMenuSelect}
            items={sideMenuItems}
            className="side-menu"
          />
        </Sider>
        <Content className="page-content">
          <section className="page-head">
            <div className="page-head-main">
              <Title level={3}>{currentSection.title}</Title>
              <Text className="page-head-subtitle">
                {isWhitelistView
                  ? '可针对账号、设备或IP设置风控白名单，加入白名单的对象不再触发风控'
                  : currentSection.description}
              </Text>
            </div>
            {isWhitelistView ? (
              <Segmented
                block={false}
                options={whitelistTypeOptions}
                value={whitelistType}
                onChange={handleTypeChange}
                className="page-segmented"
              />
            ) : null}
          </section>

          {isWhitelistView ? (
            <>
              <Card className="filter-card" bordered={false}>
                <Form
                  layout="vertical"
                  className="filter-form"
                  form={filterForm}
                  initialValues={filterValues[whitelistType]}
                  onFinish={handleFilterSubmit}
                >
                  <div className="filter-grid">
                    <Form.Item label={whitelistMeta.queryLabel} name="keyword" className="filter-item">
                      <Input placeholder={whitelistMeta.queryPlaceholder} size="large" />
                    </Form.Item>
                    <Form.Item label="生效状态" name="status" className="filter-item">
                      <Select
                        size="large"
                        placeholder="请选择生效状态"
                        options={[
                          { value: 'active', label: '生效中' },
                          { value: 'inactive', label: '已失效' },
                          { value: 'disabled', label: '未开启' },
                        ]}
                      />
                    </Form.Item>
                    <Form.Item label=" " className="filter-item filter-item-actions">
                      <Space size={12} className="filter-actions">
                        <Button size="large" icon={<ReloadOutlined />} onClick={handleFilterReset}>
                          重置
                        </Button>
                        <Button size="large" type="primary" icon={<SearchOutlined />} htmlType="submit">
                          查询
                        </Button>
                      </Space>
                    </Form.Item>
                  </div>
                </Form>
              </Card>

              <Card
                className="table-card"
                title={
                  <Space size={10}>
                    <span className="section-accent" />
                    <Text strong>{whitelistMeta.tableTitle}</Text>
                  </Space>
                }
                extra={
                  <Space size={12}>
                    <Button type="primary" onClick={handleCreateModalOpen}>
                      + 新增白名单
                    </Button>
                    <Button
                      icon={<DownloadOutlined />}
                      onClick={() => setIsImportDrawerOpen(true)}
                    >
                      批量导入
                    </Button>
                  </Space>
                }
              >
                <Table
                  rowKey="key"
                  columns={currentColumns}
                  dataSource={currentRows}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: false,
                    showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条 / 共 ${total} 条`,
                  }}
                  size="middle"
                  className="whitelist-table"
                  scroll={{ x: 1320, y: 420 }}
                />
              </Card>
            </>
          ) : (
            renderPlaceholderPanel()
          )}
        </Content>
      </Layout>

      <Modal
        title={whitelistMeta.modalTitle}
        open={isCreateModalOpen}
        onCancel={handleCreateModalClose}
        onOk={() => void handleCreateSubmit()}
        okText="确定"
        cancelText="取消"
        centered
        destroyOnClose
        className="create-modal"
        width={560}
      >
        <Form form={createForm} layout="vertical" preserve={false}>
          <div className="create-form-grid">
            {renderCreateFields()}
            <Form.Item
              label="生效时间"
              name="activeRange"
              rules={[{ validator: validateActiveRange }]}
              className="full-row-field"
            >
              <DatePicker.RangePicker
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                placeholder={['请选择生效时间', '请选择失效时间']}
                disabledDate={(current) => current ? current.isBefore(dayjs().startOf('day')) : false}
                className="date-field"
              />
            </Form.Item>
            <Form.Item
              label="加入原因"
              name="reason"
              rules={[{ required: true, message: '请输入加入原因' }]}
              className="full-row-field"
            >
              <Input.TextArea
                rows={3}
                placeholder="请输入添加白名单的原因"
                maxLength={200}
                showCount
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      <Modal
        title={`编辑${whitelistMeta.tableTitle}`}
        open={isEditModalOpen}
        onCancel={handleEditModalClose}
        onOk={() => void handleEditSubmit()}
        okText="确定"
        cancelText="取消"
        centered
        destroyOnClose
        className="create-modal"
        width={560}
      >
        <Form form={editForm} layout="vertical" preserve={false}>
          <Descriptions
            column={1}
            size="small"
            bordered
            className="edit-readonly-summary"
            items={[
              {
                key: 'target',
                label:
                  whitelistType === 'account'
                    ? 'SDKID / 账号名'
                    : whitelistType === 'device'
                      ? '设备ID'
                      : 'IP地址',
                children:
                  whitelistType === 'account' && editingRecord?.secondaryValue
                    ? `${editingRecord.primaryValue} / ${editingRecord.secondaryValue}`
                    : editingRecord?.primaryValue,
              },
              {
                key: 'reason',
                label: '添加原因',
                children: editingRecord?.reason,
              },
            ]}
          />
          <Form.Item
            label="生效时间"
            name="activeRange"
            rules={[{ validator: validateActiveRange }]}
            className="full-row-field"
          >
            <DatePicker.RangePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              placeholder={['请选择生效时间', '请选择失效时间']}
              disabledDate={(current) => (current ? current.isBefore(dayjs().startOf('day')) : false)}
              className="date-field"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title="批量导入白名单"
        placement="right"
        width={960}
        open={isImportDrawerOpen}
        onClose={closeImportDrawer}
        className="import-drawer"
        footer={
          <div className="drawer-footer">
            <Button type="primary" disabled={importParseStatus !== 'parsed' || importRows.length === 0} onClick={handleImportCommit}>
              导入
            </Button>
            <Button onClick={closeImportDrawer}>取消</Button>
          </div>
        }
      >
        <Alert
          type="warning"
          showIcon
          message="导入提示"
          className="import-tips"
          description={
            <div className="import-tips-content">
              <ul>
                {importTips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
              <Button type="link" icon={<DownloadOutlined />} className="template-link" onClick={handleTemplateDownload}>
                {currentTemplateMeta.label}
              </Button>
            </div>
          }
        />

        <section className="import-section">
          <div className="section-title-row">
            <span className="section-accent" />
            <Text strong>文件上传</Text>
          </div>
          {importPreviewFile ? (
            <div className="upload-result-card">
              <div className="upload-file-meta">
                <div className="upload-file-icon">
                  <FileTextOutlined />
                </div>
                <div className="upload-file-info">
                  <div className="upload-file-name-row">
                    <Text strong>{importPreviewFile.name}</Text>
                    <Text type="secondary">{importPreviewFile.sizeLabel}</Text>
                  </div>
                  <Space split={<span className="upload-separator">•</span>} className="upload-file-stats">
                    {importParseStatus === 'parsing' ? (
                      <span className="parsing-status">
                        <Spin size="small" />
                        <Text>解析中...</Text>
                      </span>
                    ) : (
                      <>
                        <Text>解析成功: {importRows.length}</Text>
                        <Text>解析失败: 0</Text>
                        <Button type="link" icon={<DownloadOutlined />} onClick={() => void message.info('解析结果下载为原型占位行为，当前未接真实文件。')}>
                          下载解析结果
                        </Button>
                      </>
                    )}
                  </Space>
                </div>
              </div>
              <Upload {...importUploadProps}>
                <Button type="link">重新上传</Button>
              </Upload>
            </div>
          ) : (
            <Upload.Dragger {...importUploadProps} className="import-uploader">
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">点击或将文件拖拽到这里上传</p>
              <p className="ant-upload-hint">支持 .xls、.xlsx 格式文件</p>
            </Upload.Dragger>
          )}
        </section>

        <section className="import-section import-result-section">
          <div className="section-title-row result-title-row">
            <div className="result-title-left">
              <span className="section-accent" />
              <Text strong>解析结果</Text>
              {importParseStatus === 'parsed' && importRows.length > 0 ? <span className="result-count-tag">{importRows.length} 条记录</span> : null}
            </div>
          </div>
          <Card className="import-result-card" bordered={false}>
            <Table
              rowKey="key"
              columns={currentImportColumns}
              dataSource={importRows}
              pagination={false}
              size="middle"
              className="whitelist-table import-result-table"
              locale={{
                emptyText:
                  importParseStatus === 'parsing' ? (
                    <Empty description="文件解析中，请稍候..." />
                  ) : (
                    <Empty description="暂无解析结果，请先上传文件" />
                  ),
              }}
              scroll={{ x: 980 }}
            />
          </Card>
        </section>
      </Drawer>
    </Layout>
  )
}

export default App
