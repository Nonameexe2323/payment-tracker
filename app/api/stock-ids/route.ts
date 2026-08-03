import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { recordAdminLog } from '@/lib/logUtils'

// GET — List stock IDs (optionally filter by status or game)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const game = searchParams.get('game')

    let query = supabaseAdmin
      .from('stock_ids')
      .select('*')
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }
    if (game) {
      query = query.eq('game_name', game)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Failed to fetch stock_ids:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST — Create new stock ID
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { code, title, game_name, price_cash, price_installment, details, image_url, status, admin_name, admin_role } = body

    if (!code || !game_name || price_cash === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const itemTitle = title?.trim() || code.trim()

    const payload: Record<string, unknown> = {
      code: code.trim(),
      title: itemTitle,
      game_name: game_name.trim(),
      price_cash: Number(price_cash),
      price_installment: price_installment !== undefined && price_installment !== null && price_installment !== '' ? Number(price_installment) : null,
      details: details?.trim() || null,
      image_url: image_url?.trim() || null,
      status: status || 'available',
    }

    if (admin_name?.trim()) {
      payload.admin_name = admin_name.trim()
    }

    let { data, error } = await supabaseAdmin
      .from('stock_ids')
      .insert(payload)
      .select()

    // Fallback: If admin_name column does not exist in stock_ids table in Supabase, retry without admin_name
    if (error && (error.message.includes('admin_name') || error.code === 'PGRST204')) {
      delete payload.admin_name
      const retry = await supabaseAdmin
        .from('stock_ids')
        .insert(payload)
        .select()
      data = retry.data
      error = retry.error
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await recordAdminLog({
      adminName: admin_name,
      adminRole: admin_role,
      actionType: 'CREATE_STOCK_ID',
      details: `ลงประกาศคลังไอดีใหม่: "${game_name}" (รหัส: ${code.trim()}) ราคาเงินสด ${Number(price_cash).toLocaleString('th-TH')} ฿`,
    })

    return NextResponse.json({ success: true, data: data?.[0] })
  } catch (error) {
    console.error('Failed to create stock_id:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// PUT — Update stock ID (details, price, status, etc.)
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, code, title, game_name, price_cash, price_installment, details, image_url, status, admin_name, admin_role } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (code !== undefined) updateData.code = code.trim()
    if (title !== undefined) updateData.title = title.trim()
    if (game_name !== undefined) updateData.game_name = game_name.trim()
    if (price_cash !== undefined) updateData.price_cash = Number(price_cash)
    if (price_installment !== undefined) {
      updateData.price_installment = price_installment !== null && price_installment !== '' ? Number(price_installment) : null
    }
    if (details !== undefined) updateData.details = details?.trim() || null
    if (image_url !== undefined) updateData.image_url = image_url?.trim() || null
    if (status !== undefined) updateData.status = status
    if (admin_name !== undefined && admin_name?.trim()) updateData.admin_name = admin_name.trim()

    let { data, error } = await supabaseAdmin
      .from('stock_ids')
      .update(updateData)
      .eq('id', id)
      .select()

    // Fallback: If admin_name column does not exist in stock_ids table in Supabase, retry without admin_name
    if (error && (error.message.includes('admin_name') || error.code === 'PGRST204')) {
      delete updateData.admin_name
      const retry = await supabaseAdmin
        .from('stock_ids')
        .update(updateData)
        .eq('id', id)
        .select()
      data = retry.data
      error = retry.error
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Stock item not found' }, { status: 404 })
    }

    const updatedItem = data[0]
    await recordAdminLog({
      adminName: admin_name,
      adminRole: admin_role,
      actionType: 'UPDATE_STOCK_ID',
      details: `แก้ไขข้อมูลคลังไอดี: "${updatedItem.game_name}" (รหัส: ${updatedItem.code})`,
    })

    return NextResponse.json({ success: true, data: updatedItem })
  } catch (error) {
    console.error('Failed to update stock_id:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// DELETE — Delete stock ID item
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const adminName = searchParams.get('admin_name')
    const adminRole = searchParams.get('admin_role')

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }

    const { data: itemData } = await supabaseAdmin
      .from('stock_ids')
      .select('code, game_name')
      .eq('id', id)
      .single()

    const { error } = await supabaseAdmin
      .from('stock_ids')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await recordAdminLog({
      adminName: adminName || 'Owner',
      adminRole: adminRole || 'owner',
      actionType: 'DELETE_STOCK_ID',
      details: `ลบประกาศไอดีคลังถาวร: "${itemData?.game_name || id}" (รหัส: ${itemData?.code || '-'})`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete stock_id:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
