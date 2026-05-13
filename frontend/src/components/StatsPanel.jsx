import React from 'react'
import { CONDITIONS, STATUSES, TYPE_ICONS } from '../utils/constants'
import { format } from 'date-fns'

const s = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
    marginBottom: '24px',
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  label: {
    fontSize: '10px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--text-label)',
    fontWeight: 600,
  },
  value: {
    fontSize: '32px',
    fontFamily: 'var(--font-display)',
    fontWeight: 800,
    lineHeight: 1,
    marginTop: '4px',
  },
  sub: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    marginTop: '6px',
  },
  chartSection: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginBottom: '24px',
  },
  chartCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: '20px',
  },
  chartTitle: {
    fontSize: '10px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--text-label)',
    fontWeight: 600,
    marginBottom: '16px',
  },
  condBars: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  condRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '12px',
  },
  condLabel: {
    width: '60px',
    color: 'var(--text-secondary)',
  },
  condBar: {
    height: '8px',
    borderRadius: '2px',
    transition: 'width 0.6s ease',
  },
  condCount: {
    color: 'var(--text-primary)',
    width: '30px',
    textAlign: 'right',
  },
  statusDots: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  typeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
    gap: '8px',
  },
  typeItem: {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 8px',
    textAlign: 'center',
    fontSize: '11px',
  },
  typeCount: {
    fontSize: '20px',
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    color: 'var(--accent-cyan)',
  },
  typeName: {
    color: 'var(--text-muted)',
    marginTop: '2px',
    fontSize: '10px',
    textTransform: 'capitalize',
  },
  criticalSection: {
    background: 'var(--bg-card)',
    border: '1px solid var(--critical)',
    borderRadius: 'var(--radius-md)',
    padding: '16px 20px',
    marginBottom: '24px',
  },
  criticalHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
    fontSize: '10px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--critical)',
    fontWeight: 600,
  },
  criticalItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid var(--border)',
    cursor: 'pointer',
  },
}

export default function StatsPanel({ stats, onAssetClick }) {
  if (!stats) return null

  const { condition_breakdown: cb, status_breakdown: sb, type_breakdown: tb, critical_assets } = stats
  const total = stats.total_assets
  const condTotal = cb.good + cb.fair + cb.poor + cb.critical || 1

  return (
    <div className="fade-in">
      <div style={s.grid}>
        {[
          { label: 'Total Assets', value: total, sub: 'across all categories' },
          { label: 'Critical', value: cb.critical, sub: 'require immediate action', color: 'var(--critical)' },
          { label: 'Under Maintenance', value: sb.under_maintenance, sub: 'currently in service', color: 'var(--fair)' },
          { label: 'Active', value: sb.active, sub: 'operational', color: 'var(--good)' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} style={s.card}>
            <div style={s.label}>{label}</div>
            <div style={{ ...s.value, color: color || 'var(--text-primary)' }}>{value}</div>
            <div style={s.sub}>{sub}</div>
          </div>
        ))}
      </div>

      <div style={s.chartSection}>
        <div style={s.chartCard}>
          <div style={s.chartTitle}>Condition Breakdown</div>
          <div style={s.condBars}>
            {Object.entries(cb).map(([key, val]) => (
              <div key={key} style={s.condRow}>
                <span style={s.condLabel}>{CONDITIONS[key].label}</span>
                <div style={{ flex: 1, background: 'var(--bg-elevated)', borderRadius: '2px', height: '8px' }}>
                  <div style={{
                    ...s.condBar,
                    width: `${(val / condTotal) * 100}%`,
                    background: CONDITIONS[key].color,
                  }} />
                </div>
                <span style={{ ...s.condCount, color: CONDITIONS[key].color }}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={s.chartCard}>
          <div style={s.chartTitle}>Status Overview</div>
          <div style={s.statusDots}>
            {Object.entries(sb).map(([key, val]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
                <div style={{ ...s.dot, background: STATUSES[key].color }} />
                <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{STATUSES[key].label}</span>
                <span style={{ color: STATUSES[key].color, fontWeight: 600 }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {tb.length > 0 && (
        <div style={{ ...s.chartCard, marginBottom: '24px' }}>
          <div style={s.chartTitle}>Assets by Type</div>
          <div style={s.typeGrid}>
            {tb.map(({ type, count }) => (
              <div key={type} style={s.typeItem}>
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>{TYPE_ICONS[type] || '🔧'}</div>
                <div style={s.typeCount}>{count}</div>
                <div style={s.typeName}>{type}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {critical_assets.length > 0 && (
        <div style={s.criticalSection}>
          <div style={s.criticalHeader}>
            <span>⚠</span>
            Critical Assets — Immediate Action Required
          </div>
          {critical_assets.map(a => (
            <div key={a.id} style={s.criticalItem} onClick={() => onAssetClick(a)}>
              <div>
                <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{a.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' }}>{a.location}</div>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--critical)' }}>View →</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}