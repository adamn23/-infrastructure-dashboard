import React, { useState } from 'react'
import { CONDITIONS, STATUSES, ASSET_TYPES, TYPE_ICONS } from '../utils/constants'
import { format } from 'date-fns'

const s = {
  wrapper: { display: 'flex', flexDirection: 'column', gap: '12px' },
  filters: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    alignItems: 'center',
    padding: '14px 16px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
  },
  input: {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '7px 12px',
    color: 'var(--text-primary)',
    fontSize: '12px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  select: {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '7px 10px',
    color: 'var(--text-secondary)',
    fontSize: '12px',
    outline: 'none',
    cursor: 'pointer',
    appearance: 'none',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '12px',
  },
  tableWrap: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
  },
  th: {
    padding: '10px 14px',
    textAlign: 'left',
    fontSize: '10px',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--text-label)',
    borderBottom: '1px solid var(--border)',
    background: 'var(--bg-elevated)',
    cursor: 'pointer',
    userSelect: 'none',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '12px 14px',
    borderBottom: '1px solid var(--border)',
    color: 'var(--text-secondary)',
    verticalAlign: 'middle',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '3px 8px',
    borderRadius: '3px',
    fontSize: '11px',
    fontWeight: 500,
  },
  dot: {
    width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
  },
  btn: {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-secondary)',
    padding: '5px 10px',
    fontSize: '11px',
    transition: 'all 0.15s',
    cursor: 'pointer',
  },
  addBtn: {
    background: 'var(--accent-amber-dim)',
    border: '1px solid var(--accent-amber)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--accent-amber)',
    padding: '7px 14px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    marginLeft: 'auto',
    whiteSpace: 'nowrap',
    fontFamily: 'var(--font-mono)',
    transition: 'all 0.2s',
  },
  empty: {
    padding: '48px',
    textAlign: 'center',
    color: 'var(--text-muted)',
  },
}

const SortIcon = ({ active, asc }) => (
  <span style={{ marginLeft: '4px', opacity: active ? 1 : 0.3, fontSize: '10px' }}>
    {active ? (asc ? '↑' : '↓') : '↕'}
  </span>
)

const CondBadge = ({ cond }) => {
  const c = CONDITIONS[cond] || {}
  return (
    <span style={{ ...s.badge, color: c.color, background: c.bg }}>
      <span style={{ ...s.dot, background: c.color }} />
      {c.label || cond}
    </span>
  )
}

const StatusBadge = ({ status }) => {
  const st = STATUSES[status] || {}
  return (
    <span style={{ color: st.color || 'var(--text-muted)', fontSize: '11px' }}>
      {st.label || status}
    </span>
  )
}

const COLS = [
  { key: 'name', label: 'Asset Name' },
  { key: 'asset_type', label: 'Type' },
  { key: 'location', label: 'Location' },
  { key: 'condition', label: 'Condition' },
  { key: 'status', label: 'Status' },
  { key: 'last_inspection_date', label: 'Last Inspection' },
  { key: 'inspection_count', label: 'Inspections' },
]

const SORTABLE = ['name', 'condition', 'status', 'created_at', 'last_inspection_date']

export default function AssetTable({ assets, loading, onRowClick, onAdd, onSort, sortBy, sortOrder }) {
  const [search, setSearch] = useState('')
  const [filterCond, setFilterCond] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterType, setFilterType] = useState('')

  const displayed = (assets || []).filter(a => {
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.location.toLowerCase().includes(search.toLowerCase())
    const matchCond = !filterCond || a.condition === filterCond
    const matchStatus = !filterStatus || a.status === filterStatus
    const matchType = !filterType || a.asset_type === filterType
    return matchSearch && matchCond && matchStatus && matchType
  })

  const handleSort = (col) => {
    if (!SORTABLE.includes(col)) return
    const newOrder = sortBy === col && sortOrder === 'asc' ? 'desc' : 'asc'
    onSort(col, newOrder)
  }

  return (
    <div style={s.wrapper}>
      <div style={s.filters}>
        <input
          style={{ ...s.input, minWidth: '220px', flex: 1 }}
          placeholder="🔍  Search name or location…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select style={s.select} value={filterCond} onChange={e => setFilterCond(e.target.value)}>
          <option value="">All Conditions</option>
          {Object.entries(CONDITIONS).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <select style={s.select} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {Object.entries(STATUSES).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <select style={s.select} value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          {ASSET_TYPES.map(t => (
            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
          ))}
        </select>
        <button style={s.addBtn} onClick={onAdd}>+ Add Asset</button>
      </div>

      <div style={s.tableWrap}>
        {loading ? (
          <div style={s.empty}>Loading assets…</div>
        ) : displayed.length === 0 ? (
          <div style={s.empty}>No assets found.</div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                {COLS.map(col => (
                  <th
                    key={col.key}
                    style={{ ...s.th, ...(SORTABLE.includes(col.key) ? { cursor: 'pointer' } : {}) }}
                    onClick={() => handleSort(col.key)}
                  >
                    {col.label}
                    {SORTABLE.includes(col.key) && (
                      <SortIcon active={sortBy === col.key} asc={sortOrder === 'asc'} />
                    )}
                  </th>
                ))}
                <th style={s.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((a, i) => (
                <tr
                  key={a.id}
                  style={{
                    cursor: 'pointer',
                    animation: `fadeIn 0.2s ease ${i * 0.03}s both`,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  onClick={() => onRowClick(a)}
                >
                  <td style={{ ...s.td }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                      {TYPE_ICONS[a.asset_type]} {a.name}
                    </span>
                  </td>
                  <td style={s.td}>
                    <span style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                      {a.asset_type}
                    </span>
                  </td>
                  <td style={s.td}>{a.location}</td>
                  <td style={s.td}><CondBadge cond={a.condition} /></td>
                  <td style={s.td}><StatusBadge status={a.status} /></td>
                  <td style={s.td}>
                    {a.last_inspection_date
                      ? format(new Date(a.last_inspection_date), 'MMM d, yyyy')
                      : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                  </td>
                  <td style={{ ...s.td, color: 'var(--accent-cyan)' }}>{a.inspection_count}</td>
                  <td style={s.td} onClick={e => e.stopPropagation()}>
                    <button style={s.btn} onClick={() => onRowClick(a)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div style={{ color: 'var(--text-muted)', fontSize: '11px', textAlign: 'right' }}>
        Showing {displayed.length} of {(assets || []).length} assets
      </div>
    </div>
  )
}
