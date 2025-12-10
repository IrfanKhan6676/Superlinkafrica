import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server-utils'

// POST /api/products/bulk
// Create multiple products in one request. Requires auth.
export async function POST(req: Request) {
  const supabase = await createServerClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const items = Array.isArray(body?.items) ? body.items : []
  if (items.length === 0) return NextResponse.json({ error: 'No items provided' }, { status: 400 })
  if (items.length > 100) return NextResponse.json({ error: 'Too many items (max 100)' }, { status: 400 })

  const sanitized = [] as any[]
  for (const raw of items) {
    const title = String(raw.title || '').trim()
    const description = raw.description ? String(raw.description).trim() : ''
    const price = Number(raw.price)
    const image_url = raw.image_url ? String(raw.image_url).trim() : null

    if (!title || !Number.isFinite(price) || price < 0) {
      return NextResponse.json({ error: 'Invalid item in payload' }, { status: 400 })
    }
    sanitized.push({ user_id: user.id, title, description, price, image_url })
  }

  const { data, error } = await supabase.from('products').insert(sanitized).select('*')
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data }, { status: 201 })
}

// PATCH /api/products/bulk
// Update multiple products. Only owner can update own products.
export async function PATCH(req: Request) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const updates = Array.isArray(body?.updates) ? body.updates : []
  if (updates.length === 0) return NextResponse.json({ error: 'No updates provided' }, { status: 400 })
  if (updates.length > 100) return NextResponse.json({ error: 'Too many updates (max 100)' }, { status: 400 })

  const results: any[] = []
  for (const u of updates) {
    const id = String(u.id || '')
    if (!id) return NextResponse.json({ error: 'Missing id in updates' }, { status: 400 })

    const patch: Record<string, any> = {}
    if (typeof u.title === 'string') patch.title = u.title.trim()
    if (typeof u.description === 'string') patch.description = u.description.trim()
    if (u.price !== undefined) {
      const price = Number(u.price)
      if (!Number.isFinite(price) || price < 0) return NextResponse.json({ error: 'Invalid price in updates' }, { status: 400 })
      patch.price = price
    }
    if (typeof u.image_url === 'string') patch.image_url = u.image_url.trim()
    patch.updated_at = new Date().toISOString()

    // RLS will enforce ownership; we still verify quickly to produce 403s
    const { data: existing } = await supabase.from('products').select('user_id').eq('id', id).single()
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (existing.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { data, error } = await supabase.from('products').update(patch).eq('id', id).select('*').single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    results.push(data)
  }

  return NextResponse.json({ data: results })
}

// DELETE /api/products/bulk
// Delete multiple products by ids. Only owner can delete.
export async function DELETE(req: Request) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const ids = Array.isArray(body?.ids) ? body.ids.map((x: any) => String(x)) : []
  if (ids.length === 0) return NextResponse.json({ error: 'No ids provided' }, { status: 400 })

  // Optional explicit ownership check for better errors
  const { data: ownerRows, error: ownerErr } = await supabase
    .from('products')
    .select('id, user_id')
    .in('id', ids)

  if (ownerErr) return NextResponse.json({ error: ownerErr.message }, { status: 400 })
  const notOwned = (ownerRows || []).filter((r) => r.user_id !== user.id).map((r) => r.id)
  if (notOwned.length) return NextResponse.json({ error: 'Forbidden for some ids', notOwned }, { status: 403 })

  const { error } = await supabase.from('products').delete().in('id', ids)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ success: true, deleted: ids.length })
}
