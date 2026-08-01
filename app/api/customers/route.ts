import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// PUT — Update customer
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, name, total_amount, status, admin_name } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing customer id' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (total_amount !== undefined) updateData.total_amount = total_amount
    if (status !== undefined) updateData.status = status
    if (admin_name !== undefined) updateData.admin_name = admin_name

    const { data, error } = await supabaseAdmin
      .from('customers')
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: data[0] })
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

    if (!id) {
      return NextResponse.json({ error: 'Missing customer id' }, { status: 400 })
    }

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

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete customer:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
