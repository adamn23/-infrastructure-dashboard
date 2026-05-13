import React, { useState } from 'react'
import { api } from '../utils/api'
import { CONDITIONS, STATUSES, ASSET_TYPES } from '../utils/constants'

const s = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.65)',
    backdropFilter: 'blur(4px)',
    zIndex: 200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-bright)',
    borderRadius: 'var(--radius-lg)',
    padding: '28px',
    width: '500px',
    maxWidth: '95vw',
    maxHeight: '90vh',
    overflowY: 'auto',
    animation: 'fadeIn 0.2s ease',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '18px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '20px',
  },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  fieldFull: { display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: '1 / -1' },
  label: {
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'var(--text-label)',
    fontWeight: 600,
  },
  input: {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '9px 12px',
    color: 'var(--text-primary)',
    fontSize: '12px',
    outline: 'none',
    fontFamily: 'var(--font-mono)',
    transition: 'border-color 0.2s',
  },
  select: {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '9px 10px',
    color: 'var(--text-primary)',
    fontSize: '12px',
    outline: 'none',
    appearance: 'none',
    cursor: 'pointer',
    fontFamily: 'var(--font-mono)',
  },
  textarea: {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '9px 12px',
    color: 'var(--text-primary)',
    fontSize: '12px',
    outline: 'none',
    fontFamily: 'var(--font-mono)',
    minHeight: '80px',
    resize: 'vertical',
  },
  actions: { display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' },
  cancelBtn: {
    background: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-muted)',
    padding: '9px 18px',
    fontSize: '12px',
    cursor: 'pointer',
    fontFamily: 'var(--font-mono)',
  },
  submitBtn: {
    background: 'var(--accent-amber-dim)',
    border: '1px solid var(--accent-amber)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--accent-amber)',
    padding: '9px 20px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'var(--font-mono)',
  },
}

const INITIAL = {
  name: '', asset_type: 'bridge', location: '',
  latitude: '', longitude: '', condition: 'good',
  status: 'active', installation_date: '', notes: '',
}

export default function AddAssetModal({ onClose, onSave }) {
  const [form, setForm] = useState(INITIAL)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.location.trim()) {
      setError('Name and location are required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...form,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        installation_date: form.installation_date ? new Date(form.installation_date).toISOString() : null,
      }
      await api.createAsset(payload)
      onSave()
      onClose()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={s.overlay} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={s.modal}>
        <div style={s.title}>Add New Asset</div>

        <div style={s.grid}>
          <div style={s.fieldFull}>
            <label style={s.label}>Asset Name *</label>
            <input style={s.input} placeholder="e.g. Gardiner Expressway Span 12" value={form.name} onChange={set('name')} />
          </div>

          <div style={s.field}>
            <label style={s.label}>Type</label>
            <select style={s.select} value={form.asset_type} onChange={set('asset_type')}>
              {ASSET_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </div>

          <div style={s.field}>
            <label style={s.label}>Condition</label>
            <select style={s.select} value={form.condition} onChange={set('condition')}>
              {Object.entries(CONDITIONS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>

          <div style={s.fieldFull}>
            <label style={s.label}>Location *</label>
            <input style={s.input} placeholder="e.g. King St W, Toronto, ON" value={form.location} onChange={set('location')} />
          </div>

          <div style={s.field}>
            <label style={s.label}>Latitude</label>
            <input style={s.input} type="number" step="0.0001" placeholder="43.6532" value={form.latitude} onChange={set('latitude')} />
          </div>

          <div style={s.field}>
            <label style={s.label}>Longitude</label>
            <input style={s.input} type="number" step="0.0001" placeholder="-79.3832" value={form.longitude} onChange={set('longitude')} />
          </div>

          <div style={s.field}>
            <label style={s.label}>Status</label>
            <select style={s.select} value={form.status} onChange={set('status')}>
              {Object.entries(STATUSES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>

          <div style={s.field}>
            <label style={s.label}>Installation Date</label>
            <input style={s.input} type="date" value={form.installation_date} onChange={set('installation_date')} />
          </div>

          <div style={s.fieldFull}>
            <label style={s.label}>Notes</label>
            <textarea style={s.textarea} placeholder="Observations, known issues, planned maintenance…" value={form.notes} onChange={set('notes')} />
          </div>
        </div>

        {error && <div style={{ color: 'var(--critical)', fontSize: '12px', marginTop: '12px' }}>{error}</div>}

        <div style={s.actions}>
          <button style={s.cancelBtn} onClick={onClose}>Cancel</button>
          <button style={s.submitBtn} onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving…' : 'Create Asset'}
          </button>
        </div>
      </div>
    </div>
  )
}
