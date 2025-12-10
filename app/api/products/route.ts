import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server-utils'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)))
  const sort = url.searchParams.get('sort') || 'created_at.desc'
  const q = url.searchParams.get('q')?.trim()
  const priceMin = url.searchParams.get('priceMin')
  const priceMax = url.searchParams.get('priceMax')

  const from = (page - 1) * limit
  const to = from + limit - 1

  const supabase = await createServerClient()

  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })

  if (q) {
    query = query.ilike('title', `%${q}%`)
  }
  if (priceMin) {
    query = query.gte('price', Number(priceMin))
  }
  if (priceMax) {
    query = query.lte('price', Number(priceMax))
  }

  const [col, dir] = sort.split('.')
  if (col && dir) {
    query = query.order(col as any, { ascending: dir.toLowerCase() !== 'desc' })
  }

  const { data, error, count } = await query.range(from, to)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ data, page, limit, total: count ?? 0 })
}

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

  const title = String(body.title || '').trim()
  const description = String(body.description || '').trim()
  const priceNum = Number(body.price)
  const image_url = body.image_url ? String(body.image_url).trim() : null

  if (!title || !Number.isFinite(priceNum) || priceNum < 0) {
    return NextResponse.json({ error: 'Invalid product payload' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('products')
    .insert({
      user_id: user.id,
      title,
      description,
      price: priceNum,
      image_url,
    })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ data }, { status: 201 })
}
