"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDelete = async () => {
    if (!confirm('Delete this product?')) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'Delete failed')
      router.push('/products')
      router.refresh()
    } catch (e: any) {
      setError(e.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <button onClick={onDelete} disabled={loading} className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50">
        {loading ? 'Deleting...' : 'Delete'}
      </button>
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  )
}
