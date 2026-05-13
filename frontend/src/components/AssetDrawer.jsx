import React, { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { CONDITIONS, STATUSES, TYPE_ICONS } from '../utils/constants'
import { format } from 'date-fns'

const s = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(4px)',
    zIndex: 100,
    display: 'flex', justifyContent: 'flex-end',
  },
  drawer: {
    width: '500px',
    maxWidth: '100vw',
    height: '100vh',
    background: 'var(--bg-surface)',
    borderLeft: '1px solid var(--border-bright)',
    display: 'flex',
    flexDirection: 'column',
    animation: 'slideIn 0.25s ease',
    overflowY: 'auto',
  },
  header: {
    padding: '24px 24px 16px',
    borderBottom: '1px solid var(--border)',
    position: 'sticky', top: 0,
    background: 'var(--bg-surface)',
    zIndex: 1,
  },
  closeBtn: {
    position: 'absolute', top: '20px', right: '20px',
    background: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-muted)',
    padding: '4px 10px',
    fontSize: '16px',
    cursor: 'pointer',
    fontFamily: 'var(--font-mono)',
    transition: 'all 0.15s',
  },
  body: { padding: '20px 24px', flex: 1 },
  sectionTitle: {
    fontSize: '10px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--text-label)',
    fontWeight: 600,
    marginBottom: '12px',
    marginTop: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    marginBottom: '4px',
  },
  infoCell: {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '12px',
  },
  infoLabel: {
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'var(--text-muted)',
    marginBottom: '4px',
  },
  infoValue: {
    fontSize: '13px',
    color: 'var(--text-primary)',
    fontWeight: 500,
  },
  badge: {
    display: 'inline-flex', alignItems: 'center', gap: '4px',
    padding: '3px 8px', borderRadius: '3px',
    fontSize: '12px', fontWeight: 500,
  },
  dot: { width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0 },
  inspectionItem: {
    borderLeft: '2px solid var(--border)',
    paddingLeft: '14px',
    marginBottom: '14px',
    position: 'relative',
  },
  inspectionDot: {
    position: 'absolute',
    left: '-5px', top: '4px',
    width: '8px', height: '8px',
    borderRadius: '50%',
  },
  inspectionDate: {
    fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px',
  },
  inspectionBody: {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 12px',
  },
  actionRow: {
    display: 'flex',
    gap: '8px',
    padding: '16px 24px',
    borderTop: '1px solid var(--border)',
    background: 'var(--bg-surface)',
    position: 'sticky',
    bottom: 0,
  },
  btn: {
    flex: 1,
    padding: '9px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'var(--font-mono)',
    transition: 'all 0.15s',
  },
  addInspBtn: {
    flex: 2,
    background: 'var(--accent-amber-dim)',
    border: '1px solid var(--accent-amber)',
    color: 'var(--accent-amber)',
  },
  deleteBtn: {
    flex: 1,
    background: 'rgba(239,68,68,0.08)',
    border: '1px solid rgba(239,68,68,0.3)',
    color: 'var(--critical)',
  },
  addInspForm: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-bright)',
    borderRadius: 'var(--radius-md)',
    padding: '16px',
    marginTop: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  formInput: {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '8px 12px',
    color: 'var(--text-primary)',
    fontSize: '12px',
    outline: 'none',
    width: '100%',
    fontFamily: 'var(--font-mono)',
  },
  formSelect: {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '8px 10px',
    color: 'var(--text-primary)',
    fontSize: '12px',
    outline: 'none',
    width: '100%',
    appearance: 'none',
    cursor: 'pointer',
    fontFamily: 'var(--font-mono)',
  },
  submitBtn: {
    background: 'var(--accent-amber-dim)',
    border: '1px solid var(--accent-amber)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--accent-amber)',
    padding: '8px 16px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'var(--font-mono)',
    alignSelf: 'flex-end',
  },
}

const CondBadge = ({ cond }) => {
  const c = CONDITIONS[cond] || {}
  return (
    <span style={{ ...s.badge, color: c.color, background: c.bg }}>
      <span style={{ ...s.dot, background: c.color }} />
      {c.label || cond}
    </span>
  )
}

