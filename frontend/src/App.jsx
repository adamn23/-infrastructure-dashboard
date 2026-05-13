import React, { useState, useEffect, useCallback } from 'react'
import { api } from './utils/api'
import StatsPanel from './components/StatsPanel'
import AssetTable from './components/AssetTable'
import AssetDrawer from './components/AssetDrawer'
import AddAssetModal from './components/AddAssetModal'

const s = {
  layout: { minHeight: '100vh', display: 'flex', flexDirection: 'column' },
  header: {
    padding: '0 32px',
    height: '56px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid var(--border)',
    background: 'var(--bg-surface)',
    position: 'sticky', top: 0, zIndex: 50,
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: '10px',
  },
  logoMark: {
    width: '28px', height: '28px',
    background: 'var(--accent-amber)',
    borderRadius: '4px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '14px', fontWeight: 800,
    fontFamily: 'var(--font-display)',
    color: '#000',
  },
  logoText: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: '16px',
    letterSpacing: '-0.01em',
    color: 'var(--text-primary)',
  },
  headerRight: {
    display: 'flex', alignItems: 'center', gap: '16px',
    fontSize: '11px', color: 'var(--text-muted)',
  },
  statusDot: {
    width: '6px', height: '6px', borderRadius: '50%',
    background: 'var(--good)',
    display: 'inline-block',
    marginRight: '6px',
    animation: 'pulse-critical 2s infinite',
  },
  main: {
    flex: 1,
    maxWidth: '1280px',
    margin: '0 auto',
    width: '100%',
    padding: '28px 32px',
  },
  tabs: {
    display: 'flex',
    gap: '0',
    marginBottom: '24px',
    borderBottom: '1px solid var(--border)',
  },
  tab: {
    padding: '10px 20px',
    fontSize: '12px',
    fontFamily: 'var(--font-mono)',
    fontWeight: 600,
    cursor: 'pointer',
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    borderBottom: '2px solid transparent',
    transition: 'all 0.15s',
    marginBottom: '-1px',
  },
  tabActive: {
    color: 'var(--accent-amber)',
    borderBottomColor: 'var(--accent-amber)',
  },
  errorBanner: {
    background: 'rgba(239,68,68,0.08)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: 'var(--radius-md)',
    padding: '12px 16px',
    color: 'var(--critical)',
    fontSize: '12px',
    marginBottom: '16px',
  },
}

const now = () => new Date().toLocaleTimeString('en-CA', { hour12: false })

export default function App() {
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')
  const [lastRefresh, setLastRefresh] = useState(now())

  const fetchAll = useCallback(async () => {
    setError('')
    try {
      const [statsData, assetsData] = await Promise.all([
        api.getStats(),
        api.getAssets({ sort_by: sortBy, order: sortOrder }),
      ])
      setStats(statsData)
      setAssets(assetsData)
      setLastRefresh(now())
    } catch (e) {
      setError(`Failed to load data: ${e.message}. Is the backend running?`)
    } finally {
      setLoading(false)
    }
  }, [sortBy, sortOrder])

  useEffect(() => { fetchAll() }, [fetchAll])

  // Auto-refresh every 30s
  useEffect(() => {
    const id = setInterval(fetchAll, 30_000)
    return () => clearInterval(id)
  }, [fetchAll])

  const handleSort = (col, ord) => {
    setSortBy(col)
    setSortOrder(ord)
  }

  return (
    <div style={s.layout}>
      {/* Header */}
      <header style={s.header}>
        <div style={s.logo}>
          <div style={s.logoMark}>IW</div>
          <span style={s.logoText}>InfraWatch</span>
        </div>
        <div style={s.headerRight}>
          <span>
            <span style={s.statusDot} />
            System Online
          </span>
          <span>Refreshed {lastRefresh}</span>
          <span style={{
            background: 'var(--accent-cyan-dim)',
            border: '1px solid rgba(56,189,248,0.2)',
            borderRadius: 'var(--radius-sm)',
            padding: '3px 10px',
            color: 'var(--accent-cyan)',
            fontSize: '10px',
            letterSpacing: '0.06em',
          }}>
            v1.0.0
          </span>
        </div>
      </header>

      {/* Main */}
      <main style={s.main}>
        {error && <div style={s.errorBanner}>⚠ {error}</div>}

        {/* Tabs */}
        <div style={s.tabs}>
          {['overview', 'assets'].map(tab => (
            <button
              key={tab}
              style={{ ...s.tab, ...(activeTab === tab ? s.tabActive : {}) }}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'overview' ? '⬡ Overview' : '⊞ Asset Registry'}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'overview' ? (
          <StatsPanel
            stats={stats}
            onAssetClick={a => { setSelectedAsset(a); setActiveTab('assets') }}
          />
        ) : (
          <AssetTable
            assets={assets}
            loading={loading}
            onRowClick={setSelectedAsset}
            onAdd={() => setShowAddModal(true)}
            onSort={handleSort}
            sortBy={sortBy}
            sortOrder={sortOrder}
          />
        )}
      </main>

      {/* Asset Drawer */}
      {selectedAsset && (
        <AssetDrawer
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
          onDelete={fetchAll}
          onRefresh={fetchAll}
        />
      )}

      {/* Add Asset Modal */}
      {showAddModal && (
        <AddAssetModal
          onClose={() => setShowAddModal(false)}
          onSave={fetchAll}
        />
      )}
    </div>
  )
}
