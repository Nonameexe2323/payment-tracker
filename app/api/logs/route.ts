import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number(searchParams.get('limit')) || 100
    const search = searchParams.get('search')?.trim() || ''

    let query = supabaseAdmin
      .from('admin_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (search) {
      query = query.or(`admin_name.ilike.%${search}%,details.ilike.%${search}%,action_type.ilike.%${search}%`)
    }

    const { data, error } = await query

    if (error) {
      // Return empty array gracefully if table is not populated yet
      return NextResponse.json({ success: true, logs: [] })
    }

    const logs = (data || []).map((log) => {
      const nameLower = (log.admin_name || '').toLowerCase()
      if (
        nameLower.includes('หัวเพจ') ||
        nameLower.includes('owner') ||
        nameLower.includes('เจ้าของ') ||
        nameLower.includes('head') ||
        nameLower.includes('ปอนด์')
      ) {
        // Fix database entry if it was saved as staff
        if (log.admin_role !== 'owner') {
          supabaseAdmin
            .from('admin_logs')
            .update({ admin_role: 'owner' })
            .eq('id', log.id)
            .then(() => {})
        }
        return { ...log, admin_role: 'owner' }
      }
      return log
    })

    return NextResponse.json({ success: true, logs })
  } catch (error) {
    console.error('Failed to fetch admin logs:', error)
    return NextResponse.json({ success: true, logs: [] })
  }
}
