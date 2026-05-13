export const CONDITIONS = {
  good:     { label: 'Good',     color: 'var(--good)',     bg: 'var(--good-dim)' },
  fair:     { label: 'Fair',     color: 'var(--fair)',     bg: 'var(--fair-dim)' },
  poor:     { label: 'Poor',     color: 'var(--poor)',     bg: 'var(--poor-dim)' },
  critical: { label: 'Critical', color: 'var(--critical)', bg: 'var(--critical-dim)' },
}

export const STATUSES = {
  active:            { label: 'Active',          color: 'var(--active)' },
  inactive:          { label: 'Inactive',        color: 'var(--inactive)' },
  under_maintenance: { label: 'Maintenance',     color: 'var(--maintenance)' },
  decommissioned:    { label: 'Decommissioned',  color: 'var(--decommissioned)' },
}

export const ASSET_TYPES = [
  'bridge', 'road', 'building', 'pipeline', 'electrical', 'water', 'other'
]

export const TYPE_ICONS = {
  bridge:     '🌉',
  road:       '🛣️',
  building:   '🏢',
  pipeline:   '🔩',
  electrical: '⚡',
  water:      '💧',
  other:      '🔧',
}
