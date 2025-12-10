import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server-utils'

export const runtime = 'edge'

export async function POST(req: Request) {
  const contentType = req.headers.get('content-type') || ''
  if (!contentType.includes('multipart/form-data')) {
    return NextResponse.json({ error: 'Content-Type must be multipart/form-data' }, { status: 400 })
  }

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await req.formData()
  const file = form.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'Missing file' }, { status: 400 })

  const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`

  const arrayBuffer = await file.arrayBuffer()
  const { data, error } = await supabase.storage
    .from('products')
    .upload(path, arrayBuffer, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const { data: pub } = supabase.storage.from('products').getPublicUrl(data.path)

  return NextResponse.json({ path: data.path, publicUrl: pub.publicUrl }, { status: 201 })
}
