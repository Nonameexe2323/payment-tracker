import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')?.trim()
    const userId = searchParams.get('userId')?.trim()

    if (!email && !userId) {
      return NextResponse.json({ error: 'Missing email or userId' }, { status: 400 })
    }

    // Try finding by userId or email
    let query = supabaseAdmin.from('admin_profiles').select('*')
    if (userId) {
      query = query.eq('id', userId)
    } else if (email) {
      query = query.eq('email', email)
    }

    const { data: profiles, error } = await query

    if (error && error.code !== 'PGRST116') {
      console.error('Error querying admin_profiles:', error)
    }

    if (profiles && profiles.length > 0) {
      return NextResponse.json({ success: true, profile: profiles[0] })
    }

    // If profile not found, check total profiles count
    const { count } = await supabaseAdmin
      .from('admin_profiles')
      .select('*', { count: 'exact', head: true })

    // First account created or owner email gets 'owner' role, others get 'staff'
    const role = (count === 0 || count === null) ? 'owner' : 'staff'
    const name = email ? email.split('@')[0] : 'Admin'

    const newProfile = {
      id: userId || undefined,
      email: email || 'admin@jiksawshop.com',
      name,
      role,
    }

    // Attempt upserting profile if table exists
    try {
      const { data: inserted } = await supabaseAdmin
        .from('admin_profiles')
        .insert([newProfile])
        .select()

      if (inserted && inserted.length > 0) {
        return NextResponse.json({ success: true, profile: inserted[0] })
      }
    } catch {
      // Ignore if table insert fails
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: userId || 'fallback-id',
        email: email || 'admin@jiksawshop.com',
        name,
        role,
        created_at: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Failed in admin-profile GET:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
