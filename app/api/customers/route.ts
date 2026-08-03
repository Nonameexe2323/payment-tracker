import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { recordAdminLog } from '@/lib/logUtils'

// POST — Create customer
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { code, name, total_amount, plan_type, due_date, weekly_day, max_unpaid_days, admin_name, admin_role, admin_note, image_url } = body

    if (!code || !name || !total_amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const payload: Record<string, unknown> = {
      code,
      name: name.trim(),
      total_amount: Number(total_amount),
      plan_type: plan_type || 'daily',
      due_date: due_date || null,
      weekly_day: plan_type === 'weekly' ? weekly_day : null,
      max_unpaid_days: Number(max_unpaid_days) || 3,
      admin_name: admin_name?.trim() || null,
      admin_note: admin_note?.trim() || null,
      image_url: image_url?.trim() || null,
    }

    let { data, error } = await supabaseAdmin
      .from('customers')
      .insert(payload)
      .select()

    // Fallback retry if image_url column does not exist in customers table yet
    if (error && (error.message.includes('image_url') || error.code === 'PGRST204')) {
      delete payload.image_url
      const retry = await supabaseAdmin
        .from('customers')
        .insert(payload)
        .select()
      data = retry.data
      error = retry.error
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Record activity log
    await recordAdminLog({
      adminName: admin_name,
      adminRole: admin_role,
      actionType: 'CREATE_CUSTOMER',
      details: `สร้างลูกค้าผ่อนใหม่: "${name.trim()}" (รหัส: ${code}) ยอดผ่อนรวม ${Number(total_amount).toLocaleString('th-TH')} ฿`,
    })

    return NextResponse.json({ success: true, data: data?.[0] })
  } catch (error) {
    console.error('Failed to create customer:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// PUT — Update customer
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, name, total_amount, status, plan_type, due_date, weekly_day, max_unpaid_days, admin_name, admin_role, admin_note, image_url } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing customer id' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (total_amount !== undefined) updateData.total_amount = total_amount
    if (status !== undefined) updateData.status = status
    if (plan_type !== undefined) updateData.plan_type = plan_type
    if (due_date !== undefined) updateData.due_date = due_date
    if (weekly_day !== undefined) updateData.weekly_day = weekly_day
    if (max_unpaid_days !== undefined) updateData.max_unpaid_days = max_unpaid_days
    if (admin_name !== undefined) updateData.admin_name = admin_name
    if (admin_note !== undefined) updateData.admin_note = admin_note
    if (image_url !== undefined) updateData.image_url = image_url?.trim() || null

    let { data, error } = await supabaseAdmin
      .from('customers')
      .update(updateData)
      .eq('id', id)
      .select()

    // Fallback retry if image_url column does not exist in customers table yet
    if (error && (error.message.includes('image_url') || error.code === 'PGRST204')) {
      delete updateData.image_url
      const retry = await supabaseAdmin
        .from('customers')
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
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    const updatedCustomer = data[0]
    await recordAdminLog({
      adminName: admin_name || updatedCustomer.admin_name,
      adminRole: admin_role,
      actionType: 'UPDATE_CUSTOMER',
      details: `แก้ไขข้อมูลลูกค้าผ่อน: "${updatedCustomer.name}" (รหัส: ${updatedCustomer.code})`,
    })

    return NextResponse.json({ success: true, data: updatedCustomer })
  } catch (error) {
    console.error('Failed to update customer:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// DELETE — Delete customer and all their payments
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const adminName = searchParams.get('admin_name')
    const adminRole = searchParams.get('admin_role')

    if (!id) {
      return NextResponse.json({ error: 'Missing customer id' }, { status: 400 })
    }

    // Check customer info before deleting for log
    const { data: custInfo } = await supabaseAdmin
      .from('customers')
      .select('name, code')
      .eq('id', id)
      .single()

    // Delete payments first
    const { error: payError } = await supabaseAdmin
      .from('payments')
      .delete()
      .eq('customer_id', id)

    if (payError) {
      return NextResponse.json({ error: 'Failed to delete payments: ' + payError.message }, { status: 500 })
    }

    // Delete customer
    const { error: custError } = await supabaseAdmin
      .from('customers')
      .delete()
      .eq('id', id)

    if (custError) {
      return NextResponse.json({ error: 'Failed to delete customer: ' + custError.message }, { status: 500 })
    }

    await recordAdminLog({
      adminName: adminName || 'Owner',
      adminRole: adminRole || 'owner',
      actionType: 'DELETE_CUSTOMER',
      details: `ลบลูกค้าผ่อนชำระถาวร: "${custInfo?.name || id}" (รหัส: ${custInfo?.code || '-'})`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete customer:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
