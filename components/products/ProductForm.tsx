"use client"

import { useState } from 'react'

export type ProductPayload = {
  title: string
  description?: string
  price: number
  image_url?: string | null
}

export default function ProductForm({
  initial,
  onSuccess,
  submitLabel = 'Save',
  mode = 'create',
  id,
}: {
  initial?: Partial<ProductPayload>
  onSuccess?: (product: any) => void
  submitLabel?: string
  mode?: 'create' | 'edit'
  id?: string
}) {
  const [title, setTitle] = useState(initial?.title || '')
  const [description, setDescription] = useState(initial?.description || '')
  const [price, setPrice] = useState(initial?.price?.toString() || '')
  const [imageUrl, setImageUrl] = useState(initial?.image_url || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    const form = e.currentTarget
    const action = form.getAttribute('data-action') || 'create'
    const id = form.getAttribute('data-id') || ''

    try {
      const payload: ProductPayload = {
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        image_url: imageUrl ? imageUrl.trim() : null,
      }

      const endpoint = action === 'edit' ? `/api/products/${id}` : '/api/products'
      const method = action === 'edit' ? 'PATCH' : 'POST'
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Request failed')
      setSuccess('Saved successfully')
      onSuccess?.(json.data)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-action={mode} data-id={id || ''}>
      <div>
        <label className="block text-sm font-medium">Title</label>
        <input className="mt-1 w-full border rounded px-3 py-2" value={title} onChange={e=>setTitle(e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea className="mt-1 w-full border rounded px-3 py-2" rows={4} value={description} onChange={e=>setDescription(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium">Price</label>
        <input type="number" min="0" step="0.01" className="mt-1 w-full border rounded px-3 py-2" value={price} onChange={e=>setPrice(e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm font-medium">Image URL (optional)</label>
        <input className="mt-1 w-full border rounded px-3 py-2" value={imageUrl as string} onChange={e=>setImageUrl(e.target.value)} />
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {success && <p className="text-green-600 text-sm">{success}</p>}
      <button disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">
        {loading ? 'Saving...' : submitLabel}
      </button>
    </form>
  )
}