export default function AssetDrawer({ asset: initial, onClose, onDelete, onRefresh }) {
  const [asset, setAsset] = useState(initial)
  const [inspections, setInspections] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    inspector_name: '', condition: 'good', notes: '', inspection_date: new Date().toISOString().slice(0, 10)
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api.getAsset(initial.id).then(setAsset).catch(console.error)
    api.getInspections(initial.id).then(setInspections).catch(console.error)
  }, [initial.id])

  const handleOverlayClick = e => { if (e.target === e.currentTarget) onClose() }

  const handleDelete = async () => {
    if (!confirm(`Delete "${asset.name}"? This cannot be undone.`)) return
    await api.deleteAsset(asset.id)
    onDelete()
    onClose()
  }

  const handleAddInspection = async () => {
    if (!form.inspector_name.trim()) return
    setSubmitting(true)
    try {
      const payload = { ...form, inspection_date: new Date(form.inspection_date).toISOString() }
      await api.createInspection(asset.id, payload)
      const [updatedAsset, updatedInspections] = await Promise.all([
        api.getAsset(asset.id),
        api.getInspections(asset.id),
      ])
      setAsset(updatedAsset)
      setInspections(updatedInspections)
      setShowForm(false)
      setForm({ inspector_name: '', condition: 'good', notes: '', inspection_date: new Date().toISOString().slice(0, 10) })
      onRefresh()
    } catch (e) {
      alert(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const cond = CONDITIONS[asset.condition] || {}
  const status = STATUSES[asset.status] || {}

  return (
    <div style={s.overlay} onClick={handleOverlayClick}>
      <div style={s.drawer}>
        {/* Header */}
        <div style={s.header}>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '6px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {TYPE_ICONS[asset.asset_type]} {asset.asset_type}
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            {asset.name}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <CondBadge cond={asset.condition} />
            <span style={{ fontSize: '11px', color: status.color }}>{status.label}</span>
          </div>
        </div>

        {/* Body */}
        <div style={s.body}>
          <div style={s.sectionTitle}>Asset Information</div>
          <div style={s.infoGrid}>
            {[
              { label: 'Location', value: asset.location },
              { label: 'Inspections', value: inspections.length },
              { label: 'Installation Date', value: asset.installation_date ? format(new Date(asset.installation_date), 'MMM d, yyyy') : '—' },
              { label: 'Last Inspection', value: asset.last_inspection_date ? format(new Date(asset.last_inspection_date), 'MMM d, yyyy') : '—' },
              { label: 'Created', value: format(new Date(asset.created_at), 'MMM d, yyyy') },
              { label: 'Asset ID', value: `#${String(asset.id).padStart(4, '0')}` },
            ].map(({ label, value }) => (
              <div key={label} style={s.infoCell}>
                <div style={s.infoLabel}>{label}</div>
                <div style={s.infoValue}>{value}</div>
              </div>
            ))}
          </div>

          {asset.notes && (
            <div style={{ ...s.infoCell, marginTop: '10px' }}>
              <div style={s.infoLabel}>Notes</div>
              <div style={{ ...s.infoValue, fontWeight: 400, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{asset.notes}</div>
            </div>
          )}

          {/* Inspections */}
          <div style={s.sectionTitle}>
            Inspection History
            <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '11px' }}>
              {inspections.length} record{inspections.length !== 1 ? 's' : ''}
            </span>
          </div>

          {inspections.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '12px', padding: '12px 0' }}>No inspections recorded.</div>
          ) : (
            [...inspections]
              .sort((a, b) => new Date(b.inspection_date) - new Date(a.inspection_date))
              .map(insp => {
                const c = CONDITIONS[insp.condition] || {}
                return (
                  <div key={insp.id} style={s.inspectionItem}>
                    <div style={{ ...s.inspectionDot, background: c.color || '#fff' }} />
                    <div style={s.inspectionDate}>
                      {format(new Date(insp.inspection_date), 'MMM d, yyyy')} · {insp.inspector_name}
                    </div>
                    <div style={s.inspectionBody}>
                      <CondBadge cond={insp.condition} />
                      {insp.notes && (
                        <div style={{ marginTop: '8px', color: 'var(--text-secondary)', fontSize: '12px', lineHeight: 1.5 }}>
                          {insp.notes}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
          )}

          {/* Add inspection form */}
          {showForm && (
            <div style={s.addInspForm}>
              <div style={{ fontSize: '11px', color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                New Inspection
              </div>
              <input
                style={s.formInput}
                placeholder="Inspector name"
                value={form.inspector_name}
                onChange={e => setForm(f => ({ ...f, inspector_name: e.target.value }))}
              />
              <select
                style={s.formSelect}
                value={form.condition}
                onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}
              >
                {Object.entries(CONDITIONS).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
              <input
                style={s.formInput}
                type="date"
                value={form.inspection_date}
                onChange={e => setForm(f => ({ ...f, inspection_date: e.target.value }))}
              />
              <textarea
                style={{ ...s.formInput, minHeight: '72px', resize: 'vertical' }}
                placeholder="Notes (optional)"
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              />
              <button style={s.submitBtn} onClick={handleAddInspection} disabled={submitting}>
                {submitting ? 'Saving…' : 'Save Inspection'}
              </button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={s.actionRow}>
          <button
            style={{ ...s.btn, ...s.addInspBtn }}
            onClick={() => setShowForm(f => !f)}
          >
            {showForm ? '✕ Cancel' : '+ Log Inspection'}
          </button>
          <button style={{ ...s.btn, ...s.deleteBtn }} onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
