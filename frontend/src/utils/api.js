const BASE = import.meta.env.VITE_API_URL || '/api'

async function req(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (res.status === 204) return null
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'API error')
  return data
}

export const api = {
  // Assets
  getAssets: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
    ).toString()
    return req('GET', `/assets/${qs ? '?' + qs : ''}`)
  },
  getAsset: (id) => req('GET', `/assets/${id}`),
  createAsset: (data) => req('POST', '/assets/', data),
  updateAsset: (id, data) => req('PUT', `/assets/${id}`, data),
  deleteAsset: (id) => req('DELETE', `/assets/${id}`),

  // Inspections
  getInspections: (assetId) => req('GET', `/assets/${assetId}/inspections/`),
  createInspection: (assetId, data) => req('POST', `/assets/${assetId}/inspections/`, data),

  // Dashboard
  getStats: () => req('GET', '/dashboard/stats'),
}
